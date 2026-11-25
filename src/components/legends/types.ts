export type LegendPack = 'epics' | 'puranas' | 'history';

export type LegendId =
  // Pack 1: Mahabharata & Epics
  | 'krishna'
  | 'arjuna'
  | 'karna'
  | 'bhishma'
  | 'shakuni'
  | 'duryodhana'
  // Pack 2: Ramayana & Puranas
  | 'rama'
  | 'hanuman'
  | 'shiva'
  | 'ravana'
  // Pack 3: Historical Emperors, Strategists & Freedom Icons
  | 'chanakya'
  | 'shivaji'
  | 'maharana_pratap'
  | 'ashoka'
  | 'lakshmibai'
  | 'vivekananda';

export type LegendExpression =
  | 'calm_updesh'
  | 'focused_aim'
  | 'fierce_resolve'
  | 'compassionate'
  | 'strategic_smirk'
  | 'commanding'
  | 'orator_fire'
  | 'meditative';

export type LegendPose =
  | 'heroic_idle'
  | 'guru_updesh'
  | 'wielding_chakra'
  | 'playing_bansuri'
  | 'archer_aiming'
  | 'warrior_stance'
  | 'holding_scroll'
  | 'orator_folded'
  | 'chaupar_scheme';

export type LegendBodySilhouette =
  | 'divine_athletic'
  | 'armored_kshatriya'
  | 'maratha_rajput_regal'
  | 'sannyasi_sage'
  | 'warrior_queen'
  | 'patriarch_elder'
  | 'vanara_heroic'
  | 'schemer_lean';

export type LegendJawType =
  | 'noble_oval'
  | 'warrior_square'
  | 'elder_gaunt'
  | 'feminine_grace'
  | 'vanara_crest';

export type LegendLookAt = 'center' | 'left' | 'right';

export type LegendWeaponType =
  | 'sudarshan_chakra'
  | 'bansuri'
  | 'gandiva_bow'
  | 'vijaya_bow'
  | 'kodanda_bow'
  | 'gada_mace'
  | 'heavy_gada'
  | 'trishul_damru'
  | 'chandrahasa_sword'
  | 'bhavani_talwar'
  | 'pratap_bhala_spear'
  | 'ashoka_edict_staff'
  | 'twin_talwars'
  | 'arthashastra_scroll'
  | 'chaupar_dice'
  | 'dhal_shield'
  | 'none';

export interface LegendColorPalette {
  skinLight: string;
  skinBase: string;
  skinShadow: string;
  hairBase: string;
  hairHighlight: string;
  clothPrimary: string;
  clothShadow: string;
  clothHighlight: string;
  trimGold: string;
  trimGoldDark: string;
  armorBase?: string;
  armorShadow?: string;
  outlineInk: string;
  eyeIris: string;
  auraPrimary: string;
  auraSecondary: string;
}

export interface LegendProfile {
  id: LegendId;
  displayName: string;
  titleHindi: string;
  pack: LegendPack;
  bodySilhouette: LegendBodySilhouette;
  jawType: LegendJawType;
  palette: LegendColorPalette;
  defaultPose: LegendPose;
  defaultExpression: LegendExpression;
  defaultWeapon: LegendWeaponType;
  tilak:
    | 'urdhva_pundra'
    | 'kshatriya_tilak'
    | 'tripundra_ash'
    | 'tripundra_third_eye'
    | 'chandrakor_maratha'
    | 'sindoor_hanuman'
    | 'chanakya_chandan'
    | 'bindi_crimson'
    | 'vivekananda_minimal'
    | 'none';
  facialHair:
    | 'none'
    | 'bhishma_flowing_beard'
    | 'shivaji_pointed_beard'
    | 'pratap_rajput_moustache'
    | 'royal_handlebar'
    | 'shakuni_goatee'
    | 'ravana_royal_stache';
  earOrnament: 'makara_kundal' | 'surya_kundal' | 'rudraksha_ear' | 'royal_bali' | 'none';
  neckOrnament: 'vaijayanti_mala' | 'pearl_kantha' | 'rudraksha_vasuki' | 'gold_haar' | 'janeu_only' | 'none';
  hasCapeOrUttariya: boolean;
  isDivineHalo: boolean;
}

export interface BeatWordToken {
  word: string;
  start: number;
  end: number;
}

export interface LegendCharacterRigProps {
  legendId: LegendId | string;
  pose?: LegendPose;
  expression?: LegendExpression;
  lookAt?: LegendLookAt;
  weapon?: LegendWeaponType;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  opacity?: number;
  flipHorizontal?: boolean;
  beatWords?: BeatWordToken[];
  beatStartSec?: number;
  auraIntensity?: number;
  breathing?: boolean;
  blinking?: boolean;
}

const LEGEND_ALIASES: Record<string, LegendId> = {
  krishna: 'krishna',
  shri_krishna: 'krishna',
  lord_krishna: 'krishna',
  vasudeva: 'krishna',
  arjuna: 'arjuna',
  arjun: 'arjuna',
  partha: 'arjuna',
  karna: 'karna',
  suryaputra: 'karna',
  bhishma: 'bhishma',
  bhishma_pitamah: 'bhishma',
  shakuni: 'shakuni',
  duryodhana: 'duryodhana',
  rama: 'rama',
  ram: 'rama',
  shri_ram: 'rama',
  hanuman: 'hanuman',
  bajrangbali: 'hanuman',
  shiva: 'shiva',
  mahadev: 'shiva',
  ravana: 'ravana',
  ravan: 'ravana',
  chanakya: 'chanakya',
  kautilya: 'chanakya',
  shivaji: 'shivaji',
  chhatrapati_shivaji: 'shivaji',
  shivaji_maharaj: 'shivaji',
  maharana_pratap: 'maharana_pratap',
  pratap: 'maharana_pratap',
  ashoka: 'ashoka',
  samrat_ashoka: 'ashoka',
  lakshmibai: 'lakshmibai',
  rani_lakshmibai: 'lakshmibai',
  jhansi_ki_rani: 'lakshmibai',
  vivekananda: 'vivekananda',
  swami_vivekananda: 'vivekananda',
};

export function resolveLegendId(rawRole?: string): LegendId | null {
  if (!rawRole) return null;
  let cleaned = String(rawRole).toLowerCase().trim();
  if (cleaned.startsWith('legend_')) {
    cleaned = cleaned.slice('legend_'.length);
  }
  return LEGEND_ALIASES[cleaned] || null;
}

export function isLegendRole(rawRole?: string): boolean {
  return resolveLegendId(rawRole) !== null;
}
