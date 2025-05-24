const socket = io();
const displayText = document.getElementById('display-text');
const textInput = document.getElementById('text-input');
const styleIndicator = document.getElementById('style-indicator');
const controlsPanel = document.getElementById('controls-panel');

let isEditing = false;
let currentPassword = null;
let controlsOpen = false;
let customHtmlMode = false;

// Style management
const styles = [
    { name: 'Default', class: 'style-default' },
    { name: 'Neon Glow', class: 'style-neon' },
    { name: 'Retro 80s', class: 'style-retro' },
    { name: 'Minimal', class: 'style-minimal' },
    { name: 'Gaming RGB', class: 'style-gaming' },
    { name: 'Corporate', class: 'style-corporate' },
    { name: 'Handwriting', class: 'style-handwriting' },
    { name: 'Futuristic', class: 'style-futuristic' }
];

// Template presets with FIXED sizing only
const templates = {
    news: {
        name: "News Ticker",
        html: `<div class="news-ticker"><span class="breaking">BREAKING:</span> <span class="news-text">Your text here</span></div>`,
        css: `.news-ticker { background: linear-gradient(45deg, #ff0000, #ffffff); padding: 10px 20px; border-radius: 5px; font-size: 16px; line-height: 1.2; white-space: nowrap; } .breaking { font-weight: bold; color: #ffffff; } .news-text { color: #000000; }`
    },
    gaming: {
        name: "Gaming HUD",
        html: `<div class="hud-container"><div class="hud-label">STATUS</div><div class="hud-content">Your text here</div></div>`,
        css: `.hud-container { border: 2px solid #00ffff; background: rgba(0,0,0,0.8); padding: 15px; font-size: 16px; line-height: 1.2; } .hud-label { font-size: 13px; color: #00ffff; margin-bottom: 5px; } .hud-content { font-size: 24px; color: #ffffff; font-weight: bold; }`
    },
    social: {
        name: "Social Media",
        html: `<div class="social-post"><div class="avatar">👤</div><div class="content"><div class="username">@YourName</div><div class="message">Your text here</div></div></div>`,
        css: `.social-post { display: flex; background: rgba(29,161,242,0.9); padding: 15px; border-radius: 15px; font-size: 16px; line-height: 1.2; align-items: flex-start; } .avatar { font-size: 32px; margin-right: 12px; } .username { font-weight: bold; color: #ffffff; font-size: 14px; margin-bottom: 4px; } .message { color: #ffffff; font-size: 16px; }`
    },
    movie: {
        name: "Movie Credits",
        html: `<div class="credits"><div class="role">Streaming until beating the Ender Dragon.</div><div class="name">Current Challenge:<br>Final Hit = Gold Tool</div></div>`,
        css: `.credits { text-align: center; display: inline-block; background: rgba(0,0,0,0.7); padding: 12px 16px; border-radius: 8px; font-size: 16px; line-height: 1.2; } .role { font-size: 11px; letter-spacing: 2px; color: #cccccc; margin: 0 0 8px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.9); } .name { font-size: 26px; font-weight: bold; color: #ffffff; line-height: 1.0; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.9); }`
    }
};

// Style state management
let globalStyleIndex = 0;
let localStyleIndex = 0;
let isLocalMode = false;
let localStyleIndicator = null;
let customStyles = {};
let customHtmlContent = null;

// Socket events
socket.on('textUpdate', (newText) => {
    socket.lastText = newText;
    if (!customHtmlMode) {
        displayText.textContent = newText;
        if (!isEditing) {
            textInput.value = newText;
        }
    }
});

socket.on('customHtmlUpdate', (htmlData) => {
    if (htmlData && htmlData.html) {
        customHtmlContent = htmlData;
        customHtmlMode = true;
        
        // Add the fixed HTML mode class
        displayText.classList.add('custom-html-mode');
        displayText.innerHTML = htmlData.html;
        
        if (htmlData.css) {
            updateCustomCSS(htmlData.css);
        }
        showStyleIndicator('HTML Mode: ON (Global HTML Applied)');
    } else if (htmlData === null) {
        customHtmlMode = false;
        customHtmlContent = null;
        
        // Remove the fixed HTML mode class
        displayText.classList.remove('custom-html-mode');
        clearCustomCSS();
        displayText.innerHTML = '';
        displayText.textContent = socket.lastText || "Welcome to Bambee Website!";
        showStyleIndicator('HTML Mode: OFF (Reset)');
    }
});

