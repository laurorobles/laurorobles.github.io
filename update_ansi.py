import re

with open('src/main.js', 'r') as f:
    js = f.read()

new_murals = r'''const ANSI_MURALS = [
        `
 ▄████▄ ▓█████▄  ███▄ ▄███▓ ▒█████  
▒██▀ ▀█ ▒██▀ ██▌▓██▒▀█▀ ██▒▒██▒  ██▒
▒▓█    ▄░██   █▌▓██    ▓██░▒██░  ██▒
▒▓▓▄ ▄██▒▓█▄   ▌▒██    ▒██ ▒██   ██░
▒ ▓███▀ ░▒████▓ ▒██▒   ░██▒░ ████▓▒░
░ ░▒ ▒  ░▒▒▓  ▒ ░ ▒░   ░  ░░ ▒░▒░▒░ 
  ░  ▒  ░ ░▒  ▒ ░  ░      ░  ░ ▒ ▒░ 
░       ░ ░░  ░ ░      ░   ░ ░ ░ ▒  
░ ░     ░       ░          ░ ░      
░       ░                           
[ CODEX DIGITAL: PREHISPANIC CYBERNETICS ]
      < NAHUAL.OS KERNEL ACTIVATED >
      +----------------------------+
      |  SYSTEM OVERRIDE: 0x8F4A   |
      +----------------------------+
        `,
        `
     .       .      .     .     .
  .      .       .       .       .
      .      _..._      .       .
  .      .-'       '-.      .
      .'               '.
     /                   \\
    |                     |
    |  C I B E R N É T I C|A  .
    |                     |
     \\                   /
  .   '.               .'    .
      .  '-._     _.-'   .
  .         '---'            .
  [TLALOC_ROUTER: RAIN_DATA_STREAM]
  // BAUD RATE: 9600 // PORT: 5
        `,
        `
   _____     __  __    _____     _____    ____  
  / ___/    / / / /   / ___/    / ___/   / __ \\ 
  \\__ \\    / /_/ /    \\__ \\     \\__ \\   / /_/ / 
 ___/ /   / __  /    ___/ /    ___/ /  / ____/  
/____/   /_/ /_/    /____/    /____/  /_/       
[ EXTASIS RECORDS // DATA VAULT ]
   |> MATRIX: COMPILING SHSS
   |> REPLICANT_NODE: 2500,2500
        `,
        `
    ____   _____   __    ____  ________  ______ 
   / __ \\ / __/ | / /   / __ \\/ ____/ / / / __ \\
  / / / / /_ /  |/ /   / / / / __/ / / / / / / /
 / /_/ / __/ /|  /   / /_/ / /___/ /_/ / /_/ / 
/_____/_/ /_/ |_/   /_____/_____/\\____/\\____/  
< TRANSMISIÓN: OMEGA_POINT >
* Tonal / Nagual Interface Linked *
* CPU: 48Hz Resonance *
        `
    ];'''

js = re.sub(r'const ANSI_MURALS = \[.*?\];', new_murals, js, flags=re.DOTALL)

with open('src/main.js', 'w') as f:
    f.write(js)
