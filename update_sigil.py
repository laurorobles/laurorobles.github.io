import re

with open('index.html', 'r') as f:
    html = f.read()

sigil_html = """<div class="drag-window" id="win-sigil" style="top: 2410px; left: 3060px; width: 440px; height: 580px;">
<div class="win-header">
<span>[13] CHAOS_SIGIL_FORGE.exe</span>
<div class="win-actions">
<span class="win-btn fs-btn" title="Fullscreen">[ ]</span>
<span class="win-btn close-btn" title="Cerrar">✕</span>
</div>
</div>
<div class="win-body text-[12px] flex flex-col gap-2 p-3 bg-black">
<p class="opacity-80 leading-relaxed text-[11px]">
<strong class="text-[#E6007A]">TOPY / CCRU / NAHUAL_INTERFACE:</strong> Ingresa tu Voluntad. El motor hipersticional eliminará vocales y repetidas para forjar un Sigilo, anclarlo en la matriz y decodificar su verdadero nombre y significado.
</p>
<div class="flex gap-2 mb-1 mt-1">
<input class="flex-1 bg-black border border-[var(--circuit)] text-[#00FFFF] px-2 py-2 text-[12px] font-mono outline-none focus:border-[#E6007A] uppercase" id="sigil-input" placeholder="MI VOLUNTAD ES..." type="text" autocomplete="off" spellcheck="false">
<button class="border border-[#E6007A] bg-[#E6007A]/10 px-3 py-2 text-[#E6007A] hover:bg-[#E6007A] hover:text-black font-bold uppercase text-[11px] transition-colors" id="btn-forge-sigil">
FORJAR
</button>
</div>

<!-- NAME AND MEANING BOX -->
<div class="border border-[var(--circuit)] bg-[#030006] p-3 mb-1 min-h-[90px] flex flex-col justify-center">
    <h3 id="sigil-name" class="text-[14px] font-bold text-[#E6007A] tracking-widest text-center uppercase mb-2">---</h3>
    <p id="sigil-meaning" class="text-[11px] text-[#00FFFF]/80 leading-relaxed text-center italic">
        Esperando input del usuario para decodificación hipersticional...
    </p>
</div>

<div class="flex justify-between items-center text-[10px] opacity-75 mb-1 px-1">
<span>CONSONANTES: <strong class="text-[#E6007A] tracking-widest" id="sigil-consonants">...</strong></span>
<span class="opacity-60 font-mono" id="sigil-code-hash">#N/A</span>
</div>

<div class="relative w-full aspect-square border border-[var(--circuit)] bg-[#05000A] overflow-hidden flex items-center justify-center">
    <!-- Grid overlay for visual flair -->
    <div class="absolute inset-0 pointer-events-none opacity-20" style="background-image: linear-gradient(#00FFFF 1px, transparent 1px), linear-gradient(90deg, #00FFFF 1px, transparent 1px); background-size: 20px 20px;"></div>
    <canvas id="sigil-canvas" width="400" height="400" class="w-full h-full object-contain relative z-10"></canvas>
</div>

<div class="flex justify-between gap-2 pt-2 mt-auto">
<button class="flex-1 border border-[#00FFFF] bg-[#00FFFF]/10 py-2 text-center font-bold text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black text-[10px] uppercase transition-colors" id="btn-charge-sigil">
[ ⚡ CARGAR EN MATRIZ ]
</button>
<button class="flex-1 border border-red-500 bg-red-500/10 text-red-400 py-2 text-center font-bold hover:bg-red-500 hover:text-black text-[10px] uppercase transition-colors" id="btn-burn-sigil">
[ 🔥 QUEMAR / BANISHING ]
</button>
</div>
</div>
</div>"""

# Find the old win-sigil block and replace it
# Use regex to match <div class="drag-window" id="win-sigil" ...> ... </div><div class="drag-window" id="win-press"
html = re.sub(
    r'<div class="drag-window" id="win-sigil".*?</div></div>\s*<div class="drag-window" id="win-press"',
    sigil_html + '<div class="drag-window" id="win-press"',
    html,
    flags=re.DOTALL
)

with open('index.html', 'w') as f:
    f.write(html)
