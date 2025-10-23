document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ICONS ---
    // A collection of all SVG icons used in the app.
    const ICONS = {
        ShieldCheck: (className = "") => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="${className}"><path d="M12 2l7 3v6c0 5.25-3.5 9.75-7 11-3.5-1.25-7-5.75-7-11V5l7-3z" fill="white" fillOpacity=".22" stroke="white" strokeOpacity=".85" strokeWidth="1.2"/><path d="M8.8 12.2l2.2 2.2 4.8-5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>`,
        Dashboard: (className = "") => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="${className}"><path d="M4 10.5l8-6 8 6V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>`,
        Car: (className = "") => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="${className}"><path d="M3.5 15h17M5 15l1.6-5.2A2 2 0 0 1 8.5 8h7a2 2 0 0 1 1.9 1.4L19 15m-11 0v2.5m7 0V15M6 19h2m8 0h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>`,
        Profile: (className = "") => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="${className}"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm7 8a7 7 0 0 0-14 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>`,
        Logout: (className = "") => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="${className}"><path d="M15 17l5-5-5-5M20 12H9M12 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>`,
        Plus: (className = "") => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="${className}"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>`,
        ArrowRight: (className = "") => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="${className}"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>`,
        Check: (className = "") => `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" class="${className}"><path d="M9 12.75l2 2 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>`,
        Doc: (className = "") => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="${className}"><path d="M7 3h7l4 4v11a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.6"/></svg>`,
        Fines: (className = "") => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" class="${className}"><path d="M14.5 16.5h2M17.5 16.5h2M12 2l-3 7H4l5 5-2 7 6-4 6 4-2-7 5-5h-5z"/></svg>`,
    };

    // --- 2. MOCK DATA & API SERVICE ---
    // Simulates fetching data from a backend service.
    const natisService = {
        daysFromNow: (n) => {
            const d = new Date();
            d.setDate(d.getDate() + n);
            return d.toISOString().slice(0, 10);
        },
        _MOCK_FINES: function() {
            return [
                { id: 'f1', amount: 250, reason: 'Speeding (80 in a 60 zone)', date: '2024-06-15', paid: false },
                { id: 'f2', amount: 500, reason: 'Illegal Parking', date: '2024-05-20', paid: false },
                { id: 'f3', amount: 150, reason: 'Expired Licence Disc', date: '2024-04-10', paid: true },
            ];
        },
        _MOCK_VEHICLES: function() {
            return [
                { id: "v1", make: "Toyota", model: "Hilux 2.8GD-6", plate: "WP 123 456", vin: "AHTKB3CD0J0123456", type: "LDV", color: "White", expiry: this.daysFromNow(180), status: "active", outstandingFines: [] },
                { id: "v2", make: "VW", model: "Polo 1.6", plate: "CA 987 654", vin: "WVZZZ6RZBY1234567", type: "Hatchback", color: "Red", expiry: this.daysFromNow(14), status: "expiring", outstandingFines: [this._MOCK_FINES()[0]] },
                { id: "v3", make: "Ford", model: "Ranger 2.2", plate: "CJ 456 321", vin: "6FPAAAJGSW1234567", type: "LDV", color: "Blue", expiry: this.daysFromNow(-5), status: "expired", outstandingFines: [this._MOCK_FINES()[1]] }
            ];
        },
        _MOCK_USER: { id: 'u1', name: 'Alex Johnson', email: 'mra@example.com', saIdNumber: '8001015009087' },
        simulateNetwork: (data, delay = 500) => new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay)),
        authenticate: async (email, pass) => {
            if (email && pass) return natisService.simulateNetwork(natisService._MOCK_USER, 1000);
            throw new Error('Invalid credentials');
        },
        fetchUserVehicles: async (userId) => natisService.simulateNetwork(natisService._MOCK_VEHICLES()),
        fetchUserFines: async (userId) => natisService.simulateNetwork(natisService._MOCK_FINES()),
        submitRenewal: async (vehicleId, docs, payment) => {
            const newExpiryDate = new Date();
            newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
            return natisService.simulateNetwork({ success: true, newExpiry: newExpiryDate.toISOString().slice(0, 10) }, 1500);
        }
    };

    // --- 3. STATE MANAGEMENT ---
    // A single object to hold the application's state.
    const appState = {
        isAuthenticated: false,
        user: null,
        vehicles: [],
        fines: [],
        route: 'auth',
        currentVehicleId: null,
        isLoading: false,
        // Renewal wizard specific state
        wizard: {
            step: 1,
            selectedVehicleId: null,
            docs: { id: null, address: null, rc1: null }
        }
    };

    const appContainer = document.getElementById('app-container');
    const loadingOverlay = document.getElementById('loading-overlay');

    // Function to update loading state
    const setLoading = (isLoading) => {
        appState.isLoading = isLoading;
        loadingOverlay.classList.toggle('hidden', !isLoading);
    };
    
    // --- 4. HTML TEMPLATE "COMPONENTS" ---
    // Functions that return HTML strings, mimicking React components.

    const createLayout = (headerTitle, content) => {
        return `
            <div class="min-h-screen bg-bglight">
                <header class="bg-surface border-b border-gray-200 sticky top-0 z-50">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex items-center justify-between h-16">
                            <div class="flex items-center gap-3">
                                <div class="bg-gradient-to-br from-brand to-blue-500 w-9 h-9 rounded-md grid place-items-center shadow-inner">
                                    ${ICONS.ShieldCheck()}
                                </div>
                                <span class="font-bold text-lg hidden sm:block">AJ Vehicle Services</span>
                            </div>
                            <div class="font-semibold">${headerTitle}</div>
                        </div>
                    </div>
                </header>
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
                    <div class="lg:grid lg:grid-cols-12 lg:gap-8">
                        <aside class="hidden lg:block lg:col-span-3">
                            <div class="sticky top-20 bg-surface border border-gray-200 rounded-xl shadow-md p-4 flex flex-col gap-1.5 h-[calc(100vh-104px)]">
                                <button data-route="dashboard" class="nav-link flex items-center gap-3 text-left w-full rounded-md font-medium transition-colors px-3 py-2.5 hover:bg-gray-100">${ICONS.Dashboard("w-5 h-5")} Dashboard</button>
                                <button data-route="vehicles" class="nav-link flex items-center gap-3 text-left w-full rounded-md font-medium transition-colors px-3 py-2.5 hover:bg-gray-100">${ICONS.Car("w-5 h-5")} My Vehicles</button>
                                <button data-route="fines" class="nav-link flex items-center gap-3 text-left w-full rounded-md font-medium transition-colors px-3 py-2.5 hover:bg-gray-100">${ICONS.Fines("w-5 h-5")} Fines & Penalties</button>
                                <button data-route="profile" class="nav-link flex items-center gap-3 text-left w-full rounded-md font-medium transition-colors px-3 py-2.5 hover:bg-gray-100">${ICONS.Profile("w-5 h-5")} My Profile</button>
                                <div class="mt-auto">
                                    <button id="logout-btn" class="flex items-center justify-between gap-3 text-left w-full rounded-md font-medium transition-colors px-3 py-2.5 hover:bg-gray-100">
                                        <span>Logout</span>
                                        ${ICONS.Logout()}
                                    </button>
                                </div>
                            </div>
                        </aside>
                        <main class="lg:col-span-9 screen-view">${content}</main>
                    </div>
                </div>
                <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 grid grid-cols-4 z-50">
                    <button data-route="dashboard" class="tab-link grid place-items-center gap-1.5 p-2 text-xs">${ICONS.Dashboard()} <span>Dashboard</span></button>
                    <button data-route="vehicles" class="tab-link grid place-items-center gap-1.5 p-2 text-xs">${ICONS.Car()} <span>Vehicles</span></button>
                    <button data-route="fines" class="tab-link grid place-items-center gap-1.5 p-2 text-xs">${ICONS.Fines()} <span>Fines</span></button>
                    <button data-route="profile" class="tab-link grid place-items-center gap-1.5 p-2 text-xs">${ICONS.Profile()} <span>Profile</span></button>
                </nav>
                <div class="h-16 lg:hidden"></div>
            </div>`;
    };

    const createTag = (status, vehicle) => {
        const daysUntil = (dateStr) => {
            const d = new Date(dateStr); const now = new Date();
            d.setHours(0,0,0,0); now.setHours(0,0,0,0);
            return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        };
        
        let bgColor = 'bg-green-100', textColor = 'text-green-800', borderColor = 'border-green-200', label = 'Active';
        const days = daysUntil(vehicle.expiry);

        if (status === 'expiring') {
            [bgColor, textColor, borderColor, label] = ['bg-amber-100', 'text-amber-800', 'border-amber-200', `Expires in ${days} days`];
        } else if (status === 'expired') {
            [bgColor, textColor, borderColor, label] = ['bg-red-100', 'text-red-800', 'border-red-200', `Expired`];
        }
        return `<span class="inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full border ${bgColor} ${textColor} ${borderColor}">${label}</span>`;
    };
    
    const createVehicleCard = (vehicle, showRenewButton = false) => `
        <div class="bg-surface border border-gray-200 rounded-xl shadow-md p-4 grid gap-3 hover:shadow-lg transition-shadow cursor-pointer" data-route="vehicleDetail" data-id="${vehicle.id}">
            <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                    ${ICONS.Car("text-brand w-6 h-6")}
                    <div>
                        <div class="font-semibold text-gray-800">${vehicle.make} ${vehicle.model}</div>
                        <div class="text-muted text-sm">${vehicle.plate}</div>
                    </div>
                </div>
                ${createTag(vehicle.status, vehicle)}
            </div>
            <div class="flex gap-2">
                <button data-route="vehicleDetail" data-id="${vehicle.id}" class="w-full text-center px-4 py-2 text-sm font-semibold text-brand bg-blue-100 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors">View Disc</button>
                ${showRenewButton ? `<button data-route="renew" data-id="${vehicle.id}" class="w-full text-center px-4 py-2 text-sm font-semibold text-white bg-brand rounded-lg hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors">Renew</button>` : ''}
            </div>
        </div>`;

    // --- 5. SCREEN RENDERERS ---
    // Each function is responsible for rendering a specific "page" or "screen".
    
    const renderAuthScreen = () => {
        appContainer.innerHTML = `
            <div class="min-h-screen bg-bglight flex items-center justify-center p-4 screen-view">
              <div class="max-w-md w-full bg-surface p-6 sm:p-8 rounded-xl shadow-lg">
                <div class="text-center mb-6">
                  <div class="inline-flex items-center gap-3">
                    <div class="bg-gradient-to-br from-brand to-blue-500 w-10 h-10 rounded-lg grid place-items-center shadow-inner">
                        ${ICONS.ShieldCheck()}
                    </div>
                    <h1 class="text-2xl font-bold text-gray-800">AJ Vehicle Services</h1>
                  </div>
                  <p class="text-muted mt-2">Secure access to renew your vehicle discs.</p>
                </div>
                <form id="login-form" class="space-y-4">
                  <div>
                    <label for="email" class="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
                    <input id="email" type="email" value="mra@example.com" placeholder="you@example.com" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand"/>
                  </div>
                  <div>
                    <label for="password" class="text-sm font-medium text-gray-700 block mb-1">Password</label>
                    <input id="password" type="password" value="password" placeholder="••••••••" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand"/>
                  </div>
                   <div class="flex items-center">
                        <input id="popia" name="popia" type="checkbox" required checked class="h-4 w-4 text-brand border-gray-300 rounded focus:ring-brand"/>
                        <label for="popia" class="ml-2 block text-sm text-gray-700">I consent to data sharing with NaTIS as per POPIA.</label>
                    </div>
                  <button type="submit" class="w-full flex justify-center items-center gap-2 px-4 py-3 text-white bg-brand rounded-lg hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:bg-gray-400 transition-colors shadow-md hover:shadow-lg">
                    <span>Secure Login</span>
                    ${ICONS.ArrowRight()}
                  </button>
                   <div class="text-center text-muted text-sm mt-4">Demo: Any credentials will work.</div>
                </form>
              </div>
            </div>`;
    };

    const renderDashboardScreen = () => {
        const expiringVehicles = appState.vehicles.filter(v => v.status === 'expiring' || v.status === 'expired');
        const outstandingFines = appState.fines.filter(f => !f.paid);

        const alertsHtml = (expiringVehicles.length > 0 || outstandingFines.length > 0) ? `
            <section>
                <h2 class="text-xl font-bold text-gray-800 mb-2">Alerts</h2>
                <div class="space-y-3">
                    ${expiringVehicles.map(v => `
                        <div class="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center justify-between">
                            <p><span class="font-bold">${v.make} ${v.model} (${v.plate})</span> disc is ${v.status}.</p>
                            <button data-route="renew" data-id="${v.id}" class="bg-amber-200 text-amber-900 px-3 py-1 rounded-md text-sm font-semibold hover:bg-amber-300">Renew Now</button>
                        </div>
                    `).join('')}
                    ${outstandingFines.length > 0 ? `
                        <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
                            <p>You have <span class="font-bold">${outstandingFines.length} outstanding fine(s).</span></p>
                            <button data-route="fines" class="bg-red-200 text-red-900 px-3 py-1 rounded-md text-sm font-semibold hover:bg-red-300">View Fines</button>
                        </div>` : ''}
                </div>
            </section>` : '';
        
        const vehiclesHtml = appState.vehicles.length > 0 ? `
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                ${appState.vehicles.map(v => createVehicleCard(v, true)).join('')}
            </div>` : `
            <div class="text-center py-10 bg-surface rounded-xl border border-dashed">
                <p class="text-muted">No vehicles found.</p>
                <button data-route="renew" class="mt-2 text-brand font-semibold">Add your first vehicle</button>
            </div>`;

        const content = `
            <div class="space-y-6">
                ${alertsHtml}
                <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-surface border border-gray-200 rounded-xl p-5 flex flex-col items-start gap-3">
                        <div class="bg-blue-100 text-brand p-2 rounded-full">${ICONS.Plus("w-6 h-6")}</div>
                        <h3 class="text-lg font-bold">Renew a Vehicle Disc</h3>
                        <p class="text-muted text-sm flex-grow">Start a guided, step-by-step process to renew your licence disc online.</p>
                        <button data-route="renew" class="w-full md:w-auto text-center px-4 py-2 text-sm font-semibold text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors">Start Renewal</button>
                    </div>
                    <div class="bg-surface border border-gray-200 rounded-xl p-5 flex flex-col items-start gap-3">
                         <div class="bg-red-100 text-error p-2 rounded-full">${ICONS.Fines("w-6 h-6")}</div>
                        <h3 class="text-lg font-bold">Fines & Ownership</h3>
                        <p class="text-muted text-sm flex-grow">Check for outstanding fines or start a change of ownership process.</p>
                        <button data-route="fines" class="w-full md:w-auto text-center px-4 py-2 text-sm font-semibold text-brand bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">Manage Fines</button>
                    </div>
                </section>
                <section>
                    <h2 class="text-xl font-bold text-gray-800 mb-3">My Vehicles</h2>
                    ${vehiclesHtml}
                </section>
            </div>`;

        const headerTitle = `Welcome, ${appState.user.name.split(' ')[0]}`;
        appContainer.innerHTML = createLayout(headerTitle, content);
    };

    const renderVehiclesScreen = () => {
        const content = `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <h1 class="text-xl font-bold text-gray-800">Your Registered Vehicles</h1>
                    <button data-route="renew" class="px-4 py-2 text-sm font-semibold text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors">Add Vehicle</button>
                </div>
                ${appState.vehicles.length > 0 ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        ${appState.vehicles.map(v => createVehicleCard(v, true)).join('')}
                    </div>` : `
                    <div class="text-center py-16 bg-surface rounded-xl border border-dashed">
                        <p class="text-muted">You haven't added any vehicles yet.</p>
                        <button data-route="renew" class="mt-2 text-brand font-semibold">Add your first vehicle to get started</button>
                    </div>`}
            </div>`;
        appContainer.innerHTML = createLayout("My Vehicles", content);
    };

    const renderVehicleDetailScreen = () => {
        const vehicle = appState.vehicles.find(v => v.id === appState.currentVehicleId);
        if (!vehicle) {
            appContainer.innerHTML = createLayout("Error", `<p>Vehicle not found.</p>`);
            return;
        }

        const content = `
        <div class="bg-surface rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">${vehicle.make} ${vehicle.model}</h2>
                    <p class="text-muted">${vehicle.plate}</p>
                </div>
                ${createTag(vehicle.status, vehicle)}
            </div>

            <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div class="w-[180px] h-[180px] bg-white rounded-lg border border-gray-200 grid place-items-center overflow-hidden">
                    <canvas id="qr-canvas"></canvas>
                </div>
                <div class="flex-grow w-full">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-sm font-medium text-gray-500">Vehicle Type</label>
                            <p class="font-semibold text-gray-800">${vehicle.type}</p>
                        </div>
                         <div>
                            <label class="text-sm font-medium text-gray-500">Colour</label>
                            <p class="font-semibold text-gray-800">${vehicle.color}</p>
                        </div>
                        <div class="col-span-2">
                            <label class="text-sm font-medium text-gray-500">VIN</label>
                            <p class="font-semibold text-gray-800 truncate">${vehicle.vin}</p>
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-500">Licence Plate</label>
                            <p class="font-semibold text-gray-800">${vehicle.plate}</p>
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-500">Expiry Date</label>
                            <p class="font-semibold text-gray-800">${new Date(vehicle.expiry).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <p class="text-sm text-muted mt-4">This digital disc can be verified by any law enforcement officer by scanning the QR code.</p>
                </div>
            </div>

             <div class="border-t border-gray-200 pt-4 flex flex-wrap gap-3">
                <button data-route="renew" data-id="${vehicle.id}" class="px-4 py-2 text-sm font-semibold text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors">Start Renewal</button>
                <button id="download-pdf-btn" class="px-4 py-2 text-sm font-semibold text-brand bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">Download PDF</button>
                <button id="remove-vehicle-btn" data-id="${vehicle.id}" class="px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors ml-auto">Remove Vehicle</button>
            </div>
        </div>`;
        
        appContainer.innerHTML = createLayout("Digital Vehicle Disc", content);
        
        // Draw the QR code
        const drawPseudoQR = (canvas, text) => {
          const size = 180;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
        
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, size, size);
          ctx.strokeStyle = '#111';
          ctx.lineWidth = 4;
          const s = size / 6;
          const markers = [[0, 0], [size - 3 * s, 0], [0, size - 3 * s]];
          
          markers.forEach(([x, y]) => {
            ctx.strokeRect(x + 6, y + 6, 3 * s - 12, 3 * s - 12);
            ctx.strokeRect(x + 12, y + 12, 3 * s - 24, 3 * s - 24);
            ctx.fillStyle = '#111';
            ctx.fillRect(x + (3 * s) / 2 - 10, y + (3 * s) / 2 - 10, 20, 20);
          });
        
          let hash = 0;
          for (let i = 0; i < text.length; i++) {
            hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
          }
          const cols = 25, rows = 25;
          const cw = size / cols, ch = size / rows;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              hash = (hash ^ (r * 73856093 ^ c * 19349663)) >>> 0;
              if ((hash & 7) === 0) {
                ctx.fillStyle = '#111';
                ctx.fillRect(c * cw, r * ch, Math.ceil(cw - 1), Math.ceil(ch - 1));
              }
            }
          }
        };
        const canvas = document.getElementById('qr-canvas');
        if (canvas) {
            const qrText = `AJ-VERIFY|${vehicle.plate}|${vehicle.vin}|${vehicle.expiry}`;
            drawPseudoQR(canvas, qrText);
        }
    };

    const renderFinesScreen = () => {
        const createFineItem = (fine) => `
            <div class="bg-white p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <p class="font-semibold">R ${fine.amount.toFixed(2)}</p>
                    <p class="text-sm text-gray-600">${fine.reason}</p>
                    <p class="text-xs text-muted">Issued: ${new Date(fine.date).toLocaleDateString()}</p>
                </div>
                ${fine.paid 
                    ? `<span class="text-sm font-medium px-3 py-1 rounded-full bg-green-100 text-green-800">Paid</span>`
                    : `<button class="px-4 py-2 text-sm font-semibold text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors w-full sm:w-auto">Pay Fine</button>`
                }
            </div>`;
        
        const paidFines = appState.fines.filter(f => f.paid);
        const unpaidFines = appState.fines.filter(f => !f.paid);
        
        const content = `
        <div class="space-y-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">Fines & Penalties</h1>
                <p class="text-muted mt-1">View and pay outstanding traffic fines linked to your vehicles.</p>
            </div>
            ${unpaidFines.length > 0 ? `
                 <div class="bg-surface rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 space-y-4">
                    <h2 class="text-lg font-semibold">Outstanding Fines</h2>
                    <div class="space-y-3">${unpaidFines.map(createFineItem).join('')}</div>
                </div>` : ''}
            ${paidFines.length > 0 ? `
                <div class="bg-surface rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 space-y-4">
                    <h2 class="text-lg font-semibold">Payment History</h2>
                    <div class="space-y-3">${paidFines.map(createFineItem).join('')}</div>
                </div>` : ''}
            ${appState.fines.length === 0 ? `
                 <div class="text-center py-16 bg-surface rounded-xl border border-dashed">
                    <p class="text-lg font-medium text-gray-700">No Fines Found</p>
                    <p class="text-muted mt-1">You have no outstanding or historical fines.</p>
                </div>` : ''}
        </div>`;
        
        appContainer.innerHTML = createLayout("Fines & Penalties", content);
    };

    const renderProfileScreen = () => {
        const { user } = appState;
        const content = `
        <div class="space-y-6">
             <div class="bg-surface rounded-xl shadow-md border border-gray-200 p-4 sm:p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-4">My Profile</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" value="${user.name}" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" value="${user.email}" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div class="md:col-span-2">
                        <label class="text-sm font-medium text-gray-700">South African ID Number</label>
                        <input type="text" value="${user.saIdNumber}" disabled class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" />
                    </div>
                </div>
                 <div class="mt-6 border-t pt-4">
                    <button class="px-4 py-2 text-sm font-semibold text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors">Save Changes</button>
                </div>
             </div>
              <div class="bg-surface rounded-xl shadow-md border border-gray-200 p-4 sm:p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-4">Support & Helpdesk</h2>
                 <div class="space-y-3">
                    <a href="#" class="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"><span>Frequently Asked Questions</span><span>&rarr;</span></a>
                    <a href="#" class="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"><span>Contact Support (WhatsApp)</span><span>&rarr;</span></a>
                </div>
            </div>
            <div class="mt-4">
                 <button id="logout-btn-mobile" class="w-full text-center px-4 py-2.5 font-semibold text-error bg-red-100 rounded-lg hover:bg-red-200 transition-colors">Logout</button>
            </div>
        </div>`;
        appContainer.innerHTML = createLayout("My Profile", content);
    };

    const renderRenewWizardScreen = () => {
        const { step, selectedVehicleId, docs } = appState.wizard;
        const steps = ["Select Vehicle", "Upload Documents", "Review & Pay", "Confirmation"];
        const progressPct = Math.round(((step - 1) / (steps.length - 1)) * 100);

        const renderStepContent = () => {
            switch (step) {
                case 1:
                    return `
                        <div id="vehicle-selection" class="space-y-3">
                            ${appState.vehicles.map(v => `
                            <div data-id="${v.id}" class="vehicle-select-item p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedVehicleId === v.id ? 'border-brand bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        ${ICONS.Car("text-brand")}
                                        <div>
                                            <p class="font-semibold">${v.make} ${v.model}</p>
                                            <p class="text-sm text-muted">${v.plate}</p>
                                        </div>
                                    </div>
                                    ${selectedVehicleId === v.id ? `<div class="w-6 h-6 bg-brand text-white rounded-full grid place-items-center">${ICONS.Check("w-4 h-4")}</div>` : ''}
                                </div>
                            </div>
                            `).join('')}
                        </div>
                        <div class="flex justify-end pt-4">
                            <button id="wizard-next" ${!selectedVehicleId ? 'disabled' : ''} class="px-6 py-2.5 font-semibold text-white bg-brand rounded-lg hover:bg-brand-dark disabled:bg-gray-400">Next</button>
                        </div>`;
                case 2:
                    const docItem = (label, key, isUploaded) => `
                        <div class="p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between gap-3">
                            <div class="flex items-center gap-3">
                                ${ICONS.Doc("text-gray-500")}
                                <div><p class="font-semibold">${label}</p><p class="text-sm text-muted">${isUploaded ? 'File selected' : 'Pending upload'}</p></div>
                            </div>
                            <input type="file" data-doc-key="${key}" class="text-sm" />
                        </div>`;
                    return `
                        <div class="space-y-3">
                            ${docItem("Copy of ID", "id", !!docs.id)}
                            ${docItem("Proof of Address", "address", !!docs.address)}
                            ${docItem("Vehicle Registration (RC1)", "rc1", !!docs.rc1)}
                        </div>
                        <div class="flex justify-between pt-4">
                            <button id="wizard-back" class="px-6 py-2.5 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Back</button>
                            <button id="wizard-next" ${!docs.id || !docs.address || !docs.rc1 ? 'disabled' : ''} class="px-6 py-2.5 font-semibold text-white bg-brand rounded-lg hover:bg-brand-dark disabled:bg-gray-400">Next</button>
                        </div>`;
                case 3:
                    return `
                         <div class="space-y-4">
                            <div class="bg-gray-50 p-4 rounded-lg border">
                                <div class="flex justify-between items-center text-sm"><span class="text-gray-600">Licence Renewal Fee</span><span class="font-medium">R 250.00</span></div>
                                <div class="flex justify-between items-center text-sm mt-1"><span class="text-gray-600">Service & Admin Fee</span><span class="font-medium">R 149.00</span></div>
                                <div class="border-t my-2"></div>
                                <div class="flex justify-between items-center font-bold"><span>Total Due</span><span>R 399.00</span></div>
                            </div>
                            <div class="space-y-3">
                                 <input placeholder="Card Number" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                 <div class="grid grid-cols-2 gap-3">
                                    <input placeholder="MM / YY" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                    <input placeholder="CVC" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                 </div>
                            </div>
                            <div class="flex justify-between pt-4">
                                <button id="wizard-back" class="px-6 py-2.5 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Back</button>
                                <button id="wizard-pay" class="px-6 py-2.5 font-semibold text-white bg-brand rounded-lg hover:bg-brand-dark disabled:bg-gray-400">Securely Pay R 399.00</button>
                            </div>
                        </div>`;
                case 4:
                    return `
                        <div class="text-center py-8">
                            <div class="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full grid place-items-center mb-4">${ICONS.Check("w-8 h-8")}</div>
                            <h3 class="text-xl font-bold">Renewal Submitted</h3>
                            <p class="text-muted mt-1">Your new digital disc will be available shortly.</p>
                            <button data-route="dashboard" class="mt-6 px-6 py-2.5 font-semibold text-white bg-brand rounded-lg hover:bg-brand-dark">Back to Dashboard</button>
                        </div>`;
            }
        };

        const content = `
            <div class="space-y-4">
                <div class="bg-surface p-4 rounded-xl border border-gray-200">
                    <div class="flex justify-between items-center">
                        <span class="font-bold">Vehicle Disc Renewal</span>
                        <span class="text-sm text-muted">${steps[step-1]} - Step ${step} of ${steps.length}</span>
                    </div>
                    <div class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-brand rounded-full transition-all duration-300" style="width: ${progressPct}%"></div>
                    </div>
                </div>
                <div class="bg-surface p-4 sm:p-6 rounded-xl border border-gray-200">
                    <h2 class="text-lg font-bold mb-4">${steps[step-1]}</h2>
                    ${renderStepContent()}
                </div>
            </div>`;
        
        appContainer.innerHTML = createLayout("Renew Disc", content);
    };


    // --- 6. ROUTING & EVENT HANDLING ---
    
    const setRoute = (newRoute, id = null) => {
        appState.route = newRoute;
        appState.currentVehicleId = id || appState.currentVehicleId; // Persist if no new one
        if (newRoute === 'vehicleDetail' && id) {
             appState.currentVehicleId = id;
        }
        if (newRoute === 'renew') {
            appState.wizard.step = 1; // Reset wizard on entry
            appState.wizard.selectedVehicleId = id || null;
            appState.wizard.docs = { id: null, address: null, rc1: null };
        }
        render();
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        const form = event.target;
        const email = form.email.value;
        const password = form.password.value;
        setLoading(true);
        try {
            const user = await natisService.authenticate(email, password);
            appState.isAuthenticated = true;
            appState.user = user;
            await refreshData();
            setRoute('dashboard');
        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    const logout = () => {
        Object.assign(appState, {
            isAuthenticated: false, user: null, vehicles: [], fines: [],
            route: 'auth', currentVehicleId: null, isLoading: false,
        });
        render();
    };
    
    const refreshData = async () => {
        if (!appState.user) return;
        setLoading(true);
        try {
            const [vehicles, fines] = await Promise.all([
                natisService.fetchUserVehicles(appState.user.id),
                natisService.fetchUserFines(appState.user.id)
            ]);
            appState.vehicles = vehicles;
            appState.fines = fines;
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const updateActiveNavLinks = () => {
        document.querySelectorAll('.nav-link, .tab-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.route === appState.route) {
                link.classList.add('active');
            }
        });
    };
    
    // Global click handler for routing and actions
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-route]');
        if (target) {
            e.preventDefault();
            e.stopPropagation();
            setRoute(target.dataset.route, target.dataset.id || null);
            return;
        }

        const logoutBtn = e.target.closest('#logout-btn, #logout-btn-mobile');
        if (logoutBtn) {
            logout();
            return;
        }

        // Wizard-specific clicks
        if (appState.route === 'renew') {
            const vehicleSelectItem = e.target.closest('.vehicle-select-item');
            if (vehicleSelectItem) {
                appState.wizard.selectedVehicleId = vehicleSelectItem.dataset.id;
                renderRenewWizardScreen(); // Re-render to show selection
                return;
            }
            if (e.target.id === 'wizard-next') {
                appState.wizard.step++;
                renderRenewWizardScreen();
                return;
            }
            if (e.target.id === 'wizard-back') {
                appState.wizard.step--;
                renderRenewWizardScreen();
                return;
            }
            if (e.target.id === 'wizard-pay') {
                const handlePayment = async () => {
                    setLoading(true);
                    await natisService.submitRenewal(appState.wizard.selectedVehicleId, appState.wizard.docs, { total: 399.00 });
                    await refreshData();
                    setLoading(false);
                    appState.wizard.step = 4;
                    renderRenewWizardScreen();
                };
                handlePayment();
                return;
            }
        }

        // Vehicle Detail actions
        if (appState.route === 'vehicleDetail') {
            if (e.target.id === 'download-pdf-btn') alert('PDF download feature coming soon!');
            if (e.target.id === 'remove-vehicle-btn') {
                const vehicleId = e.target.dataset.id;
                const vehicle = appState.vehicles.find(v => v.id === vehicleId);
                if (confirm(`Are you sure you want to remove ${vehicle.make} ${vehicle.model}?`)) {
                    appState.vehicles = appState.vehicles.filter(v => v.id !== vehicleId);
                    setRoute('vehicles');
                }
            }
        }
    });

    // Global change handler (for file inputs)
    document.addEventListener('change', e => {
        if (appState.route === 'renew' && e.target.matches('input[type="file"]')) {
            const docKey = e.target.dataset.docKey;
            appState.wizard.docs[docKey] = e.target.files[0];
            renderRenewWizardScreen(); // Re-render to update UI state
        }
    });

    // --- 7. MAIN RENDER FUNCTION & INITIALIZATION ---

    const render = () => {
        if (!appState.isAuthenticated) {
            renderAuthScreen();
            // Attach login form handler ONLY when it's rendered
            const loginForm = document.getElementById('login-form');
            if (loginForm) loginForm.addEventListener('submit', handleLogin);
            return;
        }

        switch (appState.route) {
            case 'dashboard': renderDashboardScreen(); break;
            case 'vehicles': renderVehiclesScreen(); break;
            case 'vehicleDetail': renderVehicleDetailScreen(); break;
            case 'fines': renderFinesScreen(); break;
            case 'profile': renderProfileScreen(); break;
            case 'renew': renderRenewWizardScreen(); break;
            default: renderDashboardScreen();
        }
        
        updateActiveNavLinks();
    };

    // Initial call to render the app
    render();
});
