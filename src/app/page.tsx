'use client';

import React, { useState } from 'react';
import { FamilyStoreProvider, useFamilyStore } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { TreeCanvas } from '@/components/TreeCanvas';
import { FamilyListView } from '@/components/FamilyListView';
import { ProfileDrawer } from '@/components/ProfileDrawer';
import { MemberModal } from '@/components/MemberModal';
import { RelationModal } from '@/components/RelationModal';
import { AccountManagementModal } from '@/components/AccountManagementModal';
import { AuditLogDrawer } from '@/components/AuditLogDrawer';

function SilsilahDashboard() {
  const [viewMode, setViewMode] = useState<'canvas' | 'list'>('canvas');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Modal states
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editPersonId, setEditPersonId] = useState<string | null>(null);

  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
  const [relationPersonId, setRelationPersonId] = useState<string | null>(null);

  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [isAccountMgmtOpen, setIsAccountMgmtOpen] = useState(false);

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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: '#0A0E17',
      }}
    >
      {/* Top Navbar */}
      <Navbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAddMember={handleOpenAddMember}
        onOpenAuditLog={() => setIsAuditLogOpen(true)}
        onOpenAccountMgmt={() => setIsAccountMgmtOpen(true)}
        onOpenProfile={(id) => setSelectedProfileId(id)}
      />

      {/* Main View Area */}
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {viewMode === 'canvas' ? (
          <TreeCanvas
            onOpenProfile={(id) => setSelectedProfileId(id)}
            onAddRelation={handleOpenAddRelation}
          />
        ) : (
          <FamilyListView
            onOpenProfile={(id) => setSelectedProfileId(id)}
          />
        )}
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

      {/* Member Add/Edit Modal */}
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
    </div>
  );
}

export default function HomePage() {
  return (
    <FamilyStoreProvider>
      <SilsilahDashboard />
    </FamilyStoreProvider>
  );
}
