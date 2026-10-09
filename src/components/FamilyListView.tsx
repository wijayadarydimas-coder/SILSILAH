'use client';

import React, { useState } from 'react';
import { useFamilyStore } from '@/lib/store';
import { calculateGenerations, getRelativeRelationship } from '@/lib/familyLogic';
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
        flex: 1,
        overflowY: 'auto',
        padding: '24px 20px',
        maxWidth: 960,
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Header & Search */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={22} color="#10B981" />
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC' }}>
              Direktori Anggota Silsilah Keluarga
            </h1>
            <p style={{ fontSize: 13, color: '#94A3B8' }}>
              Tampilan daftar silsilah terstruktur per generasi untuk kemudahan aksesibilitas (TREE-09)
            </p>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            color="#94A3B8"
            style={{ position: 'absolute', left: 12, top: 12 }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama anggota, panggilan, atau riwayat silsilah..."
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: 10,
              background: '#131B2E',
              border: '1px solid #1E293B',
              color: '#F8FAFC',
              fontSize: 13.5,
            }}
          />
        </div>
      </div>

      {/* Generations List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {sortedGens.map((genNum) => {
          const members = genGroups.get(genNum)!;

          return (
            <div
              key={genNum}
              style={{
                background: '#111827',
                border: '1px solid #1E293B',
                borderRadius: 14,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '12px 18px',
                  background: '#162035',
                  borderBottom: '1px solid #1E293B',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>
                  Generasi ke-{genNum}
                </h2>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>
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
                        padding: '14px 18px',
                        borderBottom: idx < members.length - 1 ? '1px solid #1E293B' : 'none',
                        background: isFocus ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: `2px solid ${isFocus ? '#F59E0B' : p.gender === 'male' ? '#3B82F6' : '#EC4899'}`,
                            flexShrink: 0,
                            background: '#1E293B',
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
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>
                              <User size={20} />
                            </div>
                          )}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: isFocus ? '#FDE68A' : '#F8FAFC' }}>
                              {p.fullName}
                            </span>
                            {p.verificationStatus === 'verified' && (
                              <ShieldCheck size={14} color="#10B981" />
                            )}
                            {p.isDeceased && (
                              <span style={{ fontSize: 11 }}>🕊️</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                            <span
                              style={{
                                fontSize: 11,
                                padding: '2px 7px',
                                borderRadius: 4,
                                background: isFocus ? '#F59E0B' : 'rgba(16, 185, 129, 0.12)',
                                color: isFocus ? '#0F172A' : '#34D399',
                                fontWeight: 600,
                              }}
                            >
                              {isFocus ? '⭐ TITIK FOKUS' : relInfo.label}
                            </span>
                            <span style={{ fontSize: 11.5, color: '#94A3B8' }}>
                              {p.birthDate ? p.birthDate.split('-')[0] : '?'} – {p.isDeceased ? (p.deathDate ? p.deathDate.split('-')[0] : 'Wafat') : 'sekarang'}
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
                              background: 'rgba(245, 158, 11, 0.12)',
                              color: '#FBBF24',
                              padding: '6px 10px',
                              borderRadius: 6,
                              fontSize: 11.5,
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Sparkles size={12} />
                            Jadikan Fokus
                          </button>
                        )}
                        <button
                          onClick={() => onOpenProfile(p.id)}
                          style={{
                            background: '#1E293B',
                            color: '#F8FAFC',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
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
  );
}
