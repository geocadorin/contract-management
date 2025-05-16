import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lessee } from '../../interfaces/Person';
import { lesseeService } from '../../services/personService';
import { locationService } from '../../services/locationService';
import { MaritalStatus, State, City } from '../../interfaces/Person';
import { FiSave, FiArrowLeft, FiSearch } from 'react-icons/fi';
import InputMask from 'react-input-mask';

// Inicializador para formulário vazio
const initialLesseeState: Omit<Lessee, 'role'> = {
  full_name: '',
  cpf: '',
  rg: '',
  issuing_body: '',
  profession: '',
  celphone: '',
  email: '',
  marital_status_id: undefined,
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city_id: undefined,
  note: ''
};

const LesseeForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [lessee, setLessee] = useState<Omit<Lessee, 'role'>>(initialLesseeState);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<number | undefined>(undefined);
  
  // Estados para o processamento do CEP
  const [loadingCep, setLoadingCep] = useState<boolean>(false);
  const [cepError, setCepError] = useState<string | null>(null);
  
  // Carregar estados civis, estados e cidades
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [maritalStatusesData, statesData] = await Promise.all([
          locationService.getAllMaritalStatuses(),
          locationService.getAllStates()
        ]);
        
        setMaritalStatuses(maritalStatusesData);
        setStates(statesData);
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err);
        setError('Erro ao carregar dados. Por favor, recarregue a página.');
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Carregar dados do inquilino se estiver em modo de edição
  useEffect(() => {
    if (isEditMode && id) {
      const fetchLessee = async () => {
        try {
          setLoading(true);
          const lesseeData = await lesseeService.getById(id);
          
          if (!lesseeData) {
            throw new Error('Inquilino não encontrado');
          }
          
          // Remover campo 'role' antes de definir o estado
          const { role, ...lesseeWithoutRole } = lesseeData;
          setLessee(lesseeWithoutRole);
          
          // Se o inquilino tem um estado definido (através da cidade), carregar as cidades desse estado
          if (lesseeData.city_id) {
            const cityData = await locationService.getCityById(lesseeData.city_id);
            if (cityData && cityData.states) {
              setSelectedStateId(cityData.states.id);
              const citiesData = await locationService.getCitiesByState(cityData.states.id);
              setCities(citiesData);
            }
          }
        } catch (err) {
          console.error('Erro ao carregar inquilino:', err);
          setError('Erro ao carregar dados do inquilino. Por favor, tente novamente.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchLessee();
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
          if (lessee.city_id) {
            const cityExists = citiesData.some(city => city.id === lessee.city_id);
            if (!cityExists) {
              setLessee(prev => ({ ...prev, city_id: undefined }));
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
      if (lessee.city_id) {
        setLessee(prev => ({ ...prev, city_id: undefined }));
      }
    }
  }, [selectedStateId]);
  
  // Atualizar campo do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Tratar campos especiais
    if (name === 'state_id') {
      setSelectedStateId(value ? Number(value) : undefined);
    } else if (name === 'city_id' || name === 'marital_status_id') {
      setLessee(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
    } else {
      setLessee(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Buscar endereço pelo CEP
  const handleCepSearch = async () => {
    const cep = lessee.cep?.replace(/\D/g, '');
    
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
        
        // Buscar cidades do estado
        const citiesData = await locationService.getCitiesByState(state.id);
        const city = citiesData.find(c => c.name.toUpperCase() === data.localidade.toUpperCase());
        
        setLessee(prev => ({
          ...prev,
          street: data.logradouro,
          neighborhood: data.bairro,
          city_id: city?.id
        }));
      } else {
        // Se não encontrou o estado, apenas preencher os campos de endereço
        setLessee(prev => ({
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
  
  // Enviar formulário
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!lessee.full_name || !lessee.full_name.trim()) {
      setError('Nome completo é obrigatório');
      return;
    }
    
    if (!lessee.cpf || lessee.cpf.length !== 11) {
      setError('CPF inválido. Deve conter 11 dígitos');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      if (isEditMode && id) {
        await lesseeService.update(id, lessee);
      } else {
        await lesseeService.create(lessee);
      }
      
      navigate('/lessees');
    } catch (err: any) {
      console.error('Erro ao salvar inquilino:', err);
      // Verificar se é um erro de duplicidade de CPF
      if (err.message?.includes('unique constraint') && err.message?.includes('cpf')) {
        setError('CPF já cadastrado para outro inquilino.');
      } else {
        setError('Erro ao salvar inquilino. Por favor, tente novamente.');
      }
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
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Editar Inquilino' : 'Novo Inquilino'}
        </h1>
      </div>
      
      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações pessoais */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
              Informações Pessoais
            </h2>
          </div>
          
          {/* Nome completo */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="full_name">
              Nome Completo *
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={lessee.full_name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          {/* Estado Civil */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="marital_status_id">
              Estado Civil
            </label>
            <select
              id="marital_status_id"
              name="marital_status_id"
              value={lessee.marital_status_id || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Selecione...</option>
              {maritalStatuses.map(status => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Profissão */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profession">
              Profissão
            </label>
            <input
              type="text"
              id="profession"
              name="profession"
              value={lessee.profession || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          {/* CPF */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cpf">
              CPF *
            </label>
            <InputMask
              mask="999.999.999-99"
              type="text"
              id="cpf"
              name="cpf"
              value={lessee.cpf || ''}
              onChange={(e) => {
                // Remover caracteres não numéricos antes de salvar no state
                const numericValue = e.target.value.replace(/\D/g, '');
                setLessee(prev => ({ ...prev, cpf: numericValue }));
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          {/* RG */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rg">
              RG
            </label>
            <InputMask
              mask="99.999.999-9"
              type="text"
              id="rg"
              name="rg"
              value={lessee.rg || ''}
              onChange={(e) => {
                // Salvar com a máscara removida
                const value = e.target.value.replace(/[^\d]/g, '');
                setLessee(prev => ({ ...prev, rg: value }));
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          {/* Órgão Emissor */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="issuing_body">
              Órgão Emissor
            </label>
            <input
              type="text"
              id="issuing_body"
              name="issuing_body"
              value={lessee.issuing_body || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          {/* Contatos */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
              Contato
            </h2>
          </div>
          
          {/* Celular */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="celphone">
              Telefone/Celular
            </label>
            <InputMask
              mask="(99) 99999-9999"
              type="text"
              id="celphone"
              name="celphone"
              value={lessee.celphone || ''}
              onChange={(e) => {
                // Remover caracteres não numéricos
                const numericValue = e.target.value.replace(/\D/g, '');
                setLessee(prev => ({ ...prev, celphone: numericValue }));
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={lessee.email || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          {/* Endereço */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
              Endereço
            </h2>
          </div>
          
          {/* CEP */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cep">
              CEP
            </label>
            <div className="flex">
              <InputMask
                mask="99999-999"
                type="text"
                id="cep"
                name="cep"
                value={lessee.cep || ''}
                onChange={(e) => {
                  // Remover caracteres não numéricos
                  const numericValue = e.target.value.replace(/\D/g, '');
                  setLessee(prev => ({ ...prev, cep: numericValue }));
                }}
                className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <button
                type="button"
                onClick={handleCepSearch}
                disabled={loadingCep || !lessee.cep || lessee.cep.length !== 8}
                className={`px-4 py-2 rounded-r flex items-center ${
                  loadingCep || !lessee.cep || lessee.cep.length !== 8
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {loadingCep ? (
                  'Buscando...'
                ) : (
                  <>
                    <FiSearch className="mr-1" /> Buscar
                  </>
                )}
              </button>
            </div>
            {cepError && (
              <p className="text-xs text-red-500 mt-1">{cepError}</p>
            )}
          </div>
          
          {/* Estado */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="state_id">
              Estado
            </label>
            <select
              id="state_id"
              name="state_id"
              value={selectedStateId || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Selecione...</option>
              {states.map(state => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Cidade */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="city_id">
              Cidade
            </label>
            <select
              id="city_id"
              name="city_id"
              value={lessee.city_id || ''}
              onChange={handleChange}
              disabled={!selectedStateId}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Selecione...</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Logradouro */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="street">
              Logradouro
            </label>
            <input
              type="text"
              id="street"
              name="street"
              value={lessee.street || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          {/* Número */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="number">
              Número
            </label>
            <input
              type="text"
              id="number"
              name="number"
              value={lessee.number || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          {/* Complemento */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="complement">
              Complemento
            </label>
            <input
              type="text"
              id="complement"
              name="complement"
              value={lessee.complement || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          {/* Bairro */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="neighborhood">
              Bairro
            </label>
            <input
              type="text"
              id="neighborhood"
              name="neighborhood"
              value={lessee.neighborhood || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          {/* Observações */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
              Observações
            </h2>
          </div>
          
          {/* Nota */}
          <div className="mb-4 col-span-1 md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="note">
              Observações
            </label>
            <textarea
              id="note"
              name="note"
              value={lessee.note || ''}
              onChange={handleChange}
              rows={4}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>
        </div>
        
        {/* Botões de ação */}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={() => navigate('/lessees')}
            className="mr-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
          >
            {submitting ? (
              <>
                <span className="mr-2 animate-spin">⭘</span>
                Salvando...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                Salvar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LesseeForm; 