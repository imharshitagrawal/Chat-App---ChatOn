const chatMessages = document.querySelector('.chat-messages');
const chatForm = document.getElementById('chat-form');
const roomName = document.getElementById('room-name');
const usersList = document.getElementById('users');

const {username, room} = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});


const socket = io();

//Sending username and room data to server
socket.emit('joinRoom', {username, room});

//Get room and users
socket.on('roomUsers', ({room, users}) => {
  outputRoomName(room)
  outputUsers(users)
});

//Catching message from server
socket.on('message', message => {
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Sending message submitted by user to the server
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  socket.emit('chatMessage', msg);
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

function outputMessage(message){
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.txt}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room){
  roomName.innerText = room;
}

function outputUsers(users){
  usersList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}

