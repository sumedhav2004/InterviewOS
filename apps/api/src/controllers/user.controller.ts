import { Request, Response } from "express";

export class UserController{
    //
    getMe(req:Request, res:Response){
        console.log("REACHED controller now")
        return res.status(200).json(req.user)
    }
}