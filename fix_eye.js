const fs = require('fs');

async function main() {
    const htmlPath = 'H:/web/index.html';
    let content = fs.readFileSync(htmlPath, 'utf8');

    const passOld = '<div class="fg"><label class="fl">Login Password</label><input class="fi" type="password" id="m-lpass" placeholder="Enter password (for new logins)" autocomplete="new-password"/></div>';
    
    // Add the pw-field class and the togglePassword button, which re-uses the existing password toggle logic and CSS!
    const passNew = '<div class="fg pw-field"><label class="fl">Login Password</label><input class="fi" type="password" id="m-lpass" placeholder="Enter password (for new logins)" autocomplete="new-password"/><button type="button" class="pw-toggle" onclick="togglePassword(\'m-lpass\',this)">Show</button></div>';
    
    if (content.includes(passOld)) {
        content = content.replace(passOld, passNew);
        console.log('Fixed password field to include visibility toggle.');
    } else {
        console.log('Failed to find password field.');
    }

    fs.writeFileSync(htmlPath, content, 'utf8');
    console.log('index.html updated successfully.');
}

main().catch(console.error);
