import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    
    // OpenWA webhook payload structure
    // Depends on OpenWA, usually contains:
    // { event: 'onMessage', data: { from: '123@c.us', body: 'Hello', isGroupMsg: false ... } }
    
    // We only want to process incoming messages, not outgoing or acks
    const data = payload.data || payload;
    const sender = data.from;
    const text = data.body;
    
    if (!sender || !text || data.isGroupMsg) {
      return new Response(JSON.stringify({ message: 'Ignored: Not a direct user message' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing')
    }

    // Call Gemini API
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: `System Context: You are the helpful AI assistant for Oxford Excellence Academy. Answer politely. If you don't know something, tell them to contact the administration during school hours. \n\nParent's message: "${text}"` }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 200
        }
      })
    });
    
    const geminiData = await geminiRes.json();
    const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!replyText) {
      throw new Error('Failed to generate AI response');
    }

    // Insert reply into whatsapp_outbox
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('SUPABASE_DB_URL'); // Use correct env var
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    // Fallback if env vars are named differently in edge function
    const url = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('SUPABASE_DB_URL') ?? '';
    const key = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (url && key) {
      const supabase = createClient(url, key);
      await supabase.from('whatsapp_outbox').insert([
        { recipient_phone: sender.replace('@c.us', ''), message_body: replyText, status: 'pending' }
      ]);
    } else {
       console.error("Supabase credentials missing in Edge Function environment.");
    }

    return new Response(JSON.stringify({ success: true, reply: replyText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Bot Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
