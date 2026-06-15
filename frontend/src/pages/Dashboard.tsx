import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Users, Stethoscope, CalendarCheck, IndianRupee, Activity, Bed, Clock, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<any>({
    totalPatients: 0, totalDoctors: 0, appointmentsToday: 0, totalRevenue: 0,
    pendingRevenue: 0, totalAppointments: 0, occupancyRate: 0, weeklyData: [],
    departmentStats: [], recentAppointments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/analytics").then(res => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Hospital overview and performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Patients" value={stats.totalPatients} icon={Users} color="text-amber-600" bg="bg-amber-100" />
        <MetricCard title="Active Doctors" value={stats.totalDoctors} icon={Stethoscope} color="text-primary-600" bg="bg-primary-100" />
        <MetricCard title="Today's Appts" value={stats.appointmentsToday} icon={CalendarCheck} color="text-indigo-600" bg="bg-indigo-100" />
        <MetricCard title="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={IndianRupee} color="text-emerald-600" bg="bg-emerald-100" />
        <MetricCard title="Pending Revenue" value={`₹${stats.pendingRevenue.toLocaleString()}`} icon={Clock} color="text-red-600" bg="bg-red-100" />
        <MetricCard title="Total Appointments" value={stats.totalAppointments} icon={Activity} color="text-purple-600" bg="bg-purple-100" />
        <MetricCard title="Occupancy" value={`${stats.occupancyRate}%`} icon={Bed} color="text-cyan-600" bg="bg-cyan-100" />
        <MetricCard title="Invoices" value={stats.totalBills} icon={IndianRupee} color="text-rose-600" bg="bg-rose-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Weekly Patient Visits</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="patients" fill="#059669" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Departments</h2>
          <div className="space-y-3">
            {stats.departmentStats.map((dept: any) => (
              <div key={dept.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{dept.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${(dept.count / Math.max(stats.totalDoctors, 1)) * 100}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-800 w-6 text-right">{dept.count}</span>
                </div>
              </div>
            ))}
            {stats.departmentStats.length === 0 && <p className="text-sm text-gray-400">No department data</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Recent Appointments</h2>
          <Link to="/appointments" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date / Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentAppointments.map((apt: any) => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{apt.patientName}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">{apt.doctorName}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{apt.date} at {apt.time}</td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      apt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      apt.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>{apt.status}</span>
                  </td>
                </tr>
              ))}
              {stats.recentAppointments.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">No appointments yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center">
      <div className={`p-3 rounded-full ${bg} ${color} mr-4`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}
