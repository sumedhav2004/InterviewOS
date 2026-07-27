import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { IdentityService } from "../services/identity.service";

const identityService = new IdentityService();

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const auth = getAuth(req);
  if(!auth.userId){
    return res.status(401).json({
      message: "401 unauthorized"
    })
  }

  const user = await identityService.findOrCreateUser(auth.userId)
 //
  req.user = user
  next();
}