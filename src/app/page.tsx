'use client';

import React, { useState, useEffect } from 'react';
import { FamilyStoreProvider, useFamilyStore } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { TreeCanvas } from '@/components/TreeCanvas';
import { FamilyListView } from '@/components/FamilyListView';
import { ProfileDrawer } from '@/components/ProfileDrawer';
import { MemberModal } from '@/components/MemberModal';
import { RelationModal } from '@/components/RelationModal';
import { AccountManagementModal } from '@/components/AccountManagementModal';
import { AuditLogDrawer } from '@/components/AuditLogDrawer';
import { AuthModal } from '@/components/AuthModal';
import { SidebarMembers } from '@/components/SidebarMembers';
import { QuickConnectModal } from '@/components/QuickConnectModal';
import { WorkspaceSettingsModal } from '@/components/WorkspaceSettingsModal';
import { ThemeCustomizerModal, applyThemeColors } from '@/components/ThemeCustomizerModal';
import { ResetPasswordModal } from '@/components/ResetPasswordModal';
import { PasswordResetAdminModal } from '@/components/PasswordResetAdminModal';
import { AIChatDrawer } from '@/components/AIChatDrawer';
import { UserProfileModal } from '@/components/UserProfileModal';
import { CommunityChatDrawer } from '@/components/CommunityChatDrawer';
import {
  Lock,
  User,
  UserPlus,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Plus,
  AlertTriangle,
  CheckCircle,
  Users,
  Phone,
  Mail,
  KeyRound,
} from 'lucide-react';

/**
 * Full-screen Login & Register Portal for clean initial entry
 */
