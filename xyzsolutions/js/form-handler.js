document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('quote-form');
    if (!form) return;

    const serviceType = document.getElementById('service_type');
    const frequencyOptions = document.getElementById('frequency-options');
    const additionalServices = document.getElementById('additional-services');
    const resultDiv = document.getElementById('form-result');
    const submitBtn = form.querySelector('button[type="submit"]');
    const selects = form.querySelectorAll('select');

    const fieldsToValidate = ['name', 'email', 'phone', 'service_area', 'service_type', 'message'];

    // Helper to validate a single field
    const validateField = (field) => {
        let isValid = true;
        field.classList.remove('valid', 'invalid');

        // Check for required fields (including select dropdowns)
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
        }

        // Check for valid email format
        if (isValid && field.type === 'email' && field.value.trim()) {
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        }

        // Check for valid phone format (simple check)
        if (isValid && field.type === 'tel' && field.value.trim()) {
            isValid = /^\+?(\d[\s-]?){8,14}\d$/.test(field.value);
        }
        
        // Apply class only if the field has been touched or has a value
        if (field.value.trim() || field.classList.contains('touched')) {
            field.classList.add(isValid ? 'valid' : 'invalid');
        }

        return isValid;
    };

    // Event listener for real-time validation
    fieldsToValidate.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            const eventType = field.tagName === 'SELECT' ? 'change' : 'input';
            field.addEventListener(eventType, () => {
                field.classList.add('touched'); // Mark as touched on interaction
                validateField(field);
            });
        }
    });

    // Event listener for dynamic field visibility based on service type
    if (serviceType) {
        serviceType.addEventListener('change', () => {
            const selected = serviceType.value;
            const showFrequency = ['regular_domestic', 'commercial_office', 'complex_common'].includes(selected);
            const showExtras = ['regular_domestic', 'deep_clean', 'move_in_out', 'airbnb'].includes(selected);

            if (frequencyOptions) frequencyOptions.classList.toggle('hidden', !showFrequency);
            if (additionalServices) additionalServices.classList.toggle('hidden', !showExtras);
        });
    }

    // Add 'has-value' class to selects for floating label styling
    selects.forEach(select => {
        select.addEventListener('change', () => {
            select.classList.toggle('has-value', !!select.value);
        });
    });

    // Form submission handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate all fields before submitting
        let isFormValid = true;
        fieldsToValidate.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.classList.add('touched'); // Mark all as touched to show errors
                if (!validateField(field)) {
                    isFormValid = false;
                }
            }
        });

        if (!isFormValid) {
            resultDiv.className = 'error';
            resultDiv.textContent = 'Please fill out all required fields correctly.';
            resultDiv.style.display = 'block';
            return;
        }

        // --- Handle Submission ---
        const formData = new FormData(form);
        const originalBtnText = submitBtn.innerHTML;
        
        resultDiv.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                resultDiv.className = 'success';
                resultDiv.textContent = data.message || "Success! Your quote request has been sent.";
                form.reset();
                // Clear all validation and helper classes
                form.querySelectorAll('.valid, .invalid, .has-value, .touched').forEach(el => el.classList.remove('valid', 'invalid', 'has-value', 'touched'));
                if (frequencyOptions) frequencyOptions.classList.add('hidden');
                if (additionalServices) additionalServices.classList.add('hidden');
            } else {
                resultDiv.className = 'error';
                resultDiv.textContent = data.message || "An error occurred. Please try again.";
            }
        } catch (error) {
            resultDiv.className = 'error';
            resultDiv.textContent = "A network error occurred. Please check your connection.";
        } finally {
            resultDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
});