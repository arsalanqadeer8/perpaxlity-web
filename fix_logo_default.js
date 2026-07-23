const fs = require('fs');
const path = 'H:/web/index.html';

try {
    let content = fs.readFileSync(path, 'utf8');

    // Replace the logo injection logic to fallback to logo.png
    content = content.replace(
        /el\\.innerHTML = s\\.logo \\? \`<img src="\\$\\{s\\.logo\\}" alt="logo"\\/>\` : '';/g,
        'el.innerHTML = s.logo ? `<img src="${s.logo}" alt="logo" style="width:100%;height:100%;object-fit:contain;"/>` : `<img src="./logo.png" alt="logo" style="width:100%;height:100%;object-fit:contain;"/>`;'
    );

    // Also fix the style.background line so it stays transparent when defaulting to logo.png
    content = content.replace(
        /el\\.style\\.background = s\\.logo \\? 'transparent' : 'linear-gradient\\(135deg,' \\+ \\(s\\.primaryColor \\|\\| '#ff8a00'\\) \\+ ',var\\(--p2\\)\\)';/g,
        'el.style.background = "transparent";'
    );

    // Make the brand icons slightly wider so the logo fits nicely
    content = content.replace(
        /\\.ox-brand-icon \\{ width: 36px; height: 36px;/g,
        '.ox-brand-icon { width: 45px; height: 45px;'
    );

    fs.writeFileSync(path, content, 'utf8');
    console.log('Logo default updated successfully.');
} catch(err) {
    console.error('Error:', err);
}
