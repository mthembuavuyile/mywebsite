// -----------------------------------------------------------------------------
// IMPORTANT: AI TUTOR SETUP
// -----------------------------------------------------------------------------
// To use the AI Tutor feature, you need a Google Gemini API key.
// 1. Get your key from Google AI Studio: https://aistudio.google.com/app/apikey
// 2. Paste your key below.
// WARNING: Do NOT commit this key to a public repository.
// For a real application, this key should be handled on a secure backend server.
const GEMINI_API_KEY = "YOUR_API_KEY_HERE";

// -----------------------------------------------------------------------------
// MOCK DATA
// -----------------------------------------------------------------------------
// This data simulates what would normally come from a database or API.
const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-house' },
    { id: 'learning', label: 'Learning', icon: 'fa-solid fa-graduation-cap' },
    { id: 'opportunities', label: 'Opportunities', icon: 'fa-solid fa-briefcase' },
    { id: 'community', label: 'Community', icon: 'fa-solid fa-users' },
    { id: 'events', label: 'Events', icon: 'fa-solid fa-calendar-days' },
    { id: 'resources', label: 'Resources', icon: 'fa-solid fa-toolbox' },
];

const mockData = {
    learning: {
        matric: [
            { id: "l1", title: "Grade 12 Mathematics Past Papers", type: "PDF Download", category: "Mathematics", description: "Complete collection of past papers from 2019-2025 with memo solutions." },
            { id: "l2", title: "Physical Sciences Video Masterclass", type: "Video Series", category: "Science", description: "Comprehensive video tutorials covering all Grade 12 physics and chemistry topics." },
            { id: "l3", title: "University Application Guide 2025", type: "Interactive Guide", category: "Applications", description: "Step-by-step guide to applying for university admission and funding." },
        ],
        tertiary: [
            { id: "l4", title: "Python For Data Science Bootcamp", type: "Online Course", category: "Programming", description: "Learn Python from scratch with hands-on projects and career guidance." },
        ],
        life_skills: [
            { id: "l5", title: "Professional CV & Cover Letter Workshop", type: "Template & Guide", category: "Career", description: "Create compelling CVs and cover letters that get you noticed." },
            { id: "l6", title: "Personal Finance & Budgeting 101", type: "Interactive Course", category: "Finance", description: "Master budgeting, saving, and financial planning for young adults." },
        ],
    },
    opportunities: {
        jobs: [
            { id: "o1", title: "Junior Full-Stack Developer", company: "TechSolutions ZA", location: "Cape Town", type: "Full-Time", salary: "R25k - R35k", description: "Join our growing team building innovative web applications." },
            { id: "o2", title: "Marketing Coordinator", company: "Creative Minds JHB", location: "Johannesburg", type: "Full-Time", salary: "R20k - R28k", description: "Support marketing campaigns for leading South African brands." },
            { id: "o3", title: "Cybersecurity Intern", company: "SecureNet", location: "Remote", type: "Internship", salary: "R8,000 stipend", description: "6-month internship with potential for permanent placement." },
        ],
        hustles: [
            { id: "o4", title: "Weekend Brand Ambassador", price: "R600/weekend", location: "Durban", description: "Promote new products at busy retail stores." },
        ],
        startups: [
            { id: "o5", title: "Green Delivery Service Platform", idea: "Eco-friendly last-mile delivery using electric bikes. Seeking tech co-founder to build the platform and mobile app.", author: "Sizwe N.", skills: "Needs: Full-stack dev, UI/UX" },
        ]
    },
    community: [
        { id: "c1", title: "How to stay motivated during job searching?", author: "Lerato M.", replies: 18, category: "Career Advice", time: "2h ago", excerpt: "It's been 6 months since I graduated and I'm feeling discouraged. Any advice?" },
        { id: "c2", title: "Startup idea: AI-powered tutor for Matric students", author: "Kevin S.", replies: 32, category: "Tech Ideas", time: "5h ago", excerpt: "What if we could create a data-free AI tutor to help students pass?" },
    ],
    events: [
        { id: "e1", name: "Youth Entrepreneurship Summit 2025", date: "Nov 15, 2025", location: "Sandton Convention Centre", type: "In-Person", price: "Free", description: "Connect with successful entrepreneurs and learn about starting your own business." },
        { id: "e2", name: "Data Science & AI Career Fair", date: "Nov 22, 2025", location: "Online", type: "Virtual", price: "Free", description: "Meet recruiters from top tech companies hiring for data and AI roles." },
    ],
    resources: [
        { id: "r1", name: "CAO Application Portal", desc: "Central Applications Office for university applications.", url: "#", category: "Education" },
        { id: "r2", name: "NSFAS Student Portal", desc: "Apply for government financial aid for tertiary education.", url: "#", category: "Funding" },
        { id: "r3", name: "SA Youth Mobi", desc: "Government platform for youth employment opportunities.", url: "#", "category": "Employment" },
        { id: "r4", name: "Sandanezwe Excellence", desc: "A registered NPO focused on youth excellence and empowerment.", url: "https://sandanezweexcellence.co.za/", category: "Partner" },
    ],
};

