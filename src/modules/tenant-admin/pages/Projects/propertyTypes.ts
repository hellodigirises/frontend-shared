// ─── Types ───────────────────────────────────────────────────────────────────

export type PropertyType = 'LAND' | 'RESIDENTIAL_BUILDING' | 'COMMERCIAL_BUILDING';
export type ProjectStatus = 'PLANNED' | 'ONGOING' | 'READY_TO_MOVE' | 'COMPLETED';
export type UnitStatus = 'AVAILABLE' | 'HOLD' | 'RESERVED' | 'BOOKED' | 'BLOCKED' | 'SOLD' | 'UNDER_MAINTENANCE';

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface NearbyPlace {
  type: string;
  name: string;
  distance: string;
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video' | 'drone' | '3d_walkthrough' | 'floor_plan';
  label?: string;
}

export interface Unit {
  id: string;
  unitNumber: string;
  unitType: string;
  floorId: string;
  towerId?: string;
  carpetArea: number;
  builtUpArea?: number;
  superArea?: number;
  facing?: string;
  price: number;
  status: UnitStatus;
  features?: string[];
}

export interface Floor {
  id: string;
  floorNumber: number;
  name: string;
  towerId: string;
  totalUnits: number;
  units: Unit[];
}

export interface Tower {
  id: string;
  name: string;
  totalFloors: number;
  totalUnits: number;
  description?: string;
  floors: Floor[];
}

