import {Prisma, prisma, User} from "@interview-os/database"

export class UserRepository {
  async findByClerkId(clerkId: string) {
    return prisma.user.findUnique({
      where: {
        clerkId,
      },
    });
  }

  async findById(id: string){
    return prisma.user.findUnique({
      where: {
        id
      }
    })
  }

  async createUser(data: Prisma.UserCreateInput){
    return prisma.user.create({
      data
    })
  }

  async updateUser(id:string, data:Object){
    return prisma.user.update({
      where: {
        id
      },
      data: data
    })
  }
}