/**
 * ==============================================================================
 *  OXFORD EXCELLENCE ACADEMY - ALL-IN-ONE WHATSAPP WORKER & SECURE CHATBOT
 * ==============================================================================
 *  - OUTBOX WORKER: Sends automated attendance alerts, fee receipts & report cards
 *  - SECURE CHATBOT: Handles incoming parent queries (Fees, Attendance, Results)
 *  - SECURITY: Strict caller phone verification (ZERO access to others' data)
 *  - RATE LIMITING: Anti-flood protection & human-like message pacing
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const puppeteer = require('puppeteer');

// Cache school logo for rendering fee vouchers
let cachedLogoBase64 = '';
try {
    const logoPath = path.join(__dirname, 'oxford_logo.svg');
    if (fs.existsSync(logoPath)) {
        const svgData = fs.readFileSync(logoPath, 'utf8');
        cachedLogoBase64 = 'data:image/svg+xml;base64,' + Buffer.from(svgData).toString('base64');
    }
} catch (e) {
    console.log('[Logo] Could not load logo SVG:', e.message);
}

// Auto-load environment variables from .env
try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split(/\r?\n/).forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = (match[2] || '').trim();
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                process.env[key] = value;
            }
        });
    }
} catch (e) {
    console.log('[Env Load Warning]', e.message);
}

// 1. Database & AI Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iprqtkmtelgdhlenlsrc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_DX0GG-V6vp9ey7_FxbvLdw_ql-E8nEt';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. WhatsApp Client Initialization
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

// Global Crash & Disconnect Protections
process.on('uncaughtException', (err) => {
    console.error('[System Alert: uncaughtException]', err.message);
});
process.on('unhandledRejection', (reason) => {
    console.error('[System Alert: unhandledRejection]', reason);
});
process.on('SIGINT', async () => {
    console.log('\n[System] Graceful exit initiated...');
    try { await client.destroy(); } catch (e) {}
    process.exit(0);
});

let isReady = false;
let isProcessingOutbox = false;

// In-memory Session Store for Chatbot
// Phone -> { studentId, children: [], lastActive: Date.now() }
const userSessions = new Map();

// In-memory Session Store for Unregistered Visitors
// Phone -> { lastActive: Date.now(), greetedCount: number }
const unregisteredSessions = new Map();

// Multi-turn Conversational Memory: Phone -> { messages: [...], lastUpdated: Date.now() }
const chatHistoryMap = new Map();

// Rate Limiter Store: Phone -> { count: number, firstRequest: number, blockedUntil: number }
const rateLimitMap = new Map();

// Global Rate Limiter: Max 60 requests per minute across all numbers
let globalRequestCount = 0;
let globalWindowStart = Date.now();
function checkGlobalRateLimit() {
    const now = Date.now();
    if (now - globalWindowStart > 60000) {
        globalWindowStart = now;
        globalRequestCount = 1;
        return true;
    }
    globalRequestCount++;
    return globalRequestCount <= 60;
}

// Database Cache Store (60-second TTL to accelerate lookups & protect Supabase quota)
const dbCache = {
    students: { data: null, lastFetch: 0 },
    staff: { data: null, lastFetch: 0 }
};

async function getCachedStudents() {
    const now = Date.now();
    if (dbCache.students.data && (now - dbCache.students.lastFetch < 60000)) {
        return dbCache.students.data;
    }
    try {
        const { data } = await supabase.from('students').select('*');
        if (data && data.length > 0) {
            dbCache.students.data = data;
            dbCache.students.lastFetch = now;
        }
    } catch (e) {
        console.error('[Cache Fetch Students Error]', e.message);
    }
    return dbCache.students.data || [];
}

async function getCachedStaff() {
    const now = Date.now();
    if (dbCache.staff.data && (now - dbCache.staff.lastFetch < 60000)) {
        return dbCache.staff.data;
    }
    try {
        const { data } = await supabase.from('staff').select('*');
        if (data && data.length > 0) {
            dbCache.staff.data = data;
            dbCache.staff.lastFetch = now;
        }
    } catch (e) {
        console.error('[Cache Fetch Staff Error]', e.message);
    }
    return dbCache.staff.data || [];
}

console.log('[System] Initializing Oxford Excellence Academy WhatsApp Worker & Chatbot...');

// ==============================================================================
//  SECURITY & RATE LIMITING HELPERS
// ==============================================================================

/**
 * Checks if a sender is spamming or flooding.
 * Limits to 8 requests per 60-second window.
 */
function checkRateLimit(phone) {
    if (!checkGlobalRateLimit()) return false;
    const now = Date.now();
    const limit = rateLimitMap.get(phone) || { count: 0, firstRequest: now, blockedUntil: 0 };

    if (limit.blockedUntil > now) {
        return false; // Still in cooldown
    }

    if (now - limit.firstRequest > 60000) {
        // Reset window after 1 minute
        limit.count = 1;
        limit.firstRequest = now;
        limit.blockedUntil = 0;
    } else {
        limit.count++;
        if (limit.count > 8) {
            limit.blockedUntil = now + 60000; // Block for 1 minute
            rateLimitMap.set(phone, limit);
            return false;
        }
    }

    rateLimitMap.set(phone, limit);
    return true;
}

/**
 * Normalizes phone numbers to standard 10-digit comparison string.
 */
function cleanDigits(phone) {
    if (!phone) return '';
    const digits = String(phone).replace(/\D/g, '');
    return digits.slice(-10); // Return last 10 digits (e.g. 3162344290)
}

/**
 * Formats a phone number for WhatsApp sending (923XXXXXXXXX).
 */
function formatForWA(phone) {
    let clean = String(phone).replace(/\D/g, '');
    if (clean.startsWith('0092')) clean = clean.substring(2);
    if (clean.startsWith('920')) clean = '92' + clean.substring(3);
    else if (clean.startsWith('03')) clean = '92' + clean.substring(1);
    else if (clean.startsWith('3') && clean.length === 10) clean = '92' + clean;
    return clean;
}

// Clean up stale sessions every 15 minutes
setInterval(() => {
    const now = Date.now();
    for (const [phone, sess] of userSessions.entries()) {
        if (now - sess.lastActive > 15 * 60 * 1000) {
            userSessions.delete(phone);
        }
    }
    for (const [phone, sess] of unregisteredSessions.entries()) {
        if (now - (sess.lastActive || 0) > 24 * 60 * 60 * 1000) {
            unregisteredSessions.delete(phone);
        }
    }
    for (const [phone, hist] of chatHistoryMap.entries()) {
        if (now - (hist.lastUpdated || 0) > 30 * 60 * 1000) {
            chatHistoryMap.delete(phone);
        }
    }
}, 15 * 60 * 1000);

