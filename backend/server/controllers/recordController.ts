import { Request, Response } from "express";
import prisma from "../prisma";

export const getRecords = async (req: Request, res: Response) => {
  try {
    let records = await prisma.record.findMany({ include: { patient: true, doctor: true }, orderBy: { date: 'desc' } });
    let results = records.map(r => ({ ...r, id: r.recCode, patientName: r.patient.name, doctorName: r.doctor.name, patientId: r.patient.patientCode }));
    const q = req.query.q as string;
    if (q) {
      const lowerQ = q.toLowerCase();
      results = results.filter(r => r.id.toLowerCase().includes(lowerQ) || r.diagnosis.toLowerCase().includes(lowerQ) || r.patientId.toLowerCase().includes(lowerQ));
    }
    res.json(results);
  } catch (e) { res.status(500).json({ error: "DB Error" }); }
};

export const createRecord = async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId, diagnosis, prescription, date } = req.body;
    const patient = await prisma.patient.findUnique({ where: { patientCode: patientId } });
    const doctor = await prisma.doctor.findUnique({ where: { doctorCode: doctorId } });
    if (!patient || !doctor) return res.status(400).json({ error: "Invalid patient or doctor" });

    const recCode = `REC-${Date.now()}`;
    const record = await prisma.record.create({
      data: { recCode, patientId: patient.id, doctorId: doctor.id, diagnosis, prescription, date: date || new Date().toISOString().split('T')[0] },
    });
    res.json({ ...record, id: record.recCode });
  } catch (e) { res.status(500).json({ error: "DB Error" }); }
};

export const updateRecord = async (req: Request, res: Response) => {
  try {
    const record = await prisma.record.update({ where: { recCode: req.params.id }, data: req.body });
    res.json({ ...record, id: record.recCode });
  } catch (e) { res.status(404).json({ error: "Record not found" }); }
};

export const deleteRecord = async (req: Request, res: Response) => {
  try {
    await prisma.record.delete({ where: { recCode: req.params.id } });
    res.json({ success: true });
  } catch (e) { res.status(404).json({ error: "Record not found" }); }
};
