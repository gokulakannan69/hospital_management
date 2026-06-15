import { Request, Response } from "express";
import prisma from "../prisma";

export const getIssues = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    let issues = await prisma.issue.findMany({ orderBy: { createdAt: 'desc' } });
    if (q) {
      const lowerQ = q.toLowerCase();
      issues = issues.filter(i => 
        i.title.toLowerCase().includes(lowerQ) || 
        i.description.toLowerCase().includes(lowerQ)
      );
    }
    res.json(issues);
  } catch (e) { res.status(500).json({ error: "DB Error" }); }
};

export const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, priority, status, date } = req.body;
    const issue = await prisma.issue.create({
      data: { title, description, priority, status, date }
    });
    res.json(issue);
  } catch (e) { res.status(500).json({ error: "DB Error" }); }
};

export const updateIssueStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const issue = await prisma.issue.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(issue);
  } catch (e) { res.status(404).json({ error: "Issue not found" }); }
};

export const deleteIssue = async (req: Request, res: Response) => {
  try {
    await prisma.issue.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) { res.status(404).json({ error: "Issue not found" }); }
};
