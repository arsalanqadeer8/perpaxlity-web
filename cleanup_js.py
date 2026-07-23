import re

with open('H:/web/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove renderLandingSlides entirely
html = re.sub(r'function renderLandingSlides\(\)\s*\{[\s\S]*?\}', 'function renderLandingSlides() {}', html)

# Also remove applyBranding references to land-hero-text, land-stat-students, etc.
html = re.sub(r"const landHero = document.getElementById\('land-hero-text'\);[\s\S]*?\}", '', html)
html = re.sub(r"const studentStat = document.getElementById\('land-stat-students'\);[\s\S]*?;\s*", '', html)
html = re.sub(r"const teacherStat = document.getElementById\('land-stat-teachers'\);[\s\S]*?;\s*", '', html)
html = re.sub(r"const classStat = document.getElementById\('land-stat-classes'\);[\s\S]*?;\s*", '', html)

# The loop for 'tb-ico', 'lp-logo', 'land-mark'
html = html.replace("['tb-ico', 'lp-logo', 'land-mark']", "['tb-ico', 'lp-logo']")

with open('H:/web/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('JS Cleanup attempted')
