// SA Tech - Clean professional javascript comparison logic

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile navigation
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isFlex = window.getComputedStyle(navMenu).display === 'flex';
            navMenu.style.display = isFlex ? 'none' : 'flex';
        });
    }

    // 2. Comparison Dataset
    const productData = {
        smartphones: {
            'samsung-a13': {
                name: 'Samsung Galaxy A13',
                score: 41,
                image: 'svg-phone',
                affiliate: 'temu',
                link: 'https://temu.com',
                currency: '€',
                configs: {
                    '128gb-6gb': { price: 345, spec1: '128GB Storage', spec2: '6GB RAM', spec3: '5000 mAh Battery', spec4: 'Octa-core 2.0 GHz' }
                }
            },
            'samsung-a17': {
                name: 'Samsung Galaxy A17 5G',
                score: 53,
                image: 'svg-phone',
                affiliate: 'amazon',
                link: 'https://amazon.co.za',
                currency: '$',
                configs: {
                    '256gb-8gb': { price: 232, spec1: '256GB Storage', spec2: '8GB RAM', spec3: '5000 mAh Battery', spec4: 'Dimensity 6100+' }
                }
            }
        },
        laptops: {
            'macbook-m3': {
                name: 'Apple MacBook Pro M3',
                score: 92,
                image: 'images/aesthetic_setup.png',
                affiliate: 'amazon',
                link: 'https://amazon.co.za',
                currency: 'R',
                configs: {
                    '8gb-256gb': { price: 34999, spec1: '256GB SSD', spec2: '8GB Unified RAM', spec3: '16 hours active battery', spec4: '42s compiles (React Native)' },
                    '16gb-512gb': { price: 44999, spec1: '512GB SSD', spec2: '16GB Unified RAM', spec3: '15 hours active battery', spec4: '38s compiles (React Native)' }
                }
            },
            'dell-xps': {
                name: 'Dell XPS 15 Intel',
                score: 78,
                image: 'images/aesthetic_setup.png',
                affiliate: 'amazon',
                link: 'https://amazon.co.za',
                currency: 'R',
                configs: {
                    '16gb-512gb': { price: 38999, spec1: '512GB SSD', spec2: '16GB DDR5 RAM', spec3: '9 hours active battery', spec4: '49s compiles (React Native)' },
                    '32gb-1tb': { price: 52999, spec1: '1TB SSD', spec2: '32GB DDR5 RAM', spec3: '8 hours active battery', spec4: '44s compiles (React Native)' }
                }
            }
        },
        monitors: {
            'gigabyte-g24f': {
                name: 'Gigabyte G24F-2 24"',
                score: 85,
                image: 'images/coding_monitor.png',
                affiliate: 'amazon',
                link: 'https://amazon.co.za',
                currency: 'R',
                configs: {
                    'standard': { price: 3499, spec1: '1080p FHD Resolution', spec2: '165Hz (O.C 180Hz)', spec3: 'SS IPS Panel Type', spec4: 'Height Adjustable Stand' }
                }
            },
            'lg-24gn650': {
                name: 'LG 24GN650-B 24"',
                score: 82,
                image: 'images/coding_monitor.png',
                affiliate: 'amazon',
                link: 'https://amazon.co.za',
                currency: 'R',
                configs: {
                    'standard': { price: 3299, spec1: '1080p FHD Resolution', spec2: '144Hz Refresh Rate', spec3: 'IPS Panel Type', spec4: 'Pivot and Height Stand' }
                }
            },
            'dell-s2721': {
                name: 'Dell S2721HSX 27"',
                score: 74,
                image: 'images/coding_monitor.png',
                affiliate: 'amazon',
                link: 'https://amazon.co.za',
                currency: 'R',
                configs: {
                    'standard': { price: 3899, spec1: '1080p FHD Resolution', spec2: '75Hz Refresh Rate', spec3: 'IPS Panel Type', spec4: 'Full Tilt, Pivot, Height' }
                }
            }
        }
    };

    // Spec label mapping per category
    const specLabels = {
        smartphones: ['Storage', 'RAM', 'Battery', 'Processor'],
        laptops: ['Storage', 'RAM', 'Battery Life', 'Compile Speed'],
        monitors: ['Resolution', 'Refresh Rate', 'Panel Type', 'Stand Ergonomics']
    };

    // DOM selectors for Comparison Tool
    const categorySelect = document.getElementById('category-select');
    const selectLeft = document.getElementById('select-left');
    const selectRight = document.getElementById('select-right');

    const configSelectLeft = document.getElementById('config-select-left');
    const configSelectRight = document.getElementById('config-select-right');

    // SVGs for smartphone placeholders
    const svgPhone = `<svg class="compare-product-img" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="5" y="2" width="14" height="20" rx="3" />
        <line x1="12" y1="18" x2="12.01" y2="18" stroke-width="3" stroke-linecap="round" />
        <line x1="11" y1="4" x2="13" y2="4" stroke-linecap="round" />
    </svg>`;

    function populateProductDropdowns() {
        const cat = categorySelect.value;
        const products = productData[cat];

        selectLeft.innerHTML = '';
        selectRight.innerHTML = '';

        Object.keys(products).forEach((key, index) => {
            const optLeft = document.createElement('option');
            optLeft.value = key;
            optLeft.textContent = products[key].name;
            selectLeft.appendChild(optLeft);

            const optRight = document.createElement('option');
            optRight.value = key;
            optRight.textContent = products[key].name;
            selectRight.appendChild(optRight);
        });

        // Set default separate selection
        const keys = Object.keys(products);
        if (keys.length > 1) {
            selectLeft.value = keys[0];
            selectRight.value = keys[1];
        }

        updateComparison();
    }

    function animatePointsCircle(circleId, score) {
        const circle = document.getElementById(circleId);
        if (!circle) return;
        const radius = 30;
        const circumference = 2 * Math.PI * radius;
        
        // Dash offset calculation
        const offset = circumference - (score / 100) * circumference;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;
    }

    function updateComparison() {
        const cat = categorySelect.value;
        const prodLeftKey = selectLeft.value;
        const prodRightKey = selectRight.value;

        const leftProd = productData[cat][prodLeftKey];
        const rightProd = productData[cat][prodRightKey];

        if (!leftProd || !rightProd) return;

        // 1. Titles
        document.getElementById('title-left').textContent = leftProd.name;
        document.getElementById('title-right').textContent = rightProd.name;

        // 2. Scores
        document.getElementById('score-num-left').textContent = leftProd.score;
        document.getElementById('score-num-right').textContent = rightProd.score;
        animatePointsCircle('circle-left', leftProd.score);
        animatePointsCircle('circle-right', rightProd.score);

        // 3. Images / SVGs
        const imgLeftContainer = document.getElementById('image-left-container');
        const imgRightContainer = document.getElementById('image-right-container');

        if (leftProd.image === 'svg-phone') {
            imgLeftContainer.innerHTML = svgPhone;
        } else {
            imgLeftContainer.innerHTML = `<img class="compare-product-img" src="${leftProd.image}" alt="${leftProd.name}">`;
        }

        if (rightProd.image === 'svg-phone') {
            imgRightContainer.innerHTML = svgPhone;
        } else {
            imgRightContainer.innerHTML = `<img class="compare-product-img" src="${rightProd.image}" alt="${rightProd.name}">`;
        }

        // 4. Config Dropdowns
        configSelectLeft.innerHTML = '';
        Object.keys(leftProd.configs).forEach(confKey => {
            const opt = document.createElement('option');
            opt.value = confKey;
            // Beautify text: replace hyphen with spaces
            opt.textContent = confKey.toUpperCase().replace('-', ' · ');
            configSelectLeft.appendChild(opt);
        });

        configSelectRight.innerHTML = '';
        Object.keys(rightProd.configs).forEach(confKey => {
            const opt = document.createElement('option');
            opt.value = confKey;
            opt.textContent = confKey.toUpperCase().replace('-', ' · ');
            configSelectRight.appendChild(opt);
        });

        // 5. Affiliate Buttons (Affiliate logic & colors)
        const btnLeft = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');

        // Reset classes
        btnLeft.className = 'affiliate-badge-btn';
        btnRight.className = 'affiliate-badge-btn';

        if (leftProd.affiliate === 'amazon') {
            btnLeft.classList.add('btn-amazon-outline');
            btnLeft.textContent = `Amazon SA`;
        } else {
            btnLeft.classList.add('btn-temu-outline');
            btnLeft.textContent = `Temu SA`;
        }

        if (rightProd.affiliate === 'amazon') {
            btnRight.classList.add('btn-amazon-outline');
            btnRight.textContent = `Amazon SA`;
        } else {
            btnRight.classList.add('btn-temu-outline');
            btnRight.textContent = `Temu SA`;
        }

        updatePricingAndSpecs();
    }

    function updatePricingAndSpecs() {
        const cat = categorySelect.value;
        const prodLeftKey = selectLeft.value;
        const prodRightKey = selectRight.value;

        const leftProd = productData[cat][prodLeftKey];
        const rightProd = productData[cat][prodRightKey];

        const confLeftKey = configSelectLeft.value;
        const confRightKey = configSelectRight.value;

        if (!leftProd || !rightProd || !confLeftKey || !confRightKey) return;

        const leftConf = leftProd.configs[confLeftKey];
        const rightConf = rightProd.configs[confRightKey];

        // Update pricing labels
        const leftPrice = leftProd.currency === 'R' ? `R${leftConf.price.toLocaleString('en-ZA')}` : `${leftProd.currency}${leftConf.price}`;
        const rightPrice = rightProd.currency === 'R' ? `R${rightConf.price.toLocaleString('en-ZA')}` : `${rightProd.currency}${rightConf.price}`;

        document.getElementById('price-left').textContent = leftPrice;
        document.getElementById('price-right').textContent = rightPrice;

        // Render Specs table
        const specsLabelsArr = specLabels[cat];
        const specsRowsContainer = document.getElementById('specs-rows-container');
        specsRowsContainer.innerHTML = '';

        // Add 4 spec rows
        for (let i = 1; i <= 4; i++) {
            const specProp = `spec${i}`;
            const row = document.createElement('div');
            row.className = 'specs-row';

            // Simple winner highlighter logic based on length or specific score context
            let leftWinner = '';
            let rightWinner = '';
            
            // Dummy logic: compare values, if it contains '16GB' vs '8GB' or similar
            const leftVal = leftConf[specProp];
            const rightVal = rightConf[specProp];

            // Highlight simple performance keywords
            if (leftVal.toLowerCase().includes('16gb') || leftVal.toLowerCase().includes('16 hour') || leftVal.toLowerCase().includes('42s') || leftVal.toLowerCase().includes('165hz') || leftVal.toLowerCase().includes('256gb')) {
                leftWinner = 'spec-winner';
            }
            if (rightVal.toLowerCase().includes('16gb') || rightVal.toLowerCase().includes('16 hour') || rightVal.toLowerCase().includes('38s') || rightVal.toLowerCase().includes('256gb') || rightVal.toLowerCase().includes('dimensity')) {
                rightWinner = 'spec-winner';
            }

            row.innerHTML = `
                <div class="specs-val-left ${leftWinner}">${leftVal}</div>
                <div class="specs-name">${specsLabelsArr[i-1]}</div>
                <div class="specs-val-right ${rightWinner}">${rightVal}</div>
            `;
            specsRowsContainer.appendChild(row);
        }
    }

    // Set up compare listeners
    if (categorySelect) {
        categorySelect.addEventListener('change', populateProductDropdowns);
        selectLeft.addEventListener('change', updateComparison);
        selectRight.addEventListener('change', updateComparison);
        configSelectLeft.addEventListener('change', updatePricingAndSpecs);
        configSelectRight.addEventListener('change', updatePricingAndSpecs);

        // Click buy buttons
        document.getElementById('btn-left').addEventListener('click', () => {
            const cat = categorySelect.value;
            const prod = productData[cat][selectLeft.value];
            alert(`Routing to ${prod.affiliate.toUpperCase()} for ${prod.name} (Active Affiliate Code Applied)`);
            window.open(prod.link, '_blank');
        });

        document.getElementById('btn-right').addEventListener('click', () => {
            const cat = categorySelect.value;
            const prod = productData[cat][selectRight.value];
            alert(`Routing to ${prod.affiliate.toUpperCase()} for ${prod.name} (Active Affiliate Code Applied)`);
            window.open(prod.link, '_blank');
        });

        // Initialize Comparison Widget
        populateProductDropdowns();
    }

    // 3. Tab Filter logic for Accessories
    const tabButtons = document.querySelectorAll('.tab-btn');
    const itemCards = document.querySelectorAll('.item-card');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            itemCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 4. Newsletter submission
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterFormFooter = document.getElementById('newsletter-form-footer');

    const handleSubscribe = (form) => {
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = form.querySelector('input');
                if (input && input.value) {
                    alert(`Subscription confirmed for: ${input.value}. You will receive weekly professional tech reviews.`);
                    input.value = '';
                }
            });
        }
    };

    handleSubscribe(newsletterForm);
    handleSubscribe(newsletterFormFooter);
});
