import { Request, Response } from "express";
import prisma from "../prisma";

export const getPatients = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    const where = q ? {
      OR: [
        { name: { contains: q } },
        { patientCode: { contains: q } },
        { phone: { contains: q } },
        { disease: { contains: q } }
      ]
    } : {};
    const patients = await prisma.patient.findMany({ where, orderBy: { admissionDate: 'desc' } });
    res.json(patients.map(p => ({ ...p, id: p.patientCode })));
  } catch (e) { res.status(500).json({ error: "DB Error" }); }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const patient = await prisma.patient.findUnique({ where: { patientCode: req.params.id } });
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    const records = await prisma.record.findMany({ where: { patientId: patient.id } });
    const bills = await prisma.billing.findMany({ where: { patientId: patient.id } });
    const appointments = await prisma.appointment.findMany({ where: { patientId: patient.id } });
    res.json({ ...patient, id: patient.patientCode, records, bills, appointments });
  } catch (e) { res.status(500).json({ error: "DB Error" }); }
};

export const createPatient = async (req: Request, res: Response) => {
  try {
    const { name, age, gender, phone, disease, bloodGroup } = req.body;
    const patientCode = `PAT-${Date.now()}`;
    const patient = await prisma.patient.create({
      data: {
        patientCode, name, age: Number(age), gender, phone,
        disease: disease || "", bloodGroup: bloodGroup || "Unknown"
      }
    });
    res.json({ ...patient, id: patient.patientCode });
  } catch (e) { res.status(500).json({ error: "DB Error" }); }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const { name, age, gender, phone, disease, bloodGroup } = req.body;
    const patient = await prisma.patient.update({
      where: { patientCode: req.params.id },
      data: { name, age: age ? Number(age) : undefined, gender, phone, disease, bloodGroup }
    });
    res.json({ ...patient, id: patient.patientCode });
  } catch (e) { res.status(404).json({ error: "Patient not found" }); }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    const patient = await prisma.patient.findUnique({ where: { patientCode: req.params.id } });
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    await prisma.appointment.deleteMany({ where: { patientId: patient.id } });
    await prisma.billing.deleteMany({ where: { patientId: patient.id } });
    await prisma.record.deleteMany({ where: { patientId: patient.id } });
    await prisma.patient.delete({ where: { id: patient.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Delete failed" }); }
};
