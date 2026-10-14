'use client';

import React, { useState } from 'react';
import { useFamilyStore } from '@/lib/store';
import { X, Home, CheckCircle, AlertTriangle } from 'lucide-react';

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkspaceSettingsModal({ isOpen, onClose }: WorkspaceSettingsModalProps) {
  const { workspace, currentUser, onLoginSuccess } = useFamilyStore();
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  React.useEffect(() => {
    setName(workspace.name);
    setDescription(workspace.description || '');
    setErrorMsg('');
    setSuccessMsg('');
  }, [workspace, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Nama keluarga tidak boleh kosong.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_WORKSPACE',
          data: {
            id: workspace.id,
            name: name.trim(),
            description: description.trim(),
          },
          actor: currentUser,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal mengubah nama keluarga.');
      } else {
        setSuccessMsg('Nama keluarga berhasil diperbarui di database PostgreSQL!');
        // Refresh page state
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch {
      setErrorMsg('Koneksi ke database gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: 'var(--bg-elevated, #211D18)',
          border: '1px solid var(--border-subtle, #393128)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 480,
          boxShadow: 'var(--shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.5))',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle, #393128)',
            background: 'var(--bg-secondary, #191714)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Home size={18} color="var(--accent-gold, #C6A15B)" />
            <h2
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--text-primary, #F1E8D8)',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.01em',
              }}
            >
              Ubah Judul &amp; Nama Ruang Keluarga
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              color: 'var(--text-muted, #A79D8D)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {errorMsg && (
            <div
              style={{
                background: 'rgba(217, 121, 112, 0.12)',
                border: '1px solid rgba(217, 121, 112, 0.3)',
                color: 'var(--accent-danger, #D97970)',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 12.5,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: 'rgba(126, 170, 131, 0.15)',
                border: '1px solid rgba(126, 170, 131, 0.35)',
                color: 'var(--accent-success, #7EAA83)',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 12.5,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #A79D8D)', marginBottom: 6 }}>
              Judul / Nama Keluarga (Dapat diedit oleh Superadmin)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Trah Ageng Kyai Ageng..."
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                background: 'var(--bg-secondary, #191714)',
                border: '1px solid var(--border-subtle, #393128)',
                color: 'var(--text-primary, #F1E8D8)',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #A79D8D)', marginBottom: 6 }}>
              Deskripsi Singkat / Asal Trah
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan silsilah, pusaka keluarga, dan garis keturunan..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                background: 'var(--bg-secondary, #191714)',
                border: '1px solid var(--border-subtle, #393128)',
                color: 'var(--text-primary, #F1E8D8)',
                fontSize: 13,
                resize: 'vertical',
                outline: 'none',
              }}
            />
          </div>

          <div
            style={{
              padding: '12px 0 0 0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              borderTop: '1px solid var(--border-subtle, #393128)',
              marginTop: 6,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{
                padding: '8px 16px',
                fontSize: 12.5,
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '8px 20px', fontSize: 12.5 }}
            >
              {loading ? 'Menyimpan...' : 'Simpan Nama Keluarga'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
