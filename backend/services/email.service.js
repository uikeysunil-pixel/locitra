const sendVerificationEmail = async (userEmail, verificationLink) => {
    // Abstract email service to support Resend, SendGrid, Amazon SES, etc.
    console.log(`Sending verification email to ${userEmail}`);
    console.log(`Subject: Verify your email`);
    console.log(`Body:\nHello,\n\nPlease verify your email by clicking the link below:\n\n${verificationLink}\n\nThis link expires in 24 hours.\n`);

    // TODO: Implement actual email sending logic here
    return true;
};

const sendFollowUpEmail = async (email, name, reportUrl) => {
    try {
        console.log(`[EmailService] Sending follow-up to ${email}`);
        
        const subject = "Your AI Market Report & Next Steps";
        const bodyContent = `
Hello ${name || 'there'},

Thanks for checking out the AI Market Report! You can access it anytime here:
${reportUrl}

Based on the data, there are several "low-hanging fruit" opportunities for growth in your market. 

Would you like to book a quick 15-minute strategy call to walk through the next steps?
Reply to this email or click here to get started!

Best regards,
The Locitra Team
        `.trim();

        console.log(`Subject: ${subject}`);
        console.log(`Body:\n${bodyContent}`);

        // In a real app, you would use nodemailer, Resend, or similar here.
        // For now, we log to console as requested for the "scaffolded" setup.
        return true;
    } catch (error) {
        console.error("[EmailService] Error sending follow-up email:", error);
        return false;
    }
};

module.exports = {
    sendVerificationEmail,
    sendFollowUpEmail
};
