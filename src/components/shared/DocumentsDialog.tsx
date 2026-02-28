import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../TiptapEditor/components/ui/Icon";
import { useSidebar } from "../providers/SidebarProvider";
import { ToolbarDivider } from "../TiptapEditor/components/ui/Toolbar";
import Dialog from "../TiptapEditor/components/ui/Dialog";

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
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const fetchDocuments = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/documents?page=${page}&limit=6`);
      if (!response.ok) throw new Error("Erro ao carregar documentos");
      const data = await response.json();
      setDocuments(data.documents);
      setPagination({
        currentPage: data.metadata.currentPage,
        totalPages: data.metadata.totalPages,
        totalCount: data.metadata.totalCount,
      });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar documentos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocuments(pagination.currentPage);
    }
  }, [isOpen, pagination.currentPage]);

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
    router.push(`/${locale}?docId=${id}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <div className="w-full max-w-3xl flex flex-col relative outline-none">
        {/* Overlay de Pré-visualização (Quick Look Style) */}
        <AnimatePresence>
          {previewDoc && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-[120] bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl flex flex-col overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-black/20">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-md">
                    {previewDoc.title || "Sem título"}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-widest">
                    Pŕe-visualização •{" "}
                    {new Date(previewDoc.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <Icon name="Close" size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 md:p-12 prose prose-slate dark:prose-invert max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: previewDoc.content }}
                  className="bg-white/50 dark:bg-black/20 p-10 rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5"
                />
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-center gap-3 bg-white/50 dark:bg-black/20">
                <button
                  onClick={() => {
                    handleEdit(previewDoc.id);
                    setPreviewDoc(null);
                  }}
                  className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 active:scale-95"
                >
                  <Icon name="Edit" size={18} />
                  Editar Agora
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-8 py-3 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-bold rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay de Confirmação de Exclusão */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[110] bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md flex items-center justify-center p-8"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-xs w-full text-center space-y-6"
              >
                <div className="flex justify-center">
                  <div className="p-5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500">
                    <Icon name="Trash" size={32} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Excluir documento?
                  </h3>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Essa ação é permanente e não pode ser desfeita.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleDelete(confirmDelete)}
                    className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-all active:scale-95"
                  >
                    Excluir Permanentemente
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="w-full py-3.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white font-bold rounded-2xl transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header do Diálogo */}
        <div className="px-8 py-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Meus Documentos
            </h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest">
              Nuvem • {pagination.totalCount} itens
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-all active:scale-90"
          >
            <Icon name="Close" size={24} />
          </button>
        </div>

        {/* Lista de Documentos */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-blue-500 border-t-transparent"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gray-50 dark:bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon
                  name="Drafts"
                  size={40}
                  className="text-gray-300 dark:text-gray-700"
                />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Nenhum documento encontrado.
              </p>
            </div>
          ) : (
            documents.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleEdit(doc.id)}
                className="group flex items-center justify-between p-5 rounded-[24px] bg-white dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer transition-all border border-gray-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/20 shadow-sm"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-[18px] font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {doc.title || "Sem título"}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-4 text-[13px] font-medium text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1.5">
                      Criado: {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-800"></span>
                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      Salvo: {new Date(doc.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewDoc(doc);
                    }}
                    className="p-2.5 rounded-full bg-white dark:bg-black/20 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 shadow-sm border border-gray-100 dark:border-white/5 transition-all"
                    title="Quick Look"
                  >
                    <Icon name="Eye" size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(doc.id);
                    }}
                    className="p-2.5 rounded-full bg-white dark:bg-black/20 text-gray-400 hover:text-emerald-500 shadow-sm border border-gray-100 dark:border-white/5 transition-all"
                    title="Editar"
                  >
                    <Icon name="Edit" size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(doc.id);
                    }}
                    className="p-2.5 rounded-full bg-white dark:bg-black/20 text-gray-400 hover:text-red-500 shadow-sm border border-gray-100 dark:border-white/5 transition-all"
                    title="Excluir"
                  >
                    <Icon name="Trash" size={18} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Rodapé do Diálogo */}
        <div className="px-8 py-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm",
              isSidebarOpen
                ? "bg-blue-500 text-white shadow-blue-500/20"
                : "bg-white dark:bg-white/10 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-white/5 hover:bg-gray-50",
            )}
          >
            <Icon name="Columns" size={18} />
            {isSidebarOpen ? "Fixar Lateral" : "Fixar na Lateral"}
          </button>

          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-4 bg-white dark:bg-white/5 px-4 py-2 rounded-full border border-gray-100 dark:border-white/5 shadow-sm">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: Math.max(1, prev.currentPage - 1),
                  }))
                }
                disabled={pagination.currentPage === 1 || isLoading}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 disabled:opacity-30 transition-colors"
              >
                <Icon name="ChevronLeft" size={20} />
              </button>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest min-w-[40px] text-center">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: Math.min(
                      prev.totalPages,
                      prev.currentPage + 1,
                    ),
                  }))
                }
                disabled={
                  pagination.currentPage === pagination.totalPages || isLoading
                }
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 disabled:opacity-30 transition-colors"
              >
                <Icon name="ChevronRight" size={20} />
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-bold rounded-full hover:opacity-90 transition-opacity active:scale-95"
          >
            Concluído
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default DocumentsDialog;
