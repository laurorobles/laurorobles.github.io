import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Insert [ MENU ] button in top bar
menu_btn = '<button id="mobile-menu-btn" class="md:hidden font-bold text-[var(--accent)] border border-[var(--accent)] px-1.5 py-0.5 hover:bg-[var(--accent)] hover:text-black transition-colors mr-2">[ MENU ]</button>'

# Find the button toggle-all-windows and insert right before it
if 'id="btn-toggle-all-windows"' in html and 'id="mobile-menu-btn"' not in html:
    html = html.replace('id="btn-toggle-all-windows"', f'id="mobile-menu-btn" class="md:hidden font-bold text-[var(--accent)] border border-[var(--accent)] px-1.5 py-0.5 hover:bg-[var(--accent)] hover:text-black transition-colors mr-2">[ MENU ]</button>\n                <button ')

# 2. Add Mobile CSS overrides
mobile_css = """
        /* =========================================================
           MOBILE UX OVERRIDES (Unified Menu, Snap Windows, Mini-Player)
           ========================================================= */
        @media (max-width: 768px) {
            /* Transform dock into fullscreen overlay menu */
            #dock-menu {
                position: fixed;
                top: 34px;
                left: 0;
                width: 100%;
                height: calc(100dvh - 34px);
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(15px);
                flex-direction: column;
                justify-content: flex-start;
                align-items: stretch;
                padding: 1.5rem;
                display: none; /* toggled via .mobile-open */
                z-index: 9999;
                overflow-y: auto;
            }
            #dock-menu.mobile-open {
                display: flex !important;
            }
            .dock-group {
                flex-direction: column;
                width: 100%;
                margin-bottom: 1.5rem;
                border: 1px solid var(--circuit);
                background: rgba(0, 0, 0, 0.4);
            }
            .dock-group > button.dock-item {
                display: block;
                width: 100%;
                text-align: left;
                font-size: 1.1rem;
                padding: 0.5rem 1rem;
                background: rgba(255, 144, 232, 0.1);
                border-bottom: 1px solid var(--accent);
                pointer-events: none; /* Just a label on mobile */
            }
            .dock-group-content {
                position: static;
                display: flex;
                flex-direction: column;
                opacity: 1;
                visibility: visible;
                transform: none;
                background: transparent;
                border: none;
                padding: 0;
                width: 100%;
            }
            .dock-group-content .dock-item {
                width: 100%;
                text-align: left;
                padding: 1rem;
                font-size: 1.1rem;
                border-bottom: 1px dashed rgba(0, 255, 255, 0.2);
            }
            
            /* Hide the desktop terminal input bar if it exists inside the dock area on mobile */
            #terminal-bar {
                display: none !important;
            }

            /* Windows snap to full screen */
            .drag-window:not(#win-player) {
                top: 34px !important;
                bottom: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: auto !important;
                transform: none !important;
                border-radius: 0 !important;
                border: none !important;
                border-bottom: 1px solid var(--main) !important;
                margin: 0 !important;
            }
            .win-header {
                cursor: default !important;
            }
            .win-actions .fs-btn {
                display: none !important;
            }

            /* Player becomes fixed bottom drawer */
            body.player-active .drag-window:not(#win-player) {
                bottom: 150px !important; /* Leave space for player */
            }
            #win-player {
                top: auto !important;
                bottom: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 150px !important;
                transform: none !important;
                border: none !important;
                border-top: 2px solid var(--accent) !important;
                background: rgba(0, 0, 0, 0.95) !important;
                z-index: 10000 !important;
                border-radius: 0 !important;
            }
            
            /* Inspector padding so it doesn't get covered by player */
            body.player-active .inspector-overlay {
                padding-bottom: 150px;
            }
        }
"""
if 'MOBILE UX OVERRIDES' not in html:
    html = html.replace('</style>', f'{mobile_css}\n    </style>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("HTML and CSS updated.")
