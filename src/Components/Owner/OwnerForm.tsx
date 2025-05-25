import { useState, useEffect, FormEvent, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Owner } from '../../interfaces/Person';
import { ownerService } from '../../services/personService';
import { locationService } from '../../services/locationService';
import { MaritalStatus, State, City } from '../../interfaces/Person';
import { FiSave, FiArrowLeft, FiSearch } from 'react-icons/fi';
import InputMask from 'react-input-mask';
import { supabase } from '../../SuperbaseConfig/supabaseClient';

import './OwnerForm.css'; // Importar o CSS para estilos
import '../Common/FormStyles.css'; // Importar estilos globais de formulário
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Inicializador para formulário vazio
const initialOwnerState: Omit<Owner, 'id' | 'created_at' | 'updated_at'> = {
  role: 'OWNER',
  full_name: '',
  marital_status_id: 0,
  profession: '',
  rg: '',
  issuing_body: '',
  cpf: '',
  cellphone: '',
  email: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city_id: 0,
  note: '',
  uf_rg: '',
  gender: '',
  nationality: '',
  branch: '',
  account: '',
  bank: '',
  account_type: '',
};

// Tipo para arquivos armazenados
interface StoredFile {
  name: string;
  size: number;
  created_at: string;
  id: string;
  url: string;
  metadata?: {
    size: number;
    mimetype: string;
  };
}

const OwnerForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [owner, setOwner] = useState<Omit<Owner, 'role'>>(initialOwnerState);
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

  // Estado para arquivos
  const [files, setFiles] = useState<File[]>([]);

  // Estado para arquivos armazenados
  const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);

  // Ref para o input de arquivos
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para controlar quando o usuário está arrastando um arquivo
  const [isDragging, setIsDragging] = useState(false);

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

  // Carregar dados do proprietário se estiver em modo de edição
  useEffect(() => {
    if (isEditMode && id) {
      const fetchOwner = async () => {
        try {
          setLoading(true);
          const ownerData = await ownerService.getById(id);

          if (!ownerData) {
            throw new Error('Proprietário não encontrado');
          }

          // Remover campo 'role' antes de definir o estado
          const { role, ...ownerWithoutRole } = ownerData;
          setOwner(ownerWithoutRole);

          // Se o proprietário tem um estado definido (através da cidade), carregar as cidades desse estado
          if (ownerData.city_id) {
            const cityData = await locationService.getCityById(ownerData.city_id);
            if (cityData && cityData.states) {
              setSelectedStateId(cityData.states.id);
              const citiesData = await locationService.getCitiesByState(cityData.states.id);
              setCities(citiesData);
            }
          }

          // Carregar arquivos existentes
          await loadStoredFiles(id);
        } catch (err) {
          console.error('Erro ao carregar proprietário:', err);
          setError('Erro ao carregar dados do proprietário. Por favor, tente novamente.');
        } finally {
          setLoading(false);
        }
      };

      fetchOwner();
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
          if (owner.city_id) {
            const cityExists = citiesData.some(city => city.id === owner.city_id);
            if (!cityExists) {
              setOwner(prev => ({ ...prev, city_id: undefined }));
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
      if (owner.city_id) {
        setOwner(prev => ({ ...prev, city_id: undefined }));
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
      setOwner(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
    } else if (name === 'uf_rg') {
      setOwner(prev => ({ ...prev, [name]: value }));
    } else {
      setOwner(prev => ({ ...prev, [name]: value }));
    }
  };

  // Buscar endereço pelo CEP
  const handleCepSearch = async () => {
    const cep = owner.cep?.replace(/\D/g, '');

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

        setOwner(prev => ({
          ...prev,
          street: data.logradouro,
          neighborhood: data.bairro,
          city_id: city?.id
        }));
      } else {
        // Se não encontrou o estado, apenas preencher os campos de endereço
        setOwner(prev => ({
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

  // Função para lidar com o evento de arrastar sobre a área
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Função para lidar com o evento de sair da área de arrastar
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Função para lidar com o drop de arquivos
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
  };

  // Função para processar arquivos
  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    if (fileArray.length + files.length > 3) {
      alert('Você pode fazer upload de no máximo 3 arquivos.');
      return;
    }
    const validFiles = fileArray.filter(file => file.size <= 2 * 1024 * 1024 && file.type === 'application/pdf');
    if (validFiles.length !== fileArray.length) {
      alert('Alguns arquivos foram ignorados por não serem PDFs ou por excederem 2MB.');
    }
    setFiles(prevFiles => [...prevFiles, ...validFiles]);
  };

  // Função para carregar arquivos armazenados
  const loadStoredFiles = async (ownerId: string) => {
    try {
      // Listar arquivos no bucket para o proprietário específico
      const { data: files, error } = await supabase.storage
        .from('owner-files')
        .list(`owner/${ownerId}`);

      if (error) {
        console.error('Erro ao listar arquivos:', error);
        return;
      }

      // Processar arquivos para incluir URLs de download
      if (files && files.length > 0) {
        const processedFiles = await Promise.all(files.map(async (file) => {
          // Gerar URL para download
          const { data: urlData } = await supabase.storage
            .from('owner-files')
            .createSignedUrl(`owner/${ownerId}/${file.name}`, 60 * 60); // URL válida por 1 hora

          return {
            ...file,
            url: urlData?.signedUrl || '',
            id: file.id || file.name // Garantir que temos um ID
          };
        }));

        setStoredFiles(processedFiles);
      }
    } catch (err) {
      console.error('Erro ao carregar arquivos armazenados:', err);
    }
  };

  // Função para baixar um arquivo
  const handleDownloadFile = async (url: string, fileName: string) => {
    try {
      // Fazer o download como blob para forçar o download em vez de abrir no navegador
      const response = await fetch(url);
      const blob = await response.blob();

      // Criar um objeto URL para o blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Criar um link e definir configurações para forçar download
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      a.setAttribute('target', '_blank');
      a.style.display = 'none';

      // Adicionar à página, clicar e remover
      document.body.appendChild(a);
      a.click();

      // Limpar após o download
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      alert('Não foi possível baixar o arquivo. Tente novamente.');
    }
  };

  // Função para remover um arquivo armazenado
  const handleDeleteStoredFile = async (fileName: string) => {
    if (!id) return;

    try {
      const filePath = `owner/${id}/${fileName}`;
      const { error } = await supabase.storage
        .from('owner-files')
        .remove([filePath]);

      if (error) {
        console.error('Erro ao excluir arquivo:', error);
        return;
      }

      // Atualizar a lista de arquivos
      setStoredFiles(prev => prev.filter(file => file.name !== fileName));
    } catch (err) {
      console.error('Erro ao excluir arquivo:', err);
    }
  };

  // Função para fazer upload dos arquivos para o Supabase
  const uploadFiles = async () => {
    // Verificar se temos um ID válido
    if (!owner.id) {
      console.error('ID do proprietário não disponível');
      return [];
    }

    const uploads = files.map(async (file) => {
      const filePath = `owner/${owner.id}/${file.name}`;

      // Verificar se já existe um arquivo com o mesmo nome para evitar duplicação
      const { data: existingFiles } = await supabase.storage
        .from('owner-files')
        .list(`owner/${owner.id}`);

      // Se o arquivo já existir, excluí-lo antes de fazer o upload
      if (existingFiles?.some(ef => ef.name === file.name)) {
        await supabase.storage
          .from('owner-files')
          .remove([filePath]);
      }

      // Configurar o upload com opções públicas
      const { data, error } = await supabase.storage
        .from('owner-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'application/pdf'
        });

      if (error) {
        console.error('Erro ao fazer upload do arquivo:', error);
        throw error;
      }

      return data;
    });

    return Promise.all(uploads);
  };

  // Enviar formulário
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Verificar campos obrigatórios
    const missingFields = [];
    if (!owner.cep) missingFields.push('CEP');
    if (!owner.street) missingFields.push('Logradouro');
    if (!owner.number) missingFields.push('Número');
    if (!owner.neighborhood) missingFields.push('Bairro');
    if (!owner.city_id) missingFields.push('Cidade');
    if (!owner.cellphone) missingFields.push('Telefone/Celular');
    if (!owner.email) missingFields.push('E-mail');
    if (!owner.rg) missingFields.push('RG');
    if (!owner.issuing_body) missingFields.push('Órgão Emissor');
    if (!owner.uf_rg) missingFields.push('UF do RG');

    if (missingFields.length > 0) {
      toast.error(`Os seguintes campos são obrigatórios: ${missingFields.join(', ')}`);
      return;
    }

    // Verificar se o UF do RG tem mais de 2 caracteres
    if (owner.uf_rg.length > 2) {
      toast.error('O campo UF do RG não pode conter mais de 2 caracteres.');
      return;
    }

    // Certificar-se de que o UF do RG está em maiúsculas
    const ownerData = { ...owner, uf_rg: owner.uf_rg.toUpperCase() };

    // Validação básica
    if (!ownerData.full_name || !ownerData.full_name.trim()) {
      setError('Nome completo é obrigatório');
      return;
    }

    if (!ownerData.cpf || ownerData.cpf.length !== 11) {
      setError('CPF inválido. Deve conter 11 dígitos');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      let ownerId = id;

      // Remover propriedades não primitivas ou calculadas
      const { cities, states, ...ownerDataToSend } = ownerData as any;

      if (isEditMode && id) {
        await ownerService.update(id, ownerDataToSend);
      } else {
        const newOwner = await ownerService.create(ownerDataToSend);
        setOwner(newOwner);
        ownerId = newOwner.id;
      }

      // Só fazer upload se tiver arquivos novos selecionados
      if (files.length > 0) {
        await uploadFiles();
      }

      navigate('/owners');
    } catch (err: any) {
      console.error('Erro ao salvar proprietário:', err);
      // Verificar se é um erro de duplicidade de CPF
      if (err.message?.includes('unique constraint') && err.message?.includes('cpf')) {
        setError('CPF já cadastrado para outro proprietário.');
      } else {
        setError('Erro ao salvar proprietário. Por favor, tente novamente.');
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
          {isEditMode ? 'Editar Proprietário' : 'Novo Proprietário'}
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
              value={owner.full_name}
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
              value={owner.marital_status_id || ''}
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
              value={owner.profession || ''}
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
              value={owner.cpf || ''}
              onChange={(e) => {
                // Remover caracteres não numéricos antes de salvar no state
                const numericValue = e.target.value.replace(/\D/g, '');
                setOwner(prev => ({ ...prev, cpf: numericValue }));
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {/* RG */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rg">
              RG *
            </label>
            <InputMask
              mask="99.999.999-9"
              type="text"
              id="rg"
              name="rg"
              value={owner.rg || ''}
              onChange={(e) => {
                // Salvar com a máscara removida
                const value = e.target.value.replace(/[^ -]+/g, '');
                setOwner(prev => ({ ...prev, rg: value }));
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Órgão Emissor */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="issuing_body">
              Órgão Emissor *
            </label>
            <input
              type="text"
              id="issuing_body"
              name="issuing_body"
              value={owner.issuing_body || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* UF do RG */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="uf_rg">
              UF do RG *
            </label>
            <input
              type="text"
              id="uf_rg"
              name="uf_rg"
              value={owner.uf_rg || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Gênero */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
              Gênero
            </label>
            <select
              id="gender"
              name="gender"
              value={owner.gender || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Selecione...</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          {/* Nacionalidade */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nationality">
              Nacionalidade
            </label>
            <input
              type="text"
              id="nationality"
              name="nationality"
              value={owner.nationality || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Agência Bancária */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="branch">
              Agência Bancária
            </label>
            <input
              type="text"
              id="branch"
              name="branch"
              value={owner.branch || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Número da Conta */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="account">
              Número da Conta
            </label>
            <input
              type="text"
              id="account"
              name="account"
              value={owner.account || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Nome do Banco */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bank">
              Nome do Banco
            </label>
            <input
              type="text"
              id="bank"
              name="bank"
              value={owner.bank || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Tipo de Conta */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="account_type">
              Tipo de Conta
            </label>
            <select
              id="account_type"
              name="account_type"
              value={owner.account_type || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Selecione...</option>
              <option value="Corrente">Corrente</option>
              <option value="Poupança">Poupança</option>
            </select>
          </div>

          {/* Contatos */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
              Contato
            </h2>
          </div>

          {/* Celular */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cellphone">
              Telefone/Celular *
            </label>
            <InputMask
              mask="(99) 99999-9999"
              type="text"
              id="cellphone"
              name="cellphone"
              value={owner.cellphone || ''}
              onChange={(e) => {
                // Remover caracteres não numéricos
                const numericValue = e.target.value.replace(/\D/g, '');
                setOwner(prev => ({ ...prev, cellphone: numericValue }));
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              E-mail *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={owner.email || ''}
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
              CEP *
            </label>
            <div className="flex">
              <InputMask
                mask="99999-999"
                type="text"
                id="cep"
                name="cep"
                value={owner.cep || ''}
                onChange={(e) => {
                  // Remover caracteres não numéricos
                  const numericValue = e.target.value.replace(/\D/g, '');
                  setOwner(prev => ({ ...prev, cep: numericValue }));
                }}
                className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <button
                type="button"
                onClick={handleCepSearch}
                disabled={loadingCep || !owner.cep || owner.cep.length !== 8}
                className={`px-4 py-2 rounded-r flex items-center ${loadingCep || !owner.cep || owner.cep.length !== 8
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
              Cidade *
            </label>
            <select
              id="city_id"
              name="city_id"
              value={owner.city_id || ''}
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

          {/* Bairro */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="neighborhood">
              Bairro *
            </label>
            <input
              type="text"
              id="neighborhood"
              name="neighborhood"
              value={owner.neighborhood || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Logradouro */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="street">
              Logradouro *
            </label>
            <input
              type="text"
              id="street"
              name="street"
              value={owner.street || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Número */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="number">
              Número *
            </label>
            <input
              type="text"
              id="number"
              name="number"
              value={owner.number || ''}
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
              value={owner.complement || ''}
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
              value={owner.note || ''}
              onChange={handleChange}
              rows={4}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>

          {/* Upload de Arquivos */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="files">
              Upload de Arquivos (PDF, máx. 2MB cada, até 3 arquivos)
            </label>
            <div className="upload-container w-full">
              <div
                className={`drop-area ${isDragging ? 'drag-active' : ''} w-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <p>Arraste e solte os arquivos aqui ou clique para selecionar</p>
                <input
                  type="file"
                  multiple
                  accept="application/pdf"
                  onChange={(e) => handleFiles(e.target.files)}
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                />
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2">
                Selecionar Arquivos
              </button>
            </div>

            {/* Lista de arquivos selecionados para upload */}
            {files.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-semibold mb-2">Arquivos selecionados para upload:</h4>
                <ul>
                  {files.map((file, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>
                        {file.name}
                        <span className="text-xs text-gray-500 ml-2">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Lista de arquivos já armazenados */}
            {storedFiles.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-semibold mb-2">Arquivos já salvos:</h4>
                <ul>
                  {storedFiles.map((file) => (
                    <li key={file.id} className="flex justify-between items-center">
                      <span>
                        {file.name}
                        <span className="text-xs text-gray-500 ml-2">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </span>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(file.url, file.name)}
                          className="text-blue-500 hover:text-blue-700 mr-2"
                        >
                          Baixar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStoredFile(file.name)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Excluir
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>



        {/* Botões de ação */}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={() => navigate('/owners')}
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

      <ToastContainer aria-label="Notificações" />
    </div>
  );
};

export default OwnerForm; 
