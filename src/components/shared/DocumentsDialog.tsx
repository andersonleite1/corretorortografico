"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "../TiptapEditor/components/ui/Icon";

interface Document {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

interface DocumentsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DocumentsDialog = ({ isOpen, onClose }: DocumentsDialogProps) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/documents");
            if (!response.ok) throw new Error("Erro ao carregar documentos");
            const data = await response.json();
            setDocuments(data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar documentos");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchDocuments();
        }
    }, [isOpen]);

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/documents/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Erro ao excluir documento");
            toast.success("Documento excluído");
            setDocuments(documents.filter((doc) => doc.id !== id));
            setConfirmDelete(null);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir documento");
        }
    };

    const handleEdit = (id: string) => {
        // Redireciona para o editor com o ID do documento
        // No nosso caso, o editor já lida com o conteúdo. 
        // Vamos precisar ajustar o EditForm para carregar o conteúdo baseado no ID da URL.
        router.push(`/${locale}?docId=${id}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-8 overflow-hidden" onClick={onClose}>
            <div
                className="w-full max-w-2xl bg-white dark:bg-[#1c1c1e] rounded-[24px] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Overlay de Pré-visualização */}
                {previewDoc && (
                    <div className="absolute inset-0 z-[120] bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-black/20">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white truncate max-w-md">
                                    Pŕe-visualização: {previewDoc.title || "Sem título"}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">Modo de leitura • {new Date(previewDoc.updatedAt).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => setPreviewDoc(null)}
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
                            >
                                <Icon name="Close" size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 md:p-12 prose prose-slate dark:prose-invert max-w-none">
                            <div
                                dangerouslySetInnerHTML={{ __html: previewDoc.content }}
                                className="bg-white dark:bg-neutral-900/40 p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5"
                            />
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-center gap-3 bg-white/50 dark:bg-black/20">
                            <button
                                onClick={() => {
                                    handleEdit(previewDoc.id);
                                    setPreviewDoc(null);
                                }}
                                className="px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-full hover:opacity-90 transition-opacity flex items-center gap-2"
                            >
                                <Icon name="Edit" size={18} />
                                Editar Documento
                            </button>
                            <button
                                onClick={() => setPreviewDoc(null)}
                                className="px-6 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-medium rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                )}

                {/* Overlay de Confirmação de Exclusão */}
                {confirmDelete && (
                    <div className="absolute inset-0 z-[110] bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in duration-200">
                        <div className="max-w-xs w-full text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="p-4 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500">
                                    <Icon name="Trash" size={32} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Excluir documento?</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Essa ação não pode ser desfeita. O documento será removido permanentemente.</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => handleDelete(confirmDelete)}
                                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-[14px] transition-colors"
                                >
                                    Excluir permanentemente
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="w-full py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white font-medium rounded-[14px] transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Header do Diálogo */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Meus Documentos</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gerencie seus textos salvos na nuvem.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 transition-colors"
                    >
                        <Icon name="Close" size={24} />
                    </button>
                </div>

                {/* Lista de Documentos */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-12">
                            <Icon name="Drafts" size={48} className="mx-auto text-gray-300 dark:text-gray-700" />
                            <p className="mt-4 text-gray-500 dark:text-gray-400">Nenhum documento encontrado.</p>
                        </div>
                    ) : (
                        documents.map((doc) => (
                            <div
                                key={doc.id}
                                onClick={() => handleEdit(doc.id)}
                                className="group flex items-center justify-between p-4 rounded-[16px] hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-gray-100 dark:hover:border-white/10"
                            >
                                <div className="flex-1 min-w-0 pr-4">
                                    <h3 className="text-[17px] font-medium text-gray-900 dark:text-white truncate">
                                        {doc.title || "Sem título"}
                                    </h3>
                                    <div className="mt-1 flex items-center gap-4 text-[13px] text-gray-400 dark:text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            Criado em {new Date(doc.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-800"></span>
                                        <span className="flex items-center gap-1.5">
                                            Editado {new Date(doc.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewDoc(doc);
                                        }}
                                        className="p-2 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors"
                                        title="Pré-visualizar"
                                    >
                                        <Icon name="Eye" size={20} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(doc.id);
                                        }}
                                        className="p-2 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors"
                                        title="Editar"
                                    >
                                        <Icon name="Edit" size={20} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirmDelete(doc.id);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                                        title="Excluir"
                                    >
                                        <Icon name="Trash" size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};

export default DocumentsDialog;
