const nodemailer = require('nodemailer');

let cachedTestAccount = null;
const getTestAccount = async () => {
  if (cachedTestAccount) return cachedTestAccount;
  console.log('Generating new Ethereal test email account...');
  cachedTestAccount = await nodemailer.createTestAccount();
  return cachedTestAccount;
};

const sendEmail = async ({ to, subject, html }) => {
  let transporter;

  const isConfigured = 
    process.env.EMAIL_USER && 
    process.env.EMAIL_USER !== 'your_email@gmail.com' &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_PASS !== 'your_app_password';

  if (isConfigured) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Fallback to Ethereal Email for testing/development
    console.log('Using test email account (Ethereal)...');
    const testAccount = await getTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const mailOptions = {
    from: `"NutriBudget AI" <${process.env.EMAIL_USER || 'noreply@nutribudget.ai'}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (!isConfigured) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('-----------------------------------------');
    console.log('EMAIL SENT IN TEST MODE (Ethereal)');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Preview URL: ${previewUrl}`);
    console.log('-----------------------------------------');
    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
      testMode: true
    };
  }

  return {
    success: true,
    messageId: info.messageId,
    testMode: false
  };
};

module.exports = { sendEmail };
