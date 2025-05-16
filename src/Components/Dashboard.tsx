import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ownerService, lesseeService } from '../services/personService';
import { realEstateService } from '../services/realEstateService';
import { FiHome, FiUsers, FiUserPlus, FiUser, FiLogOut, FiKey } from 'react-icons/fi';
import { useAuth } from './AuthProvider';

const Dashboard = () => {
  const [ownerCount, setOwnerCount] = useState<number>(0);
  const [lesseeCount, setLesseeCount] = useState<number>(0);
  const [realEstateCount, setRealEstateCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { session, supabase } = useAuth();
  
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        
        // Buscar contagem de proprietários, inquilinos e imóveis
        const owners = await ownerService.getAll();
        const lessees = await lesseeService.getAll();
        const realEstates = await realEstateService.getAll();
        
        setOwnerCount(owners.length);
        setLesseeCount(lessees.length);
        setRealEstateCount(realEstates.length);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCounts();
  }, []);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
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
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Painel de Controle</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md flex items-center"
        >
          <FiLogOut className="mr-2" /> Sair
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
      </div>
      
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Ações Rápidas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          to="/owners"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center text-center"
        >
          <div className="bg-purple-100 p-4 rounded-full mb-4">
            <FiUsers className="text-purple-500 text-2xl" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Proprietários</h3>
          <p className="text-gray-600 text-sm">Gerenciar proprietários cadastrados</p>
        </Link>
        
        <Link
          to="/lessees"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center text-center"
        >
          <div className="bg-yellow-100 p-4 rounded-full mb-4">
            <FiUsers className="text-yellow-500 text-2xl" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Inquilinos</h3>
          <p className="text-gray-600 text-sm">Gerenciar inquilinos cadastrados</p>
        </Link>
        
        <Link
          to="/real-estates"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center text-center"
        >
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <FiKey className="text-red-500 text-2xl" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Imóveis</h3>
          <p className="text-gray-600 text-sm">Gerenciar imóveis cadastrados</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard; 