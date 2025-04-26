document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('activity-form');
    const activityName = document.getElementById('activityName');
    const activityDescription = document.getElementById('activityDescription');
    const activityDate = document.getElementById('activityDate');
    const errorMessages = document.querySelectorAll('.error-message');
    const saveBtn = document.querySelector('.save-btn');

    // Hide error messages by default
    function hideErrorMessages() {
        errorMessages.forEach((msg) => msg.style.display = 'none');
    }

    // Show error message for specific field
    function showErrorMessage(fieldId) {
        const errorMessage = document.querySelector(`#${fieldId} + .error-message`);
        if (errorMessage) {
            errorMessage.style.display = 'block';
        }
    }

    // Validate form fields
    function validateForm() {
        let isValid = true;
        hideErrorMessages();

        if (activityName.value.trim() === '') {
            isValid = false;
            showErrorMessage('activityName');
        }
        if (activityDescription.value.trim() === '') {
            isValid = false;
            showErrorMessage('activityDescription');
        }
        if (activityDate.value.trim() === '') {
            isValid = false;
            showErrorMessage('activityDate');
        }

        return isValid;
    }

    // Handle form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Validate form before submission
        if (validateForm()) {
            // Simulate saving data and show loading spinner
            saveBtn.disabled = true; // Disable the submit button to prevent multiple clicks
            const loadingText = document.createElement('p');
            loadingText.textContent = 'Saving... Please wait.';
            form.appendChild(loadingText);

            // Simulate an API call
            setTimeout(function() {
                // After "saving" data, remove loading message and reset the form
                form.reset();
                loadingText.remove();
                saveBtn.disabled = false;
                alert("Activity successfully added!");
                window.location.href = 'index.html'; // Redirect to main page after saving
            }, 2000);
        }
    });
});
