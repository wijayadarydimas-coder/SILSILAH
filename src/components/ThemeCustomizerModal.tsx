'use client';

import React, { useState, useEffect } from 'react';
import { X, Palette, Sparkles, Check, RotateCcw } from 'lucide-react';

export interface ThemeColors {
  primary: string;
  bgPrimary: string;
  bgNavbar: string;
  bgMenu: string;
  bgSurface: string;
  accentGold: string;
}

const PRESET_THEMES: { name: string; colors: ThemeColors }[] = [
  {
    name: '🌿 Emerald Heritage (Default)',
    colors: {
      primary: '#10B981',
      bgPrimary: '#0A0E17',
      bgNavbar: '#0D1322',
      bgMenu: '#0F1626',
      bgSurface: '#131B2E',
      accentGold: '#F59E0B',
    },
  },
  {
    name: '👑 Royal Gold & Obsidian',
    colors: {
      primary: '#F59E0B',
      bgPrimary: '#0D0D0E',
      bgNavbar: '#141416',
      bgMenu: '#17171A',
      bgSurface: '#1C1917',
      accentGold: '#EAB308',
    },
  },
  {
    name: '🌊 Sapphire Blue & Deep Slate',
    colors: {
      primary: '#3B82F6',
      bgPrimary: '#080E1A',
      bgNavbar: '#0B132B',
      bgMenu: '#0E1738',
      bgSurface: '#0F172A',
      accentGold: '#38BDF8',
    },
  },
  {
    name: '🌌 Neon Amethyst',
    colors: {
      primary: '#8B5CF6',
      bgPrimary: '#0E081A',
      bgNavbar: '#140D26',
      bgMenu: '#1A1033',
      bgSurface: '#19112E',
      accentGold: '#EC4899',
    },
  },
  {
    name: '🏛️ Warm Walnut Heritage',
    colors: {
      primary: '#D97706',
      bgPrimary: '#14100C',
      bgNavbar: '#1D1712',
      bgMenu: '#231B15',
      bgSurface: '#241D17',
      accentGold: '#F59E0B',
    },
  },
];

const THEME_STORAGE_KEY = 'silsilah_custom_theme_v1';

export function applyThemeColors(colors: ThemeColors) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--primary-hover', colors.primary);
  root.style.setProperty('--bg-primary', colors.bgPrimary);
  root.style.setProperty('--bg-navbar', colors.bgNavbar || '#0D1322');
  root.style.setProperty('--bg-menu', colors.bgMenu || '#0F1626');
  root.style.setProperty('--bg-surface', colors.bgSurface);
  root.style.setProperty('--bg-surface-elevated', colors.bgSurface);
  root.style.setProperty('--bg-card', colors.bgSurface);
  root.style.setProperty('--accent-gold', colors.accentGold);
  root.style.setProperty('--border-focus', colors.primary);
}

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeCustomizerModal({ isOpen, onClose }: ThemeCustomizerModalProps) {
  const [colors, setColors] = useState<ThemeColors>(PRESET_THEMES[0].colors);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setColors({ ...PRESET_THEMES[0].colors, ...parsed });
        applyThemeColors({ ...PRESET_THEMES[0].colors, ...parsed });
      }
    } catch {}
  }, []);

  if (!isOpen) return null;

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    const updated = { ...colors, [key]: value };
    setColors(updated);
    applyThemeColors(updated);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleApplyPreset = (preset: ThemeColors) => {
    setColors(preset);
    applyThemeColors(preset);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preset));
    } catch {}
  };

  const handleReset = () => {
    const def = PRESET_THEMES[0].colors;
    setColors(def);
    applyThemeColors(def);
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch {}
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
          background: '#0F1626',
          border: '1px solid #1E293B',
          borderRadius: 16,
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
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
            borderBottom: '1px solid #1E293B',
            background: '#131B2E',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Palette size={20} color={colors.primary} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>
              Kustomisasi Tema &amp; Palet Warna RGB
            </h2>
          </div>
          <button onClick={onClose} style={{ color: '#94A3B8' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18, maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Preset Buttons */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>
              PILIHAN TEMA PRESET CEPAT:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {PRESET_THEMES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(preset.colors)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#162035',
                    border: '1px solid #1E293B',
                    color: '#F8FAFC',
                    fontSize: 12.5,
                    fontWeight: 500,
                    textAlign: 'left',
                  }}
                >
                  <span>{preset.name}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: preset.colors.primary }} />
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: preset.colors.bgNavbar, border: '1px solid #334155' }} />
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: preset.colors.bgPrimary, border: '1px solid #334155' }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Sliders / Pickers */}
          <div style={{ background: '#131B2E', padding: 14, borderRadius: 10, border: '1px solid #1E293B', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>
              PENGATURAN WARNA KOMPONEN KHUSUS:
            </span>

            {/* Background Primary */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: '#F8FAFC' }}>Warna Latar Belakang (Canvas):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={colors.bgPrimary}
                  onChange={(e) => handleColorChange('bgPrimary', e.target.value)}
                  style={{ width: 36, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <span style={{ fontSize: 11.5, color: '#94A3B8', fontFamily: 'monospace' }}>{colors.bgPrimary}</span>
              </div>
            </div>

            {/* Navbar Background */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: '#F8FAFC' }}>Warna Navbar (Header Atas):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={colors.bgNavbar || '#0D1322'}
                  onChange={(e) => handleColorChange('bgNavbar', e.target.value)}
                  style={{ width: 36, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <span style={{ fontSize: 11.5, color: '#94A3B8', fontFamily: 'monospace' }}>{colors.bgNavbar || '#0D1322'}</span>
              </div>
            </div>

            {/* Menu / Sidebar Background */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: '#F8FAFC' }}>Warna Menu (Panel Anggota):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={colors.bgMenu || '#0F1626'}
                  onChange={(e) => handleColorChange('bgMenu', e.target.value)}
                  style={{ width: 36, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <span style={{ fontSize: 11.5, color: '#94A3B8', fontFamily: 'monospace' }}>{colors.bgMenu || '#0F1626'}</span>
              </div>
            </div>

            {/* Primary Accent */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: '#F8FAFC' }}>Aksen Utama (Tombol &amp; Garis):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  style={{ width: 36, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <span style={{ fontSize: 11.5, color: '#94A3B8', fontFamily: 'monospace' }}>{colors.primary}</span>
              </div>
            </div>

            {/* Card & Surface */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: '#F8FAFC' }}>Warna Kartu &amp; Modal:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={colors.bgSurface}
                  onChange={(e) => handleColorChange('bgSurface', e.target.value)}
                  style={{ width: 36, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <span style={{ fontSize: 11.5, color: '#94A3B8', fontFamily: 'monospace' }}>{colors.bgSurface}</span>
              </div>
            </div>

            {/* Focus Accent */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: '#F8FAFC' }}>Aksen Titik Fokus (Gold):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={colors.accentGold}
                  onChange={(e) => handleColorChange('accentGold', e.target.value)}
                  style={{ width: 36, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <span style={{ fontSize: 11.5, color: '#94A3B8', fontFamily: 'monospace' }}>{colors.accentGold}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <button
              onClick={handleReset}
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
              }}
            >
              <RotateCcw size={13} />
              Reset Tema Asli
            </button>

            <button
              onClick={onClose}
              className="btn-primary"
              style={{ padding: '7px 16px', fontSize: 12.5 }}
            >
              <Check size={14} />
              Selesai &amp; Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
