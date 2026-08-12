import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const router = Router();
const userController = new UserController();

router.get("/me", userController.getMe);
router.patch("/me",userController.updateMe)

export default router;