socket.on('globalStyleUpdate', (styleData) => {
    globalStyleIndex = styleData.styleIndex || 0;
    customStyles = styleData.customStyles || {};
    
    if (!isLocalMode && !customHtmlMode) {
        localStyleIndex = globalStyleIndex;
        applyStyle(globalStyleIndex, false);
        applyCustomStyles(customStyles);
    }
});

// Keyboard controls
document.addEventListener('keydown', (event) => {
    if ((event.key === 'n' || event.key === 'N') && !isEditing && !controlsOpen) {
        if (currentPassword) {
            startEditing();
        } else {
            requestPasswordAndEdit();
        }
    }
    
    if (event.key === 'Enter' && isEditing && !event.shiftKey) {
        event.preventDefault();
        saveText();
    }
    
    if (event.key === 'Enter' && !isEditing && !controlsOpen && isLocalMode) {
        makeStyleGlobal();
    }
    
    if (event.key === 'Escape') {
        if (isEditing) {
        cancelEditing();
        } else if (controlsOpen) {
            closeControls();
        } else if (isLocalMode) {
            revertToGlobal();
        }
    }
    
    if ((event.key === 'p' || event.key === 'P') && !isEditing && !controlsOpen) {
        changePassword();
    }
    
    if ((event.key === 'k' || event.key === 'K') && !isEditing && !controlsOpen) {
        cycleStyleLocally();
    }
    
    if ((event.key === 'o' || event.key === 'O') && !isEditing && !controlsOpen) {
        openControls();
    }

    // H key for HTML mode
    if ((event.key === 'h' || event.key === 'H') && !isEditing && !controlsOpen) {
        toggleHtmlMode();
    }

    // R key for reset
    if ((event.key === 'r' || event.key === 'R') && !isEditing && !controlsOpen && event.ctrlKey) {
        resetToNormal();
    }
});

// HTML Mode functions
function toggleHtmlMode() {
    customHtmlMode = !customHtmlMode;
    
    if (customHtmlMode) {
        displayText.classList.add('custom-html-mode');
        if (customHtmlContent) {
            displayText.innerHTML = customHtmlContent.html;
            if (customHtmlContent.css) {
                updateCustomCSS(customHtmlContent.css);
            }
        }
        showStyleIndicator('HTML Mode: ON (H to toggle, Ctrl+R to reset)');
    } else {
        displayText.classList.remove('custom-html-mode');
        displayText.innerHTML = '';
        displayText.textContent = socket.lastText || "Welcome to Bambee Website!";
        clearCustomCSS();
        showStyleIndicator('HTML Mode: OFF');
    }
}

function updateCustomCSS(css) {
    let styleElement = document.getElementById('custom-styles');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'custom-styles';
        document.head.appendChild(styleElement);
    }
    styleElement.textContent = css;
}

function clearCustomCSS() {
    const styleElement = document.getElementById('custom-styles');
    if (styleElement) {
        styleElement.remove();
    }
}

function resetToNormal() {
    if (confirm('Reset everything to normal? This will clear all customizations.')) {
        customHtmlMode = false;
        customHtmlContent = null;
        customStyles = {};
        isLocalMode = false;
        clearCustomCSS();
        
        document.body.className = 'style-default';
        displayText.removeAttribute('style');
        displayText.classList.remove('custom-html-mode');
        displayText.innerHTML = '';
        displayText.textContent = socket.lastText || "Welcome to Bambee Website!";
        
        hideLocalIndicator();
        showStyleIndicator('Reset to Normal ✓');
        
        if (currentPassword) {
            socket.emit('resetToNormal', { password: currentPassword });
        }
    }
}

// Style functions
function cycleStyleLocally() {
    if (customHtmlMode) {
        showStyleIndicator('Disable HTML mode first (press H)');
        return;
    }
    
    if (!isLocalMode) {
        isLocalMode = true;
        localStyleIndex = globalStyleIndex;
        showLocalIndicator();
    }
    
    document.body.classList.remove(styles[localStyleIndex].class);
    localStyleIndex = (localStyleIndex + 1) % styles.length;
    applyStyle(localStyleIndex, true);
}

