import { Request, Response } from "express";
import { InviteService } from "../services/invite.service";

export class InviteController{
    constructor(
        private readonly inviteService = new InviteService
    ){}

    async createInvite(req:Request, res:Response){
        const senderId = req.user.id 
        const interviewId = req.params.interviewId
        const {receiverId, ...data} = req.body

        const invite = await this.inviteService.createInvite(senderId, receiverId, interviewId, data)
        return res.status(201).json(invite)
    }

    async acceptInvite(req:Request, res:Response){
        const receiverId = req.user.id
        const inviteId = req.params.inviteId

        const invite = await this.inviteService.acceptInvite(inviteId, receiverId)
        return res.status(200).json(invite)
    }

    async declineInvite(req:Request, res:Response){
        const inviteId = req.params.inviteId
        const receiverId = req.user.id

        const invite = await this.inviteService.declineInvite(inviteId, receiverId)
        return res.status(200).json(invite)
    }

    async cancelInvite(req:Request, res:Response){
        const inviteId = req.params.inviteId
        const senderId = req.user.id

        const invite = await this.inviteService.cancelInvite(inviteId, senderId)
        return res.status(200).json(invite)
    }
}