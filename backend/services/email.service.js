const sendVerificationEmail = async (userEmail, verificationLink) => {
    // Abstract email service to support Resend, SendGrid, Amazon SES, etc.
    console.log(`Sending verification email to ${userEmail}`);
    console.log(`Subject: Verify your email`);
    console.log(`Body:\nHello,\n\nPlease verify your email by clicking the link below:\n\n${verificationLink}\n\nThis link expires in 24 hours.\n`);

    // TODO: Implement actual email sending logic here
    return true;
};

module.exports = {
    sendVerificationEmail
};
