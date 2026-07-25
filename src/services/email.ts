import sgMail from '@sendgrid/mail';

const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey) {
  sgMail.setApiKey(apiKey);
}

export const sendConfirmationEmail = async (toEmail: string): Promise<void> => {
  if (!apiKey) {
    console.warn('SENDGRID_API_KEY not set, skipping confirmation email');
    return;
  }

  await sgMail.send({
    to: toEmail,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@thechainwise.com',
    subject: 'Welcome to ChainWise Alerts',
    text: 'You are now subscribed to ChainWise DeFi risk alerts.',
    html: '<p>You are now subscribed to ChainWise DeFi risk alerts.</p>',
  });
};
