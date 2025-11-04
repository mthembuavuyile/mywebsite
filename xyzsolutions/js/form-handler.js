document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('quote-form');
    if (!form) return;

    const serviceType = document.getElementById('service_type');
    const frequencyOptions = document.getElementById('frequency-options');
    const additionalServices = document.getElementById('additional-services');
    const resultDiv = document.getElementById('form-result');

    const fieldsToValidate = ['name', 'email', 'phone', 'service_area', 'service_type', 'message'];

    // --- DYNAMIC FIELD VISIBILITY ---
    serviceType.addEventListener('change', () => {
        const selectedService = serviceType.value;
        const showFrequency = ['regular_domestic', 'commercial_office', 'complex_common'].includes(selectedService);
        const showExtras = ['regular_domestic', 'deep_clean', 'move_in_out', 'airbnb'].includes(selectedService);

        frequencyOptions.classList.toggle('hidden', !showFrequency);
        additionalServices.classList.toggle('hidden', !showExtras);
    });

    // --- REAL-TIME VALIDATION ---
    fieldsToValidate.forEach(fieldName => {
        const input = document.getElementById(fieldName);
        if (input) {
            input.addEventListener('input', () => {
                validateField(input);
            });
        }
    });

    function validateField(input) {
        let isValid = true;
        input.classList.remove('valid', 'invalid');

        if (input.required && input.value.trim() === '') {
            isValid = false;
        } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
            isValid = false;
        } else if (input.type === 'tel' && !/^\d{10,}$/.test(input.value.replace(/\s/g, ''))) {
            isValid = false;
        }

        if(input.value.trim() !== '') {
            input.classList.add(isValid ? 'valid' : 'invalid');
        }
        return isValid;
    }

    // --- FORM SUBMISSION HANDLING ---
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        let isFormValid = true;
        fieldsToValidate.forEach(fieldName => {
            const input = document.getElementById(fieldName);
            if (input && !validateField(input)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            resultDiv.className = 'error';
            resultDiv.innerHTML = 'Please correct the errors before submitting.';
            return;
        }

        const formData = new FormData(form);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        resultDiv.className = '';
        resultDiv.innerHTML = 'Sending, please wait...';
        resultDiv.style.display = 'block';

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            });

            const result = await response.json();

            if (result.success) {
                resultDiv.className = 'success';
                resultDiv.innerHTML = "Thank you! Your quote request has been sent successfully.";
                form.reset();
                // Clear validation classes
                fieldsToValidate.forEach(fieldName => {
                   document.getElementById(fieldName)?.classList.remove('valid', 'invalid');
                });
                // Hide dynamic sections
                frequencyOptions.classList.add('hidden');
                additionalServices.classList.add('hidden');
            } else {
                console.error('Submission error:', result);
                resultDiv.className = 'error';
                resultDiv.innerHTML = result.message || 'An error occurred. Please try again.';
            }
        } catch (error) {
            console.error('Fetch error:', error);
            resultDiv.className = 'error';
            resultDiv.innerHTML = 'An unexpected error occurred. Please check your connection and try again.';
        }
    });
});