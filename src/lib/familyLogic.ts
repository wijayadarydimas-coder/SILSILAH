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

export interface AgeCalculationResult {
  birthYear: string;
  deathYear: string;
  age?: number;
  ageText: string;
  formattedLifeSpan: string;
}

/**
 * Calculates accurate age and formatted life span string (e.g. "2001 – sekarang (25 thn)")
 */
export function calculateAge(
  birthDate?: string,
  deathDate?: string,
  isDeceased?: boolean
): AgeCalculationResult {
  const isDec = Boolean(isDeceased);

  if (!birthDate || !birthDate.trim()) {
    const dYear = deathDate ? deathDate.trim().split(/[-/]/)[0] : '';
    const endStr = dYear || (isDec ? 'Wafat' : 'sekarang');
    return {
      birthYear: '?',
      deathYear: dYear || (isDec ? 'Wafat' : ''),
      ageText: '',
      formattedLifeSpan: isDec ? `? – ${endStr}` : '? – sekarang',
    };
  }

  const birthParts = birthDate.trim().split(/[-/]/);
  const bYear = parseInt(birthParts[0], 10);
  if (isNaN(bYear)) {
    const dYear = deathDate ? deathDate.trim().split(/[-/]/)[0] : '';
    return {
      birthYear: '?',
      deathYear: dYear || (isDec ? 'Wafat' : ''),
      ageText: '',
      formattedLifeSpan: isDec ? `? – ${dYear || 'Wafat'}` : '? – sekarang',
    };
  }

  const bMonth = birthParts.length > 1 ? parseInt(birthParts[1], 10) : undefined;
  const bDay = birthParts.length > 2 ? parseInt(birthParts[2], 10) : undefined;

  let targetYear: number;
  let targetMonth: number | undefined;
  let targetDay: number | undefined;
  let dYearStr = '';

  if (isDec) {
    if (deathDate && deathDate.trim()) {
      const dParts = deathDate.trim().split(/[-/]/);
      targetYear = parseInt(dParts[0], 10);
      dYearStr = isNaN(targetYear) ? 'Wafat' : String(targetYear);
      targetMonth = dParts.length > 1 ? parseInt(dParts[1], 10) : undefined;
      targetDay = dParts.length > 2 ? parseInt(dParts[2], 10) : undefined;
    } else {
      targetYear = bYear;
      dYearStr = 'Wafat';
    }
  } else {
    const now = new Date();
    targetYear = now.getFullYear();
    targetMonth = now.getMonth() + 1;
    targetDay = now.getDate();
  }

  let age: number | undefined = undefined;
  if (!isNaN(targetYear) && targetYear >= bYear) {
    age = targetYear - bYear;
    if (bMonth && bDay && targetMonth && targetDay) {
      if (targetMonth < bMonth || (targetMonth === bMonth && targetDay < bDay)) {
        age = Math.max(0, age - 1);
      }
    }
  }

  const birthYearStr = String(bYear);

  if (isDec) {
    const endStr = dYearStr || 'Wafat';
    const ageText = age !== undefined ? `(wafat usia ${age} thn)` : '';
    const formattedLifeSpan = `${birthYearStr} – ${endStr}${ageText ? ' ' + ageText : ''}`;
    return {
      birthYear: birthYearStr,
      deathYear: endStr,
      age,
      ageText,
      formattedLifeSpan,
    };
  } else {
    const ageText = age !== undefined ? `(${age} thn)` : '';
    const formattedLifeSpan = `${birthYearStr} – sekarang${ageText ? ' ' + ageText : ''}`;
    return {
      birthYear: birthYearStr,
      deathYear: '',
      age,
      ageText,
      formattedLifeSpan,
    };
  }
}

/**
 * Format phone to direct WhatsApp link (wa.me)
 */
export function formatWhatsAppUrl(phone?: string, defaultCountryCode: string = '+62'): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  let cleaned = trimmed.replace(/[^0-9+]/g, '');
  if (!cleaned) return '';

  const countryDial = defaultCountryCode.replace(/[^0-9]/g, '') || '62';

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  } else if (cleaned.startsWith('0')) {
    cleaned = countryDial + cleaned.slice(1);
  } else if (!cleaned.startsWith(countryDial)) {
    cleaned = countryDial + cleaned;
  }

  return `https://wa.me/${cleaned}`;
}

