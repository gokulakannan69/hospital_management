import { Request, Response } from "express";
import prisma from "../prisma";

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany({ include: { patient: true, doctor: true } });
    let results = appointments.map(a => ({
      ...a, id: a.aptCode, patientName: a.patient.name, doctorName: a.doctor.name, patientId: a.patient.patientCode, doctorId: a.doctor.doctorCode
    }));
    const q = req.query.q as string;
    if (q) {
      const lowerQ = q.toLowerCase();
      results = results.filter(a =>
        a.patientName.toLowerCase().includes(lowerQ) ||
        a.doctorName.toLowerCase().includes(lowerQ) ||
        a.id.toLowerCase().includes(lowerQ) ||
        a.date.includes(q)
      );
    }
    res.json(results);
  } catch (e) { res.status(500).json({ error: "DB Error" }); }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId, date, time } = req.body;
    const patient = await prisma.patient.findUnique({ where: { patientCode: patientId } });
    const doctor = await prisma.doctor.findUnique({ where: { doctorCode: doctorId } });
    if (!patient || !doctor) return res.status(400).json({ error: "Invalid patient or doctor" });

    const aptCode = `APT-${Date.now()}`;
    const appointment = await prisma.appointment.create({
      data: { aptCode, patientId: patient.id, doctorId: doctor.id, date, time, status: "Scheduled" },
      include: { patient: true, doctor: true }
    });
    res.json({ ...appointment, id: appointment.aptCode, patientName: appointment.patient.name, doctorName: appointment.doctor.name });
  } catch (e) { res.status(500).json({ error: "DB Error" }); }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const apt = await prisma.appointment.update({ where: { aptCode: req.params.id }, data: req.body, include: { patient: true, doctor: true } });
    res.json({ ...apt, id: apt.aptCode, patientName: apt.patient.name, doctorName: apt.doctor.name });
  } catch (e) { res.status(404).json({ error: "Appointment not found" }); }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    await prisma.appointment.delete({ where: { aptCode: req.params.id } });
    res.json({ success: true });
  } catch (e) { res.status(404).json({ error: "Appointment not found" }); }
};