function FullScreenAuthPortal() {
  const { onLoginSuccess } = useFamilyStore();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal masuk. Periksa username dan kata sandi.');
      } else {
        setSuccessMsg(`Selamat datang kembali, ${data.user.displayName}!`);
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 600);
      }
    } catch {
      setErrorMsg('Koneksi ke server database gagal. Pastikan database PostgreSQL aktif.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() && !phone.trim()) {
      setErrorMsg('Pendaftaran akun wajib menyertakan nomor WhatsApp atau alamat Email aktif.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          displayName,
          password,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal mendaftar akun baru.');
      } else {
        setSuccessMsg('Akun User berhasil dibuat! Mengalihkan ke sistem...');
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 800);
      }
    } catch {
      setErrorMsg('Koneksi ke server database gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#070B14',
        position: 'relative',
        overflow: 'hidden',
        padding: 20,
      }}
    >
      {/* Background SVG illustration */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/background.svg"
        alt="Background Pattern"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.25,
          pointerEvents: 'none',
        }}
      />

      {/* Decorative gradient glowing spheres */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          top: '-10%',
          right: '-5%',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 450,
          height: 450,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)',
          bottom: '-10%',
          left: '-5%',
          pointerEvents: 'none',
        }}
      />

      {/* Glassmorphic Central Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 40px rgba(16, 185, 129, 0.1)',
          padding: '36px 32px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* App Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: '0 auto 14px auto',
              borderRadius: 18,
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 8,
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo.svg" alt="Silsilah Logo" style={{ width: '100%', height: '100%' }} />
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '0.04em',
              color: '#F8FAFC',
              marginBottom: 4,
            }}
          >
            SILSILAH
          </h1>
          <p style={{ fontSize: 13, color: '#94A3B8' }}>
            Portal Pohon Silsilah Keluarga Interaktif & Terproteksi
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: '#0D1322',
            padding: 4,
            borderRadius: 10,
            marginBottom: 24,
            border: '1px solid #1E293B',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: tab === 'login' ? '#10B981' : 'transparent',
              color: tab === 'login' ? '#FFFFFF' : '#94A3B8',
              transition: 'all 0.2s',
            }}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: tab === 'register' ? '#10B981' : 'transparent',
              color: tab === 'register' ? '#FFFFFF' : '#94A3B8',
              transition: 'all 0.2s',
            }}
          >
            Daftar Akun Baru (Client)
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#FCA5A5',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 12,
              marginBottom: 18,
            }}
          >
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#6EE7B7',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 12,
              marginBottom: 18,
            }}
          >
            <CheckCircle size={15} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={tab === 'login' ? handleLogin : handleRegister}>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: 11.5,
                fontWeight: 600,
                color: '#CBD5E1',
                marginBottom: 6,
              }}
            >
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={15} color="#64748B" style={{ position: 'absolute', left: 12, top: 11 }} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="cth: silsilah"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 8,
                  background: '#0D1322',
                  border: '1px solid #1E293B',
                  color: '#F8FAFC',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {tab === 'register' && (
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: '#CBD5E1',
                  marginBottom: 6,
                }}
              >
                Nama Lengkap / Panggilan
              </label>
              <div style={{ position: 'relative' }}>
                <UserPlus size={15} color="#64748B" style={{ position: 'absolute', left: 12, top: 11 }} />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="cth: Dimas Wijaya"
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: 8,
                    background: '#0D1322',
                    border: '1px solid #1E293B',
                    color: '#F8FAFC',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          {/* Additional fields for register: WhatsApp & Email */}
          {tab === 'register' && (
            <>
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: '#CBD5E1',
                    marginBottom: 6,
                  }}
                >
                  Nomor WhatsApp
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} color="#64748B" style={{ position: 'absolute', left: 12, top: 11 }} />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="cth: 08123456789"
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: 8,
                      background: '#0D1322',
                      border: '1px solid #1E293B',
                      color: '#F8FAFC',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: '#CBD5E1',
                    marginBottom: 6,
                  }}
                >
                  Alamat Email (Token Verifikasi Otomatis)
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="#64748B" style={{ position: 'absolute', left: 12, top: 11 }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cth: nama@keluarga.com"
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: 8,
                      background: '#0D1322',
                      border: '1px solid #1E293B',
                      color: '#F8FAFC',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>
                <span style={{ fontSize: 10.5, color: '#64748B', display: 'block', marginTop: 4 }}>
                  *Wajib mengisi salah satu atau keduanya (WhatsApp / Email).
                </span>
              </div>
            </>
          )}

          <div style={{ marginBottom: tab === 'login' ? 8 : 20 }}>
            <label
              style={{
                display: 'block',
                fontSize: 11.5,
                fontWeight: 600,
                color: '#CBD5E1',
                marginBottom: 6,
              }}
            >
              Kata Sandi (Password)
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="#64748B" style={{ position: 'absolute', left: 12, top: 11 }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 8,
                  background: '#0D1322',
                  border: '1px solid #1E293B',
                  color: '#F8FAFC',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {tab === 'login' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
              <button
                type="button"
                onClick={() => setIsResetOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#F59E0B',
                  fontSize: 12,
                  cursor: 'pointer',
                  padding: 0,
                  fontWeight: 500,
                }}
              >
                Lupa kata sandi?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px 0',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              fontSize: 13.5,
              fontWeight: 700,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <span>{loading ? 'Memproses...' : tab === 'login' ? 'Masuk ke Silsilah' : 'Daftar Akun User'}</span>
            <ArrowRight size={15} />
          </button>

          {/* Quick toggle link */}
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            {tab === 'login' ? (
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Belum punya akun? <span style={{ color: '#10B981', fontWeight: 600 }}>Daftar Akun Baru</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Sudah punya akun? <span style={{ color: '#10B981', fontWeight: 600 }}>Masuk ke Silsilah</span>
              </button>
            )}
          </div>
        </form>

        {/* Reset Password Modal */}
        <ResetPasswordModal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} />

        {/* Security badge */}
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 11,
            color: '#64748B',
          }}
        >
          <ShieldCheck size={13} color="#10B981" />
          <span>Sistem terproteksi PostgreSQL dengan enkripsi kata sandi</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Interactive Silsilah Dashboard
 */
