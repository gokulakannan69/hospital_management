import { useState, useEffect, useCallback, type FormEvent } from "react";
import axios from "axios";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useToast } from "../components/ui/Toast";
import { Search, Plus, Calendar, Clock, XCircle, CheckCircle } from "lucide-react";

const timeSlots = ["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM"];

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [form, setForm] = useState({ patientId: "", patientName: "", doctorId: "", doctorName: "", date: "", time: "10:00 AM" });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [aptRes, patRes, docRes] = await Promise.all([
        axios.get(`/api/appointments${search ? `?q=${search}` : ''}`),
        axios.get("/api/patients"),
        axios.get("/api/doctors"),
      ]);
      setAppointments(aptRes.data);
      setPatients(patRes.data);
      setDoctors(docRes.data);
    } catch { showToast("Failed to load data", "error"); }
    finally { setLoading(false); }
  }, [search, showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setForm({ patientId: "", patientName: "", doctorId: "", doctorName: "", date: new Date().toISOString().split('T')[0], time: "10:00 AM" });
    setModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.doctorId || !form.date || !form.time) { showToast("All fields are required", "error"); return; }
    setSaving(true);
    try {
      await axios.post("/api/appointments", form);
      showToast("Appointment created", "success");
      setModalOpen(false);
      fetchData();
    } catch { showToast("Failed to create appointment", "error"); }
    finally { setSaving(false); }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await axios.put(`/api/appointments/${cancelTarget.id}`, { status: "Cancelled" });
      showToast("Appointment cancelled", "success");
      setCancelTarget(null);
      fetchData();
    } catch { showToast("Failed to cancel appointment", "error"); }
  };

  const handleComplete = async (apt: any) => {
    try {
      await axios.put(`/api/appointments/${apt.id}`, { status: "Completed" });
      showToast("Appointment completed", "success");
      fetchData();
    } catch { showToast("Failed to update appointment", "error"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">Schedule and manage patient visits.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" /> New Appointment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search by patient, doctor, or date..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">Loading...</td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">No appointments found.</td></tr>
              ) : appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{apt.patientName}</div>
                    <div className="text-xs text-gray-500">{apt.patientId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{apt.doctorName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center"><Calendar className="h-4 w-4 mr-2 text-gray-400" />{apt.date}</div>
                    <div className="flex items-center mt-1"><Clock className="h-4 w-4 mr-2 text-gray-400" />{apt.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      apt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      apt.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>{apt.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {apt.status === 'Scheduled' && (
                      <>
                        <button onClick={() => handleComplete(apt)} className="text-primary-600 hover:text-primary-800 mx-1.5 font-medium"><CheckCircle className="h-4 w-4 inline mr-1" />Complete</button>
                        <button onClick={() => setCancelTarget(apt)} className="text-red-500 hover:text-red-700 mx-1.5"><XCircle className="h-4 w-4 inline mr-1" />Cancel</button>
                      </>
                    )}
                    {apt.status !== 'Scheduled' && <span className="text-gray-400 text-xs">No actions</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Appointment" size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
            <select value={form.patientId} onChange={e => {
              const pat = patients.find(p => p.id === e.target.value);
              setForm(f => ({ ...f, patientId: e.target.value, patientName: pat?.name || "" }));
            }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" required>
              <option value="">Select a patient...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
            <select value={form.doctorId} onChange={e => {
              const doc = doctors.find(d => d.id === e.target.value);
              setForm(f => ({ ...f, doctorId: e.target.value, doctorName: doc?.name || "" }));
            }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" required>
              <option value="">Select a doctor...</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <select value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" required>
                {timeSlots.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {saving ? "Scheduling..." : "Schedule Appointment"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={handleCancel}
        title="Cancel Appointment" message={`Cancel appointment for ${cancelTarget?.patientName} with ${cancelTarget?.doctorName}?`}
        confirmText="Yes, Cancel" variant="danger" />
    </div>
  );
}
