const nodemailer = require("nodemailer");

const otpSender = async (otp: any, email: String) => {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  let info = await transporter
    .sendMail({
      from: "'Sassy Sringaar'" + process.env.SMTP_USER,
      to: email,
      subject: "OTP to Verify email",
      html: `<b><h1>Sassy Shringaar </h1>
        <h2>${otp} is the otp to verify your email.</h2>
        </b>`,
    })
    .catch((err: any) => {
      console.log(err);
    });
};

export default otpSender;