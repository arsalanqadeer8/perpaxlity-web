const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf-8');

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable"
});

dom.window.onerror = function(msg, file, line, col, error) {
  console.error("JSDOM Error:", msg, line, col, error);
};

dom.window.document.addEventListener('DOMContentLoaded', () => {
  console.log("DOMContentLoaded fired.");
  try {
    const el = dom.window.document.getElementById('print-container');
    console.log("print-container found:", !!el);
  } catch(e) {
    console.error(e);
  }
});

setTimeout(() => {
  console.log("Finished waiting.");
}, 2000);
