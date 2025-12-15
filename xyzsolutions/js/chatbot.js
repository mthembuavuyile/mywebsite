function initializeChatbot() {
    // --- Icon Mapping (DRY approach using Font Awesome) ---
    const icons = {
        quote: 'fa-solid fa-file-invoice-dollar',
        services: 'fa-solid fa-broom',
        pricing: 'fa-solid fa-tags',
        contact: 'fa-solid fa-phone',
        home: 'fa-solid fa-house',
        business: 'fa-solid fa-building',
        specialized: 'fa-solid fa-sparkles',
        back: 'fa-solid fa-arrow-left',
        recurring: 'fa-solid fa-rotate',
        onceoff: 'fa-solid fa-star',
        commercial: 'fa-solid fa-briefcase',
        form: 'fa-solid fa-file-lines',
        phone_jhb: 'fa-solid fa-phone',
        phone_dbn: 'fa-solid fa-phone',
        whatsapp: 'fa-brands fa-whatsapp',
        email: 'fa-solid fa-envelope',
        construction: 'fa-solid fa-hammer',
        event: 'fa-solid fa-champagne-glasses',
        airbnb: 'fa-solid fa-key',
        moveout: 'fa-solid fa-truck-moving',
        compare: 'fa-solid fa-chart-bar',
        custom: 'fa-solid fa-pen-to-square',
    };

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

    // --- Image Mapping ---
    const serviceImages = {
        regular_domestic: 'images/regular-domestic.jpeg',
        commercial_office: 'images/commercial-office.jpeg',
        end_of_lease: 'images/end-of-lease-deep.jpeg',
        airbnb: 'images/airbnb-cleanups.jpeg',
        event: 'images/event-cleanups.jpeg',
        construction: 'images/construction-cleanups.jpeg',
        move_in_out: 'images/move-in-or-out.jpeg',
        complex: 'images/complex-common-areas.jpeg',
        specialized: 'images/storage-specialized.jpeg',
    };

    // Helper to create icon HTML
    const icon = (key) => `<i class="${icons[key] || icons.services}"></i>`;

    // --- Conversation Tree ---
    const conversationTree = {
        greeting: {
            text: "👋 Hello and welcome to <b>XYZSolutions & Projects</b>! Your partner for professional cleaning in Durban & Johannesburg. How can I assist you today?",
            options: [
                { text: `${icon('quote')} Get a Quote`, value: "quote_entry" },
                { text: `${icon('services')} Explore Services`, value: "services" },
                { text: `${icon('pricing')} View Pricing`, value: "pricing" },
                { text: `${icon('contact')} Contact & Hours`, value: "contact" },
            ],
        },
        services: {
            text: "We offer a complete range of cleaning solutions.<br>What type of service are you looking for?",
            options: [
                { text: `${icon('home')} Home Cleaning`, value: "services_home" },
                { text: `${icon('business')} Business Cleaning`, value: "services_business" },
                { text: `${icon('specialized')} Specialized Projects`, value: "services_specialized" },
                { text: `${icon('back')} Main Menu`, value: "greeting" },
            ],
        },
        services_home: {
            text: "<b>For Homes:</b><br>We keep your home sparkling clean with flexible options:",
            images: [serviceImages.regular_domestic, serviceImages.move_in_out],
            details: [
                "• <b>Regular Domestic:</b> Weekly/Bi-weekly maintenance",
                "• <b>End-of-Lease / Deep Clean:</b> Thorough cleaning for moving",
                "• <b>Move-in / Move-out:</b> Fresh start for new beginnings"
            ],
            options: [
                { text: `${icon('quote')} Get a Home Quote`, value: "quote_home" },
                { text: `${icon('pricing')} View Home Pricing`, value: "pricing_essential" },
                { text: `${icon('back')} Back to Services`, value: "services" },
            ],
        },
        services_business: {
            text: "<b>For Businesses:</b><br>Clean workspaces boost productivity and professionalism.",
            images: [serviceImages.commercial_office, serviceImages.complex],
            details: [
                "• <b>Commercial & Office Spaces:</b> Daily or weekly cleaning",
                "• <b>Complex & Common Areas:</b> Lobbies, hallways, shared spaces",
                "• <b>Customized Schedules:</b> Work around your business hours"
            ],
            options: [
                { text: `${icon('quote')} Get a Business Quote`, value: "quote_business" },
                { text: `${icon('pricing')} View Commercial Pricing`, value: "pricing_executive" },
                { text: `${icon('back')} Back to Services`, value: "services" },
            ],
        },
        services_specialized: {
            text: "<b>Specialized Projects:</b><br>Expert solutions for unique cleaning needs.",
            images: [serviceImages.construction, serviceImages.event, serviceImages.airbnb],
            details: [
                "• <b>Post-Construction:</b> Remove debris and make it move-in ready",
                "• <b>Event Clean-ups:</b> Before and after event services",
                "• <b>Airbnb & Holiday Rentals:</b> Quick turnarounds for guests"
            ],
            options: [
                { text: `${icon('quote')} Quote for Special Project`, value: "quote_specialized" },
                { text: `${icon('back')} Back to Services`, value: "services" },
            ],
        },
        pricing: {
            text: `${icon('pricing')} <b>Transparent Pricing Options:</b><br>Choose the plan that fits your needs:`,
            options: [
                { text: `${icon('recurring')} Recurring (Essential)`, value: "pricing_essential" },
                { text: `${icon('onceoff')} Once-Off (Classic)`, value: "pricing_classic" },
                { text: `${icon('commercial')} Commercial (Executive)`, value: "pricing_executive" },
                { text: `${icon('back')} Main Menu`, value: "greeting" },
            ],
        },
        pricing_essential: {
            text: "<b>💚 Essential Plan - Recurring Service:</b>",
            images: [serviceImages.regular_domestic],
            details: [
                "📍 <b>Durban:</b> R95/hour",
                "📍 <b>Johannesburg:</b> R105/hour",
                "✅ Perfect for weekly or bi-weekly scheduling",
                "✅ Consistent cleaner for your home",
                "✅ Flexible rescheduling options"
            ],
            options: [
                { text: `${icon('form')} Book Recurring Service`, value: "quote_home" },
                { text: `${icon('compare')} Compare Other Plans`, value: "pricing" },
                { text: `${icon('back')} Main Menu`, value: "greeting" },
            ],
        },
        pricing_classic: {
            text: `<b>${icon('onceoff')} Classic Once-Off:</b>`,
            images: [serviceImages.end_of_lease, serviceImages.airbnb],
            details: [
                "🏠 Deep cleans, move-ins/outs, Airbnb turnovers",
                "💰 <b>Starting from R350</b>",
                "📏 <b>Example Pricing:</b>",
                "  - Studio/1-Bed: R850 - R1,500",
                "  - 2-Bedroom: R1,500 - R2,500",
                "  - 3-Bedroom: R2,500 - R3,500+",
                "⏱️ Pricing varies by size, condition & location"
            ],
            options: [
                { text: `${icon('quote')} Get Exact Quote`, value: "quote_deepclean" },
                { text: `${icon('compare')} Compare Other Plans`, value: "pricing" },
                { text: `${icon('back')} Main Menu`, value: "greeting" },
            ],
        },
        pricing_executive: {
            text: `<b>${icon('commercial')} Executive Plan - Commercial & Specialized:</b>`,
            images: [serviceImages.commercial_office, serviceImages.construction],
            details: [
                "🏢 <b>Commercial Spaces:</b> R8/m²",
                "🏗️ <b>Post-Construction:</b> Custom per project",
                "👥 <b>Team Rate:</b> R200-R450/hour (depending on team size)",
                "📋 Tailored solutions for large-scale projects",
                "🤝 Dedicated account manager"
            ],
            options: [
                { text: `${icon('custom')} Request Custom Quote`, value: "quote_business" },
                { text: `${icon('compare')} Compare Other Plans`, value: "pricing" },
                { text: `${icon('back')} Main Menu`, value: "greeting" },
            ],
        },
        quote_entry: {
            text: `${icon('quote')} <b>Let's get you a quote!</b><br>What type of cleaning do you need?`,
            options: [
                { text: `${icon('home')} Home / Apartment`, value: "quote_home" },
                { text: `${icon('business')} Office / Commercial`, value: "quote_business" },
                { text: `${icon('construction')} Post-Construction`, value: "quote_specialized" },
                { text: `${icon('event')} Event / Airbnb`, value: "quote_specialized" },
                { text: `${icon('back')} Back`, value: "greeting" },
            ],
        },
        quote_home: {
            text: `${icon('home')} <b>Home Cleaning Quote:</b><br>Fill our quick form or call us for a personalized quote.`,
            images: [serviceImages.regular_domestic],
            options: [
                { text: `${icon('form')} Fill Quote Form`, value: "redirectToContact" },
                { text: `${icon('phone_jhb')} Call Johannesburg`, value: "call_jhb" },
                { text: `${icon('phone_dbn')} Call Durban`, value: "call_dbn" },
                { text: `${icon('whatsapp')} WhatsApp Us`, value: "whatsapp" },
                { text: `${icon('back')} Main Menu`, value: "greeting" },
            ],
        },
        quote_business: {
            text: `${icon('business')} <b>Commercial Cleaning Quote:</b><br>Let's discuss your business needs. Fill the form or call us directly.`,
            images: [serviceImages.commercial_office],
            options: [
                { text: `${icon('form')} Fill Quote Form`, value: "redirectToContact" },
                { text: `${icon('phone_jhb')} Call Johannesburg`, value: "call_jhb" },
                { text: `${icon('phone_dbn')} Call Durban`, value: "call_dbn" },
                { text: `${icon('whatsapp')} WhatsApp Us`, value: "whatsapp" },
                { text: `${icon('back')} Main Menu`, value: "greeting" },
            ],
        },
        quote_specialized: {
            text: `${icon('specialized')} <b>Specialized Project Quote:</b><br>These projects need assessment. Let's connect!`,
            images: [serviceImages.construction, serviceImages.event],
            options: [
                { text: `${icon('form')} Fill Quote Form`, value: "redirectToContact" },
                { text: `${icon('phone_jhb')} Call Johannesburg`, value: "call_jhb" },
                { text: `${icon('phone_dbn')} Call Durban`, value: "call_dbn" },
                { text: `${icon('whatsapp')} WhatsApp Us`, value: "whatsapp" },
                { text: `${icon('back')} Main Menu`, value: "greeting" },
            ],
        },
        quote_deepclean: {
            text: "🧽 <b>Deep Clean / End-of-Lease:</b><br>Pricing depends on size and condition. Use our form for accurate pricing.",
            images: [serviceImages.end_of_lease],
            options: [
                { text: `${icon('form')} Fill Quote Form`, value: "redirectToContact" },
                { text: `${icon('contact')} Call for Estimate`, value: "contact" },
                { text: `${icon('back')} Back to Pricing`, value: "pricing" },
            ],
        },
        contact: {
            text: `${icon('contact')} <b>Contact XYZSolutions & Projects:</b>`,
            details: [
                "📍 <b>Johannesburg:</b> 068 029 7313",
                "📍 <b>Durban:</b> 062 297 6614",
                "📧 <b>Email:</b> quotes@xyzsolutions.co.za",
                "🕐 <b>Hours:</b> Mon-Fri 8am-5pm, Sat 9am-1pm"
            ],
            options: [
                { text: `${icon('phone_jhb')} Call Jhb`, value: "call_jhb" },
                { text: `${icon('phone_dbn')} Call Dbn`, value: "call_dbn" },
                { text: `${icon('whatsapp')} WhatsApp`, value: "whatsapp" },
                { text: `${icon('form')} Get Quote`, value: "quote_entry" },
                { text: `${icon('back')} Main Menu`, value: "greeting" },
            ],
        },
        whatsapp: {
            action: () => redirectTo('https://wa.me/27622976614', `${icon('whatsapp')} Opening WhatsApp...`)
        },
        call_jhb: {
            action: () => callNumber('0680297313', `${icon('phone_jhb')} Calling our Johannesburg team...`)
        },
        call_dbn: {
            action: () => callNumber('0622976614', `${icon('phone_dbn')} Calling our Durban team...`)
        },
        redirectToContact: {
            action: () => redirectTo('contact.html', "✅ Redirecting you to the contact & quote page...")
        },
        default: {
            text: "🤔 I'm not sure I understood that. Let me show you what I can help with:",
            options: [
                { text: `${icon('services')} Explore Services`, value: "services" },
                { text: `${icon('quote')} Get a Quote`, value: "quote_entry" },
                { text: `${icon('pricing')} View Pricing`, value: "pricing" },
                { text: `${icon('contact')} Contact Us`, value: "contact" },
            ],
        },
    };

    // --- Utility Functions ---
    const toggleChatbot = () => {
        elements.popup.classList.toggle('show');
        if (elements.popup.classList.contains('show')) {
            setTimeout(() => elements.input.focus(), 300);
        }
    };

    const showTyping = () => elements.typingIndicator.classList.remove('hidden');
    const hideTyping = () => elements.typingIndicator.classList.add('hidden');

    const addMessage = (sender, text, images = null, details = null) => {
        const msg = document.createElement('div');
        msg.className = `message ${sender}`;
        
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'message-content';
        
        const textPara = document.createElement('p');
        textPara.innerHTML = text;
        contentWrapper.appendChild(textPara);
        
        if (details && details.length > 0) {
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'message-details';
            details.forEach(detail => {
                const detailPara = document.createElement('p');
                detailPara.innerHTML = detail;
                detailsDiv.appendChild(detailPara);
            });
            contentWrapper.appendChild(detailsDiv);
        }
        
        if (images && images.length > 0) {
            const imagesDiv = document.createElement('div');
            imagesDiv.className = 'message-images';
            images.forEach(imgSrc => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.alt = 'Service Image';
                img.className = 'service-image';
                img.loading = 'lazy';
                img.onerror = function() { this.style.display = 'none'; };
                imagesDiv.appendChild(img);
            });
            contentWrapper.appendChild(imagesDiv);
        }
        
        msg.appendChild(contentWrapper);
        elements.messagesContainer.appendChild(msg);
        
        setTimeout(() => {
            elements.messagesContainer.scrollTo({
                top: elements.messagesContainer.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    };

    const renderOptions = (options) => {
        elements.quickbar.innerHTML = '';
        if (!options) return;
        
        options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quick-reply';
            btn.innerHTML = opt.text;
            btn.dataset.value = opt.value;
            btn.style.animationDelay = `${idx * 0.05}s`;
            elements.quickbar.appendChild(btn);
        });
    };

    const processResponse = (key, showTypingEffect = true) => {
        elements.quickbar.innerHTML = '';
        const res = conversationTree[key] || conversationTree.default;

        if (res.action) return res.action();

        const display = () => {
            addMessage('bot', res.text, res.images, res.details);
            renderOptions(res.options);
        };

        if (showTypingEffect) {
            showTyping();
            setTimeout(() => {
                hideTyping();
                display();
            }, 800 + Math.random() * 400);
        } else {
            display();
        }
    };

    const handleFreeTextInput = (input) => {
        const text = input.toLowerCase().trim();
        
        const mapping = [
            { keywords: ['quote', 'cost', 'price', 'how much'], key: 'quote_entry', priority: 10 },
            { keywords: ['home', 'house', 'apartment', 'domestic', 'residential'], key: 'services_home', priority: 8 },
            { keywords: ['office', 'business', 'commercial', 'workplace'], key: 'services_business', priority: 8 },
            { keywords: ['construction', 'building', 'renovation'], key: 'services_specialized', priority: 7 },
            { keywords: ['airbnb', 'rental', 'guest house'], key: 'services_specialized', priority: 7 },
            { keywords: ['event', 'party', 'function'], key: 'services_specialized', priority: 7 },
            { keywords: ['deep clean', 'spring clean', 'thorough'], key: 'quote_deepclean', priority: 9 },
            { keywords: ['move', 'moving', 'end of lease', 'lease'], key: 'services_home', priority: 9 },
            { keywords: ['service', 'services', 'clean', 'cleaning'], key: 'services', priority: 5 },
            { keywords: ['pricing', 'rates', 'packages', 'plans'], key: 'pricing', priority: 7 },
            { keywords: ['contact', 'phone', 'call', 'email', 'reach'], key: 'contact', priority: 6 },
            { keywords: ['whatsapp', 'wa', 'chat'], key: 'whatsapp', priority: 8 },
            { keywords: ['hours', 'open', 'available', 'time'], key: 'contact', priority: 6 },
            { keywords: ['hi', 'hello', 'hey', 'greetings'], key: 'greeting', priority: 3 },
            { keywords: ['help', 'assist', 'support'], key: 'greeting', priority: 4 },
            { keywords: ['thanks', 'thank you', 'appreciate'], key: 'greeting', priority: 2 },
        ];

        let bestMatch = null;
        let bestScore = 0;

        for (const map of mapping) {
            const matchCount = map.keywords.filter(k => text.includes(k)).length;
            const score = matchCount * map.priority;
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = map.key;
            }
        }

        if (bestMatch) {
            processResponse(bestMatch);
        } else {
            processResponse('default');
        }
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
        setTimeout(() => {
            window.location.href = `tel:${number}`;
        }, 500);
        setTimeout(() => processResponse('contact', false), 1500);
    };

    const redirectTo = (url, msg) => {
        addMessage('bot', msg);
        setTimeout(() => {
            window.location.href = url;
        }, 1000);
    };

    // --- Event Listeners ---
    elements.toggler.addEventListener('click', toggleChatbot);
    elements.closeBtn.addEventListener('click', toggleChatbot);
    elements.quickbar.addEventListener('click', handleQuickReply);
    elements.composer.addEventListener('submit', handleFormSubmit);
    
    elements.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleFormSubmit(e);
        }
    });

    // --- Initial Greeting ---
    setTimeout(() => processResponse('greeting', false), 500);
}

// --- Initialize once DOM is ready ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
    initializeChatbot();
}