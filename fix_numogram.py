import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Fix the node mapping for true numogram
old_node_mapping = r"const angle = \(\(code % 9\) / 9\) \* Math\.PI \* 2 \+ \(i \* 0\.2\);"
new_node_mapping = r"const angle = ((code % 9) / 9) * Math.PI * 2; // Strict Numogram snap"

js = re.sub(old_node_mapping, new_node_mapping, js)

# Fix the charge sigil event to trigger world flash
old_charge = r"sigilCanvas\.classList\.add\('sigil-charging'\);\s+playNoiseBurst\(\);\s+setTimeout\(\(\) => sigilCanvas\.classList\.remove\('sigil-charging'\), 600\);"
new_charge = r"""sigilCanvas.classList.add('sigil-charging');
            const world = document.getElementById('world');
            if (world) world.classList.add('matrix-flash-active');
            playNoiseBurst();
            setTimeout(() => {
                sigilCanvas.classList.remove('sigil-charging');
                if (world) world.classList.remove('matrix-flash-active');
            }, 600);"""

js = re.sub(old_charge, new_charge, js)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(js)
