const fs = require('fs');
const path = 'H:/web/index.html';

try {
    let content = fs.readFileSync(path, 'utf8');

    // Add id="land-mark" to the navbar logo icon
    content = content.replace(
        '<div class="ox-brand-icon">OE</div>',
        '<div class="ox-brand-icon" id="land-mark" style="background:transparent;">OE</div>'
    );

    // Add id="lp-logo" to the footer logo icon
    content = content.replace(
        '<div class="ox-brand-icon" style="background:#d4af37; color:#0a192f;">OE</div>',
        '<div class="ox-brand-icon" id="lp-logo" style="background:transparent; color:#0a192f;">OE</div>'
    );

    fs.writeFileSync(path, content, 'utf8');
    console.log('Logo IDs injected into HTML.');
} catch(err) {
    console.error('Error:', err);
}
