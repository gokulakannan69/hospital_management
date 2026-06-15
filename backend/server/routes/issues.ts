import { Router } from "express";
import { getIssues, createIssue, updateIssueStatus, deleteIssue } from "../controllers/issueController";

const router = Router();

router.get("/", getIssues);
router.post("/", createIssue);
router.put("/:id", updateIssueStatus);
router.delete("/:id", deleteIssue);

export default router;
