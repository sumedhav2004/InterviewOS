import { describe, expect, it, vi } from "vitest"
import { requestIdMiddleware } from "../../src/middleware/request-id.middleware"
import { Request, Response } from "express"


describe("requestIdMiddleware()", ()=>{
    it("should attach a request-id to a request", () => {
        const req = {
            headers: {}
        } as Request

        const res = {
            setHeader: vi.fn() 
        } as unknown as Response

        const next = vi.fn()

        requestIdMiddleware(req,res,next);

        expect(req.headers['x-request-id']).toBeDefined()
        expect(res.setHeader).toHaveBeenCalledWith(
            "x-request-id",
            expect.any(String)
        )

        expect(next).toHaveBeenCalledTimes(1)
    })
})