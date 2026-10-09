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
  INITIAL_USERS,
  INITIAL_PEOPLE,
  INITIAL_PARTNERSHIPS,
  INITIAL_PARENT_CHILD,
  INITIAL_AUDIT_LOGS,
} from './seedData';
import { validateParentChildCycle } from './familyLogic';

interface FamilyStoreContextType {
  workspace: Workspace;
  users: UserAccount[];
  currentUser: UserAccount;
  currentRole: UserRole;
  people: Person[];
  parentChildRelations: ParentChildRelationship[];
  partnerships: PartnershipRelationship[];
  auditLogs: AuditLog[];
  focusPersonId: string;
  collapsedNodes: Set<string>;
  
  // Actions
  switchUser: (userId: string) => void;
  setFocusPersonId: (id: string) => void;
  toggleCollapseNode: (id: string) => void;
  
  // Member CRUD
  addPerson: (data: Omit<Person, 'id' | 'workspaceId'>) => { success: boolean; id?: string; error?: string };
  updatePerson: (id: string, data: Partial<Person>) => { success: boolean; error?: string };
  deletePerson: (id: string) => { success: boolean; error?: string };
  
  // Relations CRUD
  addParentChild: (data: Omit<ParentChildRelationship, 'id' | 'workspaceId'>) => { success: boolean; error?: string };
  deleteParentChild: (id: string) => { success: boolean; error?: string };
  addPartnership: (data: Omit<PartnershipRelationship, 'id' | 'workspaceId'>) => { success: boolean; error?: string };
  deletePartnership: (id: string) => { success: boolean; error?: string };

  // Account Management (Superadmin only)
  updateUserRole: (userId: string, role: UserRole) => { success: boolean; error?: string };
  toggleUserStatus: (userId: string) => { success: boolean; error?: string };
  inviteUser: (email: string, role: UserRole, displayName: string) => { success: boolean; error?: string };

  // System
  resetToDefaultData: () => void;
}

const FamilyStoreContext = createContext<FamilyStoreContextType | null>(null);

const STORAGE_KEY = 'silsilah_app_state_v1';

