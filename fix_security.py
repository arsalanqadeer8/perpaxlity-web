import sys
import re

with open('H:/web/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove demo1234 from doLogin
pattern1 = r"if \(error && pw !== 'demo1234'\) \{ showToast\(error\.message \|\| 'Incorrect email or password', 'te', 5200\); return; \}"
replacement1 = "if (error) { showToast(error.message || 'Incorrect email or password', 'te', 5200); return; }"
content = re.sub(pattern1, replacement1, content)

# 2. Prevent student/parent from syncing to cloud
pattern2 = r"if \(!authData\?\.session\) \{ showSyncBadge\('Sign in to sync cloud data', '#f59e0b'\); return; \}"
replacement2 = """if (!authData?.session) { showSyncBadge('Sign in to sync cloud data', '#f59e0b'); return; }
      if (curRole === 'student' || curRole === 'parent') {
        showSyncBadge('Local save only (No permission)', '#f59e0b');
        return;
      }"""
content = re.sub(pattern2, replacement2, content)

with open('H:/web/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated index.html logic successfully.')
