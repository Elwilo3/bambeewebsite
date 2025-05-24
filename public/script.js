const socket = io();
const displayText = document.getElementById('display-text');
const textInput = document.getElementById('text-input');
const styleIndicator = document.getElementById('style-indicator');

let isEditing = false;
let currentPassword = null;

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

let currentStyleIndex = 0;

socket.on('textUpdate', (newText) => {
    displayText.textContent = newText;
    if (!isEditing) {
        textInput.value = newText;
    }
});

document.addEventListener('keydown', (event) => {
    if ((event.key === 'n' || event.key === 'N') && !isEditing) {
        // If we already have a valid password, start editing directly
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
    
    if (event.key === 'Escape' && isEditing) {
        cancelEditing();
    }
    
    // Press 'P' to change/reset password
    if ((event.key === 'p' || event.key === 'P') && !isEditing) {
        changePassword();
    }
    
    // Press 'K' to cycle through styles
    if ((event.key === 'k' || event.key === 'K') && !isEditing) {
        cycleStyle();
    }
});

function cycleStyle() {
    // Remove current style class
    document.body.classList.remove(styles[currentStyleIndex].class);
    
    // Move to next style
    currentStyleIndex = (currentStyleIndex + 1) % styles.length;
    
    // Apply new style class
    document.body.classList.add(styles[currentStyleIndex].class);
    
    // Show style indicator
    showStyleIndicator();
}

function showStyleIndicator() {
    styleIndicator.textContent = `Style: ${styles[currentStyleIndex].name}`;
    styleIndicator.classList.add('show');
    
    // Hide after 2 seconds
    setTimeout(() => {
        styleIndicator.classList.remove('show');
    }, 2000);
}

function requestPasswordAndEdit() {
    const password = prompt('Enter password to edit:');
    if (password === null) return; // User cancelled
    
    // Verify password with server
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
    if (password === null) return; // User cancelled
    
    // Verify password with server
    socket.emit('verifyPassword', password, (isValid) => {
        if (isValid) {
            currentPassword = password;
            alert('Password updated! You can now press N to edit.');
        } else {
            alert('Incorrect password! You can still watch but cannot edit.');
        }
    });
}

function startEditing() {
    isEditing = true;
    displayText.style.display = 'none';
    textInput.style.display = 'block';
    textInput.focus();
    textInput.select();
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

console.log('Bambee Website loaded!\nControls:\n- N: Edit text (password required)\n- P: Change password\n- K: Change visual style\n- Enter: Save text\n- Escape: Cancel editing'); 