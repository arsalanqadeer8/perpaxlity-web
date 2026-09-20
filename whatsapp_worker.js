const { createClient } = require('@supabase/supabase-js');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');


// 1. Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iprqtkmtelgdhlenlsrc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_DX0GG-V6vp9ey7_FxbvLdw_ql-E8nEt';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Initialize WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let isReady = false;
    console.log("__STATUS__:DISCONNECTED");
let isProcessing = false;
const retryMap = {};

client.on('qr', (qr) => {
    console.log('\n======================================================');
    console.log(' ACTION REQUIRED: Scan this QR Code with WhatsApp!');
    console.log(' Open WhatsApp -> Linked Devices -> Link a Device');
    console.log('======================================================\n');
    qrcode.generate(qr, {small: true});
    console.log("__QR__:" + qr);
    console.log("__STATUS__:SCAN_QR");
});

client.on('ready', () => {
    console.log('\n? WhatsApp Web Client is READY!');
    console.log('The worker is now silently waiting for automated messages in the background...\n');
    isReady = true;
    console.log("__STATUS__:CONNECTED");
    processQueue(); // Start processing immediately in case there are pending messages
});

client.on('authenticated', () => {
    console.log('Authentication successful!');
});

client.on('auth_failure', msg => {
    console.error('Authentication failure:', msg);
});

client.on('disconnected', (reason) => {
    console.log('WhatsApp disconnected:', reason);
    isReady = false;
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
        
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
        
        for (const msg of messages) {
            // Check if the message is too old (e.g. from a previous day)
            if (msg.created_at < twelveHoursAgo) {
                console.log(`[Expired] Skipping old message to ${msg.recipient_phone} from ${msg.created_at}`);
                await supabase
                    .from('whatsapp_outbox')
                    .update({ status: 'failed_expired' })
                    .eq('id', msg.id);
                continue;
            }
            
            console.log(`[Queue] Sending message to ${msg.recipient_phone}...`);
            
            try {
                // WhatsApp Web JS requires phone numbers to be formatted like "923001234567@c.us"
                let cleanPhone = String(msg.recipient_phone).replace(/\D/g, '');
                
                // Optional logic for handling short local numbers depending on country code
                if (cleanPhone.startsWith('03')) {
                    cleanPhone = '92' + cleanPhone.substring(1);
                }
                
                const chatId = `${cleanPhone}@c.us`;
                
                // Check if number is registered on WhatsApp
                const isRegistered = await client.isRegisteredUser(chatId);
                
                if (isRegistered) {
                    await client.sendMessage(chatId, msg.message_body);
                    console.log(`[Success] Sent to ${cleanPhone}.`);
                    await supabase
                        .from('whatsapp_outbox')
                        .update({ status: 'sent', sent_at: new Date().toISOString() })
                        .eq('id', msg.id);
                } else {
                    console.log(`[Failed] Number ${cleanPhone} is NOT registered on WhatsApp.`);
                    await supabase
                        .from('whatsapp_outbox')
                        .update({ status: 'failed_not_registered' })
                        .eq('id', msg.id);
                }
                
                // Smart Human Delay: Wait between 4 to 8 seconds to prevent bans
                const delay = Math.floor(Math.random() * (8000 - 4000 + 1)) + 4000;
                await new Promise(resolve => setTimeout(resolve, delay));
                
                        } catch (err) {
                console.error(`[Error] Failed to send to ${msg.recipient_phone}:`, err.message);
                
                if (!retryMap[msg.id]) retryMap[msg.id] = 0;
                retryMap[msg.id]++;
                
                if (retryMap[msg.id] >= 10) {
                    console.log(`[Give Up] Marking as error after 10 failed attempts for ${msg.recipient_phone}`);
                    await supabase
                        .from('whatsapp_outbox')
                        .update({ status: 'error' })
                        .eq('id', msg.id);
                } else {
                    console.log(`[Retry] Network error, leaving in pending state (Attempt ${retryMap[msg.id]}/10)`);
                    await new Promise(res => setTimeout(res, 30000));
                }
            }
        }
    } catch (error) {
        console.error("[Worker Error]", error);
    } finally {
        isProcessing = false;
    }
}

// 4. Listen to Supabase Realtime Queue
supabase.channel('schema-db-changes')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'whatsapp_outbox', filter: "status=eq.pending" },
    (payload) => {
        if (isReady) {
            console.log("[Realtime Event] New message added to queue.");
            processQueue();
        }
    }
  )
  .subscribe();

// Polling fallback every 15 seconds
setInterval(() => {
    if (isReady) processQueue();
}, 15000);
