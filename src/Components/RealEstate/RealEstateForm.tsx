import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RealEstate, RealEstateKind, StatusRealEstate } from '../../interfaces/RealEstate';
import { realEstateService } from '../../services/realEstateService';
import { locationService } from '../../services/locationService';
import { State, City, Owner, Lessee } from '../../interfaces/Person';
import { ownerService, lesseeService } from '../../services/personService';
import { FiSave, FiArrowLeft, FiSearch, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import InputMask from 'react-input-mask';

// Inicializador para formulário vazio
const initialRealEstateState: Omit<RealEstate, 'id' | 'created_at' | 'updated_at'> = {
  municipal_registration: '',
  state_id: 0,
  city_id: 0,
  neighborhood: '',
  street: '',
  number: '',
  complement: '',
  cep: '',
  note: '',
  real_estate_kind: 'Casa',
  has_inspection: false,
  status_real_estate: 'Disponível',
  has_proof_document: false,
  owner_id: ''
};

const RealEstateForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [realEstate, setRealEstate] = useState<Omit<RealEstate, 'id' | 'created_at' | 'updated_at'>>(initialRealEstateState);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<number | undefined>(undefined);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [lessees, setLessees] = useState<Lessee[]>([]);
  
  // Estados para o processamento do CEP
  const [loadingCep, setLoadingCep] = useState<boolean>(false);
  const [cepError, setCepError] = useState<string | null>(null);
  
  // Tipos de imóveis e status disponíveis
  const realEstateKinds: RealEstateKind[] = ['Casa', 'Apartamento', 'Salas comerciais', 'Loja', 'Galpão'];
  const statusRealEstates: StatusRealEstate[] = ['Disponível', 'Alugado', 'Vendido', 'Cancelado'];
  
  // Carregar estados, proprietários e inquilinos
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [statesData, ownersData, lesseesData] = await Promise.all([
          locationService.getAllStates(),
          ownerService.getAll(),
          lesseeService.getAll()
        ]);
        
        setStates(statesData);
        setOwners(ownersData);
        setLessees(lesseesData);
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err);
        setError('Erro ao carregar dados. Por favor, recarregue a página.');
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Carregar dados do imóvel se estiver em modo de edição
  useEffect(() => {
    if (isEditMode && id) {
      const fetchRealEstate = async () => {
        try {
          setLoading(true);
          const realEstateData = await realEstateService.getById(id);
          
          if (!realEstateData) {
            throw new Error('Imóvel não encontrado');
          }
          
          // Remover campos gerados pelo banco
          const { id: _, created_at, updated_at, cities, states, owners, lessees, ...realEstateWithoutId } = realEstateData;
          
          setRealEstate(realEstateWithoutId);
          
          // Se o imóvel tem um estado definido, carregar as cidades desse estado
          if (realEstateData.state_id) {
            setSelectedStateId(realEstateData.state_id);
            const citiesData = await locationService.getCitiesByState(realEstateData.state_id);
            setCities(citiesData);
          }
        } catch (err) {
          console.error('Erro ao carregar imóvel:', err);
          setError('Erro ao carregar dados do imóvel. Por favor, tente novamente.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchRealEstate();
    }
  }, [id, isEditMode]);
  
  // Carregar cidades quando o estado é alterado
  useEffect(() => {
    if (selectedStateId) {
      const fetchCities = async () => {
        try {
          const citiesData = await locationService.getCitiesByState(selectedStateId);
          setCities(citiesData);
          
          // Se a cidade atual não pertence ao estado selecionado, limpar o campo
          if (realEstate.city_id) {
            const cityExists = citiesData.some(city => city.id === realEstate.city_id);
            if (!cityExists) {
              setRealEstate(prev => ({ ...prev, city_id: 0 }));
            }
          }
        } catch (err) {
          console.error('Erro ao carregar cidades:', err);
        }
      };
      
      fetchCities();
    } else {
      setCities([]);
      // Limpar cidade se o estado foi desmarcado
      if (realEstate.city_id) {
        setRealEstate(prev => ({ ...prev, city_id: 0 }));
      }
    }
  }, [selectedStateId]);
  
  // Atualizar campo do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Tratar campos especiais
    if (name === 'state_id') {
      setSelectedStateId(value ? Number(value) : undefined);
      setRealEstate(prev => ({ ...prev, [name]: Number(value) }));
    } else if (name === 'city_id') {
      setRealEstate(prev => ({ ...prev, [name]: Number(value) }));
    } else if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setRealEstate(prev => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setRealEstate(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Buscar endereço pelo CEP
  const handleCepSearch = async () => {
    const cep = realEstate.cep?.replace(/\D/g, '');
    
    if (!cep || cep.length !== 8) {
      setCepError('CEP inválido. O CEP deve conter 8 dígitos.');
      return;
    }
    
    setLoadingCep(true);
    setCepError(null);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        setCepError('CEP não encontrado.');
        return;
      }
      
      // Buscar estado e cidade correspondentes no banco de dados
      const state = states.find(s => s.uf.toUpperCase() === data.uf.toUpperCase());
      
      if (state) {
        setSelectedStateId(state.id);
        setRealEstate(prev => ({
          ...prev,
          state_id: state.id
        }));
        
        // Buscar cidades do estado
        const citiesData = await locationService.getCitiesByState(state.id);
        const city = citiesData.find(c => c.name.toUpperCase() === data.localidade.toUpperCase());
        
        setRealEstate(prev => ({
          ...prev,
          street: data.logradouro,
          neighborhood: data.bairro,
          city_id: city?.id || 0
        }));
      } else {
        // Se não encontrou o estado, apenas preencher os campos de endereço
        setRealEstate(prev => ({
          ...prev,
          street: data.logradouro,
          neighborhood: data.bairro
        }));
        
        setCepError('Estado não encontrado no sistema. Preencha manualmente.');
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
      setCepError('Erro ao buscar CEP. Verifique sua conexão e tente novamente.');
    } finally {
      setLoadingCep(false);
    }
  };
  
  // Submeter formulário
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Validar campos obrigatórios
      const requiredFields = [
        { field: 'state_id', message: 'O estado é obrigatório' },
        { field: 'city_id', message: 'A cidade é obrigatória' },
        { field: 'neighborhood', message: 'O bairro é obrigatório' },
        { field: 'street', message: 'O logradouro é obrigatório' },
        { field: 'number', message: 'O número é obrigatório' },
        { field: 'cep', message: 'O CEP é obrigatório' },
        { field: 'owner_id', message: 'O proprietário é obrigatório' }
      ];
      
      for (const { field, message } of requiredFields) {
        if (!realEstate[field as keyof typeof realEstate]) {
          setError(message);
          setSubmitting(false);
          return;
        }
      }
      
      // Preparar dados para envio
      const dataToSend = { ...realEstate };
      
      // Remover apenas números do CEP
      dataToSend.cep = dataToSend.cep.replace(/\D/g, '');
      
      if (isEditMode && id) {
        await realEstateService.update(id, dataToSend);
      } else {
        await realEstateService.create(dataToSend);
      }
      
      navigate('/real-estates');
    } catch (err) {
      console.error('Erro ao salvar imóvel:', err);
      setError('Erro ao salvar imóvel. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Editar Imóvel' : 'Novo Imóvel'}
        </h1>
        <button
          onClick={() => navigate('/real-estates')}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center"
        >
          <FiArrowLeft className="mr-2" /> Voltar
        </button>
      </div>
      
      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          {/* Seção: Informações Básicas */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Imóvel <span className="text-red-500">*</span>
              </label>
              <select
                name="real_estate_kind"
                value={realEstate.real_estate_kind}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {realEstateKinds.map(kind => (
                  <option key={kind} value={kind}>{kind}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status_real_estate"
                value={realEstate.status_real_estate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {statusRealEstates.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matrícula
              </label>
              <input
                type="text"
                name="municipal_registration"
                value={realEstate.municipal_registration || ''}
                onChange={handleChange}
                placeholder="Número da matrícula"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proprietário <span className="text-red-500">*</span>
              </label>
              <select
                name="owner_id"
                value={realEstate.owner_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione um proprietário</option>
                {owners.map(owner => (
                  <option key={owner.id} value={owner.id}>{owner.full_name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inquilino 
              </label>
              <select
                name="lessee_id"
                value={realEstate.lessee_id || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um inquilino (opcional)</option>
                {lessees.map(lessee => (
                  <option key={lessee.id} value={lessee.id}>{lessee.full_name}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2 flex flex-col md:flex-row md:space-x-4">
              <div className="flex items-center mb-2 md:mb-0">
                <input
                  type="checkbox"
                  id="has_inspection"
                  name="has_inspection"
                  checked={realEstate.has_inspection}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="has_inspection" className="ml-2 block text-sm text-gray-700">
                  Possui vistoria
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="has_proof_document"
                  name="has_proof_document"
                  checked={realEstate.has_proof_document}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="has_proof_document" className="ml-2 block text-sm text-gray-700">
                  Possui documento comprobatório
                </label>
              </div>
            </div>
          </div>
          
          {/* Seção: Endereço */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CEP <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <InputMask
                  mask="99999-999"
                  name="cep"
                  value={realEstate.cep || ''}
                  onChange={handleChange}
                  placeholder="00000-000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={handleCepSearch}
                  disabled={loadingCep}
                  className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none"
                >
                  {loadingCep ? (
                    <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                  ) : (
                    <FiSearch />
                  )}
                </button>
              </div>
              {cepError && (
                <p className="text-red-500 text-xs mt-1">{cepError}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                name="state_id"
                value={realEstate.state_id || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione um estado</option>
                {states.map(state => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade <span className="text-red-500">*</span>
              </label>
              <select
                name="city_id"
                value={realEstate.city_id || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!selectedStateId}
              >
                <option value="">Selecione uma cidade</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bairro <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="neighborhood"
                value={realEstate.neighborhood || ''}
                onChange={handleChange}
                placeholder="Bairro"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logradouro <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="street"
                value={realEstate.street || ''}
                onChange={handleChange}
                placeholder="Rua, Avenida, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="number"
                value={realEstate.number || ''}
                onChange={handleChange}
                placeholder="Número"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complemento
              </label>
              <input
                type="text"
                name="complement"
                value={realEstate.complement || ''}
                onChange={handleChange}
                placeholder="Apartamento, Bloco, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Seção: Observações */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Observações</h2>
          <div className="mb-6">
            <textarea
              name="note"
              value={realEstate.note || ''}
              onChange={handleChange}
              placeholder="Observações adicionais sobre o imóvel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
          
          {/* Botões de ação */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/real-estates')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md mr-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-5 w-5 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" /> Salvar
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RealEstateForm; 