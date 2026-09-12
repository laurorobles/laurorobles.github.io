import './style.css';

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       0. WEB AUDIO ENGINE (DRONES & SFX ONLY — NO MUSIC BLEEPS)
       ========================================================= */
    let audioCtx = null;
    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // =========================================================
    // CCRU NUMOGRAM MULTI-OSCILLATOR DRONE GENERATOR
    // =========================================================
    let isDroneActive = false;
    let droneOscs = [];
    let droneFilter = null;
    let droneLfo = null;
    let droneLfoGain = null;
    let droneMasterGain = null;

    const dronePresets = {
        uttrunix: {
            pair: '0::9',
            name: 'UTTRUNIX',
            baseFreq: 36.0,
            detune: [-14, -5, 6, 14],
            type: 'sawtooth',
            cutoff: 160,
            desc: 'Sizigia del Abismo Cósmico y el Cero Sagrado (0+9=9). Portador de frecuencias sub-bajas de 36Hz acopladas con armónico cósmico de 81Hz.'
        },
        murrumur: {
            pair: '1::8',
            name: 'MURRUMUR',
            baseFreq: 54.0,
            detune: [-8, 0, 7, 14],
            type: 'sine',
            cutoff: 220,
            desc: 'Canal Lemuriano sub-acuático (1+8=9). Portador de frecuencias graves estables (54Hz) entrelazadas con resonancia armónica de 72Hz.'
        },
        kipphor: {
            pair: '2::7',
            name: 'KIPPHOR',
            baseFreq: 48.0,
            detune: [-10, -2, 6, 16],
            type: 'triangle',
            cutoff: 260,
            desc: 'Sizigia de Afluencia Anorgánica (2+7=9). Oscilación entre zonas 2 y 7 (48Hz ⇄ 84Hz), ondas inductoras de disolución somática.'
        },
        djabbath: {
            pair: '3::6',
            name: 'DJABBATH',
            baseFreq: 45.0,
            detune: [-12, -3, 8, 15],
            type: 'sawtooth',
            cutoff: 200,
            desc: 'Pulso Cronodemónico (3+6=9). Modulación de zonas 3 y 6 en ciclos ternarios de sub-graves de 45Hz y armónicos cortantes de 90Hz.'
        },
        katak: {
            pair: '4::5',
            name: 'KATAK',
            baseFreq: 40.0,
            detune: [-15, -7, 5, 13],
            type: 'triangle',
            cutoff: 300,
            desc: 'Sizigia de Catástrofe Temporal y Warp (4+5=9). Tensión crítica al borde del umbral de retro-causalidad (40Hz / 96Hz).'
        }
    };

    let currentDronePreset = 'murrumur';

    function startNumogramDrone(presetKey = 'murrumur') {
        const ctx = getAudioContext();
        stopNumogramDrone();

        currentDronePreset = presetKey;
        const config = dronePresets[presetKey] || dronePresets.murrumur;

        droneMasterGain = ctx.createGain();
        droneMasterGain.gain.setValueAtTime(0.01, ctx.currentTime);
        droneMasterGain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 1.2);

        droneFilter = ctx.createBiquadFilter();
        droneFilter.type = 'lowpass';
        droneFilter.frequency.setValueAtTime(config.cutoff, ctx.currentTime);
        droneFilter.Q.value = 4.5;

        droneLfo = ctx.createOscillator();
        droneLfoGain = ctx.createGain();
        droneLfo.frequency.value = 0.08;
        droneLfoGain.gain.value = 60;
        droneLfo.connect(droneFilter.frequency);
        droneLfo.start();

        droneOscs = config.detune.map(cents => {
            const osc = ctx.createOscillator();
            osc.type = config.type;
            osc.frequency.setValueAtTime(config.baseFreq, ctx.currentTime);
            osc.detune.setValueAtTime(cents, ctx.currentTime);
            osc.connect(droneFilter);
            osc.start();
            return osc;
        });

        droneFilter.connect(droneMasterGain);
        droneMasterGain.connect(ctx.destination);

        isDroneActive = true;
        const statusEl = document.getElementById('drone-status-text');
        const btnSubDrone = document.getElementById('btn-sub-drone');
        const syzygyTag = document.getElementById('syzygy-current-tag');
        const syzygyExp = document.getElementById('syzygy-explanation');

        if (statusEl) statusEl.innerText = `DRONE: ${config.pair} ${config.name} ACTIVO`;
        if (btnSubDrone) btnSubDrone.innerText = '[ DESACTIVAR DRONE ]';
        if (syzygyTag) syzygyTag.innerText = `SIZIGIA ACTIVA: ${config.pair} ${config.name} (SUMA = 9)`;
        if (syzygyExp) syzygyExp.innerText = config.desc;

        printTerminal(`[NUMOGRAM] Syzygy activated: ${config.pair} ${config.name} (${config.baseFreq}Hz) // Digital sum = 9`);
    }

    function stopNumogramDrone() {
        if (!isDroneActive) return;
        const ctx = getAudioContext();
        if (droneMasterGain) {
            droneMasterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            setTimeout(() => {
                droneOscs.forEach(o => { try { o.stop(); o.disconnect(); } catch(e){} });
                droneOscs = [];
                if (droneLfo) { try { droneLfo.stop(); droneLfo.disconnect(); } catch(e){} }
                droneMasterGain = null;
            }, 600);
        }
        isDroneActive = false;
        const statusEl = document.getElementById('drone-status-text');
        const btnSubDrone = document.getElementById('btn-sub-drone');
        if (statusEl) statusEl.innerText = 'DRONE: INACTIVO';
        if (btnSubDrone) btnSubDrone.innerText = '[ ACTIVAR DRONE ]';
        printTerminal('[NUMOGRAM] Drone synthesis: TERMINATED');
    }

    function randomizeSyzygyDrone() {
        const keys = Object.keys(dronePresets);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        startNumogramDrone(randomKey);
    }

    const btnSubDrone = document.getElementById('btn-sub-drone');
    if (btnSubDrone) {
        btnSubDrone.addEventListener('click', () => {
            if (isDroneActive) stopNumogramDrone();
            else startNumogramDrone(currentDronePreset);
        });
    }

    const btnRandomSyzygy = document.getElementById('btn-drone-random-syzygy');
    if (btnRandomSyzygy) {
        btnRandomSyzygy.addEventListener('click', randomizeSyzygyDrone);
    }

    document.querySelectorAll('.btn-drone-preset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const preset = e.currentTarget.getAttribute('data-preset');
            if (preset && dronePresets[preset]) {
                startNumogramDrone(preset);
            }
        });
    });

    function playNoiseBurst() {
        try {
            const ctx = getAudioContext();
            const bufferSize = ctx.sampleRate * 0.08;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1100;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start();
        } catch (e) {
            console.warn(e);
        }
    }

    /* =========================================================
       1. BOOT SEQUENCE & INITIAL TERMINAL
       ========================================================= */
    const bootScreen = document.getElementById('boot-screen');
    const btnBootStart = document.getElementById('btn-boot-start');
    let hasBooted = false;

    function bootSystem() {
        if (hasBooted) return;
        hasBooted = true;

        if (bootScreen) {
            bootScreen.style.transition = 'opacity 0.4s ease, visibility 0.4s ease';
            bootScreen.style.opacity = '0';
            bootScreen.style.pointerEvents = 'none';
            setTimeout(() => {
                bootScreen.style.visibility = 'hidden';
            }, 450);
        }

        centerOrigin(false);
        printTerminal('[KERNEL] LAO_OS v8.9 initialized. Motherboard standing by.');

        // Auto-open primary windows: Bio, Music, and compact corner Terminal
        openWindow('win-bio', false);
        openWindow('win-music', false);
        openWindow('win-terminal', false);

        // Auto-run help command in terminal
        setTimeout(() => {
            processCommand('help');
        }, 300);
    }

    if (bootScreen) {
        bootScreen.addEventListener('click', () => bootSystem());
        if (btnBootStart) {
            btnBootStart.addEventListener('click', (e) => {
                e.stopPropagation();
                bootSystem();
            });
        }
        window.addEventListener('keydown', (e) => {
            if (!hasBooted && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')) {
                bootSystem();
            }
        });
    } else {
        bootSystem();
    }

    /* =========================================================
       2. PANNING ENGINE & CENTERING
       ========================================================= */
    const viewport = document.getElementById('viewport');
    const world = document.getElementById('world');
    
    let isPanning = false;
    let startX, startY;
    let currentX = 0, currentY = 0;

    function centerOrigin(instant = false) {
        currentX = -(2500) + (window.innerWidth / 2);
        currentY = -(2500) + (window.innerHeight / 2);
        if (!instant) world.classList.add('smooth-pan');
        world.style.transform = `translate(${currentX}px, ${currentY}px)`;
        if (!instant) setTimeout(() => world.classList.remove('smooth-pan'), 700);
    }
    
    centerOrigin(true);
    
    const btnOrigin = document.getElementById('btn-return-origin');
    if (btnOrigin) btnOrigin.addEventListener('click', () => centerOrigin(false));

    function panTo(x, y) {
        currentX = -x + (window.innerWidth / 2);
        currentY = -y + (window.innerHeight / 2);
        world.classList.add('smooth-pan');
        world.style.transform = `translate(${currentX}px, ${currentY}px)`;
        setTimeout(() => world.classList.remove('smooth-pan'), 700);
    }

    viewport.addEventListener('mousedown', (e) => {
        if (e.target.closest('.drag-window') || 
            e.target.closest('#top-hud') || 
            e.target.closest('#dock-menu') || 
            e.target.closest('#omni-player') || 
            e.target.closest('#btn-return-origin') ||
            e.target.closest('#boot-screen')) return;

        isPanning = true;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        currentX = e.clientX - startX;
        currentY = e.clientY - startY;
        currentX = Math.min(0, Math.max(currentX, -(5000 - window.innerWidth)));
        currentY = Math.min(0, Math.max(currentY, -(5000 - window.innerHeight)));
        world.style.transform = `translate(${currentX}px, ${currentY}px)`;
    });

    document.addEventListener('mouseup', () => { isPanning = false; });

    // 2b. TRACKPAD & MOUSE WHEEL PANNING ENGINE
    if (viewport) {
        viewport.addEventListener('wheel', (e) => {
            // Allow native scrolling if cursor is inside a scrollable window container
            const scrollable = e.target.closest('.win-body, .player-queue-list, #terminal-output, .inspector-body, #insp-tracklist, #view-source-corpus');
            if (scrollable) {
                const canScrollY = scrollable.scrollHeight > scrollable.clientHeight;
                if (canScrollY) {
                    const atTop = scrollable.scrollTop <= 0 && e.deltaY < 0;
                    const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1 && e.deltaY > 0;
                    if (!atTop && !atBottom) {
                        return; // Let native element scroll
                    }
                }
            }

            e.preventDefault();
            currentX -= e.deltaX;
            currentY -= e.deltaY;
            currentX = Math.min(0, Math.max(currentX, -(5000 - window.innerWidth)));
            currentY = Math.min(0, Math.max(currentY, -(5000 - window.innerHeight)));
            world.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }, { passive: false });
    }

    const centerLogo = document.getElementById('center-logo-node');
    if (centerLogo) {
        centerLogo.addEventListener('click', () => {
            centerOrigin(false);
            triggerSubliminal(true);
            playNoiseBurst();
        });
    }

    /* =========================================================
       3. DYNAMIC CABLES (FROM EXACT 2500,2500)
       ========================================================= */
    const dynamicCablesSvg = document.getElementById('dynamic-cables');
    let highestZ = 100;

    function updateCables() {
        if (!dynamicCablesSvg) return;
        let svgContent = '';
        const originX = 2500;
        const originY = 2500;

        document.querySelectorAll('.drag-window').forEach(win => {
            const isVisible = window.getComputedStyle(win).display !== 'none';
            if (!isVisible || win.classList.contains('win-fullscreen')) return;

            const centerX = win.offsetLeft + (win.offsetWidth / 2);
            const centerY = win.offsetTop + (win.offsetHeight / 2);

            svgContent += `<path class="dyn-cable" d="M ${originX} ${originY} L ${centerX} ${centerY}" />`;
            svgContent += `<circle cx="${centerX}" cy="${centerY}" r="4.5" fill="var(--bg)" stroke="var(--accent)" stroke-width="2" />`;
        });
        dynamicCablesSvg.innerHTML = svgContent;
    }

    const resizeObserver = new ResizeObserver(() => { updateCables(); });

    /* =========================================================
       4. WINDOW CONTROLS & "OPEN ALL" BUTTON
       ========================================================= */
    function openWindow(winId, autoPan = true) {
        const win = document.getElementById(winId);
        if (!win) return;

        win.style.display = 'flex';
        highestZ++;
        win.style.zIndex = highestZ;

        document.querySelectorAll('.drag-window').forEach(w => w.classList.remove('active-win'));
        win.classList.add('active-win');

        const dockBtn = document.querySelector(`.dock-item[data-target="${winId}"]`);
        if (dockBtn) dockBtn.classList.add('dock-active');

        if (autoPan && !win.classList.contains('win-fullscreen')) {
            const targetX = win.offsetLeft + (win.offsetWidth / 2);
            const targetY = win.offsetTop + (win.offsetHeight / 2);
            panTo(targetX, targetY);
        }

        syncOpenAllButtons();
        updateCables();
    }

    function toggleMaximizeWindow(win) {
        const isMaximized = win.dataset.maximized === 'true';
        if (isMaximized) {
            // Restore window to #world
            win.dataset.maximized = 'false';
            win.classList.remove('win-fullscreen');
            if (win._placeholder && win._placeholder.parentNode) {
                win._placeholder.parentNode.insertBefore(win, win._placeholder);
                win._placeholder.remove();
                win._placeholder = null;
            }
            win.style.top = win._origTop || '';
            win.style.left = win._origLeft || '';
            win.style.width = win._origWidth || '';
            win.style.height = win._origHeight || '';
            const fsBtn = win.querySelector('.fs-btn');
            if (fsBtn) {
                fsBtn.innerText = '[ ]';
                fsBtn.title = 'Maximizar ventana';
            }
        } else {
            // Maximize over viewport (outside transformed #world)
            win._origTop = win.style.top;
            win._origLeft = win.style.left;
            win._origWidth = win.style.width;
            win._origHeight = win.style.height;

            const placeholder = document.createElement('div');
            placeholder.style.display = 'none';
            placeholder.id = `ph-${win.id}`;
            win.parentNode.insertBefore(placeholder, win);
            win._placeholder = placeholder;

            const viewport = document.getElementById('viewport');
            if (viewport) viewport.appendChild(win);

            win.style.top = '0px';
            win.style.left = '0px';
            win.style.width = '100vw';
            win.style.height = '100vh';

            win.dataset.maximized = 'true';
            win.classList.add('win-fullscreen');
            const fsBtn = win.querySelector('.fs-btn');
            if (fsBtn) {
                fsBtn.innerText = '[❐]';
                fsBtn.title = 'Restaurar ventana';
            }
        }
        updateCables();
    }

    function closeWindow(winId) {
        const win = document.getElementById(winId);
        if (!win) return;

        if (win.dataset.maximized === 'true') {
            toggleMaximizeWindow(win);
        }

        win.style.display = 'none';
        win.classList.remove('active-win');

        const dockBtn = document.querySelector(`.dock-item[data-target="${winId}"]`);
        if (dockBtn) dockBtn.classList.remove('dock-active');

        syncOpenAllButtons();
        updateCables();
    }

    function toggleWindow(winId) {
        const win = document.getElementById(winId);
        if (!win) return;
        const isVisible = window.getComputedStyle(win).display !== 'none';
        if (isVisible) closeWindow(winId);
        else openWindow(winId, true);
    }

    function areAllWindowsOpen() {
        const all = document.querySelectorAll('.drag-window');
        for (let w of all) {
            if (window.getComputedStyle(w).display === 'none') return false;
        }
        return true;
    }

    function syncOpenAllButtons() {
        const allOpen = areAllWindowsOpen();
        const topBtn = document.getElementById('btn-toggle-all-windows');
        const dockBtn = document.getElementById('btn-dock-openall');
        if (topBtn) topBtn.innerText = allOpen ? '[ ⊟ CLOSE ALL ]' : '[ ⊞ OPEN ALL ]';
        if (dockBtn) dockBtn.innerText = allOpen ? '[⊟ ALL]' : '[⊞ ALL]';
    }

    function toggleAllWindows() {
        const allOpen = areAllWindowsOpen();
        document.querySelectorAll('.drag-window').forEach(win => {
            if (allOpen) {
                if (win.dataset.maximized === 'true') toggleMaximizeWindow(win);
                win.style.display = 'none';
            } else {
                win.style.display = 'flex';
            }
        });
        document.querySelectorAll('.dock-item[data-target]').forEach(btn => {
            btn.classList.toggle('dock-active', !allOpen);
        });
        syncOpenAllButtons();
        updateCables();
        printTerminal(allOpen ? '[SYS] All 12 windows closed.' : '[SYS] All 12 windows opened across motherboard.');
    }

    const btnToggleAll = document.getElementById('btn-toggle-all-windows');
    if (btnToggleAll) btnToggleAll.addEventListener('click', toggleAllWindows);

    const btnDockAll = document.getElementById('btn-dock-openall');
    if (btnDockAll) btnDockAll.addEventListener('click', toggleAllWindows);

    document.querySelectorAll('.dock-item[data-target]').forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            toggleWindow(targetId);
        });
    });

    // Window controls audit: fullscreen & close
    document.querySelectorAll('.drag-window').forEach(win => {
        resizeObserver.observe(win);
        const header = win.querySelector('.win-header');
        if (!header) return;

        const closeBtn = win.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                closeWindow(win.id);
            });
            closeBtn.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });
        }

        const fsBtn = win.querySelector('.fs-btn');
        if (fsBtn) {
            fsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                toggleMaximizeWindow(win);
            });
            fsBtn.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });
        }

        let isDraggingWin = false;
        let initialX, initialY, wStartX, wStartY;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.close-btn') || e.target.closest('.fs-btn')) {
                return;
            }
            if (win.dataset.maximized === 'true') return;

            isDraggingWin = true;
            highestZ++;
            win.style.zIndex = highestZ;

            document.querySelectorAll('.drag-window').forEach(w => w.classList.remove('active-win'));
            win.classList.add('active-win');

            wStartX = e.clientX;
            wStartY = e.clientY;
            initialX = win.offsetLeft;
            initialY = win.offsetTop;
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDraggingWin || win.dataset.maximized === 'true') return;
            win.style.left = `${initialX + (e.clientX - wStartX)}px`;
            win.style.top = `${initialY + (e.clientY - wStartY)}px`;
            updateCables();
        });

        document.addEventListener('mouseup', () => { isDraggingWin = false; });
    });

    const btnTopTerminal = document.getElementById('btn-top-terminal');
    if (btnTopTerminal) {
        btnTopTerminal.addEventListener('click', () => {
            openWindow('win-terminal', true);
            const input = document.getElementById('terminal-input');
            if (input) input.focus();
        });
    }

    /* =========================================================
       5. DAY / NIGHT MODE & THEME SWITCHER
       ========================================================= */
    const btnDayNight = document.getElementById('btn-daynight-toggle');
    const dayNightIcon = document.getElementById('daynight-icon');
    const dayNightLabel = document.getElementById('daynight-label');

    function applyTheme(themeName) {
        document.body.setAttribute('data-theme', themeName);
        if (themeName === 'day') {
            if (dayNightIcon) dayNightIcon.innerText = '☾';
            if (dayNightLabel) dayNightLabel.innerText = 'NIGHT';
        } else {
            if (dayNightIcon) dayNightIcon.innerText = '☀';
            if (dayNightLabel) dayNightLabel.innerText = 'DAY';
        }

        document.querySelectorAll('.theme-selector-btn').forEach(btn => {
            btn.classList.toggle('theme-active', btn.getAttribute('data-theme') === themeName);
        });

        printTerminal(`[SYS] Active theme: ${themeName.toUpperCase()}`);
        updateCables();
    }

    if (btnDayNight) {
        btnDayNight.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme') || 'extasis';
            applyTheme(currentTheme === 'day' ? 'extasis' : 'day');
        });
    }

    document.querySelectorAll('.theme-selector-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const theme = e.target.getAttribute('data-theme');
            applyTheme(theme);
        });
    });

    /* =========================================================
       6. BILINGUAL (EN/ES) ENGINE
       ========================================================= */
    let currentLang = 'es';
    const langBtn = document.getElementById('lang-toggle');

    function updateLanguage() {
        document.querySelectorAll('.i18n').forEach(el => {
            const translatedText = el.getAttribute(`data-${currentLang}`);
            if (translatedText) el.innerHTML = translatedText;
        });
        if (langBtn) langBtn.innerText = currentLang === 'es' ? '[ EN / ES ]' : '[ ES / EN ]';
        printTerminal(`[SYS] Language toggled to: ${currentLang.toUpperCase()}`);
    }

    if (langBtn) {
        langBtn.addEventListener('click', () => {
            currentLang = currentLang === 'es' ? 'en' : 'es';
            updateLanguage();
        });
    }

    /* =========================================================
       7. SUBLIMINAL FLICKER (LESS FREQUENT: 35-75s)
       ========================================================= */
    const subCanvas = document.getElementById('subliminal-layer');
    if (subCanvas) {
        const subCtx = subCanvas.getContext('2d');
        const extasisImg = new Image();
        extasisImg.src = '/images/extasis.png';

        function resizeSubCanvas() {
            subCanvas.width = window.innerWidth;
            subCanvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeSubCanvas);
        resizeSubCanvas();

        window.triggerSubliminal = function(forceTopy = false) {
            subCtx.clearRect(0, 0, subCanvas.width, subCanvas.height);
            const rand = Math.random();
            const x = (Math.random() * (subCanvas.width * 0.7)) + (subCanvas.width * 0.15);
            const y = (Math.random() * (subCanvas.height * 0.7)) + (subCanvas.height * 0.15);
            const scale = (Math.random() * 1.5) + 0.8;

            if (!forceTopy && rand < 0.4 && extasisImg.complete && extasisImg.naturalHeight !== 0) {
                const size = 300 + Math.random() * 450;
                subCtx.drawImage(extasisImg, x - size/2, y - size/2, size, size);
                subCtx.globalCompositeOperation = 'difference';
                subCtx.fillStyle = Math.random() > 0.5 ? '#FF00FF' : '#00FFFF';
                subCtx.fillRect(0, 0, subCanvas.width, subCanvas.height);
                subCtx.globalCompositeOperation = 'source-over';
            } else if (rand < 0.75 || forceTopy) {
                subCtx.beginPath();
                subCtx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#FF00FF';
                subCtx.lineWidth = 20 * scale;
                const barWidth = 110 * scale;
                subCtx.moveTo(x, y - 190 * scale); subCtx.lineTo(x, y + 190 * scale);
                subCtx.moveTo(x - barWidth, y - 95 * scale); subCtx.lineTo(x + barWidth, y - 95 * scale);
                subCtx.moveTo(x - barWidth, y); subCtx.lineTo(x + barWidth, y);
                subCtx.moveTo(x - barWidth, y + 95 * scale); subCtx.lineTo(x + barWidth, y + 95 * scale);
                subCtx.stroke();
            } else {
                subCtx.fillStyle = 'rgba(255, 0, 50, 0.5)';
                subCtx.fillRect(0, 0, subCanvas.width, subCanvas.height);
                subCtx.fillStyle = 'rgba(0, 255, 255, 0.35)';
                subCtx.fillRect(10, -10, subCanvas.width, subCanvas.height);
            }

            setTimeout(() => subCtx.clearRect(0, 0, subCanvas.width, subCanvas.height), 25);
        };

        function scheduleNextFlicker() {
            const nextDelay = 35000 + Math.random() * 40000;
            setTimeout(() => {
                triggerSubliminal();
                scheduleNextFlicker();
            }, nextDelay);
        }
        scheduleNextFlicker();
    }

    /* =========================================================
       7.5 PROCEDURAL ANSI BBS GRAFFITI SPATIAL SPAWNER
       Authentic ACiD / iCE style block art randomly scattered
       across the 5000x5000 motherboard coordinates on every load
       ========================================================= */
    const ANSI_ART_MURALS = [
        {
            title: "EXTASIS // 3D BLOCK",
            art: `  ▄████████  ▄▄▄       █▄▄▄▄ ▄█    ▄   ██   █▀▄▀█ 
  ███    ███ ▒████▄    █  ▄▀ ██     █  █ █  █ █ █ 
  ███    █▀  ▒██  ▀█▄  █▀▀▌  ██ ██ ▄█▄ █▄▄█ █ ▄ █ 
  ███        ░██▄▄▄▄██ █  █  ▐█ ▒█  █  █▀▀█ █   █ 
  ███   ███   ▓█   ▓██ █  █   ▐ ░█  █  █  █ █   █ 
  ███    ███  ▒▒   ▓▒█ █  █     ▒█  █     █ █   █ 
  ██████████   ▒   ▒▒ █   █     ░████     █ █   █ `
        },
        {
            title: "LAO // DRONE SYSTEM",
            art: ` ▓█████▄  ██▀███   ▒█████   ███▄    █ ▓█████ 
 ▒██▀ ██▌▓██ ▒ ██▒▒██▒  ██▒ ██ ▀█   █ ▓█   ▀ 
 ░██   █▌▓██ ░▄█ ▒▒██░  ██▒▓██  ▀█ ██▒▒███   
 ░▓█▄   ▌▒██▀▀█▄  ▒██   ██░▓██▒  ▐▌██▒▒▓█  ▄ 
 ░▒████▓ ░██▓ ▒██▒░ ████▓▒░▒██░   ▓██░░▒████▒
  ▒▒▓  ▒ ░ ▒▓ ░▒▓░░ ▒░▒░▒░ ░ ▒░   ▒ ▒ ░░ ▒░ ░
  ░ ▒  ▒   ░▒ ░ ▒░  ░ ▒ ▒░ ░ ░░   ░ ▒░ ░ ░  ░`
        },
        {
            title: "NAHUI OLLIN // QUINTO SOL",
            art: `      ▲        ░░▒▓██████▓▒░░        ▲    
    ◄ █ ►    ▓██▀▀        ▀▀██▓    ◄ █ ►  
      ▼      ██    █    █    ██      ▼    
   ═══════   ██   ███  ███   ██   ═══════ 
      ▲      ██    █    █    ██      ▲    
    ◄ █ ►    ▓██▄▄        ▄▄██▓    ◄ █ ►  
      ▼        ░░▒▓██████▓▒░░        ▼    
           [ NAHUI OLLIN // 5TO SOL ]`
        },
        {
            title: "THEE PSYCHICK CROSS // TOPY",
            art: `                █
              ▄▄█▄▄
                █
            ▄▄▄▄█▄▄▄▄
                █
                █
                █
                █
        THEE PSYCHICK CROSS`
        },
        {
            title: "TEZCATLIPOCA // OBSIDIAN MIRROR",
            art: `         ▄▄████████▄▄         
      ▄███▀▀░░░░░░▀▀███▄      
     ███░░  ⌖ OBSIDIAN ░░███   
    ███░░   SMOKING    ░░███  
    ███░░    MIRROR    ░░███  
     ███░░  YOALLI     ░░███  
      ▀███▄▄░░EHECATL░▄███▀   
         ▀▀████████▀▀         `
        },
        {
            title: "MI // CERO MAYA",
            art: `         .---.        
       / /" "\ \\      
      | | (0) | |     
      | |     | |     
       \\ \\_ _/ /      
        '-----'       
     MI / CERO MAYA   
   [ REPOSO PRIMORDIAL ]`
        },
        {
            title: "SECTOR 0xDEAD // BREACH",
            art: `  [!] SECTOR 0xDEAD [!]
  01001110 01010101 01001100
  ╔═════════════════════════╗
  ║ NULL TERMINAL BREACH    ║
  ║ CHICOMOZTOC MATRIX 93/23║
  ╚═════════════════════════╝`
        },
        {
            title: "CHICOMOZTOC // 7 CAVES",
            art: `         / \\         
        /   \\        
       / [1] \\       
     / [2] [3] \\     
    / [4] [5] [6]\\   
   /      [7]     \\  
  ═══════════════════
   CHICOMOZTOC 7-CAVES`
        },
        {
            title: "160 BPM // JUNGLE PIRATA",
            art: `  ░█▀▀░█░█░█▀▄░█▀▀░█▀▄░█░█░█▀█░█░█
  ░█░░░█░█░█▀▄░█▀▀░█▀▄░█░█░█▀▀░█▀▄
  ░▀▀▀░▀▀▀░▀▀░░▀▀▀░▀░▀░▀▀▀░▀░░░▀░▀
   160 BPM AMEN BREAK REVOLUTION`
        },
        {
            title: "CCRU // NUMOGRAM",
            art: `    ┌─┐┬ ┬┌─┐┬ ┬┌─┐┬ ┬
    └─┐└┬┘┌─┘└┬┘│ ┬└┬┘
    └─┘ ┴ └─┘ ┴ └─┘ ┴ 
     CCRU // NUMOGRAM 
   ANOMALY GATES [0..9]`
        },
        {
            title: "TRIBAL GUARCHERO // 134 BPM",
            art: `    ╔╦╗╦═╗╦╔╗ ╔═╗╦  
     ║ ╠╦╝║╠╩╗╠═╣║  
     ╩ ╩╚═╩╚═╝╩ ╩╩═╝
    MEXICAN SOUND SYSTEM
     134 BPM POLIRRITMIA`
        },
        {
            title: "EXTASIS // ACiD SCENE",
            art: `      _   ___ _    __  
     /_\\ / __(_)__/ /  
    / _ / /__/ / _  /   
   /_/ |_\\___/_|_,_/   
    >> EXTASIS SYSTEM <<
   ACiD / iCE SCENE BBS`
        }
    ];

    function spawnProceduralAnsiMurals() {
        const container = document.getElementById('procedural-ansi-container');
        if (!container) return;
        container.innerHTML = '';

        const cols = 4;
        const rows = 3;
        const cellWidth = 3800 / cols;
        const cellHeight = 3800 / rows;
        const startX = 600;
        const startY = 600;

        const shuffledMurals = [...ANSI_ART_MURALS].sort(() => Math.random() - 0.5);

        shuffledMurals.forEach((mural, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);

            const jitterX = (Math.random() * 0.6 + 0.2) * cellWidth;
            const jitterY = (Math.random() * 0.6 + 0.2) * cellHeight;
            const posX = Math.floor(startX + (col * cellWidth) + jitterX);
            const posY = Math.floor(startY + (row * cellHeight) + jitterY);

            const pre = document.createElement('pre');
            const isAccent = Math.random() > 0.45;
            const colorVar = isAccent ? 'var(--accent)' : 'var(--main)';
            const opacity = (0.24 + Math.random() * 0.16).toFixed(2);
            const rot = ((Math.random() - 0.5) * 4).toFixed(1);

            pre.className = 'ansi-mural';
            pre.style.position = 'absolute';
            pre.style.top = `${posY}px`;
            pre.style.left = `${posX}px`;
            pre.style.color = colorVar;
            pre.style.opacity = opacity;
            pre.style.transform = `rotate(${rot}deg)`;
            pre.style.pointerEvents = 'none';
            pre.style.userSelect = 'none';
            pre.style.zIndex = '3';
            pre.style.fontFamily = 'monospace';
            pre.style.fontSize = '8.5px';
            pre.style.lineHeight = '1.05';
            pre.style.textShadow = isAccent ? '0 0 10px rgba(230, 0, 122, 0.4)' : '0 0 10px rgba(0, 255, 255, 0.4)';
            pre.innerText = mural.art;
            pre.setAttribute('data-title', mural.title);

            container.appendChild(pre);
        });
    }

    spawnProceduralAnsiMurals();

    /* =========================================================
       8. CATALOG DATABASE & UNIVERSAL ITEM INSPECTOR
       ========================================================= */
    const CATALOG_DATABASE = {
        "chapultepec": {
            id: "chapultepec",
            title: "Chapultepec (LP)",
            subtitle: "NAAFI / Extasis Records — Lauro Robles",
            type: "ÁLBUM OFICIAL (LP)",
            year: "2024",
            cover: "/images/covers/chapultepec.jpg",
            desc: "Obra cumbre representativa de Lauro Robles (LAO). Exploración profunda de polirritmias del club latinoamericano, síntesis modular de bajo calado, percusión ceremonial prehispánica y texturas acústicas de la Ciudad de México.",
            details: [
                "Formato: LP Vinilo / Digital Master de Alta Fidelidad",
                "Sello: NAAFI / Extasis Records",
                "Estudio: Chapultepec, Ciudad de México",
                "Mastering: Modos Studios (Imaabs)",
                "Pistas clave: Chapultepec, Sendero, Circuito Interior, Espejo de Obsidiana"
            ],
            streamType: "bandcamp",
            streamPayload: "3075678434",
            links: {
                bc: "https://lao00.bandcamp.com/album/chapultepec",
                sc: "https://soundcloud.com/lao",
                spotify: "https://open.spotify.com/artist/5LqZfTcmN1eQ74j9N0n2X3",
                apple: "https://music.apple.com/artist/lao/200498"
            }
        },
        "coastal_acid": {
            id: "coastal_acid",
            title: "Coastal Acid (EP)",
            subtitle: "Extasis Records — Lauro Robles",
            type: "EP OFICIAL",
            year: "2024",
            cover: "/images/covers/coastal_acid.jpg",
            desc: "Líneas de sintetizador 303 corrosivo entrelazadas con cadencias de tribal y percusiones tropicales de la costa pacífica mexicana. Una colisión entre el warehouse ácido y el perreo distópico.",
            details: [
                "Formato: EP Digital Master",
                "Sello: Extasis Records",
                "BPM: 130 - 140 BPM",
                "Hardware: Roland TB-03, Elektron Machinedrum, C++ ExtasisDonker"
            ],
            streamType: "bandcamp",
            streamPayload: "2775618451",
            links: {
                bc: "https://lao00.bandcamp.com/album/coastal-acid",
                sc: "https://soundcloud.com/lao"
            }
        },
        "lo_que_queda": {
            id: "lo_que_queda",
            title: "Lo Que Queda, Vuelve (EP)",
            subtitle: "LAO x Other Islands — Terminal Records",
            type: "EP COLABORATIVO",
            year: "2025",
            cover: "/images/covers/lo_que_queda.jpg",
            desc: "Colaboración sónica entre LAO y Other Islands. Tres piezas de ambient techno crepuscular, texturas cinemáticas y percusiones flotantes.",
            details: [
                "1. De Alguna Manera",
                "2. Años Después",
                "3. Menos Dicho",
                "Producción & Mezcla: LAO & Other Islands",
                "Mastering: Imaabs (Modos Studios)"
            ],
            streamType: "bandcamp",
            streamPayload: "3075678434",
            links: {
                bc: "https://lao00.bandcamp.com",
                sc: "https://soundcloud.com/lao"
            }
        },
        "sendero": {
            id: "sendero",
            title: "Sendero (ft. TSVI)",
            subtitle: "NAAFI — Lao & TSVI (Nervous Horizon)",
            type: "SINGLE COLABORATIVO",
            year: "2023",
            cover: "/images/covers/sendero.jpg",
            desc: "Colaboración transcontinental con TSVI (fundador de Nervous Horizon en Londres). Fusión de percusión ceremonial mesoamericana y bass music de club británico hiper-acelerado.",
            details: [
                "Sello: NAAFI",
                "Curaduría: Mexican Jihad",
                "Sonido: Polirritmia 135 BPM, Sub-bass y kicks ceremoniales"
            ],
            streamType: "bandcamp",
            bandcampType: "track",
            streamPayload: "2719129759",
            links: {
                bc: "https://naafi.bandcamp.com/track/sendero-feat-tsvi",
                sc: "https://soundcloud.com/lao"
            }
        },
        "guacamaya": {
            id: "guacamaya",
            title: "Guacamaya",
            subtitle: "NAAFI — Lao & DJ Fucci",
            type: "SINGLE DE CLUB",
            year: "2022",
            cover: "/images/covers/guacamaya.jpg",
            desc: "Himno de baile acelerado cruzando guaracha, tambores caribeños y procesamiento espectral. Creado para demoler pistas de club de alta fidelidad.",
            details: [
                "Sello: NAAFI",
                "Artistas: Lao & DJ Fucci",
                "Formato: WAV 24-bit Master"
            ],
            streamType: "bandcamp",
            streamPayload: "3075678434",
            links: {
                bc: "https://naafi.bandcamp.com",
                sc: "https://soundcloud.com/lao"
            }
        },
        "protective_core": {
            id: "protective_core",
            title: "Protective Core (EP) [EXTASIS024]",
            subtitle: "Extasis Records — Lao & Copout",
            type: "EP OFICIAL",
            year: "2021",
            cover: "/images/covers/protective_core.jpg",
            desc: "Sound design quirúrgico, arquitectura de club distópico y síntesis granular. Colaboración con Copout explorando la armadura sónica frente a la aceleración mediática.",
            details: [
                "Catálogo: EXTASIS024",
                "Arte de portada: 3D render y serigrafía",
                "Sello: Extasis Records"
            ],
            streamType: "bandcamp",
            streamPayload: "3075678434",
            links: {
                bc: "https://extasisrecords.bandcamp.com",
                sc: "https://soundcloud.com/lao"
            }
        },
        "clasicos_vol1": {
            id: "clasicos_vol1",
            title: "Clásicos Vol. 1 [EXTASIS031]",
            subtitle: "Extasis Records — Compilación Antológica",
            type: "COMPILACIÓN",
            year: "2020",
            cover: "/images/covers/clasicos_vol1.jpg",
            desc: "Compilación antológica de himnos esenciales producidos por Lao para la pista subterránea durante una década de residencias y giras internacionales.",
            details: [
                "Catálogo: EXTASIS031",
                "Curaduría: Lauro Robles",
                "12 cortes históricos remasterizados"
            ],
            streamType: "bandcamp",
            streamPayload: "3075678434",
            links: {
                bc: "https://extasisrecords.bandcamp.com",
                sc: "https://soundcloud.com/lao"
            }
        },
        "fake_doi": {
            id: "fake_doi",
            title: "Fake Dói",
            subtitle: "NAAFI — Lao",
            type: "SINGLE",
            year: "2019",
            cover: "/images/covers/fake_doi.jpg",
            desc: "Deconstrucción cruda de funk carioca de favela y bassline metálico. Ritmo sincopado de club de combate.",
            details: [
                "Sello: NAAFI",
                "Producción: Lauro Robles",
                "Estudio: Chapultepec, CDMX"
            ],
            streamType: "bandcamp",
            streamPayload: "3075678434",
            links: {
                bc: "https://naafi.bandcamp.com",
                sc: "https://soundcloud.com/lao"
            }
        },
        "singularity": {
            id: "singularity",
            title: "Singularity (LP / Cassette)",
            subtitle: "Dome Of Doom (Los Ángeles) — Lao & Speak!",
            type: "LP / ÁLBUM COLABORATIVO",
            year: "2019",
            cover: "/images/covers/singularity.jpg",
            desc: "Producción instrumental íntegra de Lao para el rapero de Los Ángeles Speak! (Speakz). Síntesis hip-hop futurista, baterías oscuras y vanguardia transfronteriza.",
            details: [
                "Sello: Dome Of Doom Records (LA, California)",
                "Formato: Cassette de edición limitada y Digital",
                "Producción & Mezcla: Lao",
                "Vocales & Letras: Speak!"
            ],
            streamType: "bandcamp",
            streamPayload: "3075678434",
            links: {
                bc: "https://domeofdoom.bandcamp.com",
                sc: "https://soundcloud.com/lao"
            }
        },
        "perfil": {
            id: "perfil",
            title: "Perfil (EP)",
            subtitle: "NAAFI — Lao",
            type: "EP OFICIAL",
            year: "2017",
            cover: "/images/covers/perfil.jpg",
            desc: "Pilar absoluto del club latino contemporáneo. Un manifiesto rítmico que articuló el sonido de NAAFI en Berghain, CTM Berlín y festivales globales.",
            details: [
                "Sello: NAAFI",
                "Tracks: Perfil, Milagro, Nómada",
                "Aclamado por Resident Advisor, XLR8R y FACT Magazine"
            ],
            streamType: "bandcamp",
            streamPayload: "3075678434",
            links: {
                bc: "https://naafi.bandcamp.com/album/perfil",
                sc: "https://soundcloud.com/lao"
            }
        },
        "catedral": {
            id: "catedral",
            title: "Catedral (EP)",
            subtitle: "NAAFI — Lao",
            type: "EP FUNDACIONAL",
            year: "2014",
            cover: "/images/covers/catedral.jpg",
            desc: "Hito fundacional del movimiento NAAFI. El EP que situó a la Ciudad de México como epicentro de la nueva vanguardia electrónica global.",
            details: [
                "Sello: NAAFI",
                "Año: 2014",
                "Reconocimiento: Catalogado entre los discos clave de la década de 2010 por la prensa musical internacional."
            ],
            streamType: "bandcamp",
            streamPayload: "3075678434",
            links: {
                bc: "https://naafi.bandcamp.com/album/catedral",
                sc: "https://soundcloud.com/lao"
            }
        },
        "amen_ep": {
            id: "amen_ep",
            title: "Amen EP [FILTRO.016]",
            subtitle: "Filtro Netlabel — Debut Histórico",
            type: "EP DEBUT HISTÓRICO",
            year: "2006",
            cover: "/images/covers/amen_ep.jpg",
            desc: "Primer lanzamiento oficial de Lauro Robles a sus 20 años en el mítico netlabel mexicano Filtro. Fusión pionera de dub místico, ambient IDM y primeras síncopas de reggaetón underground.",
            details: [
                "Catálogo: FILTRO.016",
                "Fecha de salida: 28 de abril de 2006",
                "Tracks: Glory Sat., Heavendub, Inmaculate Deception"
            ],
            streamType: "bandcamp",
            streamPayload: "3075678434",
            links: {
                bc: "https://netlabelarchive.org/2006/04/28/filtro-016/",
                sc: "https://soundcloud.com/lao"
            }
        },

        // MIXES & LIVE SETS
        "mix-drama-2026": {
            id: "mix-drama-2026",
            title: "Drama Radio Bar (CDMX) — Lapi invites Lao",
            subtitle: "Transmisión en vivo desde Ciudad de México",
            type: "LIVE CLUB SET",
            year: "2026",
            cover: "/images/covers/chapultepec.jpg",
            desc: "Sesión de club en vivo grabada en mayo 2026 en Drama Radio Bar (CDMX). Selección exclusiva de dubplates inéditos, edits 2026 y bass music territorial.",
            details: ["Duración: 60 min", "Grabado en vivo en CDMX", "Plataforma: YouTube & Radio Broadcast"],
            streamType: "youtube",
            streamPayload: "5T8_ZpS2rUk",
            links: { youtube: "https://www.youtube.com/watch?v=5T8_ZpS2rUk", sc: "https://soundcloud.com/lao" }
        },
        "mix-japan-2024": {
            id: "mix-japan-2024",
            title: "Japan Club #0131 (Brillo)",
            subtitle: "Gira Japonesa — Transmisión Oficial",
            type: "LIVE BROADCAST",
            year: "2024",
            cover: "/images/covers/coastal_acid.jpg",
            desc: "Set de club grabado en Tokio como parte de la gira asiática 2024. Mezcla hipnótica de acid latino y breakbeats.",
            details: ["Tokio, Japón", "Serie: JAPAN CLUB #0131", "Plataforma: Japan TV / YouTube"],
            streamType: "youtube",
            streamPayload: "K81412qHl-A",
            links: { youtube: "https://www.youtube.com/watch?v=K81412qHl-A", sc: "https://soundcloud.com/lao" }
        },
        "mix-boiler-room-shenzhen": {
            id: "mix-boiler-room-shenzhen",
            title: "Boiler Room Shenzhen (OIL Club)",
            subtitle: "Boiler Room China — Asian Tour",
            type: "BOILER ROOM SET",
            year: "2018",
            cover: "/images/covers/perfil.jpg",
            desc: "Presentación histórica en el OIL Club de Shenzhen durante la gira por China. Una de las sesiones de club latino más intensas emitidas por Boiler Room.",
            details: ["Lugar: OIL Club, Shenzhen, China", "Evento RA: 1270626", "Plataforma: Boiler Room / YouTube"],
            streamType: "youtube",
            streamPayload: "5T8_ZpS2rUk",
            links: { youtube: "https://www.youtube.com/watch?v=5T8_ZpS2rUk", sc: "https://soundcloud.com/lao" }
        },
        "mix-boiler-room-barcelona": {
            id: "mix-boiler-room-barcelona",
            title: "Boiler Room x System: Barcelona",
            subtitle: "Boiler Room España — Sesión de Culto",
            type: "BOILER ROOM SET",
            year: "2016",
            cover: "/images/covers/catedral.jpg",
            desc: "Sesión especial para la serie System de Boiler Room en Barcelona, presentando los himnos primordiales de NAAFI y edits exclusivos.",
            details: ["Barcelona, España", "Serie: Boiler Room x System"],
            streamType: "youtube",
            streamPayload: "K81412qHl-A",
            links: { youtube: "https://www.youtube.com/watch?v=K81412qHl-A", sc: "https://soundcloud.com/lao" }
        },
        "mix-boiler-room-cdmx": {
            id: "mix-boiler-room-cdmx",
            title: "Boiler Room Mexico City — LAO Showcase",
            subtitle: "NAAFI Showcase — Transmisión Legendaria",
            type: "BOILER ROOM SET",
            year: "2015",
            cover: "/images/covers/catedral.jpg",
            desc: "La primera transmisión masiva de Boiler Room en Ciudad de México que consagró internacionalmente al colectivo NAAFI y el sonido de Lao.",
            details: ["Ciudad de México", "Showcase: NAAFI Takeover", "Visualización en streaming mundial"],
            streamType: "youtube",
            streamPayload: "5T8_ZpS2rUk",
            links: { youtube: "https://www.youtube.com/watch?v=5T8_ZpS2rUk", sc: "https://soundcloud.com/lao" }
        },
        "mix-xlr8r-626": {
            id: "mix-xlr8r-626",
            title: "XLR8R Podcast 626: Lao",
            subtitle: "Podcast de Autor & Entrevista Documental",
            type: "PODCAST / DJ MIX",
            year: "2020",
            cover: "/images/covers/clasicos_vol1.jpg",
            desc: "Sesión en profundidad curada por Lao celebrando 10 años de NAAFI y su estudio en Chapultepec. Acompañada de extensa entrevista retrospectiva.",
            details: ["Plataforma: XLR8R", "Edición: Podcast 626", "Duración: 65 min"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao",
            links: { sc: "https://soundcloud.com/lao", bc: "https://lao00.bandcamp.com" }
        },
        "mix-yeyojungle": {
            id: "mix-yeyojungle",
            title: "Yeyojungle (Lao Bootleg)",
            subtitle: "SoundCloud Special Release — 2026",
            type: "BOOTLEG / CLUB EDIT",
            year: "2026",
            cover: "/images/covers/sendero.jpg",
            desc: "Bootleg de jungle y perreo visceral publicado en 2026 en el SoundCloud oficial de LAO.",
            details: ["Plataforma: SoundCloud Oficial", "BPM: 160 BPM", "Descarga habilitada para DJs"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao/yeyojungle-lao-bootleg",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "mix-id-mag": {
            id: "mix-id-mag",
            title: "i-D Magazine Exclusive Mix",
            subtitle: "i-D UK / Global — Bass & Club latino",
            type: "EXCLUSIVA DE PRENSA",
            year: "2016",
            cover: "/images/covers/perfil.jpg",
            desc: "Mezcla exclusiva para la prestigiosa revista británica i-D Magazine, documentando la vanguardia electrónica latinoamericana.",
            details: ["Londres, Reino Unido", "Plataforma: i-D / SoundCloud"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "mix-dazed-2024": {
            id: "mix-dazed-2024",
            title: "Dazed Mix: Lao",
            subtitle: "Dazed & Confused Magazine (Londres, UK) — 2024",
            type: "MIX EXCLUSIVO GLOBAL",
            year: "2024",
            cover: "/images/covers/chapultepec.jpg",
            desc: "Sesión exclusiva comisionada por la influyente revista británica Dazed & Confused con motivo del lanzamiento de Chapultepec, desglosando polirritmias latinas, trance distópico y clubbing mutante.",
            details: ["Plataforma: Dazed Digital / SoundCloud", "Londres, Reino Unido", "Lanzamiento oficial 2024"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "mix-boiler-room-puerto-escondido": {
            id: "mix-boiler-room-puerto-escondido",
            title: "Boiler Room Puerto Escondido — LAO",
            subtitle: "NAAFI Coastal Showcase — Oaxaca, México",
            type: "SESIÓN EN VIVO / BROADCAST",
            year: "2016",
            cover: "/images/covers/perfil.jpg",
            desc: "Transmisión histórica frente al Pacífico en Puerto Escondido. Un set icónico de bass y club periférico transmitido a nivel mundial.",
            details: ["Plataforma: Boiler Room Oficial", "Ubicación: Puerto Escondido, Oaxaca", "NAAFI All-Stars"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/platform/lao-1",
            links: { sc: "https://soundcloud.com/platform/lao-1", youtube: "https://www.youtube.com/watch?v=WidscFgCsXw" }
        },
        "mix-mutek-live-171": {
            id: "mix-mutek-live-171",
            title: "MUTEKLIVE171: Lao Live",
            subtitle: "MUTEK México Edición 15 — Nocturne 1",
            type: "GRABACIÓN EN VIVO DE FESTIVAL",
            year: "2018",
            cover: "/images/covers/catedral.jpg",
            desc: "Grabación oficial en directo del show de Lao en MUTEK México Edición 15 (Nocturne 1, El Laboratorio), desplegando su visión del 'Batido Oscuro' a través del drum & bass, reggaetón y ritmos rotos.",
            details: ["Festival: MUTEK México (Edición 15)", "Formato: MUTEKLIVE Serie Oficial", "CDMX"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/mutekmx/muteklive171-lao",
            links: { sc: "https://soundcloud.com/mutekmx/muteklive171-lao" }
        },
        "mix-seoul-community-radio": {
            id: "mix-seoul-community-radio",
            title: "Seoul Community Radio (SCR): Lao Live Session",
            subtitle: "Live from Itaewon, Seúl (Corea del Sur) — 2017",
            type: "TRANSMISIÓN DE RADIO EN VIVO",
            year: "2017",
            cover: "/images/covers/amen_ep.jpg",
            desc: "Sesión en vivo transmitida directamente desde la cabina de Seoul Community Radio (SCR) en Itaewon, como previa a su show principal en Cakeshop Seoul durante la gira asiática 2017.",
            details: ["Emisora: Seoul Community Radio (SCR)", "Ubicación: Seúl, Corea del Sur", "Gira: Lao Asia Tour 2017"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "mix-nts-takeover-2015": {
            id: "mix-nts-takeover-2015",
            title: "NTS Radio: NAAFI Mexico City Takeover (Lao)",
            subtitle: "NTS Radio International — Londres / Global",
            type: "BROADCAST RADIAL GLOBAL",
            year: "2015",
            cover: "/images/covers/perfil.jpg",
            desc: "Toma de control del canal internacional de NTS Radio por parte del colectivo NAAFI desde la Ciudad de México. Una hora dedicada a las mutaciones pioneras de footwork, cumbia y club latino.",
            details: ["Emisora: NTS Radio (Londres)", "Fecha: 15 de Noviembre, 2015", "Showcase: NAAFI Mexico City Takeover"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao",
            links: { web: "https://www.nts.live/shows/naafi-mexico-city/episodes/lao-naafi-mexico-takeover" }
        },

        // PROYECTOS & ARTE CONTEMPORÁNEO
        "art-bienal-venecia": {
            id: "art-bienal-venecia",
            title: "60ª Bienal de Arte de Venecia (2024) — La Culebra",
            subtitle: "Arsenale di Venezia — Dirección y Composición Musical",
            type: "DIRECCIÓN MUSICAL & ARTE",
            year: "2024",
            cover: "/images/covers/chapultepec.jpg",
            desc: "Dirección y composición musical para el performance oficial de clausura 'La Culebra' en el Arsenale de la 60ª Bienal de Arte de Venecia. Proyecto interdisciplinario en colaboración con WangShui, Alberto Bustamante, Bárbara Sánchez-Kane, La Bruja de Texcoco, Little Owl, Debit, TONO y Kuboraum. Afterparty oficial curado en COMBO Venice.",
            details: [
                "Institución: La Biennale di Venezia (60th International Art Exhibition)",
                "Espacio: Arsenale di Venezia (Teatro alle Tese)",
                "Comisión: Composición orquestal electrónica y percusiones en vivo",
                "Artistas colaboradores: WangShui, Alberto Bustamante, Sánchez-Kane, La Bruja de Texcoco"
            ],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao",
            links: { sc: "https://soundcloud.com/lao", bc: "https://lao00.bandcamp.com" }
        },
        "art-tono-atlacoya": {
            id: "art-tono-atlacoya",
            title: "Festival TONO (2023) — Atlacoya: El agua triste",
            subtitle: "Zyanya (Azcapotzalco, CDMX) — Diseño Sonoro Inmersivo",
            type: "ÓPERA EXPERIMENTAL & SOUND DESIGN",
            year: "2023",
            cover: "/images/covers/sendero.jpg",
            desc: "Creación conceptual y diseño sonoro inmersivo para la ópera experimental 'Atlacoya: El agua triste del Lago de Texcoco'. Reconstrucción acústica de memorias lacustres y arqueología sonora del Valle de México.",
            details: [
                "Festival: Festival TONO de Arte Contemporáneo y Performance",
                "Lugar: Zyanya, Azcapotzalco, Ciudad de México",
                "Concepto: Ondas hidroacústicas, lamentos fónicos y síntesis sub-acuática"
            ],
            streamType: "bandcamp",
            streamPayload: "2719129759",
            links: { bc: "https://naafi.bandcamp.com", sc: "https://soundcloud.com/lao" }
        },
        "art-rbma-tokyo": {
            id: "art-rbma-tokyo",
            title: "Red Bull Music Academy Tokyo (2014)",
            subtitle: "UNIT Daikanyama — Residencia Artística Internacional",
            type: "RESIDENCIA & LIVE PERFORMANCE",
            year: "2014",
            cover: "/images/covers/catedral.jpg",
            desc: "Participante seleccionado (Term 1) en Tokio, Japón. Laboratorios de producción musical en estudios Red Bull, grabaciones en cinta y show histórico en UNIT (Daikanyama) compartiendo escenario con Mala & Coki (Digital Mystikz).",
            details: [
                "Sede: Tokio, Japón (2014)",
                "Clubs: UNIT (Daikanyama), Circus Tokyo",
                "Broadcast: Red Bull Radio en directo a nivel global"
            ],
            streamType: "bandcamp",
            streamPayload: "3075678434",
            links: { bc: "https://naafi.bandcamp.com", sc: "https://soundcloud.com/lao" }
        },
        "art-estado-ccd": {
            id: "art-estado-ccd",
            title: "ESTADO: Música Electrónica, Baile y Dislocaciones (2012)",
            subtitle: "Centro de Cultura Digital (Estela de Luz, CDMX)",
            type: "CO-CURADURÍA & INVESTIGACIÓN SOCIOMUSICAL",
            year: "2012",
            cover: "/images/covers/clasicos_vol1.jpg",
            desc: "Co-curaduría, conceptualización e investigación sociomusical junto a Alberto Bustamante y Diego Ríos. Cuatro noches y transmisiones cartografiando los nodos sonoros y la resistencia cultural mexicana (Lowers / Cd. Juárez, Ruidosón / Tijuana, Finesse / Monterrey, Extasis / CDMX). Archivo digital: e-s-t-a-d-o.com.",
            details: [
                "Institución: Centro de Cultura Digital (Secretaría de Cultura)",
                "Archivo oficial: e-s-t-a-d-o.com",
                "Curadores: Lauro Robles, Alberto Bustamante, Diego Ríos"
            ],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao",
            links: { sc: "https://soundcloud.com/lao", bc: "https://extasisrecords.bandcamp.com" }
        },
        "art-naafi-extasis": {
            id: "art-naafi-extasis",
            title: "NAAFI & Extasis Records (2010 a la fecha)",
            subtitle: "Refundación del Clubbing Global & Plataforma Sónica",
            type: "CO-FUNDACIÓN NAAFI & A&R EXTASIS",
            year: "2010-2026",
            cover: "/images/covers/perfil.jpg",
            desc: "Lauro Robles es co-fundador de NAAFI, el colectivo que desde 2010 reconfiguró el panorama mundial de la música electrónica. Asimismo, es fundador, director y A&R de Extasis Records y Baby Thug.",
            details: [
                "Co-Fundador de NAAFI",
                "Fundador, Director y A&R de Extasis Records",
                "Giras mundiales en Berghain, Sónar, CTM Berlín, MUTEK Montreal, Japón, China, Taiwán"
            ],
            streamType: "bandcamp",
            streamPayload: "3075678434",
            links: { bc: "https://naafi.bandcamp.com", sc: "https://soundcloud.com/lao" }
        },
        "art-comisiones": {
            id: "art-comisiones",
            title: "Comisiones Comerciales, Scoring & Identidad Sonora",
            subtitle: "Tequila Don Julio, Cerveza Victoria, Corona, Grupo Herdez",
            type: "DISEÑO SONORO COMERCIAL & CINE",
            year: "2018-2026",
            cover: "/images/covers/protective_core.jpg",
            desc: "Portafolio de diseño sonoro, identidad acústica institucional y scoring cinematográfico para campañas globales de alto impacto: Tequila Don Julio (Campaña 'Por Amor' - Diageo), Corona, Cerveza Victoria y Grupo Herdez.",
            details: [
                "Tequila Don Julio: Campaña 'Por Amor' (Diageo)",
                "Grupo Modelo: Corona & Cerveza Victoria",
                "Grupo Herdez: Postproducción y mezcla broadcast a cuadro"
            ],
            streamType: "bandcamp",
            streamPayload: "3075678434",
            links: { bc: "https://lao00.bandcamp.com" }
        },

        // VIDEOS
        "video-br-barcelona": {
            id: "video-br-barcelona",
            title: "Boiler Room x System: Barcelona",
            subtitle: "Boiler Room España — Sesión de Culto",
            type: "VIDEO ARCHIVO",
            year: "2016",
            cover: "/images/covers/perfil.jpg",
            desc: "Sesión de Boiler Room en Barcelona junto a la vanguardia española y europea.",
            details: ["YouTube ID: K81412qHl-A", "Boiler Room Oficial"],
            streamType: "youtube",
            streamPayload: "K81412qHl-A",
            links: { youtube: "https://www.youtube.com/watch?v=K81412qHl-A" }
        },
        "video-hangover": {
            id: "video-hangover",
            title: "Tomasa del Real — Hangover",
            subtitle: "Producción Original: Lao & Paul Marmota",
            type: "VIDEO MUSICAL OFICIAL",
            year: "2016",
            cover: "/images/covers/fake_doi.jpg",
            desc: "Video musical oficial del clásico himno de neoperreo 'Hangover', producido por Lao y Paul Marmota para Tomasa del Real y Moisturisin Mini.",
            details: ["Producción: Lao & Paul Marmota", "YouTube ID: xV3UqM7sJt4"],
            streamType: "youtube",
            streamPayload: "xV3UqM7sJt4",
            links: { youtube: "https://www.youtube.com/watch?v=xV3UqM7sJt4" }
        },

        // AUDIO DSP PLUGINS & GITHUB C++ REPOSITORIES (@laurorobles) - SPECS & DOCUMENTATION ONLY
        "plugin-extasis-donker": {
            id: "plugin-extasis-donker",
            title: "Extasis Donker (v3.1.0)",
            subtitle: "FM Donk & Guaracha Bass Synthesizer Workstation",
            type: "DSP AUDIO PLUGIN",
            year: "2026",
            cover: "/images/plugins/donker.png",
            desc: "Sintetizador FM avanzado diseñado para bajos Donk, Hard House y Guaracha Bass, inspirado en el chip Yamaha TX81Z (1987) y el sonido LatelyBass. Implementa un motor multi-algoritmo FM de 4 operadores con generador de transitorios 'Click' y sub-oscilador analógico acoplado.",
            details: [
                "Arquitectura: JUCE 7 / C++17 Multiplataforma (macOS & Windows)",
                "Formatos: VST3, AU (AudioUnit) y Standalone de 64-bits",
                "Módulos DSP: 4-Op FM Engine, Sub-Bass Generator, Transient Click Shaper, LFO Matrix",
                "Presets de Fábrica: Donk Classic, Hardgroove Sub, Guaracha Perreo, TX81Z Lately 2026",
                "Licencia: Extasis Records Proprietary / Commercial",
                "Repositorio: https://github.com/laurorobles/ExtasisDonker"
            ],
            streamType: null,
            streamPayload: null,
            links: {
                github: "https://github.com/laurorobles/ExtasisDonker",
                bc: "https://extasisrecords.bandcamp.com"
            }
        },
        "plugin-extasis-rhythm": {
            id: "plugin-extasis-rhythm",
            title: "Extasis Rhythm (v3.1.0)",
            subtitle: "Polyrhythmic 12-Bit Drum Machine & Sampler Workstation",
            type: "DSP AUDIO PLUGIN",
            year: "2026",
            cover: "/images/plugins/rhythm.png",
            desc: "Caja de ritmos polirrítmica de 12 canales con emulación PCM Sample-and-Hold de 12 bits inspirada en el crunch clásico del E-mu SP-1200. Incluye sistema modular Drag & Drop de muestras WAV/AIF, renderizado offline instantáneo Drag-to-DAW y auto-etiquetado inteligente de kicks, snares y hi-hats mediante análisis de Centroide Espectral FFT.",
            details: [
                "12 Canales Polirrítmicos independientes con swing estocástico",
                "Conversión 12-Bit ADC Crunch (algoritmo E-mu SP-1200)",
                "Exportación Drag-to-DAW: render instantáneo de loops de 16 segundos a pista de audio",
                "Sidechain PUMP analógico con curvas orgánicas de ataque y release",
                "Auto-Tagging inteligente de percusión con análisis espectral FFT",
                "Repositorio: https://github.com/laurorobles/ExtasisRhythm"
            ],
            streamType: null,
            streamPayload: null,
            links: {
                github: "https://github.com/laurorobles/ExtasisRhythm",
                bc: "https://extasisrecords.bandcamp.com"
            }
        },
        "plugin-orbita-lpg": {
            id: "plugin-orbita-lpg",
            title: "Orbita-LPG",
            subtitle: "Generative 6-Voice West Coast Synthesizer & Euclidean Sequencer",
            type: "DSP AUDIO PLUGIN",
            year: "2026",
            cover: "/images/plugins/orbita.png",
            desc: "Ecosistema generativo de síntesis West Coast (Buchla 259/292) compuesto por 6 canales independientes. Cada canal cuenta con oscilador de morphing continuo (Triangle a Square), Wavefolder matemático ADAA anti-aliased sin sobrecarga de CPU, retroalimentación Auto-FM, generador de transitorios de caída de pitch y un Low Pass Gate con modelado de resistencia óptica de Vactrol.",
            details: [
                "Filosofía de síntesis West Coast: adición no-lineal y plegado armónico",
                "ADAA Wavefolder (Anti-Derivative Anti-Aliasing) en tiempo real",
                "Vactrol LPG (Low Pass Gate) con inercia óptica analógica (Buchla Bongos)",
                "Matriz de 6 secuenciadores euclidianos Bjorklund simultáneos con rotación de offset",
                "Código: C++17 / GPL v3.0 Open Source",
                "Repositorio: https://github.com/laurorobles/Orbita-LPG-JUCE"
            ],
            streamType: null,
            streamPayload: null,
            links: {
                github: "https://github.com/laurorobles/Orbita-LPG-JUCE",
                bc: "https://extasisrecords.bandcamp.com"
            }
        },
        "plugin-extasis-marimba": {
            id: "plugin-extasis-marimba",
            title: "Extasis Marimba",
            subtitle: "Mexican Physical-FM Synthesizer (Marimba Chiapaneca / Oaxaqueña)",
            type: "DSP AUDIO PLUGIN",
            year: "2026",
            cover: "/images/plugins/marimba.png",
            desc: "Sintetizador virtual CPU-efficient que modela la física acústica completa de la marimba tradicional mexicana (madera de hormiguillo, resonadores tubulares y golpe de mazo con caucho natural). No utiliza muestras estáticas; cada nota se calcula proceduralmente mediante modelado físico modal y FM inarmónica.",
            details: [
                "Motor Modal Physical-FM: síntesis sub-10MB sin latencia de muestras",
                "Modelado de resonadores acústicos tubulares con acoplamiento de aire",
                "Dinámica de golpe táctil y respuesta tímbrica continua a velocidad MIDI",
                "Formatos: VST3, AU, Standalone (macOS Apple Silicon & Intel / Windows)",
                "Repositorio: https://github.com/laurorobles/ExtasisMarimba"
            ],
            streamType: null,
            streamPayload: null,
            links: {
                github: "https://github.com/laurorobles/ExtasisMarimba",
                bc: "https://extasisrecords.bandcamp.com"
            }
        },
        "plugin-extasis-logdrum": {
            id: "plugin-extasis-logdrum",
            title: "Extasis Log Drum",
            subtitle: "Modal Amapiano & Global Club Bass Synthesizer",
            type: "DSP AUDIO PLUGIN",
            year: "2026",
            cover: "/images/plugins/logdrum.png",
            desc: "Instrumento virtual dedicado al modelado modal y percusivo de bajos Log Drum característicos del Amapiano sudafricano y la música de club periférica. Ofrece controles precisos de saturación asimétrica armónica, modelado de transitorio inicial y caída resonante de frecuencia sub-grave.",
            details: [
                "Síntesis modal digital de membrana y cavidad de madera",
                "Saturación de armónicos pares e impares optimizada para sistemas de club",
                "Respuesta dinámica a velocity con modulación de pitch en envolvente",
                "Repositorio: https://github.com/laurorobles/ExtasisLogDrum"
            ],
            streamType: null,
            streamPayload: null,
            links: {
                github: "https://github.com/laurorobles/ExtasisLogDrum",
                bc: "https://extasisrecords.bandcamp.com"
            }
        },
        "plugin-extasis-vision": {
            id: "plugin-extasis-vision",
            title: "Extasis Vision",
            subtitle: "Real-Time Spectral Analyzer, Sonogram & Goniometer",
            type: "DSP AUDIO PLUGIN",
            year: "2026",
            cover: "/images/plugins/donker.png",
            desc: "Herramienta de análisis visual de audio de ultra-alta resolución desarrollada en JUCE C++. Proporciona visualización en tiempo real mediante FFT de 4096 puntos con zoom en sub-frecuencias (20Hz-120Hz), sonograma tridimensional en cascada y correlacionador de fase estéreo con estética CRT.",
            details: [
                "FFT de alta resolución con ponderación psicoacústica",
                "Goniómetro vectorial estéreo (Lissajous) y medidor de correlación de fase",
                "Diseñado para calibración de pistas de clubbing y control de fase en bajos",
                "Repositorio: https://github.com/laurorobles"
            ],
            streamType: null,
            streamPayload: null,
            links: {
                github: "https://github.com/laurorobles",
                bc: "https://extasisrecords.bandcamp.com"
            }
        },

        /* =========================================================
           SOUNDCLOUD SINGLES, EDITS & PIRATAS ARCHIVE
           ========================================================= */
        "sc-hasta-que-te-conoci": {
            id: "sc-hasta-que-te-conoci",
            title: "Hasta Que Te Conocí 2026 (Lao Edit)",
            subtitle: "SoundCloud Pirata Archive — Juan Gabriel Club Mutation",
            type: "SOUNDCLOUD SINGLE / BOOTLEG",
            year: "2026",
            cover: "/images/covers/hasta_que_te_conoci.jpg",
            desc: "Deconstrucción radical del clásico de Juan Gabriel para sistemas de sonido de clubbing. Sub-bass resonante, polirritmia sincopada y micro-edits vocales cargados de emoción eufórica y desgarre.",
            details: [
                "Plataforma: SoundCloud Oficial (@lao)",
                "BPM: 133 BPM Club Deconstruction",
                "Formato: Single / Free DL Stream",
                "Uso clave en sets de cierre y giras internacionales"
            ],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao/hasta-que-te-conoci-lao-bootleg",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "sc-escuadron-ritmo": {
            id: "sc-escuadron-ritmo",
            title: "Escuadrón del Ritmo",
            subtitle: "Lao Club Tool — Raw Latin Club Drum Matrix",
            type: "SOUNDCLOUD TRACK / CLUB TOOL",
            year: "2025",
            cover: "/images/covers/escuadron.jpg",
            desc: "Herramienta rítmica de club de alta energía. Patrones polirrítmicos acelerados cruzando tambores tribales, kicks percusivos y modulación de bajos analógicos.",
            details: ["Plataforma: SoundCloud", "Velocidad: 134 BPM", "Mezcla & Producción: Lauro Robles"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao/escuadron-del-ritmo-lao-club-tool",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "sc-tejido-tropico": {
            id: "sc-tejido-tropico",
            title: "Tejido Trópico (Lao Edit)",
            subtitle: "Deconstructed Tribal & Coastal Clubbing",
            type: "SOUNDCLOUD SINGLE",
            year: "2025",
            cover: "/images/covers/tejido_tropico.png",
            desc: "Exploración de tambores sincopados y ambientes selváticos con procesamiento no-lineal. Conexión entre la tradición costera y el sound-system experimental.",
            details: ["Plataforma: SoundCloud", "BPM: 130 BPM", "Percusión prehispánica procesada"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao/tejido-tropico-lao-edit",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "sc-wave-mambo": {
            id: "sc-wave-mambo",
            title: "Wave Mambo (Club Fix)",
            subtitle: "Mambo 130 BPM Meets Modular Synthesis",
            type: "SOUNDCLOUD CLUB FIX",
            year: "2024",
            cover: "/images/covers/mambo_v1.jpg",
            desc: "Reinvención del mambo clásico acelerado con líneas ácidas de bajo, percusiones secas y cajas de ritmo procesadas en hardware SP-1200.",
            details: ["Plataforma: SoundCloud Oficial", "Estudio: Chapultepec, CDMX"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao/wave-mambo-lao-fix",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "sc-ventura": {
            id: "sc-ventura",
            title: "Ventura (Lao Dub)",
            subtitle: "Sub-bass Heavy Tape Delay Dub",
            type: "SOUNDCLOUD SINGLE",
            year: "2024",
            cover: "/images/covers/ventura.jpg",
            desc: "Versión dub de atmósfera crepuscular y graves profundos. Procesamiento a través de Space Echo analógico y cajas de resortes.",
            details: ["Plataforma: SoundCloud", "BPM: 128 BPM", "Hardware: Roland RE-201 Space Echo"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao/ventura-lao-dub",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "sc-yeyojungle": {
            id: "sc-yeyojungle",
            title: "Yeyojungle 2026 (Lao Bootleg)",
            subtitle: "Ragga Jungle & 160 BPM Amen Destruction",
            type: "SOUNDCLOUD BOOTLEG",
            year: "2026",
            cover: "/images/covers/yeyojungle.png",
            desc: "Bootleg incendiario que acelera cortes de reggaetón clásico hasta 160 BPM sobre capas cortadas del legendario Amen Break y sub-bajos 808 masivos.",
            details: ["BPM: 160 BPM", "Amen break slicing & Reese bass", "Plataforma: SoundCloud (@lao)"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao/yeyojungle-2026-bootleg",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "sc-bipp-lao": {
            id: "sc-bipp-lao",
            title: "SOPHIE - BIPP (Lao Pirata Edit)",
            subtitle: "Tribute Deconstructed Club Bootleg",
            type: "SOUNDCLOUD BOOTLEG / PIRATA",
            year: "2021",
            cover: "/images/covers/sophie_bipp.png",
            desc: "Homenaje personal a la visionaria productora SOPHIE. Una deconstrucción de BIPP armada con síncopas de guaracha tribal, micro-samples metálicos y graves viscerales.",
            details: ["Homenaje oficial en sets internacionales", "Plataforma: SoundCloud Pirata"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao/sophie-bipp-lao-pirata-edit",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "sc-haddaway": {
            id: "sc-haddaway",
            title: "Haddaway - What Is Love (Lao Club Fix)",
            subtitle: "90s Eurodance Deconstructed Club Weapon",
            type: "SOUNDCLOUD BOOTLEG",
            year: "2022",
            cover: "/images/covers/haddaway.png",
            desc: "Reinvención corrosiva del himno eurodance de Haddaway, destrozado en fragmentos de kick distorsionado, transitorios secos y bass drops implacables.",
            details: ["Plataforma: SoundCloud", "BPM: 135 BPM"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao/haddaway-what-is-love-lao-edit",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "sc-belinda": {
            id: "sc-belinda",
            title: "Belinda - Jackpot (Lao Remix)",
            subtitle: "Seminal Latin Bass Bootleg Anthem",
            type: "SOUNDCLOUD REMIX",
            year: "2013",
            cover: "/images/covers/belinda_jackpot.png",
            desc: "Remix seminal que cimentó las bases del sonido NAAFI en sus primeros años. Sampleo pop mutado en un arma letal de clubbing latino y baile acelerado.",
            details: ["Sello: NAAFI Pirata", "Un clásico histórico del clubbing mexicano"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao/belinda-jackpot-lao-remix",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "sc-culebritica": {
            id: "sc-culebritica",
            title: "Culebritica (Lao Club Tool)",
            subtitle: "Latin Club x Industrial Bass Clubbing",
            type: "SOUNDCLOUD CLUB TOOL",
            year: "2020",
            cover: "/images/covers/culebritica.png",
            desc: "Cruce implacable entre patrones rítmicos sincopados de güiro y sintetizadores de sierra industrial, calibrado para hacer vibrar sistemas de sonido de festival.",
            details: ["Plataforma: SoundCloud", "BPM: 132 BPM"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao/culebritica-lao-tool",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "sc-clandestino": {
            id: "sc-clandestino",
            title: "Clandestino Jungle Fix (Lao Bootleg)",
            subtitle: "Manu Chao Meets Breakbeat & Jungle",
            type: "SOUNDCLOUD BOOTLEG",
            year: "2023",
            cover: "/images/covers/clandestino.png",
            desc: "Versión clandestina acelerada a ritmo de jungle con amen breaks saturados, vocales picadas en stutter y líneas de 808 afinadas.",
            details: ["Plataforma: SoundCloud", "BPM: 162 BPM"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao/clandestino-jungle-fix",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "sc-vordhosbn": {
            id: "sc-vordhosbn",
            title: "Aphex Twin - Vordhosbn (Lao Wepa Fix)",
            subtitle: "IDM Meets Sonidero & Tribal Guarachero",
            type: "SOUNDCLOUD BOOTLEG",
            year: "2018",
            cover: "/images/covers/vordhosbn.jpg",
            desc: "La colisión más improbable y celebrada: la micro-edición de breakbeat de Richard D. James re-orquestada con las síncopas de güiro y campana del sonidero mexicano.",
            details: ["Plataforma: SoundCloud", "Presentado en RBMA y Boiler Room"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao/vordhosbn-aphex-twin-lao-fix",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "sc-flute-gasp": {
            id: "sc-flute-gasp",
            title: "NA - Flute Gasp (Lao Edit)",
            subtitle: "Nguzunguzu Grime Club Deconstruction",
            type: "SOUNDCLOUD EDIT",
            year: "2019",
            cover: "/images/covers/sendero.jpg",
            desc: "Edición de culto para el tema de NA (Nguzunguzu / Fade to Mind), agregando presión en sub-frecuencias y cadencias de baile territorial.",
            details: ["Plataforma: SoundCloud", "BPM: 130 BPM"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao/flute-gasp-lao-edit",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "sc-pirata-vol1": {
            id: "sc-pirata-vol1",
            title: "NAAFI Pirata Highlights (Lao Exclusives)",
            subtitle: "White Label Club Anthems & Edits Series",
            type: "COMPILACIÓN PIRATA",
            year: "2015-2022",
            cover: "/images/covers/catedral.jpg",
            desc: "Selección de los tracks y edits más emblemáticos producidos por Lao para la legendaria serie NAAFI Pirata, prensada originalmente en vinilos y casetes limitados.",
            details: ["Serie de culto: NAAFI Pirata", "Sello: NAAFI White Label"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao/naafi-pirata-highlights",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "sc-fiebre-latina": {
            id: "sc-fiebre-latina",
            title: "Fiebre Latina (Lao Edit)",
            subtitle: "Demonic Perreo & Industrial Dembow",
            type: "SOUNDCLOUD SINGLE",
            year: "2021",
            cover: "/images/covers/fake_doi.jpg",
            desc: "Dembow oscuro e industrial con percusiones distorsionadas y atmósfera claustrofóbica creada para pistas de warehouse.",
            details: ["Plataforma: SoundCloud", "BPM: 110 BPM"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao/fiebre-latina-lao-edit",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "sc-trono-hierro": {
            id: "sc-trono-hierro",
            title: "Trono de Hierro (Lao Club Tool)",
            subtitle: "Heavyweight Percussion Weapon",
            type: "SOUNDCLOUD TRACK",
            year: "2023",
            cover: "/images/covers/amen_ep.jpg",
            desc: "Herramienta de percusión visceral con metales procesados, resonadores de placas y sub-bajos continuos.",
            details: ["Plataforma: SoundCloud", "BPM: 133 BPM"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao/trono-de-hierro-lao-tool",
            links: { sc: "https://soundcloud.com/lao" }
        },

        /* =========================================================
           GUMROAD PEDAGOGICAL PRODUCTS & TEMPLATES
           ========================================================= */
        "gumroad-clubcode-vol1": {
            id: "gumroad-clubcode-vol1",
            title: "CLUBCODE Vol. 1 — Latin Club Loops",
            subtitle: "Pedagogía & Sample Pack — Lauro Robles",
            type: "SAMPLE PACK / LOOPS",
            year: "2023",
            cover: "/images/covers/chapultepec.jpg",
            desc: "Librería fundacional de loops rítmicos grabados y producidos por Lao en su estudio de Chapultepec. Incluye tribal deconstruido, dembow mutante, raptor house y percusiones territoriales a 130-135 BPM, procesadas con compresión analógica y ecualización de válvulas para máxima pegada.",
            details: [
                "Formato: WAV 24-Bit / 44.1kHz sin pérdidas",
                "Contenido: Más de 80 loops divididos por stems (kicks, snares, hats, percusión)",
                "Compatibilidad: Cualquier DAW (Ableton Live, FL Studio, Logic, Reaper)",
                "Licencia 100% Royalty Free para producciones comerciales",
                "Precio: $15 USD en Gumroad"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%23ff00ff&auto_play=false&hide_related=true",
            links: { gumroad: "https://laurorobles.gumroad.com" }
        },
        "gumroad-clubcode-vol2": {
            id: "gumroad-clubcode-vol2",
            title: "CLUBCODE Vol. 2 — Deconstructed Patterns",
            subtitle: "Polyrhythmic Loops & Ceremonial Drums",
            type: "SAMPLE PACK / POLIRRITMIA",
            year: "2024",
            cover: "/images/covers/sendero.jpg",
            desc: "Segunda entrega avanzada enfocada en polirritmias asimétricas, síncopas ceremoniales y patrones de percusión grabados con instrumentos acústicos y procesados con crunch SP-1200 y moduladores de anillo.",
            details: [
                "Formato: WAV 24-Bit / 48kHz",
                "Contenido: 95 loops polirrítmicos y capas percusivas microtonales",
                "BPM Range: 128 - 142 BPM",
                "Precio: $18 USD en Gumroad"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%2300ffff&auto_play=false&hide_related=true",
            links: { gumroad: "https://laurorobles.gumroad.com" }
        },
        "gumroad-jungle-amen": {
            id: "gumroad-jungle-amen",
            title: "Classic Jungle Basic Amen Starter",
            subtitle: "Ableton Live 11 / 12 Suite Template Project",
            type: "ABLETON TEMPLATE",
            year: "2024",
            cover: "/images/covers/protective_core.jpg",
            desc: "Plantilla maestra de producción de Jungle a 160 BPM en Ableton Live. Configurada con cadenas de slicing de audio no-destructivo para el Amen Break, ruteo multicanal para sub-bajos 808 afinados, envíos de delay de cinta y compresión paralela NY lista para lanzar pistas de alta fidelidad.",
            details: [
                "Compatibilidad: Ableton Live 11.1+ y Live 12 Suite",
                "Plug-ins nativos de Ableton únicamente (no requiere plugins de terceros)",
                "Incluye cadenas de efectos configuradas con Macro Controls",
                "Precio: $20 USD en Gumroad"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%23ff00ff&auto_play=false&hide_related=true",
            links: { gumroad: "https://laurorobles.gumroad.com" }
        },
        "gumroad-selva-kit": {
            id: "gumroad-selva-kit",
            title: "Selva Club Kit Vol. 1 — One-Shots",
            subtitle: "Organic Percussion & Industrial Transients",
            type: "SAMPLE PACK / ONE-SHOTS",
            year: "2023",
            cover: "/images/covers/guacamaya.jpg",
            desc: "Colección curada de más de 120 samples one-shot grabados en campo: maderas percutidas, metales cortantes, kicks pesados y shakers tradicionales del sureste mexicano procesados para corte en mezclas saturadas.",
            details: [
                "120+ One-shot samples (Kicks, Snares, Claps, Percs, Texturas)",
                "WAV 24-Bit / 44.1kHz",
                "Precio: $12 USD en Gumroad"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%2300ffff&auto_play=false&hide_related=true",
            links: { gumroad: "https://laurorobles.gumroad.com" }
        },
        "gumroad-capital-wobble": {
            id: "gumroad-capital-wobble",
            title: "Capital Wobble Bass — Serum Soundset",
            subtitle: "30 Presets + Custom Wavetables for Xfer Serum",
            type: "SYNTH PRESET PACK",
            year: "2024",
            cover: "/images/covers/coastal_acid.jpg",
            desc: "30 presets para Xfer Serum diseñados específicamente para sonar en sistemas de sonido de clubbing. Bajos FM agresivos, modulaciones LFO complejas, sub-graves de onda senoidal reforzada y parches de distorsión controlada.",
            details: [
                "30 parches de bajo y leads para Xfer Serum (v1.368+)",
                "Wavetables propietarias extraídas de sintetizadores modulares analógicos",
                "Macros asignadas para automatización en directo",
                "Precio: $15 USD en Gumroad"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%23ff00ff&auto_play=false&hide_related=true",
            links: { gumroad: "https://laurorobles.gumroad.com" }
        },
        "gumroad-spectral-resonator": {
            id: "gumroad-spectral-resonator",
            title: "Spectral Resonator + Drums Template",
            subtitle: "Generative Microtonal Drum Machine Rack",
            type: "ABLETON LIVE RACK",
            year: "2024",
            cover: "/images/covers/lo_que_queda.jpg",
            desc: "Dispositivo de producción en Ableton Live que convierte cualquier patrón percusivo seco en acordes resonantes afinados en escalas mesoamericanas, pentatónicas y microtonales mediante resonadores espectrales en serie.",
            details: [
                "Ableton Live 11/12 Suite con Max for Live",
                "Ideal para ambient techno, música ritual y diseño sonoro",
                "Precio: $15 USD en Gumroad"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%2300ffff&auto_play=false&hide_related=true",
            links: { gumroad: "https://laurorobles.gumroad.com" }
        },
        "gumroad-guaracha-bass": {
            id: "gumroad-guaracha-bass",
            title: "Guaracha Bass v1 — Macro Instrument",
            subtitle: "Authentic FM Donk Bass Rack for Live",
            type: "ABLETON INSTRUMENT RACK",
            year: "2023",
            cover: "/images/covers/clasicos_vol1.jpg",
            desc: "El sonido emblemático del bajo de guaracha y tribal mexicano, emulado mediante una cadena optimizada de sintetizador FM nativo (Operator) con macros para transient click, sub-rumble y decay armónico instantáneo.",
            details: [
                "Formato: .adg Ableton Device Group",
                "Compatible con Live Suite 10, 11 y 12",
                "Precio: $10 USD en Gumroad"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%23ff00ff&auto_play=false&hide_related=true",
            links: { gumroad: "https://laurorobles.gumroad.com" }
        },

        /* =========================================================
           PEDAGOGY WORKSHOPS & TUTORIALS
           ========================================================= */
        "tut-duro-masterclass": {
            id: "tut-duro-masterclass",
            title: "DURO Studio Masterclass: Deconstrucción Rítmica & Síntesis",
            subtitle: "Sesión Técnica en Chapultepec (Agosto 2026 // Reciente)",
            type: "MASTERCLASS EN VIDEO",
            year: "2026",
            cover: "/images/lao_portrait.jpg",
            desc: "Masterclass de producción musical y diseño sonoro grabada en el estudio de Chapultepec. Desglose del flujo de señal analógico y digital, modulación FM y escultura de frecuencias graves.",
            details: [
                "Medio: DURO Label / YouTube Oficial",
                "Duración: 24 minutos",
                "Temario: Síntesis analógica, percusión prehispánica y flujo de señal en Ableton",
                "Fecha: Agosto 2026 (Publicación reciente)"
            ],
            streamType: "youtube",
            streamPayload: "g2qJ3r_4nJ4",
            links: {
                youtube: "https://www.youtube.com/watch?v=g2qJ3r_4nJ4"
            }
        },
        "tut-sound-design": {
            id: "tut-sound-design",
            title: "Diseño Sonoro & Escultura de Sub-Bajos en Ableton Live",
            subtitle: "Workshop Técnico de Low-End y Saturación",
            type: "TUTORIAL TÉCNICO",
            year: "2025",
            cover: "/images/covers/coastal_acid.jpg",
            desc: "Técnicas avanzadas para esculpir bajas frecuencias con pegada y definición para soundsystems. Manejo de compresión paralela, distorsión armónica sutil y monocompatibilidad.",
            details: [
                "Plataforma: Ableton Live 11 / 12 Suite",
                "Herramientas: Operator, Saturator, Utility, Glue Compressor",
                "Enfoque: Clubbing de alta potencia y control de sub-graves"
            ],
            streamType: "youtube",
            streamPayload: "5T8_ZpS2rUk",
            links: {
                youtube: "https://www.youtube.com/@laurorobles"
            }
        },
        "tut-modular-routing": {
            id: "tut-modular-routing",
            title: "Ruteo Modular de Señal, Sidechain & FX Racks",
            subtitle: "Live Performance & Routing Experimental",
            type: "WORKSHOP TÉCNICO",
            year: "2024",
            cover: "/images/covers/lo_que_queda.jpg",
            desc: "Cómo interconectar cadenas complejas de procesamiento de audio no-lineal en tiempo real para improvisación y live sets en directo.",
            details: [
                "Tecnología: Max for Live, Audio Effect Racks, Macros",
                "Integración: Hardware externo y ruteo analógico-digital",
                "Canal: YouTube Oficial (@laurorobles)"
            ],
            streamType: "youtube",
            streamPayload: "K81412qHl-A",
            links: {
                youtube: "https://www.youtube.com/@laurorobles"
            }
        },
        "tut-latin-rhythms": {
            id: "tut-latin-rhythms",
            title: "Deconstrucción Rítmica: Dembow, Tribal & Polirritmias",
            subtitle: "Teoría del Ritmo y Groove Territorial",
            type: "MASTERCLASS TEÓRICO-PRÁCTICA",
            year: "2024",
            cover: "/images/covers/clasicos_vol1.jpg",
            desc: "Exploración de polirritmias asimétricas, micro-desplazamientos de rejilla y percusión prehispánica fusionada con estructuras modernas de club.",
            details: [
                "Conceptos: Swing territorial, síncopas ceremoniales, micro-timing",
                "Estilos: Dembow mutante, tribal, raptor house y bass latino"
            ],
            streamType: "youtube",
            streamPayload: "5b3oR_hJ1x4",
            links: {
                youtube: "https://www.youtube.com/@laurorobles"
            }
        },

        /* =========================================================
           PRESS ARCHIVE & INTERVIEWS
           ========================================================= */
        "press-duro-2022": {
            id: "press-duro-2022",
            title: "DURO Label: En el Estudio con Lauro Robles",
            subtitle: "Studio Video Interview & Masterclass (Agosto 2026 // Reciente)",
            type: "VIDEO ENTREVISTA OFICIAL",
            year: "2026",
            cover: "/images/lao_portrait.jpg",
            desc: "Entrevista en video grabada en el estudio de Chapultepec en Ciudad de México para DURO Label. Lauro Robles desglosa su proceso creativo, la síntesis modular, la deconstrucción de ritmos latinos y la importancia de la experimentación constante en el club underground.",
            details: [
                "Fecha: Agosto 2026 (Publicación reciente / Hace unas semanas)",
                "Medio: DURO Label (Vimeo / YouTube Oficial)",
                "Duración: 24 minutos",
                "Ubicación: Estudio Chapultepec, CDMX",
                "Temas: Síntesis analógica, percusión prehispánica y evolución de NAAFI"
            ],
            streamType: "youtube",
            streamPayload: "g2qJ3r_4nJ4",
            links: {
                youtube: "https://www.youtube.com/watch?v=g2qJ3r_4nJ4",
                web: "https://durolabel.com"
            }
        },
        "press-crack-mag": {
            id: "press-crack-mag",
            title: "Crack Magazine: Subverting the Mexican Underground",
            subtitle: "Long Read Profile & Career Retrospective",
            type: "ENTREVISTA / LONG READ",
            year: "2020",
            cover: "/images/lao_portrait.jpg",
            desc: "Extenso perfil periodístico de Crack Magazine sobre cómo Lauro Robles y el colectivo NAAFI subvirtieron el underground electrónico global, cuestionando la hegemonía europea con un sonido autóctono, implacable y futurista.",
            details: [
                "Publicación: Crack Magazine (Reino Unido)",
                "Autor: Gabriel Szatan",
                "Enfoque: Política de pista, soberanía sónica y la gira asiática de Lao"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%23ff00ff&auto_play=false&hide_related=true",
            links: { web: "https://crackmagazine.net" }
        },
        "press-xlr8r-626": {
            id: "press-xlr8r-626",
            title: "XLR8R Podcast 626: Sonic Cartography & Studio Methodology",
            subtitle: "Exclusive Mix & In-Depth Interview",
            type: "PODCAST & ENTREVISTA",
            year: "2020",
            cover: "/images/covers/chapultepec.jpg",
            desc: "Entrevista técnica exclusiva y podcast de 75 minutos para la emblemática plataforma californiana XLR8R, explorando el hardware de estudio, su labor con NAAFI y Extasis Records, y la cartografía sonora del club latino.",
            details: [
                "Publicación: XLR8R (Edición 626)",
                "Formato: Podcast 320kbps + Entrevista escrita",
                "Incluye tracks inéditos y bootlegs exclusivos"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%2300ffff&auto_play=false&hide_related=true",
            links: { web: "https://xlr8r.com/podcasts/podcast-626-lao/" }
        },
        "press-vice-thump": {
            id: "press-vice-thump",
            title: "THUMP / Vice: La futurología de Lao",
            subtitle: "Reportaje Seminal sobre Clubbing Periférico",
            type: "REPORTAJE / CRÓNICA",
            year: "2016",
            cover: "/images/covers/perfil.jpg",
            desc: "Crónica sobre el impacto fundacional de Lao en la música de baile independiente. Análisis del tribal guarachero de Monterrey y San Luis Potosí articulado como música electrónica de vanguardia.",
            details: [
                "Publicación: Vice Media / THUMP en Español",
                "Ubicación: Ciudad de México",
                "Impacto: Declarado documento clave para comprender el nuevo clubbing latino"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%23ff00ff&auto_play=false&hide_related=true",
            links: { web: "https://vice.com" }
        },
        "press-resident-advisor": {
            id: "press-resident-advisor",
            title: "Resident Advisor: NAAFI & the Mexican Bass Revolution",
            subtitle: "Label of the Month & Curatorial Feature",
            type: "PRENSA INTERNACIONAL",
            year: "2018",
            cover: "/images/covers/catedral.jpg",
            desc: "Reportaje central en Resident Advisor donde se analiza el impacto del colectivo NAAFI y el rol de Lauro Robles como co-fundador, productor e impulsor del sonido en la CDMX y el mundo.",
            details: [
                "Publicación: Resident Advisor (RA)",
                "Temas: NAAFI como colectivo del mes, clubbing transfronterizo, Sónar y Berghain"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%2300ffff&auto_play=false&hide_related=true",
            links: { web: "https://ra.co" }
        },
        "press-remezcla": {
            id: "press-remezcla",
            title: "Remezcla: 10 Years of NAAFI — How Lao Shaped Latin Bass",
            subtitle: "Decade Anniversary Long Read",
            type: "CRÓNICA CULTURAL",
            year: "2020",
            cover: "/images/covers/fake_doi.jpg",
            desc: "Retrospectiva de una década que analiza cómo la visión artística y la producción incansable de Lao crearon una plataforma global para productores latinoamericanos marginados por los circuitos tradicionales.",
            details: [
                "Publicación: Remezcla (Nueva York)",
                "Enfoque: 10 años de historia, releases y giras mundiales"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%23ff00ff&auto_play=false&hide_related=true",
            links: { web: "https://remezcla.com" }
        },
        "press-el-pais": {
            id: "press-el-pais",
            title: "El País: El sonido mexicano que desafió las pistas globales",
            subtitle: "Reportaje Especial en Sección de Cultura",
            type: "PRENSA INTERNACIONAL",
            year: "2019",
            cover: "/images/lao_portrait.jpg",
            desc: "Artículo periodístico en el diario El País que documenta la internacionalización de la electrónica de vanguardia mexicana, destacando las 2 apariciones históricas de Lao en Sónar Barcelona y festivales en Europa y Asia.",
            details: [
                "Diario: El País",
                "Cobertura: Fenómeno cultural y exportación sónica desde México hacia el mundo"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%2300ffff&auto_play=false&hide_related=true",
            links: { web: "https://elpais.com" }
        },
        "press-indie-rocks": {
            id: "press-indie-rocks",
            title: "Indie Rocks!: Lao y la consagración en Sónar Barcelona",
            subtitle: "Entrevista Exclusiva Post-Sónar 2015",
            type: "ENTREVISTA MUSICAL",
            year: "2015",
            cover: "/images/covers/catedral.jpg",
            desc: "Entrevista en profundidad realizada inmediatamente después del debut solo de Lao en el SónarDome de Barcelona para la Red Bull Music Academy, presentando su aclamado 'Catedral EP'.",
            details: [
                "Publicación: Indie Rocks! Magazine",
                "Año: 2015",
                "Hito: Presentación individual de Catedral EP en SónarDome"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%23ff00ff&auto_play=false&hide_related=true",
            links: { web: "https://indierocks.mx" }
        },
        "press-nts-sonos": {
            id: "press-nts-sonos",
            title: "NTS Radio x Sonos: Explorations in Latin Bass",
            subtitle: "Radio Broadcast & In-Depth Conversation",
            type: "BROADCAST RADIAL",
            year: "2021",
            cover: "/images/covers/sendero.jpg",
            desc: "Especial curatorial transmitido por NTS Radio en asociación con Sonos, conducido por Lao con una selección guiada de mutaciones sonoras entre ritmos afrocaribeños, grime londinense y clubbing mexicano.",
            details: [
                "Emisora: NTS Radio (Londres)",
                "Transmisión: Global NTS Broadcast",
                "Selección curada en directo con comentarios de producción"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%2300ffff&auto_play=false&hide_related=true",
            links: { web: "https://nts.live" }
        },
        "press-complex": {
            id: "press-complex",
            title: "Complex: Lao on NAAFI, Mexico City's Underground & Global Bass",
            subtitle: "Interview by Cedar Pasori",
            type: "ENTREVISTA / LONG READ",
            year: "2016",
            cover: "/images/lao_portrait.jpg",
            desc: "Extensa entrevista periodística conducida por Cedar Pasori para Complex Magazine. Lauro Robles reflexiona sobre la soberanía sónica de México, la red de colaboradores transfronteriza y cómo NAAFI desmanteló el eurocentrismo en la pista de baile.",
            details: [
                "Publicación: Complex Magazine (EE. UU.)",
                "Autor: Cedar Pasori",
                "Temas: NAAFI, clubes clandestinos en CDMX y descolonización del bass music",
                "Enfoque: Lanzamiento de 'Perfil' y giras internacionales"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%23ff00ff&auto_play=false&hide_related=true",
            links: {
                web: "https://www.complex.com/music/a/cedar-pasori/lao-interview"
            }
        },
        "press-paper": {
            id: "press-paper",
            title: "PAPER Magazine: How Lao & NAAFI Redefined Global Club Culture",
            subtitle: "International Feature Profile",
            type: "PRENSA INTERNACIONAL",
            year: "2017",
            cover: "/images/lao_portrait.jpg",
            desc: "Perfil de PAPER Magazine destacando el impacto de Lauro Robles en la transformación radical de la música electrónica contemporánea y la apertura de espacios inclusivos, radicales y viscerales en América Latina.",
            details: [
                "Publicación: PAPER Magazine (Nueva York)",
                "Enfoque: Latin Club, dembow cinético y resistencia de pista",
                "Cita clave: 'Creating a club space where territorial sounds clash without apology.'"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%2300ffff&auto_play=false&hide_related=true",
            links: {
                web: "https://www.papermag.com/lao-naafi-interview"
            }
        },
        "press-avyss-japan": {
            id: "press-avyss-japan",
            title: "AVYSS Magazine (Tokio): Lao & Nick Hook Japan Tour",
            subtitle: "Circus Tokyo Feature & Transpacific Connection",
            type: "COBERTURA DE GIRA // JAPÓN",
            year: "2019",
            cover: "/images/covers/chapultepec.jpg",
            desc: "Feature de la prestigiosa revista de vanguardia AVYSS de Tokio con motivo del tour de Lauro Robles y Nick Hook por Japón, coronado por su incendiaria noche en Circus Tokyo (Shibuya).",
            details: [
                "Publicación: AVYSS Magazine (Tokio, Japón)",
                "Fecha: Junio 2019",
                "Artistas: LAO (NAAFI) & Nick Hook (Ninja Tune)",
                "Lugar destacado: Circus Tokyo (Shibuya)"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%23ff00ff&auto_play=false&hide_related=true",
            links: {
                web: "https://avyss-magazine.com/2019/06/03/7633/"
            }
        },
        "press-dis-mag": {
            id: "press-dis-mag",
            title: "DIS Magazine: 'NAAFI Gave Tribal the Compilation It Deserved'",
            subtitle: "Cultural & Theoretical Essay",
            type: "ENSAYO TEÓRICO / ARTE",
            year: "2015",
            cover: "/images/covers/catedral.jpg",
            desc: "Ensayo fundamental de DIS Magazine que analiza la recopilación de Tribal Guarachero coordinada por NAAFI y producida por Lauro Robles, articulando cómo el ritmo del noreste mexicano rompió con las jerarquías de la academia musical.",
            details: [
                "Publicación: DIS Magazine",
                "Temas: Tribal Guarachero, aceleración rítmica y teoría de clubbing periférico",
                "Impacto: Texto canónico sobre la apropiación y evolución del ritmo en México"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%2300ffff&auto_play=false&hide_related=true",
            links: {
                web: "https://dismagazine.com/discussion/80194/naafi-gave-tribal-the-compilation-it-deserved/"
            }
        },
        "press-beatburguer": {
            id: "press-beatburguer",
            title: "Beatburguer: TRILL Squad acerca la esencia de NAAFI en 8 tracks",
            subtitle: "Curatorial Track Breakdown",
            type: "ANÁLISIS MUSICAL",
            year: "2016",
            cover: "/images/covers/perfil.jpg",
            desc: "Análisis curatorial en Beatburguer donde el colectivo barcelonés TRILL Squad selecciona los 8 himnos determinantes de NAAFI, poniendo en primer plano la producción de Lao y su capacidad para reestructurar el clubbing hispano.",
            details: [
                "Publicación: Beatburguer (España)",
                "Tracks analizados: Catedral, Perfil, producciones de clubbing híbrido",
                "Conexión: Noches de TRILL en Sala Razzmatazz (Barcelona)"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%23ff00ff&auto_play=false&hide_related=true",
            links: {
                web: "https://beatburguer.com/trill-squad-nos-acerca-la-esencia-de-n-a-a-f-i-a-partir-de-8-tracks-basicos/"
            }
        },
        "press-the-lot-radio": {
            id: "press-the-lot-radio",
            title: "The Lot Radio NYC: Rendezvous with Lao Naafi (2023)",
            subtitle: "Live Broadcast Session (Brooklyn, NYC)",
            type: "VIDEO SESIÓN EN DIRECTO",
            year: "2023",
            cover: "https://img.youtube.com/vi/Qe2Bcp0-OZc/hqdefault.jpg",
            desc: "Transmisión en directo de 60 minutos desde el emblemático quiosco de The Lot Radio en Greenpoint, Brooklyn (NYC). Selección de alta energía navegando dembow deconstruido, raptor house, dubplate specials y producciones exclusivas.",
            details: [
                "Emisora: The Lot Radio (Brooklyn, Nueva York)",
                "Fecha: 9 de Junio de 2023",
                "Duración: 59:44",
                "Video ID: Qe2Bcp0-OZc"
            ],
            streamType: "youtube",
            streamPayload: "Qe2Bcp0-OZc",
            links: {
                youtube: "https://www.youtube.com/watch?v=Qe2Bcp0-OZc",
                web: "https://thelotradio.com"
            }
        },
        "press-berghain-saule": {
            id: "press-berghain-saule",
            title: "Berghain: Säule VIII — Lao, Mexican Jihad, Dinamarca",
            subtitle: "Historical Event Archive (Berlín, 2017)",
            type: "ARCHIVO DE EVENTO OFICIAL",
            year: "2017",
            cover: "/images/covers/catedral.jpg",
            desc: "Ficha y registro histórico de la presentación de Lauro Robles en Säule, el espacio experimental en la planta baja de Berghain en Berlín, compartiendo cartel con Mexican Jihad, Dinamarca y mobilegirl.",
            details: [
                "Lugar: Säule / Berghain (Berlín, Alemania)",
                "Fecha: 13 de Julio de 2017",
                "Curaduría: Säule VIII Showcase",
                "Sonido: Funktion-One Custom Säule System"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%2300ffff&auto_play=false&hide_related=true",
            links: {
                web: "https://www.berghain.berlin/de/event/2127/"
            }
        },
        "video-the-lot-radio": {
            id: "video-the-lot-radio",
            title: "The Lot Radio NYC: Rendezvous with Lao Naafi",
            subtitle: "Live DJ Set from Greenpoint, Brooklyn (2023)",
            type: "VIDEO EN DIRECTO",
            year: "2023",
            cover: "https://img.youtube.com/vi/Qe2Bcp0-OZc/hqdefault.jpg",
            desc: "Sesión en video para The Lot Radio en Brooklyn, Nueva York. Lauro Robles desata un arsenal de polirritmias latinas, percusiones industriales y bajos arrolladores.",
            details: [
                "Plataforma: The Lot Radio (YouTube)",
                "Fecha: Junio 2023",
                "Ubicación: Brooklyn, NY",
                "Resolución: 1080p HD Audio Master"
            ],
            streamType: "youtube",
            streamPayload: "Qe2Bcp0-OZc",
            links: {
                youtube: "https://www.youtube.com/watch?v=Qe2Bcp0-OZc"
            }
        }
    };

    const MUSIC_CARDS_MAP = [
        "chapultepec", "coastal_acid", "lo_que_queda", "sendero",
        "guacamaya", "protective_core", "clasicos_vol1", "fake_doi",
        "singularity", "perfil", "catedral", "amen_ep"
    ];

    /* =========================================================
       OMNI-PLAYER ENGINE & ITEM INSPECTOR
       ========================================================= */
    const playerIframe = document.getElementById('omni-player-iframe');
    const playerTrackLabel = document.getElementById('player-track-label');
    const playerFormatTag = document.getElementById('player-format-tag');
    const playerSourceBadge = document.getElementById('player-source-badge');
    const playerCueCounter = document.getElementById('player-cue-counter');
    const btnStreamLinkBc = document.getElementById('btn-stream-link-bc');
    const btnStreamLinkSc = document.getElementById('btn-stream-link-sc');
    const btnMinimizePlayer = document.getElementById('btn-minimize-player');
    const playerContent = document.getElementById('player-content');
    const btnPlayerShuffle = document.getElementById('btn-player-shuffle');
    const btnInspectNowPlaying = document.getElementById('btn-inspect-now-playing');
    const btnPlayerPrev = document.getElementById('btn-player-prev');
    const btnPlayerPlayPause = document.getElementById('btn-player-playpause');
    const btnPlayerNext = document.getElementById('btn-player-next');
    const btnToggleQueue = document.getElementById('btn-toggle-queue');
    const btnRefreshQueue = document.getElementById('btn-refresh-queue');
    const playerQueueWrapper = document.getElementById('player-queue-wrapper');
    const playerQueueList = document.getElementById('player-queue-list');
    const omniHtml5Audio = document.getElementById('omni-html5-audio');

    // Inspector modal elements
    const inspectorModal = document.getElementById('item-inspector-modal');
    const btnCloseInspector = document.getElementById('btn-close-inspector');
    const inspImage = document.getElementById('insp-image');
    const inspTitle = document.getElementById('insp-title');
    const inspSubtitle = document.getElementById('insp-subtitle');
    const inspTypeBadge = document.getElementById('insp-type-badge');
    const inspYear = document.getElementById('insp-year');
    const inspDesc = document.getElementById('insp-description');
    const inspTracklist = document.getElementById('insp-tracklist');
    const inspBtnPlay = document.getElementById('insp-btn-play');
    const inspExtLinks = document.getElementById('insp-ext-links');

    let currentPlayingItemId = 'chapultepec';
    let isAudioPlaying = false;
    let PLAYBACK_QUEUE = [];
    let currentQueueIndex = 0;

    // Initialize randomized queue (strictly music releases, singles & sets)
    function initPlaybackQueue() {
        const musicKeys = Object.keys(CATALOG_DATABASE).filter(key => {
            const it = CATALOG_DATABASE[key];
            if (!it) return false;
            // Exclude plugins, Gumroad packs, and Press articles from music queue
            if (key.startsWith('plugin-') || key.startsWith('gumroad-') || key.startsWith('press-')) return false;
            return it.streamType === 'bandcamp' || it.streamType === 'soundcloud' || it.streamType === 'youtube';
        });
        // Shuffle randomly
        PLAYBACK_QUEUE = [...musicKeys].sort(() => Math.random() - 0.5);
        currentQueueIndex = 0;
        currentPlayingItemId = PLAYBACK_QUEUE[0] || 'chapultepec';
        renderQueue();
    }

    function renderQueue() {
        if (!playerQueueList) return;
        playerQueueList.innerHTML = '';
        PLAYBACK_QUEUE.forEach((key, idx) => {
            const item = CATALOG_DATABASE[key];
            if (!item) return;

            const div = document.createElement('div');
            const isActive = item.id === currentPlayingItemId;
            div.className = `queue-item ${isActive ? 'active' : ''}`;
            div.dataset.itemId = item.id;

            let sourceAbbr = 'BC';
            if (item.streamType === 'soundcloud') sourceAbbr = 'SC';
            else if (item.streamType === 'youtube') sourceAbbr = 'YT';
            else if (item.streamType === 'direct_audio') sourceAbbr = 'DSP';

            div.innerHTML = `
                <div class="flex items-center overflow-hidden pr-1">
                    <span class="opacity-50 mr-1 font-mono text-[7px]">${(idx + 1).toString().padStart(2, '0')}.</span>
                    <span class="queue-badge">${sourceAbbr}</span>
                    <span class="truncate">${item.title}</span>
                </div>
                <span class="opacity-60 text-[7px] whitespace-nowrap ml-1">${item.year || ''}</span>
            `;

            div.onclick = (e) => {
                e.stopPropagation();
                currentQueueIndex = idx;
                playCatalogItem(item.id, false);
            };

            playerQueueList.appendChild(div);
        });

        if (playerCueCounter) {
            playerCueCounter.innerText = `${(currentQueueIndex + 1).toString().padStart(2, '0')} / ${PLAYBACK_QUEUE.length.toString().padStart(2, '0')}`;
        }
    }

    function openItemInspector(itemId) {
        const item = CATALOG_DATABASE[itemId] || CATALOG_DATABASE['chapultepec'];
        if (!inspectorModal) return;

        if (inspImage) inspImage.src = item.cover;
        if (inspTitle) inspTitle.innerText = item.title;
        if (inspSubtitle) inspSubtitle.innerText = item.subtitle;
        if (inspTypeBadge) inspTypeBadge.innerText = item.type;
        if (inspYear) inspYear.innerText = item.year;
        if (inspDesc) inspDesc.innerText = item.desc;

        if (inspTracklist) {
            inspTracklist.innerHTML = '';
            (item.details || []).forEach(d => {
                const li = document.createElement('li');
                li.className = 'border-b border-[var(--circuit)] pb-0.5 opacity-80';
                li.innerText = d;
                inspTracklist.appendChild(li);
            });
        }

        if (inspExtLinks) {
            inspExtLinks.innerHTML = '';
            const links = item.links || {};
            if (links.github) {
                const a = document.createElement('a');
                a.href = links.github; a.target = '_blank';
                a.className = 'text-[var(--main)] hover:underline font-bold border border-[var(--circuit)] px-1.5 py-0.5';
                a.innerText = 'GITHUB REPO ↗';
                inspExtLinks.appendChild(a);
            }
            if (links.bc) {
                const a = document.createElement('a');
                a.href = links.bc; a.target = '_blank';
                a.className = 'text-[var(--accent)] hover:underline font-bold border border-[var(--circuit)] px-1.5 py-0.5';
                a.innerText = 'BANDCAMP ↗';
                inspExtLinks.appendChild(a);
            }
            if (links.sc) {
                const a = document.createElement('a');
                a.href = links.sc; a.target = '_blank';
                a.className = 'text-[var(--main)] hover:underline font-bold border border-[var(--circuit)] px-1.5 py-0.5';
                a.innerText = 'SOUNDCLOUD ↗';
                inspExtLinks.appendChild(a);
            }
            if (links.youtube) {
                const a = document.createElement('a');
                a.href = links.youtube; a.target = '_blank';
                a.className = 'text-red-400 hover:underline font-bold border border-[var(--circuit)] px-1.5 py-0.5';
                a.innerText = 'YOUTUBE ↗';
                inspExtLinks.appendChild(a);
            }
            if (links.spotify) {
                const a = document.createElement('a');
                a.href = links.spotify; a.target = '_blank';
                a.className = 'hover:underline border border-[var(--circuit)] px-1.5 py-0.5 opacity-80';
                a.innerText = 'SPOTIFY ↗';
                inspExtLinks.appendChild(a);
            }
            if (links.apple) {
                const a = document.createElement('a');
                a.href = links.apple; a.target = '_blank';
                a.className = 'hover:underline border border-[var(--circuit)] px-1.5 py-0.5 opacity-80';
                a.innerText = 'APPLE ↗';
                inspExtLinks.appendChild(a);
            }
        }

        if (inspBtnPlay) {
            if ((item.type && item.type.includes("DSP")) || !item.streamType) {
                inspBtnPlay.style.display = 'none';
            } else {
                inspBtnPlay.style.display = 'block';
                inspBtnPlay.onclick = () => {
                    playCatalogItem(itemId, false);
                };
            }
        }

        inspectorModal.classList.remove('hidden');
    }

    function closeItemInspector() {
        if (inspectorModal) inspectorModal.classList.add('hidden');
    }

    if (btnCloseInspector) {
        btnCloseInspector.addEventListener('click', closeItemInspector);
    }
    if (inspectorModal) {
        inspectorModal.addEventListener('click', (e) => {
            if (e.target === inspectorModal) closeItemInspector();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeItemInspector();
    });

    if (btnInspectNowPlaying) {
        btnInspectNowPlaying.addEventListener('click', () => {
            openItemInspector(currentPlayingItemId);
        });
    }

    function playCatalogItem(itemId, shouldOpenInspector = false) {
        const item = CATALOG_DATABASE[itemId] || CATALOG_DATABASE['chapultepec'];

        // DSP items MUST NEVER play sound - only show README & specs
        if ((item.type && item.type.includes("DSP")) || !item.streamType) {
            openItemInspector(itemId);
            printTerminal(`[DSP] Visualizing specifications: ${item.title} (Audio disabled - Pure DSP Code & Specs)`);
            return;
        }

        currentPlayingItemId = item.id;
        isAudioPlaying = true;

        // Sync queue position
        const qIdx = PLAYBACK_QUEUE.indexOf(item.id);
        if (qIdx !== -1) currentQueueIndex = qIdx;

        if (playerTrackLabel) playerTrackLabel.innerText = `${item.title} — ${item.subtitle || 'LAO'}`;
        if (playerFormatTag) playerFormatTag.innerText = item.type;
        if (playerSourceBadge) {
            let label = 'BANDCAMP';
            if (item.streamType === 'soundcloud') label = 'SOUNDCLOUD';
            else if (item.streamType === 'youtube') label = 'YOUTUBE';
            else if (item.streamType === 'direct_audio') label = 'MASTER WAV';
            playerSourceBadge.innerText = label;
        }

        if (btnPlayerPlayPause) {
            btnPlayerPlayPause.innerText = '❚❚ PAUSE';
            btnPlayerPlayPause.classList.add('btn-play-toggle');
        }

        // Dynamically adjust embed height for YouTube (195px) vs Audio (120px)
        const embedContainer = document.getElementById('player-embed-container');
        if (embedContainer) {
            if (item.streamType === 'youtube') {
                embedContainer.classList.remove('mode-audio');
                embedContainer.classList.add('mode-youtube');
                if (playerIframe) playerIframe.style.height = '195px';
            } else {
                embedContainer.classList.remove('mode-youtube');
                embedContainer.classList.add('mode-audio');
                if (playerIframe) playerIframe.style.height = '120px';
            }
        }

        // Handle Audio Source
        if (item.streamType === 'direct_audio') {
            if (playerIframe) playerIframe.style.display = 'none';
            if (omniHtml5Audio) {
                omniHtml5Audio.src = item.streamPayload;
                omniHtml5Audio.style.display = 'block';
                omniHtml5Audio.play().catch(e => console.log("Audio autoplay prevented:", e));
            }
        } else {
            if (omniHtml5Audio) {
                try { omniHtml5Audio.pause(); } catch(e){}
                omniHtml5Audio.style.display = 'none';
            }
            if (playerIframe) {
                playerIframe.style.display = 'block';
                if (item.streamType === 'bandcamp') {
                    const isTrack = item.bandcampType === 'track';
                    const bcParam = isTrack ? `track=${item.streamPayload}` : `album=${item.streamPayload}`;
                    playerIframe.src = `https://bandcamp.com/EmbeddedPlayer/${bcParam}/size=large/bgcol=070012/linkcol=00ffff/tracklist=true/artwork=small/transparent=true/`;
                } else if (item.streamType === 'youtube') {
                    playerIframe.src = `https://www.youtube-nocookie.com/embed/${item.streamPayload}?autoplay=1&enablejsapi=1`;
                } else {
                    const encodedUrl = encodeURIComponent(item.streamPayload || 'https://soundcloud.com/lao');
                    playerIframe.src = `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%2300ffff&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
                }
            }
        }

        if (btnStreamLinkBc && item.links && item.links.bc) btnStreamLinkBc.href = item.links.bc;
        if (btnStreamLinkSc && item.links && item.links.sc) btnStreamLinkSc.href = item.links.sc;

        // Highlight music card if relevant
        document.querySelectorAll('.music-card').forEach((c) => {
            const match = c.dataset.itemId === item.id;
            c.classList.toggle('card-active', match);
        });

        // Update active highlight in queue list
        renderQueue();

        printTerminal(`[AUDIO] Streaming track: ${item.title} (${item.type}) [CUE: ${currentQueueIndex + 1}/${PLAYBACK_QUEUE.length}]`);

        if (shouldOpenInspector) {
            openItemInspector(itemId);
        }
    }

    function playNextTrack() {
        if (PLAYBACK_QUEUE.length === 0) return;
        currentQueueIndex = (currentQueueIndex + 1) % PLAYBACK_QUEUE.length;
        playCatalogItem(PLAYBACK_QUEUE[currentQueueIndex], false);
    }

    function playPrevTrack() {
        if (PLAYBACK_QUEUE.length === 0) return;
        currentQueueIndex = (currentQueueIndex - 1 + PLAYBACK_QUEUE.length) % PLAYBACK_QUEUE.length;
        playCatalogItem(PLAYBACK_QUEUE[currentQueueIndex], false);
    }

    function togglePlayPause() {
        if (isAudioPlaying) {
            isAudioPlaying = false;
            if (omniHtml5Audio && omniHtml5Audio.src) omniHtml5Audio.pause();
            if (btnPlayerPlayPause) btnPlayerPlayPause.innerText = '▶ PLAY';
            printTerminal('[AUDIO] Playback paused.');
        } else {
            isAudioPlaying = true;
            if (omniHtml5Audio && omniHtml5Audio.src) omniHtml5Audio.play();
            if (btnPlayerPlayPause) btnPlayerPlayPause.innerText = '❚❚ PAUSE';
            printTerminal(`[AUDIO] Playback resumed: ${currentPlayingItemId}`);
        }
    }

    function shuffleQueue() {
        const currentItem = PLAYBACK_QUEUE[currentQueueIndex];
        const rest = PLAYBACK_QUEUE.filter(k => k !== currentItem);
        const shuffled = rest.sort(() => Math.random() - 0.5);
        PLAYBACK_QUEUE = [currentItem, ...shuffled];
        currentQueueIndex = 0;
        renderQueue();
        printTerminal('[AUDIO] Queue randomized. Infinite random shuffle active.');
    }

    if (btnPlayerShuffle) btnPlayerShuffle.addEventListener('click', shuffleQueue);
    if (btnRefreshQueue) btnRefreshQueue.addEventListener('click', shuffleQueue);
    if (btnPlayerNext) btnPlayerNext.addEventListener('click', playNextTrack);
    if (btnPlayerPrev) btnPlayerPrev.addEventListener('click', playPrevTrack);
    if (btnPlayerPlayPause) btnPlayerPlayPause.addEventListener('click', togglePlayPause);

    if (btnToggleQueue && playerQueueWrapper) {
        btnToggleQueue.addEventListener('click', () => {
            const isHidden = playerQueueWrapper.style.display === 'none';
            playerQueueWrapper.style.display = isHidden ? 'flex' : 'none';
        });
    }

    // Connect all Music Cards in [02] MUSIC
    document.querySelectorAll('.music-card').forEach((card, idx) => {
        const itemId = MUSIC_CARDS_MAP[idx] || "chapultepec";
        const playBtn = card.querySelector('.btn-play-now');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                playCatalogItem(itemId, true);
            });
        }
    });

    // Music Tabs Switcher (Official LPs/EPs vs SoundCloud Singles/Bootlegs)
    const btnTabMusicOfficial = document.getElementById('btn-tab-music-official');
    const btnTabMusicSc = document.getElementById('btn-tab-music-sc');
    const viewMusicOfficial = document.getElementById('view-music-official');
    const viewMusicSc = document.getElementById('view-music-sc');

    if (btnTabMusicOfficial && btnTabMusicSc && viewMusicOfficial && viewMusicSc) {
        btnTabMusicOfficial.addEventListener('click', () => {
            btnTabMusicOfficial.classList.add('tab-active');
            btnTabMusicSc.classList.remove('tab-active');
            viewMusicOfficial.classList.remove('hidden');
            viewMusicSc.classList.add('hidden');
        });

        btnTabMusicSc.addEventListener('click', () => {
            btnTabMusicSc.classList.add('tab-active');
            btnTabMusicOfficial.classList.remove('tab-active');
            viewMusicSc.classList.remove('hidden');
            viewMusicOfficial.classList.add('hidden');
        });
    }

    // Connect all Clickable Items across the site (Music, Mixes, Art, Plugins, Gumroad, Press, Videos)
    document.querySelectorAll('.clickable-item[data-item-id]').forEach(itemEl => {
        const itemId = itemEl.getAttribute('data-item-id');
        itemEl.addEventListener('click', (e) => {
            if (e.target.closest('a')) return; // Allow direct link clicks
            playCatalogItem(itemId, true);
        });
    });

    // Minimize player toggle
    if (btnMinimizePlayer && playerContent) {
        btnMinimizePlayer.addEventListener('click', () => {
            const isHidden = playerContent.style.display === 'none';
            playerContent.style.display = isHidden ? 'flex' : 'none';
            btnMinimizePlayer.innerText = isHidden ? '_' : '+';
        });
    }

    // Initialize playback queue on load (filtered strictly to music tracks)
    initPlaybackQueue();

    /* =========================================================
       8.5 GUMROAD CATEGORY FILTERS & VIDEO CATALOG HERO
       ========================================================= */
    // Gumroad category filter tabs
    const gumroadFilterBar = document.getElementById('gumroad-filter-bar');
    if (gumroadFilterBar) {
        gumroadFilterBar.querySelectorAll('.gumroad-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                gumroadFilterBar.querySelectorAll('.gumroad-tab-btn').forEach(b => {
                    b.classList.remove('active', 'border-[var(--main)]', 'bg-[var(--main)]', 'text-[var(--bg)]');
                    b.classList.add('border-[var(--circuit)]');
                });
                btn.classList.add('active', 'border-[var(--main)]', 'bg-[var(--main)]', 'text-[var(--bg)]');
                btn.classList.remove('border-[var(--circuit)]');

                const cat = btn.getAttribute('data-cat');
                document.querySelectorAll('#gumroad-items-list .gumroad-card').forEach(card => {
                    if (cat === 'all' || card.getAttribute('data-cat') === cat) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Video Archive Catalog Grid & Active Hero Player
    const videoHeroIframe = document.getElementById('video-hero-iframe');
    const videoHeroTitle = document.getElementById('video-hero-title');
    const videoHeroBadge = document.getElementById('video-hero-badge');
    const videoCards = document.querySelectorAll('.video-card[data-yt-id]');

    function selectHeroVideo(card, autoPlay = true) {
        if (!card) return;
        const ytId = card.getAttribute('data-yt-id');
        const ytTitle = card.getAttribute('data-yt-title');
        const badgeTag = card.querySelector('.video-badge-tag');

        if (videoHeroIframe) {
            videoHeroIframe.src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=${autoPlay ? 1 : 0}`;
        }
        if (videoHeroTitle) videoHeroTitle.innerText = ytTitle || 'Boiler Room';
        if (videoHeroBadge && badgeTag) videoHeroBadge.innerText = badgeTag.innerText;

        videoCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
    }

    videoCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            selectHeroVideo(card, true);
        });
    });

    // Randomize initial hero video on startup
    if (videoCards.length > 0) {
        const randomVideoCard = videoCards[Math.floor(Math.random() * videoCards.length)];
        selectHeroVideo(randomVideoCard, false);
    }

    /* =========================================================
       8.6 UNIFIED PEDAGOGY HUB (YOUTUBE / GITHUB / GUMROAD)
       ========================================================= */
    const pedagogyTabs = document.querySelectorAll('#pedagogy-main-tabs .music-tab-btn');
    const pedagogyPanes = {
        youtube: document.getElementById('ped-pane-youtube'),
        github: document.getElementById('ped-pane-github'),
        gumroad: document.getElementById('ped-pane-gumroad')
    };

    pedagogyTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            pedagogyTabs.forEach(b => b.classList.remove('tab-active'));
            btn.classList.add('tab-active');
            const target = btn.getAttribute('data-ptab');
            Object.keys(pedagogyPanes).forEach(k => {
                if (pedagogyPanes[k]) {
                    if (k === target) {
                        pedagogyPanes[k].classList.remove('hidden');
                    } else {
                        pedagogyPanes[k].classList.add('hidden');
                    }
                }
            });
        });
    });

    // Pedagogy YouTube Tutorial card click handler
    const pedYtIframe = document.getElementById('ped-yt-iframe');
    const pedYtTitle = document.getElementById('ped-yt-title');
    const pedTutorialCards = document.querySelectorAll('#ped-pane-youtube .gumroad-card[data-yt-id]');
    pedTutorialCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            const ytId = card.getAttribute('data-yt-id');
            const title = card.getAttribute('data-yt-title');
            if (pedYtIframe && ytId) {
                pedYtIframe.src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1`;
            }
            if (pedYtTitle && title) {
                pedYtTitle.innerText = title;
            }
            pedTutorialCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });

    /* =========================================================
       8.7 CYBER-OCCULT PERIPHERAL SHRINES & EDGE ACTIONS
       ========================================================= */
    function playOccultTone(type, freq, duration = 2.0) {
        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(Math.min(freq * 3.5, 800), ctx.currentTime);

            gain.gain.setValueAtTime(0.005, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.28, ctx.currentTime + 0.25);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (err) {
            console.warn('Occult audio error:', err);
        }
    }

    // 1. Lemurian Time-War Portal Trigger
    document.querySelectorAll('.btn-trigger-lemuria').forEach(btn => {
        btn.addEventListener('click', () => {
            playOccultTone('sine', 36.0, 3.2);
            printTerminal('[LEMURIA // 0x00] VORTEX OPENED. Syzygy 0::9 Uttrunix active. 36Hz sub-resonance engaged.');
            const world = document.getElementById('world');
            if (world) {
                world.classList.add('occult-glitch-active');
                setTimeout(() => world.classList.remove('occult-glitch-active'), 450);
            }
        });
    });

    // 2. Tzolk'in Cyber-Chronometer Trigger
    document.querySelectorAll('.btn-trigger-tzolkin').forEach(btn => {
        btn.addEventListener('click', () => {
            const now = new Date();
            const dayNum = Math.floor(now.getTime() / 86400000);
            const kin = ((dayNum + 114) % 260) + 1;
            playOccultTone('triangle', 40.0, 2.8);
            printTerminal(`[TZOLK'IN // 0x09] KIN CALCULATED: KIN ${kin} // Cycle of Ollin (Cosmic Movement) synchronized. Syzygy 4::5 Katak.`);
        });
    });

    // 3. CCRU Barker Crypt Trigger
    document.querySelectorAll('.btn-trigger-barker').forEach(btn => {
        btn.addEventListener('click', () => {
            playOccultTone('sawtooth', 48.0, 2.5);
            printTerminal('[BARKER CRYPT // 0x90] DECRYPTING CCRU DEMONOLOGY: Syzygy 2::7 Kipphor engaged. Lemurian time-loop detected.');
        });
    });

    // 4. Xibalba Sub-Bass Anomaly Trigger
    document.querySelectorAll('.btn-trigger-xibalba').forEach(btn => {
        btn.addEventListener('click', () => {
            playOccultTone('sawtooth', 28.4, 3.5);
            printTerminal('[XIBALBA // 0xFF] CRITICAL WARNING: Underworld 9 resonance threshold exceeded. 28.4Hz tectonic pulse active.');
            document.body.classList.add('occult-glitch-active');
            setTimeout(() => document.body.classList.remove('occult-glitch-active'), 500);
        });
    });

    // Warp / Teleport Handlers
    document.querySelectorAll('.btn-warp-center').forEach(btn => {
        btn.addEventListener('click', () => centerOrigin(false));
    });
    document.querySelectorAll('.btn-warp-bottom-left').forEach(btn => {
        btn.addEventListener('click', () => panTo(340, 4640));
    });
    document.querySelectorAll('.btn-warp-abyss').forEach(btn => {
        btn.addEventListener('click', () => panTo(4640, 4640));
    });

    /* =========================================================
       9. CYBER ORACLE: EXPANDED CORPUS & BURROUGHS RECOMBINATOR
       ========================================================= */
    const tabBtnCutup = document.getElementById('tab-btn-cutup');
    const tabBtnCorpus = document.getElementById('tab-btn-corpus');
    const viewCutup = document.getElementById('view-cutup-engine');
    const viewCorpus = document.getElementById('view-source-corpus');

    if (tabBtnCutup && tabBtnCorpus && viewCutup && viewCorpus) {
        tabBtnCutup.addEventListener('click', () => {
            tabBtnCutup.classList.add('active');
            tabBtnCorpus.classList.remove('active');
            viewCutup.classList.remove('hidden');
            viewCorpus.classList.add('hidden');
        });

        tabBtnCorpus.addEventListener('click', () => {
            tabBtnCorpus.classList.add('active');
            tabBtnCutup.classList.remove('active');
            viewCorpus.classList.remove('hidden');
            viewCutup.classList.add('hidden');
        });

        // Oracle source corpus category filtering
        document.querySelectorAll('.oracle-cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.oracle-cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const cat = btn.getAttribute('data-filter');
                document.querySelectorAll('#view-source-corpus .corpus-block').forEach(block => {
                    if (cat === 'all' || block.getAttribute('data-cat') === cat) {
                        block.style.display = 'block';
                    } else {
                        block.style.display = 'none';
                    }
                });
            });
        });
    }

    // MASSIVE EXPANDED ESOTERIC REPOSITORY: MAYA, NAHUA, TOPY, CYBERPUNK, CRITICAL THEORY, CCRU
    const esotericTexts = [
        // Nahua / Azteca
        "¿Acaso de verdad se vive en la tierra? No para siempre en la tierra: sólo un poco aquí.",
        "Aunque sea de jade se quiebra, aunque sea de oro se rompe: en xochitl, in cuicatl.",
        "Nahui Ollin: El Quinto Sol de Movimiento, vibración sísmica perpetua en la placa.",
        "Ometeotl: La dualidad absoluta en Omeyocan, donde el tiempo no tiene coordenada fija.",
        "Tezcatlipoca: El espejo humeante de obsidiana que desmantela toda forma ilusoria.",
        "Mictlán: Nueve niveles de frío y viento de obsidiana para recuperar los huesos sagrados.",
        "Tlalticpac es sólo un lienzo efímero: existimos como un sueño pintado por Ipalnemohuani.",
        "In ixtli in yollotl: Hazte dueño de tu rostro y de tu corazón en medio de la niebla.",
        "No acabarán mis flores, no cesarán mis cantos: canto yo el cantor.",
        // Maya
        "Antes de la creación sólo había silencio y quietud en la oscuridad primordial del agua.",
        "Xibalba: Las seis casas subterráneas de prueba regidas por Hun-Camé y Vucub-Camé.",
        "Mi: El cero maya, caracol cósmico donde el fin del ciclo engendra la plenitud.",
        "Wayeb: Los cinco días sin nombre fuera del tiempo profano, donde los velos se disuelven.",
        "Huracán: Corazón del Cielo, relámpago y trueno que enciende el cosmos.",
        "Toda luna, todo año, todo día, todo viento camina y pasa también hacia su quietud.",
        "Hunab Ku: El dador del movimiento y la medida en el centro de la espiral galáctica.",
        "Los gemelos Hunahpú e Ixbalanqué juegan a la pelota contra la muerte en el inframundo.",
        // Thee Temple ov Psychick Youth (TOPY) & Thee Psychick Bible
        "Magick is the science and art of causing change to occur in conformity with Will without obsolete dogmas.",
        "Thee Sigil Process: eliminate all repeated letters and vowels until only the raw glyphic skeleton remains.",
        "Guilt is the currency of control: destroy guilt, destroy dogma, reclaim psychic sovereignty.",
        "Industrial sound deconditions the central nervous system: repetition produces trance, trance produces freedom.",
        "The 23 Current: when you notice the synchronicities, hyperstitional reality takes over the machine.",
        "TOPY is not a religion, it is an uncentralized network for cognitive deconditioning and sonic warfare.",
        // Cyberpunk Clásico & Especulativo
        "The sky above the port was the color of television, tuned to a dead channel.",
        "Cyberspace: a consensual hallucination experienced daily by billions of legitimate operators.",
        "The street finds its own uses for things: rogue hacks, mutations and stolen synthesizers.",
        "A cyborg is a cybernetic organism, a hybrid of machine and organism, creature of social reality.",
        "I would rather be a cyborg than a goddess: no dream of origin, no innocence.",
        "The car crash is a liberating event: the fertilizing of an aesthetic beyond reason.",
        "Information is alive, self-replicating and fired into the nervous system as light beams.",
        "Apparatuses are black boxes programmed to play with symbols; freedom is playing against them.",
        // Filosofía Crítica, Aceleracionismo & Sónica
        "It is easier to imagine an end to the world than an end to capitalism.",
        "Gothic materialism treats technology not as a prosthesis, but as an alien terrain of intensity.",
        "Sonic fiction turns sound into an alien abduction machine. Synthesizers are chronological teleporters.",
        "Rhythm is not a repetition of identity; it is an incision in time, de-territorializing the body.",
        "The territory no longer precedes the map; it is the map that engenders the territory.",
        "The spectacle is not a collection of images, but a social relation mediated by images.",
        "Speed is the essence of war. The dromosphere replaces geographic space with instantaneous transmission.",
        "The Temporary Autonomous Zone is a piratical encampment in the fissures of control.",
        "Cosmotechnics: the unification between the cosmic order and the moral order through technical activities.",
        // CCRU & Chaos Magick / Burroughs
        "Hyperstition operates as a positive feedback loop: fictional ideas make themselves real.",
        "The future is a viral agent creeping backward through chronological time.",
        "Capitalism is a runaway cybernetic engine; Lemurian time-sorcery dissolves the colonial narrative.",
        "Numbers dictate the geometry of chaos: the Numogram spirals inward through nine anomaly gates.",
        "Cut word lines. Smash static images. Language is a virus from deep outer space.",
        "Thee Temple is a process, not a destination. Nothing is true, everything is permitted.",
        "Control requires time. Time requires control. Reality is just a collective hunch.",
        "Sub-bass pressure vibrates bone marrow: rhythm is the primary psychic transport.",
        "Deconstruct the club. Reconstruct the territory.",
        "The sigil is a concentrated desire launched into the unconscious void to bend reality."
    ];

    const cutupBtn = document.getElementById('btn-generate-cutup');
    const cutupOutput = document.getElementById('cutup-output');

    if (cutupBtn && cutupOutput) {
        cutupBtn.addEventListener('click', () => {
            const sources = [];
            for (let i = 0; i < 4; i++) {
                sources.push(esotericTexts[Math.floor(Math.random() * esotericTexts.length)]);
            }
            
            const words = sources.join(" ").split(" ");
            const fragments = [];
            let i = 0;
            while (i < words.length) {
                const chunkLen = Math.floor(Math.random() * 3) + 2;
                fragments.push(words.slice(i, i + chunkLen).join(" "));
                i += chunkLen;
            }

            for (let j = fragments.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [fragments[j], fragments[k]] = [fragments[k], fragments[j]];
            }

            cutupOutput.innerHTML = "";
            cutupBtn.innerText = currentLang === 'es' ? "CONSULTANDO ORÁCULO..." : "QUERYING ORACLE...";
            cutupBtn.disabled = true;

            const syzygies = ["DOVEX-09", "KATAK-08", "MURRUM-07", "ODHULLA-06", "CHUTHO-05", "PUPPO-04", "CURRAY-03", "KUTTU-02", "MINOMBO-01"];
            const syzygy = syzygies[Math.floor(Math.random() * syzygies.length)];
            const zone = Math.floor(Math.random() * 9);
            const entropy = Math.floor(Math.random() * 85 + 15);
            const kin = Math.floor(Math.random() * 260 + 1);

            const v1 = fragments.slice(0, 3).join(" ... ");
            const v2 = fragments.slice(3, 6).join(" ... ");
            const v3 = fragments.slice(6, 9).join(" ... ");
            const fullPoem = `"${v1}"\n\n⌖ "${v2}"\n\n"${v3}".`;

            const card = document.createElement('div');
            card.className = 'oracle-card-out';
            card.innerHTML = `
                <div class="oracle-card-header">
                    <span>╔═══ ⌖ CHICOMOZTOC TRANSMISSION ⌖ ═══╗</span>
                    <span class="text-[var(--accent)] font-mono">GATE [${zone}] // ${syzygy}</span>
                </div>
                <div class="oracle-card-body font-mono text-[9px] leading-relaxed whitespace-pre-line" id="oracle-card-text"></div>
                <div class="oracle-card-footer flex justify-between text-[7.5px] opacity-75 font-mono">
                    <span>TZOLK'IN KIN: ${kin} // NAHUI OLLIN</span>
                    <span>ENTROPY: ${entropy}% // TOPY 23 CURRENT</span>
                </div>
            `;
            cutupOutput.appendChild(card);

            const textTarget = document.getElementById('oracle-card-text');
            let charIndex = 0;
            const typeInterval = setInterval(() => {
                if (charIndex < fullPoem.length) {
                    textTarget.innerText += fullPoem[charIndex];
                    charIndex++;
                } else {
                    clearInterval(typeInterval);
                    cutupBtn.innerText = currentLang === 'es' ? "EJECUTAR FOLD-IN / CONSULTAR" : "EXECUTE FOLD-IN / QUERY";
                    cutupBtn.disabled = false;
                    printTerminal(`[ORACLE] Chicomoztoc Fold-in delivered: Gate ${zone} (${syzygy})`);
                }
            }, 12);
        });
    }

    /* =========================================================
       9.5 CHAOS SIGIL FORGE (TOPY & MESOAMERICAN CODEX HYBRID)
       ========================================================= */
    const sigilInput = document.getElementById('sigil-input');
    const btnForgeSigil = document.getElementById('btn-forge-sigil');
    const sigilConsonantsEl = document.getElementById('sigil-consonants');
    const sigilCanvas = document.getElementById('sigil-canvas');
    const btnChargeSigil = document.getElementById('btn-charge-sigil');
    const btnBurnSigil = document.getElementById('btn-burn-sigil');

    function forgeSigil(text) {
        if (!sigilCanvas) return;
        const ctx = sigilCanvas.getContext('2d');
        const raw = (text || 'EXTASIS Y SOBERANIA RADICAL').toUpperCase();
        
        // Remove accents and symbols
        const cleaned = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z]/g, '');
        // Strip vowels (A, E, I, O, U)
        const noVowels = cleaned.replace(/[AEIOU]/g, '');
        // Distinct consonants (Austin Osman Spare method)
        const uniqueConsonants = Array.from(new Set(noVowels)).join(' ');
        if (sigilConsonantsEl) sigilConsonantsEl.innerText = uniqueConsonants || 'V O I D';

        // Clear canvas with deep black
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, sigilCanvas.width, sigilCanvas.height);

        const cx = sigilCanvas.width / 2;
        const cy = sigilCanvas.height / 2;
        const r = 85;

        // 1. Mesoamerican Sacred Ring & Xicalcoliuhqui Grecas
        ctx.strokeStyle = 'rgba(230, 0, 122, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.arc(cx, cy, r - 12, 0, Math.PI * 2);
        ctx.stroke();

        // Stepped Grecas (Xicalcoliuhqui) on ring
        const numGrecas = 12;
        for (let g = 0; g < numGrecas; g++) {
            const ang = (g / numGrecas) * Math.PI * 2;
            const x1 = cx + Math.cos(ang) * (r - 12);
            const y1 = cy + Math.sin(ang) * (r - 12);
            const x2 = cx + Math.cos(ang + 0.12) * (r - 12);
            const y2 = cy + Math.sin(ang + 0.12) * (r - 12);
            const x3 = cx + Math.cos(ang + 0.12) * (r - 4);
            const y3 = cy + Math.sin(ang + 0.12) * (r - 4);
            ctx.beginPath();
            ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3);
            ctx.stroke();
        }

        // 2. Nahui Ollin Cosmic Tremor Cross (4 cardinal arrowheads)
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - r - 4, cy); ctx.lineTo(cx + r + 4, cy);
        ctx.moveTo(cx, cy - r - 4); ctx.lineTo(cx, cy + r + 4);
        ctx.stroke();

        // 3. Voluta de la Palabra (Mesoamerican Speech Scroll)
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        const baseAngle = ((raw.charCodeAt(0) || 65) % 360) * Math.PI / 180;
        for (let t = 0; t < Math.PI * 2.6; t += 0.08) {
            const curR = 8 + (t * 11);
            const sx = cx + Math.cos(t + baseAngle) * curR;
            const sy = cy + Math.sin(t + baseAngle) * curR;
            if (t === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        const letters = uniqueConsonants.replace(/\s+/g, '').split('');
        if (letters.length === 0) return;

        // 4. Austin Osman Spare Consonant Nodes
        const points = letters.map((char, i) => {
            const code = char.charCodeAt(0) - 65;
            const angle = (code / 26) * Math.PI * 2 + (i * 0.55);
            const radius = 22 + ((code * 9) % 52);
            return {
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius
            };
        });

        // Interconnected Sigil Geometry
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#E6007A';
        ctx.shadowColor = '#E6007A';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const p = points[i];
            ctx.lineTo(p.x, p.y);
            ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.moveTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.stroke();

        // 5. Thee Psychick Cross / Terminal Anchor
        ctx.strokeStyle = '#00FFFF';
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 8;
        const lastP = points[points.length - 1];
        ctx.beginPath();
        ctx.moveTo(lastP.x - 10, lastP.y - 10);
        ctx.lineTo(lastP.x + 10, lastP.y + 10);
        ctx.moveTo(lastP.x - 10, lastP.y + 10);
        ctx.lineTo(lastP.x + 10, lastP.y - 10);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    if (btnForgeSigil && sigilInput) {
        btnForgeSigil.addEventListener('click', () => {
            forgeSigil(sigilInput.value);
            printTerminal(`[SIGIL] New glyph forged: ${sigilInput.value}`);
        });
    }

    if (btnChargeSigil && sigilCanvas) {
        btnChargeSigil.addEventListener('click', () => {
            sigilCanvas.classList.add('sigil-charging');
            playNoiseBurst();
            setTimeout(() => sigilCanvas.classList.remove('sigil-charging'), 600);
            printTerminal('[SIGIL] Glyph energized. Will charged into the subconscious matrix.');
        });
    }

    if (btnBurnSigil && sigilCanvas) {
        btnBurnSigil.addEventListener('click', () => {
            sigilCanvas.classList.add('sigil-banishing');
            setTimeout(() => {
                const ctx = sigilCanvas.getContext('2d');
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, sigilCanvas.width, sigilCanvas.height);
                sigilCanvas.classList.remove('sigil-banishing');
                if (sigilConsonantsEl) sigilConsonantsEl.innerText = 'BANISHED // DISOLVED';
                printTerminal('[SIGIL] Banishing ritual complete. Desire cast out into the void.');
            }, 500);
        });
    }

    // Initial sigil forge on boot
    if (sigilCanvas) {
        setTimeout(() => forgeSigil('EXTASIS Y SOBERANIA RADICAL'), 400);
    }

    /* =========================================================
       10. TERMINAL & SYSTEM COMMANDS
       ========================================================= */
    const termInput = document.getElementById('terminal-input');
    const termOutput = document.getElementById('terminal-output');
    const livecodeEditor = document.getElementById('livecode-editor');
    const termInputContainer = document.getElementById('terminal-input-container');
    const livecodeTextarea = document.getElementById('livecode-textarea');
    const btnRunCode = document.getElementById('btn-run-code');
    const btnCloseLivecode = document.getElementById('btn-close-livecode');

    function printTerminal(text, isHTML = false) {
        const out = termOutput || document.getElementById('terminal-output');
        if (!out) return;
        const div = document.createElement('div');
        div.className = 'terminal-line';
        if (isHTML) div.innerHTML = text;
        else div.innerText = text;
        out.appendChild(div);
        out.scrollTop = out.scrollHeight;
    }

    if (termInput) {
        termInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const rawCmd = termInput.value.trim();
                const cmd = rawCmd.toLowerCase();
                termInput.value = '';
                if (cmd === '') return;

                printTerminal(`root@lao:~# ${rawCmd}`);
                processCommand(cmd);
            }
        });
    }

    function processCommand(cmd) {
        const args = cmd.split(' ');
        const baseCmd = args[0];

        switch (baseCmd) {
            case 'help':
                printTerminal(`
                <b>[ SISTEMA & NAVEGACIÓN ]</b><br>
                - <b>open all</b> / <b>open closeall</b>: Abrir o cerrar todas las ventanas<br>
                - <b>cd [bio|music|mixes|art|plugins|pedagogy|services|videos|oracle|terminal|labyrinth|contact|sigil|press]</b><br>
                - <b>theme [day|extasis|matrix|topy|blood]</b>: Paleta de color<br>
                - <b>lang</b>: Alternar inglés / español<br>
                - <b>drone [pandemonium|lemurian|warp|off]</b>: Síntesis de drone CCRU<br>
                - <b>livecode</b>: Abrir IDE Web Audio<br>
                - <b>clear</b>: Limpiar consola<br>
                <br>
                <b>[ REPRODUCTOR OMNI-AUDIO ]</b><br>
                - <b>play [track_id | #]</b>: Reproducir pista o reanudar audio<br>
                - <b>pause</b> / <b>stop</b>: Pausar reproducción<br>
                - <b>next</b> / <b>prev</b>: Pista siguiente / anterior<br>
                - <b>shuffle</b> / <b>random</b>: Barajar cola de reproducción<br>
                - <b>status</b> / <b>np</b>: Pista actual en reproducción<br>
                - <b>queue</b>: Ver pistas en cola de reproducción<br>
                <br>
                <b>[ COMANDOS DEL LABERINTO & CAOS ]</b><br>
                - <b>void</b>: Teletransportarse al sector muerto<br>
                - <b>hyperstition</b>: Invocar profecía de tiempo CCRU<br>
                - <b>sigil</b>: Generar sigilo ANSI de TOPY<br>
                - <b>panic</b>: Inversión súbita de sistema<br>
                - <b>roulette</b>: Salto aleatorio de coordenadas
                `, true);
                break;

            case 'play':
                if (args[1]) {
                    const searchId = args.slice(1).join(' ').toLowerCase();
                    if (CATALOG_DATABASE[searchId]) {
                        playCatalogItem(searchId, false);
                    } else {
                        const num = parseInt(searchId, 10);
                        if (!isNaN(num) && num >= 1 && num <= PLAYBACK_QUEUE.length) {
                            currentQueueIndex = num - 1;
                            playCatalogItem(PLAYBACK_QUEUE[currentQueueIndex], false);
                        } else {
                            const match = Object.keys(CATALOG_DATABASE).find(k =>
                                k.toLowerCase().includes(searchId) ||
                                (CATALOG_DATABASE[k].title && CATALOG_DATABASE[k].title.toLowerCase().includes(searchId))
                            );
                            if (match) {
                                playCatalogItem(match, false);
                            } else {
                                printTerminal(`[AUDIO] Error: Pista '${args.slice(1).join(' ')}' no encontrada. Escribe 'queue' para ver la lista.`);
                            }
                        }
                    }
                } else {
                    if (!isAudioPlaying) {
                        togglePlayPause();
                    } else {
                        const item = CATALOG_DATABASE[currentPlayingItemId] || CATALOG_DATABASE[PLAYBACK_QUEUE[currentQueueIndex]];
                        printTerminal(`[AUDIO] Reproduciendo: ${item?.title || 'Audio activo'}`);
                    }
                }
                break;

            case 'pause':
            case 'stop':
                if (isAudioPlaying) {
                    togglePlayPause();
                } else {
                    printTerminal('[AUDIO] Reproducción ya en pausa.');
                }
                break;

            case 'next':
                playNextTrack();
                break;

            case 'prev':
                playPrevTrack();
                break;

            case 'shuffle':
            case 'random':
                shuffleQueue();
                break;

            case 'status':
            case 'np':
                const cur = CATALOG_DATABASE[currentPlayingItemId] || CATALOG_DATABASE[PLAYBACK_QUEUE[currentQueueIndex]];
                if (cur) {
                    printTerminal(`
                    <b>[ REPRODUCCIÓN EN CURSO ]</b><br>
                    - <b>Título:</b> ${cur.title}<br>
                    - <b>Año / Sello:</b> ${cur.year || '2026'} • ${cur.subtitle || 'LAO'}<br>
                    - <b>Fuente:</b> ${cur.streamType?.toUpperCase() || 'AUDIO'}<br>
                    - <b>Estado:</b> ${isAudioPlaying ? '▶ EN REPRODUCCIÓN' : '❚❚ EN PAUSA'}<br>
                    - <b>Posición Cola:</b> [${currentQueueIndex + 1}/${PLAYBACK_QUEUE.length}]
                    `, true);
                } else {
                    printTerminal('[AUDIO] No hay pista cargada.');
                }
                break;

            case 'queue':
                let qText = '<b>[ COLA DE REPRODUCCIÓN MASTER ]</b><br>';
                PLAYBACK_QUEUE.slice(0, 10).forEach((id, idx) => {
                    const itm = CATALOG_DATABASE[id];
                    const activePfx = (idx === currentQueueIndex) ? '▶ <b>' : '  ';
                    const activeSfx = (idx === currentQueueIndex) ? '</b> <i>[ACTUAL]</i>' : '';
                    qText += `${activePfx}[${idx + 1}] ${itm ? itm.title : id} (${itm?.type || 'TRACK'})${activeSfx}<br>`;
                });
                if (PLAYBACK_QUEUE.length > 10) {
                    qText += `<i>...y ${PLAYBACK_QUEUE.length - 10} pistas más disponibles.</i>`;
                }
                printTerminal(qText, true);
                break;

            case 'clear':
                termOutput.innerHTML = '';
                break;

            case 'theme':
                if (args[1] && ['day', 'extasis', 'matrix', 'topy', 'blood'].includes(args[1])) {
                    applyTheme(args[1]);
                } else {
                    printTerminal('Error: Utiliza day, extasis, matrix, topy, o blood.');
                }
                break;

            case 'lang':
                currentLang = currentLang === 'es' ? 'en' : 'es';
                updateLanguage();
                break;

            case 'open':
                if (args[1] === 'all') {
                    toggleAllWindows();
                } else if (args[1] === 'closeall') {
                    document.querySelectorAll('.drag-window').forEach(w => w.style.display = 'none');
                    document.querySelectorAll('.dock-item[data-target]').forEach(d => d.classList.remove('dock-active'));
                    syncOpenAllButtons();
                    updateCables();
                    printTerminal('[SYS] All windows closed.');
                }
                break;

            case 'drone':
                if (args[1] === 'off') stopNumogramDrone();
                else if (args[1] && dronePresets[args[1]]) startNumogramDrone(args[1]);
                else {
                    if (isDroneActive) stopNumogramDrone();
                    else startNumogramDrone('pandemonium');
                }
                break;

            case 'livecode':
                termOutput.style.display = 'none';
                termInputContainer.style.display = 'none';
                livecodeEditor.style.display = 'flex';
                break;

            case 'cd':
                const windowMap = {
                    'bio': 'win-bio', 'music': 'win-music', 'mixes': 'win-mixes',
                    'art': 'win-art', 'plugins': 'win-plugins', 'pedagogy': 'win-pedagogy',
                    'services': 'win-services', 'videos': 'win-videos', 'oracle': 'win-oracle',
                    'terminal': 'win-terminal', 'labyrinth': 'win-labyrinth', 'contact': 'win-contact',
                    'sigil': 'win-sigil', 'press': 'win-press'
                };
                if (windowMap[args[1]]) {
                    openWindow(windowMap[args[1]], true);
                    printTerminal(`Mounted and navigated to node: ${args[1].toUpperCase()}`);
                } else {
                    printTerminal(`Error: Nodo '${args[1]}' no encontrado. Escribe 'help'.`);
                }
                break;

            case 'void':
                panTo(4100, 900);
                triggerSubliminal();
                playNoiseBurst();
                printTerminal('[WARP] Teleported to SECTOR 0xDEAD [THE VOID].');
                break;

            case 'sigil':
                openWindow('win-sigil', true);
                printTerminal(`
  ██
██████
  ██
██████
  ██
██████
  ██
[ THEE PSYCHICK CROSS — TOPY 23 // MOUNTING CHAOS SIGIL FORGE ]
                `);
                triggerSubliminal(true);
                break;

            case 'hyperstition':
                printTerminal(`
>>> [CCRU DECRYPTION]: "Hyperstition operates as a positive feedback circuit.
Ideas that make themselves real. The Numogram is the chronotechnical diagram of the Lemurian Time-War."
                `);
                document.body.style.filter = 'invert(1) hue-rotate(180deg)';
                setTimeout(() => document.body.style.filter = 'none', 350);
                break;

            case 'panic':
                document.body.style.filter = 'invert(1) contrast(300%)';
                playNoiseBurst();
                triggerSubliminal(true);
                setTimeout(() => document.body.style.filter = 'none', 500);
                printTerminal('[ALERT] Voltage surge simulated across motherboard.');
                break;

            case 'roulette':
                const randomCoords = [
                    [2500, 2500], [4100, 900], [900, 4100], [1750, 1650], [2900, 1650], [2900, 2200]
                ];
                const choice = randomCoords[Math.floor(Math.random() * randomCoords.length)];
                panTo(choice[0], choice[1]);
                triggerSubliminal();
                printTerminal(`[ROULETTE] Teleported to coordinates (${choice[0]}, ${choice[1]}).`);
                break;

            case 'whoami':
                printTerminal('LAO_OS // Lauro Manuel Robles (CDMX). Founder of Extasis Records & NAAFI co-founder.');
                break;

            default:
                printTerminal(`bash: ${baseCmd}: command not found. Type 'help'.`);
        }
    }

    if (btnCloseLivecode) {
        btnCloseLivecode.addEventListener('click', () => {
            livecodeEditor.style.display = 'none';
            termOutput.style.display = 'flex';
            termInputContainer.style.display = 'flex';
            termInput.focus();
        });
    }

    if (btnRunCode) {
        btnRunCode.addEventListener('click', () => {
            const code = livecodeTextarea.value;
            try {
                const execute = new Function(code);
                execute();
                printTerminal('[LIVECODE] Sequence executed safely in AudioContext.');
            } catch (error) {
                console.error("LiveCode Error:", error);
                alert("Execution Error: " + error.message);
            }
        });
    }

    /* =========================================================
       11. LABYRINTH TELEPORTS
       ========================================================= */
    document.querySelectorAll('.btn-nav-coord').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const x = parseInt(e.currentTarget.getAttribute('data-x'));
            const y = parseInt(e.currentTarget.getAttribute('data-y'));
            if (!isNaN(x) && !isNaN(y)) {
                panTo(x, y);
                triggerSubliminal();
            }
        });
    });

    document.querySelectorAll('.btn-void-teleport').forEach(btn => {
        btn.addEventListener('click', () => {
            const randomX = Math.floor(Math.random() * 3800) + 600;
            const randomY = Math.floor(Math.random() * 3800) + 600;
            panTo(randomX, randomY);
            triggerSubliminal();
            playNoiseBurst();
        });
    });

    document.querySelectorAll('.btn-void-noise').forEach(btn => {
        btn.addEventListener('click', () => {
            playNoiseBurst();
            triggerSubliminal();
        });
    });

    /* =========================================================
       12. BIO VIEW TAB SWITCHER & WORLD TOUR RADAR ENGINE
       ========================================================= */
    const btnTabBioList = document.getElementById('btn-tab-bio-list');
    const btnTabBioMap = document.getElementById('btn-tab-bio-map');
    const bioViewList = document.getElementById('bio-view-list');
    const bioViewMap = document.getElementById('bio-view-map');

    if (btnTabBioList && btnTabBioMap && bioViewList && bioViewMap) {
        btnTabBioList.addEventListener('click', () => {
            btnTabBioList.classList.add('tab-active');
            btnTabBioList.classList.remove('opacity-70');
            btnTabBioMap.classList.remove('tab-active');
            btnTabBioMap.classList.add('opacity-70');
            bioViewList.classList.remove('hidden');
            bioViewMap.classList.add('hidden');
        });

        btnTabBioMap.addEventListener('click', () => {
            btnTabBioMap.classList.add('tab-active');
            btnTabBioMap.classList.remove('opacity-70');
            btnTabBioList.classList.remove('tab-active');
            btnTabBioList.classList.add('opacity-70');
            bioViewMap.classList.remove('hidden');
            bioViewList.classList.add('hidden');
            initWorldRadar();
        });
    }

    const WORLD_TOUR_CITIES = [
        {
            id: 'cdmx',
            name: 'Ciudad de México',
            country: 'México',
            region: 'america',
            lat: 19.4326,
            lon: -99.1332,
            isHQ: true,
            years: '2004–PRESENTE [NÚCLEO]',
            venue: 'Ground Zero // Estudio Chapultepec, Boiler Room, Festival TONO, Sónar México, MUTEK MX',
            dossier: 'Centro neurálgico de operaciones de Lauro Robles. Cuartel general de NAAFI y Extasis Records.'
        },
        {
            id: 'tokyo',
            name: 'Tokio',
            country: 'Japón',
            region: 'asia',
            lat: 35.6762,
            lon: 139.6503,
            years: '2014, 2017, 2019',
            venue: 'Circus Tokyo (Shibuya), Red Bull Music Academy (Daikanyama UNIT)',
            dossier: 'RBMA Tokyo 2014; Circus Tokyo con Wrack (2017) y con Nick Hook (2019).'
        },
        {
            id: 'taipei',
            name: 'Taipéi',
            country: 'Taiwán',
            region: 'asia',
            lat: 25.0330,
            lon: 121.5654,
            years: '2019',
            venue: 'FINAL Taipei',
            dossier: 'Club night estelar en el club subterráneo más influyente de Taiwán.'
        },
        {
            id: 'shenzhen',
            name: 'Shenzhen',
            country: 'China',
            region: 'asia',
            lat: 22.5431,
            lon: 114.0579,
            years: '2019',
            venue: 'OIL Club (Boiler Room China x OIL)',
            dossier: 'Incursión histórica en el centro tecnológico chino con Boiler Room China.'
        },
        {
            id: 'beijing',
            name: 'Beijing',
            country: 'China',
            region: 'asia',
            lat: 39.9042,
            lon: 116.4074,
            years: '2019',
            venue: 'ALL Beijing / Club Run',
            dossier: 'Presentación en la capital china explorando bass extremo y club experimental.'
        },
        {
            id: 'shanghai',
            name: 'Shanghai',
            country: 'China',
            region: 'asia',
            lat: 31.2304,
            lon: 121.4737,
            years: '2017',
            venue: 'Elevator Shanghai (Genome 6.66 Mbp presents LAO)',
            dossier: 'Colaboración sónica con el legendario sello chino Genome 6.66 Mbp.'
        },
        {
            id: 'seoul',
            name: 'Seúl',
            country: 'Corea del Sur',
            region: 'asia',
            lat: 37.5665,
            lon: 126.9780,
            years: '2017',
            venue: 'Cakeshop Seoul & Seoul Community Radio (SCR)',
            dossier: 'Showcase en el corazón de Itaewon y transmisión en directo para SCR.'
        },
        {
            id: 'berlin',
            name: 'Berlín',
            country: 'Alemania',
            region: 'europe',
            lat: 52.5200,
            lon: 13.4050,
            years: '2016, 2017',
            venue: 'Berghain (Säule VIII) & CTM Festival (Halle am Berghain)',
            dossier: 'Debut en Säule VIII (Berghain) y presentación en Halle am Berghain para CTM Festival.'
        },
        {
            id: 'barcelona',
            name: 'Barcelona',
            country: 'España',
            region: 'europe',
            lat: 41.3851,
            lon: 2.1734,
            years: '2015, 2016, 2017',
            venue: 'Sónar Barcelona (SónarDome 2015 & 2017), Razzmatazz (TRILL), Boiler Room Barcelona',
            dossier: 'Debut Catedral EP en solitario (2015) y cierre oficial b2b con NAAFI (2017).'
        },
        {
            id: 'venice',
            name: 'Venecia',
            country: 'Italia',
            region: 'europe',
            lat: 45.4408,
            lon: 12.3155,
            years: '2024',
            venue: '60ª Bienal de Venecia (Arsenale / Teatro alle Tese)',
            dossier: 'Dirección musical y performance de clausura para la ópera de vanguardia "La Culebra".'
        },
        {
            id: 'krakow',
            name: 'Cracovia',
            country: 'Polonia',
            region: 'europe',
            lat: 50.0647,
            lon: 19.9450,
            years: '2016',
            venue: 'Unsound Festival (Hotel Forum)',
            dossier: 'Presentación en el icónico Hotel Forum para el festival experimental Unsound.'
        },
        {
            id: 'bordeaux',
            name: 'Bordeaux',
            country: 'Francia',
            region: 'europe',
            lat: 44.8378,
            lon: -0.5792,
            years: '2016',
            venue: 'Plage Club x LAO @ Iboat',
            dossier: 'Club session en el suroeste francés a bordo del legendario Iboat.'
        },
        {
            id: 'montreal',
            name: 'Montreal',
            country: 'Canadá',
            region: 'america',
            lat: 45.5017,
            lon: -73.5673,
            years: '2017',
            venue: 'MUTEK Montréal (Société des Arts Technologiques - SAT)',
            dossier: 'NAAFI Showcase norteamericano en la cúpula satelital de MUTEK Montréal.'
        },
        {
            id: 'nyc',
            name: 'Nueva York',
            country: 'EE. UU.',
            region: 'america',
            lat: 40.7128,
            lon: -74.0060,
            years: '2016, 2023',
            venue: 'The Lot Radio (Brooklyn) & NAAFI NYC Sessions',
            dossier: 'Transmisión exclusiva para The Lot Radio y residencias de club en Brooklyn.'
        },
        {
            id: 'austin',
            name: 'Austin',
            country: 'EE. UU.',
            region: 'america',
            lat: 30.2672,
            lon: -97.7431,
            years: '2023',
            venue: 'Club Eternal (Nikki Nair & Lao)',
            dossier: 'Noche de vanguardia y debut texano en el club underground Club Eternal.'
        },
        {
            id: 'puerto_escondido',
            name: 'Puerto Escondido',
            country: 'México',
            region: 'america',
            lat: 15.8624,
            lon: -97.0694,
            years: '2016',
            venue: 'Boiler Room Puerto Escondido (NAAFI Beach Showcase)',
            dossier: 'Sesión frente al océano Pacífico que proyectó el clubbing mexicano mundialmente.'
        }
    ];

    function projectToMap(lat, lon, width = 1000, height = 500) {
        const x = ((lon + 180) / 360) * width;
        const y = ((90 - lat) / 180) * height;
        return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
    }

    function initWorldRadar(filterRegion = 'all') {
        const svgArcs = document.getElementById('radar-flight-arcs');
        const svgNodes = document.getElementById('radar-city-nodes');
        const hudCity = document.getElementById('radar-hud-city');
        const hudCoords = document.getElementById('radar-hud-coords');
        const hudDetails = document.getElementById('radar-hud-details');

        if (!svgArcs || !svgNodes) return;

        svgArcs.innerHTML = '';
        svgNodes.innerHTML = '';

        const cdmxCity = WORLD_TOUR_CITIES.find(c => c.isHQ);
        const cdmxPos = projectToMap(cdmxCity.lat, cdmxCity.lon);

        const visibleCities = WORLD_TOUR_CITIES.filter(city => {
            if (filterRegion === 'all') return true;
            return city.region === filterRegion || city.isHQ;
        });

        visibleCities.forEach(city => {
            const pos = projectToMap(city.lat, city.lon);

            // Flight trajectory arc from CDMX (Ground Zero)
            if (!city.isHQ) {
                const midX = (cdmxPos.x + pos.x) / 2;
                const midY = Math.min(cdmxPos.y, pos.y) - 40;
                const pathD = `M ${cdmxPos.x} ${cdmxPos.y} Q ${midX} ${midY} ${pos.x} ${pos.y}`;

                const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                pathEl.setAttribute('d', pathD);
                pathEl.setAttribute('class', 'radar-flight-arc');
                pathEl.setAttribute('id', `arc-${city.id}`);
                svgArcs.appendChild(pathEl);
            }

            // City node group
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('class', 'radar-city-blip');
            g.setAttribute('data-city-id', city.id);
            g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);

            // Outer pulsing ring
            const pulseCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            pulseCircle.setAttribute('class', 'radar-city-pulse');
            pulseCircle.setAttribute('cx', 0);
            pulseCircle.setAttribute('cy', 0);
            pulseCircle.setAttribute('r', city.isHQ ? 6 : 3.5);
            pulseCircle.setAttribute('fill', 'none');
            pulseCircle.setAttribute('stroke', city.isHQ ? 'var(--main)' : 'var(--accent)');
            pulseCircle.setAttribute('stroke-width', city.isHQ ? 2 : 1.2);
            g.appendChild(pulseCircle);

            // Center beacon
            const coreCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            coreCircle.setAttribute('class', 'blip-core');
            coreCircle.setAttribute('cx', 0);
            coreCircle.setAttribute('cy', 0);
            coreCircle.setAttribute('r', city.isHQ ? 4.5 : 2.5);
            coreCircle.setAttribute('fill', city.isHQ ? 'var(--main)' : 'var(--accent)');
            g.appendChild(coreCircle);

            // City Label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', 7);
            text.setAttribute('y', 3);
            text.setAttribute('fill', city.isHQ ? 'var(--main)' : 'var(--fg)');
            text.setAttribute('font-size', city.isHQ ? '9px' : '7.5px');
            text.setAttribute('font-family', 'Iosevka, monospace');
            text.setAttribute('font-weight', city.isHQ ? 'bold' : 'normal');
            text.setAttribute('opacity', city.isHQ ? '1' : '0.85');
            text.textContent = city.name.toUpperCase();
            g.appendChild(text);

            const selectCity = () => {
                if (hudCity) hudCity.textContent = `// ${city.name.toUpperCase()}, ${city.country.toUpperCase()} [${city.years}]`;
                if (hudCoords) hudCoords.textContent = `[ LAT ${city.lat.toFixed(2)}°, LON ${city.lon.toFixed(2)}° ]`;
                if (hudDetails) hudDetails.innerHTML = `<strong>FORO / FESTIVAL:</strong> ${city.venue}<br><span class="opacity-75">${city.dossier}</span>`;
            };

            g.addEventListener('mouseenter', selectCity);
            g.addEventListener('click', selectCity);

            svgNodes.appendChild(g);
        });
    }

    // Setup filter buttons once
    document.querySelectorAll('.radar-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.radar-filter-btn').forEach(b => {
                b.classList.remove('active-radar-btn');
                b.classList.remove('border-[var(--accent)]');
            });
            e.currentTarget.classList.add('active-radar-btn');
            const region = e.currentTarget.getAttribute('data-region');
            initWorldRadar(region);
        });
    });

});
