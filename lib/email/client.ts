import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

class EmailClient {
  private transporter: nodemailer.Transporter | null = null

  private getTransporter(): nodemailer.Transporter {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Missing SMTP credentials')
    }

    if (!this.transporter) {
      const config: EmailConfig = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER || '',
          pass: process.env.EMAIL_PASS || ''
        }
      }

      this.transporter = nodemailer.createTransport(config)
    }

    return this.transporter
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const transporter = this.getTransporter()
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        html
      })

      console.log('Email sent:', info.messageId)
      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  async sendTenderAlert(to: string, tender: any, score: number): Promise<boolean> {
    const subject = `High-Score Tender Alert: ${tender.title}`
    const html = this.generateTenderAlertHTML(tender, score)
    
    return await this.sendEmail(to, subject, html)
  }

  async sendDeadlineReminder(to: string, tender: any, daysUntil: number): Promise<boolean> {
    const subject = `Deadline Reminder: ${tender.title} (${daysUntil} days)`
    const html = this.generateDeadlineReminderHTML(tender, daysUntil)
    
    return await this.sendEmail(to, subject, html)
  }

  async sendDailyDigest(to: string, tenders: any[]): Promise<boolean> {
    const subject = `Daily Tender Digest - ${tenders.length} new opportunities`
    const html = this.generateDailyDigestHTML(tenders)
    
    return await this.sendEmail(to, subject, html)
  }

  private generateTenderAlertHTML(tender: any, score: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>High-Score Tender Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0D3B66; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .tender-card { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .score-badge { background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
          .deadline { color: #dc3545; font-weight: bold; }
          .cta-button { background-color: #0D3B66; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>High-Score Tender Alert</h1>
          <p>A new tender opportunity matches your criteria perfectly</p>
        </div>
        <div class="content">
          <div class="tender-card">
            <h2>${tender.title}</h2>
            <p><strong>Organization:</strong> ${tender.organization || 'N/A'}</p>
            <p><strong>Sector:</strong> ${tender.sector || 'N/A'}</p>
            <p><strong>Location:</strong> ${tender.location || 'N/A'}</p>
            ${tender.budget ? `<p><strong>Budget:</strong> ${tender.currency || 'USD'} ${tender.budget.toLocaleString()}</p>` : ''}
            ${tender.deadline ? `<p><strong>Deadline:</strong> <span class="deadline">${new Date(tender.deadline).toLocaleDateString()}</span></p>` : ''}
            <p><strong>AI Score:</strong> <span class="score-badge">${score}/100</span></p>
            ${tender.description ? `<p><strong>Description:</strong><br>${tender.description.substring(0, 300)}...</p>` : ''}
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tenders/${tender.id}" class="cta-button">View Tender Details</a>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private generateDeadlineReminderHTML(tender: any, daysUntil: number): string {
    const urgencyColor = daysUntil <= 3 ? '#dc3545' : daysUntil <= 7 ? '#ffc107' : '#28a745'
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Deadline Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0D3B66; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .tender-card { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .deadline-urgent { color: ${urgencyColor}; font-weight: bold; font-size: 18px; }
          .cta-button { background-color: #0D3B66; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Deadline Reminder</h1>
          <p>Don't miss this opportunity!</p>
        </div>
        <div class="content">
          <div class="tender-card">
            <h2>${tender.title}</h2>
            <p><strong>Organization:</strong> ${tender.organization || 'N/A'}</p>
            <p><strong>Deadline:</strong> <span class="deadline-urgent">${daysUntil} days (${new Date(tender.deadline).toLocaleDateString()})</span></p>
            ${tender.budget ? `<p><strong>Budget:</strong> ${tender.currency || 'USD'} ${tender.budget.toLocaleString()}</p>` : ''}
            <p><strong>Action Required:</strong> Submit your application before the deadline</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tenders/${tender.id}" class="cta-button">View Tender & Apply</a>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private generateDailyDigestHTML(tenders: any[]): string {
    const tenderCards = tenders.map(tender => `
      <div class="tender-card">
        <h3>${tender.title}</h3>
        <p><strong>Organization:</strong> ${tender.organization || 'N/A'}</p>
        <p><strong>Sector:</strong> ${tender.sector || 'N/A'}</p>
        ${tender.budget ? `<p><strong>Budget:</strong> ${tender.currency || 'USD'} ${tender.budget.toLocaleString()}</p>` : ''}
        ${tender.deadline ? `<p><strong>Deadline:</strong> ${new Date(tender.deadline).toLocaleDateString()}</p>` : ''}
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tenders/${tender.id}" class="cta-button">View Details</a>
      </div>
    `).join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Tender Digest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0D3B66; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .tender-card { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .cta-button { background-color: #0D3B66; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Daily Tender Digest</h1>
          <p>${tenders.length} new opportunities found today</p>
        </div>
        <div class="content">
          ${tenderCards}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tenders" class="cta-button">View All Tenders</a>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

// Export a function to get the email client instance
export function getEmailClient(): EmailClient {
  return new EmailClient()
}
