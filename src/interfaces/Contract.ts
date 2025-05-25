import { Lessee, Owner } from './Person';
import { RealEstate } from './RealEstate';
import { ContractKind, ContractStatus, ContractOrigin } from './Enums';

export interface Contract {
  id?: string;
  identifier: string;
  contract_kind: ContractKind;
  start_date: string;
  end_date?: string;
  day_payment?: number;
  payment_value: number;
  duration?: number;
  status: ContractStatus;

  owner_id: string;
  owners?: Owner;
  lessee_id?: string;
  lessees?: Lessee;
  real_estate_id: string;
  real_estates?: RealEstate;

  extra_fees_details?: number;
  contract_signing_date?: string;
  contract_origin?: ContractOrigin;

  created_at?: string;
  updated_at?: string;
} 
