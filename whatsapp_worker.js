const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// 1. Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iprqtkmtelgdhlenlsrc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_DX0GG-V6vp9ey7_FxbvLdw_ql-E8nEt';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Cache school logo base64 if available
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

// 2. Initialize WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let isReady = false;
let isProcessing = false;

console.log("__STATUS__:DISCONNECTED");

client.on('qr', (qr) => {
    console.log('\n======================================================');
    console.log(' ACTION REQUIRED: Scan this QR Code with WhatsApp!');
    console.log(' Open WhatsApp -> Linked Devices -> Link a Device');
    console.log('======================================================\n');
    qrcode.generate(qr, {small: true});
    console.log("__QR__:" + qr);
    console.log("__STATUS__:SCAN_QR");
});

client.on('ready', async () => {
    console.log('\n✅ WhatsApp Web Client is READY!');
    isReady = true;
    console.log("__STATUS__:CONNECTED");

    // ✅ FIX #1: Auto-reset ALL 'error' messages back to 'pending' on startup
    // This means you NEVER need to run that SQL manually again!
    try {
        const { data: resetData, error: resetError } = await supabase
            .from('whatsapp_outbox')
            .update({ status: 'pending' })
            .eq('status', 'error');
        if (!resetError) {
            console.log('[Startup] Auto-reset any error messages back to pending ✅');
        }
    } catch (e) {
        console.log('[Startup] Could not auto-reset error messages:', e.message);
    }

    // Small delay to let session stabilize before processing
    await new Promise(r => setTimeout(r, 3000));
    processQueue();
});

client.on('authenticated', () => {
    console.log('✅ Authentication successful!');
});

client.on('auth_failure', msg => {
    console.error('❌ Authentication failure:', msg);
    isReady = false;
    console.log("__STATUS__:DISCONNECTED");
});

client.on('disconnected', async (reason) => {
    console.log('⚠️ WhatsApp disconnected:', reason);
    isReady = false;
    console.log("__STATUS__:DISCONNECTED");

    // Try to reinitialize after 10 seconds
    console.log('[Reconnect] Attempting to reconnect in 10 seconds...');
    await new Promise(r => setTimeout(r, 10000));
    try {
        await client.initialize();
    } catch (e) {
        console.error('[Reconnect] Failed:', e.message);
    }
});

client.initialize();

