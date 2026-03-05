/* --- Data Source --- */
    const tools = [
      {
        vendor: "OpenAI",
        url: "https://chat.openai.com/",
        categories: ["LLM","Code","Image"],
        models: [
          { name: "GPT-5.1", desc: "Advanced reasoning & multimodal creation." },
          { name: "o1 / o3-preview", desc: "Lightweight, high-speed everyday assistants." }
        ]
      },
      {
        vendor: "OpenAI Sora",
        url: "https://openai.com/sora/",
        categories: ["Video"],
        models: [
          { name: "Sora", desc: "Cinematic text-to-video generation." }
        ]
      },
      {
        vendor: "Google Gemini",
        url: "https://gemini.google.com/",
        categories: ["LLM","Image","Audio"],
        models: [
          { name: "Gemini 2.5 Pro", desc: "Massive context multimodal reasoning." },
          { name: "Gemini 3", desc: "Next-gen agency and tool use." },
          { name: "Imagen 3", desc: "Integrated high-fidelity image generation." }
        ]
      },
      {
        vendor: "Google Veo",
        url: "https://labs.google/fx/tools/flow",
        categories: ["Video"],
        models: [
          { name: "Veo 2 / Veo 3", desc: "High-definition video generation via Labs." }
        ]
      },
      {
        vendor: "Google MusicFX",
        url: "https://labs.google/fx/tools/music-fx",
        categories: ["Audio","Music"],
        models: [
          { name: "Music FX & DJ", desc: "Generative looping and remixing suite." }
        ]
      },
      {
        vendor: "Anthropic",
        url: "https://claude.ai/",
        categories: ["LLM","Code"],
        models: [
          { name: "Claude 3.5 Sonnet", desc: "Peak coding & reasoning performance." },
          { name: "Claude 3 Opus", desc: "Deep reasoning for complex workflows." }
        ]
      },
      {
        vendor: "xAI",
        url: "https://x.ai/",
        categories: ["LLM","Vision"],
        models: [
          { name: "Grok 2", desc: "Real-time web access with unfiltered reasoning." }
        ]
      },
      {
        vendor: "Deep Research (Google)",
        url: "https://gemini.google.com/deepresearch",
        categories: ["Research","LLM"],
        models: [
          { name: "Deep Research", desc: "Autonomous multi-step investigation agent." }
        ]
      },
      {
        vendor: "Meta",
        url: "https://www.meta.ai/",
        categories: ["LLM","Open Source"],
        models: [
          { name: "Llama 3.1 / 4", desc: "Industry standard open-weight models." },
          { name: "Audiobox", desc: "Voice and sound effect generation." }
        ]
      },
      {
        vendor: "Perplexity",
        url: "https://www.perplexity.ai/",
        categories: ["Research","LLM"],
        models: [
          { name: "Pro Search", desc: "Citated real-time answer engine." }
        ]
      },
      {
        vendor: "Midjourney",
        url: "https://midjourney.com/",
        categories: ["Image"],
        models: [
          { name: "v7", desc: "Leading artistic style and photorealism." }
        ]
      },
      {
        vendor: "Runway",
        url: "https://runwayml.com/",
        categories: ["Video"],
        models: [
          { name: "Gen-3 Alpha", desc: "Fine-grained motion control video." }
        ]
      },
      {
        vendor: "ElevenLabs",
        url: "https://elevenlabs.io/",
        categories: ["Audio"],
        models: [
          { name: "Voice Engine", desc: "Zero-shot voice cloning and dubbing." }
        ]
      },
      {
        vendor: "Cursor",
        url: "https://www.cursor.com/",
        categories: ["Code","Productivity"],
        models: [
          { name: "Tab / Composer", desc: "AI-native IDE for codebase generation." }
        ]
      },
      {
        vendor: "DeepSeek",
        url: "https://www.deepseek.com/",
        categories: ["LLM","Code","Open Source"],
        models: [
          { name: "DeepSeek R1", desc: "Specialized reasoning and math models." }
        ]
      },
      {
        vendor: "Mistral",
        url: "https://mistral.ai/",
        categories: ["LLM","Open Source"],
        models: [
            { name: "Mistral Large 2", desc: "Efficient enterprise-grade reasoning." },
            { name: "Codestral", desc: "Low-latency code generation model." }
        ]
      },
      {
        vendor: "Stability AI",
        url: "https://stability.ai/",
        categories: ["Image","Video","3D"],
        models: [
            { name: "Stable Diffusion 3.5", desc: "Highly prompt-adherent image generation." },
            { name: "Stable Audio", desc: "High-fidelity music and sound FX." }
        ]
      },
      {
        vendor: "Pika Labs",
        url: "https://pika.art/",
        categories: ["Video"],
        models: [
            { name: "Pika 1.5", desc: "Video generation with 'Lip Sync' and 'Inflate' effects." }
        ]
      },
      {
        vendor: "Ideogram",
        url: "https://ideogram.ai/",
        categories: ["Image","Design"],
        models: [
            { name: "Ideogram 2.0", desc: "Superior typography and text rendering in images." }
        ]
      },
      {
        vendor: "Leonardo.ai",
        url: "https://app.leonardo.ai/",
        categories: ["Image","3D","Assets"],
        models: [
            { name: "Phoenix", desc: "Creative suite for game assets and textures." }
        ]
      },
      {
        vendor: "Notion",
        url: "https://www.notion.so/ai",
        categories: ["Productivity","LLM"],
        models: [
            { name: "Notion AI", desc: "Integrated workspace Q&A and writing assistant." }
        ]
      },
      {
        vendor: "Descript",
        url: "https://www.descript.com/",
        categories: ["Audio","Video","Productivity"],
        models: [
            { name: "Underlord", desc: "Text-based audio/video editing agent." }
        ]
      }
    ];

    /* --- Application State --- */
    const state = {
      category: 'All',
      query: ''
    };

    /* --- DOM Elements --- */
    const grid = document.getElementById('grid');
    const catList = document.getElementById('categories');
    const searchInput = document.getElementById('search');

    /* --- Helper: Get Unique Categories --- */
    /* --- Helper: Get Unique Categories --- */
