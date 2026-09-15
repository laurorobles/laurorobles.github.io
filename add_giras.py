import re

with open('src/main.js', 'r') as f:
    js = f.read()

# Add image support to hudDetails
hud_update = r"""let extraImage = city.image ? `<img src="${city.image}" class="w-full mt-2 border border-[var(--circuit)] rounded-sm" style="max-height: 120px; object-fit: contain; background: black; padding: 4px;" />` : '';
            if (hudDetails) hudDetails.innerHTML = `<strong>FORO / FESTIVAL:</strong> <span class="text-[var(--accent)] font-bold">${city.venue}</span><br><span class="opacity-90">${city.dossier}</span>${extraImage}`;"""

js = re.sub(r'if \(hudDetails\) hudDetails\.innerHTML = `<strong>FORO / FESTIVAL:</strong>.*?`;', hud_update, js, flags=re.DOTALL)

# Add cities to WORLD_TOUR_CITIES
new_cities = """
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
"""

js = js.replace("const WORLD_TOUR_CITIES = [", "const WORLD_TOUR_CITIES = [" + new_cities)

# Remove the item from art section in ITEM_DETAILS
# We will use regex to remove "art-naafi-2014" block.
js = re.sub(r'\s*"art-naafi-2014": \{.*?\},', '', js, flags=re.DOTALL)

with open('src/main.js', 'w') as f:
    f.write(js)
