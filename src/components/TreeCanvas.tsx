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
}

const nodeTypes = {
  personNode: PersonNode,
};

function InnerTreeCanvas({ onOpenProfile, onAddRelation }: TreeCanvasProps) {
  const {
    people,
    parentChildRelations,
    partnerships,
    focusPersonId,
    collapsedNodes,
    setFocusPersonId,
  } = useFamilyStore();

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
      onSelectFocus: handleSelectFocus,
      onOpenProfile,
      onAddRelative: onAddRelation,
    });
  }, [
    people,
    parentChildRelations,
    partnerships,
    focusPersonId,
    collapsedNodes,
    handleSelectFocus,
    onOpenProfile,
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
          color="#1E293B"
        />
        <Controls
          showInteractive={false}
          style={{ bottom: 20, left: 20 }}
        />
        <MiniMap
          nodeColor={(n) => {
            if (n.id === focusPersonId) return '#F59E0B';
            return '#334155';
          }}
          maskColor="rgba(10, 14, 23, 0.7)"
          style={{ bottom: 20, right: 20, width: 140, height: 90 }}
        />
      </ReactFlow>

      {/* Floating Toolbar: Quick Navigation Controls */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(17, 24, 39, 0.85)',
          backdropFilter: 'blur(10px)',
          padding: '6px 12px',
          borderRadius: 999,
          border: '1px solid #1E293B',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          zIndex: 10,
        }}
      >
        <button
          onClick={handleCenterFocus}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: '#0F172A',
            padding: '5px 12px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
          }}
        >
          <Sparkles size={13} />
          Pusatkan ke Fokus
        </button>

        <button
          onClick={() => fitView({ padding: 0.2, duration: 600 })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: '#162035',
            color: '#F8FAFC',
            padding: '5px 10px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 500,
            border: '1px solid #334155',
          }}
        >
          <Maximize2 size={13} />
          Lihat Semua
        </button>
      </div>

      {/* Floating Canvas Legend */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          background: 'rgba(17, 24, 39, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '8px 12px',
          borderRadius: 10,
          border: '1px solid #1E293B',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontSize: 11,
          color: '#94A3B8',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 3, background: '#3B82F6', borderRadius: 2 }} />
          <span>Garis Orang Tua – Anak</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 3, background: '#F43F5E', borderRadius: 2 }} />
          <span>Garis Pernikahan / Pasangan</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
          <span>Titik Fokus (Label Dihitung Relatif)</span>
        </div>
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