function getCategories() {
    // 1. Define the order you want to see first (Left to Right)
    const preferredOrder = ["LLM", "Image", "Research", "Video", "Code", "Audio"];

    // 2. Get all actual categories from the data
    const unique = new Set();
    tools.forEach(t => t.categories.forEach(c => unique.add(c)));
    const allFoundCategories = Array.from(unique);

    // 3. Filter: Get items from preferred list ONLY if they actually exist in data
    const primary = preferredOrder.filter(c => allFoundCategories.includes(c));

    // 4. Filter: Get the remaining items that are NOT in the preferred list
    const secondary = allFoundCategories
        .filter(c => !preferredOrder.includes(c))
        .sort(); // Keep the rest tidy and alphabetical

    // 5. Combine: All + Priority + Others
    return ['All', ...primary, ...secondary];
}

    

    /* --- Render: Categories --- */
    function renderCategories() {
      const cats = getCategories();
      catList.innerHTML = cats.map(c => `
        <button 
          class="pill ${state.category === c ? 'active' : ''}" 
          onclick="setCategory('${c}')">
          ${c}
        </button>
      `).join('');
    }

    /* --- Action: Set Category --- */
    window.setCategory = (cat) => {
      state.category = cat;
      updateURL();
      renderCategories();
      renderGrid();
    };

    /* --- Logic: Filter Tools --- */
    function filterTools() {
      const q = state.query.toLowerCase().trim();
      
      return tools.filter(t => {
        // Category Match
        const catMatch = state.category === 'All' || t.categories.includes(state.category);
        if (!catMatch) return false;

        // Search Match
        if (!q) return true;
        
        const vendorMatch = t.vendor.toLowerCase().includes(q);
        const catSearchMatch = t.categories.some(c => c.toLowerCase().includes(q));
        const modelMatch = t.models.some(m => 
          m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q)
        );

        return vendorMatch || catSearchMatch || modelMatch;
      });
    }

    /* --- Render: Grid --- */
    function renderGrid() {
      const filtered = filterTools();
      
      if (filtered.length === 0) {
        grid.innerHTML = `
          <div class="empty-state">
            <h3>System Offline</h3>
            <p>No modules found matching your criteria.</p>
          </div>`;
        return;
      }

      grid.innerHTML = filtered.map((t, index) => {
        // Stagger animation delay
        const delay = index * 50; 
        
        const tags = t.categories.map(c => `<span class="tag">${c}</span>`).join('');
        
        const modelsHTML = t.models.map(m => `
          <div class="model-item">
            <span class="model-name">${m.name}</span>
            <span class="model-desc">${m.desc}</span>
          </div>
        `).join('');

        return `
          <article class="card" style="animation-delay: ${delay}ms">
            <div class="card-header">
              <h2 class="vendor">${t.vendor}</h2>
              <div class="tag-group">${tags}</div>
            </div>
            
            <div class="models-list">
              ${modelsHTML}
            </div>

            <div class="card-footer">
              <a href="${t.url}" target="_blank" rel="noopener" class="btn-visit">
                Access Terminal
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
            </div>
          </article>
        `;
      }).join('');
    }

    /* --- URL Persistence --- */
    function updateURL() {
      const params = new URLSearchParams();
      if (state.query) params.set('q', state.query);
      if (state.category !== 'All') params.set('cat', state.category);
      
      const newUrl = `${location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }

    function readURL() {
      const params = new URLSearchParams(location.search);
      const q = params.get('q');
      const cat = params.get('cat');
      
      if (q) state.query = q;
      if (cat && getCategories().includes(cat)) state.category = cat;
      
      searchInput.value = state.query;
    }

    /* --- Initialization --- */
    searchInput.addEventListener('input', (e) => {
      state.query = e.target.value;
      updateURL();
      renderGrid();
    });

    document.addEventListener('DOMContentLoaded', () => {
      readURL();
      renderCategories();
      renderGrid();
    });

    let lastY = 0;
const controls = document.querySelector('.controls-wrapper');

window.addEventListener('scroll', () => {
  const currentY = window.scrollY;

  if (currentY > lastY) {
    // scrolling down → hide
    controls.style.transform = "translateY(-120%)";
  } else {
    // scrolling up → show
    controls.style.transform = "translateY(0)";
  }

  lastY = currentY;
});