function SilsilahDashboard() {
  const { isAuthenticated, people, logout, currentUser, updateCurrentUser } = useFamilyStore();

  const [viewMode, setViewMode] = useState<'canvas' | 'list'>('canvas');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Sidebar card members toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Quick relation connect modal state (Drag & Drop)
  const [quickConnectPair, setQuickConnectPair] = useState<{ sourceId: string; targetId: string } | null>(null);
  const [isQuickConnectOpen, setIsQuickConnectOpen] = useState(false);

  // Modal states
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editPersonId, setEditPersonId] = useState<string | null>(null);

  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
  const [relationPersonId, setRelationPersonId] = useState<string | null>(null);

  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [isAccountMgmtOpen, setIsAccountMgmtOpen] = useState(false);
  const [isResetAdminOpen, setIsResetAdminOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isCommunityChatOpen, setIsCommunityChatOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Auth modal state (for changing password / switching account)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'change_password'>('login');

  const handleOpenAddMember = () => {
    setEditPersonId(null);
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (id: string) => {
    setEditPersonId(id);
    setIsMemberModalOpen(true);
  };

  const handleOpenAddRelation = (id: string) => {
    setRelationPersonId(id);
    setIsRelationModalOpen(true);
  };

  const handleOpenAuth = (mode: 'login' | 'register' | 'change_password') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  // If user is not logged in, render the clean full-screen login card directly
  if (!isAuthenticated) {
    return <FullScreenAuthPortal />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: '#0A0E17',
      }}
    >
      {/* Top Navbar */}
      <Navbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAddMember={handleOpenAddMember}
        onOpenAuditLog={() => setIsAuditLogOpen(true)}
        onOpenAccountMgmt={() => setIsAccountMgmtOpen(true)}
        onOpenResetAdmin={() => setIsResetAdminOpen(true)}
        onOpenUserProfile={() => setIsUserProfileOpen(true)}
        onOpenCommunityChat={() => setIsCommunityChatOpen(true)}
        onOpenProfile={(id) => setSelectedProfileId(id)}
        onOpenAuth={handleOpenAuth}
        onOpenWorkspaceSettings={() => setIsWorkspaceModalOpen(true)}
        onOpenThemeCustomizer={() => setIsThemeModalOpen(true)}
        onToggleSidebarMembers={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        onLogout={logout}
      />

      {/* Main View Area */}
      <main
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          minHeight: 0,
          height: 'calc(100vh - 65px)',
          display: 'flex',
        }}
      >
        {/* Collapsible Members Sidebar (HTML5 Drag & Drop onto canvas nodes) */}
        <SidebarMembers
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
          onOpenAddMember={handleOpenAddMember}
          onSelectPerson={(id) => setSelectedProfileId(id)}
          onRequestConnect={(sourceId, targetId) => {
            if (targetId) {
              setQuickConnectPair({ sourceId, targetId });
              setIsQuickConnectOpen(true);
            } else {
              handleOpenAddRelation(sourceId);
            }
          }}
        />

        {/* Canvas or List view */}
        <div style={{ flex: 1, height: '100%', position: 'relative' }}>
          {/* Floating Unhide Button when sidebar is hidden */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              title="Buka Daftar Anggota Silsilah"
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
                zIndex: 35,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: 'rgba(19, 27, 46, 0.92)',
                backdropFilter: 'blur(10px)',
                border: '1px solid #1E293B',
                color: '#F8FAFC',
                padding: '7px 13px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#10B981')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1E293B')}
            >
              <Users size={14} color="#10B981" />
              <span>Daftar Anggota</span>
            </button>
          )}

          {viewMode === 'canvas' ? (
            <TreeCanvas
              onOpenProfile={(id) => setSelectedProfileId(id)}
              onAddRelation={handleOpenAddRelation}
              onNodeDrop={(sourceId, targetId) => {
                setQuickConnectPair({ sourceId, targetId });
                setIsQuickConnectOpen(true);
              }}
            />
          ) : (
            <FamilyListView onOpenProfile={(id) => setSelectedProfileId(id)} />
          )}

          {/* Empty state banner when database has 0 people */}
          {people.length === 0 && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: isSidebarOpen ? 'calc(50% + 155px)' : '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(16px)',
                border: '1px solid #1E293B',
                borderRadius: 16,
                padding: '32px 36px',
                textAlign: 'center',
                maxWidth: 440,
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                zIndex: 20,
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <Sparkles size={24} color="#34D399" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>
                Pohon Silsilah Bersih & Siap Digunakan
              </h3>
              <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5, marginBottom: 20 }}>
                Data contoh lama telah dibersihkan sepenuhnya. Mulai bangun silsilah keluarga Anda dengan menambahkan anggota pertama.
              </p>
              <button
                onClick={handleOpenAddMember}
                className="btn-primary"
                style={{
                  padding: '10px 20px',
                  fontSize: 13,
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Plus size={16} />
                <span>Tambah Anggota Pertama</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Slide-out Profile Drawer */}
      <ProfileDrawer
        personId={selectedProfileId}
        onClose={() => setSelectedProfileId(null)}
        onEdit={(id) => {
          setSelectedProfileId(null);
          handleOpenEditMember(id);
        }}
        onAddRelation={(id) => {
          setSelectedProfileId(null);
          handleOpenAddRelation(id);
        }}
      />

      {/* Member Add/Edit Modal (With image upload, circular preview, zoom, XY offsets, and client account linking) */}
      <MemberModal
        isOpen={isMemberModalOpen}
        editPersonId={editPersonId}
        onClose={() => {
          setIsMemberModalOpen(false);
          setEditPersonId(null);
        }}
        onSuccess={(id) => setSelectedProfileId(id)}
      />

      {/* Relationship Connect Modal */}
      <RelationModal
        isOpen={isRelationModalOpen}
        selectedPersonId={relationPersonId}
        onClose={() => {
          setIsRelationModalOpen(false);
          setRelationPersonId(null);
        }}
      />

      {/* Quick Connect Drop Modal (Ayah / Ibu / Anak / Pasangan) */}
      <QuickConnectModal
        isOpen={isQuickConnectOpen}
        sourcePersonId={quickConnectPair?.sourceId || null}
        targetPersonId={quickConnectPair?.targetId || null}
        onClose={() => {
          setIsQuickConnectOpen(false);
          setQuickConnectPair(null);
        }}
      />

      {/* Superadmin Account & Role Management Modal */}
      <AccountManagementModal
        isOpen={isAccountMgmtOpen}
        onClose={() => setIsAccountMgmtOpen(false)}
      />

      {/* Audit Log Drawer */}
      <AuditLogDrawer
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
      />

      {/* Workspace Title & Settings Modal (Editable Family Name by Superadmin) */}
      <WorkspaceSettingsModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
      />

      {/* Theme Customizer Modal with RGB color pickers */}
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      {/* Authentication & Change Password Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Password Reset Requests Admin Modal (WhatsApp & Email with PDF download/print) */}
      <PasswordResetAdminModal
        isOpen={isResetAdminOpen}
        onClose={() => setIsResetAdminOpen(false)}
      />

      {/* Floating AI Chatbot Assistant (Gemini / OpenAI / Built-in Engine) */}
      <AIChatDrawer />

      {/* Community Chat Drawer */}
      {currentUser && (
        <CommunityChatDrawer
          isOpen={isCommunityChatOpen}
          onClose={() => setIsCommunityChatOpen(false)}
          currentUser={currentUser}
        />
      )}

      {/* User Profile & Photo Avatar Modal */}
      {isUserProfileOpen && currentUser && (
        <UserProfileModal
          currentUser={currentUser}
          onClose={() => setIsUserProfileOpen(false)}
          onUserUpdated={(updatedUser) => {
            updateCurrentUser(updatedUser);
          }}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  useEffect(() => {
    try {
      const saved = localStorage.getItem('silsilah_custom_theme_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        applyThemeColors(parsed);
      }
    } catch {}
  }, []);

  return (
    <FamilyStoreProvider>
      <SilsilahDashboard />
    </FamilyStoreProvider>
  );
}
