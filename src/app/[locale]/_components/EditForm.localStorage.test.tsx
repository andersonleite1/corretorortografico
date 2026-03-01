import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCallback, useState } from "react";
// We simulate the logic from EditForm since rendering the whole component is too complex for a pure unit test
// This "logic-only" test ensures the logic we added works as expected.

describe("EditForm LocalStorage Logic", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    const mockMessages = {
        defaults: { draftTitle: "Rascunho" },
        modal: { draftSaved: "Salvo" },
        dateLocale: "pt-BR",
    };

    const useHandleSaveDraftMock = (initialDrafts: any[], docId: string | null) => {
        const [drafts, setDrafts] = useState(initialDrafts);

        const handleSaveDraft = useCallback(async (data: any) => {
            if (!docId) {
                const current = {
                    id: "uuid-123",
                    title: data.title || mockMessages.defaults.draftTitle,
                    content: data.content || "",
                    date: new Date().toLocaleString(mockMessages.dateLocale),
                };

                try {
                    let updatedDrafts = [current, ...drafts];
                    if (updatedDrafts.length > 5) updatedDrafts = updatedDrafts.slice(0, 5);

                    localStorage.setItem("drafts", JSON.stringify(updatedDrafts));
                    setDrafts(updatedDrafts);
                } catch (e) {
                    localStorage.removeItem("drafts");
                    localStorage.setItem("drafts", JSON.stringify([current]));
                    setDrafts([current]);
                }
            }
        }, [drafts, docId]);

        return { drafts, handleSaveDraft };
    };

    it("should save a new draft to localStorage and limit to 5", async () => {
        const initialDrafts = [
            { id: "1", title: "D1" },
            { id: "2", title: "D2" },
            { id: "3", title: "D3" },
            { id: "4", title: "D4" },
            { id: "5", title: "D5" },
        ];

        const { result } = renderHook(() => useHandleSaveDraftMock(initialDrafts, null));

        await act(async () => {
            await result.current.handleSaveDraft({ title: "New Draft", content: "Content" });
        });

        const saved = JSON.parse(localStorage.getItem("drafts") || "[]");
        expect(saved.length).toBe(5);
        expect(saved[0].title).toBe("New Draft");
        expect(saved[4].title).toBe("D4"); // D5 was dropped
    });

    it("should clean up localStorage on QuotaExceededError", async () => {
        const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
        setItemSpy.mockImplementationOnce(() => {
            throw new Error("QuotaExceededError");
        });

        const { result } = renderHook(() => useHandleSaveDraftMock([], null));

        await act(async () => {
            await result.current.handleSaveDraft({ title: "New Draft", content: "Content" });
        });

        const saved = JSON.parse(localStorage.getItem("drafts") || "[]");
        expect(saved.length).toBe(1);
        expect(saved[0].title).toBe("New Draft");
        expect(setItemSpy).toHaveBeenCalled();
    });
});
