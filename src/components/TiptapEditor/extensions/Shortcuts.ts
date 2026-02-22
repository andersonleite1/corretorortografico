import { Extension } from "@tiptap/core";

export interface ShortcutsOptions {
    onSave?: () => void;
    onSaveDraft?: () => void;
}

export const Shortcuts = Extension.create<ShortcutsOptions>({
    name: "shortcuts",

    addOptions() {
        return {
            onSave: undefined,
            onSaveDraft: undefined,
        };
    },

    addKeyboardShortcuts() {
        return {
            "Mod-s": () => {
                this.options.onSave?.();
                return true;
            },
            "Mod-Shift-r": () => {
                this.options.onSaveDraft?.();
                return true;
            },
            "Mod-Shift-R": () => {
                this.options.onSaveDraft?.();
                return true;
            },
        };
    },
});
