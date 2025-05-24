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

// Add after the templates object
const customTextStyles = {};

// Add editing state variables
let editingStyleName = null;

// Add text parsing function
function parseCustomTextStyles(text) {
    if (!text || customHtmlMode) return text;
    
    // Parse custom style markers like /stylename/text/stylename/
    let parsedText = text.replace(/\/([a-zA-Z0-9_-]+)\/(.*?)\/\1\//g, (match, styleName, content) => {
        if (customTextStyles[styleName]) {
            return `<span class="custom-text-${styleName}">${content}</span>`;
        }
        return content; // If style doesn't exist, just return the content
    });
    
    return parsedText;
}

// Add function to generate CSS for custom text styles
function updateCustomTextStylesCSS() {
    let styleElement = document.getElementById('custom-text-styles');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'custom-text-styles';
        document.head.appendChild(styleElement);
    }
    
    let css = '';
    Object.keys(customTextStyles).forEach(styleName => {
        const style = customTextStyles[styleName];
        css += `.custom-text-${styleName} {\n`;
        Object.keys(style).forEach(property => {
            css += `  ${property}: ${style[property]};\n`;
        });
        css += '}\n\n';
    });
    
    styleElement.textContent = css;
}

// Socket events
socket.on('textUpdate', (newText) => {
    socket.lastText = newText;
    if (!customHtmlMode) {
        const parsedText = parseCustomTextStyles(newText);
        if (parsedText !== newText) {
            displayText.innerHTML = parsedText;
        } else {
            displayText.textContent = newText;
        }
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

// Add custom text styles update handler
socket.on('customTextStylesUpdate', (styles) => {
    Object.assign(customTextStyles, styles);
    updateCustomTextStylesCSS();
    
    // Re-parse current text if not in HTML mode
    if (!customHtmlMode && socket.lastText) {
        const parsedText = parseCustomTextStyles(socket.lastText);
        if (parsedText !== socket.lastText) {
            displayText.innerHTML = parsedText;
        }
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
    updateStylesList();
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
    
    // Load global scale
    const currentScale = document.documentElement.style.getPropertyValue('--global-widget-scale') || '1';
    document.getElementById('global-scale').value = parseFloat(currentScale);
    
    // Load global max sizes
    const currentMaxWidth = displayText.style.maxWidth || '95vw';
    const currentMaxHeight = displayText.style.maxHeight || '90vh';
    
    document.getElementById('global-max-width').value = parseInt(currentMaxWidth) || 95;
    document.getElementById('global-max-height').value = parseInt(currentMaxHeight) || 90;
    
    // Load padding values
    const currentPadding = displayText.style.padding || computedStyle.padding || '30px';
    const paddingValues = currentPadding.split(' ');
    
    if (paddingValues.length >= 1) {
        const vertical = parseInt(paddingValues[0]) || 30;
        const horizontal = paddingValues.length >= 2 ? parseInt(paddingValues[1]) || 30 : vertical;
        
        document.getElementById('padding-vertical').value = vertical;
        document.getElementById('padding-horizontal').value = horizontal;
    }
    
    // Load current dimensions if they exist
    const currentWidth = displayText.style.width || 'auto';
    const currentHeight = displayText.style.height || 'auto';
    
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
    const paddingVertical = document.getElementById('padding-vertical').value;
    const paddingHorizontal = document.getElementById('padding-horizontal').value;
    const globalScale = document.getElementById('global-scale').value;
    const globalMaxWidth = document.getElementById('global-max-width').value;
    const globalMaxHeight = document.getElementById('global-max-height').value;
    
    // Apply global scale by actually scaling dimensions (OBS-friendly)
    const scaledFontSize = (document.getElementById('font-size').value * globalScale);
    const scaledPaddingV = (paddingVertical * globalScale);
    const scaledPaddingH = (paddingHorizontal * globalScale);
    
    // Scale border and shadow properties relative to widget size
    const scaledBorderSize = (document.getElementById('border-size').value * globalScale);
    const scaledBorderRadius = (document.getElementById('border-radius').value * globalScale);
    const scaledTextShadow = (document.getElementById('text-shadow').value * globalScale);
    const scaledBoxShadow = (document.getElementById('box-shadow').value * globalScale);
    
    const styles = {
        'font-size': scaledFontSize + 'vw', // Scale the actual font size
        'color': document.getElementById('text-color').value,
        'font-family': document.getElementById('font-family').value,
        'font-weight': document.getElementById('font-weight').value,
        'background-color': hexToRgba(document.getElementById('bg-color').value, document.getElementById('bg-opacity').value),
        'border': scaledBorderSize + 'px solid ' + document.getElementById('border-color').value, // Scale border
        'border-radius': scaledBorderRadius + 'px', // Scale border radius
        'padding': scaledPaddingV + 'px ' + scaledPaddingH + 'px', // Scale the actual padding
        'text-align': document.getElementById('text-align').value,
        'text-shadow': scaledTextShadow + 'px ' + scaledTextShadow + 'px 4px rgba(0, 0, 0, 0.9)', // Scale text shadow
        'box-shadow': scaledBoxShadow > 0 ? `0 0 ${scaledBoxShadow}px rgba(0, 0, 0, 0.5)` : 'none', // Scale box shadow
        // Set global max sizes (also scaled)
        'max-width': (globalMaxWidth * globalScale) + 'vw',
        'max-height': (globalMaxHeight * globalScale) + 'vh'
    };

    // Handle width
    const widthUnit = document.getElementById('width-unit').value;
    if (widthUnit !== 'auto') {
        const widthValue = document.getElementById('width-value').value * globalScale;
        styles['width'] = widthValue + widthUnit;
    } else {
        styles['width'] = 'auto';
    }

    // Handle height
    const heightUnit = document.getElementById('height-unit').value;
    if (heightUnit !== 'auto') {
        const heightValue = document.getElementById('height-value').value * globalScale;
        styles['height'] = heightValue + heightUnit;
    } else {
        styles['height'] = 'auto';
    }

    // Handle max-width override
    const maxWidthUnit = document.getElementById('max-width-unit').value;
    if (maxWidthUnit !== 'none') {
        const maxWidthValue = document.getElementById('max-width-value').value * globalScale;
        styles['max-width'] = maxWidthValue + maxWidthUnit;
    }

    // Handle max-height override
    const maxHeightUnit = document.getElementById('max-height-unit').value;
    if (maxHeightUnit !== 'none') {
        const maxHeightValue = document.getElementById('max-height-value').value * globalScale;
        styles['max-height'] = maxHeightValue + maxHeightUnit;
    }

    // Handle animations and transforms that should also scale
    const rotation = document.getElementById('rotation').value;
    if (rotation && rotation !== '0') {
        styles['transform'] = `rotate(${rotation}deg)`;
    }

    // Handle animation
    const animation = document.getElementById('animation').value;
    if (animation && animation !== 'none') {
        displayText.classList.remove('pulse', 'bounce', 'fade', 'shake');
        displayText.classList.add(animation);
    } else {
        displayText.classList.remove('pulse', 'bounce', 'fade', 'shake');
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

// Modify the updateStylesList function to include edit buttons
function updateStylesList() {
    const stylesList = document.getElementById('custom-styles-list');
    stylesList.innerHTML = '';
    
    Object.keys(customTextStyles).forEach(styleName => {
        const style = customTextStyles[styleName];
        const item = document.createElement('div');
        item.className = 'style-item';
        
        const preview = document.createElement('span');
        preview.className = `custom-text-${styleName}`;
        preview.textContent = `Sample Text`;
        preview.style.fontSize = '12px';
        
        const editBtn = document.createElement('button');
        editBtn.textContent = '✏️';
        editBtn.className = 'edit-style-btn';
        editBtn.title = 'Edit Style';
        editBtn.onclick = () => editCustomTextStyle(styleName);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✕';
        deleteBtn.className = 'delete-style-btn';
        deleteBtn.title = 'Delete Style';
        deleteBtn.onclick = () => deleteCustomTextStyle(styleName);
        
        const info = document.createElement('div');
        info.className = 'style-info';
        info.innerHTML = `<strong>${styleName}</strong><br><small>Usage: /${styleName}/your text/${styleName}/</small>`;
        
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'style-buttons';
        buttonGroup.appendChild(editBtn);
        buttonGroup.appendChild(deleteBtn);
        
        item.appendChild(info);
        item.appendChild(preview);
        item.appendChild(buttonGroup);
        
        stylesList.appendChild(item);
    });
    
    if (Object.keys(customTextStyles).length === 0) {
        stylesList.innerHTML = '<p class="no-styles">No custom text styles yet. Create one above!</p>';
    }
}

// Add edit function
function editCustomTextStyle(styleName) {
    const style = customTextStyles[styleName];
    if (!style) return;
    
    // Set editing mode
    editingStyleName = styleName;
    
    // Populate form with existing values
    document.getElementById('style-name').value = styleName;
    document.getElementById('style-name').disabled = true; // Can't change name while editing
    
    document.getElementById('style-color').value = style.color || '#ffffff';
    document.getElementById('style-font-weight').value = style['font-weight'] || 'normal';
    
    // Parse font-size (remove 'em' suffix)
    const fontSize = style['font-size'] ? parseFloat(style['font-size'].replace('em', '')) : 1;
    document.getElementById('style-font-size-custom').value = fontSize;
    
    document.getElementById('style-font-style').value = style['font-style'] || 'normal';
    document.getElementById('style-text-decoration').value = style['text-decoration'] || 'none';
    document.getElementById('style-bg-color').value = style['background-color'] || '#000000';
    
    // Parse text-shadow (extract first number)
    const textShadow = style['text-shadow'] ? parseInt(style['text-shadow'].split('px')[0]) : 0;
    document.getElementById('style-text-shadow').value = textShadow;
    
    // Update button text and add cancel button
    const addButton = document.getElementById('add-custom-style');
    addButton.textContent = '💾 Update Style';
    addButton.className = 'control-btn global';
    
    // Add cancel button if it doesn't exist
    let cancelButton = document.getElementById('cancel-edit-style');
    if (!cancelButton) {
        cancelButton = document.createElement('button');
        cancelButton.id = 'cancel-edit-style';
        cancelButton.textContent = '❌ Cancel';
        cancelButton.className = 'control-btn reset';
        cancelButton.onclick = cancelEditCustomTextStyle;
        addButton.parentNode.appendChild(cancelButton);
    }
    
    // Update value displays
    document.getElementById('style-font-size-custom').dispatchEvent(new Event('input'));
    document.getElementById('style-text-shadow').dispatchEvent(new Event('input'));
    
    showStyleIndicator(`Editing style: ${styleName}`);
}

function cancelEditCustomTextStyle() {
    editingStyleName = null;
    
    // Re-enable name field and clear form
    document.getElementById('style-name').disabled = false;
    clearStyleForm();
    
    // Reset button text
    const addButton = document.getElementById('add-custom-style');
    addButton.textContent = '➕ Create Style';
    addButton.className = 'control-btn';
    
    // Remove cancel button
    const cancelButton = document.getElementById('cancel-edit-style');
    if (cancelButton) {
        cancelButton.remove();
    }
    
    showStyleIndicator('Edit cancelled');
}

// Modify addCustomTextStyle to handle both create and update
function addCustomTextStyle() {
    const styleName = document.getElementById('style-name').value.trim();
    const color = document.getElementById('style-color').value;
    const fontWeight = document.getElementById('style-font-weight').value;
    const fontSize = document.getElementById('style-font-size-custom').value;
    const fontStyle = document.getElementById('style-font-style').value;
    const textDecoration = document.getElementById('style-text-decoration').value;
    const backgroundColor = document.getElementById('style-bg-color').value;
    const textShadow = document.getElementById('style-text-shadow').value;
    
    if (!styleName || !styleName.match(/^[a-zA-Z0-9_-]+$/)) {
        alert('Style name must contain only letters, numbers, underscores, and hyphens!');
        return;
    }
    
    // Check if name already exists (and we're not editing)
    if (!editingStyleName && customTextStyles[styleName]) {
        alert('Style name already exists! Use the edit button to modify it.');
        return;
    }
    
    const newStyle = {};
    if (color !== '#ffffff') newStyle.color = color;
    if (fontWeight !== 'normal') newStyle['font-weight'] = fontWeight;
    if (fontSize !== '1') newStyle['font-size'] = fontSize + 'em';
    if (fontStyle !== 'normal') newStyle['font-style'] = fontStyle;
    if (textDecoration !== 'none') newStyle['text-decoration'] = textDecoration;
    if (backgroundColor !== '#000000') newStyle['background-color'] = backgroundColor;
    if (textShadow !== '0') newStyle['text-shadow'] = textShadow + 'px ' + textShadow + 'px 4px rgba(0,0,0,0.5)';
    
    // If editing, remove the old style first (in case we're changing properties)
    if (editingStyleName) {
        // If the name changed, we need to remove the old one
        if (editingStyleName !== styleName) {
            delete customTextStyles[editingStyleName];
        }
    }
    
    customTextStyles[styleName] = newStyle;
    updateCustomTextStylesCSS();
    updateStylesList();
    
    // Send to server if we have password
    if (currentPassword) {
        socket.emit('updateCustomTextStyles', {
            styles: customTextStyles,
            password: currentPassword
        });
    }
    
    const action = editingStyleName ? 'updated' : 'created';
    showStyleIndicator(`Text Style "${styleName}" ${action}!`);
    
    // Reset editing mode
    if (editingStyleName) {
        cancelEditCustomTextStyle();
    } else {
        clearStyleForm();
    }
}

// Modify clearStyleForm to handle editing mode
function clearStyleForm() {
    if (!editingStyleName) {
        document.getElementById('style-name').value = '';
    }
    document.getElementById('style-color').value = '#ffffff';
    document.getElementById('style-font-weight').value = 'normal';
    document.getElementById('style-font-size-custom').value = '1';
    document.getElementById('style-font-style').value = 'normal';
    document.getElementById('style-text-decoration').value = 'none';
    document.getElementById('style-bg-color').value = '#000000';
    document.getElementById('style-text-shadow').value = '0';
    
    // Update displays
    document.getElementById('style-font-size-custom').dispatchEvent(new Event('input'));
    document.getElementById('style-text-shadow').dispatchEvent(new Event('input'));
}

// Add event listener for creating custom text styles
document.getElementById('add-custom-style').addEventListener('click', addCustomTextStyle);

// Update custom font size display
document.getElementById('style-font-size-custom').addEventListener('input', (e) => {
    const display = e.target.parentElement.querySelector('.value-display');
    display.textContent = e.target.value + 'em';
});

// Update custom text shadow display
document.getElementById('style-text-shadow').addEventListener('input', (e) => {
    const display = e.target.parentElement.querySelector('.value-display');
    display.textContent = e.target.value + 'px';
});

function deleteCustomTextStyle(styleName) {
    if (confirm(`Delete text style "${styleName}"?`)) {
        delete customTextStyles[styleName];
        updateCustomTextStylesCSS();
        updateStylesList();
        
        if (currentPassword) {
            socket.emit('updateCustomTextStyles', {
                styles: customTextStyles,
                password: currentPassword
            });
        }
        
        showStyleIndicator(`Text Style "${styleName}" deleted!`);
    }
}

// Value display updates - make them editable inputs
document.querySelectorAll('input[type="range"]').forEach(slider => {
    const updateDisplay = () => {
        const display = slider.parentElement.querySelector('.value-display');
        if (display) {
            let value = slider.value;
            let unit = '';
            
            switch(slider.id) {
                case 'font-size': unit = 'vw'; break;
                case 'text-shadow':
                case 'border-size':
                case 'border-radius':
                case 'box-shadow':
                case 'padding-vertical':
                case 'padding-horizontal':
                case 'perspective': unit = 'px'; break;
                case 'rotation': unit = '°'; break;
                case 'scale': unit = 'x'; break;
                case 'global-scale': unit = 'x'; break;
                case 'global-max-width': unit = 'vw'; break;
                case 'global-max-height': unit = 'vh'; break;
                case 'bg-opacity': unit = ''; break;
                case 'width-value': 
                    unit = document.getElementById('width-unit').value;
                    break;
                case 'height-value': 
                    unit = document.getElementById('height-unit').value;
                    break;
                case 'max-width-value': 
                    unit = document.getElementById('max-width-unit').value;
                    break;
                case 'max-height-value': 
                    unit = document.getElementById('max-height-unit').value;
                    break;
                default: unit = '';
            }
            
            // Make it an editable input instead of just text
            if (!display.querySelector('input')) {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'value-input';
                input.value = value + unit;
                
                // Update slider when input changes
                input.addEventListener('blur', () => {
                    const inputValue = parseFloat(input.value);
                    if (!isNaN(inputValue) && inputValue >= parseFloat(slider.min) && inputValue <= parseFloat(slider.max)) {
                        slider.value = inputValue;
                        slider.dispatchEvent(new Event('input'));
                    } else {
                        input.value = value + unit; // Reset if invalid
                        showStyleIndicator('Invalid value! Must be between ' + slider.min + ' and ' + slider.max);
                    }
                });
                
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        input.blur();
                    }
                    if (e.key === 'Escape') {
                        input.value = value + unit;
                        input.blur();
                    }
                });
                
                display.innerHTML = '';
                display.appendChild(input);
            } else {
                display.querySelector('input').value = value + unit;
            }
        }
    };
    
    slider.addEventListener('input', updateDisplay);
    updateDisplay(); // Initial display
}); 