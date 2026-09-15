from bs4 import BeautifulSoup
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

ped_win = soup.find(id='win-pedagogy')
if ped_win:
    # 1. Update Tabs
    tabs = ped_win.find(id='pedagogy-main-tabs')
    if tabs:
        btns = tabs.find_all('button')
        if len(btns) >= 3:
            btns[0].string = '[ 🎓 YOUTUBE TUTORIALS ]'
            btns[1].string = '[ 💻 CURSO ABLETON 101 ]'
            btns[2].string = '[ ⚡ GUMROAD SOUND PACKS ]'

    # 2. Update ableton101 card in YT tab to redirect
    card101 = ped_win.find(lambda tag: tag.name == 'div' and tag.get('data-item-id') == 'tut-ableton-101')
    if card101:
        # Change it from opening YT iframe to external link
        # Remove data-yt-id so it doesn't trigger the iframe player
        if 'data-yt-id' in card101.attrs:
            del card101['data-yt-id']
        
        # Change the play button text
        play_btn = card101.find(string=re.compile(r'\[ REPRODUCIR PLAYLIST ↗ \]'))
        if play_btn:
            play_btn.replace_with('[ VER CURSO INTERACTIVO ↗ ]')
            
        # Add an onclick redirect
        card101['onclick'] = "window.open('https://laurorobles.github.io/ableton101curso/index.html', '_blank')"
        card101['class'] = [c for c in card101.get('class', []) if c != 'active'] # remove active class
        # Add a visual cursor pointer class if missing
        if 'cursor-pointer' not in card101.get('class', []):
            card101['class'].append('cursor-pointer')
            card101['class'].append('hover:bg-[rgba(255,255,255,0.05)]')
            card101['class'].append('transition-colors')

    # 3. Update the entire Github Tab to be the Course Tab
    github_pane = ped_win.find(id='ped-pane-github')
    if github_pane:
        github_pane.clear()
        
        new_content = """
<div class="border border-[var(--main)] bg-[rgba(0,0,0,0.3)] p-2 mb-2">
    <div class="flex justify-between items-center mb-1 pb-0.5 border-b border-[var(--circuit)] text-[8.5px]">
        <span class="font-bold text-[var(--main)]">CURSO INTERACTIVO ONLINE</span>
        <span class="inspector-badge text-[7px]">ABLETON 101</span>
    </div>
    <strong class="text-[var(--accent)] text-[11px] block mb-1">Ableton 101 &mdash; Plataforma de Aprendizaje</strong>
    <p class="opacity-80 text-[9px] leading-relaxed mb-2">
        Bienvenido a la nueva plataforma interactiva del curso Ableton 101. Este sitio contiene todo el temario curricular, tutoriales, recursos, y la guía integral de producción musical.
    </p>
    
    <div class="flex flex-col gap-2">
        <a href="https://laurorobles.github.io/ableton101curso/index.html" target="_blank" class="border border-[var(--main)] bg-[var(--main)] text-[var(--bg)] py-2 px-3 block text-center hover:bg-[var(--accent)] hover:border-[var(--accent)] font-bold text-[10px] tracking-wider transition-all shadow-[0_0_10px_rgba(255,144,232,0.3)]">
            [ INICIAR CURSO ABLETON 101 ] &nearrow;
        </a>
        
        <a href="https://github.com/laurorobles/Ableton101" target="_blank" class="border border-[var(--circuit)] text-[var(--circuit)] py-1 px-3 block text-center hover:bg-[var(--circuit)] hover:text-[var(--bg)] font-bold text-[8.5px] transition-all">
            VER REPOSITORIO ORIGINAL EN GITHUB &nearrow;
        </a>
    </div>
</div>

<div class="space-y-1.5 opacity-80">
    <div class="border border-[var(--circuit)] p-1.5 bg-[rgba(0,0,0,0.2)]">
        <div class="flex justify-between items-center text-[8px] font-bold text-[var(--accent)] mb-0.5">
            <span>M&Oacute;DULO 01 // DIGITAL AUDIO & GAIN STAGING</span>
            <span class="opacity-60">UNIDAD FUNDAMENTAL</span>
        </div>
        <p class="text-[8.5px] opacity-80">Calibraci&oacute;n de headroom en punto flotante de 32-bit, calibraci&oacute;n a -6dB RMS, prevenci&oacute;n de distorsi&oacute;n por inter-sample peaks y flujo de se&ntilde;al &oacute;ptimo.</p>
    </div>
    <div class="border border-[var(--circuit)] p-1.5 bg-[rgba(0,0,0,0.2)]">
        <div class="flex justify-between items-center text-[8px] font-bold text-[var(--main)] mb-0.5">
            <span>M&Oacute;DULO 02 // S&Iacute;NTESIS DE PERCUSI&Oacute;N & BREAKS</span>
            <span class="opacity-60">RHYTHM LAB</span>
        </div>
        <p class="text-[8.5px] opacity-80">Slicing no destructivo de breaks (Amen Break, Think Break), s&iacute;ntesis de bombos mediante modulaci&oacute;n de tono en Operator, y capas de transitorios.</p>
    </div>
    <div class="border border-[var(--circuit)] p-1.5 bg-[rgba(0,0,0,0.2)]">
        <div class="flex justify-between items-center text-[8px] font-bold text-[var(--accent)] mb-0.5">
            <span>M&Oacute;DULO 03 // CONTROL DE SUB-BASS & FASE</span>
            <span class="opacity-60">LOW END THEORY</span>
        </div>
        <p class="text-[8.5px] opacity-80">Alineaci&oacute;n de fase absoluta entre bombo y bajo, saturaci&oacute;n arm&oacute;nica sutil en medios, y filtrado paso alto quir&uacute;rgico para maximizar energ&iacute;a en el club.</p>
    </div>
</div>
"""
        github_pane.append(BeautifulSoup(new_content, 'html.parser'))

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(soup.encode(formatter="html5").decode('utf-8'))
    print("Pedagogy updated.")
else:
    print("win-pedagogy not found")