function makeStyleGlobal() {
    if (isLocalMode && currentPassword) {
        socket.emit('updateGlobalStyle', {
            styleData: { 
                styleIndex: localStyleIndex,
                customStyles: customStyles 
            },
            password: currentPassword
        });
        
        globalStyleIndex = localStyleIndex;
        isLocalMode = false;
        hideLocalIndicator();
        showStyleIndicator('Global: ' + styles[localStyleIndex].name + ' ✓');
    } else if (isLocalMode && !currentPassword) {
        alert('Password required to make global changes!');
    }
}

function revertToGlobal() {
    if (isLocalMode) {
        isLocalMode = false;
        localStyleIndex = globalStyleIndex;
        applyStyle(globalStyleIndex, false);
        hideLocalIndicator();
        showStyleIndicator('Reverted to Global: ' + styles[globalStyleIndex].name);
    }
}

function applyStyle(styleIndex, isLocal) {
    styles.forEach(style => {
        document.body.classList.remove(style.class);
    });
    
    document.body.classList.add(styles[styleIndex].class);
    
    const prefix = isLocal ? 'Local: ' : '';
    const suffix = isLocal ? ' (Press Enter to share)' : '';
    showStyleIndicator(prefix + styles[styleIndex].name + suffix);
}

function showStyleIndicator(text) {
    styleIndicator.textContent = text;
    styleIndicator.classList.add('show');
    
    setTimeout(() => {
        styleIndicator.classList.remove('show');
    }, 3000);
}

function showLocalIndicator() {
    if (!localStyleIndicator) {
        localStyleIndicator = document.createElement('div');
        localStyleIndicator.className = 'local-style-indicator';
        document.body.appendChild(localStyleIndicator);
    }
    
    localStyleIndicator.textContent = 'LOCAL MODE - Enter to share, Esc to revert';
    localStyleIndicator.classList.add('show');
}

function hideLocalIndicator() {
    if (localStyleIndicator) {
        localStyleIndicator.classList.remove('show');
    }
}

// Controls panel functions
function openControls() {
    controlsOpen = true;
    controlsPanel.style.display = 'block';
    loadCurrentStyles();
    populateTemplates();
}

function closeControls() {
    controlsOpen = false;
    controlsPanel.style.display = 'none';
}

function populateTemplates() {
    const templateSelect = document.getElementById('template-select');
    if (templateSelect) {
        templateSelect.innerHTML = '<option value="">Choose Template...</option>';
        Object.keys(templates).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = templates[key].name;
            templateSelect.appendChild(option);
        });
    }
}

function loadCurrentStyles() {
    const computedStyle = window.getComputedStyle(displayText);
    
    document.getElementById('font-size').value = parseFloat(computedStyle.fontSize) / 16 || 8;
    document.getElementById('text-color').value = rgbToHex(computedStyle.color) || '#ffffff';
    
    // Load current dimensions if they exist
    const currentWidth = displayText.style.width || 'auto';
    const currentHeight = displayText.style.height || 'auto';
    const currentMaxWidth = displayText.style.maxWidth || '90vw';
    const currentMaxHeight = displayText.style.maxHeight || '85vh';
    
    // Parse and set dimension controls (simplified - you might want more robust parsing)
    if (currentWidth !== 'auto') {
        // Extract unit and value (basic implementation)
        const widthMatch = currentWidth.match(/(\d+)(.*)/);
        if (widthMatch) {
            document.getElementById('width-value').value = widthMatch[1];
            document.getElementById('width-unit').value = widthMatch[2];
        }
    }
}

function applyCustomStyles(styles) {
    document.body.classList.add('custom-styles');
    
    // Handle dimension styles with CSS custom properties
    const root = document.documentElement;
    
    Object.keys(styles).forEach(property => {
        if (property === 'width') {
            root.style.setProperty('--custom-width', styles[property]);
        } else if (property === 'height') {
            root.style.setProperty('--custom-height', styles[property]);
        } else if (property === 'max-width') {
            root.style.setProperty('--custom-max-width', styles[property]);
        } else if (property === 'max-height') {
            root.style.setProperty('--custom-max-height', styles[property]);
        } else {
            displayText.style.setProperty(property, styles[property]);
        }
    });
}

