import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ownerService, lesseeService } from '../services/personService';
import { realEstateService } from '../services/realEstateService';
import { contractService } from '../services/contractService';
import { FiHome, FiUsers, FiUserPlus, FiUser, FiKey, FiFileText } from 'react-icons/fi';
import { useAuth } from './AuthProvider';

const Dashboard = () => {
  const [ownerCount, setOwnerCount] = useState<number>(0);
  const [lesseeCount, setLesseeCount] = useState<number>(0);
  const [realEstateCount, setRealEstateCount] = useState<number>(0);
  const [contractCount, setContractCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        
        // Buscar contagem de proprietários e inquilinos
        const owners = await ownerService.getAll();
        const lessees = await lesseeService.getAll();
        
        setOwnerCount(owners.length);
        setLesseeCount(lessees.length);
        
        // Buscar imóveis em uma operação separada para facilitar a depuração
        try {
          const realEstates = await realEstateService.getAll();
          setRealEstateCount(realEstates.length);
        } catch (realEstateErr) {
          console.error('Erro específico ao carregar imóveis:', realEstateErr);
          setError('Erro ao carregar imóveis. Verifique o console para mais detalhes.');
        }
        
        // Buscar contratos
        try {
          const contracts = await contractService.getAll();
          setContractCount(contracts.length);
        } catch (contractErr) {
          console.error('Erro específico ao carregar contratos:', contractErr);
          // Não definimos um erro aqui, apenas logamos
        }
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Erro ao carregar dados. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCounts();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Painel de Controle</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Card de proprietários */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Proprietários</p>
              <p className="text-3xl font-bold text-gray-800">{ownerCount}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FiUser className="text-blue-500 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/owners"
              className="text-blue-500 text-sm hover:underline"
            >
              Ver todos
            </Link>
          </div>
        </div>
        
        {/* Card de inquilinos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Inquilinos</p>
              <p className="text-3xl font-bold text-gray-800">{lesseeCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiUser className="text-green-500 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/lessees"
              className="text-green-500 text-sm hover:underline"
            >
              Ver todos
            </Link>
          </div>
        </div>
        
        {/* Card de imóveis */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Imóveis</p>
              <p className="text-3xl font-bold text-gray-800">{realEstateCount}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FiHome className="text-orange-500 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/real-estates"
              className="text-orange-500 text-sm hover:underline"
            >
              Ver todos
            </Link>
          </div>
        </div>
        
        {/* Card de contratos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Contratos</p>
              <p className="text-3xl font-bold text-gray-800">{contractCount}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FiFileText className="text-purple-500 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/contracts"
              className="text-purple-500 text-sm hover:underline"
            >
              Ver todos
            </Link>
          </div>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Ações Rápidas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/owners/new"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center text-center"
        >
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <FiUserPlus className="text-blue-500 text-2xl" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Novo Proprietário</h3>
          <p className="text-gray-600 text-sm">Cadastrar um novo proprietário no sistema</p>
        </Link>
        
        <Link
          to="/lessees/new"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center text-center"
        >
          <div className="bg-green-100 p-4 rounded-full mb-4">
            <FiUserPlus className="text-green-500 text-2xl" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Novo Inquilino</h3>
          <p className="text-gray-600 text-sm">Cadastrar um novo inquilino no sistema</p>
        </Link>
        
        <Link
          to="/real-estates/new"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center text-center"
        >
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <FiHome className="text-orange-500 text-2xl" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Novo Imóvel</h3>
          <p className="text-gray-600 text-sm">Cadastrar um novo imóvel no sistema</p>
        </Link>
        
        <Link
          to="/contracts/new"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center text-center"
        >
          <div className="bg-purple-100 p-4 rounded-full mb-4">
            <FiFileText className="text-purple-500 text-2xl" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Novo Contrato</h3>
          <p className="text-gray-600 text-sm">Cadastrar um novo contrato no sistema</p>
        </Link>
        
        <Link
          to="/owners"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center text-center"
        >
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <FiUsers className="text-blue-500 text-2xl" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Proprietários</h3>
          <p className="text-gray-600 text-sm">Gerenciar proprietários cadastrados</p>
        </Link>
        
        <Link
          to="/lessees"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center text-center"
        >
          <div className="bg-green-100 p-4 rounded-full mb-4">
            <FiUsers className="text-green-500 text-2xl" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Inquilinos</h3>
          <p className="text-gray-600 text-sm">Gerenciar inquilinos cadastrados</p>
        </Link>
        
        <Link
          to="/real-estates"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center text-center"
        >
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <FiKey className="text-orange-500 text-2xl" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Imóveis</h3>
          <p className="text-gray-600 text-sm">Gerenciar imóveis cadastrados</p>
        </Link>
        
        <Link
          to="/contracts"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center text-center"
        >
          <div className="bg-purple-100 p-4 rounded-full mb-4">
            <FiFileText className="text-purple-500 text-2xl" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Contratos</h3>
          <p className="text-gray-600 text-sm">Gerenciar contratos cadastrados</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard; 