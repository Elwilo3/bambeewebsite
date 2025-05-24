# Bambee Website - Ultimate Streaming Customization Platform

A real-time collaborative text editing website with greenscreen background, now featuring **extensive customization capabilities** including HTML/CSS editing, templates, and advanced styling controls.

## ✨ NEW Advanced Features

- **🎨 Custom HTML/CSS Editor**: Write your own HTML and CSS code with live preview
- **📐 Professional Templates**: News ticker, gaming HUD, social media, movie credits, and more
- **🔧 Advanced Style Controls**: 40+ styling options including animations, transforms, and effects  
- **💾 Import/Export Designs**: Save and share your custom designs as JSON files
- **⚡ Instant Reset**: One-click return to normal mode from any customization
- **📱 Responsive Controls**: Touch-friendly interface that works on all devices

## Core Features

- **Greenscreen Background**: Perfect #00ff00 chroma key compatibility
- **Password Protection**: Secure editing with customizable passwords
- **Real-time Sync**: All changes appear instantly for all viewers
- **OBS-Ready Responsive**: Automatically scales to any browser source size
- **8 Built-in Styles**: From minimal to futuristic with instant switching
- **Local Preview**: Test styles locally before sharing globally

## 🎮 Controls Reference

### Basic Controls
- **N** - Edit text / Open HTML editor (in HTML mode)
- **P** - Change password
- **K** - Cycle through visual styles locally
- **H** - Toggle HTML mode ON/OFF
- **O** - Open advanced customization panel
- **Enter** - Share current local style globally
- **Ctrl+R** - Reset everything to normal
- **Escape** - Cancel editing / Revert to global style

### Advanced Customization Panel

#### 🎨 Styles Tab
- **Text Styling**: Font size, family, color, weight, shadow
- **Background & Border**: Colors, opacity, borders, shadows, radius
- **Layout & Animation**: Padding, alignment, rotation, animations (pulse, bounce, fade, shake)

#### 💻 HTML/CSS Tab
- **Custom HTML Editor**: Full HTML editing with syntax highlighting
- **Custom CSS Editor**: Complete CSS control with helpful hints
- **Template Selector**: Quick-apply professional templates

#### 📋 Templates Tab
- **News Ticker**: Breaking news style with gradient background
- **Gaming HUD**: Futuristic gaming interface with corners and glow
- **Social Media**: Twitter/social post style with avatar and blue theme
- **Movie Credits**: Cinematic credits with elegant typography

#### ⚙️ Advanced Tab
- **Import/Export**: Save designs as JSON files for backup/sharing
- **Quick Actions**: Copy HTML/CSS, reset everything
- **Advanced CSS**: Backdrop filters, transform scale, perspective effects

## 🎯 Template Examples

### News Ticker Template
```html
<div class="news-ticker">
  <span class="breaking">BREAKING:</span> 
  <span class="news-text">Your text here</span>
</div>
```

### Gaming HUD Template  
```html
<div class="hud-container">
  <div class="hud-label">STATUS</div>
  <div class="hud-content">Your text here</div>
  <div class="hud-corners"></div>
</div>
```

### Social Media Template
```html
<div class="social-post">
  <div class="avatar">👤</div>
  <div class="content">
    <div class="username">@YourName</div>
    <div class="message">Your text here</div>
  </div>
</div>
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Access the website:**
   - Main page: `http://localhost:3000`
   - Dead counter: `http://localhost:3000/deadcounter`

## 📺 OBS Studio Setup

### Basic Setup
1. Add **Browser Source** in OBS
2. Set URL to your website (local or deployed)
3. Resize the source to any size - content auto-scales perfectly!
4. Add **Chroma Key** filter:
   - Key Color Type: Green
   - Key Color: #00ff00  
   - Similarity: 400-600

### Advanced Setup Tips
- **Multiple Sources**: Use both main page and deadcounter simultaneously
- **Custom Styles**: Create unique looks for different scenes
- **Template Switching**: Quickly change styles during stream
- **HTML Mode**: Create complex layouts with custom code

## 🎨 Customization Workflow

### Simple Styling
1. Press **O** to open controls
2. Go to **Styles** tab
3. Adjust sliders and dropdowns
4. Click **👁️ Apply Locally** to preview
5. Click **🌍 Apply Globally** to share with viewers

### HTML/CSS Custom Design
1. Press **H** to enable HTML mode
2. Press **O** to open controls  
3. Go to **HTML/CSS** tab
4. Write your HTML in the editor
5. Add CSS styling
6. Click **💾 Save HTML** to apply globally

### Using Templates
1. Press **O** to open controls
2. Go to **Templates** tab
3. Preview templates in the grid
4. Click **Apply** on your favorite
5. Customize further in other tabs

### Import/Export Designs
1. Go to **Advanced** tab
2. Click **📥 Export Design** to save your work
3. Share JSON files with others
4. Click **📤 Import Design** to load saved designs

## 🔒 Security & Passwords

- **Default password:** `bambee123`
- **Change globally:** Set `EDIT_PASSWORD` environment variable
- **Session-based:** Password remembered until browser refresh
- **Viewer mode:** Anyone can watch, only password holders can edit

## 🌐 Deploy to Render (FREE)

1. Upload code to GitHub
2. Connect to [render.com](https://render.com)
3. Create "Web Service" from your repository
4. Set environment variable: `EDIT_PASSWORD=your-secret-password`
5. Deploy and get your public URL!
6. Share the link with your community!

## 💡 Pro Tips

- **Test Locally First**: Use local preview before going global
- **Save Your Designs**: Export frequently used styles as JSON files
- **Multiple Browser Sources**: Use different pages for different content types
- **Keyboard Shortcuts**: Learn the hotkeys for faster workflow
- **Reset Anytime**: Ctrl+R instantly returns to normal if something breaks

## 🎭 Use Cases

- **Gaming Streams**: Death counters, status displays, notifications
- **News/Talk Shows**: Professional news tickers and lower thirds
- **Social Media**: Tweet displays, follower notifications
- **Creative Content**: Movie-style credits, artistic text displays
- **Educational**: Clean, readable text for tutorials
- **Business**: Corporate-style information displays

Perfect for streamers who want **total creative control** over their text overlays! 🎬✨

---

**Dead Counter Page**: Access `/deadcounter` for a separate counter with the same customization power! 