function applyTemplate(templateKey) {
    const template = templates[templateKey];
    if (template && currentPassword) {
        customHtmlMode = true;
        customHtmlContent = {
            html: template.html,
            css: template.css
        };
        
        displayText.classList.add('custom-html-mode');
        displayText.innerHTML = template.html;
        updateCustomCSS(template.css);
        
        socket.emit('updateCustomHtml', {
            htmlData: customHtmlContent,
            password: currentPassword
        });
        
        showStyleIndicator('Template Applied: ' + template.name);
        closeControls();
    } else if (!currentPassword) {
        alert('Password required for templates!');
    }
}

// Event listeners for controls
document.getElementById('close-controls').addEventListener('click', closeControls);

document.getElementById('apply-local').addEventListener('click', () => {
    const newStyles = getCustomStylesFromControls();
    customStyles = { ...customStyles, ...newStyles };
    applyCustomStyles(customStyles);
    isLocalMode = true;
    showLocalIndicator();
    showStyleIndicator('Local: Custom (Press Enter to share)');
});

document.getElementById('apply-global').addEventListener('click', () => {
    if (currentPassword) {
        const newStyles = getCustomStylesFromControls();
        customStyles = { ...customStyles, ...newStyles };
        
        socket.emit('updateGlobalStyle', {
            styleData: { 
                styleIndex: globalStyleIndex,
                customStyles: customStyles 
            },
            password: currentPassword
        });
        
        showStyleIndicator('Global: Custom Applied ✓');
    } else {
        alert('Password required for global changes!');
    }
});

document.getElementById('reset-styles').addEventListener('click', () => {
    customStyles = {};
    document.body.classList.remove('custom-styles');
    displayText.removeAttribute('style');
    applyStyle(isLocalMode ? localStyleIndex : globalStyleIndex, isLocalMode);
});

// HTML Editor functions
document.getElementById('save-html').addEventListener('click', () => {
    const html = document.getElementById('html-editor').value;
    const css = document.getElementById('css-editor').value;
    
    if (currentPassword) {
        customHtmlContent = { html, css };
        customHtmlMode = true;
        
        displayText.classList.add('custom-html-mode');
        displayText.innerHTML = html;
        updateCustomCSS(css);
        
        socket.emit('updateCustomHtml', {
            htmlData: customHtmlContent,
            password: currentPassword
        });
        
        showStyleIndicator('Custom HTML Applied ✓');
        closeControls();
    } else {
        alert('Password required for custom HTML!');
    }
});

document.getElementById('template-select').addEventListener('change', (e) => {
    if (e.target.value) {
        applyTemplate(e.target.value);
    }
});

document.getElementById('export-design').addEventListener('click', () => {
    const design = {
        html: customHtmlContent?.html || displayText.textContent,
        css: customHtmlContent?.css || '',
        styles: customStyles,
        styleIndex: globalStyleIndex
    };
    
    const dataStr = JSON.stringify(design, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bambee-design.json';
    link.click();
    
    URL.revokeObjectURL(url);
    showStyleIndicator('Design Exported ✓');
});

document.getElementById('import-design').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && currentPassword) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const design = JSON.parse(event.target.result);
                
                if (design.html && design.html !== displayText.textContent) {
                    customHtmlMode = true;
                    customHtmlContent = { html: design.html, css: design.css || '' };
                    displayText.innerHTML = design.html;
                    if (design.css) updateCustomCSS(design.css);
                }
                
                if (design.styles) {
                    customStyles = design.styles;
                    applyCustomStyles(customStyles);
                }
                
                if (design.styleIndex !== undefined) {
                    applyStyle(design.styleIndex, false);
                }
                
                showStyleIndicator('Design Imported ✓');
            } catch (error) {
                alert('Invalid design file!');
            }
        };
        reader.readAsText(file);
    } else if (!currentPassword) {
        alert('Password required for importing!');
    }
});

