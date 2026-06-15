import { useState, useEffect, useCallback, type FormEvent } from "react";
import axios from "axios";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useToast } from "../components/ui/Toast";
import { Search, Plus, AlertCircle, Trash2, CheckCircle } from "lucide-react";

const emptyForm = { title: "", description: "", status: "Open", priority: "Medium" };

export default function Issues() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const fetchIssues = useCallback(async () => {
    try {
      const res = await axios.get(`/api/issues${search ? `?q=${search}` : ''}`);
      setIssues(res.data);
    } catch { showToast("Failed to load issues", "error"); }
    finally { setLoading(false); }
  }, [search, showToast]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const openAdd = () => { setForm(emptyForm); setModalOpen(true); };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) { showToast("Title and description are required", "error"); return; }
    setSaving(true);
    try {
      await axios.post("/api/issues", { ...form, date: new Date().toISOString().split('T')[0] });
      showToast("Issue reported successfully", "success");
      setModalOpen(false);
      fetchIssues();
    } catch { showToast("Failed to report issue", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`/api/issues/${deleteTarget.id}`);
      showToast("Issue deleted", "success");
      setDeleteTarget(null);
      fetchIssues();
    } catch { showToast("Failed to delete issue", "error"); }
  };

  const handleStatusChange = async (issue: any, newStatus: string) => {
    try {
      await axios.put(`/api/issues/${issue.id}`, { status: newStatus });
      showToast(`Issue marked as ${newStatus}`, "success");
      fetchIssues();
    } catch { showToast("Failed to update status", "error"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Issues Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">Manage hospital facility and internal complaints.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" /> Report Issue
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search issues..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Issue</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">Loading...</td></tr>
              ) : issues.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">No issues found.</td></tr>
              ) : issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <AlertCircle className={`h-5 w-5 mr-3 ${issue.priority === 'High' ? 'text-red-500' : issue.priority === 'Medium' ? 'text-amber-500' : 'text-blue-500'}`} />
                      <div>
                        <div className="font-medium text-gray-900">{issue.title}</div>
                        <div className="text-xs text-gray-500 max-w-xs truncate">{issue.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      issue.priority === 'High' ? 'bg-red-100 text-red-800' : 
                      issue.priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>{issue.priority}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      issue.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                      issue.status === 'In Progress' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>{issue.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{issue.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {issue.status !== 'Resolved' && (
                       <button onClick={() => handleStatusChange(issue, 'Resolved')} className="text-green-600 hover:text-green-800 mx-1.5 font-medium"><CheckCircle className="h-4 w-4 inline mr-1" />Resolve</button>
                    )}
                    <button onClick={() => setDeleteTarget(issue)} className="text-gray-400 hover:text-red-600 mx-1.5"><Trash2 className="h-4 w-4 inline" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Report Issue" size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
               <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {saving ? "Saving..." : "Submit Issue"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Issue" message="Are you sure you want to delete this issue?"
        confirmText="Delete" variant="danger" />
    </div>
  );
}