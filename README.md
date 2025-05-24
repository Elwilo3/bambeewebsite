# Bambee Website

A real-time collaborative text editing website with greenscreen background, perfect for OBS streaming.

## ✨ NEW Features

- **🎨 8 Visual Styles**: Press 'K' to cycle through different visual themes
- **📏 OBS-Ready Responsive**: Automatically fits any size you make in OBS
- **⚡ Real-time Style Switching**: Change styles instantly during stream

## Features

- **Greenscreen Background**: Bright green (#00ff00) for easy chroma keying
- **Password Protection**: Only people with password can edit (default: `bambee123`)
- **Real-time Updates**: Text changes instantly for all viewers
- **Multiline Support**: Shift+Enter for new lines
- **Auto-sizing**: Text automatically fits your OBS source size
- **8 Visual Styles**: From minimal to gaming RGB to retro 80s
- **OBS Ready**: Perfect scaling and chroma key compatibility

## 🎨 Visual Styles

1. **Default** - Semi-transparent black box with white text
2. **Neon Glow** - Cyberpunk cyan glow effects
3. **Retro 80s** - Animated gradient backgrounds with bold text
4. **Minimal** - Clean transparent style with subtle shadows
5. **Gaming RGB** - Rainbow border animations and RGB effects
6. **Corporate** - Professional white background style
7. **Handwriting** - Handwritten font on paper-like background
8. **Futuristic** - Holographic sci-fi style with animations

## Controls

- **N** - Start editing (password required first time)
- **P** - Change/reset password  
- **K** - Cycle through visual styles
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

## 📺 OBS Setup

1. Add **Browser Source** in OBS
2. Set URL to your website (local or deployed)
3. **Resize the source** to any size you want - text will auto-fit!
4. Add **Chroma Key** filter:
   - Key Color Type: Green
   - Key Color: #00ff00
   - Similarity: 400-600
5. Press **K** to find your favorite style!

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

Perfect for streamers who want real-time text overlays with style! 🎬✨ 