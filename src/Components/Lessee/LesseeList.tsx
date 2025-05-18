import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lessee } from '../../interfaces/Person';
import { lesseeService } from '../../services/personService';
import { FiEdit, FiTrash2, FiPlus, FiEye, FiSearch, FiChevronLeft, FiChevronRight, FiDownload } from 'react-icons/fi';
import { exportToExcel, formatLesseesForExport } from '../../Utilities/excelExporter';
import ActionDropdown from '../Common/ActionDropdown';

const LesseeList = () => {
  const [lessees, setLessees] = useState<Lessee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState<boolean>(false);

  // Estados para filtros
  const [nameFilter, setNameFilter] = useState<string>('');
  const [cpfFilter, setCpfFilter] = useState<string>('');
  const [rgFilter, setRgFilter] = useState<string>('');
  const [emailFilter, setEmailFilter] = useState<string>('');

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const navigate = useNavigate();

  // Carregar inquilinos
  useEffect(() => {
    const fetchLessees = async () => {
      try {
        setLoading(true);
        const data = await lesseeService.getAll();
        setLessees(data);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar inquilinos. Por favor, tente novamente.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessees();
  }, []);

  // Filtrar inquilinos
  const filteredLessees = lessees.filter(lessee =>
    (nameFilter === '' || lessee.full_name.toLowerCase().includes(nameFilter.toLowerCase())) &&
    (cpfFilter === '' || lessee.cpf?.includes(cpfFilter)) &&
    (rgFilter === '' || lessee.rg?.toLowerCase().includes(rgFilter.toLowerCase())) &&
    (emailFilter === '' || lessee.email?.toLowerCase().includes(emailFilter.toLowerCase()))
  );

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLessees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLessees.length / itemsPerPage);

  // Navegação de páginas
  const goToPage = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Limpar filtros
  const clearFilters = () => {
    setNameFilter('');
    setCpfFilter('');
    setRgFilter('');
    setEmailFilter('');
    setCurrentPage(1);
  };

  // Excluir inquilino
  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este inquilino?')) {
      return;
    }

    try {
      await lesseeService.delete(id);
      setLessees(lessees.filter(lessee => lessee.id !== id));
    } catch (err) {
      setError('Erro ao excluir inquilino. Por favor, tente novamente.');
      console.error(err);
    }
  };

  // Exportar para Excel
  const handleExportToExcel = () => {
    try {
      setExportLoading(true);
      // Exportar todos os inquilinos filtrados (ignorando paginação)
      const formattedData = formatLesseesForExport(filteredLessees);
      exportToExcel(formattedData, 'inquilinos', 'Inquilinos');
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      setError('Erro ao exportar para Excel. Por favor, tente novamente.');
    } finally {
      setExportLoading(false);
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inquilinos</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleExportToExcel}
            disabled={exportLoading || filteredLessees.length === 0}
            className={`bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center ${(exportLoading || filteredLessees.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {exportLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <FiDownload className="mr-2" />
            )}
            Exportar Excel
          </button>
          <Link
            to="/lessees/new"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center"
          >
            <FiPlus className="mr-2" /> Novo Inquilino
          </Link>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FiSearch className="mr-2" /> Filtros
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              placeholder="Filtrar por nome"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
            <input
              type="text"
              placeholder="Filtrar por CPF"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={cpfFilter}
              onChange={(e) => setCpfFilter(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RG</label>
            <input
              type="text"
              placeholder="Filtrar por RG"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={rgFilter}
              onChange={(e) => setRgFilter(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="text"
              placeholder="Filtrar por e-mail"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Lista de inquilinos */}
      {filteredLessees.length > 0 ? (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RG
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-mail
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((lessee) => (
                  <tr key={lessee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {lessee.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lessee.cpf ? lessee.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lessee.rg || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lessee.celphone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lessee.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <ActionDropdown
                          actions={[
                            { label: 'Editar', onClick: () => navigate(`/lessees/${lessee.id}/edit`) },
                            { label: 'Excluir', onClick: () => handleDelete(lessee.id) },
                            { label: 'Visualizar', onClick: () => navigate(`/lessees/${lessee.id}`) }
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">
                {Math.min(indexOfLastItem, filteredLessees.length)}
              </span> de <span className="font-medium">{filteredLessees.length}</span> resultados
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                <FiChevronLeft />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                let pageNumber;

                if (totalPages <= 5) {
                  pageNumber = index + 1;
                } else if (currentPage <= 3) {
                  pageNumber = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + index;
                } else {
                  pageNumber = currentPage - 2 + index;
                }

                if (pageNumber <= totalPages) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`px-3 py-1 rounded ${currentPage === pageNumber
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                <FiChevronRight />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Itens por página:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded p-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">
            {nameFilter || cpfFilter || rgFilter || emailFilter
              ? "Nenhum inquilino encontrado para os filtros aplicados."
              : "Nenhum inquilino cadastrado. Clique em 'Novo Inquilino' para adicionar."}
          </p>
        </div>
      )}
    </div>
  );
};

export default LesseeList; 
