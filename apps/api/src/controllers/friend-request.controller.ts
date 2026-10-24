import { Request, Response } from "express";
import { FriendRequestService } from "../services/friend-request.service";

export class FriendRequestController {
  constructor(private readonly friendRequestService = new FriendRequestService()) {}

  async getAcceptedFriendRequestsByUser(req: Request, res: Response) {
    const userId = req.user.id;

    const friendRequests = await this.friendRequestService.getAcceptedFriendRequestsByUser(userId);

    return res.status(200).json(friendRequests);
  }

  async sendFriendRequest(req: Request<{ receiverId: string }>, res: Response) {
    const senderId = req.user.id;
    const { receiverId } = req.params;

    const friendRequest = await this.friendRequestService.sendFriendRequest(senderId, receiverId);

    return res.status(201).json(friendRequest);
  }

  async cancelFriendRequest(req: Request<{ id: string }>, res: Response) {
    const requesterId = req.user.id;
    const { id } = req.params;

    const friendRequest = await this.friendRequestService.cancelFriendRequest(id, requesterId);

    return res.status(200).json(friendRequest);
  }

  async acceptFriendRequest(req: Request<{ id: string }>, res: Response) {
    const requesterId = req.user.id;
    const { id } = req.params;

    const friendRequest = await this.friendRequestService.acceptFriendRequest(id, requesterId);

    return res.status(200).json(friendRequest);
  }

  async rejectFriendRequest(req: Request<{ id: string }>, res: Response) {
    const requesterId = req.user.id;
    const { id } = req.params;

    const friendRequest = await this.friendRequestService.rejectFriendRequest(id, requesterId);

    return res.status(200).json(friendRequest);
  }

  async getFriendRequestForTwoUsers(req: Request, res: Response) {
    const requesterId = req.user.id;
    const { senderId, receiverId } = req.params;
    if (typeof senderId !== "string") {
      return res.status(400).json({
        message: "Invalid route parameter",
      });
    }
    if (typeof receiverId !== "string") {
      return res.status(400).json({
        message: "Invalid route parameter",
      });
    }
    const result = await this.friendRequestService.getFriendRequest(
      senderId,
      receiverId,
      requesterId,
    );

    return res.status(200).json(result);
  }

  async unFriend(req: Request<{ id: string }>, res: Response) {
    const requesterId = req.user.id;
    const { id } = req.params;

    await this.friendRequestService.unFriend(id, requesterId);

    return res.sendStatus(204);
  }

  async getSentFriendRequestsByUser(req: Request, res: Response) {
    const requesterId = req.user.id;

    const friendRequests = await this.friendRequestService.getSentFriendRequestsByUser(requesterId);

    return res.status(200).json(friendRequests);
  }

  async getReceivedFriendRequestsByUser(req: Request, res: Response) {
    const requesterId = req.user.id;

    const friendRequests =
      await this.friendRequestService.getReceivedFriendRequestsByUser(requesterId);

    return res.status(200).json(friendRequests);
  }

  async getAllFriendsOfUser(req: Request, res: Response) {
    const userId = req.params.userId;
    if (typeof userId !== "string") {
      return res.status(400).json({
        message: "Invalid route parameter",
      });
    }

    const friends = await this.friendRequestService.getAllFriendsOfUser(userId);

    return res.status(200).json(friends);
  }
}

export const friendRequestController = new FriendRequestController();