/**
 * Format Instagram handle/URL to full clickable link
 */
export function formatInstagramUrl(handle?: string): string {
  if (!handle) return '';
  const trimmed = handle.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const cleanHandle = trimmed.replace(/^@+/, '');
  return `https://instagram.com/${cleanHandle}`;
}

/**
 * Format address/location to Google Maps search link
 */
export function formatGoogleMapsUrl(location?: string): string {
  if (!location) return '';
  const trimmed = location.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

export interface CountryCodeItem {
  code: string;
  country: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCodeItem[] = [
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+65', country: 'Singapura', flag: '🇸🇬' },
  { code: '+966', country: 'Arab Saudi', flag: '🇸🇦' },
  { code: '+1', country: 'Amerika Serikat / Kanada', flag: '🇺🇸' },
  { code: '+44', country: 'Inggris', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+81', country: 'Jepang', flag: '🇯🇵' },
  { code: '+82', country: 'Korea Selatan', flag: '🇰🇷' },
  { code: '+971', country: 'Uni Emirat Arab', flag: '🇦🇪' },
  { code: '+20', country: 'Mesir', flag: '🇪🇬' },
  { code: '+90', country: 'Turki', flag: '🇹🇷' },
  { code: '+49', country: 'Jerman', flag: '🇩🇪' },
  { code: '+31', country: 'Belanda', flag: '🇳🇱' },
  { code: '+33', country: 'Prancis', flag: '🇫🇷' },
  { code: '+86', country: 'Tiongkok', flag: '🇨🇳' },
  { code: '+64', country: 'Selandia Baru', flag: '🇳🇿' },
];

export const INDONESIAN_CITIES: string[] = [
  'DKI Jakarta',
  'Jakarta Selatan, DKI Jakarta',
  'Jakarta Timur, DKI Jakarta',
  'Jakarta Barat, DKI Jakarta',
  'Jakarta Utara, DKI Jakarta',
  'Jakarta Pusat, DKI Jakarta',
  'Surabaya, Jawa Timur',
  'Bandung, Jawa Barat',
  'Medan, Sumatera Utara',
  'Semarang, Jawa Tengah',
  'Makassar, Sulawesi Selatan',
  'Palembang, Sumatera Selatan',
  'Tangerang, Banten',
  'Tangerang Selatan, Banten',
  'Depok, Jawa Barat',
  'Bekasi, Jawa Barat',
  'Bogor, Jawa Barat',
  'Yogyakarta, DI Yogyakarta',
  'Sleman, DI Yogyakarta',
  'Bantul, DI Yogyakarta',
  'Surakarta (Solo), Jawa Tengah',
  'Malang, Jawa Timur',
  'Sidoarjo, Jawa Timur',
  'Denpasar, Bali',
  'Badung, Bali',
  'Padang, Sumatera Barat',
  'Pekanbaru, Riau',
  'Batam, Kepulauan Riau',
  'Bandar Lampung, Lampung',
  'Banjarmasin, Kalimantan Selatan',
  'Balikpapan, Kalimantan Timur',
  'Samarinda, Kalimantan Timur',
  'Pontianak, Kalimantan Barat',
  'Manado, Sulawesi Utara',
  'Mataram, Nusa Tenggara Barat',
  'Kupang, Nusa Tenggara Timur',
  'Ambon, Maluku',
  'Jayapura, Papua',
  'Banda Aceh, Aceh',
  'Jambi, Jambi',
  'Bengkulu, Bengkulu',
  'Pangkalpinang, Bangka Belitung',
  'Palu, Sulawesi Tengah',
  'Kendari, Sulawesi Tenggara',
  'Gorontalo, Gorontalo',
  'Mamuju, Sulawesi Barat',
  'Sorong, Papua Barat Daya',
  'Luar Negeri (Internasional)',
];

export interface LocationSuggestion {
  title: string;
  subtitle: string;
  fullText: string;
}

export const INDONESIAN_LOCATION_SAMPLES: LocationSuggestion[] = [
  { title: 'Ketabang', subtitle: 'Kec. Genteng, Kota Surabaya, Jawa Timur', fullText: 'Kelurahan Ketabang, Kec. Genteng, Kota Surabaya, Jawa Timur' },
  { title: 'Gubeng', subtitle: 'Kec. Gubeng, Kota Surabaya, Jawa Timur', fullText: 'Kelurahan Gubeng, Kec. Gubeng, Kota Surabaya, Jawa Timur' },
  { title: 'Wonokromo', subtitle: 'Kec. Wonokromo, Kota Surabaya, Jawa Timur', fullText: 'Kelurahan Wonokromo, Kec. Wonokromo, Kota Surabaya, Jawa Timur' },
  { title: 'Rungkut Kidul', subtitle: 'Kec. Rungkut, Kota Surabaya, Jawa Timur', fullText: 'Kelurahan Rungkut Kidul, Kec. Rungkut, Kota Surabaya, Jawa Timur' },
  { title: 'Klojen', subtitle: 'Kec. Klojen, Kota Malang, Jawa Timur', fullText: 'Kelurahan Klojen, Kec. Klojen, Kota Malang, Jawa Timur' },
  { title: 'Lowokwaru', subtitle: 'Kec. Lowokwaru, Kota Malang, Jawa Timur', fullText: 'Kelurahan Lowokwaru, Kec. Lowokwaru, Kota Malang, Jawa Timur' },
  { title: 'Puri', subtitle: 'Kec. Puri, Kab. Mojokerto, Jawa Timur', fullText: 'Desa Puri, Kec. Puri, Kab. Mojokerto, Jawa Timur' },
  { title: 'Candi', subtitle: 'Kec. Candi, Kab. Sidoarjo, Jawa Timur', fullText: 'Desa Candi, Kec. Candi, Kab. Sidoarjo, Jawa Timur' },
  { title: 'Menteng', subtitle: 'Kec. Menteng, Jakarta Pusat, DKI Jakarta', fullText: 'Kelurahan Menteng, Kec. Menteng, Jakarta Pusat, DKI Jakarta' },
  { title: 'Kebayoran Baru', subtitle: 'Kec. Kebayoran Baru, Jakarta Selatan, DKI Jakarta', fullText: 'Kelurahan Kebayoran Baru, Kec. Kebayoran Baru, Jakarta Selatan, DKI Jakarta' },
  { title: 'Tebet', subtitle: 'Kec. Tebet, Jakarta Selatan, DKI Jakarta', fullText: 'Kelurahan Tebet Barat, Kec. Tebet, Jakarta Selatan, DKI Jakarta' },
  { title: 'Cilandak', subtitle: 'Kec. Cilandak, Jakarta Selatan, DKI Jakarta', fullText: 'Kelurahan Cilandak Barat, Kec. Cilandak, Jakarta Selatan, DKI Jakarta' },
  { title: 'Kelapa Gading', subtitle: 'Kec. Kelapa Gading, Jakarta Utara, DKI Jakarta', fullText: 'Kelurahan Kelapa Gading Timur, Kec. Kelapa Gading, Jakarta Utara, DKI Jakarta' },
  { title: 'Dago', subtitle: 'Kec. Coblong, Kota Bandung, Jawa Barat', fullText: 'Kelurahan Dago, Kec. Coblong, Kota Bandung, Jawa Barat' },
  { title: 'Braga', subtitle: 'Kec. Sumur Bandung, Kota Bandung, Jawa Barat', fullText: 'Kelurahan Braga, Kec. Sumur Bandung, Kota Bandung, Jawa Barat' },
  { title: 'Cibinong', subtitle: 'Kec. Cibinong, Kab. Bogor, Jawa Barat', fullText: 'Kelurahan Cibinong, Kec. Cibinong, Kab. Bogor, Jawa Barat' },
  { title: 'Beji', subtitle: 'Kec. Beji, Kota Depok, Jawa Barat', fullText: 'Kelurahan Beji, Kec. Beji, Kota Depok, Jawa Barat' },
  { title: 'Bumi Serpong Damai (BSD)', subtitle: 'Kec. Serpong, Kota Tangerang Selatan, Banten', fullText: 'BSD City, Kec. Serpong, Kota Tangerang Selatan, Banten' },
  { title: 'Banjarsari', subtitle: 'Kec. Banjarsari, Kota Surakarta (Solo), Jawa Tengah', fullText: 'Kelurahan Banjarsari, Kec. Banjarsari, Kota Surakarta (Solo), Jawa Tengah' },
  { title: 'Candisari', subtitle: 'Kec. Candisari, Kota Semarang, Jawa Tengah', fullText: 'Kelurahan Candisari, Kec. Candisari, Kota Semarang, Jawa Tengah' },
  { title: 'Malioboro', subtitle: 'Kec. Danurejan, Kota Yogyakarta, DI Yogyakarta', fullText: 'Kawasan Malioboro, Kec. Danurejan, Kota Yogyakarta, DI Yogyakarta' },
  { title: 'Kuta', subtitle: 'Kec. Kuta, Kab. Badung, Bali', fullText: 'Kelurahan Kuta, Kec. Kuta, Kab. Badung, Bali' },
  { title: 'Sanur', subtitle: 'Kec. Denpasar Selatan, Kota Denpasar, Bali', fullText: 'Kelurahan Sanur, Kec. Denpasar Selatan, Kota Denpasar, Bali' },
  { title: 'Ubud', subtitle: 'Kec. Ubud, Kab. Gianyar, Bali', fullText: 'Desa Ubud, Kec. Ubud, Kab. Gianyar, Bali' },
  { title: 'Medan Baru', subtitle: 'Kec. Medan Baru, Kota Medan, Sumatera Utara', fullText: 'Kec. Medan Baru, Kota Medan, Sumatera Utara' },
  { title: 'Ilir Barat', subtitle: 'Kec. Ilir Barat I, Kota Palembang, Sumatera Selatan', fullText: 'Kec. Ilir Barat I, Kota Palembang, Sumatera Selatan' },
  { title: 'Panakkukang', subtitle: 'Kec. Panakkukang, Kota Makassar, Sulawesi Selatan', fullText: 'Kec. Panakkukang, Kota Makassar, Sulawesi Selatan' },
  { title: 'Balikpapan Selatan', subtitle: 'Kec. Balikpapan Selatan, Kota Balikpapan, Kalimantan Timur', fullText: 'Kec. Balikpapan Selatan, Kota Balikpapan, Kalimantan Timur' },
];

export async function searchIndonesianLocations(queryStr: string): Promise<LocationSuggestion[]> {
  const q = queryStr.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  const results: LocationSuggestion[] = [];
  const seen = new Set<string>();

  // 1. Check local dataset first for instant responsiveness
  INDONESIAN_LOCATION_SAMPLES.forEach((loc) => {
    if (
      loc.title.toLowerCase().includes(q) ||
      loc.subtitle.toLowerCase().includes(q) ||
      loc.fullText.toLowerCase().includes(q)
    ) {
      if (!seen.has(loc.fullText)) {
        seen.add(loc.fullText);
        results.push(loc);
      }
    }
  });

  // Also match cities from INDONESIAN_CITIES
  INDONESIAN_CITIES.forEach((c) => {
    if (c.toLowerCase().includes(q)) {
      if (!seen.has(c)) {
        seen.add(c);
        results.push({
          title: c.split(',')[0],
          subtitle: c.includes(',') ? c.slice(c.indexOf(',') + 1).trim() : 'Indonesia',
          fullText: c,
        });
      }
    }
  });

  // 2. Fetch Nominatim if online (with 1.5s timeout)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&countrycodes=id&addressdetails=1&q=${encodeURIComponent(queryStr)}&limit=6`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          const addr = item.address || {};
          const village = addr.village || addr.suburb || addr.neighbourhood || addr.hamlet || item.name;
          const district = addr.county || addr.city_district || addr.municipality || '';
          const state = addr.state || '';
          const fullDisplayName = item.display_name.split(', Indonesia')[0];
          
          if (!seen.has(fullDisplayName)) {
            seen.add(fullDisplayName);
            results.push({
              title: village || item.name,
              subtitle: [district, state].filter(Boolean).join(', ') || item.display_name,
              fullText: fullDisplayName,
            });
          }
        });
      }
    }
  } catch {}

  return results.slice(0, 8);
}
