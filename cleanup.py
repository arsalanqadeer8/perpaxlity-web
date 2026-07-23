import re

with open('H:/web/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace The Progressive Academy with The Progressive Children Academy
html = html.replace('The Progressive Academy', 'The Progressive Children Academy')

# Remove old landing CSS
# The CSS is between <style id="app-styles"> and </style>
# We need to remove the landing styles
# Look for /* Clean school landing */ and remove up to <!-- LOGIN -->? No, it's inside <style>
# Let's use regex to find the block of landing CSS.
# Alternatively, since it's just CSS, we can just leave it if it doesn't conflict, but it's cleaner to remove.
# We'll regex out .clean-landing to .clean-footer, but it's safer to just let it be if it's too complex.
# Let's fix the JS error instead.
# Find wrap.innerHTML = ... in renderSchoolProfile
html = re.sub(r"const wrap = document.getElementById\('hs-slides'\);[\s\S]*?wrap\.innerHTML = .*?;", 
              "const wrap = document.getElementById('hs-slides');\n      if (wrap) {\n        // removed\n      }", html)

# Find the slideshow interval
html = re.sub(r"const slides = document.querySelectorAll\('\.hs-slide'\);[\s\S]*?setInterval\(\(\) => \{[\s\S]*?\}, 5000\);",
              "// Slideshow removed", html)

# Remove the reveal observer
html = re.sub(r"const observer = new IntersectionObserver\(\(entries\) => \{[\s\S]*?\}\);[\s\S]*?observer\.observe\(el\)\);",
              "// Observer removed", html)

with open('H:/web/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Cleanup successful')
