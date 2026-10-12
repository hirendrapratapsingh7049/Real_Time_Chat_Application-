const socket = io();

const statusEl = document.getElementById("connection-status");
const nameInput = document.getElementById("name-input");
const joinButton = document.getElementById("join-button");
const namePanel = document.getElementById("name-panel");
const messagesEl = document.getElementById("messages");
const welcomeEl = document.getElementById("welcome");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");

let displayName = "";
let hasJoined = false;

socket.on("connect", () => {
  statusEl.textContent = "Connected — ready to chat";
});
socket.on("disconnect", () => {
  statusEl.textContent = "Disconnected — reconnecting…";
});

joinButton.addEventListener("click", joinChat);
nameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") joinChat();
});

function joinChat() {
  if (hasJoined) return;
  const name = nameInput.value.trim().slice(0, 24);
  if (!name) {
    nameInput.focus();
    nameInput.placeholder = "Please enter your name";
    return;
  }

  displayName = name;
  hasJoined = true;
  socket.emit("chat:join", displayName);
  nameInput.value = displayName;
  nameInput.disabled = true;
  joinButton.disabled = true;
  joinButton.textContent = "Joined";
  messageInput.disabled = false;
  sendButton.disabled = false;
  messageInput.focus();
}

socket.on("chat:history", (messages) => {
  messages.forEach((message) => renderMessage(message));
});

socket.on("chat:message", (message) => renderMessage(message));

socket.on("chat:system", (text) => {
  removeWelcome();
  const item = document.createElement("div");
  item.className = "system-message";
  item.textContent = text;
  messagesEl.appendChild(item);
  scrollToBottom();
});

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!hasJoined) {
    nameInput.focus();
    return;
  }
  const text = messageInput.value.trim();
  if (!text) return;
  socket.emit("chat:message", text);
  messageInput.value = "";
  messageInput.focus();
});

function renderMessage(message) {
  removeWelcome();

  const wrapper = document.createElement("article");
  wrapper.className = `message${message.name === displayName ? " mine" : ""}`;

  const meta = document.createElement("div");
  meta.className = "message-meta";

  const name = document.createElement("span");
  name.className = "message-name";
  name.textContent = message.name;

  const time = document.createElement("time");
  time.dateTime = message.time;
  const date = new Date(message.time);
  time.textContent = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  // textContent prevents message text from being interpreted as HTML.
  bubble.textContent = message.text;

  meta.append(name, time);
  wrapper.append(meta, bubble);
  messagesEl.appendChild(wrapper);
  scrollToBottom();
}

function removeWelcome() {
  if (welcomeEl && welcomeEl.isConnected) welcomeEl.remove();
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
