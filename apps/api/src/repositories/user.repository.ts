import {Prisma, prisma, User} from "@interview-os/database"

export class UserRepository {
  async findByClerkId(clerkId: string) {
    return prisma.user.findUnique({
      where: {
        clerkId,
      },
    });
  }

  async createUser(data: Prisma.UserCreateInput){
    return prisma.user.create({
      data
    })
  }
}