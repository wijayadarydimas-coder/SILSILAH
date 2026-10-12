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
import { PhoneCountryInput } from '@/components/PhoneCountryInput';
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
 * Full-screen Login Portal for clean initial entry
 */
function FullScreenAuthPortal() {
  const { onLoginSuccess } = useFamilyStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#11100E',
        position: 'relative',
        overflow: 'hidden',
        padding: '16px',
      }}
    >
      {/* Background Batik illustration */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/background.svg"
        alt="Background Pattern"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.65,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle Batik Sulur Corner Watermarks */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/batik-sulur-corner.svg"
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 'clamp(140px, 18vw, 240px)',
          opacity: 0.22,
          pointerEvents: 'none',
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/batik-sulur-corner.svg"
        alt=""
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 'clamp(140px, 18vw, 240px)',
          transform: 'rotate(180deg)',
          opacity: 0.22,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle Warm Antique Gold Ambient Aura (non-neon) */}
      <div
        style={{
          position: 'absolute',
          width: 550,
          height: 550,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(198, 161, 91, 0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Dark Pro Central Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 'min(440px, 94vw)',
          background: 'rgba(33, 29, 24, 0.94)',
          backdropFilter: 'blur(20px)',
          border: '1px solid #393128',
          borderRadius: 20,
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.88), 0 0 35px rgba(198, 161, 91, 0.08)',
          padding: 'clamp(24px, 5vw, 36px) clamp(16px, 5vw, 30px)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* App Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div
            style={{
              width: 68,
              height: 68,
              margin: '0 auto 14px auto',
              borderRadius: 20,
              background: '#191714',
              border: '1.5px solid #49372A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 6,
              boxShadow: '0 0 25px rgba(198, 161, 91, 0.25)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/javanese-darkpro-mark.svg" alt="Silsilah Logo" style={{ width: '100%', height: '100%' }} />
          </div>
          <h1
            style={{
              fontSize: 25,
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: '#F1E8D8',
              fontFamily: 'var(--font-serif)',
              marginBottom: 4,
            }}
          >
            SILSILAH
          </h1>
          <p style={{ fontSize: 12.5, color: '#A79D8D', letterSpacing: '0.01em' }}>
            Portal Pohon Silsilah Trah &amp; Jejak Keluarga
          </p>

          {/* Delicate Batik Divider */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/batik-sulur-divider.svg"
            alt=""
            style={{ width: '70%', height: 'auto', margin: '14px auto 0 auto', opacity: 0.6 }}
          />
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(217, 121, 112, 0.15)',
              border: '1px solid rgba(217, 121, 112, 0.35)',
              color: '#F8B4AD',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 12,
              marginBottom: 16,
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
              background: 'rgba(126, 170, 131, 0.15)',
              border: '1px solid rgba(126, 170, 131, 0.35)',
              color: '#A8D2AC',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            <CheckCircle size={15} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: 11.5,
                fontWeight: 600,
                color: '#C6A15B',
                marginBottom: 6,
                letterSpacing: '0.02em',
              }}
            >
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={15} color="#8F6D35" style={{ position: 'absolute', left: 12, top: 11 }} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="cth: silsilah atau nama_user"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 8,
                  background: '#191714',
                  border: '1px solid #393128',
                  color: '#F1E8D8',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label
              style={{
                display: 'block',
                fontSize: 11.5,
                fontWeight: 600,
                color: '#C6A15B',
                marginBottom: 6,
                letterSpacing: '0.02em',
              }}
            >
              Kata Sandi (Password)
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="#8F6D35" style={{ position: 'absolute', left: 12, top: 11 }} />
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
                  background: '#191714',
                  border: '1px solid #393128',
                  color: '#F1E8D8',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
            <button
              type="button"
              onClick={() => setIsResetOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#C6A15B',
                fontSize: 12,
                cursor: 'pointer',
                padding: 0,
                fontWeight: 600,
              }}
            >
              Lupa kata sandi?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '11px 0',
              fontSize: 13.5,
              fontWeight: 700,
              opacity: loading ? 0.7 : 1,
            }}
          >
            <span>{loading ? 'Memproses...' : 'Masuk ke Ruang Silsilah'}</span>
            <ArrowRight size={15} />
          </button>
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
            color: '#7A7063',
          }}
        >
          <ShieldCheck size={13} color="#C6A15B" />
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
  const [authMode, setAuthMode] = useState<'login' | 'change_password'>('login');

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

  const handleOpenAuth = (mode: 'login' | 'change_password') => {
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
        background: 'var(--bg-primary, #11100E)',
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
                background: 'var(--bg-card, #211D18)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--border-subtle, #393128)',
                borderRadius: 18,
                padding: '34px 38px',
                textAlign: 'center',
                maxWidth: 450,
                zIndex: 20,
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  background: 'rgba(198, 161, 91, 0.15)',
                  border: '1.5px solid var(--primary, #C6A15B)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/icon-family-tree.svg" alt="Trah" style={{ width: 28, height: 28 }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary, #F1E8D8)', fontFamily: 'var(--font-serif)', marginBottom: 8 }}>
                Pohon Silsilah Siap Dimulai
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary, #A79D8D)', lineHeight: 1.55, marginBottom: 20 }}>
                Mulai bangun garis keturunan trah keluarga Anda dengan menambahkan data leluhur atau anggota pertama.
              </p>
              <button
                onClick={handleOpenAddMember}
                className="btn-primary"
                style={{
                  padding: '10px 22px',
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
