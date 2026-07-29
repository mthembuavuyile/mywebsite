// js/api/spacenews.js
window.NexoraRegistry.register({
    id: 'spacenews',
    name: 'Spaceflight News',
    example: 'show me space news',
    intents: [
        /\b(?:space|spaceflight|astronomy|cosmos)\s+(?:news|updates|headlines|discoveries|briefing|articles)\b/i,
        /\b(spacex|nasa|mars|moon|artemis|james webb|jwst|iss|rocket|starship|falcon|satellite)\b.*?\b(?:news|updates|launches|info|briefing)\b/i,
        /(?:show me|what'?s? new in|get|fetch)\s+(?:the\s+)?(?:latest\s+)?(?:space|astronomy)\s*(?:news)?/i,
        /^\s*(?:space\s*news|spaceflight|spacex|nasa\s*news)\s*$/i
    ],

    async handle(match) {
        const raw = match[0].toLowerCase();

        let searchTopic = '';
        if (raw.includes('spacex') || raw.includes('starship') || raw.includes('falcon')) searchTopic = 'SpaceX';
        else if (raw.includes('nasa')) searchTopic = 'NASA';
        else if (raw.includes('mars')) searchTopic = 'Mars';
        else if (raw.includes('moon') || raw.includes('artemis')) searchTopic = 'Artemis';
        else if (raw.includes('james webb') || raw.includes('jwst')) searchTopic = 'Webb';
        else if (raw.includes('iss') || raw.includes('station')) searchTopic = 'Station';

        return await fetchAndRenderSpaceNews(searchTopic);
    }
});

// Expose global fetch for interactive buttons & Space News Hub modal
window.fetchAndRenderSpaceNews = async function(topic = '', limit = 5) {
    let apiUrl = `https://api.spaceflightnewsapi.net/v4/articles/?limit=${limit}&ordering=-published_at`;
    if (topic) {
        apiUrl += `&search=${encodeURIComponent(topic)}`;
    }

    try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const articles = data.results || [];
        if (!articles.length) {
            if (topic) {
                // Retry without search filter if no results
                return await window.fetchAndRenderSpaceNews('', limit);
            }
            return { text: "No recent space news found at the moment. Check back soon!" };
        }

        const itemsHtml = articles.map(art => {
            const fallbackImg = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop";
            const imgUrl = art.image_url || fallbackImg;
            const siteName = art.news_site || 'Spaceflight News';
            const timeAgo = formatTimeAgo(art.published_at);
            const snippet = art.summary ? (art.summary.substring(0, 110) + '…') : '';

            return `
            <li class="space-news-item news-item">
                <img src="${escapeHtml(imgUrl)}" alt="" class="news-thumb space-thumb" onerror="this.onerror=null;this.src='${fallbackImg}'">
                <div class="news-item-content space-content">
                    <div class="space-badge-row">
                        <span class="space-site-tag">${escapeHtml(siteName)}</span>
                        <span class="space-time-tag"><i class="far fa-clock"></i> ${timeAgo}</span>
                    </div>
                    <h4><a href="${escapeHtml(art.url)}" target="_blank" rel="noopener">${escapeHtml(art.title)}</a></h4>
                    ${snippet ? `<p class="space-snippet">${escapeHtml(snippet)}</p>` : ''}
                </div>
            </li>`;
        }).join('');

        const topicLabel = topic ? ` • Filter: ${escapeHtml(topic)}` : '';

        const html = `
        <div class="rich-widget space-widget">
            <div class="widget-title space-widget-title">
                <span class="space-title-left">
                    <i class="fas fa-rocket space-icon"></i>
                    <span>Spaceflight Intelligence</span>
                    <span class="space-live-dot" title="Live Feed"></span>
                </span>
                <span class="space-topic-badge">${escapeHtml(topicLabel || 'Latest Orbit')}</span>
            </div>
            
            <div class="space-filter-bar">
                <button class="space-chip ${!topic ? 'active' : ''}" onclick="triggerSpaceFilter('')">All</button>
                <button class="space-chip ${topic === 'SpaceX' ? 'active' : ''}" onclick="triggerSpaceFilter('SpaceX')">SpaceX</button>
                <button class="space-chip ${topic === 'NASA' ? 'active' : ''}" onclick="triggerSpaceFilter('NASA')">NASA</button>
                <button class="space-chip ${topic === 'Mars' ? 'active' : ''}" onclick="triggerSpaceFilter('Mars')">Mars</button>
                <button class="space-chip ${topic === 'Artemis' ? 'active' : ''}" onclick="triggerSpaceFilter('Artemis')">Artemis</button>
            </div>

            <ul class="space-news-list news-list">${itemsHtml}</ul>
            
            <div class="space-widget-footer">
                <button class="widget-refresh-btn" onclick="triggerSpaceFilter('${topic}')">
                    <i class="fas fa-arrows-rotate"></i> Refresh Headlines
                </button>
                <button class="widget-refresh-btn secondary-btn" onclick="window.openSpaceHub('${topic}')">
                    <i class="fas fa-expand"></i> Launch Full Space Hub
                </button>
            </div>
        </div>`;

        return {
            html,
            text: `Here are the latest spaceflight news headlines${topic ? ` on ${topic}` : ''} directly from orbit.`
        };

    } catch (err) {
        console.error('[SpaceNews Module]', err);
        return {
            text: "Failed to fetch live space news. Please check your internet connection and try again."
        };
    }
};

// Global filter helper for chat widget buttons
window.triggerSpaceFilter = function(topic) {
    const promptText = topic ? `Space news about ${topic}` : `Show me space news`;
    if (window.sendSuggestion) {
        window.sendSuggestion(promptText);
    }
};

function formatTimeAgo(isoString) {
    if (!isoString) return 'recently';
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    
    if (diffSec < 60) return 'just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