// -----------------------------------------------------------------------------
// APPLICATION STATE
// -----------------------------------------------------------------------------
// These variables control the current state of the application.
let state = {
    user: null, // Holds user info if logged in, e.g., { name, email, role }
    activeView: 'dashboard' // The current view being displayed
};

// -----------------------------------------------------------------------------
// API SERVICE (AI TUTOR)
// -----------------------------------------------------------------------------
async function getSmartExplanation(topic, userRole) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
        return "AI Tutor is not configured. Please add a valid Gemini API Key in `script.js`.";
    }

    const prompt = `You are an expert AI Tutor for South African youth. A user who is a "${userRole}" wants to understand the topic: "${topic}". Explain this topic in a simple, engaging, and encouraging way. Use analogies relevant to South Africa where possible. Structure your answer with clear headings and bullet points, but do not use markdown code blocks or markdown headings (like ##). Instead, make headings bold by surrounding them with asterisks (*like this*).`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Sorry, I couldn't generate an explanation at this time. Please try again later.";
    }
}


// -----------------------------------------------------------------------------
// COMPONENT TEMPLATE FUNCTIONS
// -----------------------------------------------------------------------------
// These functions generate HTML strings for reusable UI elements.

const Icon = (name, className = '') => `<i class="${name} ${className}"></i>`;

const Loader = () => `<div class="flex justify-center items-center p-8">${Icon('fa-solid fa-spinner fa-spin', 'text-primary text-4xl')}</div>`;

const Button = (text, { variant = 'primary', size = 'md', className = '', type = 'button', 'data-action': dataAction, 'data-value': dataValue } = {}) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = {
        primary: 'bg-primary-gradient text-primary-contrast hover:shadow-lg hover:-translate-y-px focus:ring-primary',
        secondary: 'bg-surface text-text-primary border-2 border-border-color hover:border-primary hover:bg-light focus:ring-primary',
        danger: 'bg-danger text-white hover:bg-red-600 focus:ring-danger',
    };
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
    };
    const actionAttr = dataAction ? `data-action="${dataAction}"` : '';
    const valueAttr = dataValue ? `data-value="${dataValue}"` : '';
    
    return `<button type="${type}" class="${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}" ${actionAttr} ${valueAttr}>${text}</button>`;
};

const Tag = (text, color = 'primary') => {
    const colorClasses = {
        primary: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary/10 text-secondary',
        accent: 'bg-accent/10 text-accent',
        success: 'bg-success/10 text-success',
        danger: 'bg-danger/10 text-danger',
    };
    return `<span class="inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${colorClasses[color]}">${text}</span>`;
};

const AITutor = (resource) => `
    <div id="ai-tutor-${resource.id}" class="ai-tutor-container text-center my-4">
        ${Button(`${Icon('fa-solid fa-robot', 'mr-2')} Get a Smart Explanation`, { 
            variant: 'secondary', 
            size: 'sm', 
            'data-action': 'get-explanation',
            'data-value': JSON.stringify({ id: resource.id, title: resource.title })
        })}
    </div>
`;

// -----------------------------------------------------------------------------
// CARD COMPONENT TEMPLATES
// -----------------------------------------------------------------------------

const LearningCard = (item, user) => `
    <div class="bg-surface rounded-xl border border-border-color overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
        <div class="p-5">
            ${Tag(item.category, 'primary')}
            <h3 class="font-bold text-lg mt-2 mb-1 text-text-primary">${item.title}</h3>
            <p class="text-sm text-text-secondary line-clamp-2">${item.description}</p>
        </div>
        <div class="px-5 py-4 bg-light/50 border-t border-border-color flex justify-between items-center">
            <span class="text-sm text-text-muted">${item.type}</span>
            ${Button('Learn More', { size: 'sm', 'data-action': 'toggle-ai-tutor', 'data-value': item.id })}
        </div>
        <div id="tutor-content-${item.id}" class="hidden">
            ${AITutor(item)}
        </div>
    </div>
`;

