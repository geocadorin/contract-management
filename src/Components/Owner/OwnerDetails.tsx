import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Owner, PersonPartner, MaritalStatus, City } from '../../interfaces/Person';
import { ownerService, personService } from '../../services/personService';
import { locationService } from '../../services/locationService';
import { FiEdit, FiArrowLeft, FiUser, FiHome, FiPhone, FiMail, FiFile } from 'react-icons/fi';
import PartnerList from '../Common/PartnerList';

const OwnerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [owner, setOwner] = useState<Owner | null>(null);
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | null>(null);
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchOwnerDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Buscar proprietário
        const ownerData = await ownerService.getById(id);
        if (!ownerData) {
          throw new Error('Proprietário não encontrado');
        }
        setOwner(ownerData);
        
        // Buscar estado civil se disponível
        if (ownerData.marital_status_id) {
          const maritalStatusData = await locationService.getMaritalStatusById(ownerData.marital_status_id);
          setMaritalStatus(maritalStatusData);
        }
        
        // Buscar cidade se disponível
        if (ownerData.city_id) {
          const cityData = await locationService.getCityById(ownerData.city_id);
          setCity(cityData);
        }
        
      } catch (err) {
        console.error('Erro ao carregar detalhes do proprietário:', err);
        setError('Erro ao carregar detalhes. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOwnerDetails();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !owner) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Proprietário não encontrado'}
        </div>
        <button
          onClick={() => navigate('/owners')}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center"
        >
          <FiArrowLeft className="mr-2" /> Voltar para a lista
        </button>
      </div>
    );
  }
  
  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };
  
  // Formatar telefone
  const formatPhone = (phone?: string) => {
    if (!phone) return 'Não informado';
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };
  
  // Formatar RG
  const formatRg = (rg?: string) => {
    if (!rg) return 'Não informado';
    if (rg.length === 9) {
      return rg.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
    }
    return rg;
  };
  
  // Formatar CEP
  const formatCep = (cep?: string) => {
    if (!cep) return 'Não informado';
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Detalhes do Proprietário</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/owners')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="mr-2" /> Voltar para a lista
          </button>
          <Link
            to={`/owners/${id}/edit`}
            className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md flex items-center"
          >
            <FiEdit className="mr-2" /> Editar
          </Link>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Informações pessoais */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2 flex items-center">
            <FiUser className="mr-2" /> Informações Pessoais
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">Nome Completo</p>
              <p className="text-gray-800">{owner.full_name}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-gray-600">CPF</p>
              <p className="text-gray-800">{formatCpf(owner.cpf)}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-gray-600">Estado Civil</p>
              <p className="text-gray-800">{maritalStatus?.name || 'Não informado'}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-gray-600">Profissão</p>
              <p className="text-gray-800">{owner.profession || 'Não informado'}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-gray-600">RG</p>
              <p className="text-gray-800">{formatRg(owner.rg)}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-gray-600">Órgão Emissor</p>
              <p className="text-gray-800">{owner.issuing_body || 'Não informado'}</p>
            </div>
          </div>
        </div>
        
        {/* Contato */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2 flex items-center">
            <FiPhone className="mr-2" /> Contato
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">Telefone/Celular</p>
              <p className="text-gray-800">{formatPhone(owner.celphone)}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-gray-600">E-mail</p>
              <p className="text-gray-800">{owner.email || 'Não informado'}</p>
            </div>
          </div>
        </div>
        
        {/* Endereço */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2 flex items-center">
            <FiHome className="mr-2" /> Endereço
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">CEP</p>
              <p className="text-gray-800">{formatCep(owner.cep)}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-gray-600">Estado/Cidade</p>
              <p className="text-gray-800">
                {city ? `${city.states?.name || ''} - ${city.name}` : 'Não informado'}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-gray-600">Logradouro</p>
              <p className="text-gray-800">{owner.street || 'Não informado'}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-gray-600">Número</p>
              <p className="text-gray-800">{owner.number || 'Não informado'}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-gray-600">Complemento</p>
              <p className="text-gray-800">{owner.complement || 'Não informado'}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-gray-600">Bairro</p>
              <p className="text-gray-800">{owner.neighborhood || 'Não informado'}</p>
            </div>
          </div>
        </div>
        
        {/* Parceiros/Cônjuges */}
        {id && <PartnerList personId={id} />}
        
        {/* Observações */}
        {owner.note && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2 flex items-center">
              <FiFile className="mr-2" /> Observações
            </h2>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-800 whitespace-pre-line">{owner.note}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDetails; 