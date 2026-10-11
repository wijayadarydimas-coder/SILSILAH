'use client';

import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
} from '@xyflow/react';
import { useFamilyStore } from '@/lib/store';
import { buildTreeLayout } from '@/lib/treeLayout';
import { PersonNode } from './PersonNode';
import { Sparkles, Maximize2, ZoomIn, ZoomOut, Compass, Info } from 'lucide-react';

interface TreeCanvasProps {
  onOpenProfile: (id: string) => void;
  onAddRelation: (id: string) => void;
  onNodeDrop?: (sourcePersonId: string, targetPersonId: string) => void;
}

const nodeTypes = {
  personNode: PersonNode,
};

function InnerTreeCanvas({ onOpenProfile, onAddRelation, onNodeDrop }: TreeCanvasProps) {
  const {
    people,
    parentChildRelations,
    partnerships,
    focusPersonId,
    collapsedNodes,
    setFocusPersonId,
    toggleCollapseNode,
  } = useFamilyStore();

  const [nuclearFamilyOnly, setNuclearFamilyOnly] = React.useState(false);
  const [isLegendOpen, setIsLegendOpen] = React.useState(false);
  const { fitView, setCenter } = useReactFlow();

  const handleSelectFocus = useCallback(
    (id: string) => {
      setFocusPersonId(id);
    },
    [setFocusPersonId]
  );

  const { nodes, edges } = useMemo(() => {
    return buildTreeLayout({
      people,
      parentChildRelations,
      partnerships,
      focusPersonId,
      collapsedNodes,
      nuclearFamilyOnly,
      onSelectFocus: handleSelectFocus,
      onOpenProfile,
      onToggleCollapse: toggleCollapseNode,
      onNodeDrop,
      onAddRelative: onAddRelation,
    });
  }, [
    people,
    parentChildRelations,
    partnerships,
    focusPersonId,
    collapsedNodes,
    nuclearFamilyOnly,
    handleSelectFocus,
    onOpenProfile,
    toggleCollapseNode,
    onNodeDrop,
    onAddRelation,
  ]);

  const handleCenterFocus = () => {
    const focusNode = nodes.find((n) => n.id === focusPersonId);
    if (focusNode) {
      setCenter(focusNode.position.x + 125, focusNode.position.y + 70, {
        zoom: 1.1,
        duration: 800,
      });
    } else {
      fitView({ padding: 0.2, duration: 600 });
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.8}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="var(--border-subtle, #393128)"
        />
        <Controls
          showInteractive={false}
          style={{ bottom: 20, left: 20 }}
        />
        <MiniMap
          nodeColor={(n) => {
            if (n.id === focusPersonId) return '#C6A15B';
            return '#393128';
          }}
          maskColor="rgba(17, 16, 14, 0.75)"
          style={{
            bottom: 20,
            right: 20,
            width: 140,
            height: 90,
            background: 'var(--bg-elevated, #211D18)',
            border: '1px solid var(--border-subtle, #393128)',
            borderRadius: 8,
          }}
        />
      </ReactFlow>

      {/* Floating Toolbar: Quick Navigation Controls */}
      <div
        className="toolbar-canvas-responsive"
        style={{
          position: 'absolute',
          top: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--bg-card, #211D18)',
          backdropFilter: 'blur(10px)',
          padding: '5px 10px',
          borderRadius: 999,
          border: '1px solid var(--border-subtle, #393128)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
          zIndex: 10,
          whiteSpace: 'nowrap',
        }}
      >
        <button
          onClick={handleCenterFocus}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'linear-gradient(135deg, #C6A15B 0%, #8F6D35 100%)',
            color: '#11100E',
            padding: '5px 12px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
          }}
        >
          <Sparkles size={13} />
          <span className="hide-on-mobile">Fokus</span>
          <span className="show-on-mobile">Fokus</span>
        </button>

        <button
          onClick={() => {
            setNuclearFamilyOnly(!nuclearFamilyOnly);
            setTimeout(() => fitView({ padding: 0.2, duration: 600 }), 100);
          }}
          title={nuclearFamilyOnly ? 'Klik untuk menampilkan seluruh silsilah keluarga besar' : 'Klik untuk fokus hanya pada keluarga inti (orang tua, pasangan, anak) dari titik fokus'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: nuclearFamilyOnly ? 'var(--antique-gold, #C6A15B)' : 'var(--bg-menu, #191714)',
            color: nuclearFamilyOnly ? '#11100E' : 'var(--ivory, #F1E8D8)',
            padding: '5px 11px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            border: nuclearFamilyOnly ? 'none' : '1px solid var(--border-subtle, #393128)',
            cursor: 'pointer',
          }}
        >
          <span className="hide-on-mobile">{nuclearFamilyOnly ? '🌐 Semua' : '🏠 Inti'}</span>
          <span className="show-on-mobile">{nuclearFamilyOnly ? '🌐 Semua' : '🏠 Inti'}</span>
        </button>

        <button
          onClick={() => fitView({ padding: 0.2, duration: 600 })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'var(--bg-menu, #191714)',
            color: 'var(--ivory, #F1E8D8)',
            padding: '5px 10px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 500,
            border: '1px solid var(--border-subtle, #393128)',
            cursor: 'pointer',
          }}
        >
          <Maximize2 size={13} />
          <span className="hide-on-mobile">Lihat Semua</span>
          <span className="show-on-mobile">Fit</span>
        </button>
      </div>

      {/* Floating Canvas Legend - Desktop */}
      <div
        className="hide-on-mobile"
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          background: 'var(--bg-card, #211D18)',
          backdropFilter: 'blur(8px)',
          padding: '8px 12px',
          borderRadius: 10,
          border: '1px solid var(--border-subtle, #393128)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontSize: 11,
          color: 'var(--text-muted, #A79D8D)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 3, background: 'var(--antique-gold, #C6A15B)', borderRadius: 2 }} />
          <span>Garis Orang Tua – Anak</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 3, background: 'var(--terracotta, #B96F4B)', borderRadius: 2 }} />
          <span>Garis Pernikahan / Pasangan</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--antique-gold, #C6A15B)' }} />
          <span>Titik Fokus (Label Relatif)</span>
        </div>
      </div>

      {/* Floating Canvas Legend - Mobile Toggle */}
      <div
        className="show-on-mobile"
        style={{
          position: 'absolute',
          bottom: 14,
          right: 14,
          zIndex: 15,
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 6,
        }}
      >
        {isLegendOpen && (
          <div
            style={{
              background: 'var(--bg-card, #211D18)',
              backdropFilter: 'blur(10px)',
              padding: '8px 12px',
              borderRadius: 10,
              border: '1px solid var(--border-subtle, #393128)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: 11,
              color: 'var(--text-muted, #A79D8D)',
              marginBottom: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 3, background: 'var(--antique-gold, #C6A15B)', borderRadius: 2 }} />
              <span>Orang Tua – Anak</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 3, background: 'var(--terracotta, #B96F4B)', borderRadius: 2 }} />
              <span>Pernikahan / Pasangan</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--antique-gold, #C6A15B)' }} />
              <span>Titik Fokus</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 10px',
            borderRadius: 999,
            background: 'var(--bg-menu, #191714)',
            border: '1px solid var(--border-subtle, #393128)',
            color: 'var(--text-muted, #A79D8D)',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          <Info size={12} />
          <span>Keterangan</span>
        </button>
      </div>
    </div>
  );
}

export function TreeCanvas(props: TreeCanvasProps) {
  return (
    <ReactFlowProvider>
      <InnerTreeCanvas {...props} />
    </ReactFlowProvider>
  );
}
