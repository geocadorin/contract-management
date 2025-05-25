import React, { useState, useEffect } from 'react';
import { PersonReference } from '../../interfaces/Person';
import { personService } from '../../services/personService';
import { FiPlus, FiEdit, FiTrash2, FiUsers, FiPhone, FiMail, FiMapPin, FiUser } from 'react-icons/fi';
import ReferenceForm from './ReferenceForm';

interface ReferenceListProps {
    personId: string;
}

const ReferenceList: React.FC<ReferenceListProps> = ({ personId }) => {
    const [references, setReferences] = useState<PersonReference[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingReference, setEditingReference] = useState<PersonReference | undefined>();

    useEffect(() => {
        loadReferences();
    }, [personId]);

    const loadReferences = async () => {
        try {
            setLoading(true);
            const data = await personService.getReferences(personId);
            setReferences(data);
        } catch (error) {
            console.error('Erro ao carregar referências:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveReference = async () => {
        try {
            await loadReferences();
            setShowForm(false);
            setEditingReference(undefined);
        } catch (error) {
            console.error('Erro ao salvar referência:', error);
        }
    };

    const handleEditReference = (reference: PersonReference) => {
        setEditingReference(reference);
        setShowForm(true);
    };

    const handleDeleteReference = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta referência?')) {
            try {
                await personService.deleteReference(id);
                await loadReferences();
            } catch (error) {
                console.error('Erro ao excluir referência:', error);
            }
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingReference(undefined);
    };

    const formatPhone = (phone: string) => {
        if (!phone) return '-';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        }
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    };



    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FiUsers className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                Referências Pessoais
                            </h3>
                            <p className="text-sm text-gray-500">
                                Pessoas que podem fornecer referências sobre o cliente
                            </p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                            {references.length}
                        </span>
                    </div>

                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
                        >
                            <FiPlus size={16} />
                            Adicionar Referência
                        </button>
                    )}
                </div>

                {/* Lista de Referências */}
                {references.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <div className="p-4 bg-gray-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <FiUsers size={32} className="text-gray-300" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-600 mb-2">Nenhuma referência cadastrada</h4>
                        <p className="text-sm text-gray-500 mb-4">
                            Adicione referências pessoais para fortalecer o perfil do cliente
                        </p>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                            >
                                <FiPlus size={16} />
                                Adicionar Primeira Referência
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {references.map((reference) => (
                            <div key={reference.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Nome e Parentesco */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <FiUser className="text-gray-400" size={16} />
                                                <span className="font-medium text-gray-900">
                                                    {reference.full_name}
                                                </span>
                                            </div>
                                            {reference.kinship && (
                                                <div className="text-sm text-gray-600">
                                                    <span className="bg-gray-200 px-2 py-1 rounded text-xs font-medium">
                                                        {reference.kinship}
                                                    </span>
                                                </div>
                                            )}

                                        </div>

                                        {/* Contato */}
                                        <div className="space-y-2">
                                            {reference.telefone && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <FiPhone className="text-gray-400" size={14} />
                                                    <span>{formatPhone(reference.telefone)}</span>
                                                </div>
                                            )}
                                            {reference.email && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <FiMail className="text-gray-400" size={14} />
                                                    <span className="truncate">{reference.email}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Endereço */}
                                        <div className="space-y-2">
                                            {reference.endereco_completo && (
                                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                                    <FiMapPin className="text-gray-400 mt-0.5" size={14} />
                                                    <span className="line-clamp-2">{reference.endereco_completo}</span>
                                                </div>
                                            )}
                                            {reference.cep && (
                                                <div className="text-xs text-gray-500">
                                                    CEP: {reference.cep.replace(/(\d{5})(\d{3})/, '$1-$2')}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleEditReference(reference)}
                                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                            title="Editar referência"
                                        >
                                            <FiEdit size={16} />
                                        </button>
                                        <button
                                            onClick={() => reference.id && handleDeleteReference(reference.id)}
                                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                            title="Excluir referência"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Formulário */}
            {showForm && (
                <ReferenceForm
                    personId={personId}
                    reference={editingReference}
                    onSave={handleSaveReference}
                    onCancel={handleCancelForm}
                />
            )}
        </div>
    );
};

export default ReferenceList; 