const OpportunityCard = (item) => {
    if ('company' in item) { // Job
        return `
            <div class="bg-surface rounded-xl border border-border-color overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
                <div class="p-5">
                    ${Tag(item.type, 'success')}
                    <h3 class="font-bold text-lg mt-2 mb-1">${item.title}</h3>
                    <p class="font-semibold text-sm text-text-primary">${item.company} <span class="font-normal text-text-secondary">• ${item.location}</span></p>
                    <p class="text-sm text-text-secondary mt-2 line-clamp-2">${item.description}</p>
                </div>
                <div class="px-5 py-4 bg-light/50 border-t border-border-color flex justify-between items-center">
                    <span class="text-sm font-medium text-primary">${item.salary}</span>
                    ${Button('Apply Now', { size: 'sm' })}
                </div>
            </div>`;
    }
    if ('price' in item) { // Gig
        return `
            <div class="bg-surface rounded-xl border border-border-color overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
                <div class="p-5">
                    ${Tag(item.price, 'secondary')}
                    <h3 class="font-bold text-lg mt-2 mb-1">${item.title}</h3>
                    <p class="font-semibold text-sm text-text-primary">Location: <span class="font-normal text-text-secondary">${item.location}</span></p>
                    <p class="text-sm text-text-secondary mt-2 line-clamp-2">${item.description}</p>
                </div>
                <div class="px-5 py-4 bg-light/50 border-t border-border-color flex justify-between items-center">
                    <span class="text-sm text-text-muted">Flexible hours</span>
                    ${Button("I'm Interested", { size: 'sm' })}
                </div>
            </div>`;
    }
    // Startup
    return `
        <div class="bg-surface rounded-xl border border-border-color overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
            <div class="p-5">
                ${Tag('Seeking Team', 'accent')}
                <h3 class="font-bold text-lg mt-2 mb-1">${item.title}</h3>
                <p class="text-sm text-text-secondary mt-2 line-clamp-3">${item.idea}</p>
                <p class="text-sm font-semibold text-accent mt-2">${item.skills}</p>
            </div>
            <div class="px-5 py-4 bg-light/50 border-t border-border-color flex justify-between items-center">
                <span class="text-sm text-text-muted">By ${item.author}</span>
                ${Button('Connect', { size: 'sm' })}
            </div>
        </div>`;
};

const CommunityPostCard = (item) => `
    <div class="bg-surface rounded-xl border-l-4 border-primary border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary">
        <div class="p-5">
            ${Tag(item.category, 'primary')}
            <h3 class="font-bold text-lg mt-2 mb-1">${item.title}</h3>
            <p class="text-sm text-text-secondary mt-2 italic">"${item.excerpt}"</p>
        </div>
        <div class="px-5 py-4 bg-light/50 border-t border-border-color flex justify-between items-center">
            <span class="text-xs text-text-muted">${item.author} • ${item.replies} replies • ${item.time}</span>
            ${Button('Join Discussion', { size: 'sm' })}
        </div>
    </div>
`;

const EventCard = (item) => `
    <div class="bg-surface rounded-xl border border-border-color overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
        <div class="p-5">
            ${Tag(item.type, item.type === 'Virtual' ? 'accent' : 'primary')}
            <h3 class="font-bold text-lg mt-2 mb-1">${item.name}</h3>
            <p class="text-sm text-text-primary font-medium">${Icon('fa-solid fa-calendar', 'mr-2')}${item.date}</p>
            <p class="text-sm text-text-secondary">${Icon('fa-solid fa-location-dot', 'mr-2')}${item.location}</p>
            <p class="text-sm text-text-secondary mt-2 line-clamp-2">${item.description}</p>
        </div>
        <div class="px-5 py-4 bg-light/50 border-t border-border-color flex justify-between items-center">
            <span class="text-sm font-medium text-primary">${item.price}</span>
            ${Button('Register', { size: 'sm' })}
        </div>
    </div>
`;

const ResourceCard = (item) => `
    <div class="bg-surface rounded-xl border border-border-color overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
        <div class="p-5">
            ${Tag(item.category, item.category === 'Partner' ? 'accent' : 'secondary')}
            <h3 class="font-bold text-lg mt-2 mb-1">${item.name}</h3>
            <p class="text-sm text-text-secondary mt-2">${item.desc}</p>
        </div>
        <div class="px-5 py-4 bg-light/50 border-t border-border-color flex justify-between items-center">
            <span class="text-xs text-text-muted">${item.category === 'Partner' ? 'Official Partner' : 'External Link'}</span>
            <a href="${item.url}" target="_blank" rel="noopener noreferrer">
                ${Button(`Visit Site ${Icon('fa-solid fa-arrow-up-right-from-square', 'ml-2')}`, { size: 'sm' })}
            </a>
        </div>
    </div>
`;

