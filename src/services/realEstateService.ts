import { supabase } from '../SuperbaseConfig/supabaseClient';
import { RealEstate } from '../interfaces/RealEstate';

export const realEstateService = {
  // Método de teste para verificar se conseguimos buscar proprietários
  async testOwnerQuery(): Promise<any> {
    try {
      console.log('Testando consulta de proprietários...');

      // Primeiro, vamos ver quantos registros temos na tabela persons
      const { data: personsData, error: personsError } = await supabase
        .from('persons')
        .select('id, full_name, role')
        .eq('role', 'OWNER')
        .limit(5);

      if (personsError) {
        console.error('Erro ao buscar persons:', personsError);
        return { error: personsError };
      }

      console.log('Proprietários encontrados:', personsData);

      // Agora vamos ver quantos imóveis temos
      const { data: realEstatesData, error: realEstatesError } = await supabase
        .from('real_estates')
        .select('id, owner_id, street, number')
        .limit(5);

      if (realEstatesError) {
        console.error('Erro ao buscar real_estates:', realEstatesError);
        return { error: realEstatesError };
      }

      console.log('Imóveis encontrados:', realEstatesData);

      return {
        owners: personsData,
        realEstates: realEstatesData
      };
    } catch (err) {
      console.error('Erro no teste:', err);
      return { error: err };
    }
  },

  // Listar todos os imóveis
  async getAll(): Promise<RealEstate[]> {
    try {
      console.log('Iniciando busca de imóveis...');

      // Primeiro, vamos testar uma consulta bem simples
      const { data: realEstatesData, error: realEstatesError } = await supabase
        .from('real_estates')
        .select('*')
        .order('created_at', { ascending: false });

      if (realEstatesError) {
        console.error('Erro ao buscar imóveis:', realEstatesError);
        throw realEstatesError;
      }

      console.log(`Encontrados ${realEstatesData?.length || 0} imóveis`);

      if (!realEstatesData || realEstatesData.length === 0) {
        return [];
      }

      // Agora vamos buscar os proprietários separadamente
      const realEstatesWithOwners = await Promise.all(
        realEstatesData.map(async (realEstate) => {
          if (realEstate.owner_id) {
            try {
              const { data: ownerData, error: ownerError } = await supabase
                .from('persons')
                .select('id, full_name, rg, cellphone, email, cpf')
                .eq('id', realEstate.owner_id)
                .single();

              if (!ownerError && ownerData) {
                return {
                  ...realEstate,
                  owners: ownerData
                };
              }
            } catch (err) {
              console.error(`Erro ao buscar proprietário ${realEstate.owner_id}:`, err);
            }
          }

          // Se não conseguiu buscar o proprietário, buscar dados da cidade
          if (realEstate.city_id) {
            try {
              const { data: cityData, error: cityError } = await supabase
                .from('cities')
                .select(`
                  id,
                  name,
                  states (
                    id,
                    name,
                    uf
                  )
                `)
                .eq('id', realEstate.city_id)
                .single();

              if (!cityError && cityData) {
                return {
                  ...realEstate,
                  cities: cityData
                };
              }
            } catch (err) {
              console.error(`Erro ao buscar cidade ${realEstate.city_id}:`, err);
            }
          }

          return realEstate;
        })
      );

      console.log('Primeiro imóvel com dados:', JSON.stringify(realEstatesWithOwners[0], null, 2));
      return realEstatesWithOwners;

    } catch (err) {
      console.error('Exceção ao buscar imóveis:', err);
      throw new Error(`Erro ao buscar imóveis: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  },

  // Buscar imóvel por ID
  async getById(id: string): Promise<RealEstate | null> {
    try {
      console.log(`Buscando imóvel por ID: ${id}`);

      // Buscar o imóvel primeiro
      const { data: realEstateData, error: realEstateError } = await supabase
        .from('real_estates')
        .select('*')
        .eq('id', id)
        .single();

      if (realEstateError) {
        console.error('Erro ao buscar imóvel:', realEstateError);
        throw realEstateError;
      }

      if (!realEstateData) {
        return null;
      }

      // Buscar proprietário separadamente
      if (realEstateData.owner_id) {
        try {
          const { data: ownerData, error: ownerError } = await supabase
            .from('persons')
            .select('id, full_name, rg, cellphone, email, cpf')
            .eq('id', realEstateData.owner_id)
            .single();

          if (!ownerError && ownerData) {
            realEstateData.owners = ownerData;
          }
        } catch (err) {
          console.error(`Erro ao buscar proprietário ${realEstateData.owner_id}:`, err);
        }
      }

      // Buscar cidade separadamente
      if (realEstateData.city_id) {
        try {
          const { data: cityData, error: cityError } = await supabase
            .from('cities')
            .select(`
              id,
              name,
              states (
                id,
                name,
                uf
              )
            `)
            .eq('id', realEstateData.city_id)
            .single();

          if (!cityError && cityData) {
            realEstateData.cities = cityData;
          }
        } catch (err) {
          console.error(`Erro ao buscar cidade ${realEstateData.city_id}:`, err);
        }
      }

      // Adicionar busca de dados do inquilino
      // Buscar inquilino separadamente
      if (realEstateData.lessee_id) {
        try {
          const { data: lesseeData, error: lesseeError } = await supabase
            .from('persons')
            .select('id, full_name, rg, cellphone, email, cpf')
            .eq('id', realEstateData.lessee_id)
            .single();

          if (!lesseeError && lesseeData) {
            realEstateData.lessees = lesseeData;
          }
        } catch (err) {
          console.error(`Erro ao buscar inquilino ${realEstateData.lessee_id}:`, err);
        }
      }

      console.log('Imóvel encontrado com dados:', JSON.stringify(realEstateData, null, 2));
      return realEstateData;

    } catch (err) {
      console.error('Exceção ao buscar imóvel por ID:', err);
      throw err;
    }
  },

  // Criar novo imóvel
  async create(realEstate: RealEstate): Promise<RealEstate> {
    try {
      const { data, error } = await supabase
        .from('real_estates')
        .insert([realEstate])
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao criar imóvel:', error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Exceção ao criar imóvel:', err);
      throw err;
    }
  },

  // Atualizar imóvel existente
  async update(id: string, realEstate: Partial<RealEstate>): Promise<RealEstate> {
    try {
      const { data, error } = await supabase
        .from('real_estates')
        .update(realEstate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao atualizar imóvel:', error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Exceção ao atualizar imóvel:', err);
      throw err;
    }
  },

  // Excluir imóvel
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('real_estates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro detalhado ao excluir imóvel:', error);
        throw error;
      }
    } catch (err) {
      console.error('Exceção ao excluir imóvel:', err);
      throw err;
    }
  }
}; 
