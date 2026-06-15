import { Router } from "express";
import { chatWithAi } from "../controllers/chatController";

const router = Router();

router.post("/", chatWithAi);

export default router;
