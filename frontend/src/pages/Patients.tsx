import { useState, useEffect, useCallback, type FormEvent } from "react";
import axios from "axios";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useToast } from "../components/ui/Toast";
import { Plus, Search, Edit3, Trash2, Eye } from "lucide-react";

const emptyForm = { name: "", age: "", gender: "Male", phone: "", disease: "", bloodGroup: "O+" };

export default function Patients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [viewData, setViewData] = useState<any>(null);
  const { showToast } = useToast();

  const fetchPatients = useCallback(async () => {
    try {
      const res = await axios.get(`/api/patients${search ? `?q=${search}` : ''}`);
      setPatients(res.data);
    } catch { showToast("Failed to load patients", "error"); }
    finally { setLoading(false); }
  }, [search, showToast]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, age: String(p.age), gender: p.gender, phone: p.phone, disease: p.disease || "", bloodGroup: p.bloodGroup || "O+" });
    setModalOpen(true);
  };
  const openView = async (p: any) => {
    try {
      const res = await axios.get(`/api/patients/${p.id}`);
      setViewData(res.data);
      setViewModalOpen(true);
    } catch { showToast("Failed to load patient details", "error"); }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.age || !form.phone) { showToast("Name, age, and phone are required", "error"); return; }
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`/api/patients/${editing.id}`, form);
        showToast("Patient updated successfully", "success");
      } else {
        await axios.post("/api/patients", form);
        showToast("Patient added successfully", "success");
      }
      setModalOpen(false);
      fetchPatients();
    } catch { showToast("Failed to save patient", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`/api/patients/${deleteTarget.id}`);
      showToast("Patient deleted", "success");
      setDeleteTarget(null);
      fetchPatients();
    } catch { showToast("Failed to delete patient", "error"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Patients</h1>
          <p className="text-sm text-gray-500 mt-1">Manage hospital patient records.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" /> Add Patient
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search by ID, Name, Phone or Disease..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Patient / ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Age / Gender</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Diagnosis</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Admitted</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">Loading...</td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">No patients found.</td></tr>
              ) : patients.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{p.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.age} yrs, {p.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{p.disease || 'N/A'}</span>
                    {p.bloodGroup && <span className="text-xs text-gray-500 ml-2">Blood: {p.bloodGroup}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(p.admissionDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button onClick={() => openView(p)} className="text-gray-400 hover:text-primary-600 mx-1.5"><Eye className="h-4 w-4 inline" /></button>
                    <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-amber-600 mx-1.5"><Edit3 className="h-4 w-4 inline" /></button>
                    <button onClick={() => setDeleteTarget(p)} className="text-gray-400 hover:text-red-600 mx-1.5"><Trash2 className="h-4 w-4 inline" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Patient" : "Add Patient"} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
              <input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required min="0" max="150" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disease</label>
              <input type="text" value={form.disease} onChange={e => setForm(f => ({ ...f, disease: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {saving ? "Saving..." : (editing ? "Update Patient" : "Add Patient")}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={viewModalOpen} onClose={() => { setViewModalOpen(false); setViewData(null); }} title="Patient Details" size="xl">
        {viewData && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div><span className="text-xs text-gray-500">Name</span><p className="font-medium">{viewData.name}</p></div>
              <div><span className="text-xs text-gray-500">Patient ID</span><p className="font-mono text-sm">{viewData.id}</p></div>
              <div><span className="text-xs text-gray-500">Age / Gender</span><p className="font-medium">{viewData.age} yrs / {viewData.gender}</p></div>
              <div><span className="text-xs text-gray-500">Phone</span><p className="font-medium">{viewData.phone}</p></div>
              <div><span className="text-xs text-gray-500">Blood Group</span><p className="font-medium">{viewData.bloodGroup}</p></div>
              <div><span className="text-xs text-gray-500">Admission Date</span><p className="font-medium">{new Date(viewData.admissionDate).toLocaleDateString()}</p></div>
              <div className="col-span-2"><span className="text-xs text-gray-500">Disease</span><p className="font-medium">{viewData.disease || 'N/A'}</p></div>
            </div>
            {viewData.records?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Medical Records</h3>
                <div className="space-y-2">
                  {viewData.records.map((r: any) => (
                    <div key={r.id} className="p-3 border border-gray-200 rounded-lg text-sm">
                      <div className="flex justify-between"><span className="font-medium">{r.diagnosis}</span><span className="text-gray-400 text-xs">{r.date}</span></div>
                      <p className="text-gray-600 mt-1">Rx: {r.prescription}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {viewData.bills?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Billing History</h3>
                <div className="space-y-2">
                  {viewData.bills.map((b: any) => (
                    <div key={b.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg text-sm">
                      <span>{b.id} - {b.date}</span>
                      <span className="font-semibold">₹{b.amount.toLocaleString()}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{b.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {viewData.records?.length === 0 && viewData.bills?.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No records or bills found for this patient.</p>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Patient" message={`Are you sure you want to delete ${deleteTarget?.name}?`}
        confirmText="Delete" variant="danger" />
    </div>
  );
}
