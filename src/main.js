import './style.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

        // Randomize all window positions EXCEPT terminal
        let windowPositions = [{x: 2600, y: 2350, w: 460, h: 350}]; // Block terminal area
        document.querySelectorAll('.drag-window').forEach(win => {
            const currentWidth = parseInt(win.style.width) || 400;
            const currentHeight = parseInt(win.style.height) || 400;
            
            if (win.id !== 'win-terminal') {
                win.style.width = `${currentWidth * 1.25}px`;
                win.style.height = `${currentHeight * 1.25}px`;
                
                let placed = false;
                let attempts = 0;
                let rx, ry;
                while (!placed && attempts < 50) {
                    rx = Math.floor(Math.random() * 3800) + 600; // 600 to 4400
                    ry = Math.floor(Math.random() * 3800) + 600;
                    
                    let collision = false;
                    for (const pos of windowPositions) {
                        // Rough collision radius
                        if (Math.abs(pos.x - rx) < 550 && Math.abs(pos.y - ry) < 500) {
                            collision = true;
                            break;
                        }
                    }
                    if (!collision) placed = true;
                    attempts++;
                }
                
                if (!placed) {
                    rx = Math.floor(Math.random() * 3800) + 600;
                    ry = Math.floor(Math.random() * 3800) + 600;
                }
                
                windowPositions.push({x: rx, y: ry, w: currentWidth * 1.25, h: currentHeight * 1.25});
                win.style.left = `${rx}px`;
                win.style.top = `${ry}px`;
            } else {
                // Terminal stays compact so it fits on screen when placed right of center
                win.style.width = `460px`;
                win.style.height = `350px`;
                win.style.left = `2600px`;
                win.style.top = `2350px`;
            }
        });

        // Auto-open ONLY the terminal window upon booting (no auto-pan)
        openWindow('win-terminal', false);
        
        // Pan directly to the exact center (Extasis Logo)
        setTimeout(() => {
            panTo(2500, 2500);
        }, 100);

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
    let isDragging = false;
    let isPanning = false;
    let highestZ = 8700;
    let isNightMode = true;
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

        if (winId === 'win-radar') {
            setTimeout(() => {
                if (!leafletMap) {
                    initWorldRadar();
                } else {
                    leafletMap.invalidateSize();
                }
            }, 150);
        }

        syncOpenAllButtons();
        updateCables();
    }
    window.openWindow = openWindow;

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
        if (win.id === 'win-radar' && window.leafletMap) {
            setTimeout(() => {
                window.leafletMap.invalidateSize();
            }, 150);
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
            title: "EXTASIS RECORDS",
            art: `
  ███████╗██╗  ██╗████████╗ █████╗ ███████╗██╗███████╗
  ██╔════╝╚██╗██╔╝╚══██╔══╝██╔══██╗██╔════╝██║██╔════╝
  █████╗   ╚███╔╝    ██║   ███████║███████╗██║███████╗
  ██╔══╝   ██╔██╗    ██║   ██╔══██║╚════██║██║╚════██║
  ███████╗██╔╝ ██╗   ██║   ██║  ██║███████║██║███████║
  ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝╚══════╝
            `
        },
        {
            title: "LAO // DRONE SYSTEM",
            art: `
  ██╗      █████╗  ██████╗ 
  ██║     ██╔══██╗██╔═══██╗
  ██║     ███████║██║   ██║
  ██║     ██╔══██║██║   ██║
  ███████╗██║  ██║╚██████╔╝
  ╚══════╝╚═╝  ╚═╝ ╚═════╝ 
            `
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
       / /" "\ \      
      | | (0) | |     
      | |     | |     
       \ \_ _/ /      
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
            art: `         / \         
        /   \        
       / [1] \       
     / [2] [3] \     
    / [4] [5] [6]\   
   /      [7]     \  
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
     /_\ / __(_)__/ /  
    / _ / /__/ / _  /   
   /_/ |_\___/_|_,_/   
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
            streamType: "direct_audio",
            streamPayload: "https://archive.org/download/filtro.016/01%20-%20Glory%20Sat..mp3",
            links: {
                bc: "https://laolaolao.bandcamp.com/album/chapultepec",
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
            streamPayload: "4168888294",
            links: {
                bc: "https://laolaolao.bandcamp.com/album/coastal-acid",
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
            streamPayload: "38145319",
            links: {
                bc: "https://laolaolao.bandcamp.com/album/lo-que-queda-vuelve",
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
            streamPayload: "272561132",
            links: {
                bc: "https://laolaolao.bandcamp.com/album/sendero",
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
            bandcampType: "track",
            streamPayload: "3899014912",
            links: {
                bc: "https://laolaolao.bandcamp.com/track/guacamaya",
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
            streamPayload: "4157728486",
            links: {
                bc: "https://laolaolao.bandcamp.com/album/siren-cycle-ep",
                sc: "https://soundcloud.com/lao"
            }
        },
        "clasicos_vol1": {
            id: "clasicos_vol1",
            title: "Clásicos Vol. 1 [EXTASIS031]",
            subtitle: "Extasis Records — Compilación Antológica",
            type: "COMPILACIÓN",
            year: "2022",
            cover: "/images/covers/clasicos_vol1.jpg",
            desc: "Compilación antológica de himnos esenciales producidos por Lao para la pista subterránea durante una década de residencias y giras internacionales.",
            details: [
                "Catálogo: EXTASIS031",
                "Curaduría: Lauro Robles",
                "12 cortes históricos remasterizados"
            ],
            streamType: "bandcamp",
            streamPayload: "2261814637",
            links: {
                bc: "https://laolaolao.bandcamp.com/album/clasicos-vol-1-extasis031",
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
            bandcampType: "track",
            streamPayload: "3343335777",
            links: {
                bc: "https://laolaolao.bandcamp.com/track/fake-doi",
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
            streamPayload: "3113442230",
            links: {
                bc: "https://domeofdoom.bandcamp.com/album/singularity",
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
            streamPayload: "3832246852",
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
            streamPayload: "3879686254",
            links: {
                bc: "https://naafi.bandcamp.com/album/catedral",
                sc: "https://soundcloud.com/lao"
            }
        },
        "amen_ep": {
            id: "amen_ep",
            title: "Amen EP",
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
            streamType: "direct_audio",
            streamPayload: "https://archive.org/download/filtro.016/01%20-%20Glory%20Sat..mp3",
            links: {
                bc: "https://laolaolao.bandcamp.com",
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
            cover: "/images/covers/coastal_acid.jpg",
            desc: "Sesión de club en vivo grabada en mayo 2026 en Drama Radio Bar (CDMX). Selección exclusiva de dubplates inéditos, edits 2026 y bass music territorial.",
            details: ["Duración: 60 min", "Grabado en vivo en CDMX", "Plataforma: SoundCloud & Radio Broadcast"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao",
            links: { sc: "https://soundcloud.com/lao" }
        },
        "mix-japan-2024": {
            id: "mix-japan-2024",
            title: "Japan Club #0131 (Brillo)",
            subtitle: "Japan Club CDMX — 2026",
            type: "LIVE BROADCAST",
            year: "2026",
            cover: "/images/covers/mix_japan.jpg",
            desc: "Set de club grabado en Japan Club CDMX en 2026. Mezcla hipnótica de acid latino y breakbeats.",
            details: ["Japan Club (CDMX)", "Serie: JAPAN CLUB #0131", "Plataforma: YouTube"],
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
            cover: "/images/covers/mix_shenzhen.jpg",
            desc: "Presentación histórica en el OIL Club de Shenzhen durante la gira por China. Una de las sesiones de club latino más intensas emitidas por Boiler Room.",
            details: ["Lugar: OIL Club, Shenzhen, China", "Evento RA: 1270626", "Plataforma: Boiler Room / YouTube"],
            streamType: "youtube",
            streamPayload: "V0Q05GhLRdc",
            links: { youtube: "https://www.youtube.com/watch?v=V0Q05GhLRdc", sc: "https://soundcloud.com/lao" }
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
            cover: "/images/covers/mix_cdmx.jpg",
            desc: "La primera transmisión masiva de Boiler Room en Ciudad de México que consagró internacionalmente al colectivo NAAFI y el sonido de Lao.",
            details: ["Ciudad de México", "Showcase: NAAFI Takeover", "Visualización en streaming mundial"],
            streamType: "youtube",
            streamPayload: "V0Q05GhLRdc",
            links: { youtube: "https://www.youtube.com/watch?v=V0Q05GhLRdc", sc: "https://soundcloud.com/lao" }
        },
        "mix-xlr8r-626": {
            id: "mix-xlr8r-626",
            title: "XLR8R Podcast 626: Lao",
            subtitle: "Podcast de Autor & Entrevista Documental",
            type: "PODCAST / DJ MIX",
            year: "2022",
            cover: "/images/covers/clasicos_vol1.jpg",
            desc: "Sesión en profundidad curada por Lao celebrando 10 años de NAAFI y su estudio en Chapultepec. Acompañada de extensa entrevista retrospectiva.",
            details: ["Plataforma: XLR8R", "Edición: Podcast 626", "Duración: 65 min"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao",
            links: { sc: "https://soundcloud.com/lao", bc: "https://laolaolao.bandcamp.com" }
        },
        "mix-yeyojungle": {
            id: "mix-yeyojungle",
            title: "Yeyojungle (Lao Bootleg)",
            subtitle: "SoundCloud Special Release — 2026",
            type: "BOOTLEG / CLUB EDIT",
            year: "2026",
            cover: "/images/covers/yeyojungle.png",
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
            cover: "/images/covers/mix_id.jpg",
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
            cover: "/images/covers/perfil.jpg",
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
            cover: "/images/projects/culebra_1.png",
            desc: "Dirección y composición musical para el performance oficial de clausura 'La Culebra' en el Arsenale de la 60ª Bienal de Arte de Venecia. Proyecto interdisciplinario en colaboración con WangShui, Alberto Bustamante, Bárbara Sánchez-Kane, La Bruja de Texcoco, Little Owl, Debit, TONO y Kuboraum. Afterparty oficial curado en COMBO Venice.",
            gallery: ["/images/projects/culebra_1.png", "/images/projects/culebra_2.png", "/images/projects/culebra_3.png"],
            details: [
                "Institución: La Biennale di Venezia (60th International Art Exhibition)",
                "Espacio: Arsenale di Venezia (Teatro alle Tese)",
                "Comisión: Composición orquestal electrónica y percusiones en vivo",
                "Artistas colaboradores: WangShui, Alberto Bustamante, Sánchez-Kane, La Bruja de Texcoco"
            ],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao",
            links: { sc: "https://soundcloud.com/lao", bc: "https://laolaolao.bandcamp.com" }
        },
        "art-tono-atlacoya": {
            id: "art-tono-atlacoya",
            title: "Festival TONO (2023) — Atlacoya: El agua triste",
            subtitle: "Zyanya (Azcapotzalco, CDMX) — Diseño Sonoro Inmersivo",
            type: "ÓPERA EXPERIMENTAL & SOUND DESIGN",
            year: "2023",
            cover: "/images/projects/atlacoya_1.jpg",
            desc: "Creación conceptual y diseño sonoro inmersivo para la ópera experimental 'Atlacoya: El agua triste del Lago de Texcoco'. Reconstrucción acústica de memorias lacustres y arqueología sonora del Valle de México.",
            gallery: ["/images/projects/atlacoya_1.jpg", "/images/projects/atlacoya_2.png"],
            details: [
                "Festival: Festival TONO de Arte Contemporáneo y Performance",
                "Lugar: Zyanya, Azcapotzalco, Ciudad de México",
                "Concepto: Ondas hidroacústicas, lamentos fónicos y síntesis sub-acuática"
            ],
            streamType: "bandcamp",
            streamPayload: "2719129759",
            links: { bc: "https://naafi.bandcamp.com", sc: "https://soundcloud.com/lao" }
        },
                "art-anahuacalli-2020": {
            id: "art-anahuacalli-2022",
            title: "Museo Anahuacalli: Noche de Museos (2022)",
            subtitle: "Cerámica Sónica & Electrónica Prehispánica",
            type: "LIVE PERFORMANCE",
            year: "2022",
            cover: "/images/covers/anahuacalli.jpg",
            desc: "Presentación especial en el Museo Anahuacalli para la Noche de Museos, explorando resonadores de barro, instrumentos mesoamericanos y síntesis algorítmica en vivo.",
            details: ["Lugar: Museo Anahuacalli, CDMX", "Fecha: 21 de enero de 2022", "Formato: Live Act Electroacústico"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao",
            links: { web: "https://www.local.mx/ciudad-de-mexico/que-hacer-en-la-cdmx-agenda-local-20-25-enero/" }
        },

        "art-basel-miami-2016": {
            id: "art-basel-miami-2016",
            title: "Art Basel Miami (2016) — 12 Hours of NAAFI",
            subtitle: "Red Bull Music Academy & Sangre",
            type: "SHOWCASE & INSTALACIÓN",
            year: "2016",
            cover: "/images/covers/basel.png",
            desc: "Extenso showcase '12 Hours of NAAFI' en el marco de Art Basel Miami 2016. Presentado por Red Bull Music Academy en colaboración con el dúo de arte Sangre. Un hito en la internacionalización de la periferia club global.",
            details: ["Evento: Art Basel Miami Beach", "Colaboradores: Sangre (Dúo de Arte) & RBMA", "Participación: Lao & Colectivo NAAFI"],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/lao",
            links: { web: "https://daily.redbullmusicacademy.com/2016/12/gallery-12-hours-of-naafi" }
        },

        "art-rbma-tokyo": {
            id: "art-rbma-tokyo",
            title: "Red Bull Music Academy Tokyo (2014)",
            subtitle: "UNIT Daikanyama — Residencia Artística Internacional",
            type: "RESIDENCIA & LIVE PERFORMANCE",
            year: "2014",
            cover: "/images/covers/rbma_tokyo.jpg",
            desc: "Participante seleccionado (Term 1) en Tokio, Japón. Laboratorios de producción musical en estudios Red Bull, grabaciones en cinta y show histórico en UNIT (Daikanyama) compartiendo escenario con Mala & Coki (Digital Mystikz).",
            details: [
                "Sede: Tokio, Japón (2014)",
                "Clubs: UNIT (Daikanyama), Circus Tokyo",
                "Broadcast: Red Bull Radio en directo a nivel global"
            ],
            streamType: "bandcamp",
            streamPayload: "3879686254",
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
            links: { sc: "https://soundcloud.com/lao", gumroad: "https://laurorobles.gumroad.com" }
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
            streamPayload: "3832246852",
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
            streamType: "direct_audio",
            streamPayload: "https://archive.org/download/filtro.016/01%20-%20Glory%20Sat..mp3",
            links: { bc: "https://laolaolao.bandcamp.com" }
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
                gumroad: "https://laurorobles.gumroad.com"
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
                gumroad: "https://laurorobles.gumroad.com"
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
                gumroad: "https://laurorobles.gumroad.com"
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
                gumroad: "https://laurorobles.gumroad.com"
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
                gumroad: "https://laurorobles.gumroad.com"
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
                gumroad: "https://laurorobles.gumroad.com"
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
            year: "2022",
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
            cover: "/images/covers/gumroad_real_clubcode1.jpg",
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
            cover: "/images/covers/gumroad_real_clubcode2.jpg",
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
            cover: "/images/covers/gumroad_real_amen.jpg",
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
            cover: "/images/covers/gumroad_real_selvakit.jpg",
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
            cover: "/images/covers/gumroad_real_capitalwobble.jpg",
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
            cover: "/images/covers/gumroad_real_spectral.jpg",
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
            cover: "/images/covers/gumroad_real_guaracha.jpg",
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
                "venice-2024-pt1": {
            id: "venice-2024-pt1",
            title: "Live Act — Biennale di Venezia 2024 (Pt. 1)",
            subtitle: "Presentación en Pabellón / Asistente Cam",
            type: "LIVE PERFORMANCE",
            year: "2024",
            cover: "https://img.youtube.com/vi/c6f3BDGNfHI/mqdefault.jpg",
            desc: "Registro en video tomado por un asistente durante la presentación en vivo de Lauro Robles en Venecia 2024, entrelazando síntesis modular y secuencias percusivas.",
            details: [
                "Lugar: Biennale di Venezia 2024",
                "Formato: Live Act Hardware"
            ],
            streamType: "youtube",
            streamPayload: "c6f3BDGNfHI",
            links: {
                youtube: "https://www.youtube.com/watch?v=c6f3BDGNfHI"
            }
        },
        "venice-2024-pt2": {
            id: "venice-2024-pt2",
            title: "Live Act — Biennale di Venezia 2024 (Pt. 2)",
            subtitle: "Presentación en Pabellón / Asistente Cam",
            type: "LIVE PERFORMANCE",
            year: "2024",
            cover: "https://img.youtube.com/vi/cVxSdlLuH1Q/mqdefault.jpg",
            desc: "Segunda parte del registro en video de la presentación en Venecia 2024.",
            details: [
                "Lugar: Biennale di Venezia 2024",
                "Formato: Live Act Hardware"
            ],
            streamType: "youtube",
            streamPayload: "cVxSdlLuH1Q",
            links: {
                youtube: "https://www.youtube.com/watch?v=cVxSdlLuH1Q"
            }
        },

        /* =========================================================
           PRESS ARCHIVE & INTERVIEWS
           ========================================================= */
                "press-forbes": {
            id: "press-forbes",
            title: "N.A.A.F.I: La fiesta periférica infinita",
            subtitle: "Forbes México",
            type: "ARTÍCULO DE PRENSA",
            year: "2016",
            cover: "/images/covers/perfil.jpg",
            desc: "Reportaje especial en Forbes México sobre el crecimiento y modelo autogestivo del colectivo NAAFI. Analizan cómo transformaron la periferia musical de la Ciudad de México en un movimiento global de club.",
            details: [
                "Publicación: Forbes México",
                "Fecha: 2016",
                "Temas: Modelo de negocio, música independiente, globalización cultural"
            ],
            streamType: null,
            streamPayload: null,
            links: {
                web: "https://forbes.com.mx/n-a-a-f-i-la-fiesta-periferia-infinita/"
            }
        },

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
            streamPayload: "Qe2Bcp0-OZc",
            links: {
                youtube: "https://www.youtube.com/watch?v=Qe2Bcp0-OZc",
                web: "https://durolabel.com"
            }
        },
        "press-crack-mag": {
            id: "press-crack-mag",
            title: "Crack Magazine: Subverting the Mexican Underground",
            subtitle: "Long Read Profile & Career Retrospective",
            type: "ENTREVISTA / LONG READ",
            year: "2022",
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
            year: "2022",
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
            year: "2022",
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
            cover: "https://img.youtube.com/vi/Qe2Bcp0-OZc/mqdefault.jpg",
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
        "press-world-map-hub": {
            id: "press-world-map-hub",
            title: "Radar Mundial de Giras: 62 Ciudades en 5 Continentes",
            subtitle: "Cartografía de Presentaciones, Residencias y Festivales (2010–2026)",
            type: "CARTOGRAFÍA GLOBAL DE GIRAS",
            year: "2010–2026",
            cover: "/images/covers/catedral.jpg",
            desc: "Registro geográfico y telemetría de presentaciones en vivo de Lauro Robles (Lao). Mapeo de más de 62 metrópolis en América del Norte, Sudamérica, Europa Occidental y del Este, y Asia Oriental.",
            details: [
                "Nodos Principales: CDMX (Ground Zero), Tokio, Berlín, Barcelona, Nueva York, Montreal, Londres, Shanghái, Bogotá, Buenos Aires",
                "Templos de Clubbing: Berghain (Säule), Sónar (SónarDome/RBMA), MUTEK Montreal, MoMA PS1 Warm Up NYC, CTM Festival, Circus Tokyo, ALL Beijing, OIL Shenzhen, FINAL Taipei",
                "Formatos: Live Sets Modulares, DJ Sets Híbridos, Conferencias y Talleres de Producción",
                "Motor Cartográfico: Leaflet.js con coordenadas geodésicas de alta definición y proyección CartoDB Dark Matter"
            ],
            streamType: "soundcloud",
            streamPayload: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lao/tracks&color=%2300ffff&auto_play=false&hide_related=true",
            links: {
                web: "https://laurorobles.github.io"
            }
        },
        "video-the-lot-radio": {
            id: "video-the-lot-radio",
            title: "The Lot Radio NYC: Rendezvous with Lao Naafi",
            subtitle: "Live DJ Set from Greenpoint, Brooklyn (2023)",
            type: "VIDEO EN DIRECTO",
            year: "2023",
            cover: "https://img.youtube.com/vi/Qe2Bcp0-OZc/mqdefault.jpg",
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
        },
        "video-gaika-lao": {
            id: "video-gaika-lao",
            title: "Gaika & Lao: Improvised Set (Club de Playa NAAFI)",
            subtitle: "Live Collaboration Session",
            type: "VIDEO EN DIRECTO",
            year: "2022",
            cover: "https://img.youtube.com/vi/oHOjKJWWL3Q/mqdefault.jpg",
            desc: "Colisión sónica en vivo entre Gaika (UK) y Lauro Robles durante la residencia Club de Playa NAAFI, combinando dancehall deconstruido, noise e improvisación electrónica.",
            details: [
                "Artistas: Gaika & Lao",
                "Plataforma: NAAFI / YouTube",
                "Formato: Live Improvised Session"
            ],
            streamType: "youtube",
            streamPayload: "oHOjKJWWL3Q",
            links: {
                youtube: "https://www.youtube.com/watch?v=oHOjKJWWL3Q"
            }
        },
        "video-comunite": {
            id: "video-comunite",
            title: "Lao Live @ Festival Comunite (México)",
            subtitle: "Main Stage Live Festival Recording",
            type: "FESTIVAL EN VIVO",
            year: "2022",
            cover: "https://img.youtube.com/vi/cX6LZB6L6Aw/mqdefault.jpg",
            desc: "Grabación en vivo desde el Festival Comunite explorando ritmos sincopados, dembow mutante y bass híbrido de club.",
            details: [
                "Festival: Comunite 2022",
                "Ubicación: México",
                "Plataforma: YouTube"
            ],
            streamType: "youtube",
            streamPayload: "cX6LZB6L6Aw",
            links: {
                youtube: "https://www.youtube.com/watch?v=cX6LZB6L6Aw"
            }
        },
        "video-satelite-030": {
            id: "video-satelite-030",
            title: "Satélite / Despacho de Proyectos: Mixtape #030",
            subtitle: "Curaduría Sonora por Lauro Robles",
            type: "CURADURÍA SONORA",
            year: "2021",
            cover: "https://img.youtube.com/vi/h4WzFRpKdTk/mqdefault.jpg",
            desc: "Curaduría experimental y viaje auditivo desarrollado por Lauro Robles para el archivo cultural Satélite en la Ciudad de México.",
            details: [
                "Proyecto: Satélite / Despacho de Proyectos",
                "Episodio: Mixtape #030",
                "Plataforma: Satélite / YouTube"
            ],
            streamType: "youtube",
            streamPayload: "h4WzFRpKdTk",
            links: {
                youtube: "https://www.youtube.com/watch?v=h4WzFRpKdTk"
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
        
        const inspGallery = document.getElementById('insp-gallery');
        if (inspGallery) {
            inspGallery.innerHTML = '';
            if (item.gallery && item.gallery.length > 0) {
                inspGallery.classList.remove('hidden');
                item.gallery.forEach(imgSrc => {
                    const img = document.createElement('img');
                    img.src = imgSrc;
                    img.className = 'w-full h-auto object-cover border border-[var(--circuit)]';
                    inspGallery.appendChild(img);
                });
            } else {
                inspGallery.classList.add('hidden');
            }
        }

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
                    playerIframe.src = `https://bandcamp.com/EmbeddedPlayer/${bcParam}/size=large/bgcol=070012/linkcol=00ffff/tracklist=false/artwork=small/transparent=true/`;
                } else if (item.streamType === 'youtube') {
                    playerIframe.src = `https://www.youtube-nocookie.com/embed/${item.streamPayload}${item.streamPayload.includes("?") ? "&" : "?"}autoplay=1&enablejsapi=1`;
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
        const iframe = document.getElementById('omni-player-iframe');
        if (isAudioPlaying) {
            isAudioPlaying = false;
            if (omniHtml5Audio && omniHtml5Audio.src) omniHtml5Audio.pause();
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                iframe.contentWindow.postMessage('{"method":"pause"}', '*');
            }
            if (btnPlayerPlayPause) btnPlayerPlayPause.innerText = '▶ PLAY';
            printTerminal('[AUDIO] Playback paused.');
        } else {
            isAudioPlaying = true;
            if (omniHtml5Audio && omniHtml5Audio.src) omniHtml5Audio.play();
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                iframe.contentWindow.postMessage('{"method":"play"}', '*');
            }
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
            videoHeroIframe.src = `https://www.youtube-nocookie.com/embed/${ytId}${ytId.includes("?") ? "&" : "?"}autoplay=${autoPlay ? 1 : 0}`;
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
                pedYtIframe.src = `https://www.youtube-nocookie.com/embed/${ytId}${ytId.includes("?") ? "&" : "?"}autoplay=1`;
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
    const sigilNameEl = document.getElementById('sigil-name');
    const sigilMeaningEl = document.getElementById('sigil-meaning');

    const NAHUAL_SYLLABLES = ["XOL", "TEZ", "MICT", "COA", "TLOC", "ITZ", "PAK", "YOL", "NAH", "CIP", "EHE", "CALL", "ATL", "TEC"];
    const CYBER_SUFFIXES = [".SYS", "-PRIME", "_0x", ".HEX", " V.9", ".DLL", "-CORE", "-VOID"];
    const CCRU_LORE = [
        "Un catalizador hipersticional de baja latencia.",
        "Ancla la voluntad del usuario a través del tejido espaciotemporal.",
        "Descodifica las arquitecturas de represión impuestas por la matriz.",
        "Acelera la desterritorialización del deseo a nivel subconsciente.",
        "Vórtice lemuriano diseñado para evadir algoritmos de control.",
        "Funciona como un escudo psicodinámico contra egregores parasitarios.",
        "Despierta resonancias tonales ocultas en el ruido blanco de la red."
    ];

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
        
        const hashVal = Math.abs(raw.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0));
        const hashEl = document.getElementById('sigil-code-hash');
        if (hashEl) hashEl.innerText = `#TOPY-` + (hashVal.toString(16).toUpperCase());

        // Generate Name
        const s1 = NAHUAL_SYLLABLES[hashVal % NAHUAL_SYLLABLES.length];
        const s2 = NAHUAL_SYLLABLES[(hashVal >> 2) % NAHUAL_SYLLABLES.length];
        const suf = CYBER_SUFFIXES[(hashVal >> 4) % CYBER_SUFFIXES.length];
        const generatedName = `${s1}${s2}${suf}`;
        if (sigilNameEl) sigilNameEl.innerText = generatedName;

        // Generate Meaning
        const lore = CCRU_LORE[hashVal % CCRU_LORE.length];
        if (sigilMeaningEl) {
            sigilMeaningEl.innerHTML = `<strong>TIPO:</strong> Ciber-Nagual de Intención<br><strong>FUNCIÓN:</strong> ${lore}<br><strong>CÓDICE:</strong> Operación sigilizada basada en ${uniqueConsonants.replace(/\s+/g, '').length} nodos de consonantes.`;
        }

        // Clear canvas with deep black
        ctx.fillStyle = '#05000A'; // Darkest purple/black
        ctx.fillRect(0, 0, sigilCanvas.width, sigilCanvas.height);

        const cx = sigilCanvas.width / 2;
        const cy = sigilCanvas.height / 2;
        const r = 160;

        // 1. Numogram / Mesoamerican Sacred Ring Background
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for(let i=0; i<9; i++) {
            let a = (i/9) * Math.PI * 2;
            let nx = cx + Math.cos(a) * r;
            let ny = cy + Math.sin(a) * r;
            ctx.moveTo(cx, cy);
            ctx.lineTo(nx, ny);
            ctx.arc(nx, ny, 3, 0, Math.PI*2);
        }
        ctx.stroke();

        ctx.strokeStyle = 'rgba(230, 0, 122, 0.2)';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(cx, cy, r - 30, 0, Math.PI * 2);
        ctx.stroke();

        const letters = uniqueConsonants.replace(/\s+/g, '').split('');
        if (letters.length === 0) return;

        // Chaos Magic Node Mapping
        const points = letters.map((char, i) => {
            const code = char.charCodeAt(0) - 65;
            // Map code (0-25) to a 9-point radial grid + inner radii
            const angle = ((code % 9) / 9) * Math.PI * 2; // Strict Numogram snap
            const radius = 30 + ((code * 17) % (r - 40));
            return {
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius
            };
        });

        // Interconnected Sigil Geometry
        ctx.lineWidth = 3.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#E6007A';
        ctx.shadowColor = '#E6007A';
        ctx.shadowBlur = 15;

        // Draw the sigil line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            // Bezier curve to make it look magical and less jagged
            const prev = points[i - 1];
            const curr = points[i];
            const cp1x = prev.x + (curr.x - prev.x) * 0.2;
            const cp1y = prev.y + (curr.y - prev.y) * 0.8;
            ctx.quadraticCurveTo(cp1x, cp1y, curr.x, curr.y);
        }
        ctx.stroke();

        // Start circle (Chaos magic standard)
        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#05000A';
        ctx.fill();

        // End line (Chaos magic standard)
        const lastP = points[points.length - 1];
        ctx.beginPath();
        ctx.moveTo(lastP.x - 12, lastP.y - 12);
        ctx.lineTo(lastP.x + 12, lastP.y + 12);
        ctx.moveTo(lastP.x - 12, lastP.y + 12);
        ctx.lineTo(lastP.x + 12, lastP.y - 12);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#00FFFF';
        ctx.shadowColor = '#00FFFF';
        ctx.stroke();

        ctx.shadowBlur = 0;
    }

    if (btnForgeSigil && sigilInput) {
        btnForgeSigil.addEventListener('click', () => {
            forgeSigil(sigilInput.value);
            printTerminal(`[SIGIL] New glyph forged: ${sigilInput.value}`);
        });
        
        // Allow pressing Enter
        sigilInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                forgeSigil(sigilInput.value);
                printTerminal(`[SIGIL] New glyph forged: ${sigilInput.value}`);
            }
        });
    }

    if (btnChargeSigil && sigilCanvas) {
        btnChargeSigil.addEventListener('click', () => {
            sigilCanvas.classList.add('sigil-charging');
            const world = document.getElementById('world');
            if (world) world.classList.add('matrix-flash-active');
            playNoiseBurst();
            setTimeout(() => {
                sigilCanvas.classList.remove('sigil-charging');
                if (world) world.classList.remove('matrix-flash-active');
            }, 600);
            printTerminal('[SIGIL] Glyph energized. Will charged into the subconscious matrix.');
        });
    }

    if (btnBurnSigil && sigilCanvas) {
        btnBurnSigil.addEventListener('click', () => {
            sigilCanvas.classList.add('sigil-banishing');
            setTimeout(() => {
                const ctx = sigilCanvas.getContext('2d');
                ctx.fillStyle = '#05000A';
                ctx.fillRect(0, 0, sigilCanvas.width, sigilCanvas.height);
                sigilCanvas.classList.remove('sigil-banishing');
                if (sigilConsonantsEl) sigilConsonantsEl.innerText = 'BANISHED // DISOLVED';
                if (sigilNameEl) sigilNameEl.innerText = '---';
                if (sigilMeaningEl) sigilMeaningEl.innerText = 'El sigilo ha sido destruido y devuelto al flujo primordial.';
                const hashEl = document.getElementById('sigil-code-hash');
                if (hashEl) hashEl.innerText = '#N/A';
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
                - <b>map</b> / <b>radar</b>: Abrir el radar interactivo de giras mundiales (62 ciudades)<br>
                - <b>open all</b> / <b>open closeall</b>: Abrir o cerrar todas las ventanas<br>
                - <b>cd [bio|music|radar|mixes|art|plugins|pedagogy|services|videos|oracle|terminal|labyrinth|contact|sigil|press]</b><br>
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
                const newLang = currentLang === 'es' ? 'en' : 'es';
                applyLanguage(newLang);
                printTerminal(`Language switched to: ${newLang.toUpperCase()}`);
                break;

            case 'open':
                if (args[1] === 'all') {
                    document.querySelectorAll('.drag-window').forEach(w => w.style.display = 'flex');
                    document.querySelectorAll('.dock-item[data-target]').forEach(b => b.classList.add('dock-active'));
                    syncOpenAllButtons();
                    updateCables();
                    printTerminal('[SYS] All windows opened.');
                } else if (args[1] === 'closeall') {
                    document.querySelectorAll('.drag-window').forEach(w => w.style.display = 'none');
                    document.querySelectorAll('.dock-item[data-target]').forEach(b => b.classList.remove('dock-active'));
                    syncOpenAllButtons();
                    updateCables();
                    printTerminal('[SYS] All windows closed.');
                }
                break;

            case 'map':
            case 'mapa':
            case 'radar':
            case 'tour':
            case 'giras':
            case 'ciudades':
                openWindow('win-radar', true);
                initWorldRadar();
                printTerminal('[NAV] Mounted and navigated to WORLD TOUR RADAR [62 CITIES].');
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
                    'bio': 'win-bio', 'music': 'win-music', 'radar': 'win-radar',
                    'map': 'win-radar', 'mapa': 'win-radar', 'tour': 'win-radar',
                    'mixes': 'win-mixes', 'art': 'win-art', 'plugins': 'win-plugins',
                    'pedagogy': 'win-pedagogy', 'services': 'win-services', 'videos': 'win-videos',
                    'oracle': 'win-oracle', 'terminal': 'win-terminal', 'labyrinth': 'win-labyrinth',
                    'contact': 'win-contact', 'sigil': 'win-sigil', 'press': 'win-press'
                };
                if (windowMap[args[1]]) {
                    openWindow(windowMap[args[1]], true);
                    if (windowMap[args[1]] === 'win-radar') initWorldRadar();
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
       12. WORLD TOUR RADAR EVENT BUS & QUICK LAUNCHERS
       ========================================================= */
    document.querySelectorAll('.btn-open-world-radar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openWindow('win-radar', true);
            initWorldRadar();
        });
    });

    const WORLD_TOUR_CITIES = [
        // --- 🚍 GIRAS / TOURS ---
        {
            id: 'naafi_sd',
            name: 'San Diego (NAAFI Tour)',
            country: 'USA',
            region: 'giras',
            lat: 32.7157,
            lon: -117.1611,
            years: 'SEP 2014',
            venue: 'The Bancroft',
            dossier: 'NAAFI USA Tour. Gira fundacional de club periférico junto a Paul Marmota y Mexican Jihad.',
            image: '/images/covers/naafi_2014.webp'
        },
        {
            id: 'naafi_la',
            name: 'Los Angeles (NAAFI Tour)',
            country: 'USA',
            region: 'giras',
            lat: 34.0522,
            lon: -118.2437,
            years: 'SEP 2014',
            venue: 'La Cita / 356 Mission',
            dossier: 'Fechas dobles en Mustache Mondays (La Cita) y 356 Mission.',
            image: '/images/covers/naafi_2014.webp'
        },
        {
            id: 'naafi_fresno',
            name: 'Fresno (NAAFI Tour)',
            country: 'USA',
            region: 'giras',
            lat: 36.7378,
            lon: -119.7871,
            years: 'SEP 2014',
            venue: 'Smokescreen (Secret Location)',
            dossier: 'Showcase clandestino.',
            image: '/images/covers/naafi_2014.webp'
        },
        {
            id: 'naafi_sf',
            name: 'San Francisco (NAAFI Tour)',
            country: 'USA',
            region: 'giras',
            lat: 37.7749,
            lon: -122.4194,
            years: 'SEP 2014',
            venue: 'Elbo Room (Tormenta Tropical)',
            dossier: 'Debut en la bahía incursionando en la escena de Tormenta Tropical.',
            image: '/images/covers/naafi_2014.webp'
        },
        {
            id: 'naafi_portland',
            name: 'Portland (NAAFI Tour)',
            country: 'USA',
            region: 'giras',
            lat: 45.5152,
            lon: -122.6784,
            years: 'SEP 2014',
            venue: 'Holocene / 23 NW 3rd Ave',
            dossier: 'Cierre de gira con doble show: Club Chemtrail y Black Book Fridays.',
            image: '/images/covers/naafi_2014.webp'
        },

        // --- 🇲🇽 MÉXICO (NÚCLEO & NACIONAL) ---
        {
            id: 'cdmx',
            name: 'Ciudad de México',
            country: 'México',
            region: 'mexico',
            lat: 19.4326,
            lon: -99.1332,
            isHQ: true,
            years: '2004–PRESENTE [NÚCLEO]',
            venue: 'Ground Zero // Estudio Chapultepec, Boiler Room, Festival TONO, Sónar México, MUTEK MX',
            dossier: 'Centro neurálgico de operaciones de Lauro Robles. Cuartel general de NAAFI y Extasis Records.'
        },
        {
            id: 'tijuana',
            name: 'Tijuana',
            country: 'México',
            region: 'mexico',
            lat: 32.5149,
            lon: -117.0382,
            years: '2011–2024',
            venue: 'Border Clubbing // Pasaje Rodríguez, Mija, Club Underground',
            dossier: 'Pilar del clubbing transfronterizo y primeros intercambios NAAFI en la frontera norte.'
        },
        {
            id: 'monterrey',
            name: 'Monterrey',
            country: 'México',
            region: 'mexico',
            lat: 25.6866,
            lon: -100.3161,
            years: '2010–2023',
            venue: 'Epicentro Tribal // TopazDeluxe, Nodriza, Foros Independientes',
            dossier: 'Conexión fundacional con los pioneros del tribal guarachero y aceleración de pistas regias.'
        },
        {
            id: 'guadalajara',
            name: 'Guadalajara',
            country: 'México',
            region: 'mexico',
            lat: 20.6597,
            lon: -103.3496,
            years: '2009–2024',
            venue: 'Bar Americas, Foro Independencia, Festival NRMAL GDL',
            dossier: 'Residencias de club y noches legendarias en el templo de la electrónica tapatía Bar Americas.'
        },
        {
            id: 'puebla',
            name: 'Puebla',
            country: 'México',
            region: 'mexico',
            lat: 19.0414,
            lon: -98.2063,
            years: '2012–2023',
            venue: 'Cholula Underground, Diente de León, Foros de Arte',
            dossier: 'Presentaciones en el circuito universitario y de clubbing alternativo de Puebla y Cholula.'
        },
        {
            id: 'leon',
            name: 'León',
            country: 'México',
            region: 'mexico',
            lat: 21.1221,
            lon: -101.6827,
            years: '2013–2022',
            venue: 'Bajío Club Nights, Warehouses del Bajío',
            dossier: 'Exploración de pistas industriales y cultura de warehouse en el Bajío mexicano.'
        },
        {
            id: 'oaxaca',
            name: 'Oaxaca',
            country: 'México',
            region: 'mexico',
            lat: 17.0732,
            lon: -96.7266,
            years: '2014–2024',
            venue: 'Txalaparta, Espacios Culturales, Fiestas de Vanguardia',
            dossier: 'Intersección entre tradiciones sonoras ancestrales, textiles, mezcal y bass futurista.'
        },
        {
            id: 'puerto_escondido',
            name: 'Puerto Escondido',
            country: 'México',
            region: 'mexico',
            lat: 15.8624,
            lon: -97.0694,
            years: '2016–2024',
            venue: 'Boiler Room Puerto Escondido (NAAFI Beach Showcase)',
            dossier: 'Sesión histórica frente al Pacífico que proyectó el clubbing mexicano mundialmente.'
        },
        {
            id: 'cd_juarez',
            name: 'Ciudad Juárez',
            country: 'México',
            region: 'mexico',
            lat: 31.6904,
            lon: -106.4245,
            years: '2012–2021',
            venue: 'Border Bass Sessions, Clubbing Fronterizo',
            dossier: 'Intercambio sónico bilateral en la frontera con El Paso, desafiando estigmas territoriales.'
        },

        // --- 🇺🇸 🇨🇦 NORTEAMÉRICA (USA & CANADÁ) ---
        {
            id: 'nyc',
            name: 'Nueva York',
            country: 'EE. UU.',
            region: 'north_america',
            lat: 40.7128,
            lon: -74.0060,
            years: '2014–2023',
            venue: 'The Lot Radio (Brooklyn), MoMA PS1 Warm Up, Good Room, Bossa Nova Civic Club',
            dossier: 'Transmisión exclusiva para The Lot Radio, residencias en Brooklyn y MoMA PS1.'
        },
        {
            id: 'la',
            name: 'Los Ángeles',
            country: 'EE. UU.',
            region: 'north_america',
            lat: 34.0522,
            lon: -118.2437,
            years: '2013–2024',
            venue: 'The Echo, Low End Theory, 1720, Dublab Radio Sessions',
            dossier: 'Presentaciones en el templo del beat Low End Theory y colaboraciones con Dome Of Doom.'
        },
        {
            id: 'sf',
            name: 'San Francisco',
            country: 'EE. UU.',
            region: 'north_america',
            lat: 37.7749,
            lon: -122.4194,
            years: '2014–2022',
            venue: '1015 Folsom, F8, Public Works',
            dossier: 'Showcases de club music vanguardista en el distrito de SoMa y Mission.'
        },
        {
            id: 'chicago',
            name: 'Chicago',
            country: 'EE. UU.',
            region: 'north_america',
            lat: 41.8781,
            lon: -87.6298,
            years: '2015–2023',
            venue: 'Smartbar Chicago, Empty Bottle',
            dossier: 'Diálogo directo con la cuna del house y juke/footwork en Smartbar.'
        },
        {
            id: 'austin',
            name: 'Austin',
            country: 'EE. UU.',
            region: 'north_america',
            lat: 30.2672,
            lon: -97.7431,
            years: '2015, 2023',
            venue: 'Club Eternal (Nikki Nair & Lao), SXSW Showcases',
            dossier: 'Noche de vanguardia en Club Eternal e incursiones oficiales en SXSW.'
        },
        {
            id: 'houston',
            name: 'Houston',
            country: 'EE. UU.',
            region: 'north_america',
            lat: 29.7604,
            lon: -95.3698,
            years: '2016–2022',
            venue: 'Walter’s Downtown, Warehouse Live',
            dossier: 'Conexión tejana con el chopped and screwed y ritmos sincopados de club.'
        },
        {
            id: 'dallas',
            name: 'Dallas',
            country: 'EE. UU.',
            region: 'north_america',
            lat: 32.7767,
            lon: -96.7970,
            years: '2016–2022',
            venue: 'Deep Ellum Club Nights, It’ll Do Club',
            dossier: 'Fechas de club en el distrito cultural de Deep Ellum.'
        },
        {
            id: 'denver',
            name: 'Denver',
            country: 'EE. UU.',
            region: 'north_america',
            lat: 39.7392,
            lon: -104.9903,
            years: '2017–2023',
            venue: 'Black Box Denver, Club Vinyl',
            dossier: 'Sesiones de bajo profundo en el templo de sound-system culture The Black Box.'
        },
        {
            id: 'portland',
            name: 'Portland',
            country: 'EE. UU.',
            region: 'north_america',
            lat: 45.5152,
            lon: -122.6784,
            years: '2016–2021',
            venue: 'Holocene Portland, 45 East',
            dossier: 'Presentaciones en el noroeste del Pacífico explorando síntesis y ritmos latinos.'
        },
        {
            id: 'san_diego',
            name: 'San Diego',
            country: 'EE. UU.',
            region: 'north_america',
            lat: 32.7157,
            lon: -117.1611,
            years: '2013–2023',
            venue: 'Spin Nightclub, Casbah, Kava Lounge',
            dossier: 'Circuito costero californiano en enlace constante con la escena de Tijuana.'
        },
        {
            id: 'fresno',
            name: 'Fresno',
            country: 'EE. UU.',
            region: 'north_america',
            lat: 36.7468,
            lon: -119.7726,
            years: '2016',
            venue: 'Central Valley Warehouse Sessions',
            dossier: 'Presentaciones en el Valle Central de California con comunidad chicana e independiente.'
        },
        {
            id: 'el_paso',
            name: 'El Paso',
            country: 'EE. UU.',
            region: 'north_america',
            lat: 31.7619,
            lon: -106.4850,
            years: '2014–2023',
            venue: 'Lowbrow Palace, Neon Desert Music Festival',
            dossier: 'Conexión hermana con Ciudad Juárez y fechas estelares en Lowbrow Palace.'
        },
        {
            id: 'atlanta',
            name: 'Atlanta',
            country: 'EE. UU.',
            region: 'north_america',
            lat: 33.7490,
            lon: -84.3880,
            years: '2017–2022',
            venue: 'Aisle 5, The Sound Table',
            dossier: 'Enlace con el bass music del sur de EE. UU. y el epicentro de la producción urbana.'
        },
        {
            id: 'des_moines',
            name: 'Des Moines',
            country: 'EE. UU.',
            region: 'north_america',
            lat: 41.5868,
            lon: -93.6250,
            years: '2018',
            venue: 'Wooly’s, Vaudeville Mews',
            dossier: 'Incursión en el Midwest estadounidense abriendo brecha para el Latin Club.'
        },
        {
            id: 'montreal',
            name: 'Montreal',
            country: 'Canadá',
            region: 'north_america',
            lat: 45.5017,
            lon: -73.5673,
            years: '2017',
            venue: 'MUTEK Montréal (Société des Arts Technologiques - SAT)',
            dossier: 'NAAFI Showcase norteamericano en la cúpula satelital de MUTEK Montréal.'
        },
        {
            id: 'toronto',
            name: 'Toronto',
            country: 'Canadá',
            region: 'north_america',
            lat: 43.6532,
            lon: -79.3832,
            years: '2017, 2019',
            venue: 'The Drake Underground, CODA Toronto',
            dossier: 'Showcases de club contemporáneo en la metrópoli canadiense.'
        },

        // --- 🇪🇺 EUROPA (21 CIUDADES) ---
        {
            id: 'barcelona',
            name: 'Barcelona',
            country: 'España',
            region: 'europe',
            lat: 41.3851,
            lon: 2.1734,
            years: '2015, 2016, 2017',
            venue: 'Sónar Barcelona (SónarDome 2015 & 2017), Razzmatazz (TRILL), Boiler Room',
            dossier: 'Debut Catedral EP en solitario (2015), cierre b2b NAAFI (2017) y noches TRILL.'
        },
        {
            id: 'madrid',
            name: 'Madrid',
            country: 'España',
            region: 'europe',
            lat: 40.4168,
            lon: -3.7038,
            years: '2015–2022',
            venue: 'Sala Caracol, Siroco, Cha Chá The Club',
            dossier: 'Noches míticas en la capital española desarticulando el clubbing tradicional.'
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
            id: 'paris',
            name: 'París',
            country: 'Francia',
            region: 'europe',
            lat: 48.8566,
            lon: 2.3522,
            years: '2016–2022',
            venue: 'La Gaîté Lyrique, Rex Club, Badaboum',
            dossier: 'Showcases de vanguardia en el centro de artes digitales de París y clubes de culto.'
        },
        {
            id: 'lyon',
            name: 'Lyon',
            country: 'Francia',
            region: 'europe',
            lat: 45.7640,
            lon: 4.8357,
            years: '2016–2021',
            venue: 'Le Sucre, Nuits Sonores Satellite Sessions',
            dossier: 'Presentaciones en el rooftop de Le Sucre y foros de música electrónica lionesa.'
        },
        {
            id: 'grenoble',
            name: 'Grenoble',
            country: 'Francia',
            region: 'europe',
            lat: 45.1885,
            lon: 5.7245,
            years: '2016',
            venue: 'Le Belle Électrique, Grenoble Club Nights',
            dossier: 'Fecha en los Alpes franceses con enfoque en bajo pesado y síntesis modular.'
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
            id: 'londres',
            name: 'Londres',
            country: 'Reino Unido',
            region: 'europe',
            lat: 51.5074,
            lon: -0.1278,
            years: '2016–2022',
            venue: 'Corsica Studios, La Línea Festival, NTS Radio Live',
            dossier: 'Corsica Studios en Elephant & Castle y retransmisiones directas en NTS Radio.'
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
            id: 'turin',
            name: 'Turín',
            country: 'Italia',
            region: 'europe',
            lat: 45.0703,
            lon: 7.6869,
            years: '2017',
            venue: 'Club To Club Satellite, Spazio 211',
            dossier: 'Presentaciones en el epicentro industrial y experimental del Piamonte italiano.'
        },
        {
            id: 'milan',
            name: 'Milán',
            country: 'Italia',
            region: 'europe',
            lat: 45.4642,
            lon: 9.1900,
            years: '2017–2023',
            venue: 'Macao Milano, Tunnel Club',
            dossier: 'Noche de resistencia en el centro autónomo de arte y sonido Macao.'
        },
        {
            id: 'amsterdam',
            name: 'Ámsterdam',
            country: 'Países Bajos',
            region: 'europe',
            lat: 52.3676,
            lon: 4.9041,
            years: '2016–2022',
            venue: 'De School (ADE), Melkweg, Red Light Radio',
            dossier: 'Presentaciones en Amsterdam Dance Event (ADE) y transmisión en Red Light Radio.'
        },
        {
            id: 'la_haya',
            name: 'La Haya',
            country: 'Países Bajos',
            region: 'europe',
            lat: 52.0705,
            lon: 4.3007,
            years: '2016',
            venue: 'Rewire Festival Club Sessions, PIP Den Haag',
            dossier: 'Encuentro con la vanguardia electro holandesa y cultura de sintetizadores.'
        },
        {
            id: 'zurich',
            name: 'Zúrich',
            country: 'Suiza',
            region: 'europe',
            lat: 47.3769,
            lon: 8.5417,
            years: '2016–2022',
            venue: 'Zukunft, Rote Fabrik',
            dossier: 'Noches en el club de culto Zukunft y el centro cultural Rote Fabrik.'
        },
        {
            id: 'geneva',
            name: 'Ginebra',
            country: 'Suiza',
            region: 'europe',
            lat: 46.2044,
            lon: 6.1432,
            years: '2016',
            venue: 'Usine Genève (Le Zoo)',
            dossier: 'Sesión de alto voltaje en el legendario complejo cultural L’Usine.'
        },
        {
            id: 'bern',
            name: 'Berna',
            country: 'Suiza',
            region: 'europe',
            lat: 46.9480,
            lon: 7.4474,
            years: '2016',
            venue: 'Dampfzentrale Bern, Reitschule',
            dossier: 'Foros de arte escénico y música contemporánea en la capital suiza.'
        },
        {
            id: 'st_gallen',
            name: 'St. Gallen',
            country: 'Suiza',
            region: 'europe',
            lat: 47.4245,
            lon: 9.3767,
            years: '2016',
            venue: 'Grabenhalle St. Gallen',
            dossier: 'Espacio histórico de cultura alternativa en Suiza oriental.'
        },
        {
            id: 'porto',
            name: 'Porto',
            country: 'Portugal',
            region: 'europe',
            lat: 41.1579,
            lon: -8.6291,
            years: '2016–2021',
            venue: 'Passos Manuel, Gare Porto',
            dossier: 'Conexión lusa con el kuduro, batida y la vanguardia electrónica del norte de Portugal.'
        },
        {
            id: 'lisboa',
            name: 'Lisboa',
            country: 'Portugal',
            region: 'europe',
            lat: 38.7223,
            lon: -9.1393,
            years: '2016–2023',
            venue: 'Musicbox Lisboa, Lux Frágil Sessions',
            dossier: 'Intercambio directo en Musicbox con el sonido afro-portugués de Príncipe Discos.'
        },
        {
            id: 'vienna',
            name: 'Viena',
            country: 'Austria',
            region: 'europe',
            lat: 48.2082,
            lon: 16.3738,
            years: '2016–2022',
            venue: 'Grelle Forelle, Fluc Wanne',
            dossier: 'Bajos profundos a orillas del canal del Danubio en Grelle Forelle.'
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

        // --- 🌏 ASIA & MEDIO ORIENTE (9 CIUDADES) ---
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
            id: 'osaka',
            name: 'Osaka',
            country: 'Japón',
            region: 'asia',
            lat: 34.6937,
            lon: 135.5023,
            years: '2017, 2019',
            venue: 'Circus Osaka, Club Daphnia',
            dossier: 'Fechas de club en Kansai con la comunidad bass y juke de Osaka.'
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
            id: 'hong_kong',
            name: 'Hong Kong',
            country: 'China',
            region: 'asia',
            lat: 22.3193,
            lon: 114.1694,
            years: '2019',
            venue: '宀 Club (Mihn Club), Social Room',
            dossier: 'Noche de vanguardia en la isla de Hong Kong para la escena de clubbing asiática.'
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
            id: 'new_delhi',
            name: 'Nueva Delhi',
            country: 'India',
            region: 'asia',
            lat: 28.6139,
            lon: 77.2090,
            years: '2018',
            venue: 'Auro Kitchen & Bar, Boxout.fm Sessions',
            dossier: 'Gira por el subcontinente indio y sesión grabada para Boxout.fm en Nueva Delhi.'
        },

        // --- 🌎 SUDAMÉRICA (7 CIUDADES) ---
        {
            id: 'bogota',
            name: 'Bogotá',
            country: 'Colombia',
            region: 'south_america',
            lat: 4.7110,
            lon: -74.0721,
            years: '2015–2023',
            venue: 'Festival Estéreo Picnic, Video Club, Baum Bogotá',
            dossier: 'Presentaciones masivas en Estéreo Picnic y residencias en Video Club Bogotá.'
        },
        {
            id: 'medellin',
            name: 'Medellín',
            country: 'Colombia',
            region: 'south_america',
            lat: 6.2442,
            lon: -75.5812,
            years: '2016–2023',
            venue: 'Calle 9+, Mansion Club, Fiestas de Perreo Mutante',
            dossier: 'Diálogo directo con los productores de reggaetón y techno de la capital antioqueña.'
        },
        {
            id: 'lima',
            name: 'Lima',
            country: 'Perú',
            region: 'south_america',
            lat: -12.0464,
            lon: -77.0428,
            years: '2014–2022',
            venue: 'Matacandela, Fiestas Dengue Dengue Dengue!, Cumbia Psicodélica',
            dossier: 'Hermandad con la escena peruana de cumbia digital y bass andino.'
        },
        {
            id: 'oxapampa',
            name: 'Oxapampa',
            country: 'Perú',
            region: 'south_america',
            lat: -10.5756,
            lon: -75.4018,
            years: '2015',
            venue: 'Festival Selvámonos (Selva Central del Perú)',
            dossier: 'Showcase en el festival amazónico que conecta ecología, ritmos de selva y clubbing.'
        },
        {
            id: 'santiago',
            name: 'Santiago',
            country: 'Chile',
            region: 'south_america',
            lat: -33.4489,
            lon: -70.6693,
            years: '2014–2023',
            venue: 'Club Subterráneo, NAAFI Cono Sur Sessions, Imaabs Collabs',
            dossier: 'Alianza artística histórica con Imaabs y la vanguardia de club chilena.'
        },
        {
            id: 'buenos_aires',
            name: 'Buenos Aires',
            country: 'Argentina',
            region: 'south_america',
            lat: -34.6037,
            lon: -58.3816,
            years: '2014–2023',
            venue: 'Niceto Club, Hiedrah Club de Baile, Fiestas ZZK',
            dossier: 'Colisión sónica con Hiedrah Club de Baile y Niceto Club en Palermo.'
        },
        {
            id: 'montevideo',
            name: 'Montevideo',
            country: 'Uruguay',
            region: 'south_america',
            lat: -34.9011,
            lon: -56.1645,
            years: '2017, 2022',
            venue: 'Rambla Sessions, Clubbing Rioplatense',
            dossier: 'Encuentro con el candombe uruguayo, polirritmias de tamboril y bass rioplatense.'
        }
    ];

    /* =========================================================
       WORLD TOUR CYBER RADAR MAP & LEAFLET ENGINE (62 CITIES)
       ========================================================= */
    let leafletMap = null;
    let leafletMarkers = [];
    let leafletPolylines = [];
    let activeSelectCity = null;
    let geoJsonLayer = null;

    function initWorldRadar(filterRegion = 'all') {
        const mapEl = document.getElementById('leaflet-radar-map');
        const hudCity = document.getElementById('radar-hud-city');
        const hudCoords = document.getElementById('radar-hud-coords');
        const hudDetails = document.getElementById('radar-hud-details');
        const chipsContainer = document.getElementById('radar-city-chips');

        if (!mapEl) return;

        // Initialize Leaflet Map once
        if (!leafletMap) {
            leafletMap = L.map('leaflet-radar-map', {
                center: [20, 0],
                zoom: 2,
                minZoom: 1.5,
                maxZoom: 10,
                zoomControl: true,
                attributionControl: false
            });

            // Open Source Natural Earth Vector GeoJSON Layer (100% Free, Zero API Keys, Zero Watermarks, Zero Text)
            fetch('./data/world.json')
                .then(res => {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.json();
                })
                .then(geoData => {
                    geoJsonLayer = L.geoJSON(geoData, {
                        style: function() {
                            return {
                                fillColor: '#121526',
                                fillOpacity: 0.95,
                                color: '#1e2844',
                                weight: 0.8,
                                opacity: 0.9,
                                className: 'cyber-geojson-country'
                            };
                        }
                    }).addTo(leafletMap);
                    if (geoJsonLayer) geoJsonLayer.bringToBack();
                })
                .catch(err => {
                    console.warn('[WORLD_RADAR] GeoJSON load error:', err);
                });

            window.leafletMap = leafletMap;
        }

        // Clear existing markers & polylines
        leafletMarkers.forEach(m => leafletMap.removeLayer(m));
        leafletMarkers = [];
        leafletPolylines.forEach(p => leafletMap.removeLayer(p));
        leafletPolylines = [];

        const cdmxCity = WORLD_TOUR_CITIES.find(c => c.isHQ) || WORLD_TOUR_CITIES[0];

        const visibleCities = WORLD_TOUR_CITIES.filter(city => {
            if (filterRegion === 'all') return true;
            return city.region === filterRegion || city.isHQ;
        });

        const selectCity = (city, fly = false) => {
            if (hudCity) hudCity.textContent = `// ${city.name.toUpperCase()}, ${city.country.toUpperCase()} [${city.years}]`;
            if (hudCoords) hudCoords.textContent = `[ LAT ${city.lat.toFixed(2)}°, LON ${city.lon.toFixed(2)}° ]`;
            let extraImage = city.image ? `<img src="${city.image}" class="w-full mt-2 border border-[var(--circuit)] rounded-sm" style="max-height: 120px; object-fit: contain; background: black; padding: 4px;" />` : '';
            if (hudDetails) hudDetails.innerHTML = `<strong>FORO / FESTIVAL:</strong> <span class="text-[var(--accent)] font-bold">${city.venue}</span><br><span class="opacity-90">${city.dossier}</span>${extraImage}`;

            // Highlight city chip
            document.querySelectorAll('.radar-city-chip').forEach(ch => {
                if (ch.getAttribute('data-city-id') === city.id) {
                    ch.classList.add('active-city-chip');
                    ch.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                } else {
                    ch.classList.remove('active-city-chip');
                }
            });

            // Highlight polyline
            leafletPolylines.forEach(pl => {
                if (pl._cityId === city.id) {
                    pl.setStyle({ color: 'var(--accent)', weight: 3, opacity: 1 });
                    pl.bringToFront();
                } else {
                    pl.setStyle({ color: 'var(--main)', weight: 1.2, opacity: 0.25 });
                }
            });

            if (fly && leafletMap) {
                leafletMap.flyTo([city.lat, city.lon], Math.max(leafletMap.getZoom(), 4.5), { duration: 1.2 });
            }
        };

        activeSelectCity = selectCity;

        visibleCities.forEach(city => {
            // Geodesic Flight Trajectory from CDMX (Ground Zero)
            if (!city.isHQ) {
                const polyline = L.polyline([[cdmxCity.lat, cdmxCity.lon], [city.lat, city.lon]], {
                    color: 'var(--main)',
                    weight: 1.2,
                    opacity: filterRegion === 'all' ? 0.22 : 0.65,
                    dashArray: '3, 6'
                }).addTo(leafletMap);
                polyline._cityId = city.id;
                polyline.on('click', () => selectCity(city, true));
                polyline.on('mouseover', () => selectCity(city, false));
                leafletPolylines.push(polyline);
            }

            // Custom Cyber DivIcon
            const isHq = !!city.isHQ;
            const isHub = isHq || ['tokyo', 'nyc', 'la', 'berlin', 'barcelona', 'paris', 'londres', 'bogota', 'buenos_aires', 'montreal', 'shanghai'].includes(city.id);
            const showLabel = filterRegion !== 'all' || isHub;

            const iconHtml = `
                <div class="cyber-marker-wrap" data-city-id="${city.id}">
                    <div class="cyber-marker-core ${isHq ? 'is-hq' : ''}"></div>
                    <div class="cyber-marker-ring"></div>
                    <div class="cyber-marker-label" style="${showLabel ? 'display:block;' : 'display:none;'}">${city.name.toUpperCase()}</div>
                </div>
            `;

            const customIcon = L.divIcon({
                className: 'cyber-map-marker',
                html: iconHtml,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            const marker = L.marker([city.lat, city.lon], { icon: customIcon, title: `${city.name} - ${city.venue}` });
            marker._cityId = city.id;
            marker.addTo(leafletMap);

            marker.on('click', () => selectCity(city, true));
            marker.on('mouseover', () => selectCity(city, false));
            leafletMarkers.push(marker);
        });

        // Populate Interactive 62-City Chips
        if (chipsContainer) {
            chipsContainer.innerHTML = '';
            visibleCities.forEach(city => {
                const chip = document.createElement('button');
                chip.setAttribute('type', 'button');
                chip.setAttribute('data-city-id', city.id);
                chip.className = `radar-city-chip text-[9.5px] px-2 py-0.5 border border-[var(--circuit)] bg-[rgba(255,255,255,0.03)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer text-left ${city.isHQ ? 'border-[var(--main)] text-[var(--main)] font-bold' : ''}`;
                chip.textContent = `${city.name} (${city.country})`;
                chip.addEventListener('click', () => selectCity(city, true));
                chipsContainer.appendChild(chip);
            });
        }

        // Adjust map view depending on region
        if (filterRegion !== 'all' && leafletMarkers.length > 0) {
            const group = L.featureGroup(leafletMarkers);
            if (group.getBounds().isValid()) {
                leafletMap.fitBounds(group.getBounds().pad(0.2));
            }
        } else if (leafletMap) {
            leafletMap.setView([20, 0], 2);
        }

        setTimeout(() => {
            if (leafletMap) leafletMap.invalidateSize();
        }, 150);
    }

    // Setup filter buttons
    document.querySelectorAll('.radar-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.radar-filter-btn').forEach(b => {
                b.classList.remove('active-radar-btn');
                b.classList.remove('border-[var(--accent)]');
            });
            e.currentTarget.classList.add('active-radar-btn');
            e.currentTarget.classList.add('border-[var(--accent)]');
            const region = e.currentTarget.getAttribute('data-region');
            initWorldRadar(region);
        });
    });

    // Setup instant city search input
    const radarSearchInput = document.getElementById('radar-search-input');
    if (radarSearchInput) {
        radarSearchInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            if (!q) return;
            const matched = WORLD_TOUR_CITIES.find(c =>
                c.name.toLowerCase().includes(q) ||
                c.country.toLowerCase().includes(q) ||
                c.venue.toLowerCase().includes(q)
            );
            if (matched && activeSelectCity) {
                activeSelectCity(matched, true);
            }
        });
    }

    /* =========================================================
       PRESS CATEGORY FILTERS (HEMEROTECA INTERACTIVE SYSTEM)
       ========================================================= */
    document.querySelectorAll('.press-cat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.press-cat-btn').forEach(b => {
                b.classList.remove('active-press-cat');
                b.classList.remove('border-[var(--accent)]');
            });
            e.currentTarget.classList.add('active-press-cat');
            e.currentTarget.classList.add('border-[var(--accent)]');

            const selectedCat = e.currentTarget.getAttribute('data-press-cat') || 'all';
            document.querySelectorAll('#press-cards-list .press-card').forEach(card => {
                const categories = (card.getAttribute('data-categories') || '').split(' ');
                if (selectedCat === 'all' || categories.includes(selectedCat)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Initial render of World Radar Map on startup
    initWorldRadar();

});
