import { createClient } from '@/lib/supabase/server'
import { emailClient } from './client'

export interface NotificationSettings {
  newTenders: boolean
  deadlineReminders: boolean
  scoreThreshold: number
  emailDigest: 'realtime' | 'daily' | 'weekly' | 'none'
}

export async function sendTenderAlerts(tender: any, score: number) {
  const supabase = await createClient()
  
  try {
    // Get all users with notification settings
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('id, email, notification_settings')
      .eq('notification_settings->>newTenders', true)
      .lte('notification_settings->>scoreThreshold', score)

    if (error || !users) {
      console.error('Error fetching users for notifications:', error)
      return
    }

    // Send alerts to eligible users
    for (const user of users) {
      if (user.email) {
        const success = await emailClient.sendTenderAlert(user.email, tender, score)
        if (success) {
          console.log(`Tender alert sent to ${user.email}`)
        } else {
          console.error(`Failed to send tender alert to ${user.email}`)
        }
      }
    }
  } catch (error) {
    console.error('Error sending tender alerts:', error)
  }
}

export async function sendDeadlineReminders() {
  const supabase = await createClient()
  
  try {
    // Get tenders with deadlines in the next 7 days
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    
    const { data: tenders, error } = await supabase
      .from('tenders')
      .select(`
        *,
        applications (
          user_id,
          user_profiles!inner (
            email,
            notification_settings
          )
        )
      `)
      .gte('deadline', new Date().toISOString())
      .lte('deadline', sevenDaysFromNow.toISOString())
      .eq('status', 'new')

    if (error || !tenders) {
      console.error('Error fetching tenders for deadline reminders:', error)
      return
    }

    // Send reminders to users with applications
    for (const tender of tenders) {
      const deadline = new Date(tender.deadline!)
      const daysUntil = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
      
      // Send reminders at 3 days and 1 day before deadline
      if (daysUntil === 3 || daysUntil === 1) {
        for (const application of tender.applications || []) {
          const userProfile = application.user_profiles
          if (userProfile?.notification_settings?.deadlineReminders && userProfile.email) {
            const success = await emailClient.sendDeadlineReminder(
              userProfile.email,
              tender,
              daysUntil
            )
            if (success) {
              console.log(`Deadline reminder sent to ${userProfile.email} for ${tender.title}`)
            } else {
              console.error(`Failed to send deadline reminder to ${userProfile.email}`)
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error sending deadline reminders:', error)
  }
}

export async function sendDailyDigest() {
  const supabase = await createClient()
  
  try {
    // Get tenders created in the last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const { data: tenders, error } = await supabase
      .from('tenders')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })

    if (error || !tenders) {
      console.error('Error fetching tenders for daily digest:', error)
      return
    }

    if (tenders.length === 0) {
      console.log('No new tenders for daily digest')
      return
    }

    // Get users who want daily digest
    const { data: users, error: userError } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('notification_settings->>emailDigest', 'daily')

    if (userError || !users) {
      console.error('Error fetching users for daily digest:', userError)
      return
    }

    // Send digest to eligible users
    for (const user of users) {
      if (user.email) {
        const success = await emailClient.sendDailyDigest(user.email, tenders)
        if (success) {
          console.log(`Daily digest sent to ${user.email}`)
        } else {
          console.error(`Failed to send daily digest to ${user.email}`)
        }
      }
    }
  } catch (error) {
    console.error('Error sending daily digest:', error)
  }
}

export async function sendApplicationStatusUpdate(applicationId: string, newStatus: string) {
  const supabase = await createClient()
  
  try {
    // Get application details with user info
    const { data: application, error } = await supabase
      .from('applications')
      .select(`
        *,
        tenders (title, organization),
        user_profiles!inner (email)
      `)
      .eq('id', applicationId)
      .single()

    if (error || !application) {
      console.error('Error fetching application for status update:', error)
      return
    }

    const userEmail = application.user_profiles.email
    if (!userEmail) {
      console.error('No email found for user')
      return
    }

    // Generate status update email
    const subject = `Application Status Update: ${application.tenders.title}`
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0D3B66; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .status-badge { background: #007bff; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase; }
          .cta-button { background-color: #0D3B66; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Application Status Update</h1>
          <p>Your application status has changed</p>
        </div>
        <div class="content">
          <h2>${application.tenders.title}</h2>
          <p><strong>Organization:</strong> ${application.tenders.organization || 'N/A'}</p>
          <p><strong>New Status:</strong> <span class="status-badge">${newStatus}</span></p>
          <p>Your application status has been updated to <strong>${newStatus}</strong>.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/applications" class="cta-button">View Application</a>
        </div>
      </body>
      </html>
    `

    const success = await emailClient.sendEmail(userEmail, subject, html)
    if (success) {
      console.log(`Application status update sent to ${userEmail}`)
    } else {
      console.error(`Failed to send application status update to ${userEmail}`)
    }
  } catch (error) {
    console.error('Error sending application status update:', error)
  }
}
