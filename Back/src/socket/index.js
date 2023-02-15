let onlineUsers = []

export const newConnectionHandler = newClient => {
  console.log("NEW CONNECTION:", newClient.id)

  // 1. Emit a "welcome" event to the connected client
  newClient.emit("welcome", { message: `Hello ${newClient.id}` })

  // 2. Listen to an event emitted by the FE called "setUsername", this event is going to contain the username in the payload
  newClient.on("setUsername", payload => {
    console.log(payload)
    // 2.1 Whenever we receive the username, we keep track of that together with the socket.id
    onlineUsers.push({ username: payload.username, socketId: newClient.id })

    // 2.2 Then we have to send the list of online users to the current user that just logged in
    newClient.emit("loggedIn", onlineUsers)

    // 2.3 We have also to inform everybody (but not the sender) of the new user which just joined
    newClient.broadcast.emit("updateOnlineUsersList", onlineUsers)
  })

  // 3. Listen to "sendMessage" event, this is received when an user sends a new message
  newClient.on("sendMessage", message => {
    console.log("NEW MESSAGE:", message)
    // 3.1 Whenever we receive that new message we have to propagate that message to everybody but not sender
    newClient.broadcast.emit("newMessage", message)
  })

  // 4. Listen to an event called "disconnect", this is NOT a custom event!! This event happens when an user closes browser/tab
  newClient.on("disconnect", () => {
    // 4.1 Server shall update the list of onlineUsers by removing the one that has disconnected
    onlineUsers = onlineUsers.filter(user => user.socketId !== newClient.id)
    // 4.2 Let's communicate the updated list all the remaining clients
    newClient.broadcast.emit("updateOnlineUsersList", onlineUsers)
  })

// 5. Listen to an event called "typing", this event is received when an user starts/stops typing
newClient.on("typing", ({ isTyping }) => {
  console.log("TYPING:", newClient.id, isTyping)

  // 5.1 Find the corresponding user in onlineUsers
  const user = onlineUsers.find(user => user.socketId === newClient.id)
  if (user) {
    // 5.2 Update the isTyping property of the corresponding user
    user.isTyping = isTyping

    // 5.3 Broadcast the updated onlineUsers list to everyone except the current user
    newClient.broadcast.emit("updateOnlineUsersList", onlineUsers)

    // 5.4 Broadcast a message to inform other users of the typing status of this user
    newClient.broadcast.emit("typingStatus", {userId: user.socketId, isTyping})
  }
})

}
