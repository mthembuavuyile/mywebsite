function initializeChatbot() {
    const toggler = document.querySelector('.chatbot-toggler');
    const popup = document.querySelector('.chatbot-popup');
    const closeBtn = document.querySelector('.close-chatbot-btn');
    const messagesContainer = document.getElementById('messages');
    const composer = document.getElementById('composer');
    const input = document.getElementById('input');
    const quickbar = document.getElementById('quickbar');
    const typingIndicator = document.getElementById('typing');

    // Ensure all elements exist before proceeding
    if (!toggler || !popup || !closeBtn || !messagesContainer || !composer || !input || !quickbar || !typingIndicator) {
        console.error("Chatbot initialization failed: One or more required elements are missing.");
        return;
    }

    const conversationTree = {
        greeting: {
            text: "Welcome to <b>XYZSolutions</b>! How can I help you today?",
            options: [
                { text: "🧼 Our Services", value: "services" },
                { text: "💰 Get a Quote", value: "quote" },
                { text: "📍 Contact Info", value: "contact" },
            ],
        },
        services: {
            text: "We offer a wide range of cleaning services! What are you interested in?",
            options: [
                { text: "Residential", value: "residential" },
                { text: "Commercial", value: "commercial" },
                { text: "Specialized", value: "specialized" },
                { text: "Go Back", value: "greeting" },
            ],
        },
        residential: {
            text: "For homes, we offer regular domestic cleaning, deep cleans, and move-in/out services. You can learn more on our <a href='services.html'>services page</a>.",
            options: [{ text: "Back to Services", value: "services" }, {text: "Main Menu", value: "greeting"}],
        },
        commercial: {
            text: "We clean offices, retail spaces, and common areas for body corporates. Check out our <a href='services.html'>services page</a> for more details.",
            options: [{ text: "Back to Services", value: "services" }, {text: "Main Menu", value: "greeting"}],
        },
        specialized: {
            text: "Our specialized services include post-construction, event cleanups, and Airbnb turnovers. Find out more on our <a href='services.html'>services page</a>.",
            options: [{ text: "Back to Services", value: "services" }, {text: "Main Menu", value: "greeting"}],
        },
        quote: {
            text: "Great! The best way to get an accurate quote is to fill out our contact form. It only takes a minute!",
            options: [
                { text: "📝 Go to Quote Form", value: "redirectToContact" },
                { text: "Go Back", value: "greeting" },
            ],
        },
        redirectToContact: {
            action: () => {
                addMessage('bot', "Redirecting you to the contact page...");
                setTimeout(() => { window.location.href = 'contact.html'; }, 1000);
            }
        },
        contact: {
            text: "You can call us at <b>071 234 567 (Jhb)</b> or <b>071 234 568 (Dbn)</b>. We're open Mon-Fri 8am-5pm. Or, visit our <a href='contact.html'>contact page</a>.",
            options: [{ text: "Main Menu", value: "greeting" }],
        },
        default: {
            text: "I'm not sure how to answer that. Here are the main things I can help with:",
            options: [
                { text: "🧼 Our Services", value: "services" },
                { text: "💰 Get a Quote", value: "quote" },
                { text: "📍 Contact Info", value: "contact" },
            ],
        },
    };

    const toggleChatbot = () => popup.classList.toggle('show');

    const showTyping = () => {
        typingIndicator.classList.remove('hidden');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };
    
    const hideTyping = () => typingIndicator.classList.add('hidden');

    const addMessage = (sender, text) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        messageElement.innerHTML = `<p>${text}</p>`;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    const handleQuickReply = (e) => {
        if (e.target.classList.contains('quick-reply')) {
            const value = e.target.dataset.value;
            const text = e.target.textContent;
            addMessage('user', text);
            processResponse(value);
        }
    };

    const renderOptions = (options) => {
        quickbar.innerHTML = '';
        if (!options) return;
        options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('quick-reply');
            button.textContent = option.text;
            button.dataset.value = option.value;
            quickbar.appendChild(button);
        });
    };

    const processResponse = (key) => {
        quickbar.innerHTML = '';
        const response = conversationTree[key] || conversationTree.default;

        if (response.action) {
            response.action();
            return;
        }

        showTyping();
        setTimeout(() => {
            hideTyping();
            addMessage('bot', response.text);
            renderOptions(response.options);
        }, 1000);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const userInput = input.value.trim();
        if (userInput) {
            addMessage('user', userInput);
            input.value = '';
            // Basic keyword matching
            const lowerInput = userInput.toLowerCase();
            if (lowerInput.includes('service') || lowerInput.includes('clean')) {
                 processResponse('services');
            } else if (lowerInput.includes('quote') || lowerInput.includes('price')) {
                 processResponse('quote');
            } else if (lowerInput.includes('contact') || lowerInput.includes('phone')) {
                 processResponse('contact');
            } else {
                processResponse('default');
            }
        }
    };

    // --- Event Listeners ---
    toggler.addEventListener('click', toggleChatbot);
    closeBtn.addEventListener('click', toggleChatbot);
    quickbar.addEventListener('click', handleQuickReply);
    composer.addEventListener('submit', handleFormSubmit);

    // --- Start the conversation on first load ---
    setTimeout(() => {
        addMessage('bot', conversationTree.greeting.text);
        renderOptions(conversationTree.greeting.options);
    }, 500);
}

// This function call is deferred until chatbot.html is loaded by main.js
// If chatbot.js is loaded directly on a page with the HTML already present, this will still work.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
    // If main.js hasn't run yet to create the chatbot elements, wait for it.
    // If it has, this check ensures initialization happens.
    if (!document.querySelector('.chatbot-toggler')) {
        // Let main.js handle the initialization after fetch.
    } else {
        initializeChatbot();
    }
}