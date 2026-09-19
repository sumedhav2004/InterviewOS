import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const router = Router();
const userController = new UserController();

router.get("/me", userController.getMe);
router.patch("/me",userController.updateMe)
router.get("/:userId", userController.findUserById.bind(userController))

export default router;