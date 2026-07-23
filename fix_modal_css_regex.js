const fs = require('fs');

async function main() {
    const htmlPath = 'H:/web/index.html';
    let content = fs.readFileSync(htmlPath, 'utf8');

    // Replacement 1: .modal
    // Find .modal CSS block
    content = content.replace(/\.modal\s*\{[\s\S]*?padding:\s*20px\s*16px;\s*\}/, 
        `.modal {
      background: var(--card);
      border: 1px solid var(--border);
      width: 100%;
      max-width: 540px;
      max-height: 94vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: var(--sh3);
      animation: fadeUp .28s cubic-bezier(.22, 1, .36, 1);
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    }
    #modal-body {
      padding: 20px 16px;
      overflow-y: auto;
    }`);

    // Replacement 2: @media(min-width:560px) .modal
    content = content.replace(/@media\(min-width:560px\)\s*\{\s*\.modal\s*\{\s*border-radius:\s*var\(--radius-xl\);\s*padding:\s*24px\s*20px;\s*\}\s*\}/,
        `@media(min-width:560px) {
      .modal {
        border-radius: var(--radius-xl);
      }
      #modal-body {
        padding: 24px 20px;
      }
    }`);

    // Replacement 3: .m-handle
    content = content.replace(/\.m-handle\s*\{\s*width:\s*32px;\s*height:\s*3px;\s*background:\s*var\(--border2\);\s*border-radius:\s*99px;\s*margin:\s*0\s*auto\s*14px;\s*\}/,
        `.m-handle {
      width: 32px;
      height: 3px;
      background: var(--border2);
      border-radius: 99px;
      margin: 14px auto 14px;
      flex-shrink: 0;
    }`);

    fs.writeFileSync(htmlPath, content, 'utf8');
    console.log('index.html CSS updated successfully with regex.');
}

main().catch(console.error);
