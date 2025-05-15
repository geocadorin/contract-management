import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthProvider';
import Login from './Login';
import CityList from './CityList';

// Componente protegido que verifica autenticação
const ProtectedApp = () => {
  const { session, loading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!session);
  }, [session]);

  // Função para lidar com login bem-sucedido
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Função para lidar com logout
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Exibir indicador de carregamento enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  // Renderizar componente de login ou lista de cidades com base no estado de autenticação
  return isAuthenticated ? (
    <CityList onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  );
};

// Componente principal que envolve a aplicação com o provedor de autenticação
function App() {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  );
}

export default App;
