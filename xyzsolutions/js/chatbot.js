function initializeChatbot() {
    // --- Element Selection ---
    const elements = {
        toggler: document.querySelector('.chatbot-toggler'),
        popup: document.querySelector('.chatbot-popup'),
        closeBtn: document.querySelector('.close-chatbot-btn'),
        messagesContainer: document.getElementById('messages'),
        composer: document.getElementById('composer'),
        input: document.getElementById('input'),
        quickbar: document.getElementById('quickbar'),
        typingIndicator: document.getElementById('typing'),
    };

    // --- Safety Check ---
    if (Object.values(elements).some(el => !el)) {
        console.error("Chatbot initialization failed: Missing required HTML elements.");
        return;
    }

    // --- Conversation Tree ---
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
            text: "<b>For Homes:</b><br>Regular upkeep, deep cleans, move-ins, and move-outs.<br>• Regular Domestic: Weekly/Bi-weekly<br>• End-of-Lease / Deep Clean<br>• Move-in / Move-out",
            options: [
                { text: "Get a Home Cleaning Quote", value: "quote_home" },
                { text: "Back to Services", value: "services" },
            ],
        },
        services_business: {
            text: "<b>For Businesses:</b><br>Clean workspaces are productive.<br>• Commercial & Office Spaces<br>• Complex & Common Areas",
            options: [
                { text: "Get a Business Quote", value: "quote_business" },
                { text: "Back to Services", value: "services" },
            ],
        },
        services_specialized: {
            text: "<b>Specialized Projects:</b><br>• Post-Construction Cleaning<br>• Event Clean-ups<br>• Airbnb & Holiday Rentals",
            options: [
                { text: "Quote for a Special Project", value: "quote_specialized" },
                { text: "Back to Services", value: "services" },
            ],
        },
        pricing: {
            text: "Transparent pricing options:",
            options: [
                { text: "Recurring (Essential)", value: "pricing_essential" },
                { text: "Once-Off (Classic)", value: "pricing_classic" },
                { text: "Commercial (Executive)", value: "pricing_executive" },
                { text: "⬅️ Main Menu", value: "greeting" },
            ],
        },
        pricing_essential: {
            text: "<b>Essential Plan:</b> Durban R95/hr | Johannesburg R105/hr. Weekly or bi-weekly scheduling.",
            options: [
                { text: "Book Recurring Service", value: "quote_home" },
                { text: "See Other Plans", value: "pricing" },
            ],
        },
        pricing_classic: {
            text: "<b>Classic Once-Off:</b> Deep cleans, move-ins, Airbnb. Starting from R350. Example: Studio R850-R3500.",
            options: [
                { text: "Get a Once-Off Quote", value: "quote_deepclean" },
                { text: "See Other Plans", value: "pricing" },
            ],
        },
        pricing_executive: {
            text: "<b>Executive Plan:</b> Tailored for large or specialized projects. Commercial: R8/m² | Post-Construction: per project | Team: R200-R450/hr",
            options: [
                { text: "Request Custom Quote", value: "quote_business" },
                { text: "See Other Plans", value: "pricing" },
            ],
        },
        quote_entry: {
            text: "What type of cleaning do you need?",
            options: [
                { text: "🏠 Home / Apartment", value: "quote_home" },
                { text: "🏢 Office / Commercial", value: "quote_business" },
                { text: "🏗️ Post-Construction", value: "quote_specialized" },
                { text: "🎉 Other", value: "quote_redirect" },
            ],
        },
        quote_home: {
            text: "Fill our quick form or call us for a precise home cleaning quote.",
            options: [
                { text: "📝 Go to Quote Form", value: "redirectToContact" },
                { text: "📞 Call Johannesburg", value: "call_jhb" },
                { text: "📞 Call Durban", value: "call_dbn" },
                { text: "⬅️ Main Menu", value: "greeting" },
            ],
        },
        quote_business: {
            text: "Custom commercial quotes available. Fill form or call to discuss.",
            options: [
                { text: "📝 Go to Quote Form", value: "redirectToContact" },
                { text: "📞 Call Johannesburg", value: "call_jhb" },
                { text: "📞 Call Durban", value: "call_dbn" },
                { text: "⬅️ Main Menu", value: "greeting" },
            ],
        },
        quote_specialized: {
            text: "Specialized projects require assessment. Fill form or call us.",
            options: [
                { text: "📝 Go to Quote Form", value: "redirectToContact" },
                { text: "📞 Call Johannesburg", value: "call_jhb" },
                { text: "📞 Call Durban", value: "call_dbn" },
                { text: "⬅️ Main Menu", value: "greeting" },
            ],
        },
        quote_deepclean: {
            text: "Deep/end-of-lease cleaning depends on size/condition. Use form for accurate pricing.",
            options: [
                { text: "📝 Go to Quote Form", value: "redirectToContact" },
                { text: "⬅️ Back to Pricing", value: "pricing" },
            ],
        },
        quote_redirect: {
            action: () => redirectTo('#contact', "Redirecting you to our quote page...")
        },
        contact: {
            text: "<b>Contact Us:</b><br>📞 Jhb: 07 123 4567<br>📞 Dbn: 07 123 4568<br>📧 Email: quotes@xyzsolutions.co.za<br>Hours: Mon-Fri 8-17, Sat 9-13",
            options: [
                { text: "📞 Call Jhb", value: "call_jhb" },
                { text: "📞 Call Dbn", value: "call_dbn" },
                { text: "📝 Get a Quote", value: "quote_entry" },
                { text: "⬅️ Main Menu", value: "greeting" },
            ],
        },
        call_jhb: {
            action: () => callNumber('071234567', 'Calling our Johannesburg team...')
        },
        call_dbn: {
            action: () => callNumber('071234568', 'Calling our Durban team...')
        },
        redirectToContact: {
            action: () => redirectTo('contact.html', "Redirecting you to the contact & quote page...")
        },
        default: {
            text: "I'm sorry, I didn't understand. Here are the main options:",
            options: [
                { text: "🧼 Services", value: "services" },
                { text: "💰 Get a Quote", value: "quote_entry" },
                { text: "💵 Pricing Info", value: "pricing" },
            ],
        },
    };

    // --- Utility Functions ---
    const toggleChatbot = () => elements.popup.classList.toggle('show');
    const showTyping = () => elements.typingIndicator.classList.remove('hidden');
    const hideTyping = () => elements.typingIndicator.classList.add('hidden');

    const addMessage = (sender, text) => {
        const msg = document.createElement('div');
        msg.className = `message ${sender}`;
        msg.innerHTML = `<p>${text}</p>`;
        elements.messagesContainer.appendChild(msg);
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
    };

    const renderOptions = (options) => {
        elements.quickbar.innerHTML = '';
        if (!options) return;
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'quick-reply';
            btn.innerHTML = opt.text;
            btn.dataset.value = opt.value;
            elements.quickbar.appendChild(btn);
        });
    };

    const processResponse = (key, showTypingEffect = true) => {
        elements.quickbar.innerHTML = '';
        const res = conversationTree[key] || conversationTree.default;

        if (res.action) return res.action();

        const display = () => {
            addMessage('bot', res.text);
            renderOptions(res.options);
        };

        if (showTypingEffect) {
            showTyping();
            setTimeout(() => { hideTyping(); display(); }, 1000);
        } else {
            display();
        }
    };

    const handleFreeTextInput = (input) => {
        const text = input.toLowerCase();
        const mapping = [
            { keywords: ['quote', 'cost'], key: 'quote_entry' },
            { keywords: ['price', 'how much'], key: 'pricing' },
            { keywords: ['service', 'clean'], key: 'services' },
            { keywords: ['home', 'house', 'domestic'], key: 'services_home' },
            { keywords: ['office', 'business', 'commercial'], key: 'services_business' },
            { keywords: ['construction', 'airbnb', 'event'], key: 'services_specialized' },
            { keywords: ['contact', 'phone', 'email', 'hours'], key: 'contact' },
            { keywords: ['hi', 'hello'], key: 'greeting' },
        ];

        for (const map of mapping) {
            if (map.keywords.some(k => text.includes(k))) return processResponse(map.key);
        }
        processResponse('default');
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const userInput = elements.input.value.trim();
        if (!userInput) return;
        addMessage('user', userInput);
        elements.input.value = '';
        handleFreeTextInput(userInput);
    };

    const handleQuickReply = (e) => {
        if (!e.target.classList.contains('quick-reply')) return;
        addMessage('user', e.target.textContent);
        processResponse(e.target.dataset.value);
    };

    const callNumber = (number, msg) => {
        addMessage('bot', msg);
        window.location.href = `tel:${number}`;
        setTimeout(() => processResponse('contact', false), 500);
    };

    const redirectTo = (url, msg) => {
        addMessage('bot', msg);
        setTimeout(() => { window.location.href = url; }, 1000);
    };

    // --- Event Listeners ---
    elements.toggler.addEventListener('click', toggleChatbot);
    elements.closeBtn.addEventListener('click', toggleChatbot);
    elements.quickbar.addEventListener('click', handleQuickReply);
    elements.composer.addEventListener('submit', handleFormSubmit);

    // --- Initial Greeting ---
    setTimeout(() => processResponse('greeting', false), 500);
}

// --- Initialize once DOM is ready ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
    initializeChatbot();
}
