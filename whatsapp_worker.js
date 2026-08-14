const { createClient } = require('@supabase/supabase-js');

// 1. Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_ANON_KEY';
const OPENWA_URL = process.env.OPENWA_URL || 'http://localhost:2886';
const OPENWA_API_KEY = process.env.OPENWA_API_KEY || 'your-openwa-api-key';

if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
  console.error("ERROR: Please set your SUPABASE_URL and SUPABASE_KEY in whatsapp_worker.js or via environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let isProcessing = false;

async function sendToOpenWA(phone, text) {
  try {
    const cleanPhone = String(phone).replace(/\D/g, '');
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(`${OPENWA_URL}/api/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': OPENWA_API_KEY,
        'Authorization': `Bearer ${OPENWA_API_KEY}`
      },
      body: JSON.stringify({
        chatId: `${cleanPhone}@c.us`,
        text: text,
        session: 'default'
      })
    });
    
    if (!response.ok) {
      const errText = await response.text();
      console.error(`[OpenWA Error] HTTP ${response.status}: ${errText}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`[OpenWA Connection Error] Could not connect to OpenWA at ${OPENWA_URL}. Is it running?`, error.message);
    return false;
  }
}

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;
  
  try {
    const { data: messages, error } = await supabase
      .from('whatsapp_outbox')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);
      
    if (error) throw error;
    
    for (const msg of messages) {
      console.log(`[Queue] Processing message to ${msg.recipient_phone}...`);
      
      const success = await sendToOpenWA(msg.recipient_phone, msg.message_body);
      
      if (success) {
        console.log(`[Success] Sent to ${msg.recipient_phone}. Marking as sent.`);
        await supabase
          .from('whatsapp_outbox')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', msg.id);
      } else {
        console.log(`[Failed] Could not send to ${msg.recipient_phone}. Will retry later.`);
      }
      
      // Sleep for 3 seconds to avoid rate limits
      await new Promise(r => setTimeout(r, 3000));
    }
  } catch (error) {
    console.error("[Worker Error]", error);
  } finally {
    isProcessing = false;
  }
}

console.log("=========================================");
console.log(" WhatsApp Local-to-Cloud Worker Started! ");
console.log("=========================================");
console.log(`Listening to Supabase at: ${SUPABASE_URL}`);
console.log(`Forwarding to OpenWA at: ${OPENWA_URL}`);

setInterval(processQueue, 5000);
processQueue();

supabase.channel('schema-db-changes')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'whatsapp_outbox', filter: "status=eq.pending" },
    (payload) => {
      console.log("[Realtime Event] New message added to queue.");
      processQueue();
    }
  )
  .subscribe();
