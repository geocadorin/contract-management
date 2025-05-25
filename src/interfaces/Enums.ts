// Definição dos tipos ENUM do banco de dados como tipos TypeScript

export type PersonRole = 'OWNER' | 'LESSEE';

// property_category_enum do SQL
export type PropertyCategory =
    | 'Casa'
    | 'Apartamento'
    | 'Kitnet'
    | 'Sala Comercial'
    | 'Loja'
    | 'Galpão'
    | 'Terreno'
    | 'Prédio Comercial';

// real_estate_kind_enum do SQL
export type RealEstateKind = 'Residencial' | 'Não Residencial';

// status_real_estate_enum do SQL
export type StatusRealEstate = 'Disponível' | 'Alugado' | 'Vendido' | 'Cancelado';

// contract_kind_enum do SQL
export type ContractKind =
    | 'Venda com exclusividade'
    | 'Venda sem exclusividade'
    | 'Locação com administração'
    | 'Locação';

// contract_status_enum do SQL
export type ContractStatus = 'Ativo' | 'Concluído' | 'Cancelado';

// contract_origin_enum do SQL
export type ContractOrigin =
    | 'Exclusivo'
    | 'Compartilhado: Divisão por 2'
    | 'Compartilhado: Divisão por 3'; 
