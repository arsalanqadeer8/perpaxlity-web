const fs = require('fs');

async function main() {
    const htmlPath = 'H:/web/index.html';
    let content = fs.readFileSync(htmlPath, 'utf8');

    // 1. Add Password field to modal HTML
    const emailField = '<div class="fg"><label class="fl">Login Email</label><input class="fi" id="m-lemail" value="${s?.loginEmail || \'\'}" placeholder="student@email.com"/></div>';
    const emailAndPassFields = emailField + '\n  <div class="fg"><label class="fl">Login Password</label><input class="fi" type="password" id="m-lpass" placeholder="Enter password (for new logins)"/></div>';
    
    if (content.includes(emailField)) {
        content = content.replace(emailField, emailAndPassFields);
        console.log('Added password field to modal.');
    } else {
        console.log('Could not find email field to replace!');
    }

    // 2. Make saveStu async
    if (content.includes('function saveStu(editId) {')) {
        content = content.replace('function saveStu(editId) {', 'async function saveStu(editId) {');
        console.log('Made saveStu async.');
    }

    // 3. Extract loginPass
    const emailExtract = "const loginEmail = ((document.getElementById('m-lemail')?.value || '').trim().toLowerCase()) || autoEmail;";
    const emailAndPassExtract = emailExtract + "\n      const loginPass = document.getElementById('m-lpass')?.value || '';";
    
    if (content.includes(emailExtract)) {
        content = content.replace(emailExtract, emailAndPassExtract);
        console.log('Extracted password in saveStu.');
    }

    // 4. Update the saveNewStudent toast/logic
    const oldToastLine = 'showToast(`Student added. Create/invite ${loginEmail} in Supabase Auth.`, \'ts\');';
    const newEdgeFunctionCall = `
        if (_sb && loginPass) {
          try {
            showToast('Creating secure Auth login...', 'ti');
            const { data, error } = await _sb.functions.invoke('create-student-auth', {
              body: { email: loginEmail, password: loginPass }
            });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            showToast(\`Student added & Auth Login created for \${loginEmail}!\`, 'ts');
          } catch(e) {
            console.error('Edge function error:', e);
            showToast(\`Student added locally. Auth creation failed: \${e.message}\`, 'te', 8000);
          }
        } else {
          showToast(\`Student added. No password provided for Auth.\`, 'ts');
        }
    `;

    if (content.includes(oldToastLine)) {
        content = content.replace(oldToastLine, newEdgeFunctionCall);
        console.log('Replaced toast with Edge Function invocation.');
    } else {
        console.log('Could not find old toast line to replace!');
    }

    fs.writeFileSync(htmlPath, content, 'utf8');
    console.log('index.html updated successfully.');
}

main().catch(console.error);
