import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "@/configs/db";
import { generateToken } from "@/utils/jwt";
import { createNewOtp } from "@/utils/auth";
import { verifyOtp } from "@/services/verifyOtp";
import tokenGenerator from "@/services/tokenGenerator";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: "Email and name are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = createNewOtp(email);
    return res.status(200).json({ message: "OTP sent", hash, newUser: true });

  } catch (err: any) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
      return res.status(400).json({ message: "User doesn't exist" });
    }

    const hash = createNewOtp(email);
    return res.status(200).json({ message: "OTP sent", hash, newUser: false });

  } catch (err: any) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const otpVerification = async (req: Request, res: Response) => {
  try {
    const { email, hash, newUser, name, otp } = req.body;

    if (!email || !hash || !otp) {
      return res.status(400).json({ message: "Missing OTP verification data" });
    }

    const isOtpValid = await verifyOtp({ email, hash, otp });

    if (!isOtpValid) {
      return res.status(400).json({ message: "OTP doesn't match" });
    }

    if (newUser) {
      if (!name) {
        return res.status(400).json({ message: "Name is required for new users" });
      }

      const createdUser = await prisma.user.create({
        data: {
          email,
          name,
          role: "USER",
        },
      });

      const token = tokenGenerator(email);
      return res.status(201).json({
        message: "User created successfully",
        user: createdUser,
        token,
      });

    } else {
      const token = tokenGenerator(email);
      return res.status(200).json({
        message: "Login successful",
        token,
      });
    }

  } catch (err: any) {
    console.error("OTP Verification Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const getProfile = async (req: Request, res: Response) => {
  try {
    // get id from auth middleware
    const userId = req.body.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  // this api updates user address details

}

