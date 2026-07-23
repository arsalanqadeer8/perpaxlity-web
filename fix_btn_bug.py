import re

html_path = 'H:/web/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace document.getElementById('m-btn').textContent = 'Creating Login...';
content = content.replace(
    "document.getElementById('m-btn').textContent = 'Creating Login...';",
    "const btn = document.querySelector('.m-btns .btn-p'); if (btn) btn.textContent = 'Creating Login...';"
)

# Replace document.getElementById('m-btn').textContent = 'Save';
content = content.replace(
    "document.getElementById('m-btn').textContent = 'Save';",
    "const btn2 = document.querySelector('.m-btns .btn-p'); if (btn2) btn2.textContent = 'Save';"
)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Button bug fixed successfully.")
