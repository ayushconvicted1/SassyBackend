import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "@/configs/db";
import { generateToken } from "@/utils/jwt";

const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashed, name },
    });

    res.status(201).json({ token: generateToken(user), user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ token: generateToken(user), user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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

export const updateProfile =async(req:Request,res:Response)=>{
  // this api updates user address details
  
}

module.exports = { register, login };
