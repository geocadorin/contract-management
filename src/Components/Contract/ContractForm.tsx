import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Contract, ContractStatus, ContractKind } from '../../interfaces/Contract';
import { RealEstate } from '../../interfaces/RealEstate';
import { Owner, Lessee } from '../../interfaces/Person';
import { contractService } from '../../services/contractService';
import { realEstateService } from '../../services/realEstateService';
import { ownerService, lesseeService } from '../../services/personService';
import { FiSave, FiArrowLeft, FiCalendar, FiHome, FiUser, FiDollarSign, FiTag } from 'react-icons/fi';

// Inicializador para formulário vazio
const initialContractState: Omit<Contract, 'id' | 'created_at' | 'updated_at'> = {
  identifier: '',
  contract_kind: 'Locação',
  start_date: '',
  end_date: '',
  day_payment: 1,
  payment_value: 0,
  duration: 12, // Padrão de 12 meses
  status: 'Ativo',
  owner_id: '',
  lessee_id: '',
  real_estate_id: ''
};

const ContractForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [contract, setContract] = useState<Omit<Contract, 'id' | 'created_at' | 'updated_at'>>(initialContractState);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [lessees, setLessees] = useState<Lessee[]>([]);
  const [realEstates, setRealEstates] = useState<RealEstate[]>([]);
  
  // Status disponíveis conforme o enum do SQL
  const contractStatuses: ContractStatus[] = ['Ativo', 'Concluído', 'Cancelado'];
  
  // Tipos de contrato conforme o enum do SQL
  const contractKinds: ContractKind[] = ['Venda com exclusividade', 'Venda sem exclusividade', 'Locação com administração', 'Locação'];
  
  // Carregar dados do contrato se estiver em modo de edição
  useEffect(() => {
    if (isEditMode && id) {
      const fetchContract = async () => {
        try {
          setLoading(true);
          const contractData = await contractService.getById(id);
          
          if (!contractData) {
            throw new Error('Contrato não encontrado');
          }
          
          // Remover campos gerados pelo banco
          const { id: _, created_at, updated_at, lessees, owners, real_estates, ...contractWithoutId } = contractData;
          
          // Formatar datas
          contractWithoutId.start_date = contractWithoutId.start_date ? 
            new Date(contractWithoutId.start_date).toISOString().split('T')[0] : '';
          
          contractWithoutId.end_date = contractWithoutId.end_date ? 
            new Date(contractWithoutId.end_date).toISOString().split('T')[0] : '';
          
          setContract(contractWithoutId);
        } catch (err) {
          console.error('Erro ao carregar contrato:', err);
          setError('Erro ao carregar dados do contrato. Por favor, tente novamente.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchContract();
    }
  }, [id, isEditMode]);
  
  // Carregar proprietários, inquilinos e imóveis
  useEffect(() => {
    const loadDadosIniciais = async () => {
      try {
        setLoading(true);
        
        // Buscar proprietários
        const ownersData = await ownerService.getAll();
        setOwners(ownersData);
        
        // Buscar inquilinos
        const lesseesData = await lesseeService.getAll();
        setLessees(lesseesData);
        
        // Buscar todos os imóveis
        const realEstatesData = await realEstateService.getAll();
        console.log('Imóveis carregados (total):', realEstatesData?.length || 0);
        
        // TEMPORÁRIO: Mostrar todos os imóveis para diagnóstico
        setRealEstates(realEstatesData || []);
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err);
        setError('Erro ao carregar dados. Por favor, recarregue a página.');
      } finally {
        setLoading(false);
      }
    };
    
    loadDadosIniciais();
  }, []);
  
  // Atualizar campo do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Tratar campos numéricos e booleanos
    if (name === 'payment_value' || name === 'day_payment' || name === 'duration') {
      setContract(prev => ({ ...prev, [name]: value ? Number(value) : 0 }));
    } else if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setContract(prev => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setContract(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Gerar identificador único para o contrato
  const generateIdentifier = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    
    const identifier = `CTR-${year}${month}${day}-${random}`;
    setContract(prev => ({ ...prev, identifier }));
  };
  
  // Submeter formulário
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Validar campos obrigatórios
      const requiredFields = [
        { field: 'identifier', message: 'O identificador do contrato é obrigatório' },
        { field: 'owner_id', message: 'O proprietário é obrigatório' },
        { field: 'real_estate_id', message: 'O imóvel é obrigatório' },
        { field: 'start_date', message: 'A data de início é obrigatória' },
        { field: 'payment_value', message: 'O valor do pagamento é obrigatório' }
      ];
      
      for (const { field, message } of requiredFields) {
        if (!contract[field as keyof typeof contract]) {
          setError(message);
          setSubmitting(false);
          return;
        }
      }
      
      // Validar datas
      if (contract.start_date && contract.end_date) {
        const startDate = new Date(contract.start_date);
        const endDate = new Date(contract.end_date);
        
        if (startDate >= endDate) {
          setError('A data de início deve ser anterior à data de término');
          setSubmitting(false);
          return;
        }
      }
      
      // Validar dia de pagamento
      if (contract.day_payment && (contract.day_payment < 1 || contract.day_payment > 31)) {
        setError('O dia de pagamento deve estar entre 1 e 31');
        setSubmitting(false);
        return;
      }
      
      // Preparar dados para envio
      const dataToSend = { ...contract };
      
      console.log('Dados que serão enviados:', dataToSend);
      
      if (isEditMode && id) {
        try {
          await contractService.update(id, dataToSend);
          navigate('/contracts');
        } catch (error: any) {
          console.error('Erro específico na atualização:', error);
          setError(`Erro ao atualizar contrato: ${error?.message || 'Verifique os dados e tente novamente.'}`);
        }
      } else {
        try {
          await contractService.create(dataToSend);
          navigate('/contracts');
        } catch (error: any) {
          console.error('Erro específico na criação:', error);
          setError(`Erro ao criar contrato: ${error?.message || 'Verifique os dados e tente novamente.'}`);
        }
      }
    } catch (error: any) {
      console.error('Erro ao salvar contrato:', error);
      setError(`Erro ao salvar contrato: ${error?.message || 'Por favor, tente novamente.'}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Formatar endereço do imóvel
  const formatRealEstateAddress = (realEstate: RealEstate) => {
    if (!realEstate) return 'Endereço não disponível';
    const street = realEstate.street || 'Rua não informada';
    const number = realEstate.number || 'S/N';
    const complement = realEstate.complement ? `, ${realEstate.complement}` : '';
    const neighborhood = realEstate.neighborhood || 'Bairro não informado';
    return `${street}, ${number}${complement}, ${neighborhood}`;
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">
          {isEditMode ? 'Editar Contrato' : 'Novo Contrato'}
        </h1>
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
          <h2 className="text-xl font-semibold text-primary mb-4 flex items-center">
            <FiTag className="mr-2" /> Informações do Contrato
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identificador <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <input
                  type="text"
                  name="identifier"
                  value={contract.identifier}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
                <button
                  type="button"
                  onClick={generateIdentifier}
                  className="bg-accent text-light px-3 py-2 rounded-r-md hover:bg-accent-dark transition duration-150"
                  title="Gerar identificador"
                >
                  Gerar
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Contrato <span className="text-red-500">*</span>
              </label>
              <select
                name="contract_kind"
                value={contract.contract_kind}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                required
              >
                <option value="">Selecione um tipo de contrato</option>
                {contractKinds.map(kind => (
                  <option key={kind} value={kind}>{kind}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proprietário <span className="text-red-500">*</span>
              </label>
              <select
                name="owner_id"
                value={contract.owner_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
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
                Imóvel <span className="text-red-500">*</span>
              </label>
              <select
                name="real_estate_id"
                value={contract.real_estate_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                required
              >
                <option value="">Selecione um imóvel</option>
                {realEstates.map(realEstate => (
                  <option key={realEstate.id} value={realEstate.id}>
                    {formatRealEstateAddress(realEstate)} - {realEstate.real_estate_kind}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inquilino
              </label>
              <select
                name="lessee_id"
                value={contract.lessee_id || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Selecione um inquilino</option>
                {lessees.map(lessee => (
                  <option key={lessee.id} value={lessee.id}>{lessee.full_name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={contract.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                required
              >
                {contractStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Seção: Período e Pagamento */}
          <h2 className="text-xl font-semibold text-primary mb-4 flex items-center">
            <FiCalendar className="mr-2" /> Período e Pagamento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Início <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={contract.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Término
              </label>
              <input
                type="date"
                name="end_date"
                value={contract.end_date || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor do Pagamento (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="payment_value"
                value={contract.payment_value || ''}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0,00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dia de Pagamento
              </label>
              <input
                type="number"
                name="day_payment"
                value={contract.day_payment || ''}
                onChange={handleChange}
                min="1"
                max="31"
                placeholder="Dia do mês (1-31)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duração (meses)
              </label>
              <input
                type="number"
                name="duration"
                value={contract.duration || ''}
                onChange={handleChange}
                min="1"
                placeholder="Duração em meses"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/contracts')}
              className="bg-gray-300 hover:bg-primary text-gray-800 hover:text-light font-medium py-2 px-4 rounded-md mr-2 transition duration-150"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-accent hover:bg-accent-dark text-light font-medium py-2 px-4 rounded-md flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-5 w-5 mr-2 border-t-2 border-b-2 border-light rounded-full"></div>
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

export default ContractForm; 