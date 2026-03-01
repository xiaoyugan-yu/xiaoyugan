// Updated script.js to remove old mailto functionality

function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    // Handle form submission logic here
    // Assume success if submission is successful
    showSuccessMessage();
}

function showSuccessMessage() {
    const messageElement = document.createElement('div');
    messageElement.innerText = 'Form submitted successfully!';
    messageElement.style.color = 'green';
    document.body.appendChild(messageElement);
}

// Example: Hook up the handleFormSubmit to a form
const form = document.querySelector('form');
if (form) {
    form.addEventListener('submit', handleFormSubmit);
}
