import re

with open('C:/Users/ADIL TRADERS/OneDrive/Desktop/landing page/code.html', 'r', encoding='utf-8') as f:
    code_html = f.read()

# Extract head contents
head_start = code_html.find('<head>') + 6
head_end = code_html.find('</head>')
head_contents = code_html[head_start:head_end]

# Remove title and meta
head_contents = re.sub(r'<title>.*?</title>', '', head_contents, flags=re.IGNORECASE|re.DOTALL)
head_contents = re.sub(r'<meta.*?>', '', head_contents, flags=re.IGNORECASE)

# Update Tailwind config
head_contents = head_contents.replace('darkMode: "class",', 'darkMode: "class",\n    corePlugins: { preflight: false },')

# Scope styles
head_contents = head_contents.replace('body {', '#landing-page {')

# Extract body contents
body_match = re.search(r'<body[^>]*>(.*)</body>', code_html, re.IGNORECASE | re.DOTALL)
if body_match:
    body_contents = body_match.group(1)
else:
    print('Error: Could not extract body')
    exit(1)

# Hook up login buttons
body_contents = body_contents.replace('href="#"', 'href="javascript:void(0)"')
body_contents = body_contents.replace('>Enroll Now</button>', ' onclick="openLogin()">Enroll Now</button>')
body_contents = body_contents.replace('>Request Prospectus</button>', ' onclick="openLogin()">Request Prospectus</button>')
body_contents = body_contents.replace('>Apply Now', ' onclick="openLogin()">Apply Now')

print('Parsing index.html...')
with open('H:/web/index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

# Inject into head
if 'tailwind.config' not in index_html:
    index_html = index_html.replace('</head>', head_contents + '\n</head>')

# Replace landing page
start_marker = '<!-- LANDING -->'
end_marker = '<!-- SHELL (App) -->'

start_idx = index_html.find(start_marker)
end_idx = index_html.find(end_marker)

if start_idx != -1 and end_idx != -1:
    # Get the attributes of the current landing-page div, we want to replace the whole thing, but keep <div id="landing-page">
    new_landing = f'<div id="landing-page">\n{body_contents}\n</div>\n\n'
    index_html = index_html[:start_idx + len(start_marker)] + '\n' + new_landing + index_html[end_idx:]
    
    with open('H:/web/index.html', 'w', encoding='utf-8') as f:
        f.write(index_html)
    print('Integration successful!')
else:
    print('Error: Could not find landing page markers in index.html')

