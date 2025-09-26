// src/app/api/test-email/route.js
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/resend";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Must be logged in to test email" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { recipientEmail } = body;
    
    const testEmail = recipientEmail || session.user.email;
    
    console.log(`🧪 Testing email delivery to: ${testEmail}`);
    console.log(`📧 RESEND_API_KEY exists: ${process.env.RESEND_API_KEY ? 'Yes' : 'No'}`);
    console.log(`📤 EMAIL_FROM: ${process.env.EMAIL_FROM}`);
    
    const result = await sendEmail({
      to: testEmail,
      subject: "🧪 Test Email from AI Blog Platform",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h1>🧪 Test Email Successful!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
            <p>If you're reading this, email delivery is working correctly!</p>
            <p><strong>Sent to:</strong> ${testEmail}</p>
            <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
            <p><strong>From:</strong> ${process.env.EMAIL_FROM}</p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 14px;">
              This is a test email from your AI Blog Platform to verify email functionality.
            </p>
          </div>
        </div>
      `
    });

    console.log(`📊 Email send result:`, result);

    if (result.ok) {
      return NextResponse.json({ 
        success: true, 
        message: `Test email sent successfully to ${testEmail}`,
        emailId: result.id,
        details: result
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Email failed to send",
        error: result.error,
        skipped: result.skipped,
        details: result
      });
    }

  } catch (error) {
    console.error("❌ Test email error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to send test email",
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "POST to this endpoint to send a test email",
    usage: "POST /api/test-email with optional { recipientEmail: 'test@example.com' }"
  });
}