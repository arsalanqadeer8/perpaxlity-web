const fs = require('fs');

async function main() {
    const htmlPath = 'H:/web/index.html';
    let content = fs.readFileSync(htmlPath, 'utf8');

    // Add autocomplete="new-password" to email
    const emailOld = '<input class="fi" id="m-lemail" value="${s?.loginEmail || \'\'}" placeholder="student@email.com"/>';
    const emailNew = '<input class="fi" id="m-lemail" value="${s?.loginEmail || \'\'}" placeholder="student@email.com" autocomplete="new-password"/>';
    
    if (content.includes(emailOld)) {
        content = content.replace(emailOld, emailNew);
        console.log('Fixed email autofill.');
    } else {
        console.log('Failed to find email field.');
    }

    // Add autocomplete="new-password" to password
    const passOld = '<input class="fi" type="password" id="m-lpass" placeholder="Enter password (for new logins)"/>';
    const passNew = '<input class="fi" type="password" id="m-lpass" placeholder="Enter password (for new logins)" autocomplete="new-password"/>';
    
    if (content.includes(passOld)) {
        content = content.replace(passOld, passNew);
        console.log('Fixed password autofill.');
    } else {
        console.log('Failed to find password field.');
    }

    fs.writeFileSync(htmlPath, content, 'utf8');
    console.log('index.html updated successfully to prevent autofill.');
}

main().catch(console.error);
