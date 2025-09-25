import otpSender from "@/services/otpSender";
import crypto from "crypto"

export const createNewOtp = (email: any) => {
  const key = process.env.OTP_SECRET;
  // const otp = Math.floor(1000 + Math.random() * 9000);
  const otp=1234;
  const otpValidity = 5 * 60 * 1000;
  const expiry = Date.now() + otpValidity;
  const data = `${email}.${otp}.${expiry}`;
  const hash = crypto
    .createHmac("sha256", key || "")
    .update(data)
    .digest("hex");
  const fullhash = `${hash}.${expiry}`;

console.log(otp)
  // otpSender(otp, email);
  // console.log(otp);

  return fullhash;
};





