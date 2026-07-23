import sys

with open('H:/web/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re
pattern = r'if \(preferredRole === \'teacher\'\) \{'

replacement = '''if (preferredRole === 'admin') {
        u = { id: uid(), name: em.split('@')[0].replace(/[._-]+/g, ' '), email: em, role: 'admin', photo: '' };
        DB.users.push(u);
        return u;
      }

      if (preferredRole === 'teacher') {'''

new_content = re.sub(pattern, replacement, content)

with open('H:/web/index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Admin profile logic fixed')
