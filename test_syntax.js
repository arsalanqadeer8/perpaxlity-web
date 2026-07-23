const fs = require('fs');
const html = fs.readFileSync('H:/web/index.html', 'utf8');
const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
let match;
let i = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  i++;
  try {
    new Function(match[1]);
  } catch (e) {
    console.error(`Syntax Error in script ${i}:`, e.message);
    
    // Find approximate line number of the error
    const scriptLines = match[1].split('\n');
    for(let j=0; j<scriptLines.length; j++){
       try{
           new Function(scriptLines.slice(0, j+1).join('\n'));
       } catch (err){
           if(err.message === e.message) {
              console.error(`Error around line ${j}:`, scriptLines[j]);
              break;
           }
       }
    }
  }
}
