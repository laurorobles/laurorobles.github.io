import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

new_ansi = """    const ANSI_ART_MURALS = [
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
    ];"""

js = re.sub(r'const ANSI_ART_MURALS = \[.*?\];', new_ansi, js, flags=re.DOTALL)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(js)
