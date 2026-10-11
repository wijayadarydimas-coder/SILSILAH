'use client';

import React, { useState, useEffect } from 'react';
import { X, Palette, Sparkles, Check, RotateCcw } from 'lucide-react';

export interface ThemeColors {
  primary: string;
  bgPrimary: string;
  bgNavbar: string;
  bgMenu: string;
  bgSurface: string;
  bgCard: string;
  textPrimary: string;
  accentGold: string;
  communityBtn?: string;
  communityBtnText?: string;
}

export const PRESET_THEMES: { name: string; colors: ThemeColors }[] = [
  {
    name: '👑 Dark Pro × Javanese Heritage (Default)',
    colors: {
      primary: '#C6A15B',
      bgPrimary: '#11100E',
      bgNavbar: '#151310',
      bgMenu: '#191714',
      bgSurface: '#211D18',
      bgCard: '#211D18',
      textPrimary: '#F1E8D8',
      accentGold: '#C6A15B',
      communityBtn: '#211D18',
      communityBtnText: '#C6A15B',
    },
  },
  {
    name: '🌕 Wulan Purnama (Mode Terang Porcelain & Emas Antik)',
    colors: {
      primary: '#8F6D35',
      bgPrimary: '#FAF7F2',
      bgNavbar: '#FAF7F2',
      bgMenu: '#F3ECE1',
      bgSurface: '#FFFFFF',
      bgCard: '#FFFFFF',
      textPrimary: '#26201A',
      accentGold: '#8F6D35',
      communityBtn: '#F3ECE1',
      communityBtnText: '#8F6D35',
    },
  },
  {
    name: '🏛️ Dalem Keraton (Obsidian & Emas Murni)',
    colors: {
      primary: '#D4AF37',
      bgPrimary: '#0D0C0B',
      bgNavbar: '#141210',
      bgMenu: '#181613',
      bgSurface: '#1E1B17',
      bgCard: '#1E1B17',
      textPrimary: '#F5EEDB',
      accentGold: '#D4AF37',
      communityBtn: '#1E1B17',
      communityBtnText: '#D4AF37',
    },
  },
  {
    name: '🪵 Kayu Jati Mataram (Teak Wood & Terracotta)',
    colors: {
      primary: '#B96F4B',
      bgPrimary: '#161311',
      bgNavbar: '#1E1A16',
      bgMenu: '#241E19',
      bgSurface: '#2A241E',
      bgCard: '#2A241E',
      textPrimary: '#F2E7DC',
      accentGold: '#C6A15B',
      communityBtn: '#2A241E',
      communityBtnText: '#B96F4B',
    },
  },
  {
    name: '🌿 Wilis Pandan (Sage Heritage & Kayu Jati)',
    colors: {
      primary: '#7EAA83',
      bgPrimary: '#111311',
      bgNavbar: '#151815',
      bgMenu: '#1A201A',
      bgSurface: '#212821',
      bgCard: '#212821',
      textPrimary: '#EEF3EE',
      accentGold: '#C6A15B',
      communityBtn: '#212821',
      communityBtnText: '#7EAA83',
    },
  },
];

export const THEME_STORAGE_KEY = 'silsilah_custom_theme_v1';

