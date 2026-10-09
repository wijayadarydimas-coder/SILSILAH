export type UserRole = 'superadmin' | 'admin' | 'client';

export interface UserAccount {
  id: string;
  email: string;
  username?: string;
  displayName: string;
  role: UserRole;
  status: 'active' | 'deactivated';
  linkedPersonId?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  code: string;
  description: string;
  createdAt: string;
}

export type Gender = 'male' | 'female' | 'other' | 'unknown';

export type ParentageType = 'biological' | 'adoptive' | 'step' | 'guardian' | 'unknown';

export type ParentRole = 'father' | 'mother' | 'parent';

export type PartnershipType = 'married' | 'divorced' | 'partner' | 'other';

export interface Person {
  id: string;
  workspaceId: string;
  fullName: string;
  displayName?: string;
  gender: Gender;
  birthDate?: string; // YYYY-MM-DD or YYYY
  deathDate?: string;
  isDeceased: boolean;
  biography?: string;
  address?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  photoUrl?: string;
  photoZoom?: number;
  photoOffsetX?: number;
  photoOffsetY?: number;
  linkedUserId?: string;
  verificationStatus: 'verified' | 'unconfirmed';
  notes?: string;
}

export interface ParentChildRelationship {
  id: string;
  workspaceId: string;
  parentPersonId: string;
  childPersonId: string;
  parentRole: ParentRole;
  parentageType: ParentageType;
  notes?: string;
  verifiedStatus: 'verified' | 'unconfirmed';
}

export interface PartnershipRelationship {
  id: string;
  workspaceId: string;
  personAId: string;
  personBId: string;
  relationshipType: PartnershipType;
  startDate?: string;
  endDate?: string;
  status: 'current' | 'past';
  notes?: string;
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  actorUserId: string;
  actorName: string;
  actorRole: UserRole;
  action:
    | 'CREATE_PERSON'
    | 'UPDATE_PERSON'
    | 'DELETE_PERSON'
    | 'CREATE_PARENT_CHILD'
    | 'DELETE_PARENT_CHILD'
    | 'CREATE_PARTNERSHIP'
    | 'DELETE_PARTNERSHIP'
    | 'CHANGE_ROLE'
    | 'TOGGLE_USER_STATUS'
    | 'INVITE_USER'
    | 'UPDATE_WORKSPACE'
    | 'LINK_CLIENT';
  targetType: 'person' | 'relationship' | 'user' | 'workspace';
  targetId: string;
  timestamp: string;
  summary: string;
}

export interface Invitation {
  id: string;
  workspaceId: string;
  email: string;
  assignedRole: UserRole;
  invitedBy: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'expired';
}
