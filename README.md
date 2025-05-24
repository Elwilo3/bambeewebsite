# Bambee Website

A real-time collaborative text editing website with greenscreen background, perfect for OBS streaming.

## Features

- **Greenscreen Background**: Bright green (#00ff00) for easy chroma keying
- **Password Protection**: Only people with password can edit (default: `bambee123`)
- **Real-time Updates**: Text changes instantly for all viewers
- **Multiline Support**: Shift+Enter for new lines
- **Auto-sizing Background**: Text background fits content perfectly
- **OBS Ready**: Semi-transparent backgrounds work great with chroma key

## Controls

- **N** - Start editing (password required first time)
- **P** - Change/reset password  
- **Enter** - Save text and share with everyone
- **Shift+Enter** - New line while editing
- **Escape** - Cancel editing

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open browser:**
   Go to `http://localhost:3000`

## Deploy to Render (FREE)

1. Upload this folder to GitHub
2. Go to [render.com](https://render.com) 
3. Create "Web Service" from your GitHub repo
4. Set environment variable: `EDIT_PASSWORD=your-secret-password`
5. Deploy and get your public URL!

## Password

- **Default password:** `bambee123`
- **Change it:** Set `EDIT_PASSWORD` environment variable
- **Session based:** Password remembered until browser refresh

Perfect for streamers who want real-time text overlays! 🎬✨ 