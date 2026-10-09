'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFamilyStore } from '@/lib/store';
import { UserRole } from '@/types';
import {
  GitMerge,
  Search,
  Plus,
  History,
  Shield,
  RotateCcw,
  ListTree,
  LayoutGrid,
  ChevronDown,
  UserCheck,
  Sparkles,
  Lock,
  Palette,
  Users,
  LogOut,
  Edit3,
} from 'lucide-react';

interface NavbarProps {
  viewMode: 'canvas' | 'list';
  onViewModeChange: (mode: 'canvas' | 'list') => void;
  onOpenAddMember: () => void;
  onOpenAuditLog: () => void;
  onOpenAccountMgmt: () => void;
  onOpenProfile: (id: string) => void;
  onOpenAuth: (mode: 'login' | 'register' | 'change_password') => void;
  onOpenWorkspaceSettings?: () => void;
  onOpenThemeCustomizer?: () => void;
  onToggleSidebarMembers?: () => void;
  isSidebarOpen?: boolean;
  onLogout?: () => void;
}

export function Navbar({
  viewMode,
  onViewModeChange,
  onOpenAddMember,
  onOpenAuditLog,
  onOpenAccountMgmt,
  onOpenProfile,
  onOpenAuth,
  onOpenWorkspaceSettings,
  onOpenThemeCustomizer,
  onToggleSidebarMembers,
  isSidebarOpen,
  onLogout,
}: NavbarProps) {
  const {
    workspace,
    users,
    currentUser,
    currentRole,
    switchUser,
    people,
    setFocusPersonId,
    resetToDefaultData,
  } = useFamilyStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim()
    ? people
        .filter(
          (p) =>
            p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.displayName && p.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 6)
    : [];

  const handleSelectSearchPerson = (id: string) => {
    setFocusPersonId(id);
    onOpenProfile(id);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const getRoleBadge = (role: UserRole) => {
    if (role === 'superadmin') return { label: 'Superadmin', bg: 'rgba(245, 158, 11, 0.2)', text: '#FBBF24' };
    if (role === 'admin') return { label: 'Admin', bg: 'rgba(59, 130, 246, 0.2)', text: '#60A5FA' };
    return { label: 'Client (Read-only)', bg: 'rgba(148, 163, 184, 0.2)', text: '#94A3B8' };
  };

  const roleBadge = getRoleBadge(currentRole);
  const canEdit = currentRole === 'superadmin' || currentRole === 'admin';
  const isSuperadmin = currentRole === 'superadmin';

  return (
    <header
      style={{
        background: '#0D1322',
        borderBottom: '1px solid #1E293B',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        position: 'relative',
        zIndex: 50,
      }}
    >
      {/* Brand & Workspace Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo.svg" alt="Silsilah Logo" style={{ width: '100%', height: '100%' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.05em', color: '#F8FAFC' }}>
                SILSILAH
              </span>
              <span
                style={{
                  fontSize: 10,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34D399',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontWeight: 700,
                }}
              >
                v1.0 Pro
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 500, color: '#E2E8F0' }}>{workspace.name}</span>
              {isSuperadmin && onOpenWorkspaceSettings && (
                <button
                  onClick={onOpenWorkspaceSettings}
                  title="Ubah Nama Keluarga / Ruang Silsilah (Superadmin)"
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#FBBF24',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 10.5,
                    padding: '1px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    fontWeight: 600,
                  }}
                >
                  <Edit3 size={10} />
                  Edit Judul
                </button>
              )}
            </div>
          </div>
        </div>

        {/* View Mode Toggle: Canvas vs List */}
        <div
          style={{
            display: 'flex',
            background: '#162035',
            padding: 3,
            borderRadius: 8,
            border: '1px solid #1E293B',
          }}
        >
          <button
            onClick={() => onViewModeChange('canvas')}
            title="Tampilan Pohon Interaktif"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              background: viewMode === 'canvas' ? '#10B981' : 'transparent',
              color: viewMode === 'canvas' ? 'white' : '#94A3B8',
              transition: 'all 0.15s ease',
            }}
          >
            <ListTree size={14} />
            Pohon
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            title="Tampilan Direktori Terstruktur (Aksesibilitas)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              background: viewMode === 'list' ? '#10B981' : 'transparent',
              color: viewMode === 'list' ? 'white' : '#94A3B8',
              transition: 'all 0.15s ease',
            }}
          >
            <LayoutGrid size={14} />
            Direktori
          </button>
        </div>
      </div>

      {/* Global Member Search Bar */}
      <div ref={searchRef} style={{ position: 'relative', width: 280 }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 10, top: 10 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Cari anggota silsilah..."
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              borderRadius: 8,
              background: '#162035',
              border: '1px solid #1E293B',
              color: '#F8FAFC',
              fontSize: 12.5,
              outline: 'none',
            }}
          />
        </div>

        {/* Autocomplete Dropdown */}
        {isSearchOpen && searchResults.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 6,
              background: '#131B2E',
              border: '1px solid #1E293B',
              borderRadius: 10,
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              zIndex: 100,
            }}
          >
            {searchResults.map((p) => (
              <div
                key={p.id}
                onClick={() => handleSelectSearchPerson(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1E293B')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: '#334155',
                    flexShrink: 0,
                  }}
                >
                  {p.photoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#334155' }} />
                  )}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.fullName}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#94A3B8' }}>
                    {p.displayName || (p.gender === 'male' ? 'Laki-laki' : 'Perempuan')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Toggle Sidebar Members */}
        {onToggleSidebarMembers && (
          <button
            onClick={onToggleSidebarMembers}
            title="Buka/Tutup Panel Anggota (Drag & Drop Relasi)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              borderRadius: 8,
              background: isSidebarOpen ? 'rgba(16, 185, 129, 0.2)' : '#162035',
              color: isSidebarOpen ? '#34D399' : '#94A3B8',
              border: isSidebarOpen ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #1E293B',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Users size={14} />
            <span>Panel Anggota</span>
          </button>
        )}

        {/* Theme Customizer RGB */}
        {onOpenThemeCustomizer && (
          <button
            onClick={onOpenThemeCustomizer}
            title="Kustom Tema Warna RGB Komponen"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              borderRadius: 8,
              background: '#162035',
              color: '#38BDF8',
              border: '1px solid #1E293B',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Palette size={14} />
            <span>Tema RGB</span>
          </button>
        )}

        {/* Audit Log Button */}
        <button
          onClick={onOpenAuditLog}
          title="Buka Riwayat Audit Log"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 8,
            background: '#162035',
            color: '#94A3B8',
            border: '1px solid #1E293B',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          <History size={14} />
          Audit Log
        </button>

        {/* Account Management (Superadmin Only) */}
        {isSuperadmin && (
          <button
            onClick={onOpenAccountMgmt}
            title="Kelola Akun & Hak Akses Ruang Keluarga"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              borderRadius: 8,
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#FBBF24',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Shield size={14} />
            Kelola Akun
          </button>
        )}

        {/* Add Member Button (Admin / Superadmin only) */}
        {canEdit ? (
          <button
            onClick={onOpenAddMember}
            className="btn-primary"
            style={{ padding: '7px 14px', fontSize: 12.5 }}
          >
            <Plus size={15} />
            Tambah Anggota
          </button>
        ) : (
          <div
            title="Akun Client hanya memiliki hak baca (Read-only)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '7px 12px',
              borderRadius: 8,
              background: 'rgba(148, 163, 184, 0.1)',
              color: '#94A3B8',
              fontSize: 12,
              border: '1px solid #1E293B',
            }}
          >
            <Lock size={13} />
            Mode Baca
          </div>
        )}

        {/* RBAC Persona Switcher (Live Role Simulator) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 10px',
              borderRadius: 8,
              background: '#162035',
              border: '1px solid #1E293B',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#334155',
              }}
            >
              {currentUser?.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={currentUser.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserCheck size={16} />
              )}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: roleBadge.text }}>
                {roleBadge.label}
              </div>
              <div style={{ fontSize: 10, color: '#64748B' }}>
                {currentUser ? currentUser.displayName.split(' ')[0] : 'Tamu'}
              </div>
            </div>
            <ChevronDown size={13} color="#94A3B8" />
          </button>

          {isUserMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 6,
                width: 240,
                background: '#131B2E',
                border: '1px solid #1E293B',
                borderRadius: 10,
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                padding: 6,
                zIndex: 100,
              }}
            >
              {/* Profile summary */}
              <div style={{ padding: '8px 10px', borderBottom: '1px solid #1E293B', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>
                  {currentUser?.displayName || 'Pengguna'}
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span>{currentUser?.email || (currentUser?.username ? `@${currentUser.username}` : '')}</span>
                  <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: roleBadge.bg, color: roleBadge.text, fontWeight: 700 }}>
                    {roleBadge.label}
                  </span>
                </div>
              </div>

              <div>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenAuth('change_password');
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '7px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    color: '#FBBF24',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  🔑 Ganti Kata Sandi (Password)
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '7px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    color: '#34D399',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  🔐 Masuk / Ganti Akun
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '7px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    color: '#60A5FA',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  ✨ Daftar Akun Baru (Client)
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '7px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      color: '#EF4444',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <LogOut size={13} />
                    Keluar (Logout)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
