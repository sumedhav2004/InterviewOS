import { Router } from "express";
import { FriendRequestController } from "../controllers/friend-request.controller";

const router = Router();
const friendRequestController = new FriendRequestController();

router.get(
  "/accepted",
  friendRequestController.getAcceptedFriendRequestsByUser.bind(friendRequestController),
);

router.get(
  "/sent",
  friendRequestController.getSentFriendRequestsByUser.bind(friendRequestController),
);

router.get(
  "/received",
  friendRequestController.getReceivedFriendRequestsByUser.bind(friendRequestController),
);

router.get(
  "/:userId/all",
  friendRequestController.getAllFriendsOfUser.bind(friendRequestController),
);

router.get(
  "/:senderId/:receiverId",
  friendRequestController.getFriendRequestForTwoUsers.bind(friendRequestController),
);

router.post(
  "/:receiverId",
  friendRequestController.sendFriendRequest.bind(friendRequestController),
);

router.patch(
  "/:id/cancel",
  friendRequestController.cancelFriendRequest.bind(friendRequestController),
);

router.patch(
  "/:id/accept",
  friendRequestController.acceptFriendRequest.bind(friendRequestController),
);

router.patch(
  "/:id/reject",
  friendRequestController.rejectFriendRequest.bind(friendRequestController),
);

router.delete("/:id", friendRequestController.unFriend.bind(friendRequestController));

export default router;
