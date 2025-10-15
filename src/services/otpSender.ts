import nodemailer from "nodemailer";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

const otpSender = async (otp: number, email: string): Promise<void> => {
  // Validate environment variables
  const requiredEnvVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  const config: EmailConfig = {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT!),
    secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  };

  try {
    const transporter = nodemailer.createTransport(config);

    // Verify connection configuration
    await transporter.verify();

    const mailOptions = {
      from: `"Sassy Shringaar" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "🔐 Your OTP for Sassy Shringaar",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #d4af37; margin: 0; font-size: 28px;">✨ Sassy Shringaar</h1>
              <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Your Premium Jewelry Destination</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Email Verification</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                Use the following OTP to verify your email address:
              </p>
              
              <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #d4af37; letter-spacing: 5px;">${otp}</span>
              </div>
              
              <p style="color: #666; font-size: 14px; margin: 20px 0;">
                This OTP is valid for <strong>5 minutes</strong> only.
              </p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                If you didn't request this OTP, please ignore this email.
              </p>
              <p style="color: #999; font-size: 12px; text-align: center; margin: 5px 0 0 0;">
                © 2024 Sassy Shringaar. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `Your OTP for Sassy Shringaar is: ${otp}. This OTP is valid for 5 minutes only.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error(
      "Failed to send verification email. Please check your email configuration."
    );
  }
};

export default otpSender;
