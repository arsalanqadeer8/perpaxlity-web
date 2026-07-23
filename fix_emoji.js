const fs = require('fs');
const file = 'h:/web/index.html';
let c = fs.readFileSync(file, 'utf8');

// Strip any non-ASCII garbage that directly precedes a known HTML entity for icons
c = c.replace(/[^\x20-\x7E\r\n\t]+(?=&#128247;)/g, '');  // before camera
c = c.replace(/[^\x20-\x7E\r\n\t]+(?=&#9998;)/g, '');    // before pencil
c = c.replace(/[^\x20-\x7E\r\n\t]+(?=&#9881;)/g, '');    // before gear
c = c.replace(/[^\x20-\x7E\r\n\t]+(?=&#10003;)/g, '');   // before check
c = c.replace(/[^\x20-\x7E\r\n\t]+(?=&#9200;)/g, '');    // before clock
c = c.replace(/[^\x20-\x7E\r\n\t]+(?=&#10006;)/g, '');   // before X
c = c.replace(/[^\x20-\x7E\r\n\t]+(?=&#128196;)/g, '');  // before clipboard

// Fix broken dash in teacher name option
c = c.replace(/(\$\{t\.name\}) [^\x20-\x7E]+ (\$\{t\.subject)/g, '$1 - $2');

fs.writeFileSync(file, c, 'utf8');
console.log('Done - fixed all broken emoji residue.');
