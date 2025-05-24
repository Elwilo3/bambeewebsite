const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store the current text (in production, you'd use a database)
let currentText = "Welcome to Bambee Website! Press 'n' to edit this text.";

// Add after the currentText variable
let globalStyle = { styleIndex: 0, customStyles: {} };
let customHtmlContent = null;

// Store the dead counter data
let deadCounter = { count: 0, label: "Deaths" };
let deadCounterStyle = { styleIndex: 0, customStyles: {} };

// Password for editing (change this to whatever you want)
const EDIT_PASSWORD = process.env.EDIT_PASSWORD || "bambee123";

// Serve static files from public directory
app.use(express.static('public'));

// Route to serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to serve the deadcounter page
app.get('/deadcounter', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'deadcounter.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Send current data to newly connected user
  socket.emit('textUpdate', currentText);
  socket.emit('globalStyleUpdate', globalStyle);
  socket.emit('customHtmlUpdate', customHtmlContent);
  socket.emit('deadCounterUpdate', deadCounter);
  socket.emit('deadCounterStyleUpdate', deadCounterStyle);
  
  // Handle password verification for editing
  socket.on('verifyPassword', (password, callback) => {
    const isValid = password === EDIT_PASSWORD;
    callback(isValid);
    console.log('Password verification:', isValid ? 'SUCCESS' : 'FAILED');
  });

  // Handle text updates from clients (with password protection)
  socket.on('updateText', (data) => {
    const { newText, password } = data;
    
    // Verify password before updating
    if (password === EDIT_PASSWORD) {
      currentText = newText;
      // Broadcast the new text to all connected clients
      io.emit('textUpdate', currentText);
      console.log('Text updated:', currentText);
    } else {
      console.log('Text update rejected: Invalid password');
    }
  });
  
  // Handle global style updates
  socket.on('updateGlobalStyle', (data) => {
    const { styleData, password } = data;
    
    if (password === EDIT_PASSWORD) {
      globalStyle = styleData;
      // Broadcast to all connected clients
      io.emit('globalStyleUpdate', globalStyle);
      console.log('Global style updated');
    } else {
      console.log('Global style update rejected: Invalid password');
    }
  });

  // Handle dead counter updates
  socket.on('updateDeadCounter', (data) => {
    const { counterData, password } = data;
    
    if (password === EDIT_PASSWORD) {
      deadCounter = counterData;
      // Broadcast to all connected clients
      io.emit('deadCounterUpdate', deadCounter);
      console.log('Dead counter updated:', deadCounter);
    } else {
      console.log('Dead counter update rejected: Invalid password');
    }
  });

  // Handle dead counter style updates
  socket.on('updateDeadCounterStyle', (data) => {
    const { styleData, password } = data;
    
    if (password === EDIT_PASSWORD) {
      deadCounterStyle = styleData;
      // Broadcast to all connected clients
      io.emit('deadCounterStyleUpdate', deadCounterStyle);
      console.log('Dead counter style updated');
    } else {
      console.log('Dead counter style update rejected: Invalid password');
    }
  });

  // Handle custom HTML updates
  socket.on('updateCustomHtml', (data) => {
    const { htmlData, password } = data;
    
    if (password === EDIT_PASSWORD) {
      customHtmlContent = htmlData;
      // Broadcast to all connected clients
      io.emit('customHtmlUpdate', customHtmlContent);
      console.log('Custom HTML updated');
    } else {
      console.log('Custom HTML update rejected: Invalid password');
    }
  });

  // Handle reset to normal
  socket.on('resetToNormal', (data) => {
    const { password } = data;
    
    if (password === EDIT_PASSWORD) {
      // Reset everything to defaults
      globalStyle = { styleIndex: 0, customStyles: {} };
      customHtmlContent = null;
      
      // Broadcast reset to all clients
      io.emit('globalStyleUpdate', globalStyle);
      io.emit('customHtmlUpdate', null);
      io.emit('textUpdate', currentText);
      
      console.log('Reset to normal - all customizations cleared');
    } else {
      console.log('Reset rejected: Invalid password');
    }
  });
  
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Main page: http://localhost:${PORT}/`);
  console.log(`Dead counter: http://localhost:${PORT}/deadcounter`);
}); 