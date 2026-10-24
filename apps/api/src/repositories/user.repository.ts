import { Prisma, prisma } from "@interview-os/database";

export class UserRepository {
  async findByClerkId(clerkId: string) {
    return prisma.user.findUnique({
      where: {
        clerkId,
      },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            interview: true,
          },
        },
        createdInterviews: true,
        SentRequests: true,
        ReceivedRequests: true,
        questions: true,
      },
    });
  }

  async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
    });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: {
        id,
      },
      data: data,
    });
  }

  async getUserByEmail(emailId: string) {
    return prisma.user.findUnique({
      where: {
        email: emailId,
      },
    });
  }
}
