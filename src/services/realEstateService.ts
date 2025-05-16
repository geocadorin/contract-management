import { supabase } from '../SuperbaseConfig/supabaseClient';
import { RealEstate } from '../interfaces/RealEstate';

export const realEstateService = {
  // Listar todos os imóveis
  async getAll(): Promise<RealEstate[]> {
    const { data, error } = await supabase
      .from('real_estates')
      .select(`
        *,
        cities(*),
        cities!inner (*, states(*)),
        owners:persons!real_estates_owner_id_fkey(*),
        lessees:persons!real_estates_lessee_id_fkey(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar imóveis:', error);
      throw error;
    }
    
    return data || [];
  },
  
  // Buscar imóvel por ID
  async getById(id: string): Promise<RealEstate | null> {
    const { data, error } = await supabase
      .from('real_estates')
      .select(`
        *,
        cities(*),
        cities!inner (*, states(*)),
        owners:persons!real_estates_owner_id_fkey(*),
        lessees:persons!real_estates_lessee_id_fkey(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar imóvel por ID:', error);
      throw error;
    }
    
    return data;
  },
  
  // Criar novo imóvel
  async create(realEstate: RealEstate): Promise<RealEstate> {
    const { data, error } = await supabase
      .from('real_estates')
      .insert([realEstate])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar imóvel:', error);
      throw error;
    }
    
    return data;
  },
  
  // Atualizar imóvel existente
  async update(id: string, realEstate: Partial<RealEstate>): Promise<RealEstate> {
    const { data, error } = await supabase
      .from('real_estates')
      .update(realEstate)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar imóvel:', error);
      throw error;
    }
    
    return data;
  },
  
  // Excluir imóvel
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('real_estates')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao excluir imóvel:', error);
      throw error;
    }
  }
}; 