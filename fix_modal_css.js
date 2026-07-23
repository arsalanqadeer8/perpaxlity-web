const fs = require('fs');

async function main() {
    const htmlPath = 'H:/web/index.html';
    let content = fs.readFileSync(htmlPath, 'utf8');

    // Replacement 1: .modal
    const modalOld = `.modal {
      background: var(--card);
      border: 1px solid var(--border);
      width: 100%;
      max-width: 540px;
      max-height: 94vh;
      overflow-y: auto;
      box-shadow: var(--sh3);
      animation: fadeUp .28s cubic-bezier(.22, 1, .36, 1);
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
      padding: 20px 16px;
    }`;

    const modalNew = `.modal {
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
    }`;

    if (content.includes(modalOld)) {
        content = content.replace(modalOld, modalNew);
        console.log('Updated .modal CSS.');
    } else {
        console.log('Failed to find .modal CSS.');
    }

    // Replacement 2: @media(min-width:560px)
    const mediaOld = `@media(min-width:560px) {
      .modal {
        border-radius: var(--radius-xl);
        padding: 24px 20px;
      }
    }`;

    const mediaNew = `@media(min-width:560px) {
      .modal {
        border-radius: var(--radius-xl);
      }
      #modal-body {
        padding: 24px 20px;
      }
    }`;

    if (content.includes(mediaOld)) {
        content = content.replace(mediaOld, mediaNew);
        console.log('Updated @media CSS.');
    } else {
        console.log('Failed to find @media CSS.');
    }

    // Replacement 3: .m-handle
    const handleOld = `.m-handle {
      width: 32px;
      height: 3px;
      background: var(--border2);
      border-radius: 99px;
      margin: 0 auto 14px;
    }`;

    const handleNew = `.m-handle {
      width: 32px;
      height: 3px;
      background: var(--border2);
      border-radius: 99px;
      margin: 14px auto 14px;
      flex-shrink: 0;
    }`;

    if (content.includes(handleOld)) {
        content = content.replace(handleOld, handleNew);
        console.log('Updated .m-handle CSS.');
    } else {
        console.log('Failed to find .m-handle CSS.');
    }

    fs.writeFileSync(htmlPath, content, 'utf8');
    console.log('index.html CSS updated successfully.');
}

main().catch(console.error);
