import { prisma } from "@interview-os/database";
import { UpdateFriendRequestData } from "../types/friendRequest";

export class FriendRequestRepository {
  async createFriendRequest(senderId: string, receiverId: string) {
    return prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
      },
    });
  }

  async findById(id: string) {
    return prisma.friendRequest.findUnique({
      where: {
        id,
      },
    });
  }

  async updateFriendRequest(id: string, data: UpdateFriendRequestData) {
    return prisma.friendRequest.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteFriendRequest(id: string) {
    return prisma.friendRequest.delete({
      where: {
        id,
      },
    });
  }

  async getSentFriendRequestsByUserId(userId: string) {
    return prisma.friendRequest.findMany({
      where: {
        senderId: userId,
      },
    });
  }

  async getReceivedFriendRequestsByUserId(userId: string) {
    return prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
    });
  }

  async getAcceptedFriendRequestsByUserId(userId: string) {
    return prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: "ACCEPTED",
      },
    });
  }

  async getAllFriendsByUserId(userId: string) {
    const acceptedRequests = await prisma.friendRequest.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      select: {
        senderId: true,
        receiverId: true,
      },
    });

    const friendIds = acceptedRequests.map((request) =>
      request.senderId === userId ? request.receiverId : request.senderId,
    );

    if (friendIds.length === 0) {
      return [];
    }

    return prisma.user.findMany({
      where: {
        id: {
          in: friendIds,
        },
      },
    });
  }

  async getFriendRequestBySenderAndReceiver(senderId: string, receiverId: string) {
    return prisma.friendRequest.findFirst({
      where: {
        OR: [
          {
            senderId,
            receiverId,
          },
          {
            senderId: receiverId,
            receiverId: senderId,
          },
        ],
      },
    });
  }
}
