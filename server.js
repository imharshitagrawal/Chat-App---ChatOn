const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {userJoin, userLeave, getCurrentUser, getRoomUsers} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = "ChatBot";
//Set static folder
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000 || process.env.PORT;

//Run when client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {

    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    //Welcome message to only the user that connects
    socket.emit("message", formatMessage(botName, "Welcome to ChatOn"));

    //Message to all other clients except the user that is connecting
    socket.broadcast.to(user.room).emit("message",formatMessage(botName, `${user.username} has joined the chat`));
    
    //Send users and room data
    io.to(user.room).emit('roomUsers', {
      room: user,room,
      users: getRoomUsers(user.room)
    });
  });
  
  //Listen for chat message
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //When a user disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if(user){
    io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat`));
    
    //Send users and room data
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  }

  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
