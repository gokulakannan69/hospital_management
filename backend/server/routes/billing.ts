import { Router } from "express";
import { getBilling, createBilling, updateBilling, deleteBilling } from "../controllers/billingController";

const router = Router();

router.get("/", getBilling);
router.post("/", createBilling);
router.put("/:id", updateBilling);
router.delete("/:id", deleteBilling);

export default router;
