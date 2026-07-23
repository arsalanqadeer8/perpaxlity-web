import re

html_path = 'H:/web/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add uploadToStorage helper
helper_code = """
    async function uploadToStorage(file) {
      if (!_sb) throw new Error("No Supabase connection");
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2,9)}.${ext}`;
      const { data, error } = await _sb.storage.from('portal_images').upload(fileName, file);
      if (error) throw error;
      const { data: publicUrlData } = _sb.storage.from('portal_images').getPublicUrl(fileName);
      return publicUrlData.publicUrl;
    }
"""
content = content.replace("function uploadLogo(inp) {", helper_code + "\n    async function uploadLogo(inp) {")

# 2. Update uploadLogo
old_uploadLogo = """async function uploadLogo(inp) {
      const f = inp.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = e => { DB.school.logo = e.target.result; saveDB(); pushPublicSite(); applyBranding(); showToast('Logo updated and publishing', 'ts'); };
      r.readAsDataURL(f);
    }"""
new_uploadLogo = """async function uploadLogo(inp) {
      const f = inp.files[0]; if (!f) return;
      try {
        showToast('Uploading logo...', 'ts');
        const url = await uploadToStorage(f);
        DB.school.logo = url; saveDB(); pushPublicSite(); applyBranding(); showToast('Logo updated and published', 'ts');
      } catch(e) { showToast(e.message, 'te'); }
    }"""
content = content.replace(old_uploadLogo.replace('async ', ''), new_uploadLogo)


# 3. Update updateStuPhoto
old_updateStuPhoto = """function updateStuPhoto(inp) {
      const f = inp.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = e => {
        document.getElementById('m-pd').value = e.target.result;
        const p = document.getElementById('m-pup');
        if (p) p.innerHTML = `<img src="${e.target.result}"/>`;
      };
      r.readAsDataURL(f);
    }"""
new_updateStuPhoto = """async function updateStuPhoto(inp) {
      const f = inp.files[0]; if (!f) return;
      try {
        const p = document.getElementById('m-pup');
        if (p) p.innerHTML = `<div class="pup-tx">Uploading...</div>`;
        const url = await uploadToStorage(f);
        document.getElementById('m-pd').value = url;
        if (p) p.innerHTML = `<img src="${url}"/>`;
      } catch(e) { showToast(e.message, 'te'); }
    }"""
content = content.replace(old_updateStuPhoto, new_updateStuPhoto)


# 4. Update updateProfilePhoto
old_updateProfilePhoto = "function updateProfilePhoto(inp) { const f = inp.files[0]; if (!f) return; const r = new FileReader(); r.onload = e => { curUser.photo = e.target.result; const u = DB.users.find(x => x.id === curUser.id); if (u) u.photo = e.target.result; saveDB(); buildShell(); showToast('? Photo updated', 'ts'); }; r.readAsDataURL(f); }"
new_updateProfilePhoto = "async function updateProfilePhoto(inp) { const f = inp.files[0]; if (!f) return; try { showToast('Uploading photo...', 'ts'); const url = await uploadToStorage(f); curUser.photo = url; const u = DB.users.find(x => x.id === curUser.id); if (u) u.photo = url; saveDB(); buildShell(); showToast('? Photo updated', 'ts'); } catch(e) { showToast(e.message, 'te'); } }"
content = content.replace(old_updateProfilePhoto, new_updateProfilePhoto)


with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Storage updates applied successfully.")
