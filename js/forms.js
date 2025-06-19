// Define your Google Apps Script Web App URL once
// **IMPORTANT: Replace this with your ACTUAL deployed Web App URL.**
const scriptURL = 'https://script.google.com/macros/s/AKfycbxJdbtt1063BtOFN21DhvugfS98YilCBENDnwVGpmTVgGRANQBVL7LHbprUpA7a9bfBbw/exec'; // Your actual script URL

// --- Helper function to handle form submissions ---
// This function takes the form element and its corresponding status display element
// and sets up the event listener for submission.
function handleFormSubmission(formElement, statusElement, sendingMessage, successMessage, errorMessage) {
    if (!formElement || !statusElement) {
        console.error('Error: Form element or status element not found for a submission handler.');
        return;
    }

    formElement.addEventListener('submit', async e => {
        e.preventDefault(); // Prevent default form submission (page reload)

        // Display a "sending" message
        statusElement.innerHTML = `<div class="alert alert-info">${sendingMessage || 'Sending...'}</div>`;

        const formData = new FormData(formElement);
        // Convert FormData to a plain object for URLSearchParams.
        // This ensures all form fields, including the hidden 'formType', are included.
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch(scriptURL, {
                method: 'POST',
                body: new URLSearchParams(data), // Properly encode form data for POST request
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            if (!response.ok) {
                // If the HTTP response is not ok (e.g., 404, 500), throw an error
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text(); // Get the response text ("success" or "error:...")

            // Check the exact response from Apps Script
            if (text.trim() === "success") {
                statusElement.innerHTML = `<div class="alert alert-success">${successMessage || 'Thank you! Your submission has been received.'}</div>`;
                formElement.reset(); // Clear the form fields on success
            } else {
                // Handle specific errors from Apps Script (e.g., "error:sheet_not_found")
                statusElement.innerHTML = `<div class="alert alert-danger">${errorMessage || 'Oops! There was an error submitting your form. Please try again.'}</div>`;
                console.error('Apps Script Response (Error):', text); // Log the specific error from Apps Script
            }
        } catch (error) {
            // Handle network errors or other fetch issues
            console.error('Fetch Error:', error.message);
            statusElement.innerHTML = `<div class="alert alert-danger">Network error or script issue: ${error.message}. Please try again later.</div>`;
        }
    });
}

// --- Initialize each form using the helper function ---
// Ensure your HTML forms have the specified IDs and corresponding status divs.
// Also, each form MUST contain a hidden input field named "formType"
// e.g., <input type="hidden" name="formType" value="contact">

document.addEventListener('DOMContentLoaded', () => { // Ensure DOM is fully loaded before trying to access elements

    // 1. Contact Form
    const contactForm = document.getElementById('contactForm');
    const contactFormStatus = document.getElementById('contactFormStatus');
    if (contactForm && contactFormStatus) {
        handleFormSubmission(
            contactForm,
            contactFormStatus,
            'Sending message...',
            'Thank you! Your message has been sent.',
            'Oops! There was an error sending your message. Please try again.'
        );
    } else {
        console.warn('Contact form or status element not found. Contact form submission will not be active.');
    }


    // 2. Booking Form
    const bookingForm = document.getElementById('bookingForm');
    const bookingFormStatus = document.getElementById('bookingFormStatus');
    if (bookingForm && bookingFormStatus) {
        handleFormSubmission(
            bookingForm,
            bookingFormStatus,
            'Sending booking request...',
            'Thank you! Your booking request has been received.',
            'Oops! There was an error with your booking request. Please try again.'
        );
    } else {
        console.warn('Booking form or status element not found. Booking form submission will not be active.');
    }

    // 3. Newsletter Form
    const newsletterForm = document.getElementById('newsletterForm');
    const newsletterFormStatus = document.getElementById('newsletterFormStatus');
    if (newsletterForm && newsletterFormStatus) {
        handleFormSubmission(
            newsletterForm,
            newsletterFormStatus,
            'Subscribing...',
            'Thank you for subscribing to our newsletter!',
            'Oops! There was an error with your newsletter subscription. Please try again.'
        );
    } else {
        console.warn('Newsletter form or status element not found. Newsletter form submission will not be active.');
    }

});