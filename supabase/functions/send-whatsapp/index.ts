import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { phone, templateName, languageCode, components } = await req.json()

    if (!phone || !templateName) {
      throw new Error('Phone and templateName are required')
    }

    const WA_PHONE_NUMBER_ID = Deno.env.get('WA_PHONE_NUMBER_ID')
    const WA_ACCESS_TOKEN = Deno.env.get('WA_ACCESS_TOKEN')

    if (!WA_PHONE_NUMBER_ID || !WA_ACCESS_TOKEN) {
      throw new Error('WhatsApp credentials not configured in edge function secrets.')
    }

    // Prepare payload for Meta Graph API
    const payload = {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode || 'en_US'
        },
        components: components || []
      }
    }

    const response = await fetch(`https://graph.facebook.com/v17.0/${WA_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('WhatsApp API Error:', data)
      throw new Error(data.error?.message || 'Failed to send WhatsApp message')
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
