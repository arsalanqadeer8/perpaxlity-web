const fs = require('fs');
const html = fs.readFileSync('H:/web/index.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/gi);
const scriptMatch = scripts[4].replace(/<\/?script>/gi, '');

const wrapper = 
const window = { location: { hash: '' }, addEventListener: () => {} };
const document = { getElementById: () => ({ classList: { add:()=>{}, remove:()=>{} }, style: {} }), addEventListener: () => {} };
const localStorage = { getItem: () => null, setItem: () => {} };
let DB = { 
  users: [{id:'u1', role:'teacher', name:'T1', payrollHistory: []}], 
  students: { c1: [{id:'s1'}] }, 
  classes: [{id:'c1', name:'Class 1'}], 
  attendance: {}, 
  fees: { items: [], payments: {}, monthlyLedger: {} }, 
  staffAttendance: {},
  settings: {}
};
const curUser = { role: 'admin' };
function allStus() { return [{id:'s1'}]; }
function clsStus() { return [{id:'s1'}]; }
function monthKey() { return '2025-07'; }
function num(n) { return Number(n)||0; }
function escHtml(s) { return s; }
function gc() { return 'red'; }
function ini() { return 'A'; }
function isOff() { return false; }
function fmtMoney(x) { return x; }
function today() { return '2025-07-20'; }

try { console.log('Testing pgDashboard...'); pgDashboard(); console.log('pgDashboard OK'); } catch(e) { console.error('pgDashboard ERROR:', e); }
try { console.log('Testing pgTeachers...'); pgTeachers(); console.log('pgTeachers OK'); } catch(e) { console.error('pgTeachers ERROR:', e); }
;
fs.writeFileSync('H:/web/test_crash.js', wrapper);
