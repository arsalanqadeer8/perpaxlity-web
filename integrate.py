import sys
import re
from bs4 import BeautifulSoup

print('Parsing code.html...')
with open('C:/Users/ADIL TRADERS/OneDrive/Desktop/landing page/code.html', 'r', encoding='utf-8') as f:
    code_html = f.read()

soup_code = BeautifulSoup(code_html, 'html.parser')

# Extract head elements
head_elements = []
for tag in soup_code.head.find_all(['link', 'script', 'style']):
    if tag.name == 'title' or tag.name == 'meta':
        continue
    # Add preflight false to tailwind config
    if tag.name == 'script' and tag.get('id') == 'tailwind-config':
        tag.string = tag.string.replace('darkMode: "class",', 'darkMode: "class",\n    corePlugins: { preflight: false },')
    
    # Scope styles to #landing-page
    if tag.name == 'style':
        styles = tag.string
        styles = styles.replace('body {', '#landing-page {')
        tag.string = styles
        
    head_elements.append(str(tag))

head_injection = '\n'.join(head_elements)

# Extract body contents
body_tag = soup_code.body
# We want the inner HTML of the body tag
body_contents = ''.join(str(child) for child in body_tag.contents)

# Make sure buttons open the login page
body_contents = body_contents.replace('href="#"', 'href="javascript:void(0)"')
body_contents = body_contents.replace('>Enroll Now</button>', ' onclick="openLogin()">Enroll Now</button>')
body_contents = body_contents.replace('>Request Prospectus</button>', ' onclick="openLogin()">Request Prospectus</button>')
body_contents = body_contents.replace('>Apply Now', ' onclick="openLogin()">Apply Now')

print('Parsing index.html...')
with open('H:/web/index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

# Inject into head
if 'tailwind.config' not in index_html:
    index_html = index_html.replace('</head>', head_injection + '\n</head>')

# Replace landing page
# We use regex to find <div id="landing-page"...> ... </div>
# But since it's nested, regex is hard. Let's use string split or BeautifulSoup.
# Using string split based on comments since index.html has:
# <!-- LANDING -->
# <div id="landing-page" class="clean-landing">
# ...
# <!-- SHELL (App) -->
# <div id="app" style="display:none">

start_marker = '<!-- LANDING -->'
end_marker = '<!-- SHELL (App) -->'

start_idx = index_html.find(start_marker)
end_idx = index_html.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_landing = f'<div id="landing-page">\n{body_contents}\n</div>\n\n'
    index_html = index_html[:start_idx + len(start_marker)] + '\n' + new_landing + index_html[end_idx:]
    
    with open('H:/web/index.html', 'w', encoding='utf-8') as f:
        f.write(index_html)
    print('Integration successful!')
else:
    print('Error: Could not find landing page markers in index.html')

