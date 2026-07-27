
import { clerkClient } from "../clients/clerk.client";
import { UserRepository } from "../repositories/user.repository";

export class IdentityService {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUserByClerkId(clerkId: string) {
    return this.userRepository.findByClerkId(clerkId);
  }

  async findOrCreateUser(clerkId: string){
    const existing = await this.userRepository.findByClerkId(clerkId);
    if(existing){
      return existing
    }

    const clerkUser = await clerkClient.users.getUser(clerkId)
    const newUser = await this.userRepository.createUser({
      name: clerkUser.firstName + ' ' + clerkUser.lastName,
      email: clerkUser.emailAddresses[0].emailAddress,
      clerkId: clerkUser.id,
      avatarUrl: clerkUser.imageUrl,
    })

    return newUser

  }
}