export function applyThemeColors(colors: ThemeColors) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--primary-hover', colors.primary);
  root.style.setProperty('--primary-glow', `${colors.primary}40`);
  root.style.setProperty('--bg-primary', colors.bgPrimary);
  root.style.setProperty('--bg-navbar', colors.bgNavbar || '#151310');
  root.style.setProperty('--bg-menu', colors.bgMenu || '#191714');
  root.style.setProperty('--bg-secondary', colors.bgMenu || '#191714');
  root.style.setProperty('--bg-elevated', colors.bgCard || colors.bgSurface || '#211D18');
  root.style.setProperty('--bg-surface', colors.bgSurface || colors.bgCard || '#211D18');
  root.style.setProperty('--bg-surface-elevated', colors.bgSurface || colors.bgCard || '#211D18');
  root.style.setProperty('--bg-card', colors.bgCard || colors.bgSurface || '#211D18');
  root.style.setProperty('--accent-gold', colors.accentGold || '#C6A15B');
  root.style.setProperty('--border-focus', colors.primary || '#C6A15B');
  if (colors.communityBtn) {
    root.style.setProperty('--community-btn', colors.communityBtn);
    root.style.setProperty('--community-btn-border', colors.communityBtn);
  }
  if (colors.communityBtnText) {
    root.style.setProperty('--community-btn-text', colors.communityBtnText);
  }

  const isLight =
    colors.bgPrimary === '#F8FAFC' ||
    colors.bgPrimary === '#FFFFFF' ||
    colors.bgPrimary === '#F7F2E7' ||
    colors.bgPrimary.toLowerCase() === '#f8fafc' ||
    colors.bgPrimary.toLowerCase() === '#f7f2e7' ||
    colors.bgPrimary.toLowerCase() === '#ffffff';

  if (colors.textPrimary) {
    root.style.setProperty('--text-primary', colors.textPrimary);
  } else {
    root.style.setProperty('--text-primary', isLight ? '#2A2016' : '#F1E8D8');
  }

  if (isLight) {
    root.setAttribute('data-theme', 'light');
    document.body.classList.add('theme-light');
    root.style.setProperty('--text-secondary', '#5C4E40');
    root.style.setProperty('--text-muted', '#7A6B5C');
    root.style.setProperty('--border-subtle', '#E0D4C3');
    root.style.setProperty('--border-medium', '#C9B9A3');
  } else {
    root.removeAttribute('data-theme');
    document.body.classList.remove('theme-light');
    root.style.setProperty('--text-secondary', '#A79D8D');
    root.style.setProperty('--text-muted', '#A79D8D');
    root.style.setProperty('--border-subtle', '#393128');
    root.style.setProperty('--border-medium', '#49372A');
  }
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
          background: 'var(--bg-elevated, #211D18)',
          border: '1px solid var(--border-subtle, #393128)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 'min(480px, 94vw)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
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
            <Palette size={20} color="var(--accent-gold, #C6A15B)" />
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--text-primary, #F1E8D8)',
                fontFamily: 'Cinzel, serif',
                letterSpacing: '0.02em',
              }}
            >
              Kustomisasi Tema &amp; Palet Warna RGB
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

        {/* Content */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18, maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Preset Buttons */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--accent-gold, #C6A15B)', marginBottom: 8, letterSpacing: '0.04em' }}>
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
                    padding: '9px 12px',
                    borderRadius: 8,
                    background: 'var(--bg-secondary, #191714)',
                    border: '1px solid var(--border-subtle, #393128)',
                    color: 'var(--text-primary, #F1E8D8)',
                    fontSize: 12.5,
                    fontWeight: 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-gold, #C6A15B)';
                    e.currentTarget.style.background = 'var(--bg-surface-hover, #2B251E)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle, #393128)';
                    e.currentTarget.style.background = 'var(--bg-secondary, #191714)';
                  }}
                >
                  <span>{preset.name}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: preset.colors.primary, border: '1px solid rgba(0,0,0,0.3)' }} />
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: preset.colors.bgNavbar, border: '1px solid rgba(0,0,0,0.3)' }} />
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: preset.colors.bgPrimary, border: '1px solid rgba(0,0,0,0.3)' }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Sliders / Pickers */}
          <div style={{ background: 'var(--bg-secondary, #191714)', padding: 14, borderRadius: 10, border: '1px solid var(--border-subtle, #393128)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-gold, #C6A15B)', letterSpacing: '0.04em' }}>
              PENGATURAN WARNA KOMPONEN KHUSUS:
            </span>

            {/* Background Primary */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-primary, #F1E8D8)' }}>Warna Latar Belakang (Canvas):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={colors.bgPrimary}
                  onChange={(e) => handleColorChange('bgPrimary', e.target.value)}
                  style={{ width: 36, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <span style={{ fontSize: 11.5, color: 'var(--text-muted, #A79D8D)', fontFamily: 'monospace' }}>{colors.bgPrimary}</span>
              </div>
            </div>

            {/* Navbar Background */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-primary, #F1E8D8)' }}>Warna Navbar (Header Atas):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={colors.bgNavbar || '#151310'}
                  onChange={(e) => handleColorChange('bgNavbar', e.target.value)}
                  style={{ width: 36, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <span style={{ fontSize: 11.5, color: 'var(--text-muted, #A79D8D)', fontFamily: 'monospace' }}>{colors.bgNavbar || '#151310'}</span>
              </div>
            </div>

            {/* Menu / Sidebar Background */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-primary, #F1E8D8)' }}>Warna Menu (Panel Anggota):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={colors.bgMenu || '#191714'}
                  onChange={(e) => handleColorChange('bgMenu', e.target.value)}
                  style={{ width: 36, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <span style={{ fontSize: 11.5, color: 'var(--text-muted, #A79D8D)', fontFamily: 'monospace' }}>{colors.bgMenu || '#191714'}</span>
              </div>
            </div>

            {/* Primary Accent */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-primary, #F1E8D8)' }}>Aksen Utama (Tombol &amp; Garis):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  style={{ width: 36, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <span style={{ fontSize: 11.5, color: 'var(--text-muted, #A79D8D)', fontFamily: 'monospace' }}>{colors.primary}</span>
              </div>
            </div>

            {/* Card & Box Containers */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-primary, #F1E8D8)' }}>Warna Kotakan / Kartu (Box):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={colors.bgCard || colors.bgSurface || '#211D18'}
                  onChange={(e) => {
                    handleColorChange('bgCard', e.target.value);
                    handleColorChange('bgSurface', e.target.value);
                  }}
                  style={{ width: 36, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <span style={{ fontSize: 11.5, color: 'var(--text-muted, #A79D8D)', fontFamily: 'monospace' }}>{colors.bgCard || colors.bgSurface || '#211D18'}</span>
              </div>
            </div>

            {/* Text & Font Primary */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-primary, #F1E8D8)' }}>Warna Teks / Font Utama:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={colors.textPrimary || '#F1E8D8'}
                  onChange={(e) => handleColorChange('textPrimary', e.target.value)}
                  style={{ width: 36, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <span style={{ fontSize: 11.5, color: 'var(--text-muted, #A79D8D)', fontFamily: 'monospace' }}>{colors.textPrimary || '#F1E8D8'}</span>
              </div>
            </div>

            {/* Focus Accent */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-primary, #F1E8D8)' }}>Aksen Titik Fokus (Gold):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={colors.accentGold}
                  onChange={(e) => handleColorChange('accentGold', e.target.value)}
                  style={{ width: 36, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <span style={{ fontSize: 11.5, color: 'var(--text-muted, #A79D8D)', fontFamily: 'monospace' }}>{colors.accentGold}</span>
              </div>
            </div>

            {/* Community Chat Button Background */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-primary, #F1E8D8)' }}>Tombol Chat Komunitas:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={colors.communityBtn || '#191714'}
                  onChange={(e) => handleColorChange('communityBtn', e.target.value)}
                  style={{ width: 36, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <span style={{ fontSize: 11.5, color: 'var(--text-muted, #A79D8D)', fontFamily: 'monospace' }}>{colors.communityBtn || '#191714'}</span>
              </div>
            </div>

            {/* Community Chat Button Text Color */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-primary, #F1E8D8)' }}>Teks Tombol Chat Komunitas:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={colors.communityBtnText || '#C6A15B'}
                  onChange={(e) => handleColorChange('communityBtnText', e.target.value)}
                  style={{ width: 36, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <span style={{ fontSize: 11.5, color: 'var(--text-muted, #A79D8D)', fontFamily: 'monospace' }}>{colors.communityBtnText || '#C6A15B'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <button
              onClick={handleReset}
              className="btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                fontSize: 12,
              }}
            >
              <RotateCcw size={13} />
              Reset Tema Asli
            </button>

            <button
              onClick={onClose}
              className="btn-primary"
              style={{ padding: '7px 18px', fontSize: 12.5 }}
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