/**
 * Normalizes user menu choices (supports '1', '1.', '1️⃣', 'option 1', etc.)
 */
function parseMenuOption(inputStr) {
    if (!inputStr) return -1;
    const s = inputStr.trim().toLowerCase();
    if (s === '0' || s.startsWith('0.') || s.includes('0️⃣') || s === 'menu' || s === 'main menu' || s === 'home') return 0;
    if (s === '1' || s.startsWith('1.') || s.includes('1️⃣') || s === 'option 1' || s === 'opt 1' || s === '#1') return 1;
    if (s === '2' || s.startsWith('2.') || s.includes('2️⃣') || s === 'option 2' || s === 'opt 2' || s === '#2') return 2;
    if (s === '3' || s.startsWith('3.') || s.includes('3️⃣') || s === 'option 3' || s === 'opt 3' || s === '#3') return 3;
    if (s === '4' || s.startsWith('4.') || s.includes('4️⃣') || s === 'option 4' || s === 'opt 4' || s === '#4') return 4;
    if (s === '5' || s.startsWith('5.') || s.includes('5️⃣') || s === 'option 5' || s === 'opt 5' || s === '#5') return 5;
    return -1;
}

// ==============================================================================
//  WHATSAPP CLIENT LIFECYCLE EVENTS
// ==============================================================================

