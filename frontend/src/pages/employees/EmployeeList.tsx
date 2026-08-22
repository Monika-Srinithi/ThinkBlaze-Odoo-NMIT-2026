import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Users, Search, UserPlus, Building2, MapPin, Mail, ShieldCheck, X } from 'lucide-react';
import { apiFetch, apiPost } from '../../api/client';

const FALLBACK_EMPLOYEES = [
  { id: 'emp-1', employee_code: 'EMP001', first_name: 'Arjun', last_name: 'Sharma', full_name: 'Arjun Sharma', email: 'arjun.sharma@dayflow.com', phone: '+91 98765 11001', department: 'Team Alpha', designation: 'Lead Software Architect', location: 'Bangalore', date_of_joining: '2022-03-15', status: 'active', salary: 145000 },
  { id: 'emp-2', employee_code: 'EMP002', first_name: 'Ravi', last_name: 'Kumar', full_name: 'Ravi Kumar', email: 'ravi.kumar@dayflow.com', phone: '+91 98765 11002', department: 'Team Beta', designation: 'Senior Backend Engineer', location: 'Bangalore', date_of_joining: '2023-01-10', status: 'active', salary: 110000 },
  { id: 'emp-3', employee_code: 'EMP003', first_name: 'Priya', last_name: 'Nair', full_name: 'Priya Nair', email: 'priya.nair@dayflow.com', phone: '+91 98765 11003', department: 'Team Beta', designation: 'Fullstack Developer', location: 'Bangalore', date_of_joining: '2023-06-01', status: 'active', salary: 95000 },
  { id: 'emp-4', employee_code: 'EMP004', first_name: 'Sarah', last_name: 'Jenkins', full_name: 'Sarah Jenkins', email: 'sarah.j@dayflow.com', phone: '+91 98765 11004', department: 'Team Gamma', designation: 'Product Manager', location: 'Bangalore', date_of_joining: '2021-11-20', status: 'active', salary: 130000 },
  { id: 'emp-5', employee_code: 'EMP005', first_name: 'Ananya', last_name: 'Rao', full_name: 'Ananya Rao', email: 'ananya.rao@dayflow.com', phone: '+91 98765 11005', department: 'Team Delta', designation: 'UX Lead Designer', location: 'Bangalore', date_of_joining: '2022-08-14', status: 'active', salary: 105000 },
  { id: 'emp-6', employee_code: 'EMP006', first_name: 'Vikram', last_name: 'Aditya', full_name: 'Vikram Aditya', email: 'vikram.a@dayflow.com', phone: '+91 98765 11006', department: 'Team Beta', designation: 'DevOps Specialist', location: 'Bangalore', date_of_joining: '2023-04-05', status: 'on_leave', salary: 115000 },
  { id: 'emp-7', employee_code: 'EMP007', first_name: 'Kavita', last_name: 'Patel', full_name: 'Kavita Patel', email: 'kavita.p@dayflow.com', phone: '+91 98765 11007', department: 'Team Epsilon', designation: 'HR People Partner', location: 'Bangalore', date_of_joining: '2020-05-18', status: 'active', salary: 98000 },
  { id: 'emp-8', employee_code: 'EMP008', first_name: 'Siddharth', last_name: 'Mehta', full_name: 'Siddharth Mehta', email: 'siddharth.m@dayflow.com', phone: '+91 98765 11008', department: 'Team Alpha', designation: 'Data Engineer', location: 'Bangalore', date_of_joining: '2022-10-01', status: 'active', salary: 120000 },
];

