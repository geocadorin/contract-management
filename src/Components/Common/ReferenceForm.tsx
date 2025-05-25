import { useState, useEffect, FormEvent } from 'react';
import { PersonReference } from '../../interfaces/Person';
import { personService } from '../../services/personService';
import { FiSave, FiX, FiSearch } from 'react-icons/fi';
import InputMask from 'react-input-mask';

interface ReferenceFormProps {
    personId: string;
    reference?: PersonReference;
    onSave: () => void;
    onCancel: () => void;
}

// Inicializador para formulário vazio
const initialReferenceState: Omit<PersonReference, 'id' | 'created_at' | 'updated_at'> = {
    person_id: '',
    full_name: '',
    email: '',
    telefone: '',
    endereco_completo: '',
    cep: '',
    kinship: '',
};

const ReferenceForm = ({ personId, reference, onSave, onCancel }: ReferenceFormProps) => {
    const isEditMode = !!reference?.id;

    const [referenceData, setReferenceData] = useState<Omit<PersonReference, 'id' | 'created_at' | 'updated_at'>>(
        reference ? {
            person_id: reference.person_id,
            full_name: reference.full_name || '',
            email: reference.email || '',
            telefone: reference.telefone || '',
            endereco_completo: reference.endereco_completo || '',
            cep: reference.cep || '',
            kinship: reference.kinship || ''
        } : { ...initialReferenceState, person_id: personId }
    );

    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingCep, setLoadingCep] = useState<boolean>(false);
    const [cepError, setCepError] = useState<string | null>(null);

    // Atualizar campo do formulário
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setReferenceData(prev => ({ ...prev, [name]: value }));
    };

    // Buscar endereço pelo CEP
    const handleCepSearch = async () => {
        const cep = referenceData.cep?.replace(/\D/g, '');

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

            // Montar endereço completo
            const enderecoCompleto = [
                data.logradouro,
                data.bairro,
                data.localidade,
                data.uf
            ].filter(Boolean).join(', ');

            setReferenceData(prev => ({
                ...prev,
                endereco_completo: enderecoCompleto
            }));

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
        if (!referenceData.full_name || !referenceData.full_name.trim()) {
            setError('Nome completo é obrigatório');
            return;
        }

        if (!referenceData.telefone || !referenceData.telefone.trim()) {
            setError('Telefone é obrigatório');
            return;
        }

        if (!referenceData.kinship || !referenceData.kinship.trim()) {
            setError('Parentesco é obrigatório');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            if (isEditMode && reference?.id) {
                await personService.updateReference(reference.id, referenceData);
            } else {
                await personService.createReference({
                    ...referenceData,
                    person_id: personId
                });
            }

            onSave();
        } catch (err: any) {
            console.error('Erro ao salvar referência:', err);

            // Verificar erros específicos
            if (err.message?.includes('unique constraint')) {
                setError('Dados já cadastrados para outra referência.');
            } else if (err.message?.includes('unique constraint') && err.message?.includes('email')) {
                setError('Email já cadastrado para outra referência.');
            } else {
                setError('Erro ao salvar referência. Por favor, tente novamente.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    {isEditMode ? 'Editar Referência' : 'Adicionar Referência'}
                </h3>
                <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    title="Fechar"
                >
                    <FiX size={20} />
                </button>
            </div>

            {/* Mensagem de erro */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center">
                        <span className="text-red-600 text-xs">!</span>
                    </div>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informações pessoais */}
                    <div className="col-span-1 md:col-span-2 pb-3 mb-6 border-b border-gray-200">
                        <h4 className="font-medium text-gray-700 text-base">Informações Pessoais</h4>
                        <p className="text-sm text-gray-500 mt-1">Dados básicos da referência pessoal</p>
                    </div>

                    {/* Nome completo */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="full_name">
                            Nome Completo *
                        </label>
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={referenceData.full_name}
                            onChange={handleChange}
                            className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Digite o nome completo"
                            required
                        />
                    </div>



                    {/* Parentesco */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="kinship">
                            Parentesco/Relação *
                        </label>
                        <select
                            id="kinship"
                            name="kinship"
                            value={referenceData.kinship || ''}
                            onChange={handleChange}
                            className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                        >
                            <option value="">Selecione...</option>
                            <option value="Pai">Pai</option>
                            <option value="Mãe">Mãe</option>
                            <option value="Irmão(ã)">Irmão(ã)</option>
                            <option value="Filho(a)">Filho(a)</option>
                            <option value="Cônjuge">Cônjuge</option>
                            <option value="Amigo(a)">Amigo(a)</option>
                            <option value="Colega de trabalho">Colega de trabalho</option>
                            <option value="Vizinho(a)">Vizinho(a)</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>


                    {/* Contato */}
                    <div className="col-span-1 md:col-span-2 pb-3 mb-6 border-b border-gray-200">
                        <h4 className="font-medium text-gray-700 text-base">Contato</h4>
                        <p className="text-sm text-gray-500 mt-1">Informações para contato</p>
                    </div>

                    {/* Email */}
                    <div className="mb-4 ">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                            E-mail
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={referenceData.email || ''}
                            onChange={handleChange}
                            className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="exemplo@email.com"
                        />
                    </div>

                    {/* Telefone/Celular */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="telefone">
                            Telefone/Celular *
                        </label>
                        <InputMask
                            mask="(99) 99999-9999"
                            type="text"
                            id="telefone"
                            name="telefone"
                            value={referenceData.telefone || ''}
                            onChange={(e) => {
                                // Remover caracteres não numéricos
                                const numericValue = e.target.value.replace(/\D/g, '');
                                setReferenceData({ ...referenceData, telefone: numericValue });
                            }}
                            className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="(00) 00000-0000"
                            required
                        />
                    </div>


                    {/* Endereço */}
                    <div className="col-span-1 md:col-span-2 pb-3 mb-6 border-b border-gray-200">
                        <h4 className="font-medium text-gray-700 text-base">Endereço</h4>
                        <p className="text-sm text-gray-500 mt-1">Endereço completo da referência</p>
                    </div>

                    {/* CEP */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="cep">
                            CEP
                        </label>
                        <div className="flex">
                            <InputMask
                                mask="99999-999"
                                type="text"
                                id="cep"
                                name="cep"
                                value={referenceData.cep || ''}
                                onChange={(e) => {
                                    // Remover caracteres não numéricos
                                    const numericValue = e.target.value.replace(/\D/g, '');
                                    setReferenceData({ ...referenceData, cep: numericValue });
                                }}
                                className="shadow-sm appearance-none border border-gray-300 rounded-l-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="00000-000"
                            />
                            <button
                                type="button"
                                onClick={handleCepSearch}
                                disabled={loadingCep || !referenceData.cep || referenceData.cep.length !== 8}
                                className={`px-4 py-3 rounded-r-lg border border-l-0 border-gray-300 flex items-center gap-2 transition-all ${loadingCep || !referenceData.cep || referenceData.cep.length !== 8
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600 border-blue-500'
                                    }`}
                                title="Buscar endereço pelo CEP"
                            >
                                {loadingCep ? (
                                    <span className="animate-spin">⭘</span>
                                ) : (
                                    <FiSearch size={16} />
                                )}
                                {loadingCep ? 'Buscando...' : 'Buscar'}
                            </button>
                        </div>
                        {cepError && (
                            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-red-100 flex items-center justify-center">
                                    <span className="text-red-500 text-xs">!</span>
                                </span>
                                {cepError}
                            </p>
                        )}
                    </div>

                    {/* Endereço Completo */}
                    <div className="mb-4 col-span-1 md:col-span-2">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="endereco_completo">
                            Endereço Completo
                        </label>
                        <textarea
                            id="endereco_completo"
                            name="endereco_completo"
                            value={referenceData.endereco_completo || ''}
                            onChange={handleChange}
                            rows={3}
                            className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            placeholder="Digite o endereço completo ou use o botão 'Buscar' no CEP para preenchimento automático"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Dica: Preencha o CEP e clique em "Buscar" para preenchimento automático
                        </p>
                    </div>
                </div>

                {/* Botões de ação */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2.5 px-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all flex items-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <span className="animate-spin">⭘</span>
                                Salvando...
                            </>
                        ) : (
                            <>
                                <FiSave size={16} />
                                Salvar Referência
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReferenceForm; 
