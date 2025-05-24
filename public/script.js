const socket = io();
const displayText = document.getElementById('display-text');
const textInput = document.getElementById('text-input');

let isEditing = false;
let currentPassword = null;

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
});

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

console.log('Bambee Website loaded! Press "N" to edit (password required first time). Press "P" to change password.'); 