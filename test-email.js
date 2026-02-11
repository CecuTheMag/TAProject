import nodemailer from 'nodemailer';

const testEmail = async () => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'kironotificatora@gmail.com',
      pass: 'eieo fqhh rfcc tgsa'
    }
  });

  try {
    const info = await transporter.sendMail({
      from: 'kironotificatora@gmail.com',
      to: 'cecuomegata@gmail.com',
      subject: 'Test Email from AssetFlow',
      text: 'This is a test email to verify Gmail credentials.',
      html: '<p>This is a test email to verify Gmail credentials.</p>'
    });

    console.log('✅ Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('❌ Email failed:', error.message);
  }
};

testEmail();