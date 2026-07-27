import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const router = Router();
const userController = new UserController();

router.get("/me", userController.getMe);
console.log("REACHED /me")

export default router;