export interface Project {
  location: string | undefined;
  id: string;
  name: string;
  propertyType: PropertyType;
  developerName?: string;
  status: ProjectStatus;
  launchDate?: string;
  completionDate?: string;
  totalArea?: number;
  totalUnits?: number;
  reraNumber?: string;
  description?: string;
  // Location
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  // Layout
  layoutMapUrl?: string;
  masterPlanUrl?: string;
  plotLayoutUrl?: string;
  // Media
  projectImages?: string[];
  projectVideos?: string[];
  brochureUrl?: string;
  tourUrl3d?: string;
  droneFootageUrl?: string;
  // Amenities & Infra
  amenityIds?: string[];
  nearbyPlaces?: NearbyPlace[];
  // Pricing
  basePrice?: number;
  pricePerSqFt?: number;
  parkingPrice?: number;
  // Legal
  approvalAuthority?: string;
  developmentAuthority?: string;
  landOwnership?: string;
  reraDocUrl?: string;
  landDocUrl?: string;
  // Pricing & Tax (Pan-India)
  gstPercent?: number;
  maintenanceCharges?: number;
  maintenancePeriod?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  stampDutyPercent?: number;
  registrationCharges?: number;
  // Relations
  towers?: Tower[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const PROPERTY_TYPES: { value: PropertyType; label: string; icon: string; desc: string }[] = [
  { value: 'LAND',                  label: 'Land / Plots',         icon: '🌍', desc: 'Land plotting, NA plots, agricultural' },
  { value: 'RESIDENTIAL_BUILDING',  label: 'Residential',          icon: '🏠', desc: 'Apartments, villas, row houses' },
  { value: 'COMMERCIAL_BUILDING',   label: 'Commercial',           icon: '🏢', desc: 'Shops, offices, malls, warehouses' },
];

export const PROJECT_STATUSES: { value: ProjectStatus; label: string; color: string; bg: string }[] = [
  { value: 'PLANNED',       label: 'Planned',         color: '#6366f1', bg: '#eef2ff' },
  { value: 'ONGOING',       label: 'Ongoing',         color: '#3b82f6', bg: '#dbeafe' },
  { value: 'READY_TO_MOVE', label: 'Ready to Move',   color: '#10b981', bg: '#d1fae5' },
  { value: 'COMPLETED',     label: 'Completed',       color: '#059669', bg: '#a7f3d0' },
];

export const UNIT_STATUS_CFG: Record<UnitStatus, { label: string; color: string; bg: string }> = {
  AVAILABLE: { label: 'Available', color: '#10b981', bg: '#d1fae5' },
  HOLD:      { label: 'Hold',      color: '#f59e0b', bg: '#fef3c7' },
  RESERVED:  { label: 'Reserved',  color: '#8b5cf6', bg: '#ede9fe' },
  BOOKED:    { label: 'Booked',    color: '#3b82f6', bg: '#dbeafe' },
  BLOCKED:   { label: 'Blocked',   color: '#9ca3af', bg: '#f3f4f6' },
  SOLD:      { label: 'Sold',      color: '#ef4444', bg: '#fee2e2' },
  UNDER_MAINTENANCE: { label: 'Maintenance', color: '#4b5563', bg: '#f3f4f6' },
};

export const DEFAULT_AMENITIES: Omit<Amenity, 'id'>[] = [
  { name: 'Swimming Pool',       icon: '🏊' },
  { name: 'Gymnasium',           icon: '🏋' },
  { name: 'Clubhouse',           icon: '🏛' },
  { name: 'Garden / Landscape',  icon: '🌳' },
  { name: 'Parking',             icon: '🚗' },
  { name: "Children's Play Area",icon: '🎠' },
  { name: '24×7 Security',       icon: '🔒' },
  { name: 'Lift / Elevator',     icon: '🛗' },
  { name: 'Power Backup',        icon: '⚡' },
  { name: 'CCTV Surveillance',   icon: '📷' },
  { name: 'Jogging Track',       icon: '🏃' },
  { name: 'Indoor Games',        icon: '🎮' },
  { name: 'Terrace Garden',      icon: '🌿' },
  { name: 'EV Charging',         icon: '🔋' },
  { name: 'Solar Power',         icon: '☀️' },
  { name: 'Rainwater Harvesting',icon: '💧' },
  { name: 'Main Road Access',   icon: '🛣️' },
  { name: 'Main Gate',          icon: '🚪' },
  { name: 'Nagar Nigam Supply', icon: '🚰' },
  { name: 'Street Lights',      icon: '💡' },
  { name: 'Sewage Treatment',   icon: '🚿' },
  { name: 'Electricity Line',   icon: '⚡' },
  { name: 'Drainage System',    icon: '🌊' },
  { name: 'Boundary Wall',      icon: '🧱' },
];

export const INFRA_TYPES = [
  { key: 'school',    label: 'School',    icon: '🏫' },
  { key: 'hospital',  label: 'Hospital',  icon: '🏥' },
  { key: 'metro',     label: 'Metro',     icon: '🚇' },
  { key: 'highway',   label: 'Highway',   icon: '🛣' },
  { key: 'airport',   label: 'Airport',   icon: '✈️' },
  { key: 'mall',      label: 'Mall',      icon: '🛍' },
  { key: 'park',      label: 'Park',      icon: '🌲' },
  { key: 'bank',      label: 'Bank / ATM',icon: '🏦' },
];

export const FACING_OPTIONS = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];
export const UNIT_TYPES = [
  'STUDIO', 'ONE_BHK', 'TWO_BHK', 'THREE_BHK', 'FOUR_BHK', 
  'PENTHOUSE', 'VILLA', 'PLOT', 'COMMERCIAL', 'SHOP', 'OFFICE'
];

export const UNIT_TYPE_LABELS: Record<string, string> = {
  STUDIO: 'Studio',
  ONE_BHK: '1 BHK',
  TWO_BHK: '2 BHK',
  THREE_BHK: '3 BHK',
  FOUR_BHK: '4 BHK',
  PENTHOUSE: 'Penthouse',
  VILLA: 'Villa',
  PLOT: 'Plot',
  COMMERCIAL: 'Commercial',
  SHOP: 'Shop',
  OFFICE: 'Office',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const fmtPrice = (n?: number) => {
  if (!n) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

export const getStatusCfg = (status: ProjectStatus) =>
  PROJECT_STATUSES.find(s => s.value === status) ?? PROJECT_STATUSES[0];

export const completionPct = (launch?: string, completion?: string) => {
  if (!launch || !completion) return null;
  const start = new Date(launch).getTime();
  const end = new Date(completion).getTime();
  const now = Date.now();
  if (now >= end) return 100;
  if (now <= start) return 0;
  return Math.round((now - start) / (end - start) * 100);
};