// -----------------------------------------------------------------------------
// LAYOUT & VIEW TEMPLATES
// -----------------------------------------------------------------------------

const ViewHeader = (title, description) => `
    <div class="mb-8 md:mb-12">
        <h1 class="text-3xl md:text-4xl font-bold text-text-primary mb-2">${title}</h1>
        <p class="text-md md:text-lg text-text-secondary max-w-2xl">${description}</p>
    </div>
`;

const Section = (title, content) => `
    <section class="mb-12">
        <h2 class="text-2xl font-bold text-text-primary mb-6">${title}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${content}
        </div>
    </section>
`;

const Header = (user, activeView) => `
    <header class="bg-surface border-b border-border-color sticky top-0 z-40 shadow-sm">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="text-2xl font-bold text-text-primary">Next<span class="text-primary">ZA</span></div>
          <nav class="hidden lg:flex items-center space-x-2">
            ${navItems.map(item => `
              <a href="#" data-action="navigate" data-value="${item.id}"
                 class="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${activeView === item.id ? 'text-primary bg-primary/10' : 'text-text-secondary hover:bg-light hover:text-primary'}">
                ${item.label}
              </a>`).join('')}
          </nav>
          <div class="hidden lg:flex items-center space-x-4">
            <div class="flex items-center space-x-2">
                <img src="https://i.pravatar.cc/40?u=${user.email}" alt="User Avatar" class="w-9 h-9 rounded-full border-2 border-primary" />
                <span class="font-medium text-text-primary text-sm">${user.name}</span>
            </div>
            <button data-action="logout" class="text-text-secondary hover:text-danger text-xl transition-colors">
                ${Icon('fa-solid fa-right-from-bracket')}
            </button>
          </div>
          <div class="lg:hidden text-2xl text-text-primary">${Icon('fa-solid fa-bars')}</div>
        </div>
      </div>
    </header>
`;

const BottomNav = (activeView) => `
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border-color shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40">
        <div class="flex justify-around items-center h-16">
            ${navItems.map(item => `
                <a href="#" data-action="navigate" data-value="${item.id}"
                   class="flex flex-col items-center justify-center w-full transition-colors duration-200 ${activeView === item.id ? 'text-primary' : 'text-text-muted hover:text-primary'}">
                    ${Icon(item.icon, 'text-xl')}
                    <span class="text-xs mt-1 font-medium">${item.label}</span>
                </a>`).join('')}
        </div>
    </nav>
`;

const Footer = () => `
    <footer class="bg-dark text-white text-center py-6 mt-auto">
        <div class="container mx-auto px-4">
            <p class="text-sm opacity-80">© 2025 NextZA. Empowering South African youth for a digital future.</p>
        </div>
    </footer>
`;

// -----------------------------------------------------------------------------
// VIEW RENDERER FUNCTIONS
// -----------------------------------------------------------------------------

const renderLoginView = () => `
    <div class="min-h-screen flex items-center justify-center bg-login-gradient p-4 relative overflow-hidden">
      <div class="absolute top-0 left-0 right-0 bottom-0 bg-[radial-gradient(circle_at_25%_25%,_rgba(16,185,129,0.1)_0%,_transparent_50%),radial-gradient(circle_at_75%_75%,_rgba(139,92,246,0.1)_0%,_transparent_50%)]"></div>
      <div class="relative z-10 w-full max-w-md">
        <div class="bg-surface p-8 md:p-12 rounded-2xl shadow-xl border border-border-color/50">
          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold bg-primary-gradient bg-clip-text text-transparent">NextZA</h1>
            <p class="text-text-secondary mt-2">Connecting youth to opportunity.</p>
          </div>
          <form id="login-form" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-text-primary mb-1">Email Address</label>
              <input type="email" id="email" value="demo@nextza.co.za" required class="w-full px-4 py-3 border-2 border-border-color rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"/>
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-text-primary mb-1">Password</label>
              <input type="password" id="password" value="password" required class="w-full px-4 py-3 border-2 border-border-color rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"/>
            </div>
            <div>
              <label for="user-role" class="block text-sm font-medium text-text-primary mb-1">I am a...</label>
              <select id="user-role" required class="w-full px-4 py-3 border-2 border-border-color rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em]" style="background-image: url(&quot;data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e&quot;);">
                <option>Matriculant</option>
                <option>Graduate</option>
                <option>Unemployed</option>
                <option>Entrepreneur</option>
                <option>Mentor</option>
                <option>Company</option>
              </select>
            </div>
            <div class="space-y-3 pt-2">
                ${Button('Sign In / Join NextZA', { size: 'lg', className: 'w-full', type: 'submit' })}
                ${Button(`${Icon('fa-brands fa-google', 'mr-2')} Continue with Google`, { variant: 'secondary', size: 'lg', className: 'w-full' })}
            </div>
          </form>
        </div>
      </div>
    </div>
`;

