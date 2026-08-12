import { Request, Response } from "express";
import { ProfileService } from "../services/profile.service";


export class UserController{
    profileService = new ProfileService();

    //to retrieve data regarding the user
    async getMe(req:Request, res:Response){
        return res.status(200).json(req.user)
    }

    //to update user data
    async updateMe(req: Request, res: Response) {
    const user = await this.profileService.updateUser(
        req.user.id,
        req.body
    );

    return res.json(user);
}
}