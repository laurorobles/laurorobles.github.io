import re

with open('src/main.js', 'r') as f:
    js = f.read()

# Replace covers
js = re.sub(
    r'("art-anahuacalli-2020"\s*:\s*\{.*?cover:\s*)".*?"',
    r'\1"/images/covers/anahuacalli.jpg"',
    js,
    flags=re.DOTALL
)

js = re.sub(
    r'("art-basel-miami-2016"\s*:\s*\{.*?cover:\s*)".*?"',
    r'\1"/images/covers/basel.png"',
    js,
    flags=re.DOTALL
)

js = re.sub(
    r'("art-rbma-tokyo"\s*:\s*\{.*?cover:\s*)".*?"',
    r'\1"/images/covers/rbma_tokyo.jpg"',
    js,
    flags=re.DOTALL
)

# Add NAAFI 2014 tour
new_entry = """        "art-naafi-2014": {
            id: "art-naafi-2014",
            title: "NAAFI USA Tour: Paul Marmota, Lao, Mexican Jihad (2014)",
            subtitle: "Costa Oeste USA / San Diego, LA, SF, Portland",
            type: "GIRA INTERNACIONAL & SHOWCASES",
            year: "2014",
            cover: "/images/covers/naafi_2014.webp",
            desc: "Una de las primeras giras clave de NAAFI cimentando su sonido periférico en Estados Unidos. Fechas en Los Angeles (Mustache Mondays, 356 Mission), San Francisco (Tormenta Tropical) y Portland.",
            details: [
                "Lugares: The Bancroft, La Cita, 356 Mission, Elbo Room, Holocene.",
                "Artistas: Paul Marmota, Lao, Mexican Jihad",
                "Impacto: Consolidación del circuito de club global para talento mexicano."
            ],
            streamType: "soundcloud",
            streamPayload: "https://soundcloud.com/naafi",
            links: { ig: "https://instagram.com/naafi" }
        },
"""

js = js.replace('"art-estado-ccd":', new_entry + '\n        "art-estado-ccd":')

with open('src/main.js', 'w') as f:
    f.write(js)
