import re

with open('H:/web/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Try to remove old CSS
# The old CSS starts with: /* Clean school landing */
# And ends before /* LOGIN */
css_match = re.search(r'/\*\s*Clean school landing\s*\*/.*?/\*\s*LOGIN\s*\*/', html, flags=re.DOTALL | re.IGNORECASE)

if css_match:
    html = html.replace(css_match.group(0), '/* LOGIN */')
else:
    # Alternative regex using specific classes
    # match from #landing-page.clean-landing up to the first @media query block end or .login-page
    pass
    
with open('H:/web/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('CSS Cleanup attempted')