export function FamilyStoreProvider({ children }: { children: React.ReactNode }) {
  const [workspace] = useState<Workspace>(INITIAL_WORKSPACE);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>(INITIAL_USERS[0].id); // Superadmin by default
  const [people, setPeople] = useState<Person[]>(INITIAL_PEOPLE);
  const [parentChildRelations, setParentChildRelations] = useState<ParentChildRelationship[]>(INITIAL_PARENT_CHILD);
  const [partnerships, setPartnerships] = useState<PartnershipRelationship[]>(INITIAL_PARTNERSHIPS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [focusPersonId, setFocusPersonId] = useState<string>('p-dary');
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.people) setPeople(parsed.people);
        if (parsed.parentChildRelations) setParentChildRelations(parsed.parentChildRelations);
        if (parsed.partnerships) setPartnerships(parsed.partnerships);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.focusPersonId) setFocusPersonId(parsed.focusPersonId);
        if (parsed.currentUserId) setCurrentUserId(parsed.currentUserId);
      }
    } catch (e) {
      console.warn('Failed to parse saved state:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          people,
          parentChildRelations,
          partnerships,
          users,
          auditLogs,
          focusPersonId,
          currentUserId,
        })
      );
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }, [people, parentChildRelations, partnerships, users, auditLogs, focusPersonId, currentUserId, isLoaded]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const currentRole = currentUser.role;

  const logAction = (
    action: AuditLog['action'],
    targetType: AuditLog['targetType'],
    targetId: string,
    summary: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      workspaceId: workspace.id,
      actorUserId: currentUser.id,
      actorName: currentUser.displayName,
      actorRole: currentUser.role,
      action,
      targetType,
      targetId,
      timestamp: new Date().toISOString(),
      summary,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(userId);
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
  const addPerson = (data: Omit<Person, 'id' | 'workspaceId'>) => {
    if (currentRole === 'client') {
      return { success: false, error: 'Akses ditolak: Akun Client hanya memiliki hak baca (Read-only).' };
    }
    const newId = `p-${Date.now()}`;
    const newPerson: Person = {
      ...data,
      id: newId,
      workspaceId: workspace.id,
    };
    setPeople((prev) => [...prev, newPerson]);
    logAction('CREATE_PERSON', 'person', newId, `Menambahkan anggota silsilah: ${newPerson.fullName}`);
    return { success: true, id: newId };
  };

  const updatePerson = (id: string, data: Partial<Person>) => {
    if (currentRole === 'client') {
      return { success: false, error: 'Akses ditolak: Akun Client tidak diizinkan mengubah data.' };
    }
    setPeople((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...data };
          return updated;
        }
        return p;
      })
    );
    const person = people.find((p) => p.id === id);
    logAction('UPDATE_PERSON', 'person', id, `Memperbarui data profil: ${person?.fullName || id}`);
    return { success: true };
  };

  const deletePerson = (id: string) => {
    if (currentRole === 'client') {
      return { success: false, error: 'Akses ditolak: Akun Client tidak diizinkan menghapus data.' };
    }
    const target = people.find((p) => p.id === id);
    if (!target) return { success: false, error: 'Anggota tidak ditemukan.' };

    // Remove relationships connected to this person
    setParentChildRelations((prev) =>
      prev.filter((r) => r.parentPersonId !== id && r.childPersonId !== id)
    );
    setPartnerships((prev) =>
      prev.filter((p) => p.personAId !== id && p.personBId !== id)
    );
    setPeople((prev) => prev.filter((p) => p.id !== id));

    if (focusPersonId === id) {
      const remaining = people.filter((p) => p.id !== id);
      if (remaining.length > 0) {
        setFocusPersonId(remaining[0].id);
      }
    }

    logAction('DELETE_PERSON', 'person', id, `Menghapus anggota silsilah: ${target.fullName}`);
    return { success: true };
  };

  // --- RELATIONS CRUD WITH CYCLE VALIDATION ---
  const addParentChild = (data: Omit<ParentChildRelationship, 'id' | 'workspaceId'>) => {
    if (currentRole === 'client') {
      return { success: false, error: 'Akses ditolak: Akun Client tidak diizinkan menambah relasi.' };
    }

    // Validate cycle
    const cycleCheck = validateParentChildCycle(
      data.parentPersonId,
      data.childPersonId,
      parentChildRelations
    );
    if (!cycleCheck.valid) {
      return { success: false, error: cycleCheck.error };
    }

    // Check duplicate
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
    setParentChildRelations((prev) => [...prev, newRel]);

    const parent = people.find((p) => p.id === data.parentPersonId);
    const child = people.find((p) => p.id === data.childPersonId);
    logAction(
      'CREATE_PARENT_CHILD',
      'relationship',
      newId,
      `Menghubungkan orang tua-anak: ${parent?.displayName || parent?.fullName} -> ${child?.displayName || child?.fullName}`
    );
    return { success: true };
  };

  const deleteParentChild = (id: string) => {
    if (currentRole === 'client') {
      return { success: false, error: 'Akses ditolak: Akun Client tidak diizinkan menghapus relasi.' };
    }
    setParentChildRelations((prev) => prev.filter((r) => r.id !== id));
    logAction('DELETE_PARENT_CHILD', 'relationship', id, `Menghapus relasi orang tua-anak ID: ${id}`);
    return { success: true };
  };

  const addPartnership = (data: Omit<PartnershipRelationship, 'id' | 'workspaceId'>) => {
    if (currentRole === 'client') {
      return { success: false, error: 'Akses ditolak: Akun Client tidak diizinkan menambah relasi.' };
    }
    if (data.personAId === data.personBId) {
      return { success: false, error: 'Seseorang tidak dapat bermitra/menikah dengan diri sendiri.' };
    }

    // Check duplicate
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
    setPartnerships((prev) => [...prev, newPart]);

    const a = people.find((p) => p.id === data.personAId);
    const b = people.find((p) => p.id === data.personBId);
    logAction(
      'CREATE_PARTNERSHIP',
      'relationship',
      newId,
      `Menghubungkan pasangan: ${a?.displayName || a?.fullName} & ${b?.displayName || b?.fullName}`
    );
    return { success: true };
  };

  const deletePartnership = (id: string) => {
    if (currentRole === 'client') {
      return { success: false, error: 'Akses ditolak: Akun Client tidak diizinkan menghapus relasi.' };
    }
    setPartnerships((prev) => prev.filter((p) => p.id !== id));
    logAction('DELETE_PARTNERSHIP', 'relationship', id, `Menghapus relasi pasangan ID: ${id}`);
    return { success: true };
  };

  // --- ACCOUNT MANAGEMENT (SUPERADMIN ONLY) ---
  const updateUserRole = (userId: string, newRole: UserRole) => {
    if (currentRole !== 'superadmin') {
      return { success: false, error: 'Akses ditolak: Hanya Superadmin yang berwenang mengubah role pengguna.' };
    }

    // Prevent demoting the last active superadmin
    if (newRole !== 'superadmin') {
      const activeSuperadmins = users.filter((u) => u.role === 'superadmin' && u.status === 'active');
      if (activeSuperadmins.length === 1 && activeSuperadmins[0].id === userId) {
        return {
          success: false,
          error: 'Aturan sistem: Tidak dapat menurunkan role satu-satunya Superadmin yang aktif.',
        };
      }
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    const targetUser = users.find((u) => u.id === userId);
    logAction(
      'CHANGE_ROLE',
      'user',
      userId,
      `Mengubah role akun ${targetUser?.email || userId} menjadi: ${newRole.toUpperCase()}`
    );
    return { success: true };
  };

  const toggleUserStatus = (userId: string) => {
    if (currentRole !== 'superadmin') {
      return { success: false, error: 'Akses ditolak: Hanya Superadmin yang berwenang mengubah status akun.' };
    }

    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return { success: false, error: 'Akun tidak ditemukan.' };

    const newStatus = targetUser.status === 'active' ? 'deactivated' : 'active';

    if (newStatus === 'deactivated' && targetUser.role === 'superadmin') {
      const activeSuperadmins = users.filter((u) => u.role === 'superadmin' && u.status === 'active');
      if (activeSuperadmins.length <= 1) {
        return {
          success: false,
          error: 'Aturan sistem: Tidak dapat menonaktifkan satu-satunya Superadmin yang aktif.',
        };
      }
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );

    logAction(
      'TOGGLE_USER_STATUS',
      'user',
      userId,
      `${newStatus === 'active' ? 'Mengaktifkan' : 'Menonaktifkan'} akses akun: ${targetUser.email}`
    );
    return { success: true };
  };

  const inviteUser = (email: string, role: UserRole, displayName: string) => {
    if (currentRole !== 'superadmin') {
      return { success: false, error: 'Akses ditolak: Hanya Superadmin yang berwenang mengundang pengguna.' };
    }
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
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

  const resetToDefaultData = () => {
    setPeople(INITIAL_PEOPLE);
    setParentChildRelations(INITIAL_PARENT_CHILD);
    setPartnerships(INITIAL_PARTNERSHIPS);
    setUsers(INITIAL_USERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setFocusPersonId('p-dary');
    setCurrentUserId(INITIAL_USERS[0].id);
    setCollapsedNodes(new Set());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <FamilyStoreContext.Provider
      value={{
        workspace,
        users,
        currentUser,
        currentRole,
        people,
        parentChildRelations,
        partnerships,
        auditLogs,
        focusPersonId,
        collapsedNodes,
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
