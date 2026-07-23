import re

with open('H:/web/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix the renderLandingSlides mess
# We want to remove the broken lines:
#     function renderLandingSlides() {}
#       dots.innerHTML = slides.map((_, i) => '<span class="hs-dot ' + (i === 0 ? 'active' : '') + '" onclick="goSlide(' + i + ')"></span>').join('');
#       if (typeof _hsIdx !== 'undefined') _hsIdx = 0;
#     }
pattern = r"function renderLandingSlides\(\) \{\}[\s\S]*?if \(typeof _hsIdx !== 'undefined'\) _hsIdx = 0;\s*\}"
html = re.sub(pattern, "function renderLandingSlides() {}", html)

# We also should remove the old CSS from <style id="app-styles">
# The old CSS is between /* Clean school landing */ and /* LOGIN */
css_pattern = r"/\*\s*Clean school landing\s*\*/[\s\S]*?/\*\s*LOGIN\s*\*/"
html = re.sub(css_pattern, "/* LOGIN */", html)

with open('H:/web/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Cleanup fix applied')
