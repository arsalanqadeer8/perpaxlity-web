import re

html_path = 'H:/web/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update saveNewStudent edge function call
content = content.replace(
    "_sb.functions.invoke('create-student-auth', {",
    "_sb.functions.invoke('create-auth-user', {"
)
content = content.replace(
    "body: { email: loginEmail, password: loginPass }",
    "body: { email: loginEmail, password: loginPass, role: 'student' }"
)

# 2. Add Teacher password field
old_teach_ibox = '<div class="ibox" style="margin-bottom:10px;">Create or invite this teacher email in Supabase Auth. Passwords are not stored here.</div>'
new_teach_pass = '<div class="fg pw-field"><label class="fl">Login Password</label><input class="fi" type="password" id="mt-pass" placeholder="Enter password (for new logins)" autocomplete="new-password"/><button type="button" class="pw-toggle" onclick="togglePassword(\\\'mt-pass\\\',this)">Show</button></div>'
content = content.replace(old_teach_ibox, new_teach_pass)

# 3. Update saveTeach
content = content.replace("function saveTeach(eid) { const name =", "async function saveTeach(eid) { const name =")

# Find saveTeach function body up to pushCloudDB()
save_teach_pattern = r"(const obj = \{ name, email, .*?; if \(eid\) \{ const t = DB.users.find\(x => x.id === eid\); if \(t\) Object.assign\(t, obj\); \} else DB.users.push\(\{ id: uid\(\), \.\.\.obj, photo: '', lastPaid: '', payrollHistory: \[\] \}\);)"

new_save_teach_logic = """const loginPass = (document.getElementById('mt-pass')?.value || '').trim();
    if (!eid && loginPass && _sb) {
      document.getElementById('m-btn').textContent = 'Creating Login...';
      try {
        const { data, error } = await _sb.functions.invoke('create-auth-user', {
          body: { email, password: loginPass, role: 'teacher' }
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        showToast(`Teacher added & Auth Login created!`, 'ts');
      } catch (err) {
        showToast(err.message, 'te');
        document.getElementById('m-btn').textContent = 'Save';
        return;
      }
    }
    \\1"""

content = re.sub(save_teach_pattern, new_save_teach_logic, content)


# 4. Add Family password field
old_fam_ibox = '<div class="ibox" style="margin-bottom:10px;">Create or invite the parent email in Supabase Auth. Passwords are not stored here.</div>'
new_fam_pass = '<div class="fg pw-field"><label class="fl">Login Password</label><input class="fi" type="password" id="mf-pass" placeholder="Enter password (for new logins)" autocomplete="new-password"/><button type="button" class="pw-toggle" onclick="togglePassword(\\\'mf-pass\\\',this)">Show</button></div>'
content = content.replace(old_fam_ibox, new_fam_pass)


# 5. Update saveFam
content = content.replace("function saveFam(eid) {", "async function saveFam(eid) {")

save_fam_pattern = r"(const obj = \{ id: fid, parentName: name, phone: document.getElementById\('mf-phone'\)\?\.value \|\| '', whatsapp: document.getElementById\('mf-wa'\)\?\.value \|\| '', email, studentIds \};)"

new_save_fam_logic = """const loginPass = (document.getElementById('mf-pass')?.value || '').trim();
      if (!eid && email && loginPass && _sb) {
        document.getElementById('m-btn').textContent = 'Creating Login...';
        try {
          const { data, error } = await _sb.functions.invoke('create-auth-user', {
            body: { email, password: loginPass, role: 'parent' }
          });
          if (error) throw error;
          if (data?.error) throw new Error(data.error);
          showToast(`Family added & Auth Login created!`, 'ts');
        } catch (err) {
          showToast(err.message, 'te');
          document.getElementById('m-btn').textContent = 'Save';
          return;
        }
      }
      \\1"""

content = re.sub(save_fam_pattern, new_save_fam_logic, content)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Auth updates applied successfully.")
