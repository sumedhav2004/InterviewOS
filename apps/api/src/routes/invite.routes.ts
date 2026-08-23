import { Router } from "express";
import { InviteController } from "../controllers/invite.controller";

const router = Router();
const inviteController = new InviteController();

// Create an invite for an interview
router.post(
    "/interviews/:interviewId/invites",
    inviteController.createInvite.bind(inviteController)
);

// Actions on an existing invite
router.patch(
    "/invites/:inviteId/accept",
    inviteController.acceptInvite.bind(inviteController)
);

router.patch(
    "/invites/:inviteId/decline",
    inviteController.declineInvite.bind(inviteController)
);

router.patch(
    "/invites/:inviteId/cancel",
    inviteController.cancelInvite.bind(inviteController)
);

export default router;