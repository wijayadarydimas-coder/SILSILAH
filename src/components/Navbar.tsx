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
  Edit3,
  KeyRound,
  MessageSquare,
  Camera,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { PRESET_THEMES, applyThemeColors, THEME_STORAGE_KEY } from '@/components/ThemeCustomizerModal';

interface NavbarProps {
  viewMode: 'canvas' | 'list';
  onViewModeChange: (mode: 'canvas' | 'list') => void;
  onOpenAddMember: () => void;
  onOpenAuditLog: () => void;
  onOpenAccountMgmt: () => void;
  onOpenProfile: (id: string) => void;
  onOpenAuth: (mode: 'login' | 'change_password') => void;
  onOpenWorkspaceSettings?: () => void;
  onOpenThemeCustomizer?: () => void;
  onToggleSidebarMembers?: () => void;
  onOpenResetAdmin?: () => void;
  onOpenUserProfile?: () => void;
  onOpenCommunityChat?: () => void;
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
  onOpenResetAdmin,
  onOpenUserProfile,
  onOpenCommunityChat,
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Sync theme mode on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.bgPrimary === '#F8FAFC' ||
          parsed.bgPrimary === '#FFFFFF' ||
          parsed.bgPrimary?.toLowerCase() === '#f8fafc'
        ) {
          setIsLightMode(true);
        }
      }
    } catch {}
  }, []);

  const toggleThemeMode = () => {
    if (isLightMode) {
      const dark = PRESET_THEMES[0].colors;
      applyThemeColors(dark);
      setIsLightMode(false);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(dark));
      } catch {}
    } else {
      const light = PRESET_THEMES[1].colors;
      applyThemeColors(light);
      setIsLightMode(true);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(light));
      } catch {}
    }
  };

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
    return { label: 'User (Read-only)', bg: 'rgba(148, 163, 184, 0.2)', text: '#94A3B8' };
  };

  const roleBadge = getRoleBadge(currentRole);
  const canEdit = currentRole === 'superadmin' || currentRole === 'admin';
  const isSuperadmin = currentRole === 'superadmin';

  return (
    <header
      style={{
        background: 'var(--bg-navbar, #0D1322)',
        borderBottom: '1px solid var(--border-subtle, #1E293B)',
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
              background: 'var(--primary-glow, rgba(16, 185, 129, 0.1))',
              border: '1px solid var(--primary, rgba(16, 185, 129, 0.3))',
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
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.05em', color: 'var(--text-primary, #F8FAFC)' }}>
                SILSILAH
              </span>
              <span
                style={{
                  fontSize: 10,
                  background: 'var(--primary-glow, rgba(16, 185, 129, 0.15))',
                  color: 'var(--primary, #34D399)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontWeight: 700,
                }}
              >
                v1.0 Pro
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary, #94A3B8)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 500, color: 'var(--text-secondary, #E2E8F0)' }}>{workspace.name}</span>
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

        {/* View Mode Toggle: Canvas vs List (Desktop & Tablet) */}
        <div
          className="hide-on-mobile"
          style={{
            display: 'flex',
            background: 'var(--bg-menu, #162035)',
            padding: 3,
            borderRadius: 8,
            border: '1px solid var(--border-subtle, #1E293B)',
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
              background: viewMode === 'canvas' ? 'var(--primary, #10B981)' : 'transparent',
              color: viewMode === 'canvas' ? '#FFFFFF' : 'var(--text-secondary, #94A3B8)',
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
              background: viewMode === 'list' ? 'var(--primary, #10B981)' : 'transparent',
              color: viewMode === 'list' ? '#FFFFFF' : 'var(--text-secondary, #94A3B8)',
              transition: 'all 0.15s ease',
            }}
          >
            <LayoutGrid size={14} />
            Direktori
          </button>
        </div>
      </div>

      {/* Global Member Search Bar (Desktop & Tablet) */}
      <div ref={searchRef} className="hide-on-mobile" style={{ position: 'relative', width: 'clamp(180px, 20vw, 280px)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} color="var(--text-secondary, #94A3B8)" style={{ position: 'absolute', left: 10, top: 10 }} />
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
              background: 'var(--bg-menu, #162035)',
              border: '1px solid var(--border-subtle, #1E293B)',
              color: 'var(--text-primary, #F8FAFC)',
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
              background: 'var(--bg-card, #131B2E)',
              border: '1px solid var(--border-subtle, #1E293B)',
              borderRadius: 10,
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
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
                  borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.05))',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-menu, #1E293B)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'var(--border-medium, #334155)',
                    flexShrink: 0,
                  }}
                >
                  {p.photoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--border-medium, #334155)' }} />
                  )}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary, #F8FAFC)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.fullName}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-secondary, #94A3B8)' }}>
                    {p.displayName || (p.gender === 'male' ? 'Laki-laki' : 'Perempuan')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Toggle Sidebar Members (Desktop) */}
        {onToggleSidebarMembers && (
          <button
            onClick={onToggleSidebarMembers}
            className="hide-on-tablet"
            title="Buka/Tutup Panel Anggota (Drag & Drop Relasi)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              borderRadius: 8,
              background: isSidebarOpen ? 'var(--primary-glow, rgba(16, 185, 129, 0.2))' : 'var(--bg-menu, #162035)',
              color: isSidebarOpen ? 'var(--primary, #34D399)' : 'var(--text-secondary, #94A3B8)',
              border: isSidebarOpen ? '1px solid var(--primary, rgba(16, 185, 129, 0.4))' : '1px solid var(--border-subtle, #1E293B)',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Users size={14} />
            <span>Panel Anggota</span>
          </button>
        )}

        {/* Theme Customizer RGB (Desktop) */}
        {onOpenThemeCustomizer && (
          <button
            onClick={onOpenThemeCustomizer}
            className="hide-on-tablet"
            title="Kustom Tema Warna RGB Komponen"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              borderRadius: 8,
              background: 'var(--bg-menu, #162035)',
              color: 'var(--primary, #38BDF8)',
              border: '1px solid var(--border-subtle, #1E293B)',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Palette size={14} />
            <span>Tema RGB</span>
          </button>
        )}

        {/* Audit Log Button (Desktop) */}
        <button
          onClick={onOpenAuditLog}
          className="hide-on-tablet"
          title="Buka Riwayat Audit Log"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 8,
            background: 'var(--bg-menu, #162035)',
            color: 'var(--text-secondary, #94A3B8)',
            border: '1px solid var(--border-subtle, #1E293B)',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          <History size={14} />
          Audit Log
        </button>

        {/* Account Management (Superadmin Only - Desktop) */}
        {isSuperadmin && (
          <button
            onClick={onOpenAccountMgmt}
            className="hide-on-tablet"
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

        {/* Password Reset Requests (Admin & Superadmin - Desktop) */}
        {canEdit && onOpenResetAdmin && (
          <button
            onClick={onOpenResetAdmin}
            className="hide-on-tablet"
            title="Daftar Permintaan Lupa Kata Sandi (Unduh / Cetak PDF)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              borderRadius: 8,
              background: 'var(--bg-menu, #162035)',
              color: 'var(--accent-gold, #F59E0B)',
              border: '1px solid var(--border-subtle, #1E293B)',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            <KeyRound size={14} />
            Lupa Password
          </button>
        )}

        {/* Chat Komunitas Button (Desktop & Tablet) */}
        <button
          onClick={onOpenCommunityChat}
          className="hide-on-mobile btn-secondary"
          title="Buka Obrolan Komunitas Keluarga"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 8,
            background: 'var(--community-btn, #162035)',
            color: 'var(--community-btn-text, #38BDF8)',
            border: '1px solid var(--community-btn-border, #1E293B)',
            fontSize: 12,
            fontWeight: 500,
            transition: 'all 0.2s ease',
          }}
        >
          <MessageSquare size={14} />
          <span>Chat Komunitas</span>
        </button>

        {/* Chat Komunitas Icon Button (Mobile) */}
        <button
          onClick={onOpenCommunityChat}
          className="show-on-mobile btn-secondary"
          title="Buka Obrolan Komunitas"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: 8,
            background: 'var(--community-btn, #162035)',
            color: 'var(--community-btn-text, #38BDF8)',
            border: '1px solid var(--community-btn-border, #1E293B)',
            cursor: 'pointer',
          }}
        >
          <MessageSquare size={16} />
        </button>

        {/* Mobile Search Trigger Button (Mobile only) */}
        <button
          onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          className="show-on-mobile btn-secondary"
          title="Cari Anggota"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: 8,
            background: isMobileSearchOpen ? 'var(--primary-glow, rgba(16, 185, 129, 0.2))' : 'var(--bg-menu, #162035)',
            color: isMobileSearchOpen ? 'var(--primary, #34D399)' : 'var(--text-secondary, #94A3B8)',
            border: '1px solid var(--border-subtle, #1E293B)',
            cursor: 'pointer',
          }}
        >
          <Search size={16} />
        </button>

        {/* 1-Click Dark Mode / White Mode Toggle Icon (All screens) */}
        <button
          onClick={toggleThemeMode}
          title={isLightMode ? 'Beralih ke Dark Mode (Emerald)' : 'Beralih ke White Mode (Clean Porcelain)'}
          aria-label={isLightMode ? 'Beralih ke Dark Mode' : 'Beralih ke White Mode'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: 8,
            background: isLightMode ? '#FEF08A' : 'var(--bg-menu, #162035)',
            color: isLightMode ? '#854D0E' : '#FBBF24',
            border: isLightMode ? '1px solid #FDE047' : '1px solid var(--border-subtle, #1E293B)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Add Member Button - Full on Desktop/Tablet, Compact on Mobile */}
        {canEdit ? (
          <>
            <button
              onClick={onOpenAddMember}
              className="btn-primary hide-on-mobile"
              style={{ padding: '7px 14px', fontSize: 12.5 }}
            >
              <Plus size={15} />
              Tambah Anggota
            </button>
            <button
              onClick={onOpenAddMember}
              className="btn-primary show-on-mobile"
              title="Tambah Anggota Baru"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34,
                height: 34,
                padding: 0,
                borderRadius: 8,
              }}
            >
              <Plus size={17} />
            </button>
          </>
        ) : (
          <div
            title="Akun User hanya memiliki hak baca (Read-only)"
            className="hide-on-mobile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '7px 12px',
              borderRadius: 8,
              background: 'var(--bg-menu, rgba(148, 163, 184, 0.1))',
              color: 'var(--text-secondary, #94A3B8)',
              fontSize: 12,
              border: '1px solid var(--border-subtle, #1E293B)',
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
              gap: 6,
              padding: '5px 8px',
              borderRadius: 8,
              background: 'var(--bg-menu, #162035)',
              border: '1px solid var(--border-subtle, #1E293B)',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'var(--border-medium, #334155)',
                flexShrink: 0,
              }}
            >
              {currentUser?.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={currentUser.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserCheck size={16} />
              )}
            </div>
            <div className="hide-on-mobile" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: roleBadge.text }}>
                {roleBadge.label}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted, #64748B)' }}>
                {currentUser ? currentUser.displayName.split(' ')[0] : 'Tamu'}
              </div>
            </div>
            <ChevronDown size={13} color="var(--text-secondary, #94A3B8)" />
          </button>

          {isUserMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 6,
                width: 240,
                background: 'var(--bg-card, #131B2E)',
                border: '1px solid var(--border-subtle, #1E293B)',
                borderRadius: 10,
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                padding: 6,
                zIndex: 100,
              }}
            >
              {/* Profile summary */}
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle, #1E293B)', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #F8FAFC)' }}>
                  {currentUser?.displayName || 'Pengguna'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary, #94A3B8)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
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
                    onOpenUserProfile?.();
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    color: '#38BDF8',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Camera size={14} /> 👤 Edit Profil & Foto Akun
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenAuth('change_password');
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
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
                    padding: '8px 10px',
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
                {onLogout && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
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

        {/* Hamburger Menu Toggle (Tablet & Mobile) */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="show-on-tablet btn-secondary"
          title="Buka Menu Lengkap"
          aria-label="Menu Aplikasi"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            padding: 0,
            borderRadius: 8,
            color: 'var(--text-primary, #F8FAFC)',
            background: 'var(--bg-menu, #162035)',
            border: '1px solid var(--border-subtle, #1E293B)',
          }}
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Mobile Search Row Banner (when activated on mobile) */}
      {isMobileSearchOpen && (
        <div
          className="show-on-mobile"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--bg-card, #0B1120)',
            borderBottom: '1px solid var(--border-subtle, #1E293B)',
            padding: '10px 14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 90,
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={15} color="var(--text-secondary, #94A3B8)" style={{ position: 'absolute', left: 10, top: 10 }} />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari anggota silsilah..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: 8,
                  background: 'var(--bg-menu, #162035)',
                  border: '1px solid var(--border-subtle, #1E293B)',
                  color: 'var(--text-primary, #F8FAFC)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
            <button
              onClick={() => {
                setIsMobileSearchOpen(false);
                setSearchQuery('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary, #94A3B8)',
                padding: '6px 8px',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {searchResults.length > 0 && (
            <div
              style={{
                marginTop: 6,
                background: 'var(--bg-menu, #131B2E)',
                border: '1px solid var(--border-subtle, #1E293B)',
                borderRadius: 8,
                overflow: 'hidden',
                maxHeight: 220,
                overflowY: 'auto',
              }}
            >
              {searchResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    handleSelectSearchPerson(p.id);
                    setIsMobileSearchOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ width: 26, height: 26, borderRadius: '50%', overflow: 'hidden', background: '#334155' }}>
                    {p.photoUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={p.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#334155' }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #F8FAFC)' }}>{p.fullName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary, #94A3B8)' }}>{p.displayName || p.gender}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comprehensive Responsive Mobile/Tablet Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMobileMenuOpen(false);
          }}
        >
          <div
            style={{
              width: 'min(340px, 86vw)',
              height: '100%',
              background: 'var(--bg-menu, #0F172A)',
              borderLeft: '1px solid var(--border-subtle, #1E293B)',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.75)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              padding: 0,
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px',
                borderBottom: '1px solid var(--border-subtle, #1E293B)',
                background: 'var(--bg-card, #131B2E)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/logo.svg" alt="Logo" style={{ width: 26, height: 26 }} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary, #F8FAFC)' }}>
                    SILSILAH
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary, #94A3B8)' }}>
                    {workspace.name}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary, #94A3B8)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* User Profile Card */}
            <div
              style={{
                margin: 14,
                padding: '12px 14px',
                borderRadius: 12,
                background: 'var(--bg-card, rgba(19, 27, 46, 0.7))',
                border: '1px solid var(--border-subtle, #1E293B)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: '#334155',
                    flexShrink: 0,
                  }}
                >
                  {currentUser?.avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={currentUser.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <UserCheck size={20} />
                  )}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary, #F8FAFC)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser?.displayName || 'Pengguna'}
                  </div>
                  <div style={{ fontSize: 10.5, color: roleBadge.text, fontWeight: 700, marginTop: 2 }}>
                    {roleBadge.label}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenUserProfile?.();
                  }}
                  style={{
                    flex: 1,
                    padding: '7px 8px',
                    borderRadius: 6,
                    background: 'var(--bg-menu, #162035)',
                    border: '1px solid var(--border-subtle, #1E293B)',
                    color: '#38BDF8',
                    fontSize: 11,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    cursor: 'pointer',
                  }}
                >
                  <Camera size={12} /> Edit Profil
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuth('change_password');
                  }}
                  style={{
                    flex: 1,
                    padding: '7px 8px',
                    borderRadius: 6,
                    background: 'var(--bg-menu, #162035)',
                    border: '1px solid var(--border-subtle, #1E293B)',
                    color: '#FBBF24',
                    fontSize: 11,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    cursor: 'pointer',
                  }}
                >
                  <KeyRound size={12} /> Password
                </button>
              </div>
            </div>

            {/* Navigation Mode Switcher */}
            <div style={{ padding: '0 14px 10px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary, #94A3B8)', marginBottom: 6, textTransform: 'uppercase' }}>
                Mode Tampilan Silsilah
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  onClick={() => {
                    onViewModeChange('canvas');
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '9px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    background: viewMode === 'canvas' ? 'var(--primary, #10B981)' : 'var(--bg-card, #131B2E)',
                    color: viewMode === 'canvas' ? '#FFFFFF' : 'var(--text-secondary, #94A3B8)',
                    border: '1px solid var(--border-subtle, #1E293B)',
                    cursor: 'pointer',
                  }}
                >
                  <ListTree size={14} />
                  Pohon
                </button>
                <button
                  onClick={() => {
                    onViewModeChange('list');
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '9px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    background: viewMode === 'list' ? 'var(--primary, #10B981)' : 'var(--bg-card, #131B2E)',
                    color: viewMode === 'list' ? '#FFFFFF' : 'var(--text-secondary, #94A3B8)',
                    border: '1px solid var(--border-subtle, #1E293B)',
                    cursor: 'pointer',
                  }}
                >
                  <LayoutGrid size={14} />
                  Direktori
                </button>
              </div>
            </div>

            {/* Main Menu Items */}
            <div style={{ padding: '6px 14px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary, #94A3B8)', marginBottom: 2, textTransform: 'uppercase' }}>
                Fitur & Alat
              </div>

              {onToggleSidebarMembers && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onToggleSidebarMembers();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: isSidebarOpen ? 'var(--primary-glow, rgba(16, 185, 129, 0.15))' : 'var(--bg-card, #131B2E)',
                    border: '1px solid var(--border-subtle, #1E293B)',
                    color: isSidebarOpen ? 'var(--primary, #34D399)' : 'var(--text-primary, #F8FAFC)',
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <Users size={16} color="var(--primary, #34D399)" />
                  <span>{isSidebarOpen ? 'Tutup Panel Anggota' : 'Buka Panel Anggota'}</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenCommunityChat?.();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--bg-card, #131B2E)',
                  border: '1px solid var(--border-subtle, #1E293B)',
                  color: 'var(--text-primary, #F8FAFC)',
                  fontSize: 13,
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <MessageSquare size={16} color="#38BDF8" />
                <span>Chat Komunitas Keluarga</span>
              </button>

              {onOpenThemeCustomizer && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenThemeCustomizer();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'var(--bg-card, #131B2E)',
                    border: '1px solid var(--border-subtle, #1E293B)',
                    color: 'var(--text-primary, #F8FAFC)',
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <Palette size={16} color="#A78BFA" />
                  <span>Kustom Tema Warna RGB</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuditLog();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--bg-card, #131B2E)',
                  border: '1px solid var(--border-subtle, #1E293B)',
                  color: 'var(--text-primary, #F8FAFC)',
                  fontSize: 13,
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <History size={16} color="#94A3B8" />
                <span>Riwayat Audit Log</span>
              </button>

              {isSuperadmin && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAccountMgmt();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    color: '#FBBF24',
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <Shield size={16} color="#FBBF24" />
                  <span>Kelola Akun (Superadmin)</span>
                </button>
              )}

              {canEdit && onOpenResetAdmin && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenResetAdmin();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'var(--bg-card, #131B2E)',
                    border: '1px solid var(--border-subtle, #1E293B)',
                    color: 'var(--accent-gold, #F59E0B)',
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <KeyRound size={16} color="#F59E0B" />
                  <span>Permintaan Lupa Password</span>
                </button>
              )}

              {isSuperadmin && onOpenWorkspaceSettings && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenWorkspaceSettings();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'var(--bg-card, #131B2E)',
                    border: '1px solid var(--border-subtle, #1E293B)',
                    color: 'var(--text-primary, #F8FAFC)',
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <Edit3 size={16} color="#34D399" />
                  <span>Ubah Judul / Nama Ruang</span>
                </button>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div
              style={{
                padding: '14px',
                borderTop: '1px solid var(--border-subtle, #1E293B)',
                background: 'var(--bg-card, #131B2E)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  borderRadius: 8,
                  background: 'var(--bg-menu, #162035)',
                  border: '1px solid var(--border-subtle, #1E293B)',
                  color: '#34D399',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🔐 Masuk / Ganti Akun
              </button>

              {onLogout && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 12px',
                    borderRadius: 8,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#EF4444',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={14} />
                  Keluar (Logout)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
