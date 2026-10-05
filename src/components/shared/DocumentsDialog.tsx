"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  X,
  Pencil,
  Trash2,
  Eye,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Dialog from "../TiptapEditor/components/ui/Dialog";
import { getAcquisitionContent } from "@/data/acquisition";
import { type Locale } from "../../../i18n-config";
import {
  getLocalDocuments,
  getLocalDocumentText,
  saveLocalDocument,
  deleteLocalDocument,
  type LocalDocument,
} from "@/lib/local-storage";

interface DocumentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userPlan?: "free" | "pro" | "team";
}
export const DocumentsDialog = ({ isOpen, onClose }: DocumentsDialogProps) => {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as Locale) || "pt";
  const t = getAcquisitionContent(locale);
  const [documents, setDocuments] = useState<LocalDocument[]>([]);
  const [readError, setReadError] = useState(false);
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<LocalDocument | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const reload = () => {
    try {
      setDocuments(
        [...getLocalDocuments()].sort(
          (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
        ),
      );
      setReadError(false);
    } catch {
      setReadError(true);
    }
  };
  useEffect(() => {
    if (isOpen) {
      try {
        setDocuments(
          [...getLocalDocuments()].sort(
            (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
          ),
        );
        setReadError(false);
      } catch {
        setReadError(true);
      }
      setPage(1);
      setPreview(null);
      setConfirmDelete(null);
      setRenameId(null);
    }
  }, [isOpen]);
  const pages = Math.max(1, Math.ceil(documents.length / 6));
  const currentPage = Math.min(page, pages);
  const visible = useMemo(
    () => documents.slice((currentPage - 1) * 6, currentPage * 6),
    [documents, currentPage],
  );
  const date = (value: string) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? "—"
      : parsed.toLocaleString(locale === "pt" ? "pt-BR" : locale, {
          dateStyle: "short",
          timeStyle: "short",
        });
  };
  const openDocument = (id: string) => {
    if (
      !window.dispatchEvent(
        new Event("editordetexto:before-leave", { cancelable: true }),
      )
    )
      return;
    router.push(
      `${locale === "pt" ? "/" : `/${locale}`}?docId=${encodeURIComponent(id)}`,
      { scroll: false },
    );
    onClose();
  };
  const rename = (doc: LocalDocument) => {
    if (!name.trim()) return;
    try {
      saveLocalDocument({ ...doc, title: name.trim() });
      window.dispatchEvent(
        new CustomEvent("editordetexto:rename-document", {
          detail: { id: doc.id, title: name.trim() },
        }),
      );
      setRenameId(null);
      reload();
    } catch {
      toast.error(t.renameError);
    }
  };
  const remove = (id: string) => {
    try {
      deleteLocalDocument(id);
      window.dispatchEvent(
        new CustomEvent("editordetexto:delete-document", { detail: id }),
      );
      setConfirmDelete(null);
      reload();
    } catch {
      toast.error(t.deleteError);
    }
  };
  const button =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800";
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={t.documents}
      className="max-w-2xl w-full"
    >
      <div className="flex items-start justify-between gap-4 border-b border-neutral-200 p-5 dark:border-neutral-700">
        <div>
          <h2 className="m-0 text-xl font-bold text-neutral-900 dark:text-white">
            {t.documents}
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
            {t.local} · {documents.length}
          </p>
        </div>
        <button
          type="button"
          aria-label={t.close}
          className={button}
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      <div className="max-h-[60dvh] overflow-y-auto p-4 sm:p-5">
        {readError ? (
          <p role="alert" className="text-sm text-red-800 dark:text-red-200">
            {t.loadError}
          </p>
        ) : preview ? (
          <section>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {preview.title || t.untitled}
            </h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              {t.updated} {date(preview.updatedAt)}
            </p>
            <p className="my-4 whitespace-pre-wrap break-words text-base leading-relaxed text-neutral-800 dark:text-neutral-100">
              {getLocalDocumentText(preview.content) || t.emptyText}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                className={button}
                onClick={() => openDocument(preview.id)}
              >
                {t.open}
              </button>
              <button className={button} onClick={() => setPreview(null)}>
                {t.close}
              </button>
            </div>
          </section>
        ) : documents.length === 0 ? (
          <div className="py-8 text-center">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {t.emptyLibrary}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {t.emptyLibraryHint}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((doc) => (
              <article
                key={doc.id}
                className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700"
              >
                {renameId === doc.id ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      rename(doc);
                    }}
                    className="space-y-3"
                  >
                    <label
                      className="block text-sm font-medium text-neutral-900 dark:text-white"
                      htmlFor={`rename-${doc.id}`}
                    >
                      {t.titleLabel}
                    </label>
                    <input
                      id={`rename-${doc.id}`}
                      autoFocus
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      maxLength={200}
                      className="w-full rounded-lg border border-neutral-300 bg-white p-3 text-base text-neutral-900 focus:outline-emerald-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        className={button}
                        type="submit"
                        disabled={!name.trim()}
                      >
                        {t.save}
                      </button>
                      <button
                        className={button}
                        type="button"
                        onClick={() => setRenameId(null)}
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3 className="break-words text-base font-semibold text-neutral-900 dark:text-white">
                      {doc.title || t.untitled}
                    </h3>
                    <p className="mt-1 line-clamp-2 break-words text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                      {getLocalDocumentText(doc.content) || t.emptyText}
                    </p>
                    <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300">
                      {t.updated} {date(doc.updatedAt)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        className={button}
                        onClick={() => openDocument(doc.id)}
                      >
                        <ArrowRight size={16} />
                        {t.open}
                      </button>
                      <button
                        className={button}
                        onClick={() => {
                          setRenameId(doc.id);
                          setName(doc.title || "");
                        }}
                      >
                        <Pencil size={16} />
                        {t.rename}
                      </button>
                      <button
                        className={button}
                        aria-label={`${t.preview}: ${doc.title || t.untitled}`}
                        onClick={() => setPreview(doc)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className={button}
                        aria-label={`${t.delete}: ${doc.title || t.untitled}`}
                        onClick={() => setConfirmDelete(doc.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {confirmDelete === doc.id && (
                      <div className="mt-3 rounded-xl bg-red-50 p-3 dark:bg-red-950/40">
                        <h4 className="font-semibold text-red-900 dark:text-red-100">
                          {t.deleteQuestion}
                        </h4>
                        <p className="mt-1 text-sm text-red-900 dark:text-red-100">
                          {t.deleteWarning}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            className={button}
                            onClick={() => remove(doc.id)}
                          >
                            {t.delete}
                          </button>
                          <button
                            className={button}
                            onClick={() => setConfirmDelete(null)}
                          >
                            {t.cancel}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 border-t border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-900">
        <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {t.localNote}
        </p>
        <div className="flex items-center justify-between gap-2">
          {pages > 1 ? (
            <div className="flex items-center gap-2">
              <button
                className={button}
                aria-label={t.previous}
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                {currentPage}/{pages}
              </span>
              <button
                className={button}
                aria-label={t.next}
                disabled={currentPage === pages}
                onClick={() => setPage(currentPage + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <span />
          )}
          <button className={button} onClick={onClose}>
            {t.done}
          </button>
        </div>
      </div>
    </Dialog>
  );
};
export default DocumentsDialog;
