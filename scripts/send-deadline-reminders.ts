import { createClient } from '../lib/supabase/client'
import nodemailer from 'nodemailer'

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Missing SMTP configuration");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendDeadlineReminders() {
  const supabase = createClient()
  
  try {
    // Get tenders with deadlines in the next 7 days
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    
    const { data: tenders, error } = await supabase
      .from('tenders')
      .select(`
        *,
        applications (
          id,
          user_id,
          users (
            email,
            full_name
          )
        )
      `)
      .gte('deadline', new Date().toISOString())
      .lte('deadline', sevenDaysFromNow.toISOString())
      .eq('status', 'open')
    
    if (error) {
      console.error('Error fetching tenders:', error)
      return
    }
    
    console.log(`Found ${tenders?.length || 0} tenders with upcoming deadlines`)
    
    for (const tender of tenders || []) {
      const deadline = new Date(tender.deadline!)
      const daysUntilDeadline = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
      
      // Send reminder to each applicant
      for (const application of tender.applications || []) {
        const userEmail = application.users.email
        const userName = application.users.full_name || 'User'
        
        const mailOptions = {
          from: process.env.SMTP_USER,
          to: userEmail,
          subject: `Reminder: Tender Deadline in ${daysUntilDeadline} days`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0D3B66;">Tender Deadline Reminder</h2>
              <p>Dear ${userName},</p>
              <p>This is a reminder that the following tender deadline is approaching:</p>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0D3B66; margin-top: 0;">${tender.title}</h3>
                <p><strong>Organization:</strong> ${tender.organization || 'N/A'}</p>
                <p><strong>Deadline:</strong> ${deadline.toLocaleDateString()}</p>
                <p><strong>Days until deadline:</strong> <span style="color: #e74c3c; font-weight: bold;">${daysUntilDeadline}</span></p>
              </div>
              <p>Please make sure to submit your application before the deadline.</p>
              <p>Best regards,<br>Tender Management System</p>
            </div>
          `,
        }
        
        try {
          const transporter = getTransporter()
          await transporter.sendMail(mailOptions)
          console.log(`Reminder sent to ${userEmail} for tender: ${tender.title}`)
        } catch (emailError) {
          console.error(`Error sending email to ${userEmail}:`, emailError)
        }
      }
    }
    
    console.log('Deadline reminder process completed')
  } catch (error) {
    console.error('Error in deadline reminder process:', error)
  }
}

// Run function only if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  sendDeadlineReminders()
}
