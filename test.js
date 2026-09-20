const fs = require('fs'); const t = fs.readFileSync('H:/web/downloaded.html', 'utf8'); const start = t.indexOf('<div class="shell"'); console.log(t.substring(start, start + 500));