client.on('qr', (qr) => {
    console.log('\n======================================================');
    console.log(' ACTION REQUIRED: Scan this QR Code with WhatsApp!');
    console.log(' Open WhatsApp -> Linked Devices -> Link a Device');
    console.log('======================================================\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('\n======================================================');
    console.log(' ✅ OXFORD EXCELLENCE ACADEMY WHATSAPP CLIENT READY');
    console.log(' • Outbox Worker: ACTIVE (Listening to Supabase)');
    console.log(' • Secure Chatbot: ACTIVE (Answering Parent Queries)');
    console.log('======================================================\n');
    isReady = true;

    // Auto-reset transient 'error' messages back to 'pending' on startup
    try {
        const { error: resetError } = await supabase
            .from('whatsapp_outbox')
            .update({ status: 'pending' })
            .eq('status', 'error');
        if (!resetError) {
            console.log('[Startup] Auto-reset previous error messages to pending ✅');
        }
    } catch (e) {
        console.log('[Startup] Auto-reset notice:', e.message);
    }

    await new Promise(r => setTimeout(r, 2000));
    processOutboxQueue();
});

client.on('authenticated', () => {
    console.log('✅ WhatsApp Web Authentication Successful!');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Authentication Failure:', msg);
    isReady = false;
});

client.on('disconnected', async (reason) => {
    console.log('⚠️ WhatsApp Disconnected:', reason);
    isReady = false;
    console.log('[Reconnect] Reconnecting in 10 seconds...');
    await new Promise(r => setTimeout(r, 10000));
    try {
        await client.initialize();
    } catch (e) {
        console.error('[Reconnect] Error:', e.message);
    }
});

// ==============================================================================
//  PART 1: OUTBOX WORKER (OLD WORK - SENDS ATTENDANCE & FEE ALERTS)
// ==============================================================================

async function processOutboxQueue() {
    if (isProcessingOutbox || !isReady) return;
    isProcessingOutbox = true;

    try {
        const { data: messages, error } = await supabase
            .from('whatsapp_outbox')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(10);

        if (error) throw error;
        if (!messages || messages.length === 0) {
            isProcessingOutbox = false;
            return;
        }

        console.log(`[Outbox] Sending ${messages.length} pending alert(s)...`);
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        for (const msg of messages) {
            // Drop expired messages older than 24h
            if (msg.created_at < twentyFourHoursAgo) {
                console.log(`[Outbox] Skipping expired message #${msg.id}`);
                await supabase
                    .from('whatsapp_outbox')
                    .update({ status: 'failed_expired' })
                    .eq('id', msg.id);
                continue;
            }

            const cleanPhone = formatForWA(msg.recipient_phone);
            const chatId = `${cleanPhone}@c.us`;

            try {
                const body = (msg.message_body || '').trim();

                // 1. Check if message is a JSON payload (Fee Voucher Image or Notice Photo)
                let isVoucherPayload = false;
                let voucherData = null;
                let isNoticePhotoPayload = false;
                let noticePhotoData = null;

                if (body.startsWith('{')) {
                    try {
                        const parsed = JSON.parse(body);
                        if (parsed && parsed.type === 'fee_voucher_image') {
                            isVoucherPayload = true;
                            voucherData = parsed;
                        } else if (parsed && parsed.type === 'notice_photo') {
                            isNoticePhotoPayload = true;
                            noticePhotoData = parsed;
                        }
                    } catch (e) {
                        // Not JSON
                    }
                }

                // Helper to render fee challan card to base64 PNG
                async function renderVoucherCardImage(payload) {
                    let browser = null;
                    try {
                        const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
                        const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
                        const execPath = fs.existsSync(chromePath) ? chromePath : (fs.existsSync(edgePath) ? edgePath : undefined);

                        browser = await puppeteer.launch({
                            headless: true,
                            executablePath: execPath,
                            args: ['--no-sandbox', '--disable-setuid-sandbox']
                        });

                        const page = await browser.newPage();
                        const isFamily = payload.is_family && Array.isArray(payload.students);
                        const cardWidth = isFamily ? 420 : 360;
                        const viewportHeight = isFamily ? Math.max(750, 480 + (payload.particulars || []).length * 28) : 750;

                        await page.setViewport({ width: cardWidth + 80, height: viewportHeight, deviceScaleFactor: 2 });

                        let rowsHtml = '';
                        (payload.particulars || []).forEach(p => {
                            const isHeader = p.isHeader;
                            const isAlert = p.isUnpaid;
                            const isCredit = p.isCredit;
                            
                            if (isHeader) {
                                rowsHtml += `
                                <tr style="background:#f1f5f9;">
                                  <td colspan="2" style="padding:6px 8px; border:1px solid #222; font-size:12px; font-weight:900; color:#0f172a;">${p.name}</td>
                                </tr>`;
                            } else {
                                const color = isAlert ? '#b91c1c' : (isCredit ? '#166534' : '#1e293b');
                                const weight = (isAlert || isCredit) ? '700' : '400';
                                rowsHtml += `
                                <tr>
                                  <td style="padding:5px 8px; border:1px solid #222; font-size:11.5px; color:${color}; font-weight:${weight}; padding-left:${isFamily ? '16px' : '8px'};">${p.name}</td>
                                  <td style="padding:5px 8px; border:1px solid #222; font-size:11.5px; text-align:right; color:${color}; font-weight:700;">PKR ${Number(p.amount || 0).toLocaleString()}</td>
                                </tr>`;
                            }
                        });

                        const logoImgTag = cachedLogoBase64 ? `<img src="${cachedLogoBase64}" style="max-width:100%; max-height:100%; object-fit:contain;">` : '';

                        let studentInfoHtml = '';
                        if (isFamily) {
                            studentInfoHtml = `
                            <table class="info-table">
                              <tr><td class="info-label" style="width:70px;">Father:</td><td class="info-value">${payload.father_name || 'Parent'}</td></tr>
                              <tr><td class="info-label" style="width:70px;">Students:</td><td class="info-value">${payload.student_name}</td></tr>
                              <tr><td class="info-label" style="width:70px;">Classes:</td><td class="info-value">${payload.class_name}</td></tr>
                            </table>`;
                        } else {
                            studentInfoHtml = `
                            <table class="info-table">
                              <tr><td class="info-label">Name:</td><td class="info-value">${payload.student_name}</td></tr>
                              <tr><td class="info-label">Roll:</td><td class="info-value">${payload.roll}</td></tr>
                              <tr><td class="info-label">Class:</td><td class="info-value">${payload.class_name}</td></tr>
                            </table>`;
                        }

                        const badgeTitle = isFamily ? 'FAMILY CHALLAN' : 'FEE CHALLAN';

                        const html = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                        <meta charset="utf-8">
                        <style>
                          * { box-sizing: border-box; margin: 0; padding: 0; }
                          body {
                            background: #ffffff;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            padding: 8px;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                          }
                          .card {
                            width: ${cardWidth}px;
                            background: #ffffff;
                            border: 2px solid #000;
                            border-radius: 14px;
                            padding: 16px 18px 24px;
                            box-sizing: border-box;
                          }
                          .header {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            border-bottom: 2px solid #000;
                            padding-bottom: 10px;
                            margin-bottom: 12px;
                          }
                          .logo-wrap {
                            width: 50px;
                            height: 50px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                          }
                          .title-wrap {
                            text-align: right;
                          }
                          .school-name {
                            font-size: 14px;
                            font-weight: 900;
                            color: #000;
                            letter-spacing: 0.3px;
                            text-transform: uppercase;
                            line-height: 1.2;
                          }
                          .challan-badge-wrap {
                            margin-top: 4px;
                            font-size: 11.5px;
                            font-weight: 700;
                            color: #444;
                          }
                          .challan-badge {
                            background: #e2e8f0;
                            color: #000;
                            padding: 1.5px 7px;
                            border-radius: 5px;
                            font-weight: 800;
                          }
                          .info-table {
                            width: 100%;
                            margin-bottom: 12px;
                            border-collapse: collapse;
                          }
                          .info-table td {
                            padding: 3px 0;
                            font-size: 12.5px;
                          }
                          .info-label {
                            width: 52px;
                            color: #555;
                            font-weight: 700;
                          }
                          .info-value {
                            font-weight: 800;
                            color: #000;
                            border-bottom: 1px solid #cbd5e1;
                            padding-left: 2px;
                          }
                          .fee-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 24px;
                          }
                          .fee-table th {
                            border: 1px solid #222;
                            padding: 5px 8px;
                            font-size: 11.5px;
                            font-weight: 700;
                            background: #e5e7eb;
                            color: #000;
                          }
                          .fee-table td {
                            border: 1px solid #222;
                            padding: 5px 8px;
                            font-size: 11.5px;
                          }
                          .fee-table tr.total-row th {
                            background: #f0fdf4;
                            color: #166534;
                            font-size: 13px;
                            font-weight: 900;
                            padding: 8px 8px;
                          }
                          .signatures {
                            display: flex;
                            justify-content: space-between;
                            padding-top: 8px;
                          }
                          .sig-line {
                            width: 44%;
                            text-align: center;
                            border-top: 1px solid #000;
                            padding-top: 4px;
                            font-size: 9.5px;
                            font-weight: 700;
                            color: #111;
                          }
                        </style>
                        </head>
                        <body>
                          <div class="card" id="voucher-card">
                            <div class="header">
                              <div class="logo-wrap">${logoImgTag}</div>
                              <div class="title-wrap">
                                <div class="school-name">${payload.school_name || 'OXFORD EXCELLENCE ACADEMY'}</div>
                                <div class="challan-badge-wrap">${badgeTitle} - <span class="challan-badge">${payload.month_label}</span></div>
                              </div>
                            </div>

                            ${studentInfoHtml}

                            <table class="fee-table">
                              <thead>
                                <tr>
                                  <th style="text-align:left;">Particulars</th>
                                  <th style="text-align:right; width:38%;">Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${rowsHtml}
                              </tbody>
                              <tfoot>
                                <tr class="total-row">
                                  <th style="text-align:left;">${isFamily ? 'TOTAL FAMILY PAYABLE' : 'TOTAL PAYABLE'}</th>
                                  <th style="text-align:right;">PKR ${Number(payload.total_payable || 0).toLocaleString()}</th>
                                </tr>
                              </tfoot>
                            </table>

                            <div class="signatures">
                              <div class="sig-line">Cashier Signature</div>
                              <div class="sig-line">Principal Signature</div>
                            </div>
                          </div>
                        </body>
                        </html>`;

                        await page.setContent(html, { waitUntil: 'load' });
                        const cardElement = await page.$('#voucher-card');
                        const base64Image = await cardElement.screenshot({ encoding: 'base64', type: 'png' });
                        return base64Image;
                    } finally {
                        if (browser) await browser.close();
                    }
                }

                if (isVoucherPayload && voucherData) {
                    console.log(`[Outbox] 🎨 Generating HD photo voucher card for ${voucherData.student_name}...`);
                    const b64 = await renderVoucherCardImage(voucherData);
                    const media = new MessageMedia('image/png', b64, `Fee_Challan_${voucherData.roll || 'voucher'}.png`);
                    await client.sendMessage(chatId, media, { caption: voucherData.caption || '' });
                    console.log(`[Outbox ✅ Sent Photo Voucher Card] to ${cleanPhone} for ${voucherData.student_name}`);
                } else if (isNoticePhotoPayload && noticePhotoData) {
                    console.log(`[Outbox] 🖼️ Preparing notice photo broadcast for ${cleanPhone}...`);
                    let media = null;
                    if (noticePhotoData.photo && noticePhotoData.photo.startsWith('data:')) {
                        const mime = noticePhotoData.photo.split(';')[0].slice(5);
                        const b64 = noticePhotoData.photo.split(',')[1];
                        media = new MessageMedia(mime, b64, 'notice.png');
                    } else if (noticePhotoData.photo) {
                        media = await MessageMedia.fromUrl(noticePhotoData.photo, { unsafeMime: true });
                    }
                    if (media) {
                        await client.sendMessage(chatId, media, { caption: noticePhotoData.caption || '' });
                        console.log(`[Outbox ✅ Sent Notice Photo] to ${cleanPhone}`);
                    } else {
                        await client.sendMessage(chatId, noticePhotoData.caption || '');
                        console.log(`[Outbox ✅ Sent Notice Text Fallback] to ${cleanPhone}`);
                    }
                } else {
                    const imgMatch = body.match(/^\[IMAGE:\s*(https?:\/\/[^\s\]]+)\]\s*([\s\S]*)$/i);
                    if (imgMatch) {
                        const imageUrl = imgMatch[1];
                        const caption = imgMatch[2] || '';
                        const media = await MessageMedia.fromUrl(imageUrl, { unsafeMime: true });
                        await client.sendMessage(chatId, media, { caption });
                        console.log(`[Outbox ✅ Sent Image] to ${cleanPhone}`);
                    } else {
                        await client.sendMessage(chatId, body);
                        console.log(`[Outbox ✅ Sent Text] Alert to ${cleanPhone}`);
                    }
                }

                await supabase
                    .from('whatsapp_outbox')
                    .update({ status: 'sent', sent_at: new Date().toISOString() })
                    .eq('id', msg.id);
            } catch (err) {
                const errMsg = err.message || String(err);
                console.error(`[Outbox ❌ Error] ${cleanPhone}: ${errMsg}`);

                if (errMsg.includes('not registered') || errMsg.includes('invalid wid')) {
                    await supabase
                        .from('whatsapp_outbox')
                        .update({ status: 'failed_not_registered' })
                        .eq('id', msg.id);
                    continue;
                }

                await supabase
                    .from('whatsapp_outbox')
                    .update({ status: 'error' })
                    .eq('id', msg.id);
            }

            // Human delay (4–7s) to prevent WhatsApp anti-spam bans
            const delay = Math.floor(Math.random() * 3000) + 4000;
            await new Promise(r => setTimeout(r, delay));
        }
    } catch (err) {
        console.error('[Outbox Worker Error]', err.message);
    } finally {
        isProcessingOutbox = false;
    }
}

// Supabase Realtime Listener for instant outbound sending
supabase.channel('outbox-changes')
    .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'whatsapp_outbox', filter: 'status=eq.pending' },
        () => {
            if (isReady) processOutboxQueue();
        }
    )
    .subscribe();

// Polling fallback every 15 seconds
setInterval(() => {
    if (isReady) processOutboxQueue();
}, 15000);

// Auto-recover any transient 'error' messages every 3 minutes (ZERO manual scripts required in Supabase!)
setInterval(async () => {
    try {
        const { error } = await supabase
            .from('whatsapp_outbox')
            .update({ status: 'pending' })
            .eq('status', 'error');
        if (!error && isReady) {
            processOutboxQueue();
        }
    } catch (e) {}
}, 3 * 60 * 1000);

// ==============================================================================
//  PART 2: SECURE CHATBOT (INBOX - ZERO UNAUTHORIZED DATA ACCESS)
// ==============================================================================

/**
 * Loads school knowledge base from school_knowledge.txt.
 */
function getSchoolKnowledge() {
    try {
        const kPath = path.join(__dirname, 'school_knowledge.txt');
        if (fs.existsSync(kPath)) {
            return fs.readFileSync(kPath, 'utf8');
        }
    } catch (e) {
        console.error('[Knowledge Base Error]', e.message);
    }
    return '';
}

/**
 * Consults Google Gemini AI using school_knowledge.txt context.
 */
async function askGeminiAI(userQuestion, isRegisteredParent = false, studentName = '', senderPhoneDigits = '') {
    if (!GEMINI_API_KEY) return null;
    const knowledge = getSchoolKnowledge();
    const systemInstruction = `You are the official, polite, and helpful virtual receptionist for Oxford Excellence Academy located in Karachi, Pakistan.
You assist parents and visitors on WhatsApp.
- Always answer in the SAME language the user writes in (Urdu, Roman Urdu, or English).
- Be polite, professional, concise, and structured with clean bullet points or line breaks suitable for WhatsApp.
- Base your answers on the official school knowledge base below.
- Do NOT use quotes around your answer. Answer directly and warmly.
- Strict Security & Privacy Rule:
${isRegisteredParent 
  ? `  * Context: The user is an authenticated parent of "${studentName}". If they ask about fees, dues, or challan, remind them they can reply "Fee" or "2" to get ${studentName}'s real-time breakdown instantly.`
  : `  * Context: The sender's phone number is UNREGISTERED. For student privacy and security, NEVER guess or disclose any student fee amounts, marks, attendance, or personal data. Instruct them that student portals are only accessible from their registered phone number, or advise them to contact the Accounts Office at 0320-5772271.`}

Official School Knowledge:
${knowledge}`;

    // Conversational multi-turn history (up to last 3 exchanges = 6 messages)
    let history = [];
    if (senderPhoneDigits && chatHistoryMap.has(senderPhoneDigits)) {
        const histObj = chatHistoryMap.get(senderPhoneDigits);
        history = (histObj.messages || []).slice(-6);
    }

    const currentTurn = { role: 'user', parts: [{ text: userQuestion }] };
    const contents = [...history, currentTurn];

    // Priority: gemini-3.5-flash-lite (fastest, ~1s, unlimited free quota), gemini-3.5-flash
    const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash'];
    for (const m of models) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemInstruction }] },
                    contents: contents,
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 350
                    }
                })
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (replyText && replyText.trim().length > 0) {
                    let cleanReply = replyText.trim();
                    if (cleanReply.startsWith('"') && cleanReply.endsWith('"')) {
                        cleanReply = cleanReply.slice(1, -1).trim();
                    }
                    // Save to conversation history
                    if (senderPhoneDigits) {
                        const histObj = chatHistoryMap.get(senderPhoneDigits) || { messages: [], lastUpdated: Date.now() };
                        histObj.messages.push(currentTurn);
                        histObj.messages.push({ role: 'model', parts: [{ text: cleanReply }] });
                        if (histObj.messages.length > 8) histObj.messages = histObj.messages.slice(-8);
                        histObj.lastUpdated = Date.now();
                        chatHistoryMap.set(senderPhoneDigits, histObj);
                    }
                    return cleanReply;
                }
            } else {
                console.log(`[Gemini API ${m} Status]`, res.status);
            }
        } catch (err) {
            console.log(`[Gemini AI ${m} Error]`, err.message);
        }
    }
    return null;
}

const BOT_START_TIME = Math.floor(Date.now() / 1000);

client.on('message', async (msg) => {
    try {
        // 1. Ignore old messages sent before this bot session started (prevents startup flood)
        if (msg.timestamp && msg.timestamp < BOT_START_TIME) {
            return;
        }

        // 2. Ignore status broadcasts, group chats, or our own messages
        if (msg.from === 'status@broadcast' || msg.from.endsWith('@g.us') || msg.fromMe) {
            return;
        }

        const senderChatId = msg.from; // e.g. "923162344290@c.us"
        const senderPhoneDigits = senderChatId.replace('@c.us', '').replace(/\D/g, '');
        const last10 = senderPhoneDigits.slice(-10);

        if (!last10 || last10.length < 9) return;

        // Anti-Flood Protection
        if (!checkRateLimit(senderPhoneDigits)) {
            console.log(`[Security] Rate limit triggered for ${senderPhoneDigits}`);
            return; // Silently cooldown
        }

        const rawText = (msg.body || '').trim();
        const text = rawText.toLowerCase();

        // 3. Ignore empty text or media-only messages (voice notes, images, stickers)
        if (!rawText || rawText.length === 0) return;

        console.log(`[Chatbot Inbox] Message from ${senderPhoneDigits}: "${rawText}"`);

        // 4. Check if sender is a Teacher or Staff member
        // Staff/Teachers should NOT receive automated student portal messages
        try {
            const allStaff = await getCachedStaff();
            const isTeacher = (allStaff || []).some(st => {
                const d = st.data || {};
                const p1 = cleanDigits(d.phone);
                const p2 = cleanDigits(d.whatsapp);
                return (p1 && p1 === last10) || (p2 && p2 === last10);
            });
            if (isTeacher) {
                console.log(`[Chatbot] Message from Teacher/Staff ${senderPhoneDigits}. Skipping bot to allow normal human chat.`);
                return;
            }
        } catch (stErr) {
            console.log('[Staff Check Warning]', stErr.message);
        }

        // 5. Identify registered students matching this phone number strictly
        const allStudents = await getCachedStudents();
        const matchedStudents = (allStudents || []).filter(s => {
            const d = s.data || {};
            const p1 = cleanDigits(d.whatsapp);
            const p2 = cleanDigits(d.fphone);
            const p3 = cleanDigits(d.phone);
            return (p1 && p1 === last10) || (p2 && p2 === last10) || (p3 && p3 === last10);
        });

        // ----------------------------------------------------------------------
        //  SECURITY ENFORCEMENT & SMART SILENCE: UNREGISTERED CALLERS
        // ----------------------------------------------------------------------
        if (matchedStudents.length === 0) {
            // Only respond if the sender is explicitly querying the school, admissions, or portal.
            // Do NOT spam casual chats, greetings from friends, personal messages, or vendors!
            const hasActiveSession = unregisteredSessions.has(senderPhoneDigits);
            const schoolKeywords = [
                '1', '2', '3', 'portal', 'menu', 'help', 'school', 'admission', 'admissions', 'dakhila', 
                'fee', 'fees', 'challan', 'timing', 'timings', 'time', 'hours', 'location', 'address', 
                'where', 'kahan', 'oxford', 'academy', 'class', 'classes', 'result', 'test', 'requirement', 
                'requirements', 'document', 'documents', 'open', 'uniform', 'contact', 'phone', 'number', 'call'
            ];
            const isIntentionalQuery = hasActiveSession || schoolKeywords.some(kw => text.includes(kw)) || rawText.endsWith('?') || rawText.includes('؟');

            if (!isIntentionalQuery) {
                console.log(`[Chatbot] Casual/unrelated message from ${senderPhoneDigits}. Staying silent for normal chat.`);
                return;
            }

            // Update unregistered session activity
            const prevSession = unregisteredSessions.get(senderPhoneDigits) || { greetedCount: 0 };
            unregisteredSessions.set(senderPhoneDigits, { lastActive: Date.now(), greetedCount: prevSession.greetedCount });

            // Only serve public institutional information & AI general questions.
            await handleUnregisteredUser(msg, text, rawText, senderPhoneDigits);
            return;
        }

        // ----------------------------------------------------------------------
        //  REGISTERED PARENT EXPERIENCE
        // ----------------------------------------------------------------------
        let session = userSessions.get(senderPhoneDigits);
        if (!session) {
            session = {
                selectedStudentId: matchedStudents[0].id,
                children: matchedStudents.map(m => ({
                    id: m.id,
                    name: m.data?.name || 'Student',
                    roll: m.data?.roll || '',
                    classId: m.class_id || m.data?.classId || ''
                })),
                lastActive: Date.now()
            };
            userSessions.set(senderPhoneDigits, session);
        } else {
            session.lastActive = Date.now();
        }

        // Handle multi-child selection commands (if parent has >1 student)
        if (matchedStudents.length > 1) {
            if (text === 'switch' || text === '5' || text === 'children' || text === 'bachay') {
                return showChildSelectionPrompt(msg, session.children);
            }

            // Check if user picked a child number (e.g. "child 1", "child 2", or "1" if in selection mode)
            if (session.awaitingChildSelection) {
                const pickedNum = parseInt(text, 10);
                if (!isNaN(pickedNum) && pickedNum >= 1 && pickedNum <= session.children.length) {
                    session.selectedStudentId = session.children[pickedNum - 1].id;
                    session.awaitingChildSelection = false;
                    const child = session.children[pickedNum - 1];
                    await msg.reply(`✅ *${child.name}* selected!\n\n${buildParentMenu(child.name)}`);
                    return;
                }
            }
        }

        // Smart Child Name Detection: If parent mentions child name, auto-switch to them!
        if (session.children.length > 1) {
            for (const child of session.children) {
                const firstName = (child.name || '').trim().toLowerCase().split(' ')[0];
                if (firstName.length >= 3 && text.includes(firstName)) {
                    session.selectedStudentId = child.id;
                    break;
                }
            }
        }

        // Active Child Details
        const activeStudent = matchedStudents.find(s => s.id === session.selectedStudentId) || matchedStudents[0];
        const studentData = activeStudent.data || {};
        const studentName = studentData.name || 'Student';
        const fatherName = studentData.father || 'Parent';
        const classId = activeStudent.class_id || studentData.classId || '';

        // Router with smart option normalization and natural intent recognition
        const opt = parseMenuOption(text);

        const isAttendance = opt === 1 || text.includes('attend') || text.includes('hazri') || text.includes('hazir') || text.includes('حاضری');
        const isFee = opt === 2 || 
            /\b(fee|fees|feee|fess|challan|chalan|dues|balance|arrear|arrears|tuition)\b/i.test(text) || 
            text.includes('فیس') || text.includes('چالان') || text.includes('بقایا');
        const isResult = opt === 3 || text.includes('result') || text.includes('grade') || text.includes('marks') || text.includes('report') || text.includes('exam') || text.includes('نتیجہ') || text.includes('رزلٹ') || text.includes('نمبر');
        const isSchoolInfo = opt === 4 || text.includes('timing') || text.includes('timings') || text.includes('location') || text.includes('address') || text.includes('contact') || text.includes('office') || text.includes('اوقات') || text.includes('ٹائمنگ') || text.includes('پتہ');

        if (opt === 0) {
            await replyWelcomeMenu(msg, fatherName, studentName, session.children);
        } else if (isAttendance) {
            await replyAttendance(msg, activeStudent.id, classId, studentName);
        } else if (isFee) {
            await replyFees(msg, activeStudent.id, studentData, studentName);
        } else if (isResult) {
            await replyResults(msg, activeStudent.id, classId, studentName);
        } else if (isSchoolInfo) {
            await replySchoolInfo(msg);
        } else if ((opt === 5 || text.includes('switch') || text.includes('child') || text.includes('bachay')) && session.children.length > 1) {
            await showChildSelectionPrompt(msg, session.children);
        } else {
            // Check if user is asking a general question or greeting
            const isGreeting = ['hi', 'hello', 'salam', 'assalam', 'aoa', 'hey', 'start'].includes(text);
            if (!isGreeting && rawText.length > 2) {
                const aiAnswer = await askGeminiAI(rawText, true, studentName, senderPhoneDigits);
                if (aiAnswer) {
                    await msg.reply(
                        `${aiAnswer}\n\n` +
                        `━━━━━━━━━━━━━━━━━━━━━━\n` +
                        `_💡 Quick Menu for ${studentName}: 1 Attendance | 2 Fees | 3 Results | 0 Main Menu_`
                    );
                    return;
                }
            }

            // Default Menu Greeting
            await replyWelcomeMenu(msg, fatherName, studentName, session.children);
        }

    } catch (err) {
        console.error('[Chatbot Error]', err);
    }
});

// ==============================================================================
//  CHATBOT RESPONSE GENERATORS
// ==============================================================================

/**
 * Security: Response for numbers not registered in the school database.
 */
async function handleUnregisteredUser(msg, text, rawText, senderPhoneDigits) {
    const opt = parseMenuOption(text);

    const isTimings = opt === 1 || text.includes('timing') || text.includes('hours') || text.includes('location') || text.includes('address') || text.includes('اوقات') || text.includes('ٹائمنگ') || text.includes('پتہ');
    const isAdmissions = opt === 2 || text.includes('admission') || text.includes('dakhila') || text.includes('requirement') || text.includes('document') || text.includes('داخلہ') || text.includes('داخلے') || text.includes('ایڈمیشن');
    const isContact = opt === 3 || text.includes('call') || text.includes('contact') || text.includes('office') || text.includes('phone') || text.includes('helpline') || text.includes('رابطہ') || text.includes('فون');

    // 1. Menu option 1: Timings & Location
    if (isTimings) {
        return replySchoolInfo(msg);
    }

    // Check if user is asking about fees / dues / challan
    const isFeeQuery = /\b(fee|fees|feee|fess|challan|chalan|dues|balance|arrear|arrears|tuition)\b/i.test(text) || 
                       text.includes('فیس') || text.includes('چالان') || text.includes('بقایا');

    // 2. Strict Security Enforcement: Student data & fees are strictly private
    if (isFeeQuery) {
        return msg.reply(
            `🔒 *Private & Protected Student Portal*\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n` +
            `Assalam-o-Alaikum!\n` +
            `Student fee statements, attendance, and exam reports are strictly private and can *ONLY* be accessed from the parent's registered mobile number on school record.\n\n` +
            `📌 *Your phone number is not currently registered on file.*\n\n` +
            `• If you are an enrolled student's parent, please message from your registered phone number.\n` +
            `• To update or register your mobile number, please contact the School Accounts Office:\n` +
            `📞 *Helpline / WhatsApp:* 0320-5772271\n` +
            `⏰ *Timings:* Mon–Sat: 8:00 AM – 1:30 PM`
        );
    }

    // 3. Menu option 2: Admissions Requirements (only if not fee query)
    if (isAdmissions) {
        return msg.reply(
            `🏫 *Oxford Excellence Academy - Admissions 2026-27*\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n` +
            `🌟 Admissions are currently OPEN from Montessori to Matric.\n\n` +
            `📋 *Required Documents:*\n` +
            `• Student B-Form / Birth Certificate copy\n` +
            `• Father / Guardian CNIC copy\n` +
            `• 4 Passport-size photographs\n` +
            `• Previous School Leaving Certificate (if applicable)\n\n` +
            `📍 *Campus:* R-84, Sector 10, Gulshan-e-Millat, Bagh-e-Korangi, Karachi\n` +
            `📞 *Office:* 0320-5772271 (Mon–Sat: 8:00 AM – 1:30 PM)`
        );
    }

    // 4. Menu option 3: Contact Office
    if (isContact) {
        return msg.reply(
            `📞 *Oxford Excellence Academy - Office Contact*\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n` +
            `• Phone / WhatsApp: *0320-5772271*\n` +
            `• Timings: Mon–Thu & Sat (8:00 AM – 1:30 PM), Fri (8:00 AM – 12:30 PM)\n` +
            `• Campus: R-84, Sector 10, Gulshan-e-Millat, Bagh-e-Korangi, Karachi\n` +
            `• Website: https://www.oxfordexcellenceacademy.com`
        );
    }

    const unreg = unregisteredSessions.get(senderPhoneDigits) || { greetedCount: 0 };
    const isGreeting = ['hi', 'hello', 'salam', 'assalam', 'aoa', 'hey', 'start', 'menu', 'help'].includes(text);

    // If pure greeting
    if (isGreeting) {
        if (unreg.greetedCount > 0) {
            // Already in an ongoing conversation: brief polite reply, NOT the giant banner!
            return msg.reply(`Assalam-o-Alaikum! How can I assist you with Oxford Excellence Academy? Please ask your question, or reply 1 for Timings & Location, 2 for Admissions.`);
        }
        unreg.greetedCount++;
        unregisteredSessions.set(senderPhoneDigits, unreg);

        return msg.reply(
            `🏫 *Oxford Excellence Academy*\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n` +
            `Assalam-o-Alaikum! Welcome to Oxford Excellence Academy Official Helpdesk.\n\n` +
            `📌 *Public Information:*\n` +
            `1️⃣ School Hours & Location\n` +
            `2️⃣ Admissions Requirements\n` +
            `3️⃣ Call Administration Office: 0320-5772271\n\n` +
            `_Reply with 1 or 2, or ask any question about admissions, fees, or timings!_`
        );
    }

    // 4. For questions (e.g. "Admissions are open?", "Admission fee", "School address?"):
    // Ask Gemini AI directly with multi-turn memory!
    if (rawText && rawText.length > 2) {
        const aiAnswer = await askGeminiAI(rawText, false, '', senderPhoneDigits);
        if (aiAnswer) {
            unreg.greetedCount++;
            unregisteredSessions.set(senderPhoneDigits, unreg);
            return msg.reply(aiAnswer);
        }
    }

    // 5. Fallback if AI is unavailable (short & clean, NEVER the giant banner on ongoing chats!)
    if (unreg.greetedCount > 0) {
        return msg.reply(
            `For any school questions, please reply:\n` +
            `1️⃣ School Hours & Location\n` +
            `2️⃣ Admissions Requirements\n` +
            `📞 Or call our office helpline: 0320-5772271`
        );
    }

    unreg.greetedCount++;
    unregisteredSessions.set(senderPhoneDigits, unreg);
    await msg.reply(
        `🏫 *Oxford Excellence Academy*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Assalam-o-Alaikum! Welcome to Oxford Excellence Academy Official Helpdesk.\n\n` +
        `📌 *Public Information:*\n` +
        `1️⃣ School Hours & Location\n` +
        `2️⃣ Admissions Requirements\n` +
        `3️⃣ Call Administration Office: 0320-5772271\n\n` +
        `_Reply with 1 or 2, or ask any question about admissions, fees, or timings!_`
    );
}

/**
 * Welcome menu for authorized parents.
 */
async function replyWelcomeMenu(msg, fatherName, studentName, children) {
    let childPickerNote = '';
    if (children && children.length > 1) {
        childPickerNote = `5️⃣ *Switch Child* (${children.length} registered)\n`;
    }

    await msg.reply(
        `Assalam-o-Alaikum *${fatherName}*! 🎓\n` +
        `*Oxford Excellence Academy Official Portal*\n` +
        `Active Student: *${studentName}*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `Please reply with a number:\n` +
        `1️⃣ *Attendance Summary* (Current Month)\n` +
        `2️⃣ *Fee Status & Dues*\n` +
        `3️⃣ *Academic Results & Marks*\n` +
        `4️⃣ *School Timings & Location*\n` +
        `${childPickerNote}` +
        `\n_Reply with 1, 2, 3, or 4 to view details._`
    );
}

function buildParentMenu(studentName) {
    return (
        `*Menu for ${studentName}:*\n` +
        `1️⃣ Attendance Summary\n` +
        `2️⃣ Fee Status\n` +
        `3️⃣ Academic Results\n` +
        `4️⃣ School Info\n` +
        `5️⃣ Switch Child`
    );
}

/**
 * Multi-child selection prompt.
 */
async function showChildSelectionPrompt(msg, children) {
    let list = '';
    children.forEach((c, i) => {
        list += `${i + 1}️⃣ *${c.name}* (Roll #${c.roll || '-'})\n`;
    });

    const senderDigits = msg.from.replace('@c.us', '').replace(/\D/g, '');
    const session = userSessions.get(senderDigits);
    if (session) session.awaitingChildSelection = true;

    await msg.reply(
        `👨‍👩‍👧‍👦 *Multiple Students Registered*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Please select which child you would like to view:\n\n` +
        `${list}\n` +
        `_Reply with the number (e.g. 1 or 2) to select._`
    );
}

/**
 * 1. Attendance Record
 */
async function replyAttendance(msg, studentId, classId, studentName) {
    try {
        const { data: attRow } = await supabase
            .from('attendance')
            .select('*')
            .eq('id', `${classId}_${studentId}`)
            .maybeSingle();

        const dates = attRow?.data || {};
        const now = new Date();
        const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        let present = 0, absent = 0, leave = 0;
        for (const [dStr, status] of Object.entries(dates)) {
            if (dStr.startsWith(currentMonthPrefix)) {
                if (status === 'P') present++;
                else if (status === 'A') absent++;
                else if (status === 'L') leave++;
            }
        }

        const totalDays = present + absent + leave;
        if (totalDays === 0) {
            return msg.reply(
                `📅 *Attendance Report - ${studentName}*\n` +
                `━━━━━━━━━━━━━━━━━━━━━━\n` +
                `🗓️ Month: *${now.toLocaleString('default', { month: 'long', year: 'numeric' })}*\n\n` +
                `ℹ️ No attendance marks have been recorded yet for this month.\n\n` +
                `_Reply 0 for Main Menu._`
            );
        }

        const regularity = Math.round((present / totalDays) * 100);

        await msg.reply(
            `📅 *Attendance Report - ${studentName}*\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n` +
            `🗓️ Month: *${now.toLocaleString('default', { month: 'long', year: 'numeric' })}*\n\n` +
            `✅ Present: *${present} Days*\n` +
            `❌ Absent: *${absent} Days*\n` +
            `📝 Leave: *${leave} Days*\n` +
            `⭐ Regularity: *${regularity}%*\n\n` +
            `_Reply 0 for Main Menu._`
        );
    } catch (e) {
        console.error('[Attendance Report Error]', e.message);
        await msg.reply(`⚠️ Could not retrieve attendance. Please try again or reply 0.`);
    }
}

/**
 * 2. Fee Status & Dues (100% Consistent with Official Web Challan)
 */
async function replyFees(msg, studentId, studentData, studentName) {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 1-12
        const currentMonthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

        const mNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const currentMonthName = mNames[currentMonth - 1] || currentMonthKey;

        // Fetch fee records
        const { data: feesRows } = await supabase.from('fees').select('*');
        const allFees = feesRows || [];

        // 1. Current Month Charges
        const tuition = Number(studentData.customFee || studentData.fee || 2000);
        const vanFee = Number(studentData.vanFee || 0);
        const initialArrears = Number(studentData.arrears || 0);

        let currentCharges = tuition + vanFee;
        let breakdownLines = `• Monthly Tuition: *Rs. ${tuition.toLocaleString()}*\n`;
        if (vanFee > 0) breakdownLines += `• Transport / Van: *Rs. ${vanFee.toLocaleString()}*\n`;

        // Check fee items (Examination Fee, Annual Fund, etc.)
        allFees.filter(r => r.id && r.id.startsWith('item_') && r.data?.id !== 'f1').forEach(itemRow => {
            const item = itemRow.data || {};
            if (item.applyMonth && item.applyMonth !== 'All' && item.applyMonth.toLowerCase() !== currentMonthName.toLowerCase()) return;
            const amt = Number(item.amount || 0);
            if (amt > 0) {
                currentCharges += amt;
                breakdownLines += `• ${item.name}: *Rs. ${amt.toLocaleString()}*\n`;
            }
        });

        // 2. Check current month ledger
        const curLedgerRow = allFees.find(r => r.id === `ledger_${studentId}_${currentMonthKey}`);
        const isCurrentMonthPaid = curLedgerRow?.data?.paid === true;

        // 3. Check prior unpaid months (from 2026-08 up to last month)
        let priorUnpaidSum = 0;
        let priorUnpaidLines = '';
        let scanP = '2026-08';
        while (scanP < currentMonthKey) {
            const pParts = scanP.split('-');
            const pIdx = parseInt(pParts[1], 10) - 1;
            const pName = mNames[pIdx] || scanP;

            const pLedger = allFees.find(r => r.id === `ledger_${studentId}_${scanP}`);
            const pPaid = pLedger?.data?.paid === true;

            if (!pPaid) {
                let pTotal = tuition + vanFee;
                allFees.filter(r => r.id && r.id.startsWith('item_') && r.data?.id !== 'f1').forEach(itemRow => {
                    const item = itemRow.data || {};
                    if (item.applyMonth && item.applyMonth !== 'All' && item.applyMonth.toLowerCase() === pName.toLowerCase()) {
                        pTotal += Number(item.amount || 0);
                    }
                });
                priorUnpaidSum += pTotal;
                priorUnpaidLines += `• ${pName} Fee (Unpaid): *Rs. ${pTotal.toLocaleString()}*\n`;
            }

            // Next month
            let [y, mo] = scanP.split('-').map(Number);
            mo++;
            if (mo > 12) { mo = 1; y++; }
            scanP = y + '-' + String(mo).padStart(2, '0');
        }

        if (initialArrears > 0) {
            priorUnpaidLines += `• Previous Balance (Arrears): *Rs. ${initialArrears.toLocaleString()}*\n`;
        } else if (initialArrears < 0) {
            priorUnpaidLines += `• Advance Credit: *-Rs. ${Math.abs(initialArrears).toLocaleString()}*\n`;
        }

        const totalPayable = Math.max(0, (isCurrentMonthPaid ? 0 : currentCharges) + priorUnpaidSum + initialArrears);

        let msgText = `💳 *FEE STATEMENT - ${studentName.toUpperCase()}*\n`;
        msgText += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        msgText += `🗓️ Month: *${currentMonthName} ${currentYear}*\n`;
        msgText += `📌 Status: *${isCurrentMonthPaid ? 'PAID ✅' : 'PENDING ⏳'}*\n\n`;

        msgText += `*${currentMonthName} Fee Breakdown:*\n`;
        msgText += breakdownLines;
        msgText += `_(Current Subtotal: Rs. ${currentCharges.toLocaleString()})_\n\n`;

        if (priorUnpaidLines) {
            msgText += `*Unpaid Prior Dues & Arrears:*\n`;
            msgText += priorUnpaidLines;
            msgText += `\n`;
        }

        msgText += `-------------------------\n`;
        msgText += `*TOTAL PAYABLE: Rs. ${totalPayable.toLocaleString()}*\n`;
        msgText += `-------------------------\n\n`;
        msgText += `🏦 *Payment:* Dues can be submitted at the School Accounts Office.\n`;
        msgText += `_Reply 0 for Main Menu._`;

        await msg.reply(msgText);
    } catch (e) {
        console.error('[Fee Statement Error]', e.message);
        await msg.reply(`⚠️ Could not retrieve fee records. Please try again or reply 0.`);
    }
}

/**
 * 3. Academic Results & Grades
 */
async function replyResults(msg, studentId, classId, studentName) {
    try {
        // Fetch subjects map
        const { data: subRows } = await supabase.from('miscellaneous').select('*').like('id', 'subject_%');
        const subjectsMap = {};
        (subRows || []).forEach(r => {
            if (r.data?.id) subjectsMap[r.data.id] = r.data.name || 'Subject';
        });

        // Fetch grades for this class
        const { data: gradeRecords } = await supabase.from('grades').select('*').like('id', `${classId}_%`);
        if (!gradeRecords || gradeRecords.length === 0) {
            return msg.reply(
                `📊 *Academic Assessment - ${studentName}*\n` +
                `━━━━━━━━━━━━━━━━━━━━━━\n` +
                `Recent examination results for this term are currently being finalized by the examination board.\n\n` +
                `_Reply 0 for Main Menu._`
            );
        }

        // Find grade record with marks for this student
        let studentGrades = {};
        for (const gr of gradeRecords) {
            if (gr.data?.[studentId] && Object.keys(gr.data[studentId]).length > 0) {
                studentGrades = gr.data[studentId];
                break;
            }
        }

        const entries = Object.entries(studentGrades).filter(([_, marks]) => typeof marks === 'number');

        if (entries.length === 0) {
            return msg.reply(
                `📊 *Academic Assessment - ${studentName}*\n` +
                `━━━━━━━━━━━━━━━━━━━━━━\n` +
                `Recent examination results for this term are currently being finalized by the examination board.\n\n` +
                `_Reply 0 for Main Menu._`
            );
        }

        let totalObtained = 0;
        let totalMax = entries.length * 100;
        let breakdown = '';

        entries.forEach(([subId, marks]) => {
            const subName = subjectsMap[subId] || 'Subject';
            totalObtained += marks;
            const letter = marks >= 80 ? 'A+' : marks >= 70 ? 'A' : marks >= 60 ? 'B' : marks >= 50 ? 'C' : marks >= 40 ? 'D' : 'F';
            breakdown += `• *${subName}*: ${marks}/100 (${letter})\n`;
        });

        const overallPct = Math.round((totalObtained / totalMax) * 100);
        const standing = overallPct >= 40 ? 'PASSED / PROMOTED 🎓' : 'NEEDS ATTENTION ⚠️';

        await msg.reply(
            `📊 *Academic Assessment - ${studentName}*\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n` +
            `${breakdown}\n` +
            `🏆 Total Marks: *${totalObtained} / ${totalMax}* (${overallPct}%)\n` +
            `⭐ Result: *${standing}*\n\n` +
            `_Reply 0 for Main Menu._`
        );
    } catch (e) {
        console.error('[Results Report Error]', e.message);
        await msg.reply(`⚠️ Could not retrieve exam results. Please try again or reply 0.`);
    }
}

/**
 * 4. School Information & Timings
 */
async function replySchoolInfo(msg) {
    await msg.reply(
        `🏫 *Oxford Excellence Academy*\n` +
        `_Learn • Grow • Excel_\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📍 *Location:*\n` +
        `R-84, Sector 10, Gulshan-e-Millat, Bagh-e-Korangi, Karachi\n\n` +
        `⏰ *School Timings:*\n` +
        `• Monday – Thursday & Saturday: 8:00 AM – 1:30 PM\n` +
        `• Friday: 8:00 AM – 12:30 PM\n` +
        `• Sunday: Closed\n\n` +
        `📞 *Office Helpline:* 0320-5772271\n` +
        `🌐 *Website:* https://www.oxfordexcellenceacademy.com\n\n` +
        `_Reply 0 for Main Menu._`
    );
}

// Start WhatsApp Client
client.initialize();