const renderDashboardView = (user) => {
    let welcomeMsg = `Your journey to success starts here. Explore opportunities and connect with your community.`;
    let recommendations = [
        OpportunityCard(mockData.opportunities.jobs[2]),
        OpportunityCard(mockData.opportunities.hustles[0]),
        CommunityPostCard(mockData.community[1])
    ].join('');

    switch (user.role) {
        case 'Matriculant':
            welcomeMsg = `You're almost there! Here are resources to help you ace your exams and plan your next steps.`;
            recommendations = [
                LearningCard(mockData.learning.matric[0], user),
                LearningCard(mockData.learning.matric[2], user),
                EventCard(mockData.events[1]),
            ].join('');
            break;
        case 'Graduate':
            welcomeMsg = `Your qualification is your ticket to the future. Let's turn it into opportunities.`;
            recommendations = [
                OpportunityCard(mockData.opportunities.jobs[0]),
                LearningCard(mockData.learning.life_skills[0], user),
                CommunityPostCard(mockData.community[0]),
            ].join('');
            break;
        case 'Entrepreneur':
             welcomeMsg = `Ready to build something amazing? Find resources, funding, and collaborators here.`;
             recommendations = [
                OpportunityCard(mockData.opportunities.startups[0]),
                LearningCard(mockData.learning.life_skills[1], user),
                EventCard(mockData.events[0]),
            ].join('');
            break;
    }

    return `
        <div class="bg-primary-gradient text-white p-8 rounded-2xl mb-12 shadow-xl relative overflow-hidden">
            <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div class="relative z-10">
                <h1 class="text-3xl font-bold">Welcome back, ${user.name}!</h1>
                <p class="mt-2 opacity-90">${welcomeMsg}</p>
            </div>
        </div>
        ${Section('Recommended For You', recommendations)}
    `;
};

const renderLearningView = (user) => `
    ${ViewHeader('🎓 Learning Hub', 'Discover courses, resources, and skills to accelerate your career and personal development.')}
    ${Section('Matric & School Leaver Resources', mockData.learning.matric.map(item => LearningCard(item, user)).join(''))}
    ${Section('Tertiary & Professional Development', mockData.learning.tertiary.map(item => LearningCard(item, user)).join(''))}
    ${Section('Essential Life & Career Skills', mockData.learning.life_skills.map(item => LearningCard(item, user)).join(''))}
`;

const renderOpportunitiesView = () => `
    ${ViewHeader('💼 Opportunity Hub', 'Find jobs, internships, gigs, and startup opportunities tailored to your skills and ambitions.')}
    ${Section('Job & Internship Board', mockData.opportunities.jobs.map(OpportunityCard).join(''))}
    ${Section('Gig Economy & Quick Opportunities', mockData.opportunities.hustles.map(OpportunityCard).join(''))}
    ${Section('Startup Collaboration Board', mockData.opportunities.startups.map(OpportunityCard).join(''))}
`;

const renderCommunityView = () => `
    ${ViewHeader('🧑🏾‍🤝‍🧑🏿 Community Hub', 'Connect with like-minded youth, share experiences, and build meaningful relationships.')}
    <section>
        <h2 class="text-2xl font-bold text-text-primary mb-6">Latest Discussions</h2>
        <div class="space-y-6">
            ${mockData.community.map(CommunityPostCard).join('')}
        </div>
    </section>
`;

const renderEventsView = () => `
    ${ViewHeader('🗓️ Events & Networking', 'Discover workshops, seminars, and networking events to expand your horizons.')}
    ${Section('Upcoming Events', mockData.events.map(EventCard).join(''))}
`;

