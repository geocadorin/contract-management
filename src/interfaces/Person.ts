export interface Person {
  id?: string;
  role: 'OWNER' | 'LESSEE';
  full_name: string;
  marital_status_id?: number;
  profession?: string;
  rg?: string;
  issuing_body?: string;
  cpf: string;
  cellphone?: string;
  email?: string;

  // Endereço
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city_id?: number;

  note?: string;
  created_at?: string;
  updated_at?: string;

  uf_rg?: string;
  gender?: string;
  nationality?: string;
  branch?: string;
  account?: string;
  bank?: string;
  account_type?: string;
  opted_for_power_of_attorney?: boolean;
}

export interface Owner extends Omit<Person, 'role'> {
  role: 'OWNER';
}

export interface Lessee extends Omit<Person, 'role'> {
  role: 'LESSEE';
}

export interface PersonPartner {
  id?: string;
  person_id: string;
  full_name: string;
  rg?: string;
  issuing_body?: string;
  cpf?: string;
  cellphone?: string;
  email?: string;

  // Endereço do parceiro (se diferente)
  cep_partner?: string;
  street_partner?: string;
  number_partner?: string;
  complement_partner?: string;
  neighborhood_partner?: string;
  city_id_partner?: number;

  created_at?: string;
  updated_at?: string;
}

export interface MaritalStatus {
  id: number;
  name: string;
}

export interface State {
  id: number;
  uf: string;
  name: string;
}

export interface City {
  id: number;
  state_id: number;
  name: string;
  states?: State;
}

export interface PersonReference {
  id?: string;
  person_id: string;
  full_name: string;
  email?: string;
  telefone?: string;
  endereco_completo?: string;
  cep?: string;
  kinship?: string;
  created_at?: string;
  updated_at?: string;
} 
