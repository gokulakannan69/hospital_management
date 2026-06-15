export const db = {
  patients: [
    { id: "PAT-1001", name: "Rahul Sharma", age: 45, gender: "Male", phone: "+91 9876543210", disease: "Hypertension", bloodGroup: "O+", admissionDate: "2026-06-01" },
    { id: "PAT-1002", name: "Priya Desai", age: 32, gender: "Female", phone: "+91 8765432109", disease: "Viral Fever", bloodGroup: "A+", admissionDate: "2026-06-08" },
    { id: "PAT-1003", name: "Amitabh Verma", age: 60, gender: "Male", phone: "+91 7654321098", disease: "Osteoarthritis", bloodGroup: "B+", admissionDate: "2026-05-15" }
  ],
  doctors: [
    { id: "DOC-201", name: "Dr. Vikram Singh", department: "Cardiology", specialization: "Interventional Cardiologist", experience: "15 Yrs", phone: "+91 6543210987" },
    { id: "DOC-202", name: "Dr. Ananya Reddy", department: "Pediatrics", specialization: "Neonatologist", experience: "8 Yrs", phone: "+91 5432109876" },
    { id: "DOC-203", name: "Dr. Sanjay Gupta", department: "Orthopedics", specialization: "Joint Replacement", experience: "20 Yrs", phone: "+91 4321098765" },
    { id: "DOC-204", name: "Dr. Meera Iyer", department: "General Medicine", specialization: "Internal Medicine", experience: "10 Yrs", phone: "+91 3210987654" }
  ],
  appointments: [
    { id: "APT-3001", patientId: "PAT-1002", patientName: "Priya Desai", doctorId: "DOC-204", doctorName: "Dr. Meera Iyer", date: new Date().toISOString().split('T')[0], time: "10:30 AM", status: "Completed" },
    { id: "APT-3002", patientId: "PAT-1001", patientName: "Rahul Sharma", doctorId: "DOC-201", doctorName: "Dr. Vikram Singh", date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: "11:00 AM", status: "Scheduled" }
  ],
  billing: [
    { id: "INV-4001", patientId: "PAT-1003", patientName: "Amitabh Verma", date: "2026-05-18", amount: 12500, status: "Paid", method: "UPI" },
    { id: "INV-4002", patientId: "PAT-1002", patientName: "Priya Desai", date: new Date().toISOString().split('T')[0], amount: 800, status: "Pending", method: "Cash" }
  ],
  records: [
    { id: "REC-5001", patientId: "PAT-1003", diagnosis: "Knee Joint Degeneration", prescription: "Physiotherapy, Painkillers (SOS)", date: "2026-05-15", doctorId: "DOC-203" }
  ]
};
