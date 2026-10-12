'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { PersonNodeData } from '@/lib/treeLayout';
import { calculateAge } from '@/lib/familyLogic';
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
  const ageInfo = calculateAge(person.birthDate, person.deathDate, person.isDeceased);
  const yearString = ageInfo.formattedLifeSpan;

  const getGenderColor = () => {
    if (person.gender === 'male') return '#8F6D35';
    if (person.gender === 'female') return '#B96F4B';
    return '#A79D8D';
  };

  const getRelativeBadgeStyle = () => {
    if (isFocus) {
      return {
        background: 'linear-gradient(135deg, #C6A15B 0%, #8F6D35 100%)',
        color: '#11100E',
        fontWeight: '700',
      };
    }
    switch (relativeInfo.category) {
      case 'parent':
        return { background: 'rgba(198, 161, 91, 0.15)', color: '#C6A15B', border: '1px solid rgba(198, 161, 91, 0.35)' };
      case 'child':
        return { background: 'rgba(126, 170, 131, 0.15)', color: '#7EAA83', border: '1px solid rgba(126, 170, 131, 0.35)' };
      case 'spouse':
        return { background: 'rgba(185, 111, 75, 0.15)', color: '#B96F4B', border: '1px solid rgba(185, 111, 75, 0.35)' };
      case 'sibling':
        return { background: 'rgba(215, 164, 90, 0.15)', color: '#D7A45A', border: '1px solid rgba(215, 164, 90, 0.35)' };
      case 'grandparent':
      case 'grandchild':
        return { background: 'rgba(198, 161, 91, 0.12)', color: '#F1E8D8', border: '1px solid rgba(198, 161, 91, 0.25)' };
      default:
        return { background: 'rgba(167, 157, 141, 0.1)', color: '#A79D8D', border: '1px solid rgba(167, 157, 141, 0.2)' };
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: 250,
        borderRadius: 12,
        background: isFocus
          ? 'var(--bg-card, #211D18)'
          : 'var(--bg-card, #191714)',
        border: isFocus
          ? '2px solid var(--antique-gold, #C6A15B)'
          : `2px solid ${isDeceased ? '#8F6D35' : 'var(--border-subtle, #35322F)'}`,
        padding: '12px 14px',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'default',
        backdropFilter: 'blur(8px)',
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={(e) => {
        e.preventDefault();
        try {
          const raw = e.dataTransfer.getData('application/json');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.personId && parsed.personId !== person.id && nodeData.onNodeDrop) {
              nodeData.onNodeDrop(parsed.personId, person.id);
            }
          }
        } catch {}
      }}
    >
      {/* Handles for Flow Connections */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          background: '#C6A15B',
          width: 8,
          height: 8,
          borderRadius: '50%',
          border: '2px solid #11100E',
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{
          background: '#8F6D35',
          width: 8,
          height: 8,
          borderRadius: '50%',
          border: '2px solid #11100E',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          background: '#B96F4B',
          width: 8,
          height: 8,
          borderRadius: '50%',
          border: '2px solid #11100E',
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          background: '#B96F4B',
          width: 8,
          height: 8,
          borderRadius: '50%',
          border: '2px solid #11100E',
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
            <span title="Data terverifikasi keluarga" style={{ color: 'var(--success, #7EAA83)', display: 'flex' }}>
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
            border: `2px solid ${isFocus ? 'var(--antique-gold, #C6A15B)' : getGenderColor()}`,
            flexShrink: 0,
            background: 'var(--bg-elevated, #211D18)',
            aspectRatio: '1 / 1',
            isolation: 'isolate',
            WebkitMaskImage: '-webkit-radial-gradient(white, black)',
            transform: 'translateZ(0)',
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
                display: 'block',
                transform: `scale(${Math.max(1, person.photoZoom || 1)}) translate(${person.photoOffsetX || 0}px, ${person.photoOffsetY || 0}px)`,
                transformOrigin: 'center center',
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
                color: 'var(--text-muted, #A79D8D)',
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
              color: isFocus ? 'var(--antique-gold, #C6A15B)' : 'var(--ivory, #F1E8D8)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '0.01em',
            }}
            title={person.fullName}
          >
            {person.displayName || person.fullName}
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted, #A79D8D)',
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
              color: 'rgba(167, 157, 141, 0.7)',
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
          borderTop: '1px solid var(--border-subtle, #393128)',
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
                background: 'rgba(198, 161, 91, 0.12)',
                color: 'var(--antique-gold, #C6A15B)',
                border: '1px solid rgba(198, 161, 91, 0.3)',
                padding: '4px 8px',
                borderRadius: 6,
                fontSize: 10.5,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Sparkles size={11} />
              Fokus
            </button>
          ) : (
            <span
              style={{
                color: 'var(--antique-gold, #C6A15B)',
                fontSize: 10.5,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              ⭐
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenProfile(person.id);
            }}
            title="Buka Lembar Profil Lengkap"
            style={{
              background: 'rgba(73, 55, 42, 0.3)',
              color: 'var(--ivory, #F1E8D8)',
              border: '1px solid rgba(57, 49, 40, 0.8)',
              padding: '4px 8px',
              borderRadius: 6,
              fontSize: 10.5,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
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
              nodeData.onToggleCollapse && nodeData.onToggleCollapse(person.id);
            }}
            title={isCollapsed ? 'Klik untuk tampilkan kembali cabang keturunan di bawah' : 'Klik untuk menyembunyikan (hide) cabang keturunan di bawah'}
            style={{
              background: isCollapsed ? 'rgba(185, 111, 75, 0.18)' : 'rgba(126, 170, 131, 0.15)',
              color: isCollapsed ? 'var(--terracotta, #B96F4B)' : 'var(--success, #7EAA83)',
              border: isCollapsed ? '1px solid rgba(185, 111, 75, 0.35)' : '1px solid rgba(126, 170, 131, 0.3)',
              padding: '3px 8px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
            }}
          >
            {isCollapsed ? (
              <>
                <span>🙈 +{childCount} Buka</span>
                <ChevronDown size={12} />
              </>
            ) : (
              <>
                <span>👁️ {childCount} Hide</span>
                <ChevronUp size={12} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export const PersonNode = memo(PersonNodeComponent);
