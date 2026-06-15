import { Request, Response } from "express";
import prisma from "../prisma";

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const totalPatients = await prisma.patient.count();
    const totalDoctors = await prisma.doctor.count();
    const totalAppointments = await prisma.appointment.count();
    const appointmentsToday = await prisma.appointment.count({ where: { date: today } });

    const allBills = await prisma.billing.findMany();
    const totalRevenue = allBills.filter(b => b.status === "Paid").reduce((s, b) => s + b.amount, 0);
    const pendingRevenue = allBills.filter(b => b.status === "Pending").reduce((s, b) => s + b.amount, 0);

    const allApts = await prisma.appointment.findMany({ include: { patient: true, doctor: true }, orderBy: [{ date: 'desc' }, { time: 'asc' }], take: 5 });

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];
      const aptsOnDay = await prisma.appointment.count({ where: { date: dateStr } });
      const billsOnDay = await prisma.billing.findMany({ where: { date: dateStr, status: "Paid" } });
      const revenue = billsOnDay.reduce((s, b) => s + b.amount, 0);
      weeklyData.push({ name: dayName, patients: aptsOnDay, revenue });
    }

    const allDoctors = await prisma.doctor.findMany();
    const deptMap: Record<string, number> = {};
    allDoctors.forEach(d => { deptMap[d.department] = (deptMap[d.department] || 0) + 1; });

    res.json({
      totalPatients, totalDoctors, totalAppointments, appointmentsToday,
      totalRevenue, pendingRevenue, totalBills: allBills.length,
      occupancyRate: Math.min(100, Math.round((totalPatients / 10) * 100)),
      weeklyData,
      departmentStats: Object.entries(deptMap).map(([name, count]) => ({ name, count })),
      recentAppointments: allApts.map(a => ({ id: a.aptCode, patientName: a.patient.name, doctorName: a.doctor.name, date: a.date, time: a.time, status: a.status }))
    });
  } catch (e) { res.status(500).json({ error: "DB Error" }); }
};
