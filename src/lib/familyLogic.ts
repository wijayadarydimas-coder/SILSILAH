import {
  Person,
  ParentChildRelationship,
  PartnershipRelationship,
} from '@/types';

export interface RelativeRelationInfo {
  label: string;
  category: 'self' | 'parent' | 'child' | 'spouse' | 'sibling' | 'grandparent' | 'grandchild' | 'uncle_aunt' | 'nephew_niece' | 'in_law' | 'relative' | 'none';
  detail?: string;
}

/**
 * Validates whether adding a parent-child relationship (parentPersonId -> childPersonId)
 * would create a genealogical cycle (i.e. child is already an ancestor of parent).
 */
export function validateParentChildCycle(
  parentPersonId: string,
  childPersonId: string,
  parentChildRelations: ParentChildRelationship[]
): { valid: boolean; error?: string } {
  if (parentPersonId === childPersonId) {
    return { valid: false, error: 'Seseorang tidak dapat menjadi orang tua bagi dirinya sendiri.' };
  }

  // Check if childPersonId is already an ancestor of parentPersonId
  const visited = new Set<string>();
  const queue: string[] = [parentPersonId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === childPersonId) {
      return {
        valid: false,
        error: 'Siklus silsilah terdeteksi: Orang tersebut sudah merupakan leluhur dari orang tua yang dipilih.',
      };
    }
    visited.add(current);

    // Find all parents of current
    const parents = parentChildRelations
      .filter((r) => r.childPersonId === current)
      .map((r) => r.parentPersonId);

    for (const p of parents) {
      if (!visited.has(p)) {
        queue.push(p);
      }
    }
  }

  return { valid: true };
}

/**
 * Calculates relationship label relative to the current focus person.
 * Examples: Ayah, Ibu, Anak, Pasangan, Kakek, Cucu, Saudara Kandung, dll.
 */
