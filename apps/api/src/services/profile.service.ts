import { UserRepository } from "../repositories/user.repository";

interface UpdateUserProfileDto {
    
}

export class ProfileService{
    private readonly userRepository: UserRepository;

    constructor(){
        this.userRepository = new UserRepository();
    }

    async updateUser(id: string, data: UpdateUserProfileDto){
            const updatedUser = await this.userRepository.updateUser(id,data)
            return updatedUser;   
    }
}