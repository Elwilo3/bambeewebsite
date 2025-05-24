# Bambee Website

A simple real-time collaborative text editing website with a greenscreen green background.

## Features- **Green Background**: Bright greenscreen green (#00ff00) background- **White Roboto Font**: Clean, modern typography- **Real-time Collaboration**: Text updates are shared instantly with all connected users- **Password Protection**: Only people with the password can edit text (viewers can watch freely)- **Simple Controls**:   - Press `N` to start editing (requires password)  - Press `Enter` to save and share your changes  - Press `Escape` to cancel editing  - **Shift+Enter** for new lines while editing

## How to Run

1. **Install Node.js** (if not already installed)
   - Download from [nodejs.org](https://nodejs.org/)

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Open in Browser**
   - Go to `http://localhost:3000`
   - Open multiple tabs/windows to test real-time updates

## How to Use

1. When you first visit the website, you'll see the default welcome text
2. Press the `N` key on your keyboard to start editing
3. Type your new text in the input field that appears
4. Press `Enter` to save your changes
5. Your text will instantly appear for all other users viewing the website!

## Development

To run in development mode with auto-restart:
```bash
npm run dev
```

## Deployment (Make it Public!)### Deploy to Railway (Free & Easy)1. **Create a Railway Account**   - Go to [railway.app](https://railway.app)   - Sign up with GitHub2. **Deploy Your App**   - Upload your project folder to GitHub   - In Railway, click "New Project"   - Select "Deploy from GitHub repo"   - Choose your repository   - Railway will automatically detect it's a Node.js app and deploy it!3. **Set Your Password**   - In Railway dashboard, go to Variables   - Add: `EDIT_PASSWORD` = `your-secret-password`   - Or keep default: `bambee123`4. **Get Your Public URL**   - Once deployed, Railway will give you a public URL like: `https://your-app-name.railway.app`   - Share this URL with anyone - they can watch, only you can edit with password!### Alternative: Deploy to Render1. Go to [render.com](https://render.com) and sign up2. Connect your GitHub repository3. Create a new "Web Service"4. Set build command: `npm install`5. Set start command: `npm start`6. Deploy!## Technical Details- **Backend**: Node.js with Express and Socket.io- **Frontend**: HTML, CSS, JavaScript with real-time WebSocket communication- **Storage**: In-memory (text persists while server is running)- **Deployment**: Ready for Railway, Render, Heroku, or any Node.js hosting platformEnjoy your collaborative greenscreen text experience! 🟢 