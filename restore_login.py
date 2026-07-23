import sys
import re

with open('H:/web/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'\[object Promise\]'

replacement = '''async function doLogin() {
      const loginValue = (document.getElementById('l-email').value || '').trim().toLowerCase();
      const em = resolvePortalLoginEmail(loginValue);
      const pw = (document.getElementById('l-pass').value || '').trim();
      if (!em || !pw) { showToast('Enter email and password', 'tw2'); return; }
      if (!em.includes('@')) { showToast('Supabase Auth login must use the Login Email saved in the portal.', 'te', 5200); return; }
      if (!_sb) { showToast('Supabase Auth is not configured', 'te'); return; }
      const btn = document.querySelector('.login-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Signing in...'; }
      try {
        const { error } = await _sb.auth.signInWithPassword({ email: em, password: pw });
        if (error) { showToast(error.message || 'Incorrect email or password', 'te', 5200); return; }
        const cloud = await loadCloudDB();
        if (cloud) DB = cloud;
        stripStoredPasswords();
        ensureEnhancements();
        const u = findUserProfile(em, loginRole);
        if (!u) { if(!error) await _sb.auth.signOut(); showToast('Signed in, but this email is not linked to a teacher, student, parent, or admin profile.', 'te', 5200); return; }
        if (u.role !== loginRole) showToast('Role detected: ' + u.role, 'tw2', 2400);
        saveDB();
        setCurrentUser(u);
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('login-page').style.display = 'none';
        const app = document.getElementById('app');
        app.style.display = 'flex'; app.style.flexDirection = 'column';
        buildShell(); goPage('dashboard'); applyBranding();
        refreshCloudAfterLogin(em, u.role);
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
      }
    }'''

new_content = re.sub(pattern, replacement, content)

with open('H:/web/index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('doLogin fully restored')
