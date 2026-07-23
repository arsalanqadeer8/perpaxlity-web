const fs = require('fs');
const html = fs.readFileSync('H:/web/index.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/gi);
const scriptMatch = scripts[4].replace(/<\/?script>/gi, '');

const wrapper = `
const window = { location: { hash: '' }, addEventListener: () => {}, payrollMonth: '2025-07', print: () => {} };
const document = { 
  getElementById: (id) => ({ classList: { add:()=>{}, remove:()=>{} }, style: {}, value: '', addEventListener: () => {} }), 
  addEventListener: () => {},
  createElement: () => ({}),
  body: { appendChild: () => {}, removeChild: () => {} },
  querySelector: () => null,
  querySelectorAll: () => []
};
const localStorage = { getItem: () => null, setItem: () => {} };
DB = { 
  users: [{id:'u1', role:'teacher', name:'T1', payrollHistory: [], classIds: ['c1'], joinDate: '2025-01-01', salary: 40000}], 
  students: { c1: [{id:'s1', name: 'S1', vanFee: 500, customFee: 1000, joinDate: '2025-01-01'}] }, 
  classes: [{id:'c1', name:'Class 1'}], 
  attendance: { '2025-07-20': { c1: { s1: 'present' } } }, 
  fees: { items: [], payments: {}, monthlyLedger: {} }, 
  staffAttendance: { '2025-07-20': { u1: 'present' } },
  settings: {},
  notices: [],
  subjects: [{name: 'Math'}]
};
const curUser = { role: 'admin' };
function allStus() { return [{id:'s1', classId:'c1', vanFee: 500, customFee: 1000}]; }
function clsStus(c) { return [{id:'s1', classId:'c1', vanFee: 500, customFee: 1000}]; }
function monthKey() { return '2025-07'; }
function num(n) { return Number(n)||0; }
function escHtml(s) { return s; }
function gc() { return 'red'; }
function ini() { return 'A'; }
function isOff() { return false; }
function fmtMoney(x) { return x; }
function fmtDate(x) { return x; }
function today() { return '2025-07-20'; }
function studentFeeSummary() { return { dueAmount: 100, mandatory: [] }; }

${scriptMatch}

const pages = ['Dashboard', 'Students', 'Classes', 'Attendance', 'Fees', 'Teachers', 'Payroll', 'Notices', 'Settings'];
for (const p of pages) {
  try {
    const fn = eval('pg' + p);
    fn();
    console.log(p + ' OK');
  } catch(e) {
    console.error(p + ' ERROR: ' + e.message + '\\n' + e.stack.split('\\n')[1]);
  }
}
`;
fs.writeFileSync('H:/web/test_pages.js', wrapper);
