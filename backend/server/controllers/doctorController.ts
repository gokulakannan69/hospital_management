import { Request, Response } from "express";
import prisma from "../prisma";

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    const where = q ? {
      OR: [
        { name: { contains: q } },
        { department: { contains: q } },
        { specialization: { contains: q } }
      ]
    } : {};
    const doctors = await prisma.doctor.findMany({ where });
    res.json(doctors.map(d => ({ ...d, id: d.doctorCode })));
  } catch (e) { res.status(500).json({ error: "DB Error" }); }
};

export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { doctorCode: req.params.id } });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    const appointments = await prisma.appointment.findMany({ where: { doctorId: doctor.id } });
    res.json({ ...doctor, id: doctor.doctorCode, appointments });
  } catch (e) { res.status(500).json({ error: "DB Error" }); }
};

export const createDoctor = async (req: Request, res: Response) => {
  try {
    const { name, department, specialization, experience, phone } = req.body;
    const doctorCode = `DOC-${Date.now()}`;
    const doctor = await prisma.doctor.create({
      data: { doctorCode, name, department, specialization, experience: experience || "N/A", phone: phone || "N/A" }
    });
    res.json({ ...doctor, id: doctor.doctorCode });
  } catch (e) { res.status(500).json({ error: "DB Error" }); }
};

export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await prisma.doctor.update({ where: { doctorCode: req.params.id }, data: req.body });
    res.json({ ...doctor, id: doctor.doctorCode });
  } catch (e) { res.status(404).json({ error: "Doctor not found" }); }
};

export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { doctorCode: req.params.id } });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    await prisma.appointment.deleteMany({ where: { doctorId: doctor.id } });
    await prisma.record.deleteMany({ where: { doctorId: doctor.id } });
    await prisma.doctor.delete({ where: { id: doctor.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Delete failed" }); }
};
