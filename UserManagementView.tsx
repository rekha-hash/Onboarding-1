/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldAlert, 
  Trash2, 
  UserCheck, 
  Plus, 
  Briefcase, 
  Contact, 
  Building,
  KeyRound,
  Eye,
  EyeOff,
  Edit3,
  Mail,
  Send,
  CheckCircle2,
  LockOpen,
  Info,
  Shield
} from 'lucide-react';
import { AppUser, ProjectOwnerDetail, EmailLog, Project } from '../types';

interface UserManagementViewProps {
  users: AppUser[];
  onAddUser: (user: AppUser) => void;
  onDeleteUser: (username: string) => void;
  onUpdateUser: (user: AppUser, oldUsername?: string) => void;
  owners: ProjectOwnerDetail[];
  onAddOwner: (owner: ProjectOwnerDetail) => void;
  onDeleteOwner: (id: string) => void;
  onUpdateOwner: (owner: ProjectOwnerDetail) => void;
  currentActiveUser: AppUser;
  projects: Project[];
}

export default function UserManagementView({
  users,
  onAddUser,
  onDeleteUser,
  onUpdateUser,
  owners,
  onAddOwner,
  onDeleteOwner,
  onUpdateOwner,
  currentActiveUser,
  projects
}: UserManagementViewProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'owners' | 'outbox'>('users');
  const [editUserUsername, setEditUserUsername] = useState('');

  // Add User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [regMethod, setRegMethod] = useState<'manual' | 'email'>('email');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'Administrator' | 'Project Owner' | 'Lead' | 'Salesperson'>('Project Owner');
  
  // Simulated Outbox State
  const [emails, setEmails] = useState<EmailLog[]>(() => {
    const saved = localStorage.getItem('nucore_simulated_emails');
    return saved ? JSON.parse(saved) : [];
  });

  // Password set overlay
  const [passwordSetEmail, setPasswordSetEmail] = useState<EmailLog | null>(null);
  const [invitePassword, setInvitePassword] = useState('');
  const [selectedMailId, setSelectedMailId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('nucore_simulated_emails', JSON.stringify(emails));
  }, [emails]);

  // Edit User Form State
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserRole, setEditUserRole] = useState<'Administrator' | 'Project Owner' | 'Lead' | 'Salesperson'>('Project Owner');

  // Add Owner Details Form State
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newLeadName, setNewLeadName] = useState('');
  const [newDepartment, setNewDepartment] = useState('Implementation');
  const [newContact, setNewContact] = useState('');

  // Edit Owner Details Form State
  const [editingOwner, setEditingOwner] = useState<ProjectOwnerDetail | null>(null);
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerLeadName, setEditOwnerLeadName] = useState('');
  const [editOwnerDepartment, setEditOwnerDepartment] = useState('');
  const [editOwnerContact, setEditOwnerContact] = useState('');

  const [revealPasswords, setRevealPasswords] = useState<Record<string, boolean>>({});

  const togglePasswordReveal = (username: string) => {
    setRevealPasswords(prev => ({ ...prev, [username]: !prev[username] }));
  };

  const handleUserSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim()) {
      alert('Please fill out user name and username.');
      return;
    }

    if (regMethod === 'email' && !newEmail.trim()) {
      alert('Please provide a valid email ID to send the invite.');
      return;
    }

    if (regMethod === 'manual' && !newPassword.trim()) {
      alert('Please provide a password for manual creation.');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      alert('Username already exists. Please select another username.');
      return;
    }

    const emailToUse = newEmail.trim() || `${newUsername.trim()}@nucore.in`;
    
    const newUser: AppUser = {
      username: newUsername.trim(),
      name: newName.trim(),
      role: newRole,
      email: emailToUse,
      password: regMethod === 'manual' ? newPassword.trim() : '',
      status: regMethod === 'manual' ? 'Active' : 'Pending Password Invite'
    };

    onAddUser(newUser);

    // If email invite, send simulated invite email
    if (regMethod === 'email') {
      const token = Math.random().toString(36).substring(2, 10).toUpperCase();
      const newEmailLog: EmailLog = {
        id: 'MAIL-' + Date.now(),
        to: emailToUse,
        subject: '🔑 Setup Your Secure Nucore Account Password',
        body: `Hi ${newName.trim()},\n\nWelcome to Nucore Onboarding System! You have been registered with the username: ${newUsername.trim()}.\n\nTo activate your account, you must configure your password. Please click the button below to set up your password:`,
        sentAt: new Date().toLocaleString(),
        username: newUsername.trim(),
        token,
        status: 'Pending Set'
      };
      setEmails(prev => [newEmailLog, ...prev]);
    }
    
    // Automatically also offer to register them as a Project Owner if their role is Project Owner
    if (newRole === 'Project Owner') {
      const nextId = 'OWNER-' + (owners.length + 1).toString().padStart(3, '0');
      onAddOwner({
        id: nextId,
        name: newName.trim(),
        leadName: 'Executive Director',
        department: 'Customer Delivery',
        contact: emailToUse
      });
    }

    // Reset fields
    setNewUsername('');
    setNewName('');
    setNewPassword('');
    setNewEmail('');
    
    if (regMethod === 'email') {
      alert(`User "${newName}" registered! An invite email was simulated and sent to "${emailToUse}". Open the "Simulated Outbox" tab to view it and set their password!`);
    } else {
      alert(`User "${newName}" registered successfully!`);
    }
  };

  const handleOwnerSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newOwnerName.trim() || !newLeadName.trim()) {
      alert('Please specify the Project Owner and their assigned Lead.');
      return;
    }

    const nextId = 'OWNER-' + (owners.length + 1).toString().padStart(3, '0');
    const newOwner: ProjectOwnerDetail = {
      id: nextId,
      name: newOwnerName.trim(),
      leadName: newLeadName.trim(),
      department: newDepartment,
      contact: newContact.trim() || 'N/A'
    };

    onAddOwner(newOwner);
    
    // Reset fields
    setNewOwnerName('');
    setNewLeadName('');
    setNewContact('');
    alert(`Project Owner "${newOwnerName}" mapped to Lead "${newLeadName}" successfully!`);
  };

  const startEditingUser = (u: AppUser) => {
    setEditingUser(u);
    setEditUserName(u.name);
    setEditUserPassword(u.password);
    setEditUserRole(u.role);
    setEditUserUsername(u.username);
  };

  const handleEditUserSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editUserName.trim() || !editUserPassword.trim() || !editUserUsername.trim()) {
      alert('Name, username, and password cannot be empty.');
      return;
    }
    const updatedUser: AppUser = {
      ...editingUser,
      name: editUserName.trim(),
      username: editUserUsername.trim().toLowerCase(),
      password: editUserPassword.trim(),
      role: editUserRole
    };
    onUpdateUser(updatedUser, editingUser.username);
    
    // Also update matching Project Owner Detail if the owner name changed
    if (editingUser.name !== editUserName.trim()) {
      const match = owners.find(o => o.name.toLowerCase() === editingUser.name.toLowerCase());
      if (match) {
        onUpdateOwner({
          ...match,
          name: editUserName.trim()
        });
      }
    }

    setEditingUser(null);
    alert('User updated successfully!');
  };

  const startEditingOwner = (o: ProjectOwnerDetail) => {
    setEditingOwner(o);
    setEditOwnerName(o.name);
    setEditOwnerLeadName(o.leadName);
    setEditOwnerDepartment(o.department || 'Customer Implementation');
    setEditOwnerContact(o.contact || '');
  };

  const handleEditOwnerSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingOwner) return;
    if (!editOwnerName.trim() || !editOwnerLeadName.trim()) {
      alert('Owner name and lead name cannot be empty.');
      return;
    }
    const updatedOwner: ProjectOwnerDetail = {
      ...editingOwner,
      name: editOwnerName.trim(),
      leadName: editOwnerLeadName.trim(),
      department: editOwnerDepartment,
      contact: editOwnerContact.trim() || 'N/A'
    };
    onUpdateOwner(updatedOwner);

    // Also update matching AppUser's full name if the owner's name changed
    if (editingOwner.name !== editOwnerName.trim()) {
      const match = users.find(u => u.name.toLowerCase() === editingOwner.name.toLowerCase());
      if (match) {
        onUpdateUser({
          ...match,
          name: editOwnerName.trim()
        });
      }
    }

    setEditingOwner(null);
    alert('Project Owner directory entry updated successfully!');
  };

  const handleInvitePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!passwordSetEmail) return;
    if (!invitePassword.trim()) {
      alert('Password cannot be empty.');
      return;
    }

    const targetUser = users.find(u => u.username.toLowerCase() === passwordSetEmail.username.toLowerCase());
    if (!targetUser) {
      alert('Associated system user could not be found.');
      return;
    }

    const updatedUser: AppUser = {
      ...targetUser,
      password: invitePassword.trim(),
      status: 'Active'
    };
    onUpdateUser(updatedUser);

    // Update email status
    setEmails(prev => prev.map(m => m.id === passwordSetEmail.id ? { ...m, status: 'Password Configured' as const } : m));
    
    setPasswordSetEmail(null);
    setInvitePassword('');
    alert(`Successfully configured password and activated system access for "${updatedUser.name}"! They can now log in using username "${updatedUser.username}".`);
  };

  if (currentActiveUser.role !== 'Administrator') {
    return (
      <div className="p-6 ml-64 max-w-[calc(100vw-16rem)] font-sans">
        <div className="bg-white border border-red-250 p-8 rounded-xl shadow-md text-center max-w-lg mx-auto mt-12">
          <Shield className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Access Denied</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed font-semibold">
            You do not have administrative permissions to view sensitive credentials, passwords, or manage employee directories. Please contact the Super Admin for system configuration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 ml-64 max-w-[calc(100vw-16rem)] overflow-y-auto">
      
      {/* Header section */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access &amp; Directory Panel</h1>
        <p className="text-xs text-slate-500 font-mono mt-0.5">MANAGE SYSTEM ACCESS CREDENTIALS, OWNER DIRECTORIES & LEADS</p>
      </div>

      {/* Control Switch Tabs */}
      <div className="flex border-b border-slate-200 mb-6 bg-white p-1 rounded-xl shadow-sm inline-flex">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-colors ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>System Users ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('owners')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-colors ${
            activeTab === 'owners'
              ? 'bg-slate-900 text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Project Owners &amp; Leads ({owners.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('outbox')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-colors ${
            activeTab === 'outbox'
              ? 'bg-slate-900 text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Simulated Outbox ({emails.length})</span>
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Create or Edit User Form Section */}
          <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-xl shadow-sm self-start">
            {editingUser ? (
              <div>
                <h2 className="text-sm font-black text-slate-800 mb-1 flex items-center gap-1.5 uppercase font-mono tracking-wide">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  <span>Edit User Access</span>
                </h2>
                <p className="text-xs text-slate-400 mb-4 font-medium">Update credentials for {editingUser.username}.</p>

                <form onSubmit={handleEditUserSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Employee Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editUserName}
                      onChange={(e) => setEditUserName(e.target.value)}
                      placeholder="e.g., Jennifer Alana"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Username (Editable)
                    </label>
                    <input
                      type="text"
                      required
                      value={editUserUsername}
                      onChange={(e) => setEditUserUsername(e.target.value.trim().toLowerCase())}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Set Password
                    </label>
                    <input
                      type="text"
                      required
                      value={editUserPassword}
                      onChange={(e) => setEditUserPassword(e.target.value)}
                      placeholder="e.g., jennypass99"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                      System Authorization Role
                    </label>
                    <select
                      value={editUserRole}
                      onChange={(e) => setEditUserRole(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-700"
                    >
                      <option value="Administrator">👑 Administrator (Full access)</option>
                      <option value="Project Owner">👔 Project Owner (Update milestones)</option>
                      <option value="Lead">🛡️ Lead (Verify delivery parameters)</option>
                      <option value="Salesperson">📊 Salesperson (View performance metrics)</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-lg transition-colors text-center uppercase font-mono tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 uppercase font-mono tracking-wider shadow-sm"
                    >
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <h2 className="text-sm font-black text-slate-800 mb-1 flex items-center gap-1.5 uppercase font-mono tracking-wide">
                  <UserPlus className="w-4 h-4 text-[#006a66]" />
                  <span>Register User Access</span>
                </h2>
                <p className="text-xs text-slate-400 mb-4 font-medium">Add credentials for local system authentication.</p>

                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Employee Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g., Jennifer Alana"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Unique Username
                    </label>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="e.g., jennifer"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Email Address (For password set link)
                    </label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g., jennifer@nucore.in"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                      Password Generation / Delivery
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setRegMethod('email')}
                        className={`py-1.5 px-2.5 text-[10px] font-bold font-mono uppercase tracking-wider rounded-md transition-all text-center ${
                          regMethod === 'email'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        ✉️ Invite Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegMethod('manual')}
                        className={`py-1.5 px-2.5 text-[10px] font-bold font-mono uppercase tracking-wider rounded-md transition-all text-center ${
                          regMethod === 'manual'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        🔒 Manual Set
                      </button>
                    </div>
                  </div>

                  {regMethod === 'manual' ? (
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                        Secure Password
                      </label>
                      <input
                        type="text"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="e.g., jennypass99"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800 font-mono"
                      />
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 text-[10px] p-3 rounded-lg leading-normal flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Invite Email Option Selected</strong>: An interactive onboarding invite email will be logged in the <strong>Simulated Outbox</strong> tab. Click it there to set the password!
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                      System Authorization Role
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-700"
                    >
                      <option value="Administrator">👑 Administrator (Full access)</option>
                      <option value="Project Owner">👔 Project Owner (Update milestones)</option>
                      <option value="Lead">🛡️ Lead (Verify delivery parameters)</option>
                      <option value="Salesperson">📊 Salesperson (View performance metrics)</option>
                    </select>
                  </div>

                  {newRole === 'Project Owner' && (
                    <div className="bg-indigo-50 text-indigo-800 text-[10px] p-3 rounded-lg leading-normal">
                      💡 <strong>Direct Auto-Mapping</strong>: Selecting "Project Owner" automatically provisions a matching Project Owner Directory record mapped with base details for fast onboarding.
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 uppercase font-mono tracking-wider shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register User Account</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Current Users Listing Section */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Current Login Directory</h3>
                <p className="text-[10px] text-slate-450 font-mono">Simulated security authentication registry</p>
              </div>
              <span className="text-[9px] font-mono font-bold bg-[#eef4ff] text-indigo-700 border border-blue-200 px-2 py-0.5 rounded uppercase">
                {users.length} Active accounts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-mono text-[9px] uppercase font-bold tracking-wider">
                    <th className="p-3.5 border-r border-slate-800">Employee User</th>
                    <th className="p-3.5 border-r border-slate-800 w-28">Username</th>
                    <th className="p-3.5 border-r border-slate-800 w-32">Password</th>
                    <th className="p-3.5 border-r border-slate-800 w-32">Role Auth</th>
                    <th className="p-3.5 text-center w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-xs">
                  {users.map(u => (
                    <tr key={u.username} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{u.name}</span>
                          {currentActiveUser.username === u.username && (
                            <span className="text-[8px] bg-emerald-50 text-emerald-800 border border-emerald-250 font-mono px-1 py-0.2 rounded font-bold uppercase">
                              Self
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-500 font-bold">{u.username}</td>
                      <td className="p-3.5 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600 font-semibold">
                            {revealPasswords[u.username] ? u.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordReveal(u.username)}
                            className="text-slate-400 hover:text-slate-700"
                            title="Toggle reveal password"
                          >
                            {revealPasswords[u.username] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          u.role === 'Administrator'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : u.role === 'Project Owner'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : u.role === 'Lead'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 text-center flex justify-center items-center gap-2">
                        <button
                          onClick={() => startEditingUser(u)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                          title="Edit user account"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (currentActiveUser.username === u.username) {
                              alert("You cannot delete your own logged-in account!");
                              return;
                            }
                            const hasActiveProjects = projects.some(p => p.projectOwner.toLowerCase() === u.name.toLowerCase() && p.status === 'Active');
                            if (hasActiveProjects) {
                              alert(`Cannot delete user "${u.name}". This employee is currently assigned as the Project Owner for active onboarding projects. Please reassign or close their active projects before deleting.`);
                              return;
                            }
                            if (confirm(`Are you sure you want to delete user account: ${u.name}?`)) {
                              onDeleteUser(u.username);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete account credential"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : activeTab === 'owners' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Create or Edit Owner details mapped to Lead form */}
          <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-xl shadow-sm self-start">
            {editingOwner ? (
              <div>
                <h2 className="text-sm font-black text-slate-800 mb-1 flex items-center gap-1.5 uppercase font-mono tracking-wide">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  <span>Edit Owner Detail</span>
                </h2>
                <p className="text-xs text-slate-400 mb-4 font-medium">Update directory for owner {editingOwner.id}.</p>

                <form onSubmit={handleEditOwnerSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Project Owner Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editOwnerName}
                      onChange={(e) => setEditOwnerName(e.target.value)}
                      placeholder="e.g., Sarah Jenkins"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Designated Lead Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editOwnerLeadName}
                      onChange={(e) => setEditOwnerLeadName(e.target.value)}
                      placeholder="e.g., Director John Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Operational Department
                    </label>
                    <select
                      value={editOwnerDepartment}
                      onChange={(e) => setEditOwnerDepartment(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-700"
                    >
                      <option value="Customer Implementation">Customer Implementation</option>
                      <option value="Operations Delivery">Operations Delivery</option>
                      <option value="Solutions Integration">Solutions Integration</option>
                      <option value="Enterprise Systems">Enterprise Systems</option>
                      <option value="Sales Support Ops">Sales Support Ops</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Contact Coordinates
                    </label>
                    <input
                      type="text"
                      value={editOwnerContact}
                      onChange={(e) => setEditOwnerContact(e.target.value)}
                      placeholder="e.g., sarah.j@nucore.in"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingOwner(null)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-lg transition-colors text-center uppercase font-mono tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 uppercase font-mono tracking-wider shadow-sm"
                    >
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <h2 className="text-sm font-black text-slate-800 mb-1 flex items-center gap-1.5 uppercase font-mono tracking-wide">
                  <Briefcase className="w-4 h-4 text-[#006a66]" />
                  <span>Map Owner to Lead</span>
                </h2>
                <p className="text-xs text-slate-400 mb-4 font-medium">Link project owners with their operational Leads.</p>

                <form onSubmit={handleOwnerSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Project Owner Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newOwnerName}
                      onChange={(e) => setNewOwnerName(e.target.value)}
                      placeholder="e.g., Sarah Jenkins"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Designated Lead Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newLeadName}
                      onChange={(e) => setNewLeadName(e.target.value)}
                      placeholder="e.g., Director John Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Operational Department
                    </label>
                    <select
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-700"
                    >
                      <option value="Customer Implementation">Customer Implementation</option>
                      <option value="Operations Delivery">Operations Delivery</option>
                      <option value="Solutions Integration">Solutions Integration</option>
                      <option value="Enterprise Systems">Enterprise Systems</option>
                      <option value="Sales Support Ops">Sales Support Ops</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Contact Coordinates
                    </label>
                    <input
                      type="text"
                      value={newContact}
                      onChange={(e) => setNewContact(e.target.value)}
                      placeholder="e.g., sarah.j@nucore.in"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 uppercase font-mono tracking-wider shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Assign Lead to Owner</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Owners & Leads Directory Registry Table */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Owners &amp; Leads Directory</h3>
                <p className="text-[10px] text-slate-450 font-mono">Hierarchical tracking for project assignments</p>
              </div>
              <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-250 px-2 py-0.5 rounded uppercase">
                {owners.length} Project Owners Mapped
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-mono text-[9px] uppercase font-bold tracking-wider">
                    <th className="p-3.5 border-r border-slate-800 w-24">Owner ID</th>
                    <th className="p-3.5 border-r border-slate-800">Project Owner Name</th>
                    <th className="p-3.5 border-r border-slate-800">Designated Lead (Manager)</th>
                    <th className="p-3.5 border-r border-slate-800 w-36">Department</th>
                    <th className="p-3.5 text-center w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-xs">
                  {owners.map(own => (
                    <tr key={own.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-mono text-slate-400 font-bold">{own.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Contact className="w-3.5 h-3.5 text-[#006a66]" />
                          <span>{own.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{own.contact}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-extrabold text-indigo-900 bg-indigo-50/70 border border-blue-100 px-2 py-0.5 rounded">
                          Lead: {own.leadName}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 font-semibold">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 shrink-0" />
                          <span>{own.department || 'Implementation'}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-center flex justify-center items-center gap-2">
                        <button
                          onClick={() => startEditingOwner(own)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                          title="Edit owner mapping detail"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove Project Owner Mapping for: ${own.name}?`)) {
                              onDeleteOwner(own.id);
                            }
                          }}
                          className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors"
                          title="Delete mapping"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* Simulated Outbox Tab View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Outbox Dispatch Queue (List) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  <span>Simulated Outbox Logs</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">Simulating real-time automated mail delivery logs</p>
              </div>
              <span className="text-[9px] font-mono font-bold bg-[#eef4ff] text-indigo-700 border border-blue-200 px-2 py-0.5 rounded uppercase">
                {emails.length} Messages
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {emails.length === 0 ? (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <Send className="w-8 h-8 text-slate-300 animate-bounce" />
                  <p className="text-xs font-semibold">No simulated emails sent yet.</p>
                  <p className="text-[10px] text-slate-400 max-w-[220px] leading-normal">
                    Try adding a new user and select the "Invite Email" registration method!
                  </p>
                </div>
              ) : (
                emails.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMailId(m.id)}
                    className={`w-full text-left p-4 hover:bg-slate-50/50 transition-colors flex flex-col gap-1.5 border-l-4 ${
                      selectedMailId === m.id ? 'bg-indigo-50/30 border-l-indigo-600' : 'border-l-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[180px]">{m.to}</span>
                      <span className="text-[9px] text-slate-400 font-mono shrink-0">{m.sentAt.split(',')[1] || m.sentAt}</span>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-500 truncate w-full font-mono uppercase">{m.subject}</p>
                    
                    <div className="flex justify-between items-center w-full mt-1">
                      <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider border ${
                        m.status === 'Pending Set'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-250'
                      }`}>
                        {m.status === 'Pending Set' ? '🟡 Invite Sent' : '🟢 Activated'}
                      </span>
                      <span className="text-[9px] text-indigo-600 font-bold hover:underline font-mono">View Mail &rarr;</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Simulated Mail Client Workspace */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[450px]">
            {(() => {
              const activeMail = emails.find(m => m.id === selectedMailId);
              if (!activeMail) {
                return (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-3.5 text-slate-300">
                      <Mail className="w-10 h-10" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Interactive Mail Client Sandbox</h4>
                    <p className="text-[10px] text-slate-400 max-w-sm mt-1 leading-normal">
                      Select an outgoing registration invite email from the log panel on the left to simulate opening the client inbox of the target employee, allowing them to configure passwords.
                    </p>
                  </div>
                );
              }

              return (
                <div className="flex-1 flex flex-col h-full bg-slate-50">
                  {/* Email Headers */}
                  <div className="p-4 bg-white border-b border-slate-200 space-y-2 shrink-0">
                    <div className="flex justify-between items-start">
                      <h2 className="text-sm font-black text-slate-800 font-mono tracking-tight uppercase">
                        {activeMail.subject}
                      </h2>
                      <span className="text-[9px] text-slate-400 font-mono">{activeMail.sentAt}</span>
                    </div>
                    
                    <div className="text-[11px] space-y-0.5 text-slate-500 font-semibold">
                      <div>
                        <span className="text-slate-400 font-mono">From:</span>{" "}
                        <strong className="text-slate-700">Nucore Platform Accounts &lt;security@nucore.in&gt;</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-mono">To:</span>{" "}
                        <strong className="text-slate-700">{activeMail.to}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-mono">Auth:</span>{" "}
                        <span className="text-indigo-600 bg-indigo-50 font-mono px-1 py-0.2 rounded text-[9px] uppercase font-bold">
                          Token: {activeMail.token}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* HTML Email Body Container */}
                  <div className="p-6 flex-1 overflow-y-auto">
                    <div className="bg-white border border-slate-200 rounded-xl max-w-xl mx-auto shadow-sm overflow-hidden font-sans">
                      {/* Brand Header */}
                      <div className="bg-slate-900 px-6 py-5 text-center border-b border-slate-800">
                        <div className="inline-flex items-center gap-1.5 text-[#81f2eb] font-black text-xs font-mono uppercase tracking-widest">
                          <Shield className="w-4 h-4" />
                          <span>NUCORE ACCOUNTS PLATFORM</span>
                        </div>
                      </div>

                      {/* Content body */}
                      <div className="p-6 space-y-4 text-xs text-slate-600 leading-relaxed">
                        <p className="font-bold text-slate-800 text-sm">Hi {activeMail.to.split('@')[0]},</p>
                        
                        <p>
                          Welcome to the <strong>Nucore Onboarding System</strong>! An administrator has registered an active security account for you under the following credentials:
                        </p>

                        <div className="bg-slate-50 border border-slate-150 p-4 rounded-lg font-mono text-[11px] text-slate-700 space-y-1">
                          <div>
                            <span className="text-slate-400">Username ID:</span>{" "}
                            <strong className="text-slate-900">{activeMail.username}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Assigned Email:</span>{" "}
                            <strong>{activeMail.to}</strong>
                          </div>
                        </div>

                        <p>
                          To complete your security registration, verify your identity, and set up your system access password, please click the secure authorization link below:
                        </p>

                        {activeMail.status === 'Pending Set' ? (
                          <div className="py-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setPasswordSetEmail(activeMail);
                                setInvitePassword('');
                              }}
                              className="inline-flex items-center gap-2 px-5 py-3 bg-[#006a66] hover:bg-[#00514e] text-white font-extrabold text-[11px] rounded-xl shadow-md uppercase font-mono tracking-wider transition-all"
                            >
                              <LockOpen className="w-3.5 h-3.5" />
                              <span>Set Up Account Password Now</span>
                            </button>
                            <p className="text-[9px] text-slate-400 font-mono mt-2 uppercase tracking-wide">
                              Secure Activation Link (One-time usage)
                            </p>
                          </div>
                        ) : (
                          <div className="py-4">
                            <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl text-center text-emerald-800">
                              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                              <span className="font-black text-xs block uppercase">✓ Access Password Activated</span>
                              <p className="text-[10px] text-emerald-600 font-mono mt-0.5 uppercase tracking-wide">
                                This user has completed password setup and can now log in
                              </p>
                            </div>
                          </div>
                        )}

                        <hr className="border-slate-100" />

                        <div className="text-[9px] text-slate-400 text-center uppercase font-mono leading-normal">
                          SYSTEM GENERATED MESSAGE &bull; DO NOT REPLY DIRECTLY TO THIS MAIL.<br />
                          Nucore Group &bull; Corporate Compliance Division &bull; India
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      )}

      {/* Backdrop Modal for Password Set via Invite */}
      {passwordSetEmail && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-4 flex items-center gap-3 border-b border-slate-800 text-white">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black font-mono uppercase tracking-wide text-white">Configure Access Password</h3>
                <p className="text-[10px] text-indigo-200 font-mono uppercase">Secure Account Activation</p>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleInvitePasswordSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg text-xs leading-normal text-slate-600 space-y-0.5">
                <div>
                  <span className="text-slate-400">Employee:</span>{" "}
                  <strong className="text-slate-800">
                    {users.find(u => u.username.toLowerCase() === passwordSetEmail.username.toLowerCase())?.name || 'New Employee'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Username ID:</span>{" "}
                  <strong className="text-slate-800 font-mono">{passwordSetEmail.username}</strong>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                  Set New Secure Password
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  placeholder="e.g., SecurePass2026!"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800 font-mono focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPasswordSetEmail(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg uppercase font-mono tracking-wider transition-colors text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg uppercase font-mono tracking-wider transition-colors text-center shadow-md"
                >
                  Activate Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
