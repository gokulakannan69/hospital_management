import { Router } from "express";
import { getRecords, createRecord, updateRecord, deleteRecord } from "../controllers/recordController";

const router = Router();

router.get("/", getRecords);
router.post("/", createRecord);
router.put("/:id", updateRecord);
router.delete("/:id", deleteRecord);

export default router;
