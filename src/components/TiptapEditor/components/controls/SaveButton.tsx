import React, { useCallback, useState } from "react";
import MenuButton from "../MenuButton";
import { useTiptapContext } from "../Provider";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import SaveNotification from "@/components/shared/SaveNotification";

export const SaveButton = () => {
    const { editor, messages, userPlan, documentTitle, locale } = useTiptapContext();
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const documentId = searchParams.get("docId"); // Usando docId para evitar conflitos se necessário

    const handleSave = useCallback(async () => {
        if (userPlan === "free") {
            toast.error("Upgrade para o plano Pro para salvar documentos");
            return;
        }

        setIsSaving(true);
        try {
            const content = editor.getJSON();
            const stringifiedContent = JSON.stringify(content);
            const response = await fetch("/api/documents", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: documentId,
                    content: stringifiedContent,
                    title: documentTitle || "Sem título",
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Erro ao salvar o documento");
            }

            const savedDoc = await response.json();

            setShowSuccess(true);

            if (!documentId && savedDoc.id) {
                router.push(`/${locale}?docId=${savedDoc.id}`);
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erro ao salvar o documento");
        } finally {
            setIsSaving(false);
        }
    }, [editor, userPlan, documentId, router, documentTitle]);

    // Se no futuro quisermos mostrar o botão desabilitado para Free,
    // podemos remover este retorno nulo. Por enquanto, só aparece para Pro.
    if (userPlan === "free") {
        return null;
    }

    return (
        <>
            <MenuButton
                icon="Save"
                text={messages.toolbar.save}
                onClick={handleSave}
                disabled={isSaving}
                tooltip={messages.toolbar.save}
            />
            {showSuccess && (
                <SaveNotification
                    message={documentId ? "Documento atualizado" : "Documento salvo"}
                    onClose={() => setShowSuccess(false)}
                />
            )}
        </>
    );
};

export default SaveButton;
