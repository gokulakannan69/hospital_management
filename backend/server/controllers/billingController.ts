import { Request, Response } from "express";
import prisma from "../prisma";

export const getBilling = async (req: Request, res: Response) => {
  try {
    let billings = await prisma.billing.findMany({ include: { patient: true }, orderBy: { date: 'desc' } });
    let results = billings.map(b => ({
      ...b, id: b.invCode, patientName: b.patient.name, patientId: b.patient.patientCode
    }));
    const q = req.query.q as string;
    if (q) {
      const lowerQ = q.toLowerCase();
      results = results.filter(b =>
        b.id.toLowerCase().includes(lowerQ) || b.patientName.toLowerCase().includes(lowerQ) || b.patientId.toLowerCase().includes(lowerQ)
      );
    }
    res.json(results);
  } catch (e) { res.status(500).json({ error: "DB Error" }); }
};

export const createBilling = async (req: Request, res: Response) => {
  try {
    const { patientId, amount, method } = req.body;
    const patient = await prisma.patient.findUnique({ where: { patientCode: patientId } });
    if (!patient) return res.status(400).json({ error: "Invalid patient" });

    const invCode = `INV-${Date.now()}`;
    const bill = await prisma.billing.create({
      data: { invCode, patientId: patient.id, amount: Number(amount), method: method || "Cash", date: new Date().toISOString().split('T')[0], status: "Pending" },
      include: { patient: true }
    });
    res.json({ ...bill, id: bill.invCode, patientName: bill.patient.name });
  } catch (e) { res.status(500).json({ error: "DB Error" }); }
};

export const updateBilling = async (req: Request, res: Response) => {
  try {
    const bill = await prisma.billing.update({ where: { invCode: req.params.id }, data: req.body, include: { patient: true } });
    res.json({ ...bill, id: bill.invCode, patientName: bill.patient.name });
  } catch (e) { res.status(404).json({ error: "Invoice not found" }); }
};

export const deleteBilling = async (req: Request, res: Response) => {
  try {
    await prisma.billing.delete({ where: { invCode: req.params.id } });
    res.json({ success: true });
  } catch (e) { res.status(404).json({ error: "Invoice not found" }); }
};
