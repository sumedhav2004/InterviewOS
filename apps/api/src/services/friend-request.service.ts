import { FriendRequestStatus } from "@interview-os/database";
import { AppError } from "../../core/errors/app-error";
import { FriendRequestRepository } from "../repositories/friend-request.repository";
import { UserRepository } from "../repositories/user.repository";

export class FriendRequestService {
  constructor(
    private readonly friendRequestRepository = new FriendRequestRepository(),
    private readonly userRepository = new UserRepository(),
  ) {}

  async getAcceptedFriendRequestsByUser(userId: string) {
    return this.friendRequestRepository.getAcceptedFriendRequestsByUserId(userId);
  }

  async sendFriendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new AppError("Cannot send a friend request to yourself", 400, "SELF_FRIEND_REQUEST");
    }
    const sender = await this.userRepository.findById(senderId);
    if (!sender) {
      throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }
    const receiver = await this.userRepository.findById(receiverId);
    if (!receiver) {
      throw new AppError("Receiving User Not Found", 404, "RECEIVER_NOT_FOUND");
    }

    const friendRequestBySender =
      await this.friendRequestRepository.getFriendRequestBySenderAndReceiver(senderId, receiverId);
    if (friendRequestBySender) {
      throw new AppError("Friend Request Already Exists", 409, "FRIEND_REQUEST_ALREADY_EXISTS");
    }

    const friendRequestByReceiver =
      await this.friendRequestRepository.getFriendRequestBySenderAndReceiver(receiverId, senderId);
    if (friendRequestByReceiver) {
      throw new AppError("Friend Request Already Exists", 409, "FRIEND_REQUEST_ALREADY_EXISTS");
    }

    return this.friendRequestRepository.createFriendRequest(senderId, receiverId);
  }

  async cancelFriendRequest(id: string, requesterId: string) {
    const friendRequest = await this.friendRequestRepository.findById(id);
    if (!friendRequest) {
      throw new AppError("Friend Request Not Found", 404, "FRIEND_REQUEST_NOT_FOUND");
    }

    if (friendRequest.senderId !== requesterId) {
      throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }

    if (friendRequest.status !== FriendRequestStatus.PENDING) {
      throw new AppError(
        "Friend Request Status Not Pending",
        400,
        "FRIEND_REQUEST_STATUS_NOT_PENDING",
      );
    }
    const data = {
      status: FriendRequestStatus.CANCELLED,
    };
    return this.friendRequestRepository.updateFriendRequest(id, data);
  }

  async acceptFriendRequest(id: string, requesterId: string) {
    const friendRequest = await this.friendRequestRepository.findById(id);
    if (!friendRequest) {
      throw new AppError("Friend Request Not Found", 404, "FRIEND_REQUEST_NOT_FOUND");
    }

    if (friendRequest.receiverId !== requesterId) {
      throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }

    if (friendRequest.status !== FriendRequestStatus.PENDING) {
      throw new AppError(
        "Friend Request Status Not Pending",
        400,
        "FRIEND_REQUEST_STATUS_NOT_PENDING",
      );
    }

    const data = {
      status: FriendRequestStatus.ACCEPTED,
      respondedAt: new Date(),
    };
    return this.friendRequestRepository.updateFriendRequest(id, data);
  }

  async rejectFriendRequest(id: string, requesterId: string) {
    const friendRequest = await this.friendRequestRepository.findById(id);
    if (!friendRequest) {
      throw new AppError("Friend Request Not Found", 404, "FRIEND_REQUEST_NOT_FOUND");
    }

    if (friendRequest.receiverId !== requesterId) {
      throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }

    if (friendRequest.status !== FriendRequestStatus.PENDING) {
      throw new AppError(
        "Friend Request Status Not Pending",
        400,
        "FRIEND_REQUEST_STATUS_NOT_PENDING",
      );
    }
    const data = {
      status: FriendRequestStatus.REJECTED,
      respondedAt: new Date(),
    };
    return this.friendRequestRepository.updateFriendRequest(id, data);
  }

  async unFriend(id: string, requesterId: string) {
    const friendRequest = await this.friendRequestRepository.findById(id);
    if (!friendRequest) {
      throw new AppError("Friend Request Not Found", 404, "FRIEND_REQUEST_NOT_FOUND");
    }

    if (requesterId !== friendRequest.senderId && requesterId !== friendRequest.receiverId) {
      throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }

    if (friendRequest.status !== FriendRequestStatus.ACCEPTED) {
      throw new AppError("Not Friends Already", 400, "NOT_FRIENDS_ALREADY");
    }
    return this.friendRequestRepository.deleteFriendRequest(id);
  }

  async getSentFriendRequestsByUser(requesterId: string) {
    const user = await this.userRepository.findById(requesterId);
    if (!user) {
      throw new AppError("User Not Found", 404, "USER_NOT_FOUND");
    }

    return this.friendRequestRepository.getSentFriendRequestsByUserId(requesterId);
  }

  async getReceivedFriendRequestsByUser(requesterId: string) {
    const user = await this.userRepository.findById(requesterId);
    if (!user) {
      throw new AppError("User Not Found", 404, "USER_NOT_FOUND");
    }

    return this.friendRequestRepository.getReceivedFriendRequestsByUserId(requesterId);
  }

  async getAllFriendsOfUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("User Not Found", 404, "USER_NOT_FOUND");
    }

    return this.friendRequestRepository.getAllFriendsByUserId(userId);
  }

  async getFriendRequest(senderId: string, receiverId: string, requesterId: string) {
    if (requesterId !== senderId && requesterId !== receiverId) {
      throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }
    if (senderId === receiverId) {
      throw new AppError(
        "No friend Requests among ourselves",
        400,
        "NO_FREIND_REQUEST_AMONG_OURSELVES",
      );
    }
    return this.friendRequestRepository.getFriendRequestBySenderAndReceiver(senderId, receiverId);
  }
}
