const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');

const html = fs.readFileSync('H:/web/index.html', 'utf-8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on('jsdomError', (error) => {
    console.error('JSDOM Error:', error);
});
virtualConsole.on('error', (error) => {
    console.error('Console Error:', error);
});

const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    virtualConsole: virtualConsole
});