export function getRelativeRelationship(
  targetPersonId: string,
  focusPersonId: string,
  people: Map<string, Person>,
  parentChildRelations: ParentChildRelationship[],
  partnerships: PartnershipRelationship[]
): RelativeRelationInfo {
  if (!focusPersonId || !targetPersonId) {
    return { label: 'Kerabat', category: 'none' };
  }

  if (targetPersonId === focusPersonId) {
    return { label: 'Titik Fokus', category: 'self' };
  }

  const target = people.get(targetPersonId);
  const focus = people.get(focusPersonId);
  const targetGender = target?.gender;

  // 1. Direct Parent of Focus?
  const parentOfFocus = parentChildRelations.find(
    (r) => r.childPersonId === focusPersonId && r.parentPersonId === targetPersonId
  );
  if (parentOfFocus) {
    if (parentOfFocus.parentRole === 'father' || targetGender === 'male') {
      return { label: 'Ayah', category: 'parent', detail: parentOfFocus.parentageType !== 'biological' ? `(${parentOfFocus.parentageType})` : undefined };
    }
    if (parentOfFocus.parentRole === 'mother' || targetGender === 'female') {
      return { label: 'Ibu', category: 'parent', detail: parentOfFocus.parentageType !== 'biological' ? `(${parentOfFocus.parentageType})` : undefined };
    }
    return { label: 'Orang Tua', category: 'parent' };
  }

  // 2. Direct Child of Focus?
  const childOfFocus = parentChildRelations.find(
    (r) => r.parentPersonId === focusPersonId && r.childPersonId === targetPersonId
  );
  if (childOfFocus) {
    if (targetGender === 'male') return { label: 'Anak Laki-laki', category: 'child' };
    if (targetGender === 'female') return { label: 'Anak Perempuan', category: 'child' };
    return { label: 'Anak', category: 'child' };
  }

  // 3. Spouse / Partner of Focus?
  const isSpouse = partnerships.find(
    (p) =>
      (p.personAId === focusPersonId && p.personBId === targetPersonId) ||
      (p.personBId === focusPersonId && p.personAId === targetPersonId)
  );
  if (isSpouse) {
    if (targetGender === 'male') return { label: 'Suami', category: 'spouse', detail: isSpouse.status === 'past' ? '(Mantan)' : undefined };
    if (targetGender === 'female') return { label: 'Istri', category: 'spouse', detail: isSpouse.status === 'past' ? '(Mantan)' : undefined };
    return { label: 'Pasangan', category: 'spouse', detail: isSpouse.status === 'past' ? '(Mantan)' : undefined };
  }

  // Parents of focus
  const focusParents = parentChildRelations
    .filter((r) => r.childPersonId === focusPersonId)
    .map((r) => r.parentPersonId);

  // 4. Sibling (shares at least one parent with focus)?
  if (focusParents.length > 0) {
    const targetParents = parentChildRelations
      .filter((r) => r.childPersonId === targetPersonId)
      .map((r) => r.parentPersonId);

    const sharedParents = focusParents.filter((p) => targetParents.includes(p));
    if (sharedParents.length > 0) {
      const isFull = sharedParents.length >= 2 || (focusParents.length === 1 && targetParents.length === 1);
      
      // Determine Kakak or Adik if birthDate is known
      let siblingPrefix = 'Saudara';
      if (focus?.birthDate && target?.birthDate) {
        if (target.birthDate < focus.birthDate) {
          siblingPrefix = targetGender === 'male' ? 'Kakak Laki-laki' : targetGender === 'female' ? 'Kakak Perempuan' : 'Kakak';
        } else if (target.birthDate > focus.birthDate) {
          siblingPrefix = targetGender === 'male' ? 'Adik Laki-laki' : targetGender === 'female' ? 'Adik Perempuan' : 'Adik';
        }
      } else {
        siblingPrefix = targetGender === 'male' ? 'Saudara Laki-laki' : targetGender === 'female' ? 'Saudari Perempuan' : 'Saudara';
      }

      return {
        label: siblingPrefix,
        category: 'sibling',
        detail: isFull ? 'Kandung' : 'Tiri/Sebapak/Seibu',
      };
    }
  }

  // 5. Grandparents of Focus (Parent of Focus's Parent)?
  for (const fpId of focusParents) {
    const grandParentRel = parentChildRelations.find(
      (r) => r.childPersonId === fpId && r.parentPersonId === targetPersonId
    );
    if (grandParentRel) {
      if (grandParentRel.parentRole === 'father' || targetGender === 'male') {
        return { label: 'Kakek', category: 'grandparent' };
      }
      if (grandParentRel.parentRole === 'mother' || targetGender === 'female') {
        return { label: 'Nenek', category: 'grandparent' };
      }
      return { label: 'Kakek/Nenek', category: 'grandparent' };
    }
  }

  // 6. Grandchild of Focus (Child of Focus's Child)?
  const focusChildren = parentChildRelations
    .filter((r) => r.parentPersonId === focusPersonId)
    .map((r) => r.childPersonId);

  for (const fcId of focusChildren) {
    const isGrandChild = parentChildRelations.find(
      (r) => r.parentPersonId === fcId && r.childPersonId === targetPersonId
    );
    if (isGrandChild) {
      return { label: 'Cucu', category: 'grandchild' };
    }
  }

  // 7. Uncle / Aunt (Sibling of Focus's Parent)?
  for (const fpId of focusParents) {
    const grandParents = parentChildRelations
      .filter((r) => r.childPersonId === fpId)
      .map((r) => r.parentPersonId);

    const targetParents = parentChildRelations
      .filter((r) => r.childPersonId === targetPersonId)
      .map((r) => r.parentPersonId);

    const commonAncestors = grandParents.filter((gp) => targetParents.includes(gp));
    if (commonAncestors.length > 0 && targetPersonId !== fpId) {
      return {
        label: targetGender === 'female' ? 'Bibi (Tante)' : targetGender === 'male' ? 'Paman (Om)' : 'Paman/Bibi',
        category: 'uncle_aunt',
      };
    }
  }

  // 8. Nephew / Niece (Child of Sibling)?
  for (const fpId of focusParents) {
    const siblings = parentChildRelations
      .filter((r) => r.parentPersonId === fpId && r.childPersonId !== focusPersonId)
      .map((r) => r.childPersonId);

    for (const sibId of siblings) {
      const isNiece = parentChildRelations.find(
        (r) => r.parentPersonId === sibId && r.childPersonId === targetPersonId
      );
      if (isNiece) {
        return {
          label: targetGender === 'female' ? 'Keponakan Perempuan' : targetGender === 'male' ? 'Keponakan Laki-laki' : 'Keponakan',
          category: 'nephew_niece',
        };
      }
    }
  }

  // 9. In-laws (Mertua / Menantu)?
  // Mertua: Parents of focus's spouse
  const focusSpouseIds = partnerships
    .filter((p) => p.personAId === focusPersonId || p.personBId === focusPersonId)
    .map((p) => (p.personAId === focusPersonId ? p.personBId : p.personAId));

  for (const spId of focusSpouseIds) {
    const isSpouseParent = parentChildRelations.find(
      (r) => r.childPersonId === spId && r.parentPersonId === targetPersonId
    );
    if (isSpouseParent) {
      return {
        label: targetGender === 'female' ? 'Ibu Mertua' : targetGender === 'male' ? 'Ayah Mertua' : 'Mertua',
        category: 'in_law',
      };
    }
  }

  // Menantu: Spouse of focus's child
  for (const fcId of focusChildren) {
    const isChildSpouse = partnerships.find(
      (p) =>
        (p.personAId === fcId && p.personBId === targetPersonId) ||
        (p.personBId === fcId && p.personAId === targetPersonId)
    );
    if (isChildSpouse) {
      return { label: 'Menantu', category: 'in_law' };
    }
  }

  // Default fallback
  return { label: 'Kerabat Keluarga', category: 'relative' };
}

