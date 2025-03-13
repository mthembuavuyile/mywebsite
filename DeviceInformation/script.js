document.addEventListener('DOMContentLoaded', () => {
    // Main data storage object
    const deviceData = {
        timestamp: new Date().toISOString(),
        version: '2.0'
    };

    // Configuration options
    const config = {
        speedTestSampleSize: 5, // MB
        benchmarkIterations: 1000000,
        refreshInterval: null,
        autoRefresh: false,
        refreshRate: 60000, // 1 minute
        apiEndpoints: {
            ipInfo: 'https://ipapi.co/json/',
            speedTest: 'https://via.placeholder.com/5MB.jpg'
        }
    };

    // Cache UI Elements for better performance
    const elements = {
        loader: document.getElementById('pageLoader'),
        themeToggle: document.getElementById('themeToggle'),
        themeIcon: document.getElementById('themeIcon'),
        refreshBtn: document.getElementById('refreshBtn'),
        exportBtn: document.getElementById('exportBtn'),
        settingsBtn: document.getElementById('settingsBtn'),
        settingsModal: document.getElementById('settingsModal'),
        closeModalBtn: document.getElementById('closeModalBtn'),
        closeModalFooterBtn: document.getElementById('closeModalFooterBtn'),
        tabs: document.querySelectorAll('.tab'),
        tabContents: document.querySelectorAll('.tab-content'),
        getLocationBtn: document.getElementById('getLocationBtn'),
        testSpeedBtn: document.getElementById('testSpeedBtn'),
        runBenchmarkBtn: document.getElementById('runBenchmarkBtn'),
        copyJsonBtn: document.getElementById('copyJsonBtn'),
        prettifyJsonBtn: document.getElementById('prettifyJsonBtn'),
        copyBashBtn: document.getElementById('copyBashBtn'),
        toastContainer: document.getElementById('toastContainer'),
        autoRefreshToggle: document.getElementById('autoRefreshToggle'),
        refreshRateInput: document.getElementById('refreshRateInput'),
        jsonOutput: document.getElementById('jsonOutput'),
        speedTestResults: document.getElementById('speedTestResults'),
        benchmarkDetails: document.getElementById('benchmarkDetails'),
        map: document.getElementById('map')
    };

    // ==================== THEME HANDLING ====================
    
    /**
     * Toggle between light and dark theme
     */
    const toggleTheme = () => {
        const isDarkMode = document.body.classList.toggle('dark-theme');
        document.body.classList.remove('auto-theme');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        updateThemeIcon(isDarkMode);
    };

    /**
     * Update theme icon based on current theme
     * @param {boolean} isDark - Whether dark mode is active
     */
    const updateThemeIcon = (isDark) => {
        if (isDark) {
            // Moon icon for dark mode
            elements.themeIcon.innerHTML = `
                <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
            `;
            elements.themeToggle.setAttribute('aria-label', 'Switch to light mode');
            const tooltipEl = elements.themeToggle.querySelector('.tooltip-text');
            if (tooltipEl) tooltipEl.textContent = 'Switch to light mode';
        } else {
            // Sun icon for light mode
            elements.themeIcon.innerHTML = `
                <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
            `;
            elements.themeToggle.setAttribute('aria-label', 'Switch to dark mode');
            const tooltipEl = elements.themeToggle.querySelector('.tooltip-text');
            if (tooltipEl) tooltipEl.textContent = 'Switch to dark mode';
        }
    };

    /**
     * Set theme based on saved preference or system preference
     */
    const setThemePreference = () => {
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('auto-theme');
            updateThemeIcon(true);
        } else if (savedTheme === 'light') {
            document.body.classList.remove('dark-theme');
            document.body.classList.remove('auto-theme');
            updateThemeIcon(false);
        } else {
            document.body.classList.add('auto-theme');
            const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDarkMode) document.body.classList.add('dark-theme');
            updateThemeIcon(prefersDarkMode);
        }
    };

    // ==================== DEVICE INFORMATION ====================
    
    /**
     * Gather comprehensive device information
     */
    const gatherDeviceInfo = async () => {
        try {
            const ua = navigator.userAgent;
            const browserInfo = detectBrowser(ua);
            
            // Basic device info
            updateElement('deviceType', /Mobile|Android|iPhone|iPad|iPod|Windows Phone/i.test(ua) ? 'Mobile' : 'Desktop');
            updateElement('platform', navigator.platform || 'Unknown');
            updateElement('browser', browserInfo.browser);
            updateElement('browserVersion', browserInfo.version);
            updateElement('userAgent', ua);
            
            // Screen info
            updateElement('resolution', `${window.screen.width}x${window.screen.height}`);
            updateElement('viewportSize', `${window.innerWidth}x${window.innerHeight}`);
            updateElement('pixelRatio', window.devicePixelRatio);
            updateElement('colorDepth', `${window.screen.colorDepth}-bit`);
            updateElement('orientation', window.screen.orientation ? window.screen.orientation.type : 'N/A');
            updateElement('touchSupport', 'ontouchstart' in window ? 'Yes' : 'No');
            
            // System info
            updateElement('language', navigator.language);
            updateElement('languages', navigator.languages?.join(', ') || navigator.language);
            updateElement('cookiesEnabled', navigator.cookieEnabled ? 'Yes' : 'No');
            updateElement('doNotTrack', navigator.doNotTrack || 'Not specified');
            updateElement('cpuCores', navigator.hardwareConcurrency || 'Unknown');
            updateElement('deviceMemory', navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown');
            updateElement('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
            updateElement('timezoneOffset', `UTC${new Date().getTimezoneOffset() > 0 ? '-' : '+'}${Math.abs(new Date().getTimezoneOffset() / 60)}`);
            
            // Feature detection
            updateElement('webGLSupport', 'WebGLRenderingContext' in window ? 'Supported' : 'Not supported');
            updateElement('canvasSupport', 'HTMLCanvasElement' in window ? 'Supported' : 'Not supported');
            updateElement('webSocketSupport', 'WebSocket' in window ? 'Supported' : 'Not supported');
            updateElement('webWorkerSupport', 'Worker' in window ? 'Supported' : 'Not supported');
            updateElement('serviceWorkerSupport', 'serviceWorker' in navigator ? 'Supported' : 'Not supported');
            updateElement('localStorageSupport', 'localStorage' in window ? 'Supported' : 'Not supported');
            updateElement('indexedDBSupport', 'indexedDB' in window ? 'Supported' : 'Not supported');
            
            // OS detection
            const osInfo = detectOS(ua);
            updateElement('operatingSystem', osInfo.name);
            updateElement('osVersion', osInfo.version);
            
            // Hardware detection
            await checkHardwareSupport();
            
            // Store all device info in deviceData
            deviceData.device = {
                type: getElementText('deviceType'),
                platform: getElementText('platform'),
                browser: {
                    name: getElementText('browser'),
                    version: getElementText('browserVersion')
                },
                operatingSystem: {
                    name: getElementText('operatingSystem'),
                    version: getElementText('osVersion')
                },
                screen: {
                    resolution: getElementText('resolution'),
                    viewport: getElementText('viewportSize'),
                    pixelRatio: window.devicePixelRatio,
                    colorDepth: getElementText('colorDepth'),
                    orientation: getElementText('orientation'),
                    touchSupport: getElementText('touchSupport') === 'Yes'
                },
                system: {
                    language: navigator.language,
                    languages: navigator.languages?.join(', ') || navigator.language,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    timezoneOffset: getElementText('timezoneOffset'),
                    cookiesEnabled: navigator.cookieEnabled,
                    cpuCores: navigator.hardwareConcurrency || null,
                    memory: navigator.deviceMemory || null
                },
                features: {
                    webGL: 'WebGLRenderingContext' in window,
                    canvas: 'HTMLCanvasElement' in window,
                    webSocket: 'WebSocket' in window,
                    webWorker: 'Worker' in window,
                    serviceWorker: 'serviceWorker' in navigator,
                    localStorage: 'localStorage' in window,
                    indexedDB: 'indexedDB' in window
                },
                userAgent: ua
            };
        } catch (error) {
            console.error('Error gathering device info:', error);
            showToast('Failed to gather device information', 'error');
        }
    };

    /**
     * Detect browser name and version from user agent
     * @param {string} ua - User agent string
     * @returns {Object} Browser name and version
     */
    const detectBrowser = (ua) => {
        let browser = 'Unknown';
        let version = 'Unknown';
        
        // Chrome
        if (/chrome|chromium|crios/i.test(ua)) {
            browser = 'Chrome';
            version = ua.match(/(chrome|chromium|crios)\/(\d+(\.\d+)?)/i)?.[2] || '';
        } 
        // Firefox
        else if (/firefox|fxios/i.test(ua)) {
            browser = 'Firefox';
            version = ua.match(/(firefox|fxios)\/(\d+(\.\d+)?)/i)?.[2] || '';
        }
        // Safari
        else if (/safari/i.test(ua) && !/chrome|chromium|crios/i.test(ua)) {
            browser = 'Safari';
            version = ua.match(/version\/(\d+(\.\d+)?)/i)?.[1] || '';
        }
        // Edge (Chromium-based)
        else if (/edg/i.test(ua)) {
            browser = 'Edge';
            version = ua.match(/edg\/(\d+(\.\d+)?)/i)?.[1] || '';
        }
        // Internet Explorer
        else if (/msie|trident/i.test(ua)) {
            browser = 'Internet Explorer';
            version = ua.match(/(msie |rv:)(\d+(\.\d+)?)/i)?.[2] || '';
        }
        // Opera
        else if (/opr\/|opera/i.test(ua)) {
            browser = 'Opera';
            version = ua.match(/(opr|opera)\/(\d+(\.\d+)?)/i)?.[2] || '';
        }
        
        return { browser, version };
    };

    /**
     * Detect operating system from user agent
     * @param {string} ua - User agent string
     * @returns {Object} OS name and version
     */
    const detectOS = (ua) => {
        let name = 'Unknown';
        let version = 'Unknown';
        
        // Windows
        if (/windows nt/i.test(ua)) {
            name = 'Windows';
            const windowsVersion = {
                '10.0': '10/11',
                '6.3': '8.1',
                '6.2': '8',
                '6.1': '7',
                '6.0': 'Vista',
                '5.2': 'XP',
                '5.1': 'XP',
                '5.0': '2000'
            };
            const match = ua.match(/windows nt (\d+\.\d+)/i);
            version = match ? windowsVersion[match[1]] || match[1] : '';
        }
        // macOS
        else if (/macintosh|mac os x/i.test(ua)) {
            name = 'macOS';
            const match = ua.match(/mac os x (\d+[._]\d+[._]?\d*)/i);
            if (match) {
                version = match[1].replace(/_/g, '.');
            }
        }
        // iOS
        else if (/iphone|ipad|ipod/i.test(ua)) {
            name = 'iOS';
            const match = ua.match(/os (\d+[._]\d+[._]?\d*)/i);
            if (match) {
                version = match[1].replace(/_/g, '.');
            }
        }
        // Android
        else if (/android/i.test(ua)) {
            name = 'Android';
            version = ua.match(/android (\d+(\.\d+)*)/i)?.[1] || '';
        }
        // Linux
        else if (/linux/i.test(ua)) {
            name = 'Linux';
        }
        // Chrome OS
        else if (/cros/i.test(ua)) {
            name = 'Chrome OS';
        }
        
        return { name, version };
    };

    /**
     * Check hardware support for various device capabilities
     */
    const checkHardwareSupport = async () => {
        // Camera
        try {
            const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
            updateStatus('cameraStatus', 'cameraValue', 'Available', 'icon-success');
            cameraStream.getTracks().forEach(track => track.stop());
            deviceData.hardware = deviceData.hardware || {};
            deviceData.hardware.camera = true;
        } catch (error) {
            updateStatus('cameraStatus', 'cameraValue', 'Not Available', 'icon-error');
            deviceData.hardware = deviceData.hardware || {};
            deviceData.hardware.camera = false;
        }

        // Microphone
        try {
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            updateStatus('micStatus', 'micValue', 'Available', 'icon-success');
            micStream.getTracks().forEach(track => track.stop());
            deviceData.hardware = deviceData.hardware || {};
            deviceData.hardware.microphone = true;
        } catch (error) {
            updateStatus('micStatus', 'micValue', 'Not Available', 'icon-error');
            deviceData.hardware = deviceData.hardware || {};
            deviceData.hardware.microphone = false;
        }

        // Geolocation
        const hasGeolocation = 'geolocation' in navigator;
        updateStatus('geoStatus', 'geoValue', 
            hasGeolocation ? 'Supported' : 'Not Supported', 
            hasGeolocation ? 'icon-success' : 'icon-error');
        deviceData.hardware = deviceData.hardware || {};
        deviceData.hardware.geolocation = hasGeolocation;

        // Battery
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                const level = Math.round(battery.level * 100);
                const status = battery.charging ? ' (Charging)' : '';
                updateStatus('batteryStatus', 'batteryValue', 
                    `${level}%${status}`, 'icon-success');
                
                deviceData.hardware = deviceData.hardware || {};
                deviceData.hardware.battery = {
                    supported: true,
                    level: level,
                    charging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                };
                
                // Listen for battery changes
                battery.addEventListener('levelchange', () => {
                    const newLevel = Math.round(battery.level * 100);
                    const newStatus = battery.charging ? ' (Charging)' : '';
                    updateStatus('batteryStatus', 'batteryValue', 
                        `${newLevel}%${newStatus}`, 'icon-success');
                    deviceData.hardware.battery.level = newLevel;
                    deviceData.hardware.battery.charging = battery.charging;
                });
                
                battery.addEventListener('chargingchange', () => {
                    const newLevel = Math.round(battery.level * 100);
                    const newStatus = battery.charging ? ' (Charging)' : '';
                    updateStatus('batteryStatus', 'batteryValue', 
                        `${newLevel}%${newStatus}`, 'icon-success');
                    deviceData.hardware.battery.charging = battery.charging;
                });
            } catch (error) {
                updateStatus('batteryStatus', 'batteryValue', 'Error', 'icon-error');
                deviceData.hardware = deviceData.hardware || {};
                deviceData.hardware.battery = { supported: false };
            }
        } else {
            updateStatus('batteryStatus', 'batteryValue', 'Not Supported', 'icon-error');
            deviceData.hardware = deviceData.hardware || {};
            deviceData.hardware.battery = { supported: false };
        }

        // Storage
        await checkStorage();
        
        // Vibration
        const hasVibration = 'vibrate' in navigator;
        updateStatus('vibrationStatus', 'vibrationValue', 
            hasVibration ? 'Supported' : 'Not Supported', 
            hasVibration ? 'icon-success' : 'icon-error');
        deviceData.hardware = deviceData.hardware || {};
        deviceData.hardware.vibration = hasVibration;
        
        // Bluetooth
        const hasBluetooth = 'bluetooth' in navigator;
        updateStatus('bluetoothStatus', 'bluetoothValue', 
            hasBluetooth ? 'Supported' : 'Not Supported', 
            hasBluetooth ? 'icon-success' : 'icon-error');
        deviceData.hardware = deviceData.hardware || {};
        deviceData.hardware.bluetooth = hasBluetooth;
        
        // WebRTC
        const hasWebRTC = 'RTCPeerConnection' in window;
        updateStatus('webrtcStatus', 'webrtcValue', 
            hasWebRTC ? 'Supported' : 'Not Supported', 
            hasWebRTC ? 'icon-success' : 'icon-error');
        deviceData.hardware = deviceData.hardware || {};
        deviceData.hardware.webrtc = hasWebRTC;
        
        // USB
        const hasUSB = 'usb' in navigator;
        updateStatus('usbStatus', 'usbValue', 
            hasUSB ? 'Supported' : 'Not Supported', 
            hasUSB ? 'icon-success' : 'icon-error');
        deviceData.hardware = deviceData.hardware || {};
        deviceData.hardware.usb = hasUSB;
    };

    /**
     * Check storage information
     */
    const checkStorage = async () => {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const { usage, quota } = await navigator.storage.estimate();
                const usageGB = (usage / 1024 / 1024 / 1024).toFixed(2);
                const quotaGB = (quota / 1024 / 1024 / 1024).toFixed(2);
                const percentage = ((usage / quota) * 100).toFixed(1);
                
                updateStatus('storageStatus', 'storageValue', 
                    `${usageGB} GB / ${quotaGB} GB (${percentage}%)`, 
                    'icon-success');
                
                deviceData.storage = {
                    supported: true,
                    usage: parseFloat(usageGB),
                    quota: parseFloat(quotaGB),
                    percentage: parseFloat(percentage),
                    usageBytes: usage,
                    quotaBytes: quota
                };
                
                // Check persistent storage support
                if ('persisted' in navigator.storage) {
                    try {
                        const isPersisted = await navigator.storage.persisted();
                        deviceData.storage.persisted = isPersisted;
                    } catch (e) {
                        deviceData.storage.persisted = false;
                    }
                }
            } catch (error) {
                updateStatus('storageStatus', 'storageValue', 
                    'Error checking storage', 
                    'icon-error');
                console.error('Storage check failed:', error);
                deviceData.storage = { supported: false, error: error.message };
            }
        } else {
            updateStatus('storageStatus', 'storageValue', 
                'Not Supported', 
                'icon-error');
            deviceData.storage = { supported: false };
        }
    };

    /**
     * Update status indicator with icon
     * @param {string} statusId - ID of status element
     * @param {string} valueId - ID of value element
     * @param {string} value - Text value to display
     * @param {string} className - CSS class for styling
     */
    const updateStatus = (statusId, valueId, value, className) => {
        const statusEl = document.getElementById(statusId);
        const valueEl = document.getElementById(valueId);
        if (statusEl) statusEl.className = `status-icon ${className}`;
        if (valueEl) valueEl.textContent = value;
    };

    // ==================== NETWORK INFORMATION ====================
    
    /**
     * Gather network information
     */
    const gatherNetworkInfo = async () => {
        try {
            // Connection info
            const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
            updateElement('connectionType', conn.type || 'Unknown');
            updateElement('effectiveType', conn.effectiveType || 'Unknown');
            updateElement('downlink', conn.downlink ? `${conn.downlink} Mbps` : 'Unknown');
            updateElement('rtt', conn.rtt ? `${conn.rtt} ms` : 'Unknown');
            updateElement('saveData', conn.saveData ? 'Yes' : 'No');
            updateElement('onlineStatus', navigator.onLine ? 'Online' : 'Offline');
            
            deviceData.connection = {
                online: navigator.onLine,
                type: conn.type || null,
                effectiveType: conn.effectiveType || null,
                downlink: conn.downlink || null,
                rtt: conn.rtt || null,
                saveData: conn.saveData || false
            };
            
            // Add event listeners for online/offline events
            window.addEventListener('online', () => {
                updateElement('onlineStatus', 'Online');
                deviceData.connection.online = true;
                showToast('Connection restored', 'success');
            });
            
            window.addEventListener('offline', () => {
                updateElement('onlineStatus', 'Offline');
                deviceData.connection.online = false;
                showToast('Connection lost', 'error');
            });
            
            // Network speed monitoring
            if (conn && 'addEventListener' in conn) {
                conn.addEventListener('change', () => {
                    updateElement('connectionType', conn.type || 'Unknown');
                    updateElement('effectiveType', conn.effectiveType || 'Unknown');
                    updateElement('downlink', conn.downlink ? `${conn.downlink} Mbps` : 'Unknown');
                    updateElement('rtt', conn.rtt ? `${conn.rtt} ms` : 'Unknown');
                    
                    deviceData.connection.type = conn.type || null;
                    deviceData.connection.effectiveType = conn.effectiveType || null;
                    deviceData.connection.downlink = conn.downlink || null;
                    deviceData.connection.rtt = conn.rtt || null;
                    
                    showToast(`Network changed: ${conn.effectiveType || 'Unknown'}`, 'info');
                });
            }

            // IP info via API
            try {
                const startTime = performance.now();
                const response = await fetch(config.apiEndpoints.ipInfo);
                const endTime = performance.now();
                const responseTime = (endTime - startTime).toFixed(0);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Basic network info
                    updateElement('publicIP', data.ip || 'N/A');
                    updateElement('isp', data.org || 'N/A');
                    updateElement('hostname', data.hostname || 'N/A');
                    updateElement('country', data.country_name || 'N/A');
                    updateElement('region', data.region || 'N/A');
                    updateElement('city', data.city || 'N/A');
                    updateElement('responseTime', `${responseTime} ms`);
                    
                    // IP-based location
                    updateElement('ipCountry', data.country_name || 'N/A');
                    updateElement('ipRegion', data.region || 'N/A');
                    updateElement('ipCity', data.city || 'N/A');
                    updateElement('ipPostal', data.postal || 'N/A');
                    updateElement('ipTimezone', data.timezone || 'N/A');
                    updateElement('ipCoordinates', data.latitude && data.longitude ? 
                        `${data.latitude}, ${data.longitude}` : 'N/A');
                    
                    deviceData.network = {
                        ip: data.ip,
                        isp: data.org,
                        hostname: data.hostname,
                        location: {
                            country: data.country_name,
                            countryCode: data.country_code,
                            region: data.region,
                            city: data.city,
                            postal: data.postal,
                            timezone: data.timezone,
                            latitude: data.latitude,
                            longitude: data.longitude
                        },
                        responseTime: parseInt(responseTime)
                    };
                    
                    // Initialize map with IP-based location if user hasn't requested precise location
                    if (data.latitude && data.longitude && !deviceData.location) {
                        initMap(data.latitude, data.longitude, "IP-based location (approximate)");
                    }
                } else {
                    throw new Error(`HTTP error: ${response.status}`);
                }
            } catch (error) {
                console.error('Failed to fetch IP info:', error);
                updateElement('publicIP', 'Failed to retrieve');
                deviceData.network = { error: error.message };
                showToast('Failed to retrieve IP information', 'error');
            }

            // HTTP Headers simulation
            const headers = {
                'User-Agent': navigator.userAgent,
                'Accept-Language': navigator.languages?.join(',') || navigator.language,
                'Do-Not-Track': navigator.doNotTrack || 'Not specified',
                'Connection': 'keep-alive',
                'Sec-CH-UA': navigator.userAgentData?.brands?.map(brand => 
                    `"${brand.brand}";v="${brand.version}"`).join(', ') || 'Not available'
            };
            
            const headersContainer = document.getElementById('httpHeaders');
            if (headersContainer) {
                headersContainer.innerHTML = 
                    Object.entries(headers).map(([key, value]) => 
                        `<div class="info-item"><div class="info-label">${escapeHTML(key)}</div><div class="info-value">${escapeHTML(value)}</div></div>`
                    ).join('');
            }
            
            deviceData.headers = headers;
        } catch (error) {
            console.error('Error gathering network info:', error);
            showToast('Failed to gather network information', 'error');
        }
    };

    // ==================== GEOLOCATION ====================
    
    /**
     * Get precise geolocation information
     */
    const getLocation = () => {
        if (!navigator.geolocation) {
            showToast('Geolocation not supported by your browser', 'error');
            return;
        }
        
        showToast('Requesting location...', 'info');
        
        const locationOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                try {
                    document.getElementById('latitude').textContent = position.coords.latitude.toFixed(6);
                    document.getElementById('longitude').textContent = position.coords.longitude.toFixed(6);
                    document.getElementById('accuracy').textContent = `${position.coords.accuracy.toFixed(1)} meters`;
                    document.getElementById('altitude').textContent = 
                        position.coords.altitude ? `${position.coords.altitude.toFixed(1)} meters` : 'N/A';
                    document.getElementById('altitudeAccuracy').textContent = 
                        position.coords.altitudeAccuracy ? `${position.coords.altitudeAccuracy.toFixed(1)} meters` : 'N/A';
                    document.getElementById('heading').textContent = 
                        position.coords.heading ? `${position.coords.heading.toFixed(1)}°` : 'N/A';
                    document.getElementById('speed').textContent = 
                        position.coords.speed ? `${position.coords.speed.toFixed(1)} m/s` : 'N/A';
                    document.getElementById('timestamp').textContent = 
                        new Date(position.timestamp).toLocaleString();

                    // Reverse geocoding
                    reverseGeocode(position.coords.latitude, position.coords.longitude);
                    
                    // Store location data
                    deviceData.location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        altitude: position.coords.altitude,
                        altitudeAccuracy: position.coords.altitudeAccuracy,
                        heading: position.coords.heading,
                        speed: position.coords.speed,
                        timestamp: position.timestamp
                    };
                    
                    // Initialize map
                    initMap(position.coords.latitude, position.coords.longitude, "Your precise location");
                    showToast('Location retrieved successfully', 'success');
                } catch (error) {
                    console.error('Error processing location data:', error);
                    showToast('Error processing location data', 'error');
                }
            },
            (error) => {
                let errorMessage = 'Unknown error';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'User denied the request for geolocation';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'The request to get user location timed out';
                        break;
                    case error.UNKNOWN_ERROR:
                        errorMessage = 'An unknown error occurred';
                        break;
                }
                showToast(`Geolocation error: ${errorMessage}`, 'error');
                console.error('Geolocation error:', error, errorMessage);
            },
            locationOptions
        );
    };

    /**
     * Reverse geocode coordinates to get address
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     */
    const reverseGeocode = async (lat, lon) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
            const data = await response.json();
            
            if (data && data.display_name) {
                document.getElementById('geocodedAddress').textContent = data.display_name;
                deviceData.location.address = data.display_name;
                deviceData.location.addressDetails = data.address;
            } else {
                document.getElementById('geocodedAddress').textContent = 'Address not found';
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            document.getElementById('geocodedAddress').textContent = 'Failed to get address';
        }
    };

    /**
     * Initialize map with coordinates
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {string} popupText - Text to display in popup
     */
    const initMap = (lat, lon, popupText = "Your location") => {
        try {
            // Only initialize if Leaflet is available
            if (typeof L !== 'undefined' && document.getElementById('map')) {
                // Clear existing map
                const mapContainer = document.getElementById('map');
                mapContainer.innerHTML = '';
                
                // Create new map
                const map = L.map('map').setView([lat, lon], 13);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
                
                // Add marker
                L.marker([lat, lon])
                    .addTo(map)
                    .bindPopup(popupText)
                    .openPopup();
                
                // Add accuracy circle if available
                if (deviceData.location && deviceData.location.accuracy) {
                    L.circle([lat, lon], {
                        radius: deviceData.location.accuracy,
                        color: 'blue',
                        fillColor: '#3388ff',
                        fillOpacity: 0.1
                    }).addTo(map);
                }
                
                // Force map to recalculate size
                setTimeout(() => {
                    map.invalidateSize();
                }, 100);
            } else {
                console.warn('Leaflet not available or map container not found');
            }
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    };

    // ==================== SPEED TEST ====================
    
    /**
     * Run network speed test
     */
    const runSpeedTest = async () => {
        try {
            // Show the results container
            if (elements.speedTestResults) {
                elements.speedTestResults.style.display = 'block';
            }
            
            showToast('Running speed test...', 'info');
            updateElement('downloadSpeed', 'Testing...');
            updateElement('latencyValue', 'Testing...');
            
            // Disable the test button
            if (elements.testSpeedBtn) {
                elements.testSpeedBtn.disabled = true;
                elements.testSpeedBtn.innerHTML = 'Testing...';
            }
            
            // Test latency first (3 requests and average)
            let totalLatency = 0;
            const latencyTestCount = 3;
            
            for (let i = 0; i < latencyTestCount; i++) {
                const latencyStart = performance.now();
                await fetch('https://api.ipify.org?' + new Date().getTime());
                const latencyEnd = performance.now();
                totalLatency += (latencyEnd - latencyStart);
            }
            
            const avgLatency = (totalLatency / latencyTestCount).toFixed(0);
            updateElement('latencyValue', `${avgLatency} ms`);
            
            // Now test download speed
            const fileSize = config.speedTestSampleSize; // MB
            const downloadUrl = config.apiEndpoints.speedTest;
            
            const startTime = performance.now();
            
            try {
                const response = await fetch(downloadUrl, {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' }
                });
                
                // Read the response to make sure it's fully downloaded
                if (response.ok) {
                    await response.blob();
                    const endTime = performance.now();
                    const duration = (endTime - startTime) / 1000; // seconds
                    
                    // Calculate speed: size in MB * 8 (to bits) / time in seconds = Mbps
                    const downloadSpeed = ((fileSize * 8) / duration).toFixed(2);
                    updateElement('downloadSpeed', `${downloadSpeed} Mbps`);
                    
                    deviceData.speedTest = { 
                        download: parseFloat(downloadSpeed), 
                        latency: parseInt(avgLatency),
                        timestamp: new Date().toISOString()
                    };
                    
                    showToast('Speed test completed', 'success');
                } else {
                    throw new Error(`HTTP error: ${response.status}`);
                }
            } catch (error) {
                console.error('Download test failed:', error);
                updateElement('downloadSpeed', 'Test failed');
                showToast('Speed test failed', 'error');
            }
        } catch (error) {
            console.error('Speed test error:', error);
            showToast('Speed test failed', 'error');
        } finally {
            // Re-enable the test button
            if (elements.testSpeedBtn) {
                elements.testSpeedBtn.disabled = false;
                elements.testSpeedBtn.innerHTML = 'Run Speed Test';
            }
        }
    };

    // ==================== BENCHMARK ====================
    
    /**
     * Run performance benchmark tests
     */
    const runBenchmark = () => {
        try {
            showToast('Running benchmark...', 'info');
            
            if (elements.benchmarkDetails) {
                elements.benchmarkDetails.style.display = 'block';
            }
            
            // Disable the benchmark button
            if (elements.runBenchmarkBtn) {
                elements.runBenchmarkBtn.disabled = true;
                elements.runBenchmarkBtn.innerHTML = 'Testing...';
            }
            
            updateElement('cpuScore', 'Testing...');
            updateElement('renderScore', 'Testing...');
            updateElement('memoryScore', 'Testing...');
            updateElement('storageScore', 'Testing...');
            
            // Run separate benchmarks asynchronously
            setTimeout(async () => {
                const benchmarkResults = {
                    cpu: await runCpuBenchmark(),
                    render: await runRenderBenchmark(),
                    memory: await runMemoryBenchmark(),
                    storage: await runStorageBenchmark(),
                    timestamp: new Date().toISOString()
                };
                
                // Update UI with results
                updateElement('cpuScore', benchmarkResults.cpu.score);
                updateElement('cpuOps', benchmarkResults.cpu.operations);
                updateElement('testDuration', `${benchmarkResults.cpu.duration.toFixed(2)} ms`);
                
                updateElement('renderScore', benchmarkResults.render.score);
                updateElement('renderOps', benchmarkResults.render.operations);
                updateElement('renderTime', `${benchmarkResults.render.duration.toFixed(2)} ms`);
                
                updateElement('memoryScore', benchmarkResults.memory.score);
                updateElement('memoryOps', benchmarkResults.memory.operations);
                updateElement('memoryTime', `${benchmarkResults.memory.duration.toFixed(2)} ms`);
                
                updateElement('storageScore', benchmarkResults.storage.score);
                updateElement('storageOps', benchmarkResults.storage.operations);
                updateElement('storageTime', `${benchmarkResults.storage.duration.toFixed(2)} ms`);
                
                // Calculate overall score (weighted average)
                const overallScore = Math.round(
                    (benchmarkResults.cpu.score * 0.4) + 
                    (benchmarkResults.render.score * 0.3) + 
                    (benchmarkResults.memory.score * 0.2) + 
                    (benchmarkResults.storage.score * 0.1)
                );
                
                updateElement('overallScore', overallScore);
                
                // Store in deviceData
                deviceData.benchmark = benchmarkResults;
                deviceData.benchmark.overall = overallScore;
                
                showToast('Benchmark completed', 'success');
                
                // Re-enable the benchmark button
                if (elements.runBenchmarkBtn) {
                    elements.runBenchmarkBtn.disabled = false;
                    elements.runBenchmarkBtn.innerHTML = 'Run Benchmark';
                }
            }, 100);
        } catch (error) {
            console.error('Benchmark error:', error);
            showToast('Benchmark failed', 'error');
            
            // Re-enable the benchmark button
            if (elements.runBenchmarkBtn) {
                elements.runBenchmarkBtn.disabled = false;
                elements.runBenchmarkBtn.innerHTML = 'Run Benchmark';
            }
        }
    };

    /**
     * Run CPU benchmark (math operations)
     * @returns {Object} Benchmark results
     */
    const runCpuBenchmark = async () => {
        return new Promise(resolve => {
            const iterations = config.benchmarkIterations;
            const start = performance.now();
            
            // CPU test - Math operations
            let sum = 0;
            for (let i = 0; i < iterations; i++) {
                sum += Math.sqrt(i) * Math.sin(i) / Math.cos(i) + Math.pow(i, 0.5);
            }
            
            const duration = performance.now() - start;
            const score = Math.round(10000 / duration * (iterations / 1000000));
            
            resolve({
                score,
                duration,
                operations: `${iterations.toLocaleString()} iterations`
            });
        });
    };

    /**
     * Run rendering benchmark (canvas operations)
     * @returns {Object} Benchmark results
     */
    const runRenderBenchmark = async () => {
        return new Promise(resolve => {
            const start = performance.now();
            
            // Create a virtual canvas
            const canvas = document.createElement('canvas');
            canvas.width = 1000;
            canvas.height = 1000;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                resolve({
                    score: 0,
                    duration: 0,
                    operations: 'Canvas not supported'
                });
                return;
            }
            
            // Drawing operations
            const iterations = 1000;
            for (let i = 0; i < iterations; i++) {
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Draw rectangles
                for (let j = 0; j < 50; j++) {
                    ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
                    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 
                                Math.random() * 100, Math.random() * 100);
                }
                
                // Draw paths
                ctx.beginPath();
                ctx.moveTo(0, 0);
                for (let j = 0; j < 100; j++) {
                    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
                }
                ctx.stroke();
            }
            
            const duration = performance.now() - start;
            const score = Math.round(10000 / duration * (iterations / 1000));
            
            resolve({
                score,
                duration,
                operations: `${iterations.toLocaleString()} frames`
            });
        });
    };

    /**
     * Run memory operations benchmark
     * @returns {Object} Benchmark results
     */
    const runMemoryBenchmark = async () => {
        return new Promise(resolve => {
            const start = performance.now();
            
            // Memory test - Array operations
            const arrSize = 1000000;
            const arr = [];
            
            // Fill array
            for (let i = 0; i < arrSize; i++) {
                arr.push(i);
            }
            
            // Array operations
            let sum = 0;
            for (let i = 0; i < arr.length; i++) {
                sum += arr[i];
            }
            
            // Filter, map and reduce
            const filtered = arr.filter(x => x % 2 === 0);
            const mapped = filtered.map(x => x * 2);
            const reduced = mapped.reduce((acc, val) => acc + val, 0);
            
            const duration = performance.now() - start;
            const score = Math.round(10000 / duration * (arrSize / 1000000));
            
            resolve({
                score,
                duration,
                operations: `${arrSize.toLocaleString()} elements`
            });
        });
    };

    /**
     * Run storage operations benchmark
     * @returns {Object} Benchmark results
     */
    const runStorageBenchmark = async () => {
        return new Promise(resolve => {
            const start = performance.now();
            
            try {
                // Storage test - localStorage operations
                const iterations = 1000;
                
                // Clear any previous test data
                localStorage.removeItem('benchmark_test');
                
                // Write operations
                for (let i = 0; i < iterations; i++) {
                    localStorage.setItem('benchmark_test', JSON.stringify({
                        index: i,
                        data: 'x'.repeat(100),
                        timestamp: Date.now()
                    }));
                }
                
                // Read operations
                for (let i = 0; i < iterations; i++) {
                    const data = localStorage.getItem('benchmark_test');
                    JSON.parse(data);
                }
                
                // Clean up
                localStorage.removeItem('benchmark_test');
                
                const duration = performance.now() - start;
                const score = Math.round(10000 / duration * (iterations / 1000));
                
                resolve({
                    score,
                    duration,
                    operations: `${iterations.toLocaleString()} operations`
                });
            } catch (error) {
                // Handle cases where localStorage is disabled
                console.error('Storage benchmark error:', error);
                resolve({
                    score: 0,
                    duration: 0,
                    operations: 'Storage not available'
                });
            }
        });
    };

    // ==================== PERFORMANCE METRICS ====================
    
    /**
     * Gather performance metrics about the page
     */
    const gatherPerformanceMetrics = () => {
        try {
            // Initialize performance data object
            deviceData.performance = {};
            
            // Navigation Timing API
            if (performance.timing) {
                const timing = performance.timing;
                
                const navigationStart = timing.navigationStart;
                const loadEventEnd = timing.loadEventEnd || performance.now() + navigationStart;
                const domContentLoaded = timing.domContentLoadedEventEnd || performance.now() + navigationStart;
                
                const pageLoadTime = loadEventEnd - navigationStart;
                const domReadyTime = domContentLoaded - navigationStart;
                
                updateElement('pageLoadTime', `${pageLoadTime} ms`);
                updateElement('domContentLoaded', `${domReadyTime} ms`);
                
                // More detailed metrics
                const connectTime = timing.connectEnd - timing.connectStart;
                const dnsTime = timing.domainLookupEnd - timing.domainLookupStart;
                const ttfb = timing.responseStart - timing.requestStart;
                const downloadTime = timing.responseEnd - timing.responseStart;
                const processingTime = timing.domComplete - timing.responseEnd;
                
                updateElement('connectTime', `${connectTime} ms`);
                updateElement('dnsTime', `${dnsTime} ms`);
                updateElement('ttfb', `${ttfb} ms`);
                updateElement('downloadTime', `${downloadTime} ms`);
                updateElement('processingTime', `${processingTime} ms`);
                
                // Store in deviceData
                deviceData.performance.navigation = {
                    pageLoadTime,
                    domContentLoaded: domReadyTime,
                    connectTime,
                    dnsLookupTime: dnsTime,
                    timeToFirstByte: ttfb,
                    downloadTime,
                    processingTime
                };
            }
            
            // Paint Timing API
            if (window.performance && performance.getEntriesByType) {
                try {
                    const paintMetrics = performance.getEntriesByType('paint');
                    let firstPaint = null;
                    let firstContentfulPaint = null;
                    
                    paintMetrics.forEach(metric => {
                        if (metric.name === 'first-paint') {
                            firstPaint = metric.startTime.toFixed(0);
                        } else if (metric.name === 'first-contentful-paint') {
                            firstContentfulPaint = metric.startTime.toFixed(0);
                        }
                    });
                    
                    updateElement('firstPaint', firstPaint ? `${firstPaint} ms` : 'N/A');
                    updateElement('firstContentfulPaint', firstContentfulPaint ? `${firstContentfulPaint} ms` : 'N/A');
                    
                    deviceData.performance.paint = {
                        firstPaint: firstPaint ? parseInt(firstPaint) : null,
                        firstContentfulPaint: firstContentfulPaint ? parseInt(firstContentfulPaint) : null
                    };
                } catch (e) {
                    console.warn('Error accessing paint timing:', e);
                }
            }
            
            // Memory usage
            if (performance.memory) {
                const usedJSHeapSize = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
                const totalJSHeapSize = (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
                const jsHeapSizeLimit = (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);
                
                updateElement('memoryUsage', `${usedJSHeapSize} MB`);
                updateElement('jsHeapSize', `${totalJSHeapSize} MB`);
                updateElement('jsHeapLimit', `${jsHeapSizeLimit} MB`);
                
                // Calculate percentage of heap used
                const heapPercentage = ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(1);
                updateElement('heapPercentage', `${heapPercentage}%`);
                
                deviceData.performance.memory = {
                    usedJSHeapSize: parseFloat(usedJSHeapSize),
                    totalJSHeapSize: parseFloat(totalJSHeapSize),
                    jsHeapSizeLimit: parseFloat(jsHeapSizeLimit),
                    heapPercentage: parseFloat(heapPercentage)
                };
            }
            
            // Long Tasks API (if available)
            if (window.PerformanceObserver && PerformanceLongTaskTiming) {
                let longTasksCount = 0;
                let totalBlockingTime = 0;
                
                try {
                    const longTasksEntries = performance.getEntriesByType('longtask');
                    if (longTasksEntries) {
                        longTasksCount = longTasksEntries.length;
                        
                        longTasksEntries.forEach(entry => {
                            totalBlockingTime += entry.duration - 50; // Tasks over 50ms are considered "long"
                        });
                        
                        updateElement('longTasks', longTasksCount.toString());
                        updateElement('totalBlockingTime', `${totalBlockingTime.toFixed(0)} ms`);
                        
                        deviceData.performance.longTasks = {
                            count: longTasksCount,
                            totalBlockingTime: parseFloat(totalBlockingTime.toFixed(0))
                        };
                    }
                } catch (e) {
                    console.warn('Long Tasks API error:', e);
                }
            }
            
            // Resource timing
            if (window.performance && performance.getEntriesByType) {
                try {
                    const resources = performance.getEntriesByType('resource');
                    
                    let totalResources = resources.length;
                    let totalResourceSize = 0;
                    let totalResourceTime = 0;
                    
                    resources.forEach(resource => {
                        totalResourceTime += resource.duration;
                        
                        // Try to get resource size if available
                        if (resource.transferSize) {
                            totalResourceSize += resource.transferSize;
                        }
                    });
                    
                    updateElement('resourceCount', totalResources.toString());
                    updateElement('resourceSize', `${(totalResourceSize / 1024).toFixed(1)} KB`);
                    updateElement('resourceTime', `${totalResourceTime.toFixed(0)} ms`);
                    
                    deviceData.performance.resources = {
                        count: totalResources,
                        size: parseFloat((totalResourceSize / 1024).toFixed(1)),
                        loadTime: parseFloat(totalResourceTime.toFixed(0))
                    };
                } catch (e) {
                    console.warn('Resource Timing API error:', e);
                }
            }
        } catch (error) {
            console.error('Error gathering performance metrics:', error);
        }
    };

    // ==================== JSON & DATA EXPORT ====================
    
    /**
     * Update JSON output display
     */
    const updateJsonOutput = () => {
        try {
            if (elements.jsonOutput) {
                elements.jsonOutput.textContent = JSON.stringify(deviceData, null, 2);
            }
        } catch (error) {
            console.error('Error updating JSON output:', error);
            showToast('Error formatting JSON data', 'error');
        }
    };

    /**
     * Export device data as JSON file
     */
    const exportDeviceData = () => {
        try {
            // Update data timestamp
            deviceData.exportTimestamp = new Date().toISOString();
            
            // Create Blob with JSON data
            const jsonString = JSON.stringify(deviceData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            // Create URL for Blob
            const url = URL.createObjectURL(blob);
            
            // Create date string for filename
            const dateString = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
            
            // Create and trigger download link
            const a = document.createElement('a');
            a.href = url;
            a.download = `device_info_${dateString}.json`;
            a.click();
            
            // Clean up
            URL.revokeObjectURL(url);
            showToast('Data exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            showToast('Error exporting data', 'error');
        }
    };

    /**
     * Generate CLI commands
     */
    const runCliCommands = async () => {
        try {
            const fetchCmd = async (url, elementId) => {
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    const text = await response.text();
                    updateElement(elementId, escapeHTML(text));
                } catch (error) {
                    console.error(`Error fetching ${url}:`, error);
                    updateElement(elementId, `Error: ${error.message}`);
                }
            };

            // Run commands in parallel
            await Promise.all([
                fetchCmd('https://ifconfig.me', 'curlIp'),
                fetchCmd('https://ifconfig.me/ua', 'curlUa')
            ]);
            
            // JSON response might be large, fetch separately
            try {
                const response = await fetch('https://ifconfig.me/all.json');
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const jsonData = await response.json();
                updateElement('curlAll', JSON.stringify(jsonData, null, 2));
            } catch (error) {
                console.error('Error fetching JSON data:', error);
                updateElement('curlAll', `Error: ${error.message}`);
            }
            
            // Generate bash script for device info
            let bashScript = `#!/bin/bash
# Device Information Script
# Generated on ${new Date().toISOString()}

echo "====== SYSTEM INFORMATION ======"
echo "Hostname: $(hostname)"
echo "Kernel: $(uname -r)"
echo "OS: $(uname -s)"
echo "Architecture: $(uname -m)"
echo "CPU: $(grep 'model name' /proc/cpuinfo | head -1 | cut -d ':' -f2 | sed 's/^[ \\t]*//')"
echo "CPU Cores: $(grep -c ^processor /proc/cpuinfo)"

echo "\\n====== MEMORY INFORMATION ======"
echo "$(free -h)"

echo "\\n====== DISK INFORMATION ======"
echo "$(df -h)"

echo "\\n====== NETWORK INFORMATION ======"
echo "IP Address: $(curl -s https://ifconfig.me)"
echo "Hostname: $(hostname)"
echo "DNS Servers: $(cat /etc/resolv.conf | grep nameserver | awk '{print $2}' | tr '\\n' ' ')"

echo "\\n====== NETWORK INTERFACES ======"
echo "$(ip addr show | grep -E 'inet|link')"

echo "\\n====== ROUTE INFORMATION ======"
echo "$(ip route)"

echo "\\n====== SERVICES ======"
echo "$(systemctl list-units --type=service --state=running | head -20)"
`;
            updateElement('bashScript', bashScript);
        } catch (error) {
            console.error('Error generating CLI commands:', error);
        }
    };

    // ==================== UI UTILITIES ====================
    
    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Notification type (info, success, error, warning)
     */
    const showToast = (message, type = 'info') => {
        try {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.textContent = message;
            
            // Add icon based on type
            const iconContainer = document.createElement('div');
            iconContainer.className = 'toast-icon';
            
            let iconPath = '';
            switch (type) {
                case 'success':
                    iconPath = 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z';
                    break;
                case 'error':
                    iconPath = 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z';
                    break;
                case 'warning':
                    iconPath = 'M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z';
                    break;
                default: // info
                    iconPath = 'M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z';
            }
            
            const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            icon.setAttribute('viewBox', '0 0 16 16');
            icon.setAttribute('fill', 'currentColor');
            icon.setAttribute('height', '16');
            icon.setAttribute('width', '16');
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', iconPath);
            
            icon.appendChild(path);
            iconContainer.appendChild(icon);
            toast.insertBefore(iconContainer, toast.firstChild);
            
            // Close button
            const closeBtn = document.createElement('button');
            closeBtn.className = 'toast-close';
            closeBtn.innerHTML = '&times;';
            closeBtn.addEventListener('click', () => toast.remove());
            toast.appendChild(closeBtn);
            
            // Add to toast container
            if (elements.toastContainer) {
                elements.toastContainer.appendChild(toast);
            } else {
                // Create container if it doesn't exist
                const container = document.createElement('div');
                container.id = 'toastContainer';
                container.className = 'toast-container';
                container.appendChild(toast);
                document.body.appendChild(container);
            }
            
            // Auto-remove after timeout
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.classList.add('toast-fade-out');
                    setTimeout(() => toast.remove(), 300);
                }
            }, 5000);
        } catch (error) {
            console.error('Error showing toast:', error);
        }
    };

    /**
     * Update element text content
     * @param {string} id - Element ID
     * @param {string} text - Text to set
     */
    const updateElement = (id, text) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    };

    /**
     * Get element text content
     * @param {string} id - Element ID
     * @returns {string} Element text content
     */
    const getElementText = (id) => {
        const element = document.getElementById(id);
        return element ? element.textContent : '';
    };

    /**
     * Escape HTML to prevent XSS
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    const escapeHTML = (str) => {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    /**
     * Switch between tabs
     * @param {HTMLElement} tab - Tab element
     */
    const switchTab = (tab) => {
        try {
            // Remove active class from all tabs and content
            elements.tabs.forEach(t => t.classList.remove('active'));
            elements.tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to selected tab and content
            tab.classList.add('active');
            const contentId = tab.dataset.tab;
            const content = document.getElementById(contentId);
            if (content) {
                content.classList.add('active');
            }
            
            // Handle special actions for certain tabs
            if (contentId === 'mapContent' && window.map) {
                // Refresh map if it exists
                window.map.invalidateSize();
            }
            
            // Save active tab in local storage
            localStorage.setItem('activeTab', contentId);
        } catch (error) {
            console.error('Error switching tabs:', error);
        }
    };

    /**
     * Toggle auto-refresh
     * @param {boolean} enabled - Whether auto-refresh is enabled
     */
    const toggleAutoRefresh = (enabled) => {
        try {
            config.autoRefresh = enabled;
            
            // Clear existing interval
            if (config.refreshInterval) {
                clearInterval(config.refreshInterval);
                config.refreshInterval = null;
            }
            
            // Set new interval if enabled
            if (enabled) {
                config.refreshInterval = setInterval(() => {
                    showToast(`Auto-refreshing data (every ${config.refreshRate/1000}s)`, 'info');
                    init(false);
                }, config.refreshRate);
                
                showToast(`Auto-refresh enabled (every ${config.refreshRate/1000}s)`, 'success');
            } else {
                showToast('Auto-refresh disabled', 'info');
            }
            
            // Save setting
            localStorage.setItem('autoRefresh', enabled.toString());
            localStorage.setItem('refreshRate', config.refreshRate.toString());
        } catch (error) {
            console.error('Error toggling auto-refresh:', error);
        }
    };

    /**
     * Set refresh rate
     * @param {number} rate - Refresh rate in milliseconds
     */
    const setRefreshRate = (rate) => {
        try {
            // Validate rate (minimum 5 seconds)
            rate = Math.max(5000, rate);
            config.refreshRate = rate;
            
            // Update interval if auto-refresh is enabled
            if (config.autoRefresh) {
                clearInterval(config.refreshInterval);
                config.refreshInterval = setInterval(() => {
                    showToast(`Auto-refreshing data (every ${config.refreshRate/1000}s)`, 'info');
                    init(false);
                }, config.refreshRate);
            }
            
            // Save setting
            localStorage.setItem('refreshRate', rate.toString());
            showToast(`Refresh rate set to ${rate/1000} seconds`, 'success');
        } catch (error) {
            console.error('Error setting refresh rate:', error);
        }
    };

    /**
     * Initialize settings
     */
    const initSettings = () => {
        try {
            // Load auto-refresh setting
            const autoRefresh = localStorage.getItem('autoRefresh') === 'true';
            const refreshRate = parseInt(localStorage.getItem('refreshRate')) || 60000;
            
            // Update UI
            if (elements.autoRefreshToggle) {
                elements.autoRefreshToggle.checked = autoRefresh;
            }
            
            if (elements.refreshRateInput) {
                elements.refreshRateInput.value = refreshRate / 1000;
            }
            
            // Apply settings
            config.refreshRate = refreshRate;
            toggleAutoRefresh(autoRefresh);
        } catch (error) {
            console.error('Error initializing settings:', error);
        }
    };

    // ==================== EVENT LISTENERS ====================
    
    /**
     * Initialize event listeners
     */
    const initEventListeners = () => {
        try {
            // Theme toggle
            if (elements.themeToggle) {
                elements.themeToggle.addEventListener('click', toggleTheme);
            }
            
            // Refresh button
            if (elements.refreshBtn) {
                elements.refreshBtn.addEventListener('click', () => {
                    showToast('Refreshing data...', 'info');
                    init(false);
                });
            }
            
            // Export button
            if (elements.exportBtn) {
                elements.exportBtn.addEventListener('click', exportDeviceData);
            }
            
            // Settings button and modal
            if (elements.settingsBtn && elements.settingsModal) {
                elements.settingsBtn.addEventListener('click', () => {
                    elements.settingsModal.classList.add('active');
                });
            }
            
            // Close modal buttons
            if (elements.closeModalBtn) {
                elements.closeModalBtn.addEventListener('click', () => {
                    elements.settingsModal.classList.remove('active');
                });
            }
            
            if (elements.closeModalFooterBtn) {
                elements.closeModalFooterBtn.addEventListener('click', () => {
                    elements.settingsModal.classList.remove('active');
                });
            }
            
            // Close modal when clicking outside
            window.addEventListener('click', (event) => {
                if (event.target === elements.settingsModal) {
                    elements.settingsModal.classList.remove('active');
                }
            });
            
            // Geolocation button
            if (elements.getLocationBtn) {
                elements.getLocationBtn.addEventListener('click', getLocation);
            }
            
            // Speed test button
            if (elements.testSpeedBtn) {
                elements.testSpeedBtn.addEventListener('click', runSpeedTest);
            }
            
            // Benchmark button
            if (elements.runBenchmarkBtn) {
                elements.runBenchmarkBtn.addEventListener('click', runBenchmark);
            }
            
            // JSON copy button
            if (elements.copyJsonBtn) {
                elements.copyJsonBtn.addEventListener('click', () => {
                    if (elements.jsonOutput) {
                        navigator.clipboard.writeText(elements.jsonOutput.textContent)
                            .then(() => showToast('JSON copied to clipboard', 'success'))
                            .catch(err => {
                                console.error('Error copying to clipboard:', err);
                                showToast('Failed to copy to clipboard', 'error');
                            });
                    }
                });
            }
            
            // Prettify JSON button
            if (elements.prettifyJsonBtn) {
                elements.prettifyJsonBtn.addEventListener('click', updateJsonOutput);
            }
            
            // Bash script copy button
            if (elements.copyBashBtn) {
                elements.copyBashBtn.addEventListener('click', () => {
                    const bashScript = document.getElementById('bashScript');
                    if (bashScript) {
                        navigator.clipboard.writeText(bashScript.textContent)
                            .then(() => showToast('Bash script copied to clipboard', 'success'))
                            .catch(err => {
                                console.error('Error copying to clipboard:', err);
                                showToast('Failed to copy to clipboard', 'error');
                            });
                    }
                });
            }
            
            // Auto-refresh toggle
            const autoRefreshToggle = document.getElementById('autoRefreshToggle');
            if (autoRefreshToggle) {
                autoRefreshToggle.addEventListener('change', (e) => {
                    toggleAutoRefresh(e.target.checked);
                });
            }
            
            // Refresh rate input
            const refreshRateInput = document.getElementById('refreshRateInput');
            if (refreshRateInput) {
                refreshRateInput.addEventListener('change', (e) => {
                    const rate = parseInt(e.target.value) * 1000; // Convert to milliseconds
                    setRefreshRate(rate);
                });
            }
            
            // Tab switching
            elements.tabs.forEach(tab => {
                tab.addEventListener('click', () => switchTab(tab));
            });
            
            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (document.body.classList.contains('auto-theme')) {
                    if (e.matches) {
                        document.body.classList.add('dark-theme');
                    } else {
                        document.body.classList.remove('dark-theme');
                    }
                    updateThemeIcon(e.matches);
                }
            });
            
            // Listen for online/offline events
            window.addEventListener('online', () => {
                updateElement('onlineStatus', 'Online');
                if (deviceData.connection) deviceData.connection.online = true;
                showToast('Connection restored', 'success');
            });
            
            window.addEventListener('offline', () => {
                updateElement('onlineStatus', 'Offline');
                if (deviceData.connection) deviceData.connection.online = false;
                showToast('Connection lost', 'error');
            });
            
            // Listen for visibility change to refresh data when tab becomes visible
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible' && config.autoRefresh) {
                    showToast('Refreshing data after tab focus', 'info');
                    init(false);
                }
            });
        } catch (error) {
            console.error('Error initializing event listeners:', error);
        }
    };

    // ==================== INITIALIZATION ====================
    
    /**
     * Main initialization function
     * @param {boolean} firstLoad - Whether this is the first load
     */
    const init = async (firstLoad = true) => {
        try {
            // Show loader on first load
            if (firstLoad && elements.loader) {
                elements.loader.style.display = 'flex';
            }
            
            // Initialize settings
            if (firstLoad) {
                setThemePreference();
                initSettings();
                
                // Restore active tab
                const savedTab = localStorage.getItem('activeTab');
                if (savedTab) {
                    const tab = Array.from(elements.tabs).find(t => t.dataset.tab === savedTab);
                    if (tab) {
                        switchTab(tab);
                    }
                }
            }
            
            // Gather all data
            await Promise.all([
                gatherDeviceInfo(),
                gatherNetworkInfo(),
                gatherPerformanceMetrics(),
                runCliCommands()
            ]);
            
            // Update JSON output
            updateJsonOutput();
            
            // Hide loader
            if (elements.loader) {
                elements.loader.style.display = 'none';
            }
            
            // Init event listeners on first load
            if (firstLoad) {
                initEventListeners();
            }
        } catch (error) {
            console.error('Initialization error:', error);
            showToast('Error initializing application', 'error');
            
            // Hide loader even if there's an error
            if (elements.loader) {
                elements.loader.style.display = 'none';
            }
        }
    };

    // Start the application
    init();
});

// Note: For the map to work, you need to include Leaflet:
// <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
// <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
