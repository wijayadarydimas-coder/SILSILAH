'use client';

import React, { useState } from 'react';
import { useFamilyStore } from '@/lib/store';
import { calculateGenerations, getRelativeRelationship, calculateAge } from '@/lib/familyLogic';
import { Search, Sparkles, Eye, ShieldCheck, User, Users } from 'lucide-react';

interface FamilyListViewProps {
  onOpenProfile: (id: string) => void;
}

export function FamilyListView({ onOpenProfile }: FamilyListViewProps) {
  const {
    people,
    parentChildRelations,
    partnerships,
    focusPersonId,
    setFocusPersonId,
  } = useFamilyStore();

  const [searchQuery, setSearchQuery] = useState('');

  const peopleMap = new Map(people.map((p) => [p.id, p]));
  const levels = calculateGenerations(people, parentChildRelations, partnerships);

  const filteredPeople = people.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      (p.displayName && p.displayName.toLowerCase().includes(q)) ||
      (p.biography && p.biography.toLowerCase().includes(q))
    );
  });

  // Group by generation level
  const genGroups = new Map<number, typeof people>();
  filteredPeople.forEach((p) => {
    const gen = levels.get(p.id) || 1;
    if (!genGroups.has(gen)) {
      genGroups.set(gen, []);
    }
    genGroups.get(gen)!.push(p);
  });

  const sortedGens = Array.from(genGroups.keys()).sort((a, b) => a - b);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 20px 80px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Header & Search */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: 'rgba(198, 161, 91, 0.12)',
                border: '1px solid rgba(198, 161, 91, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/icon-family-tree.svg" alt="Trah" width={24} height={24} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 800, color: 'var(--ivory, #F1E8D8)', letterSpacing: '0.01em' }}>
                Direktori Trah Silsilah Keluarga
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted, #A79D8D)', marginTop: 2 }}>
                Tampilan daftar silsilah per generasi
              </p>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="var(--antique-gold, #C6A15B)"
              style={{ position: 'absolute', left: 14, top: 13 }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama anggota, gelar, panggilan, atau riwayat biografi..."
              style={{
                width: '100%',
                padding: '11px 16px 11px 42px',
                borderRadius: 10,
                background: 'var(--bg-menu, #191714)',
                border: '1px solid var(--border-subtle, #393128)',
                color: 'var(--ivory, #F1E8D8)',
                fontSize: 13.5,
                outline: 'none',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
              }}
            />
          </div>
        </div>

        {/* Generations List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sortedGens.map((genNum) => {
            const members = genGroups.get(genNum)!;

            return (
              <div
                key={genNum}
                style={{
                  background: 'var(--bg-card, #211D18)',
                  border: '1px solid var(--border-subtle, #393128)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                }}
              >
                <div
                  style={{
                    padding: '12px 18px',
                    background: 'var(--bg-secondary, #191714)',
                    borderBottom: '1px solid var(--border-subtle, #393128)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700, color: 'var(--antique-gold, #C6A15B)', letterSpacing: '0.02em' }}>
                    Generasi ke-{genNum}
                  </h2>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted, #A79D8D)', background: 'rgba(198, 161, 91, 0.1)', padding: '2px 8px', borderRadius: 999, border: '1px solid rgba(198, 161, 91, 0.2)' }}>
                    {members.length} Anggota
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {members.map((p, idx) => {
                    const isFocus = p.id === focusPersonId;
                    const relInfo = getRelativeRelationship(
                      p.id,
                      focusPersonId,
                      peopleMap,
                      parentChildRelations,
                      partnerships
                    );

                    return (
                      <div
                        key={p.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 18px',
                          borderBottom: idx < members.length - 1 ? '1px solid var(--border-subtle, #393128)' : 'none',
                          background: isFocus ? 'rgba(198, 161, 91, 0.08)' : 'transparent',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: '50%',
                              overflow: 'hidden',
                              border: `2px solid ${isFocus ? 'var(--antique-gold, #C6A15B)' : p.gender === 'male' ? '#8F6D35' : '#B96F4B'}`,
                              flexShrink: 0,
                              background: 'var(--bg-elevated, #211D18)',
                            }}
                          >
                            {p.photoUrl ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={p.photoUrl}
                                alt={p.fullName}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted, #A79D8D)' }}>
                                <User size={20} />
                              </div>
                            )}
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 14, fontWeight: 600, color: isFocus ? 'var(--antique-gold, #C6A15B)' : 'var(--ivory, #F1E8D8)' }}>
                                {p.fullName}
                              </span>
                              {p.verificationStatus === 'verified' && (
                                <ShieldCheck size={14} color="var(--success, #7EAA83)" />
                              )}
                              {p.isDeceased && (
                                <span style={{ fontSize: 11 }} title="Almarhum / Almarhumah">🕊️</span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                              <span
                                style={{
                                  fontSize: 10.5,
                                  padding: '2px 8px',
                                  borderRadius: 999,
                                  background: isFocus ? 'linear-gradient(135deg, #C6A15B 0%, #8F6D35 100%)' : 'rgba(198, 161, 91, 0.12)',
                                  color: isFocus ? '#11100E' : 'var(--antique-gold, #C6A15B)',
                                  border: isFocus ? 'none' : '1px solid rgba(198, 161, 91, 0.25)',
                                  fontWeight: 600,
                                }}
                              >
                                {isFocus ? '⭐ TITIK FOKUS' : relInfo.label}
                              </span>
                              <span style={{ fontSize: 11, color: 'var(--text-muted, #A79D8D)' }}>
                                {calculateAge(p.birthDate, p.deathDate, p.isDeceased).formattedLifeSpan}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8 }}>
                          {!isFocus && (
                            <button
                              onClick={() => setFocusPersonId(p.id)}
                              style={{
                                background: 'rgba(198, 161, 91, 0.12)',
                                color: 'var(--antique-gold, #C6A15B)',
                                border: '1px solid rgba(198, 161, 91, 0.3)',
                                padding: '6px 10px',
                                borderRadius: 6,
                                fontSize: 11.5,
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                cursor: 'pointer',
                              }}
                            >
                              <Sparkles size={12} />
                              Jadikan Fokus
                            </button>
                          )}
                          <button
                            onClick={() => onOpenProfile(p.id)}
                            style={{
                              background: 'rgba(73, 55, 42, 0.3)',
                              color: 'var(--ivory, #F1E8D8)',
                              border: '1px solid var(--border-subtle, #393128)',
                              padding: '6px 12px',
                              borderRadius: 6,
                              fontSize: 11.5,
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              cursor: 'pointer',
                            }}
                          >
                            <Eye size={12} />
                            Profil
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
