import { PrismaClient } from '@prisma/client';
import { db } from '../server/db'; // Import old data

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Patients
  const patientMap = new Map();
  for (const p of db.patients) {
    const created = await prisma.patient.create({
      data: {
        patientCode: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        phone: p.phone,
        disease: p.disease,
        bloodGroup: p.bloodGroup,
        admissionDate: new Date(p.admissionDate)
      }
    });
    patientMap.set(p.id, created.id); // Map old ID to new UUID
  }
  console.log("Seeded Patients");

  // 2. Doctors
  const doctorMap = new Map();
  for (const d of db.doctors) {
    const created = await prisma.doctor.create({
      data: {
        doctorCode: d.id,
        name: d.name,
        department: d.department,
        specialization: d.specialization,
        experience: d.experience,
        phone: d.phone
      }
    });
    doctorMap.set(d.id, created.id);
  }
  console.log("Seeded Doctors");

  // 3. Appointments
  for (const a of db.appointments) {
    await prisma.appointment.create({
      data: {
        aptCode: a.id,
        patientId: patientMap.get(a.patientId),
        doctorId: doctorMap.get(a.doctorId),
        date: a.date,
        time: a.time,
        status: a.status
      }
    });
  }
  console.log("Seeded Appointments");

  // 4. Billing
  for (const b of db.billing) {
    await prisma.billing.create({
      data: {
        invCode: b.id,
        patientId: patientMap.get(b.patientId),
        date: b.date,
        amount: b.amount,
        status: b.status,
        method: b.method
      }
    });
  }
  console.log("Seeded Billing");

  // 5. Records
  for (const r of db.records) {
    await prisma.record.create({
      data: {
        recCode: r.id,
        patientId: patientMap.get(r.patientId),
        doctorId: doctorMap.get(r.doctorId),
        diagnosis: r.diagnosis,
        prescription: r.prescription,
        date: r.date
      }
    });
  }
  console.log("Seeded Records");

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });