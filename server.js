const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store the current text (in production, you'd use a database)let currentText = "Welcome to Bambee Website! Press 'n' to edit this text.";// Password for editing (change this to whatever you want)const EDIT_PASSWORD = process.env.EDIT_PASSWORD || "bambee123";

// Serve static files from public directory
app.use(express.static('public'));

// Route to serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Send current text to newly connected user
  socket.emit('textUpdate', currentText);
  
    // Handle password verification for editing  socket.on('verifyPassword', (password, callback) => {    const isValid = password === EDIT_PASSWORD;    callback(isValid);    console.log('Password verification:', isValid ? 'SUCCESS' : 'FAILED');  });  // Handle text updates from clients (with password protection)  socket.on('updateText', (data) => {    const { newText, password } = data;        // Verify password before updating    if (password === EDIT_PASSWORD) {      currentText = newText;      // Broadcast the new text to all connected clients      io.emit('textUpdate', currentText);      console.log('Text updated:', currentText);    } else {      console.log('Text update rejected: Invalid password');    }  });
  
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;server.listen(PORT, '0.0.0.0', () => {  console.log(`Server running on port ${PORT}`);}); 