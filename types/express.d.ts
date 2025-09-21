import { JwtPayload } from "src/middlewares/auth.middleware"; 

declare module "express" {
  interface Request {
    user?: JwtPayload;
  }
}