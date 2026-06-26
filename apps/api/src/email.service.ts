import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not defined in the environment variables.');
      return false;
    }

    const fromEmail = 'landlord.hu <no-reply@mylandlordservices.com>';

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to,
          subject,
          html,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Failed to send email via Resend:', errText);
        return false;
      }
      console.log(`Successfully sent email to ${to} with subject "${subject}"`);
      return true;
    } catch (error) {
      console.error('Error sending email via Resend:', error);
      return false;
    }
  }
}