const renderResourcesView = () => `
    ${ViewHeader('🛠️ Resource Navigator', 'Quick access to essential tools, platforms, and services for your journey.')}
    ${Section('Essential Resources', mockData.resources.map(ResourceCard).join(''))}
`;


// -----------------------------------------------------------------------------
// MAIN APP RENDERER & LOGIC
// -----------------------------------------------------------------------------

const renderActiveView = () => {
    const { user, activeView } = state;
    switch (activeView) {
        case 'dashboard': return renderDashboardView(user);
        case 'learning': return renderLearningView(user);
        case 'opportunities': return renderOpportunitiesView();
        case 'community': return renderCommunityView();
        case 'events': return renderEventsView();
        case 'resources': return renderResourcesView();
        default: return renderDashboardView(user);
    }
};

function renderApp() {
    const appRoot = document.getElementById('app-root');
    if (!state.user) {
        appRoot.innerHTML = renderLoginView();
    } else {
        appRoot.innerHTML = `
            ${Header(state.user, state.activeView)}
            <main class="container mx-auto px-4 py-8">
                <div class="view-content">
                    ${renderActiveView()}
                </div>
            </main>
            <div class="h-16 lg:hidden"></div> <!-- Spacer for bottom nav -->
            ${BottomNav(state.activeView)}
            ${Footer()}
        `;
    }
    attachEventListeners();
}

// -----------------------------------------------------------------------------
// EVENT HANDLERS & LISTENERS
// -----------------------------------------------------------------------------

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const role = document.getElementById('user-role').value;
    const name = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    
    state.user = { email, role, name: capitalizedName };
    state.activeView = 'dashboard';
    renderApp();
}

function handleLogout() {
    state.user = null;
    renderApp();
}

function handleNavigate(viewId) {
    state.activeView = viewId;
    renderApp();
}

function handleToggleAITutor(button) {
    const resourceId = button.dataset.value;
    const tutorContent = document.getElementById(`tutor-content-${resourceId}`);
    
    if (tutorContent.classList.contains('hidden')) {
        tutorContent.classList.remove('hidden');
        button.textContent = 'Show Less';
    } else {
        tutorContent.classList.add('hidden');
        button.textContent = 'Learn More';
    }
}

async function handleGetExplanation(button) {
    const resourceData = JSON.parse(button.dataset.value);
    const tutorContainer = document.getElementById(`ai-tutor-${resourceData.id}`);

    tutorContainer.innerHTML = Loader();

    const explanationText = await getSmartExplanation(resourceData.title, state.user.role);

    // Sanitize and format the explanation
    const formattedExplanation = explanationText
      .replace(/</g, "&lt;").replace(/>/g, "&gt;") // Basic sanitization
      .replace(/\*([^*]+)\*/g, '<strong class="text-text-primary">$1</strong>') // Bold formatting for *text*
      .split('\n')
      .map(line => `<p class="mb-2">${line.trim()}</p>`)
      .join('');

    tutorContainer.innerHTML = `
        <div class="my-4 p-4 border-2 border-dashed border-primary/50 bg-primary/5 rounded-lg text-left">
            <div class="flex justify-between items-center mb-3">
                <h4 class="font-bold text-primary flex items-center">
                    ${Icon('fa-solid fa-robot', 'mr-2')}
                    AI Tutor: ${resourceData.title}
                </h4>
                <button data-action="close-ai-tutor" data-value='${JSON.stringify(resourceData)}' class="text-text-muted hover:text-danger">
                    ${Icon('fa-solid fa-times')}
                </button>
            </div>
            <div class="prose prose-sm max-w-none text-text-secondary whitespace-pre-wrap font-sans">
                ${formattedExplanation}
            </div>
        </div>
    `;
}

function handleCloseAITutor(button) {
    const resourceData = JSON.parse(button.dataset.value);
    const tutorContainer = document.getElementById(`ai-tutor-${resourceData.id}`);
    tutorContainer.innerHTML = AITutor(resourceData);
}

function attachEventListeners() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    document.body.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        const value = target.dataset.value;

        switch (action) {
            case 'logout':
                handleLogout();
                break;
            case 'navigate':
                e.preventDefault();
                handleNavigate(value);
                break;
            case 'toggle-ai-tutor':
                handleToggleAITutor(target);
                break;
            case 'get-explanation':
                handleGetExplanation(target);
                break;
            case 'close-ai-tutor':
                handleCloseAITutor(target);
                break;
        }
    });
}

// -----------------------------------------------------------------------------
// INITIALIZATION
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', renderApp);
