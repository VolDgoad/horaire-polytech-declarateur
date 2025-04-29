
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Extract the request body
    const { recipientEmail, subject, message, declarationId, status, declarationType } = await req.json();
    
    // Validate required parameters
    if (!recipientEmail || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // For now, we'll simulate sending an email by logging it
    // In production, you would use a real email service like SendGrid, Resend, or AWS SES
    console.log(`Sending email to: ${recipientEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log(`Declaration ID: ${declarationId}`);
    console.log(`Status: ${status}`);
    
    // Update the declaration status in the database if provided
    if (declarationId && status) {
      // Create a Supabase client
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Update the declaration status
      const { error } = await supabaseClient
        .from("fiches")
        .update({ 
          statut: status,
          date_modification: new Date().toISOString()
        })
        .eq("id", declarationId);
        
      if (error) {
        throw new Error(`Failed to update declaration status: ${error.message}`);
      }
      
      // Record the notification in the database
      await supabaseClient
        .from("notifications")
        .insert({
          user_email: recipientEmail, 
          title: subject,
          message: message,
          fiche_id: declarationId,
          type: declarationType || "info"
        });
    }

    // Return a success response
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    // Return an error response
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
