with open('src/main.js', 'r') as f:
    js = f.read()

start_idx = js.find("/* =========================================================\n       9.5 CHAOS SIGIL FORGE")
end_idx = js.find("/* =========================================================\n       10. TERMINAL & SYSTEM COMMANDS")

if start_idx != -1 and end_idx != -1:
    pre = js[:start_idx]
    post = js[end_idx:]
    
    new_logic = """/* =========================================================
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
        const cleaned = raw.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^A-Z]/g, '');
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
            sigilMeaningEl.innerHTML = `<strong>TIPO:</strong> Ciber-Nagual de Intención<br><strong>FUNCIÓN:</strong> ${lore}<br><strong>CÓDICE:</strong> Operación sigilizada basada en ${uniqueConsonants.replace(/\\s+/g, '').length} nodos de consonantes.`;
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

        const letters = uniqueConsonants.replace(/\\s+/g, '').split('');
        if (letters.length === 0) return;

        // Chaos Magic Node Mapping
        const points = letters.map((char, i) => {
            const code = char.charCodeAt(0) - 65;
            // Map code (0-25) to a 9-point radial grid + inner radii
            const angle = ((code % 9) / 9) * Math.PI * 2 + (i * 0.2);
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

    """
    
    with open('src/main.js', 'w') as f:
        f.write(pre + new_logic + post)
    print("Success")
else:
    print("Markers not found!")