function getCustomStylesFromControls() {
    const styles = {
        'font-size': document.getElementById('font-size').value + 'vw',
        'color': document.getElementById('text-color').value,
        'font-family': document.getElementById('font-family').value,
        'font-weight': document.getElementById('font-weight').value,
        'background-color': hexToRgba(document.getElementById('bg-color').value, document.getElementById('bg-opacity').value),
        'border': document.getElementById('border-size').value + 'px solid ' + document.getElementById('border-color').value,
        'border-radius': document.getElementById('border-radius').value + 'px',
        'padding': document.getElementById('padding').value + 'px',
        'text-align': document.getElementById('text-align').value
    };

    // Handle width
    const widthUnit = document.getElementById('width-unit').value;
    if (widthUnit !== 'auto') {
        const widthValue = document.getElementById('width-value').value;
        styles['width'] = widthValue + widthUnit;
    } else {
        styles['width'] = 'auto';
    }

    // Handle height
    const heightUnit = document.getElementById('height-unit').value;
    if (heightUnit !== 'auto') {
        const heightValue = document.getElementById('height-value').value;
        styles['height'] = heightValue + heightUnit;
    } else {
        styles['height'] = 'auto';
    }

    // Handle max-width
    const maxWidthUnit = document.getElementById('max-width-unit').value;
    if (maxWidthUnit !== 'none') {
        const maxWidthValue = document.getElementById('max-width-value').value;
        styles['max-width'] = maxWidthValue + maxWidthUnit;
    } else {
        styles['max-width'] = 'none';
    }

    // Handle max-height
    const maxHeightUnit = document.getElementById('max-height-unit').value;
    if (maxHeightUnit !== 'none') {
        const maxHeightValue = document.getElementById('max-height-value').value;
        styles['max-height'] = maxHeightValue + maxHeightUnit;
    } else {
        styles['max-height'] = 'none';
    }

    return styles;
}

// Utility functions
function rgbToHex(rgb) {
    const result = rgb.match(/\d+/g);
    if (result) {
        const r = parseInt(result[0]).toString(16).padStart(2, '0');
        const g = parseInt(result[1]).toString(16).padStart(2, '0');
        const b = parseInt(result[2]).toString(16).padStart(2, '0');
        return '#' + r + g + b;
    }
    return '#ffffff';
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Existing editing functions
function requestPasswordAndEdit() {
    const password = prompt('Enter password to edit:');
    if (password === null) return;
    
    socket.emit('verifyPassword', password, (isValid) => {
        if (isValid) {
            currentPassword = password;
            startEditing();
        } else {
            alert('Incorrect password! You can still watch but cannot edit.');
        }
    });
}

function changePassword() {
    const password = prompt('Enter new password:');
    if (password === null) return;
    
    socket.emit('verifyPassword', password, (isValid) => {
        if (isValid) {
            currentPassword = password;
            alert('Password updated! You can now edit and customize.');
        } else {
            alert('Incorrect password! You can still watch but cannot edit.');
        }
    });
}

function startEditing() {
    if (customHtmlMode) {
        openControls();
        document.getElementById('html-editor').value = customHtmlContent?.html || '';
        document.getElementById('css-editor').value = customHtmlContent?.css || '';
        document.querySelector('[data-tab="html"]').click();
    } else {
    isEditing = true;
    displayText.style.display = 'none';
    textInput.style.display = 'block';
    textInput.focus();
    textInput.select();
    }
}

function saveText() {
    const newText = textInput.value.trim();
    if (newText !== '' && currentPassword) {
        socket.emit('updateText', {
            newText: newText,
            password: currentPassword
        });
    }
    stopEditing();
}

function cancelEditing() {
    textInput.value = displayText.textContent;
    stopEditing();
}

function stopEditing() {
    isEditing = false;
    displayText.style.display = 'inline-block';
    textInput.style.display = 'none';
}

textInput.addEventListener('blur', () => {
    if (isEditing) {
        saveText();
    }
});

console.log('Bambee Website loaded!\nControls:\n- N: Edit text\n- P: Change password\n- K: Cycle styles\n- H: Toggle HTML mode\n- O: Advanced controls\n- Ctrl+R: Reset everything\n- Escape: Cancel/Revert'); 