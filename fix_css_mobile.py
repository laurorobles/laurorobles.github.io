with open('src/style.css', 'r') as f:
    css = f.read()

# Make base fonts slightly larger everywhere
css = css.replace('text-[9px]', 'text-[10px]')
css = css.replace('text-[9.5px]', 'text-[11px]')
css = css.replace('text-[10px]', 'text-[11px]')
css = css.replace('text-[10.5px]', 'text-[11.5px]')
css = css.replace('text-[11px]', 'text-[12px]')
css = css.replace('text-[12px]', 'text-[13px]')
css = css.replace('text-[12.5px]', 'text-[13px]')

# Mobile responsive rules
mobile_css = """

/* MOBILE UX OPTIMIZATIONS */
@media (max-width: 768px) {
  .drag-window {
    width: 96vw !important;
    height: 75vh !important;
    left: 2vw !important;
    top: 5vh !important;
    min-width: 0 !important;
    resize: none !important;
  }
  
  #omni-player {
    width: 90%;
    right: 5%;
    bottom: 80px; /* Leave space for dock */
  }
  
  #main-dock {
    width: 98%;
    flex-wrap: wrap;
    justify-content: center;
    bottom: 4px;
  }
  
  .dock-item {
    padding: 6px 8px;
    font-size: 11px;
  }
  
  .win-header {
    font-size: 12px;
    padding: 10px;
  }
  
  .win-body {
    font-size: 14px !important;
  }
}
"""

css += mobile_css

with open('src/style.css', 'w') as f:
    f.write(css)
