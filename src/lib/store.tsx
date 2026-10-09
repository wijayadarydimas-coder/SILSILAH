'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Workspace,
  UserAccount,
  UserRole,
  Person,
  ParentChildRelationship,
  PartnershipRelationship,
  AuditLog,
} from '@/types';
import {
  INITIAL_WORKSPACE,
  INITIAL_PEOPLE,
  INITIAL_PARTNERSHIPS,
  INITIAL_PARENT_CHILD,
  INITIAL_AUDIT_LOGS,
} from './seedData';
import { validateParentChildCycle } from './familyLogic';

interface FamilyStoreContextType {
  workspace: Workspace;
  users: UserAccount[];
  currentUser: UserAccount | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  people: Person[];
  parentChildRelations: ParentChildRelationship[];
  partnerships: PartnershipRelationship[];
  auditLogs: AuditLog[];
  focusPersonId: string;
  collapsedNodes: Set<string>;
  
  // Auth Actions
  onLoginSuccess: (user: UserAccount) => void;
  logout: () => void;
  refreshUsers: () => Promise<void>;
  
  // Canvas Actions
  switchUser: (userId: string) => void;
  setFocusPersonId: (id: string) => void;
  toggleCollapseNode: (id: string) => void;
  
  // Member CRUD
  addPerson: (data: Omit<Person, 'id' | 'workspaceId'>) => Promise<{ success: boolean; id?: string; error?: string }>;
  updatePerson: (id: string, data: Partial<Person>) => Promise<{ success: boolean; error?: string }>;
  deletePerson: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Relations CRUD
  addParentChild: (data: Omit<ParentChildRelationship, 'id' | 'workspaceId'>) => Promise<{ success: boolean; error?: string }>;
  deleteParentChild: (id: string) => Promise<{ success: boolean; error?: string }>;
  addPartnership: (data: Omit<PartnershipRelationship, 'id' | 'workspaceId'>) => Promise<{ success: boolean; error?: string }>;
  deletePartnership: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Account Management & Workspace
  updateWorkspace: (name: string, description?: string) => Promise<{ success: boolean; error?: string }>;
  linkClientToPerson: (personId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  updateUserRole: (userId: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  toggleUserStatus: (userId: string) => Promise<{ success: boolean; error?: string }>;
  inviteUser: (email: string, role: UserRole, displayName: string) => { success: boolean; error?: string };

  // System
  resetToDefaultData: () => void;
}

const FamilyStoreContext = createContext<FamilyStoreContextType | null>(null);

const SESSION_KEY = 'silsilah_auth_user_session';
const STATE_KEY = 'silsilah_app_local_cache';

export function FamilyStoreProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace>(INITIAL_WORKSPACE);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [parentChildRelations, setParentChildRelations] = useState<ParentChildRelationship[]>([]);
  const [partnerships, setPartnerships] = useState<PartnershipRelationship[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [focusPersonId, setFocusPersonId] = useState<string>('');
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  // Load session & sync PostgreSQL on mount
  useEffect(() => {
    // 1. Check local session
    try {
      const savedUser = localStorage.getItem(SESSION_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.id) {
          setCurrentUser(parsed);
          setIsAuthenticated(true);
        }
      }
    } catch {}

    // 2. Fetch PostgreSQL data
    async function loadData() {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const d = await res.json();
          if (d.workspace) setWorkspace(d.workspace);
          setPeople(Array.isArray(d.people) ? d.people : []);
          setParentChildRelations(Array.isArray(d.parentChildRelations) ? d.parentChildRelations : []);
          setPartnerships(Array.isArray(d.partnerships) ? d.partnerships : []);
          if (Array.isArray(d.auditLogs)) setAuditLogs(d.auditLogs);
          if (Array.isArray(d.people) && d.people.length > 0) {
            setFocusPersonId((prev) => (d.people.some((p: any) => p.id === prev) ? prev : d.people[0].id));
          } else {
            setFocusPersonId('');
          }
        }
      } catch (e) {
        console.warn('Could not sync data from PostgreSQL:', e);
      }
    }

    async function loadUsers() {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const d = await res.json();
          if (d.users && d.users.length > 0) {
            setUsers(d.users);
          }
        }
      } catch (e) {
        console.warn('Could not sync users from PostgreSQL:', e);
      }
    }

    loadData();
    loadUsers();
  }, []);

  const currentRole: UserRole = currentUser ? currentUser.role : 'client';

  const onLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch {}
    refreshUsers();
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
  };

  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const d = await res.json();
        if (d.users) setUsers(d.users);
      }
    } catch {}
  };

  const syncBackendMutation = async (action: string, data: any, auditLog?: AuditLog) => {
    try {
      let actor = currentUser;
      if (!actor) {
        try {
          const saved = localStorage.getItem(SESSION_KEY);
          if (saved) actor = JSON.parse(saved);
        } catch {}
      }
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          data,
          auditLog,
          actor,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('Backend sync error:', errData.error);
        return { success: false, error: errData.error || 'Gagal menyimpan ke database PostgreSQL.' };
      }
      return { success: true };
    } catch (e) {
      console.warn('Backend mutation sync warning:', e);
      return { success: false, error: 'Koneksi ke database gagal.' };
    }
  };

  const logAction = (
    action: AuditLog['action'],
    targetType: AuditLog['targetType'],
    targetId: string,
    summary: string
  ): AuditLog => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      workspaceId: workspace.id,
      actorUserId: currentUser?.id || 'usr-system',
      actorName: currentUser?.displayName || 'Pengguna',
      actorRole: currentUser?.role || 'client',
      action,
      targetType,
      targetId,
      timestamp: new Date().toISOString(),
      summary,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    return newLog;
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      onLoginSuccess(target);
    }
  };

  const toggleCollapseNode = (id: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // --- MEMBER CRUD WITH RBAC ---
  const addPerson = async (data: Omit<Person, 'id' | 'workspaceId'>) => {
    if (currentRole === 'client') {
      return { success: false, error: 'Akses ditolak: Akun Client hanya memiliki hak baca (Read-only).' };
    }
    const newId = `p-${Date.now()}`;
    const newPerson: Person = {
      ...data,
      id: newId,
      workspaceId: workspace.id,
    };
    const log = logAction('CREATE_PERSON', 'person', newId, `Menambahkan anggota silsilah: ${newPerson.fullName}`);
    const syncRes = await syncBackendMutation('CREATE_PERSON', newPerson, log);
    if (!syncRes.success) {
      return { success: false, error: syncRes.error };
    }
    setPeople((prev) => [...prev, newPerson]);
    if (!focusPersonId) {
      setFocusPersonId(newId);
    }
    return { success: true, id: newId };
  };

  const updatePerson = async (id: string, data: Partial<Person>) => {
    if (currentRole === 'client') {
      return { success: false, error: 'Akses ditolak: Akun Client tidak diizinkan mengubah data.' };
    }
    const existing = people.find((p) => p.id === id);
    if (!existing) return { success: false, error: 'Anggota tidak ditemukan.' };
    const updatedPerson: Person = { ...existing, ...data };
    const log = logAction('UPDATE_PERSON', 'person', id, `Memperbarui data profil: ${updatedPerson.fullName}`);
    const syncRes = await syncBackendMutation('UPDATE_PERSON', updatedPerson, log);
    if (!syncRes.success) {
      return { success: false, error: syncRes.error };
    }
    setPeople((prev) => prev.map((p) => (p.id === id ? updatedPerson : p)));
    return { success: true };
  };

  const deletePerson = async (id: string) => {
    if (currentRole === 'client') {
      return { success: false, error: 'Akses ditolak: Akun Client tidak diizinkan menghapus data.' };
    }
    const target = people.find((p) => p.id === id);
    if (!target) return { success: false, error: 'Anggota tidak ditemukan.' };

    const log = logAction('DELETE_PERSON', 'person', id, `Menghapus anggota silsilah: ${target.fullName}`);
    const syncRes = await syncBackendMutation('DELETE_PERSON', { id }, log);
    if (!syncRes.success) {
      return { success: false, error: syncRes.error };
    }

    setParentChildRelations((prev) =>
      prev.filter((r) => r.parentPersonId !== id && r.childPersonId !== id)
    );
    setPartnerships((prev) =>
      prev.filter((p) => p.personAId !== id && p.personBId !== id)
    );
    setPeople((prev) => prev.filter((p) => p.id !== id));

    if (focusPersonId === id) {
      const remaining = people.filter((p) => p.id !== id);
      setFocusPersonId(remaining.length > 0 ? remaining[0].id : '');
    }

    return { success: true };
  };

  // --- RELATIONS CRUD WITH CYCLE VALIDATION ---
  const addParentChild = async (data: Omit<ParentChildRelationship, 'id' | 'workspaceId'>) => {
    if (currentRole === 'client') {
      return { success: false, error: 'Akses ditolak: Akun Client tidak diizinkan menambah relasi.' };
    }

    const cycleCheck = validateParentChildCycle(
      data.parentPersonId,
      data.childPersonId,
      parentChildRelations
    );
    if (!cycleCheck.valid) {
      return { success: false, error: cycleCheck.error };
    }

    const exists = parentChildRelations.some(
      (r) => r.parentPersonId === data.parentPersonId && r.childPersonId === data.childPersonId
    );
    if (exists) {
      return { success: false, error: 'Relasi orang tua-anak ini sudah tercatat sebelumnya.' };
    }

    const newId = `pc-${Date.now()}`;
    const newRel: ParentChildRelationship = {
      ...data,
      id: newId,
      workspaceId: workspace.id,
    };

    const parent = people.find((p) => p.id === data.parentPersonId);
    const child = people.find((p) => p.id === data.childPersonId);
    const log = logAction(
      'CREATE_PARENT_CHILD',
      'relationship',
      newId,
      `Menghubungkan orang tua-anak: ${parent?.displayName || parent?.fullName} -> ${child?.displayName || child?.fullName}`
    );
    const syncRes = await syncBackendMutation('CREATE_PARENT_CHILD', newRel, log);
    if (!syncRes.success) {
      return { success: false, error: syncRes.error };
    }
    setParentChildRelations((prev) => [...prev, newRel]);
    return { success: true };
  };

  const deleteParentChild = async (id: string) => {
    if (currentRole === 'client') {
      return { success: false, error: 'Akses ditolak: Akun Client tidak diizinkan menghapus relasi.' };
    }
    const log = logAction('DELETE_PARENT_CHILD', 'relationship', id, `Menghapus relasi orang tua-anak ID: ${id}`);
    const syncRes = await syncBackendMutation('DELETE_PARENT_CHILD', { id }, log);
    if (!syncRes.success) {
      return { success: false, error: syncRes.error };
    }
    setParentChildRelations((prev) => prev.filter((r) => r.id !== id));
    return { success: true };
  };

  const addPartnership = async (data: Omit<PartnershipRelationship, 'id' | 'workspaceId'>) => {
    if (currentRole === 'client') {
      return { success: false, error: 'Akses ditolak: Akun Client tidak diizinkan menambah relasi.' };
    }
    if (data.personAId === data.personBId) {
      return { success: false, error: 'Seseorang tidak dapat bermitra/menikah dengan diri sendiri.' };
    }

    const exists = partnerships.some(
      (p) =>
        (p.personAId === data.personAId && p.personBId === data.personBId) ||
        (p.personAId === data.personBId && p.personBId === data.personAId)
    );
    if (exists) {
      return { success: false, error: 'Relasi pasangan antara kedua orang ini sudah ada.' };
    }

    const newId = `part-${Date.now()}`;
    const newPart: PartnershipRelationship = {
      ...data,
      id: newId,
      workspaceId: workspace.id,
    };

    const a = people.find((p) => p.id === data.personAId);
    const b = people.find((p) => p.id === data.personBId);
    const log = logAction(
      'CREATE_PARTNERSHIP',
      'relationship',
      newId,
      `Menghubungkan pasangan: ${a?.displayName || a?.fullName} & ${b?.displayName || b?.fullName}`
    );
    const syncRes = await syncBackendMutation('CREATE_PARTNERSHIP', newPart, log);
    if (!syncRes.success) {
      return { success: false, error: syncRes.error };
    }
    setPartnerships((prev) => [...prev, newPart]);
    return { success: true };
  };

  const deletePartnership = async (id: string) => {
    if (currentRole === 'client') {
      return { success: false, error: 'Akses ditolak: Akun Client tidak diizinkan menghapus relasi.' };
    }
    const log = logAction('DELETE_PARTNERSHIP', 'relationship', id, `Menghapus relasi pasangan ID: ${id}`);
    const syncRes = await syncBackendMutation('DELETE_PARTNERSHIP', { id }, log);
    if (!syncRes.success) {
      return { success: false, error: syncRes.error };
    }
    setPartnerships((prev) => prev.filter((r) => r.id !== id));
    return { success: true };
  };

  // --- ACCOUNT MANAGEMENT (SUPERADMIN ONLY) ---
  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (currentRole !== 'superadmin') {
      return { success: false, error: 'Akses ditolak: Hanya Superadmin yang berwenang mengubah role pengguna.' };
    }

    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorUserId: currentUser?.id || 'usr-superadmin',
          targetUserId: userId,
          newRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Gagal mengubah role.' };
      }
      await refreshUsers();
      return { success: true };
    } catch {
      return { success: false, error: 'Koneksi ke server database gagal.' };
    }
  };

  const toggleUserStatus = async (userId: string) => {
    if (currentRole !== 'superadmin') {
      return { success: false, error: 'Akses ditolak: Hanya Superadmin yang berwenang mengubah status akun.' };
    }

    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return { success: false, error: 'Akun tidak ditemukan.' };
    const newStatus = targetUser.status === 'active' ? 'deactivated' : 'active';

    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorUserId: currentUser?.id || 'usr-superadmin',
          targetUserId: userId,
          newStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Gagal mengubah status.' };
      }
      await refreshUsers();
      return { success: true };
    } catch {
      return { success: false, error: 'Koneksi ke server database gagal.' };
    }
  };

  const inviteUser = (email: string, role: UserRole, displayName: string) => {
    if (currentRole !== 'superadmin') {
      return { success: false, error: 'Akses ditolak: Hanya Superadmin yang berwenang mengundang pengguna.' };
    }
    const exists = users.some((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, error: 'Email ini sudah terdaftar dalam workspace.' };
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      email,
      displayName: displayName || email.split('@')[0],
      role,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    logAction('INVITE_USER', 'user', newUser.id, `Mengundang akun baru ke ruang keluarga: ${email} (${role})`);
    return { success: true };
  };

  const updateWorkspace = async (name: string, description?: string) => {
    if (currentRole !== 'superadmin') {
      return { success: false, error: 'Hanya Superadmin yang berwenang mengubah nama ruang keluarga.' };
    }
    const updated = { ...workspace, name, description: description ?? workspace.description };
    setWorkspace(updated);

    const log = logAction('UPDATE_WORKSPACE', 'workspace', workspace.id, `Mengubah judul silsilah keluarga menjadi: "${name}"`);
    await syncBackendMutation('UPDATE_WORKSPACE', { name, description }, log);
    return { success: true };
  };

  const linkClientToPerson = async (personId: string, userId: string) => {
    if (currentRole !== 'superadmin' && currentRole !== 'admin') {
      return { success: false, error: 'Akses ditolak: Hanya Admin/Superadmin yang dapat menautkan akun klien.' };
    }
    const person = people.find((p) => p.id === personId);
    const user = users.find((u) => u.id === userId);
    if (!person) return { success: false, error: 'Anggota keluarga tidak ditemukan.' };

    updatePerson(personId, { linkedUserId: userId || undefined });

    const log = logAction('LINK_CLIENT', 'person', personId, `Menautkan akun klien ${user?.displayName || userId} ke anggota ${person.fullName}`);
    await syncBackendMutation('LINK_CLIENT', { personId, userId }, log);
    return { success: true };
  };

  const resetToDefaultData = () => {
    setPeople([]);
    setParentChildRelations([]);
    setPartnerships([]);
    setAuditLogs([]);
    setFocusPersonId('');
    setCollapsedNodes(new Set());
  };

  return (
    <FamilyStoreContext.Provider
      value={{
        workspace,
        users,
        currentUser,
        currentRole,
        isAuthenticated,
        people,
        parentChildRelations,
        partnerships,
        auditLogs,
        focusPersonId,
        collapsedNodes,
        onLoginSuccess,
        logout,
        refreshUsers,
        switchUser,
        setFocusPersonId,
        toggleCollapseNode,
        addPerson,
        updatePerson,
        deletePerson,
        addParentChild,
        deleteParentChild,
        addPartnership,
        deletePartnership,
        updateWorkspace,
        linkClientToPerson,
        updateUserRole,
        toggleUserStatus,
        inviteUser,
        resetToDefaultData,
      }}
    >
      {children}
    </FamilyStoreContext.Provider>
  );
}

export function useFamilyStore() {
  const context = useContext(FamilyStoreContext);
  if (!context) {
    throw new Error('useFamilyStore must be used within a FamilyStoreProvider');
  }
  return context;
}
