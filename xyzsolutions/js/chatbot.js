function initializeChatbot() {
    // --- Element Selection ---
    const toggler = document.querySelector('.chatbot-toggler');
    const popup = document.querySelector('.chatbot-popup');
    const closeBtn = document.querySelector('.close-chatbot-btn');
    const messagesContainer = document.getElementById('messages');
    const composer = document.getElementById('composer');
    const input = document.getElementById('input');
    const quickbar = document.getElementById('quickbar');
    const typingIndicator = document.getElementById('typing');

    // --- Safety Check ---
    if (!toggler || !popup || !closeBtn || !messagesContainer || !composer || !input || !quickbar || !typingIndicator) {
        console.error("Chatbot initialization failed: One or more required HTML elements are missing.");
        return;
    }

    // --- Conversation Tree (Content Model) ---
    const conversationTree = {
        greeting: {
            text: "😊 Hello and welcome to <b>XYZSolutions & Projects</b>! Your partner for professional cleaning in Durban & Johannesburg. How can I assist you today?",
            options: [
                { text: "💰 Get a Quote", value: "quote_entry" },
                { text: "🧼 Explore Services", value: "services" },
                { text: "💵 View Pricing", value: "pricing" },
                { text: "📞 Contact & Hours", value: "contact" },
            ],
        },

        // --- Services Flow ---
        services: {
            text: "We offer a complete range of cleaning solutions.<br>What type of service are you looking for?",
            options: [
                { text: "🏠 Home Cleaning", value: "services_home" },
                { text: "🏢 Business Cleaning", value: "services_business" },
                { text: "✨ Specialized Projects", value: "services_specialized" },
                { text: "⬅️ Main Menu", value: "greeting" },
            ],
        },

        services_home: {
            text: "<b>For Homes:</b><br><br>" +
                "We handle everything from regular upkeep to intensive deep cleans.<br>" +
                "Our services include:<br><br>" +
                "• <b>Regular Domestic:</b> Weekly or bi-weekly cleaning.<br>" +
                "• <b>End-of-Lease / Deep Clean:</b> For moving or a fresh start.<br>" +
                "• <b>Move-in / Move-out:</b> Simplify your moving process.<br>",
            options: [
                { text: "Get a Home Cleaning Quote", value: "quote_home" },
                { text: "Back to Services", value: "services" },
            ],
        },

        services_business: {
            text: "<b>For Businesses:</b><br><br>" +
                "A clean workspace is a productive one.<br>" +
                "We offer:<br><br>" +
                "• <b>Commercial & Office:</b> For offices, retail, and corporate spaces.<br>" +
                "• <b>Complex & Common Areas:</b> For body corporates.<br>",
            options: [
                { text: "Get a Business Quote", value: "quote_business" },
                { text: "Back to Services", value: "services" },
            ],
        },

        services_specialized: {
            text: "<b>Specialized Projects:</b><br><br>" +
                "We have the expertise for unique cleaning challenges:<br><br>" +
                "• <b>Post-Construction:</b> Removing fine dust and debris.<br>" +
                "• <b>Event Clean-ups:</b> Pre- and post-event services.<br>" +
                "• <b>Airbnb & Holiday Rentals:</b> Fast, reliable turnovers.<br>",
            options: [
                { text: "Quote for a Special Project", value: "quote_specialized" },
                { text: "Back to Services", value: "services" },
            ],
        },

        // --- Pricing Flow ---
        pricing: {
            text: "We offer clear, transparent pricing.<br>Here’s a breakdown of our plans:",
            options: [
                { text: "Recurring (Essential)", value: "pricing_essential" },
                { text: "Once-Off (Classic)", value: "pricing_classic" },
                { text: "Commercial (Executive)", value: "pricing_executive" },
                { text: "⬅️ Main Menu", value: "greeting" },
            ],
        },

        pricing_essential: {
            text: "<b>Essential Plan (Recurring):</b><br><br>" +
                "Ideal for consistent upkeep of homes & small offices.<br><br>" +
                "• <b>Durban:</b> from R95/hr<br>" +
                "• <b>Johannesburg:</b> from R105/hr<br><br>" +
                "This plan uses flexible weekly or bi-weekly scheduling.",
            options: [
                { text: "Book Recurring Service", value: "quote_home" },
                { text: "See Other Plans", value: "pricing" },
            ],
        },

        pricing_classic: {
            text: "<b>Classic Comprehensive (Once-Off):</b><br><br>" +
                "Perfect for deep cleans, move-ins, and Airbnb turnovers.<br>" +
                "Pricing is based on space size and type, starting from R350.<br><br>" +
                "<i>Example: A studio apartment deep clean can range from R850 to R3500.</i>",
            options: [
                { text: "Get a Once-Off Quote", value: "quote_deepclean" },
                { text: "See Other Plans", value: "pricing" },
            ],
        },

        pricing_executive: {
            text: "<b>Executive Plan (Custom):</b><br><br>" +
                "Tailored for large-scale and specialized projects.<br><br>" +
                "• <b>Commercial Contracts:</b> from R8/m²<br>" +
                "• <b>Post-Construction:</b> Per-project basis<br>" +
                "• <b>Custom Team Rates:</b> R200-R450 p/hr<br>",
            options: [
                { text: "Request Custom Quote", value: "quote_business" },
                { text: "See Other Plans", value: "pricing" },
            ],
        },


        // --- Quote Flow ---
        quote_entry: {
            text: "Excellent! To give you the most accurate quote, could you tell me what type of cleaning you need?",
            options: [
                { text: "🏠 Home / Apartment", value: "quote_home" },
                { text: "🏢 Office / Commercial", value: "quote_business" },
                { text: "🏗️ Post-Construction", value: "quote_specialized" },
                { text: "🎉 Other", value: "quote_redirect" },
            ],
        },
        quote_home: {
            text: "For home cleaning, the best way to get a precise quote is to fill out our quick form. Or you can call us directly!",
            options: [
                { text: "📝 Go to Quote Form", value: "redirectToContact" },
                { text: "📞 Call Johannesburg", value: "call_jhb" },
                { text: "📞 Call Durban", value: "call_dbn" },
                { text: "⬅️ Main Menu", value: "greeting" },
            ],
        },
        quote_business: {
            text: "For commercial spaces, we provide a custom quote after understanding your needs. Please fill out our form or call us to discuss.",
            options: [
                { text: "📝 Go to Quote Form", value: "redirectToContact" },
                { text: "📞 Call Johannesburg", value: "call_jhb" },
                { text: "📞 Call Durban", value: "call_dbn" },
                { text: "⬅️ Main Menu", value: "greeting" },
            ],
        },
        quote_specialized: {
            text: "Specialized projects like post-construction require a detailed assessment. Let's connect! You can fill out our form or call us.",
            options: [
                { text: "📝 Go to Quote Form", value: "redirectToContact" },
                { text: "📞 Call Johannesburg", value: "call_jhb" },
                { text: "📞 Call Durban", value: "call_dbn" },
                { text: "⬅️ Main Menu", value: "greeting" },
            ],
        },
        quote_deepclean: {
            text: "A deep clean or end-of-lease clean depends on the size and condition. For an accurate price, please use our quote form.",
            options: [
                { text: "📝 Go to Quote Form", value: "redirectToContact" },
                { text: "⬅️ Back to Pricing", value: "pricing" },
            ],
        },
        quote_redirect: {
            action: () => {
                addMessage('bot', "No problem. Redirecting you to our quote page now...");
                setTimeout(() => { window.location.href = 'contact.html'; }, 1500);
            }
        },

        // --- Contact & Hours ---
        contact: {
            text: "<b>Get in Touch:</b><br><br>📞 <b>Johannesburg:</b> 07 123 4567<br>📞 <b>Durban:</b> 07 123 4568<br>📧 <b>Email:</b> quotes@xyzsolutions.co.za<br><br><b>Business Hours:</b><br>Mon–Fri: 8:00 AM – 5:00 PM<br>Sat: 9:00 AM – 1:00 PM",
            options: [
                { text: "📞 Call Jhb", value: "call_jhb" },
                { text: "📞 Call Dbn", value: "call_dbn" },
                { text: "📝 Get a Quote", value: "quote_entry" },
                { text: "⬅️ Main Menu", value: "greeting" },
            ],
        },

        // --- Actions ---
        call_jhb: {
            action: () => {
                addMessage('bot', "Calling our Johannesburg team...");
                window.location.href = 'tel:071234567';
                // Re-display contact options after action
                setTimeout(() => processResponse('contact', false), 500);
            }
        },
        call_dbn: {
            action: () => {
                addMessage('bot', "Calling our Durban team...");
                window.location.href = 'tel:071234568';
                // Re-display contact options after action
                setTimeout(() => processResponse('contact', false), 500);
            }
        },
        redirectToContact: {
            action: () => {
                addMessage('bot', "Redirecting you to the contact & quote page...");
                setTimeout(() => { window.location.href = 'contact.html'; }, 1000);
            }
        },

        // --- Fallback ---
        default: {
            text: "I'm sorry, I didn't quite understand that. Here are the main things I can help with:",
            options: [
                { text: "🧼 Our Services", value: "services" },
                { text: "💰 Get a Quote", value: "quote_entry" },
                { text: "💵 Pricing Info", value: "pricing" },
            ],
        },
    };

    // --- Helper Functions ---
    const toggleChatbot = () => popup.classList.toggle('show');
    const showTyping = () => typingIndicator.classList.remove('hidden');
    const hideTyping = () => typingIndicator.classList.add('hidden');

    const addMessage = (sender, text) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        messageElement.innerHTML = `<p>${text}</p>`;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    const renderOptions = (options) => {
        quickbar.innerHTML = '';
        if (!options) return;
        options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('quick-reply');
            button.innerHTML = option.text; // Use .innerHTML to render the <i> tag
            button.dataset.value = option.value;
            quickbar.appendChild(button);
        });
    };

    const processResponse = (key, showTypingEffect = true) => {
        quickbar.innerHTML = '';
        const response = conversationTree[key] || conversationTree.default;

        if (response.action) {
            response.action();
            return;
        }

        if (showTypingEffect) {
            showTyping();
            setTimeout(() => {
                hideTyping();
                addMessage('bot', response.text);
                renderOptions(response.options);
            }, 1000);
        } else {
            addMessage('bot', response.text);
            renderOptions(response.options);
        }
    };

    const handleFreeTextInput = (userInput) => {
        const lowerInput = userInput.toLowerCase();

        // More robust keyword matching
        if (lowerInput.includes('quote') || lowerInput.includes('cost')) {
            processResponse('quote_entry');
        } else if (lowerInput.includes('price') || lowerInput.includes('how much')) {
            processResponse('pricing');
        } else if (lowerInput.includes('service') || lowerInput.includes('clean')) {
            processResponse('services');
        } else if (lowerInput.includes('home') || lowerInput.includes('house') || lowerInput.includes('domestic')) {
            processResponse('services_home');
        } else if (lowerInput.includes('office') || lowerInput.includes('business') || lowerInput.includes('commercial')) {
            processResponse('services_business');
        } else if (lowerInput.includes('construction') || lowerInput.includes('airbnb') || lowerInput.includes('event')) {
            processResponse('services_specialized');
        } else if (lowerInput.includes('contact') || lowerInput.includes('phone') || lowerInput.includes('email') || lowerInput.includes('hours')) {
            processResponse('contact');
        } else if (lowerInput.includes('hi') || lowerInput.includes('hello')) {
            processResponse('greeting');
        } else {
            processResponse('default');
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const userInput = input.value.trim();
        if (userInput) {
            addMessage('user', userInput);
            input.value = '';
            handleFreeTextInput(userInput);
        }
    };

    const handleQuickReply = (e) => {
        if (e.target.classList.contains('quick-reply')) {
            const value = e.target.dataset.value;
            const text = e.target.textContent;
            addMessage('user', text);
            processResponse(value);
        }
    };

    // --- Event Listeners ---
    toggler.addEventListener('click', toggleChatbot);
    closeBtn.addEventListener('click', toggleChatbot);
    quickbar.addEventListener('click', handleQuickReply);
    composer.addEventListener('submit', handleFormSubmit);

    // --- Initial Greeting ---
    setTimeout(() => {
        processResponse('greeting', false); // Start without a typing effect for the first message
    }, 500);
}

// --- Initialize the chatbot once the DOM is ready ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
    initializeChatbot();
}