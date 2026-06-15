import { useState, useEffect, useCallback, type FormEvent } from "react";
import axios from "axios";
import Modal from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import { Search, Plus, FileText, Trash2 } from "lucide-react";

const paymentMethods = ["Cash", "UPI", "Card", "Insurance", "Net Banking"];

export default function Billing() {
  const [bills, setBills] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ patientId: "", patientName: "", amount: "", method: "Cash" });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [billRes, patRes] = await Promise.all([
        axios.get(`/api/billing${search ? `?q=${search}` : ''}`),
        axios.get("/api/patients"),
      ]);
      setBills(billRes.data);
      setPatients(patRes.data);
    } catch { showToast("Failed to load billing data", "error"); }
    finally { setLoading(false); }
  }, [search, showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPending = bills.filter(b => b.status === "Pending").reduce((s, b) => s + b.amount, 0);
  const totalCollected = bills.filter(b => b.status === "Paid").reduce((s, b) => s + b.amount, 0);

  const openAdd = () => {
    setForm({ patientId: "", patientName: "", amount: "", method: "Cash" });
    setModalOpen(true);
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.amount) { showToast("Patient and amount are required", "error"); return; }
    setSaving(true);
    try {
      await axios.post("/api/billing", form);
      showToast("Invoice generated", "success");
      setModalOpen(false);
      fetchData();
    } catch { showToast("Failed to generate invoice", "error"); }
    finally { setSaving(false); }
  };

  const handleCollectPayment = async (bill: any) => {
    try {
      await axios.put(`/api/billing/${bill.id}`, { status: "Paid" });
      showToast(`Payment of ₹${bill.amount.toLocaleString()} collected`, "success");
      fetchData();
    } catch { showToast("Failed to process payment", "error"); }
  };

  const handleDelete = async (bill: any) => {
    try {
      await axios.delete(`/api/billing/${bill.id}`);
      showToast("Invoice deleted", "success");
      fetchData();
    } catch { showToast("Failed to delete invoice", "error"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Billing & Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Manage patient invoices and payments.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" /> Generate Bill
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{bills.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Collected</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{totalCollected.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-red-600 mt-1">₹{totalPending.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search by Invoice ID or Patient..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">Loading...</td></tr>
              ) : bills.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">No invoices found.</td></tr>
              ) : bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-primary-600">
                      <FileText className="h-4 w-4 mr-2" /> {bill.id}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{bill.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{bill.patientName}</div>
                    <div className="text-xs text-gray-500">{bill.patientId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">₹{bill.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">via {bill.method}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bill.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>{bill.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {bill.status === 'Pending' ? (
                      <>
                        <button onClick={() => handleCollectPayment(bill)} className="text-primary-600 hover:text-primary-800 font-medium mx-1.5">Collect Payment</button>
                        <button onClick={() => handleDelete(bill)} className="text-gray-400 hover:text-red-600 mx-1.5"><Trash2 className="h-4 w-4 inline" /></button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">Paid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Generate Invoice" size="md">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
            <select value={form.patientId} onChange={e => {
              const p = patients.find(pat => pat.id === e.target.value);
              setForm(f => ({ ...f, patientId: e.target.value, patientName: p?.name || "" }));
            }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" required>
              <option value="">Select a patient...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (INR) *</label>
              <input type="number" min="1" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                {paymentMethods.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {saving ? "Generating..." : "Generate Invoice"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
