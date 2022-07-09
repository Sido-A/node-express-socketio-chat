const socket = io();
const form = document.querySelector("#chat-form");
const messages = document.querySelector(".chat-messages");
const roomName = document.querySelector("#room-name");
const userList = document.querySelector("#users");

const params = new URL(document.location).searchParams;
const username = params.get("username");
const room = params.get("room");

// Join chat
socket.emit("join", { username, room });

socket.on("room", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  //   Scroll will be at the bottom after apeend
  messages.scrollTop = messages.scrollHeight;
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = e.target.elements.message;
  if (message.value !== "") {
    socket.emit("chat", message.value);
    message.value = "";
    message.focus();
  }
});

const outputMessage = (message) => {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>`;

  messages.appendChild(div);
};

const outputRoomName = (room) => (roomName.innerText = room);

const outputUsers = (users) => {
  userList.innerHTML = `${users
    .map((user) => `<li>${user.username}</li>`)
    .join("")}`;
};
