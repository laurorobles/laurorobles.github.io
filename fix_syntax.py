import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Fix the extra brace and missing comma
bad_syntax = """            links: {
                youtube: "https://www.youtube.com/watch?v=cVxSdlLuH1Q"
            }
        }
        },"""

fixed_syntax = """            links: {
                youtube: "https://www.youtube.com/watch?v=cVxSdlLuH1Q"
            }
        },"""

js = js.replace(bad_syntax, fixed_syntax)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(js)
