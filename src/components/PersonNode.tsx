'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { PersonNodeData } from '@/lib/treeLayout';
import { Sparkles, Eye, ChevronDown, ChevronUp, ShieldCheck, Heart, User } from 'lucide-react';

const PersonNodeComponent = ({ data }: NodeProps) => {
  const nodeData = data as unknown as PersonNodeData;
  const {
    person,
    isFocus,
    relativeInfo,
    childCount,
    isCollapsed,
    onSelectFocus,
    onOpenProfile,
  } = nodeData;

  const isDeceased = person.isDeceased;
  const birthYear = person.birthDate ? person.birthDate.split('-')[0] : '?';
  const deathYear = person.deathDate ? person.deathDate.split('-')[0] : '';
  const yearString = isDeceased
    ? `${birthYear} – ${deathYear || 'Wafat'}`
    : `${birthYear} – sekarang`;

  const getGenderColor = () => {
    if (person.gender === 'male') return '#3B82F6';
    if (person.gender === 'female') return '#EC4899';
    return '#8B5CF6';
  };

  const getRelativeBadgeStyle = () => {
    if (isFocus) {
      return {
        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        color: '#0F172A',
        fontWeight: '700',
        boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)',
      };
    }
    switch (relativeInfo.category) {
      case 'parent':
        return { background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.4)' };
      case 'child':
        return { background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.4)' };
      case 'spouse':
        return { background: 'rgba(244, 63, 94, 0.2)', color: '#FB7185', border: '1px solid rgba(244, 63, 94, 0.4)' };
      case 'sibling':
        return { background: 'rgba(139, 92, 246, 0.2)', color: '#A78BFA', border: '1px solid rgba(139, 92, 246, 0.4)' };
      case 'grandparent':
      case 'grandchild':
        return { background: 'rgba(234, 179, 8, 0.2)', color: '#FACC15', border: '1px solid rgba(234, 179, 8, 0.4)' };
      default:
        return { background: 'rgba(148, 163, 184, 0.15)', color: '#94A3B8', border: '1px solid rgba(148, 163, 184, 0.3)' };
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: 250,
        borderRadius: 14,
        background: isFocus
          ? 'linear-gradient(160deg, #1A263D 0%, #151F33 100%)'
          : 'linear-gradient(160deg, #151D2C 0%, #111827 100%)',
        border: isFocus
          ? '2px solid #F59E0B'
          : isDeceased
          ? '1px solid #334155'
          : '1px solid #1E293B',
        boxShadow: isFocus
          ? '0 0 24px rgba(245, 158, 11, 0.35), 0 8px 24px rgba(0, 0, 0, 0.5)'
          : '0 4px 16px rgba(0, 0, 0, 0.35)',
        padding: '12px 14px',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'default',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Handles for Flow Connections */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          background: '#3B82F6',
          width: 8,
          height: 8,
          borderRadius: '50%',
          border: '2px solid #0A0E17',
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{
          background: '#10B981',
          width: 8,
          height: 8,
          borderRadius: '50%',
          border: '2px solid #0A0E17',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          background: '#F43F5E',
          width: 8,
          height: 8,
          borderRadius: '50%',
          border: '2px solid #0A0E17',
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          background: '#F43F5E',
          width: 8,
          height: 8,
          borderRadius: '50%',
          border: '2px solid #0A0E17',
        }}
      />

      {/* Top Bar: Relation to Focus Badge & Verification */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 10.5,
            padding: '2px 8px',
            borderRadius: 999,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            ...getRelativeBadgeStyle(),
          }}
        >
          {isFocus && <Sparkles size={11} />}
          {relativeInfo.label}
          {relativeInfo.detail && (
            <span style={{ opacity: 0.75, fontSize: 9.5 }}>{relativeInfo.detail}</span>
          )}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {person.verificationStatus === 'verified' && (
            <span title="Data terverifikasi keluarga" style={{ color: '#10B981', display: 'flex' }}>
              <ShieldCheck size={14} />
            </span>
          )}
          {isDeceased && (
            <span title="Almarhum / Almarhumah" style={{ fontSize: 11, opacity: 0.8 }}>
              🕊️
            </span>
          )}
        </div>
      </div>

      {/* Main Content: Avatar + Names */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div
          style={{
            position: 'relative',
            width: 48,
            height: 48,
            borderRadius: '50%',
            overflow: 'hidden',
            border: `2px solid ${isFocus ? '#F59E0B' : getGenderColor()}`,
            flexShrink: 0,
            background: '#1E293B',
          }}
        >
          {person.photoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={person.photoUrl}
              alt={person.fullName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: isDeceased ? 'grayscale(40%)' : 'none',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
              }}
            >
              <User size={22} />
            </div>
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 13.5,
              color: isFocus ? '#FDE68A' : '#F8FAFC',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={person.fullName}
          >
            {person.displayName || person.fullName}
          </div>
          <div
            style={{
              fontSize: 11,
              color: '#94A3B8',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginTop: 1,
            }}
          >
            {person.fullName}
          </div>
          <div
            style={{
              fontSize: 10.5,
              color: '#64748B',
              marginTop: 3,
            }}
          >
            {yearString}
          </div>
        </div>
      </div>

      {/* Action Footer: Focus, Profile, Collapse buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
          paddingTop: 8,
          borderTop: '1px solid rgba(255, 255, 255, 0.07)',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          {!isFocus ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectFocus(person.id);
              }}
              title="Jadikan Titik Fokus Navigasi"
              style={{
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#FBBF24',
                padding: '4px 8px',
                borderRadius: 6,
                fontSize: 10.5,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.15s ease',
              }}
            >
              <Sparkles size={11} />
              Fokus
            </button>
          ) : (
            <span
              style={{
                color: '#F59E0B',
                fontSize: 10.5,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              ⭐ Fokus Utama
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenProfile(person.id);
            }}
            title="Buka Lembar Profil Lengkap"
            style={{
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#60A5FA',
              padding: '4px 8px',
              borderRadius: 6,
              fontSize: 10.5,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Eye size={11} />
            Profil
          </button>
        </div>

        {childCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              nodeData.onSelectFocus && nodeData.onSelectFocus(person.id);
            }}
            title={isCollapsed ? 'Buka cabang keturunan' : 'Tutup cabang keturunan'}
            style={{
              background: isCollapsed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.12)',
              color: isCollapsed ? '#F87171' : '#34D399',
              padding: '3px 7px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            {childCount} Anak
            {isCollapsed ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
          </button>
        )}
      </div>
    </div>
  );
};

export const PersonNode = memo(PersonNodeComponent);
