import {
  Person,
  ParentChildRelationship,
  PartnershipRelationship,
} from '@/types';
import { calculateGenerations, getRelativeRelationship, RelativeRelationInfo } from './familyLogic';
import { Node, Edge, MarkerType } from '@xyflow/react';

export interface PersonNodeData {
  person: Person;
  isFocus: boolean;
  relativeInfo: RelativeRelationInfo;
  parentCount: number;
  childCount: number;
  spouseCount: number;
  isCollapsed: boolean;
  onSelectFocus: (id: string) => void;
  onOpenProfile: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onNodeDrop?: (sourcePersonId: string, targetPersonId: string) => void;
  onAddRelative?: (id: string) => void;
  [key: string]: unknown;
}

export function buildTreeLayout({
  people,
  parentChildRelations,
  partnerships,
  focusPersonId,
  collapsedNodes,
  nuclearFamilyOnly = false,
  onSelectFocus,
  onOpenProfile,
  onToggleCollapse,
  onNodeDrop,
  onAddRelative,
}: {
  people: Person[];
  parentChildRelations: ParentChildRelationship[];
  partnerships: PartnershipRelationship[];
  focusPersonId: string;
  collapsedNodes: Set<string>;
  nuclearFamilyOnly?: boolean;
  onSelectFocus: (id: string) => void;
  onOpenProfile: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onNodeDrop?: (sourcePersonId: string, targetPersonId: string) => void;
  onAddRelative?: (id: string) => void;
}): { nodes: Node<PersonNodeData>[]; edges: Edge[] } {
  const peopleMap = new Map<string, Person>();
  people.forEach((p) => peopleMap.set(p.id, p));

  // Determine hidden nodes based on collapsed state:
  // If a node is collapsed, its descendants are hidden
  const hiddenNodeIds = new Set<string>();

  const getDescendants = (parentId: string, visited = new Set<string>()): string[] => {
    if (visited.has(parentId)) return [];
    visited.add(parentId);
    const directChildren = parentChildRelations
      .filter((r) => r.parentPersonId === parentId)
      .map((r) => r.childPersonId);

    let all: string[] = [...directChildren];
    for (const childId of directChildren) {
      all = all.concat(getDescendants(childId, visited));
    }
    return all;
  };

  collapsedNodes.forEach((collapsedId) => {
    const descendants = getDescendants(collapsedId);
    descendants.forEach((d) => hiddenNodeIds.add(d));
  });

  let visiblePeople = people.filter((p) => !hiddenNodeIds.has(p.id));

  // If nuclearFamilyOnly is enabled:
  // Keep only focus person, their parents, their partners, and their direct children!
  if (nuclearFamilyOnly && focusPersonId) {
    const nuclearSet = new Set<string>();
    nuclearSet.add(focusPersonId);

    // Parents
    parentChildRelations
      .filter((r) => r.childPersonId === focusPersonId)
      .forEach((r) => nuclearSet.add(r.parentPersonId));

    // Children
    parentChildRelations
      .filter((r) => r.parentPersonId === focusPersonId)
      .forEach((r) => nuclearSet.add(r.childPersonId));

    // Partners
    partnerships
      .filter((p) => p.personAId === focusPersonId || p.personBId === focusPersonId)
      .forEach((p) => {
        nuclearSet.add(p.personAId === focusPersonId ? p.personBId : p.personAId);
      });

    visiblePeople = visiblePeople.filter((p) => nuclearSet.has(p.id));
  }

  const visiblePersonIds = new Set(visiblePeople.map((p) => p.id));

  // Calculate generational levels
  const levels = calculateGenerations(visiblePeople, parentChildRelations, partnerships);

  // Group visible people by generation level
  const generationGroups = new Map<number, Person[]>();
  visiblePeople.forEach((p) => {
    const gen = levels.get(p.id) || 1;
    if (!generationGroups.has(gen)) {
      generationGroups.set(gen, []);
    }
    generationGroups.get(gen)!.push(p);
  });

  // Sort generations
  const sortedGens = Array.from(generationGroups.keys()).sort((a, b) => a - b);

  const NODE_WIDTH = 260;
  const NODE_GAP_X = 60;
  const LEVEL_GAP_Y = 260;
  const START_Y = 60;

  const positions = new Map<string, { x: number; y: number }>();

  // Process generation groups
  sortedGens.forEach((genIndex) => {
    const members = generationGroups.get(genIndex)!;
    const yPos = START_Y + (genIndex - 1) * LEVEL_GAP_Y;

    // Group spouses side-by-side
    const orderedMembers: Person[] = [];
    const placed = new Set<string>();

    members.forEach((person) => {
      if (placed.has(person.id)) return;

      orderedMembers.push(person);
      placed.add(person.id);

      // Find spouses in the same generation
      const spouseRels = partnerships.filter(
        (part) =>
          (part.personAId === person.id || part.personBId === person.id) &&
          visiblePersonIds.has(part.personAId === person.id ? part.personBId : part.personAId)
      );

      spouseRels.forEach((part) => {
        const spouseId = part.personAId === person.id ? part.personBId : part.personAId;
        const spouse = peopleMap.get(spouseId);
        if (spouse && !placed.has(spouse.id)) {
          orderedMembers.push(spouse);
          placed.add(spouse.id);
        }
      });
    });

    const totalWidth = orderedMembers.length * NODE_WIDTH + (orderedMembers.length - 1) * NODE_GAP_X;
    const startX = -totalWidth / 2;

    orderedMembers.forEach((person, idx) => {
      const xPos = startX + idx * (NODE_WIDTH + NODE_GAP_X);
      positions.set(person.id, { x: xPos, y: yPos });
    });
  });

  // Construct Nodes
  const nodes: Node<PersonNodeData>[] = visiblePeople.map((person) => {
    const isFocus = person.id === focusPersonId;
    const pos = positions.get(person.id) || { x: 0, y: 0 };
    const relativeInfo = getRelativeRelationship(
      person.id,
      focusPersonId,
      peopleMap,
      parentChildRelations,
      partnerships
    );

    const parentCount = parentChildRelations.filter((r) => r.childPersonId === person.id).length;
    const childCount = parentChildRelations.filter((r) => r.parentPersonId === person.id).length;
    const spouseCount = partnerships.filter((p) => p.personAId === person.id || p.personBId === person.id).length;

    return {
      id: person.id,
      type: 'personNode',
      position: pos,
      data: {
        person,
        isFocus,
        relativeInfo,
        parentCount,
        childCount,
        spouseCount,
        isCollapsed: collapsedNodes.has(person.id),
        onSelectFocus,
        onOpenProfile,
        onToggleCollapse,
        onNodeDrop,
        onAddRelative,
      },
    };
  });

  // Construct Edges
  const edges: Edge[] = [];

  // 1. Parent-Child Edges
  parentChildRelations.forEach((rel) => {
    if (!visiblePersonIds.has(rel.parentPersonId) || !visiblePersonIds.has(rel.childPersonId)) {
      return;
    }

    const isNonBio = rel.parentageType !== 'biological';
    const isParentFocus = rel.parentPersonId === focusPersonId;
    const isChildFocus = rel.childPersonId === focusPersonId;
    const isHighlighted = isParentFocus || isChildFocus;

    edges.push({
      id: `edge-pc-${rel.id}`,
      source: rel.parentPersonId,
      target: rel.childPersonId,
      sourceHandle: 'bottom',
      targetHandle: 'top',
      type: 'smoothstep',
      animated: isHighlighted,
      style: {
        stroke: isHighlighted ? '#10B981' : isNonBio ? '#94A3B8' : '#3B82F6',
        strokeWidth: isHighlighted ? 2.5 : 1.8,
        strokeDasharray: isNonBio ? '5,5' : undefined,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isHighlighted ? '#10B981' : isNonBio ? '#94A3B8' : '#3B82F6',
        width: 14,
        height: 14,
      },
      label: isNonBio ? rel.parentageType : undefined,
      labelStyle: { fill: '#94A3B8', fontSize: 11, fontWeight: 500 },
      labelBgStyle: { fill: '#1E293B', fillOpacity: 0.8 },
    });
  });

  // 2. Partnership (Marriage) Edges
  partnerships.forEach((part) => {
    if (!visiblePersonIds.has(part.personAId) || !visiblePersonIds.has(part.personBId)) {
      return;
    }

    const isFocusCouple = part.personAId === focusPersonId || part.personBId === focusPersonId;

    edges.push({
      id: `edge-part-${part.id}`,
      source: part.personAId,
      target: part.personBId,
      sourceHandle: 'right',
      targetHandle: 'left',
      type: 'straight',
      style: {
        stroke: isFocusCouple ? '#F43F5E' : '#E11D48',
        strokeWidth: 2,
        strokeDasharray: part.status === 'past' ? '4,4' : undefined,
      },
      label: part.status === 'past' ? 'Mantan' : '💍',
      labelStyle: { fill: '#FDA4AF', fontSize: 12 },
      labelBgStyle: { fill: '#1E293B', fillOpacity: 0.85 },
    });
  });

  return { nodes, edges };
}
