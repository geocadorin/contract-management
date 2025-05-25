import { City, State, Owner, Lessee } from './Person';
import { PropertyCategory, RealEstateKind, StatusRealEstate } from './Enums';

// Interface para imóveis
export interface RealEstate {
  id?: string;
  municipal_registration?: string;
  state_id: number;
  city_id: number;
  neighborhood: string;
  street: string;
  number: string;
  complement?: string;
  cep: string;
  note?: string;
  real_estate_kind: RealEstateKind;
  has_inspection: boolean;
  status_real_estate: StatusRealEstate;
  has_proof_document: boolean;
  energy_concessionaire?: string;
  water_concessionaire?: string;
  property_category?: PropertyCategory;
  inspection_report_date?: string;
  owner_id: string;
  lessee_id?: string;

  // Relações (opcionais para quando vierem do banco)
  cities?: City;
  states?: State;
  owners?: Owner;
  lessees?: Lessee;

  created_at?: string;
  updated_at?: string;
} 
