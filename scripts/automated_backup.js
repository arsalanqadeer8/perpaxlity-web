/**
 * Oxford Excellence Academy - Automated Cloud & Local Backup
 * Runs daily/weekly via GitHub Actions, Windows Task Scheduler, or CLI
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iprqtkmtelgdhlenlsrc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_DX0GG-V6vp9ey7_FxbvLdw_ql-E8nEt';

async function fetchTable(table) {
  return new Promise((resolve, reject) => {
    const u = new URL(SUPABASE_URL + '/rest/v1/' + table + '?select=*');
    const req = https.request(u, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve([]);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function uploadToStorage(fileName, content) {
  return new Promise((resolve, reject) => {
    const u = new URL(SUPABASE_URL + '/storage/v1/object/portal_images/backups/' + fileName);
    const req = https.request(u, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(content)
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });
    req.on('error', reject);
    req.write(content);
    req.end();
  });
}

async function runBackup() {
  const timestamp = new Date().toISOString();
  const dateStr = timestamp.split('T')[0];
  console.log(`[${timestamp}] Starting Automated Backup...`);

  const [clsData, stuData, stfData, attData, feeData, grdData, setData, mscData] = await Promise.all([
    fetchTable('classes'),
    fetchTable('students'),
    fetchTable('staff'),
    fetchTable('attendance'),
    fetchTable('fees'),
    fetchTable('grades'),
    fetchTable('settings'),
    fetchTable('miscellaneous')
  ]);

  const db = {
    classes: (clsData || []).map(r => r.data),
    users: (stfData || []).map(r => r.data),
    students: {},
    attendance: {},
    fees: { items: [], payments: {}, monthlyLedger: {} },
    grades: {},
    settings: { currency: 'PKR', schoolYear: '2025-26', theme: 'light', terms: [{ id: 't1', name: 'Midterm' }, { id: 't2', name: 'Final Term' }], activeTerm: 't1' },
    school: { name: 'Oxford Excellence Academy', tagline: 'Learn • Grow • Excel', logo: 'oxford_logo.svg' },
    families: {},
    timetable: {},
    studentLogs: {},
    teacherAttendance: {},
    admissions: [],
    notices: [],
    exams: [],
    subjects: [],
    periods: [],
    autoAbsences: {},
    expenses: [],
    videos: [],
    diaries: []
  };

  if (stuData) {
    stuData.forEach(r => {
      if (!db.students[r.class_id]) db.students[r.class_id] = [];
      db.students[r.class_id].push(r.data);
    });
  }

  if (attData) {
    attData.forEach(r => {
      const sid = r.id.substring(r.class_id.length + 1);
      if (!db.attendance[r.class_id]) db.attendance[r.class_id] = {};
      db.attendance[r.class_id][sid] = r.data;
    });
  }

  if (feeData) {
    feeData.forEach(r => {
      if (r.type === 'item') db.fees.items.push(r.data);
      else if (r.type === 'payment') db.fees.payments[r.id.replace('payment_', '')] = r.data;
      else if (r.type === 'ledger') {
        const parts = r.id.split('_');
        const sid = parts[1];
        const mon = parts.slice(2).join('_');
        if (!db.fees.monthlyLedger[sid]) db.fees.monthlyLedger[sid] = {};
        db.fees.monthlyLedger[sid][mon] = r.data;
      }
    });
  }

  if (grdData) {
    grdData.forEach(r => { db.grades[r.id] = r.data; });
  }

  if (setData) {
    setData.forEach(r => {
      if (r.id === 'main') Object.assign(db.settings, r.data);
      else if (r.id === 'lateAfter') db.lateAfter = r.data.value;
      else if (r.id === 'school') Object.assign(db.school, r.data);
      else if (r.id === 'periods') db.periods = r.data;
    });
  }

  if (mscData) {
    mscData.forEach(r => {
      if (r.id.startsWith('admission_')) db.admissions.push(r.data);
      else if (r.id.startsWith('notice_')) db.notices.push(r.data);
      else if (r.id.startsWith('exam_')) db.exams.push(r.data);
      else if (r.id.startsWith('subject_')) db.subjects.push(r.data);
      else if (r.id.startsWith('family_')) db.families[r.id.replace('family_', '')] = r.data;
      else if (r.id.startsWith('timetable_')) db.timetable[r.id.replace('timetable_', '')] = r.data;
      else if (r.id.startsWith('studentLog_')) db.studentLogs[r.id.replace('studentLog_', '')] = r.data;
      else if (r.id.startsWith('tAtt_')) db.teacherAttendance[r.id.replace('tAtt_', '')] = r.data;
      else if (r.id.startsWith('autoAbsences_')) db.autoAbsences[r.id.replace('autoAbsences_', '')] = r.data;
      else if (r.id.startsWith('expense_')) db.expenses.push(r.data);
      else if (r.id.startsWith('video_')) db.videos.push(r.data);
    });
  }

  const totalStudents = Object.values(db.students).flat().length;
  console.log(`Snapshot compiled: ${totalStudents} students across ${db.classes.length} classes.`);

  if (totalStudents < 100) {
    console.error('SAFETY WARNING: Student count unexpectedly low (< 100). Backup aborted to protect existing archives.');
    process.exit(1);
  }

  const jsonString = JSON.stringify(db, null, 2);
  const fileName = `oxford_backup_${dateStr}.json`;

  // 1. Save local backup file if running locally
  try {
    const rootDir = path.resolve(__dirname, '..');
    const backupDir = path.join(rootDir, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    fs.writeFileSync(path.join(backupDir, fileName), jsonString, 'utf8');
    fs.writeFileSync(path.join(rootDir, 'user_last_backup.json'), jsonString, 'utf8');
    console.log(`Local backup saved: ${fileName} and user_last_backup.json`);
  } catch (err) {
    console.log('Local filesystem write skipped (or running in restricted environment):', err.message);
  }

  // 2. Upload to Supabase Storage (portal_images/backups/)
  const uploadRes = await uploadToStorage(fileName, jsonString);
  console.log(`Supabase Storage upload result:`, uploadRes.status, uploadRes.body);

  console.log(`[${new Date().toISOString()}] Backup Completed Successfully!`);
}

if (require.main === module) {
  runBackup().catch(err => {
    console.error('Fatal backup error:', err);
    process.exit(1);
  });
}

module.exports = { runBackup };
