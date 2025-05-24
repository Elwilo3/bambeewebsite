const socket = io();
const counterLabel = document.getElementById('counter-label');
const counterNumber = document.getElementById('counter-number');
const styleIndicator = document.getElementById('style-indicator');
const controlsPanel = document.getElementById('controls-panel');
const editPanel = document.getElementById('edit-panel');

let isEditing = false;
let currentPassword = null;
let controlsOpen = false;

// Counter data
let counterData = { count: 0, label: "Deaths" };

// Style management (same as main page)
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

let globalStyleIndex = 0;
let localStyleIndex = 0;
let isLocalMode = false;
let localStyleIndicator = null;
let customStyles = {};

// Socket events
socket.on('deadCounterUpdate', (newCounterData) => {
    counterData = newCounterData;
    updateCounterDisplay();
});

socket.on('deadCounterStyleUpdate', (styleData) => {
    globalStyleIndex = styleData.styleIndex || 0;
    customStyles = styleData.customStyles || {};
    
    if (!isLocalMode) {
        localStyleIndex = globalStyleIndex;
        applyStyle(globalStyleIndex, false);
        applyCustomStyles(customStyles);
    }
});

function updateCounterDisplay() {
    counterLabel.textContent = counterData.label;
    counterNumber.textContent = counterData.count;
}

// Keyboard controls
document.addEventListener('keydown', (event) => {
    // Quick increment/decrement (Arrow keys)
    if (event.key === 'ArrowUp' && !isEditing && !controlsOpen && currentPassword) {
        event.preventDefault();
        modifyCounter(1);
    }
    
    if (event.key === 'ArrowDown' && !isEditing && !controlsOpen && currentPassword) {
        event.preventDefault();
        modifyCounter(-1);
    }
    
    // Reset counter (R key)
    if ((event.key === 'r' || event.key === 'R') && !isEditing && !controlsOpen && currentPassword) {
        resetCounter();
    }
    
    // Edit mode (N key)
    if ((event.key === 'n' || event.key === 'N') && !isEditing && !controlsOpen) {
        if (currentPassword) {
            startEditing();
        } else {
            requestPasswordAndEdit();
        }
    }
    
    // Password change (P key)
    if ((event.key === 'p' || event.key === 'P') && !isEditing && !controlsOpen) {
        changePassword();
    }
    
    // Style cycling (K key)
    if ((event.key === 'k' || event.key === 'K') && !isEditing && !controlsOpen) {
        cycleStyleLocally();
    }
    
    // Make style global (Enter)
    if (event.key === 'Enter' && !isEditing && !controlsOpen && isLocalMode) {
        makeStyleGlobal();
    }
    
    // Detailed controls (O key)
    if ((event.key === 'o' || event.key === 'O') && !isEditing && !controlsOpen) {
        openControls();
    }
    
    // Escape to cancel/revert
    if (event.key === 'Escape') {
        if (isEditing) {
            cancelEditing();
        } else if (controlsOpen) {
            closeControls();
        } else if (isLocalMode) {
            revertToGlobal();
        }
    }
});

// Counter functions
function modifyCounter(delta) {
    const newCount = Math.max(0, counterData.count + delta);
    const newCounterData = { ...counterData, count: newCount };
    
    socket.emit('updateDeadCounter', {
        counterData: newCounterData,
        password: currentPassword
    });
}

function resetCounter() {
    if (confirm('Reset counter to 0?')) {
        const newCounterData = { ...counterData, count: 0 };
        
        socket.emit('updateDeadCounter', {
            counterData: newCounterData,
            password: currentPassword
        });
    }
}

// Edit functions
function startEditing() {
    isEditing = true;
    editPanel.style.display = 'block';
    document.getElementById('label-input').value = counterData.label;
    document.getElementById('count-input').value = counterData.count;
    document.getElementById('label-input').focus();
}

function cancelEditing() {
    isEditing = false;
    editPanel.style.display = 'none';
}

function saveCounter() {
    const newLabel = document.getElementById('label-input').value.trim() || 'Deaths';
    const newCount = parseInt(document.getElementById('count-input').value) || 0;
    
    const newCounterData = {
        label: newLabel,
        count: Math.max(0, newCount)
    };
    
    socket.emit('updateDeadCounter', {
        counterData: newCounterData,
        password: currentPassword
    });
    
    cancelEditing();
}

// Style functions (similar to main page)
function cycleStyleLocally() {
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
        socket.emit('updateDeadCounterStyle', {
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

// Password functions
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
            alert('Password updated! You can now edit the counter.');
        } else {
            alert('Incorrect password! You can still watch but cannot edit.');
        }
    });
}

// Controls panel (similar to main page)
function openControls() {
    controlsOpen = true;
    controlsPanel.style.display = 'block';
}

function closeControls() {
    controlsOpen = false;
    controlsPanel.style.display = 'none';
}

function applyCustomStyles(styles) {
    document.body.classList.add('custom-styles');
    
    Object.keys(styles).forEach(property => {
        counterLabel.style.setProperty(property, styles[property]);
        counterNumber.style.setProperty(property, styles[property]);
    });
}

// Event listeners
document.getElementById('close-controls').addEventListener('click', closeControls);
document.getElementById('save-counter').addEventListener('click', saveCounter);
document.getElementById('cancel-edit').addEventListener('click', cancelEditing);

// Add the controls panel functionality (simplified version)
document.getElementById('apply-local').addEventListener('click', () => {
    // Simplified custom styling for counter
    showStyleIndicator('Local: Custom (Press Enter to share)');
});

document.getElementById('apply-global').addEventListener('click', () => {
    if (currentPassword) {
        showStyleIndicator('Global: Custom Applied ✓');
    } else {
        alert('Password required for global changes!');
    }
});

document.getElementById('reset-styles').addEventListener('click', () => {
    customStyles = {};
    document.body.classList.remove('custom-styles');
    counterLabel.removeAttribute('style');
    counterNumber.removeAttribute('style');
    applyStyle(isLocalMode ? localStyleIndex : globalStyleIndex, isLocalMode);
});

console.log('Dead Counter loaded!\nControls:\n- Arrow Up/Down: +1/-1 (password required)\n- R: Reset counter\n- N: Edit label/count\n- P: Change password\n- K: Cycle styles locally\n- Enter: Share current style globally\n- O: Detailed controls'); 