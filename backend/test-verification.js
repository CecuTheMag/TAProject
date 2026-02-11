import emailService from './services/emailService.js';

const testVerificationEmail = async () => {
  try {
    const result = await emailService.sendVerificationCode('cecuomegata@gmail.com', '123456', 'Test User');
    console.log('✅ Verification email result:', result);
  } catch (error) {
    console.error('❌ Verification email failed:', error.message);
  }
};

testVerificationEmail();