/**
 * Calculates generational level for each person in the tree.
 * Roots (people with no parents in workspace) have level 0.
 * Children have level = max(parents.level) + 1.
 * Spouses have the same level.
 */
export function calculateGenerations(
  people: Person[],
  parentChildRelations: ParentChildRelationship[],
  partnerships: PartnershipRelationship[]
): Map<string, number> {
  const levels = new Map<string, number>();
  const childrenMap = new Map<string, string[]>();
  const parentsMap = new Map<string, string[]>();

  people.forEach((p) => {
    childrenMap.set(p.id, []);
    parentsMap.set(p.id, []);
  });

  parentChildRelations.forEach((r) => {
    if (childrenMap.has(r.parentPersonId)) {
      childrenMap.get(r.parentPersonId)!.push(r.childPersonId);
    }
    if (parentsMap.has(r.childPersonId)) {
      parentsMap.get(r.childPersonId)!.push(r.parentPersonId);
    }
  });

  // Find root nodes (no parents in dataset)
  const roots = people.filter((p) => (parentsMap.get(p.id) || []).length === 0);

  // BFS Queue to assign levels
  const queue: { id: string; level: number }[] = roots.map((r) => ({ id: r.id, level: 1 }));

  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    const currentLevel = levels.get(id);

    if (currentLevel === undefined || level > currentLevel) {
      levels.set(id, level);

      // Match spouses to same level
      partnerships.forEach((p) => {
        let spouseId: string | null = null;
        if (p.personAId === id) spouseId = p.personBId;
        if (p.personBId === id) spouseId = p.personAId;
        if (spouseId && (!levels.has(spouseId) || levels.get(spouseId)! < level)) {
          levels.set(spouseId, level);
        }
      });

      // Propagate to children
      const children = childrenMap.get(id) || [];
      for (const childId of children) {
        queue.push({ id: childId, level: level + 1 });
      }
    }
  }

  // Ensure all remaining unassigned persons get a default level
  people.forEach((p) => {
    if (!levels.has(p.id)) {
      levels.set(p.id, 1);
    }
  });

  return levels;
}
