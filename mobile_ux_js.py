import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

mobile_js = """
    // =========================================================
    // MOBILE UX LOGIC
    // =========================================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const dockMenu = document.getElementById('dock-menu');
    
    if (mobileMenuBtn && dockMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            dockMenu.classList.toggle('mobile-open');
            mobileMenuBtn.innerText = dockMenu.classList.contains('mobile-open') ? '[ CERRAR ]' : '[ MENU ]';
        });
    }

    // Close menu when clicking a category item on mobile
    document.querySelectorAll('.dock-group-content .dock-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768 && dockMenu) {
                dockMenu.classList.remove('mobile-open');
                if (mobileMenuBtn) mobileMenuBtn.innerText = '[ MENU ]';
            }
        });
    });

    // Sync player state for mobile responsive resizing
    function syncPlayerState() {
        const playerWin = document.getElementById('win-player');
        if (playerWin && playerWin.style.display !== 'none') {
            document.body.classList.add('player-active');
        } else {
            document.body.classList.remove('player-active');
        }
    }
    
    // Initial sync
    syncPlayerState();

    // Hook into MutationObserver to watch win-player display changes
    const playerWinObj = document.getElementById('win-player');
    if (playerWinObj) {
        const playerObserver = new MutationObserver(() => {
            syncPlayerState();
        });
        playerObserver.observe(playerWinObj, { attributes: true, attributeFilter: ['style'] });
    }
"""

if 'MOBILE UX LOGIC' not in js:
    # insert before window.addEventListener('resize'
    # or just at the end of the DOMContentLoaded block
    # Let's insert it before the close button event listeners
    pattern = r'(document\.querySelectorAll\(\'\.win-btn\.close-btn\'\))'
    js = re.sub(pattern, mobile_js + r'\n    \1', js)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("JS updated.")
