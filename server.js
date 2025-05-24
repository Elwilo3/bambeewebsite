const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Data file path
const DATA_FILE = path.join(__dirname, 'bambee-data.json');

// Default data structure
const defaultData = {
    currentText: "Welcome to Bambee Website! Press 'n' to edit this text.",
    globalStyle: { styleIndex: 0, customStyles: {} },
    customHtmlContent: null,
    customTextStyles: {}
};

// Current data (loaded from file)
let appData = { ...defaultData };

// Load data from file on startup
async function loadData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        appData = { ...defaultData, ...JSON.parse(data) };
        console.log('Data loaded from file');
    } catch (error) {
        console.log('No existing data file, using defaults');
        await saveData(); // Create initial file
    }
}

// Save data to file
async function saveData() {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(appData, null, 2));
        console.log('Data saved to file');
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Password for editing (change this to whatever you want)
const EDIT_PASSWORD = process.env.EDIT_PASSWORD || "bambee123";

// Serve static files from public directory
app.use(express.static('public'));

// Route to serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Send current data to newly connected user
  socket.emit('textUpdate', appData.currentText);
  socket.emit('globalStyleUpdate', appData.globalStyle);
  socket.emit('customHtmlUpdate', appData.customHtmlContent);
  socket.emit('customTextStylesUpdate', appData.customTextStyles || {});
  
  // Handle password verification for editing
  socket.on('verifyPassword', (password, callback) => {
    const isValid = password === EDIT_PASSWORD;
    callback(isValid);
    console.log('Password verification:', isValid ? 'SUCCESS' : 'FAILED');
  });

  // Handle text updates from clients (with password protection)
  socket.on('updateText', async (data) => {
    const { newText, password } = data;
    
    // Verify password before updating
    if (password === EDIT_PASSWORD) {
      appData.currentText = newText;
      await saveData(); // Save to file
      // Broadcast the new text to all connected clients
      io.emit('textUpdate', appData.currentText);
      console.log('Text updated:', appData.currentText);
    } else {
      console.log('Text update rejected: Invalid password');
    }
  });
  
  // Handle global style updates
  socket.on('updateGlobalStyle', async (data) => {
    const { styleData, password } = data;
    
    if (password === EDIT_PASSWORD) {
      appData.globalStyle = styleData;
      await saveData(); // Save to file
      // Broadcast to all connected clients
      io.emit('globalStyleUpdate', appData.globalStyle);
      console.log('Global style updated');
    } else {
      console.log('Global style update rejected: Invalid password');
    }
  });

  // Handle custom HTML updates
  socket.on('updateCustomHtml', async (data) => {
    const { htmlData, password } = data;
    
    if (password === EDIT_PASSWORD) {
      appData.customHtmlContent = htmlData;
      await saveData(); // Save to file
      // Broadcast to all connected clients
      io.emit('customHtmlUpdate', appData.customHtmlContent);
      console.log('Custom HTML updated');
    } else {
      console.log('Custom HTML update rejected: Invalid password');
    }
  });

  // Handle custom text styles updates
  socket.on('updateCustomTextStyles', async (data) => {
    const { styles, password } = data;
    
    if (password === EDIT_PASSWORD) {
      appData.customTextStyles = styles;
      await saveData(); // Save to file
      // Broadcast to all connected clients
      io.emit('customTextStylesUpdate', appData.customTextStyles);
      console.log('Custom text styles updated');
    } else {
      console.log('Custom text styles update rejected: Invalid password');
    }
  });

  // Handle reset to normal - include customTextStyles
  socket.on('resetToNormal', async (data) => {
    const { password } = data;
    
    if (password === EDIT_PASSWORD) {
      // Reset everything to defaults
      appData.globalStyle = { styleIndex: 0, customStyles: {} };
      appData.customHtmlContent = null;
      appData.customTextStyles = {};
      await saveData(); // Save to file
      
      // Broadcast reset to all clients
      io.emit('globalStyleUpdate', appData.globalStyle);
      io.emit('customHtmlUpdate', null);
      io.emit('customTextStylesUpdate', {});
      io.emit('textUpdate', appData.currentText);
      
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

// Load data before starting server
loadData().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Main page: http://localhost:${PORT}/`);
  });
});

// Graceful shutdown - save data when server stops
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, saving data...');
  await saveData();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, saving data...');
  await saveData();
  process.exit(0);
}); 