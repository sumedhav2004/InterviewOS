import { Request, Response, Router } from "express";

const router = Router();

async function health(req: Request, res: Response) {
  console.log("BACKEND WORKING .... JUST AWESOMELY FINE!");
  res.status(200).json("OK");
}

router.get("/", health);

export default router;