// 3. Process Queue
async function processQueue() {
    if (isProcessing || !isReady) return;
    isProcessing = true;

    try {
        const { data: messages, error } = await supabase
            .from('whatsapp_outbox')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(10);

        if (error) throw error;
        if (!messages || messages.length === 0) {
            isProcessing = false;
            return;
        }

        console.log(`[Queue] Processing ${messages.length} pending messages...`);

        // ✅ FIX #2: Extended expiry from 12h → 24h
        // Messages queued in evening will still send next morning
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        for (const msg of messages) {
            // Skip messages older than 24 hours
            if (msg.created_at < twentyFourHoursAgo) {
                console.log(`[Expired] Skipping old message to ${msg.recipient_phone} from ${msg.created_at}`);
                await supabase
                    .from('whatsapp_outbox')
                    .update({ status: 'failed_expired' })
                    .eq('id', msg.id);
                continue;
            }

            console.log(`[Queue] Sending to ${msg.recipient_phone}...`);

            try {
                // Format phone number: 923XXXXXXXXX@c.us
                let cleanPhone = String(msg.recipient_phone).replace(/\D/g, '');
                if (cleanPhone.startsWith('0092')) {
                    cleanPhone = cleanPhone.substring(2);
                }
                if (cleanPhone.startsWith('920')) {
                    cleanPhone = '92' + cleanPhone.substring(3);
                } else if (cleanPhone.startsWith('03')) {
                    cleanPhone = '92' + cleanPhone.substring(1);
                } else if (cleanPhone.startsWith('3') && cleanPhone.length === 10) {
                    cleanPhone = '92' + cleanPhone;
                }
                const chatId = `${cleanPhone}@c.us`;

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
                        await page.setViewport({ width: 440, height: 750, deviceScaleFactor: 2 });

                        let rowsHtml = '';
                        (payload.particulars || []).forEach(p => {
                            const isAlert = p.isUnpaid;
                            const isCredit = p.isCredit;
                            const color = isAlert ? '#b91c1c' : (isCredit ? '#166534' : '#1e293b');
                            const weight = (isAlert || isCredit) ? '700' : '400';
                            rowsHtml += `
                            <tr>
                              <td style="padding:5px 8px; border:1px solid #222; font-size:11.5px; color:${color}; font-weight:${weight};">${p.name}</td>
                              <td style="padding:5px 8px; border:1px solid #222; font-size:11.5px; text-align:right; color:${color}; font-weight:700;">PKR ${Number(p.amount || 0).toLocaleString()}</td>
                            </tr>`;
                        });

                        const logoImgTag = cachedLogoBase64 ? `<img src="${cachedLogoBase64}" style="max-width:100%; max-height:100%; object-fit:contain;">` : '';

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
                            width: 360px;
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
                            margin-bottom: 38px;
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
                            font-size: 12.5px;
                            font-weight: 900;
                            padding: 7px 8px;
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
                                <div class="challan-badge-wrap">FEE CHALLAN - <span class="challan-badge">${payload.month_label}</span></div>
                              </div>
                            </div>

                            <table class="info-table">
                              <tr><td class="info-label">Name:</td><td class="info-value">${payload.student_name}</td></tr>
                              <tr><td class="info-label">Roll:</td><td class="info-value">${payload.roll}</td></tr>
                              <tr><td class="info-label">Class:</td><td class="info-value">${payload.class_name}</td></tr>
                            </table>

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
                                  <th style="text-align:left;">TOTAL PAYABLE</th>
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

                // Check if message is a JSON Fee Voucher Image payload
                let isVoucherPayload = false;
                let voucherData = null;
                if (typeof msg.message_body === 'string' && msg.message_body.trim().startsWith('{')) {
                    try {
                        const parsed = JSON.parse(msg.message_body);
                        if (parsed && parsed.type === 'fee_voucher_image') {
                            isVoucherPayload = true;
                            voucherData = parsed;
                        }
                    } catch (e) {
                        // Not JSON, normal text message
                    }
                }

                if (isVoucherPayload && voucherData) {
                    console.log(`[Voucher] Generating HD fee card photo for ${voucherData.student_name}...`);
                    const b64 = await renderVoucherCardImage(voucherData);
                    const media = new MessageMedia('image/png', b64, `Fee_Challan_${voucherData.roll || 'voucher'}.png`);
                    await client.sendMessage(chatId, media, { caption: voucherData.caption || '' });
                    console.log(`[✅ Sent Photo Voucher] to ${cleanPhone} for ${voucherData.student_name}`);
                } else {
                    // Normal text message
                    await client.sendMessage(chatId, msg.message_body);
                    console.log(`[✅ Sent] to ${cleanPhone}`);
                }

                await supabase
                    .from('whatsapp_outbox')
                    .update({ status: 'sent', sent_at: new Date().toISOString() })
                    .eq('id', msg.id);

            } catch (err) {
                const errMsg = err.message || String(err);
                console.error(`[❌ Error] Failed to send to ${msg.recipient_phone}: ${errMsg}`);

                // If number not registered on WhatsApp
                if (errMsg.includes('not registered') || errMsg.includes('invalid wid')) {
                    await supabase
                        .from('whatsapp_outbox')
                        .update({ status: 'failed_not_registered' })
                        .eq('id', msg.id);
                    continue;
                }

                // ✅ FIX #4: For ALL other errors, mark as 'error' immediately
                // But on next startup, it will be auto-reset to 'pending' and retried
                // This means no message is permanently lost
                await supabase
                    .from('whatsapp_outbox')
                    .update({ status: 'error' })
                    .eq('id', msg.id);
            }

            // Human-like delay between messages (4–8 seconds) to prevent WhatsApp ban
            const delay = Math.floor(Math.random() * (8000 - 4000 + 1)) + 4000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }

    } catch (err) {
        console.error('[Worker Error]', err.message);
    } finally {
        isProcessing = false;
    }
}

// 4. Listen to Supabase Realtime for new messages
supabase.channel('schema-db-changes')
    .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'whatsapp_outbox', filter: 'status=eq.pending' },
        (payload) => {
            if (isReady) {
                console.log('[Realtime] New message queued — processing...');
                processQueue();
            }
        }
    )
    .subscribe();

// 5. Polling fallback every 15 seconds
setInterval(() => {
    if (isReady) processQueue();
}, 15000);

console.log('[Worker] Starting WhatsApp client... Please wait.');
