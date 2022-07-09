const path = require("path");
const http = require("http");
const express = require("express");
const socketIo = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeavesRoom,
  getUsersRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const ws = socketIo(server);

const bot = "Char bot";
// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Websocket
ws.on("connection", (socket) => {
  socket.on("join", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    // Welcome current user
    socket.emit("message", formatMessage(bot, "Welcome to chat!"));

    // Emit to every user except logged in one
    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage(bot, `${user.username} joined the chat`));
    //Send users and rooms info
    ws.to(user.room).emit("room", {
      room: user.room,
      users: getUsersRoom(user.room),
    });
  });

  socket.on("chat", (chat) => {
    const user = getCurrentUser(socket.id);
    ws.emit("message", formatMessage(user.username, chat));
  });

  // All connected users
  socket.on("disconnect", () => {
    const user = userLeavesRoom(socket.id);
    if (user) {
      ws.to(user.room).emit(
        "message",
        formatMessage(bot, `${user.username} has left the chat`)
      );

      ws.to(user.room).emit("room", {
        room: user.room,
        users: getUsersRoom(user.room),
      });
    }
  });
});

//
const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log("App listening " + PORT));
