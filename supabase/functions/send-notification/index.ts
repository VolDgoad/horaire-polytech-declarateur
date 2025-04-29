
// Follow this setup guide to integrate the Deno runtime into your project:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  recipientEmail: string
  subject: string
  message: string
  declarationId?: string
  status?: string
  declarationType?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )
    
    // Get request body
    const requestData: EmailRequest = await req.json()
    
    // Validate request data
    if (!requestData.recipientEmail || !requestData.subject || !requestData.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // In a real implementation, you would use a service like SendGrid, AWS SES, or Resend
    // to actually send the email. For now, we'll just log and create a notification record.
    console.log(`Would send email to ${requestData.recipientEmail}:`)
    console.log(`Subject: ${requestData.subject}`)
    console.log(`Message: ${requestData.message}`)
    
    // Create a notification in the database
    const { data, error } = await supabaseClient
      .from('notifications')
      .insert({
        user_email: requestData.recipientEmail,
        title: requestData.subject,
        message: requestData.message,
        type: requestData.declarationType || 'info',
        fiche_id: requestData.declarationId
      })
    
    if (error) {
      console.error('Error creating notification:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create notification' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent and recorded successfully'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