export const EmployeeList = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    employee_code: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
    first_name: '',
    last_name: '',
    email: '',
    phone: '+91 98765 00099',
    department: 'Team Alpha',
    designation: 'Software Engineer',
    location: 'Bangalore',
    date_of_joining: new Date().toISOString().split('T')[0],
    employment_type: 'full_time',
    salary: 85000,
  });

  const { data: empData } = useQuery({
    queryKey: ['employees', searchTerm, selectedDept],
    queryFn: () => apiFetch('/employees', { search: searchTerm, department: selectedDept, limit: 100 }),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => apiFetch('/employees/departments'),
  });

  const createMutation = useMutation({
    mutationFn: (newEmp: typeof formData) => apiPost('/employees', newEmp),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      setIsAddModalOpen(false);
      setFormData({
        employee_code: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
        first_name: '',
        last_name: '',
        email: '',
        phone: '+91 98765 00099',
        department: 'Team Alpha',
        designation: 'Software Engineer',
        location: 'Bangalore',
        date_of_joining: new Date().toISOString().split('T')[0],
        employment_type: 'full_time',
        salary: 85000,
      });
    },
  });

  const fetchedItems = empData?.items || [];
  const employees = fetchedItems.length > 0 ? fetchedItems : FALLBACK_EMPLOYEES;
  const filteredEmployees = employees.filter((e: any) => {
    const matchesSearch = !searchTerm || (e.full_name || `${e.first_name} ${e.last_name}`).toLowerCase().includes(searchTerm.toLowerCase()) || e.email.toLowerCase().includes(searchTerm.toLowerCase()) || e.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !selectedDept || e.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users color="var(--primary)" size={34} /> Employee Directory
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage workforce records, designations, department assignments, and live employment statuses.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <UserPlus size={18} /> Add New Employee
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {[
          { label: 'Total Headcount', value: employees.length, icon: Users, color: 'var(--primary)' },
          { label: 'Active Status', value: employees.filter((e: any) => e.status === 'active').length, icon: ShieldCheck, color: 'var(--accent-emerald)' },
          { label: 'On Leave', value: employees.filter((e: any) => e.status === 'on_leave').length, icon: Building2, color: 'var(--accent-amber)' },
          { label: 'Teams / Depts', value: (departments || []).length || 5, icon: MapPin, color: 'var(--accent-cyan)' },
        ].map((m, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.35rem' }}>{m.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{m.value}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.65rem', borderRadius: '0.6rem', color: m.color }}>
              <m.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input-field"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search by employee name, email, designation, or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="input-field"
          style={{ width: 'auto', minWidth: '180px', cursor: 'pointer' }}
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          <option value="">All Departments</option>
          {(departments || ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta', 'Team Epsilon']).map((d: string) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Main Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem 1.25rem' }}>Employee</th>
              <th style={{ padding: '1rem 1.25rem' }}>Code</th>
              <th style={{ padding: '1rem 1.25rem' }}>Department</th>
              <th style={{ padding: '1rem 1.25rem' }}>Designation</th>
              <th style={{ padding: '1rem 1.25rem' }}>Status</th>
              <th style={{ padding: '1rem 1.25rem' }}>Joining Date</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp: any) => {
              const statusClass = emp.status === 'active' ? 'badge-success' : emp.status === 'on_leave' ? 'badge-warning' : 'badge-danger';
              return (
                <tr
                  key={emp.id}
                  style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}
                  onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white' }}>
                        {emp.first_name?.[0]}{emp.last_name?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{emp.full_name || `${emp.first_name} ${emp.last_name}`}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Mail size={12} /> {emp.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                    {emp.employee_code}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{emp.department}</td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>{emp.designation}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className={`badge ${statusClass}`}>{emp.status}</span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)' }}>{emp.date_of_joining}</td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      onClick={() => navigate(`/employees/${emp.id}`)}
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="glass-panel-glow animate-slide-up" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus color="var(--primary)" size={24} /> Create Employee
              </h2>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>First Name</label>
                <input className="input-field" required value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} placeholder="e.g. Ananya" />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Last Name</label>
                <input className="input-field" required value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} placeholder="e.g. Rao" />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Email Address</label>
                <input className="input-field" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="e.g. ananya.rao@dayflow.com" />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Department</label>
                <select className="input-field" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                  <option value="Team Alpha">Team Alpha</option>
                  <option value="Team Beta">Team Beta</option>
                  <option value="Team Gamma">Team Gamma</option>
                  <option value="Team Delta">Team Delta</option>
                  <option value="Team Epsilon">Team Epsilon</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Designation</label>
                <input className="input-field" required value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} placeholder="e.g. Senior SWE" />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Salary (INR)</label>
                <input className="input-field" type="number" required value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Joining Date</label>
                <input className="input-field" type="date" required value={formData.date_of_joining} onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })} />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
