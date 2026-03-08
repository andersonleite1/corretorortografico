import { Editor } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import TextCase from "@/components/TiptapEditor/extensions/TextCase";
import { describe, it, expect, afterEach } from "vitest";

describe("TextCase extension", () => {
    let editor: Editor | null = null;

    afterEach(() => {
        if (editor) {
            editor.destroy();
            editor = null;
        }
    });

    it("should convert text to uppercase", () => {
        editor = new Editor({
            extensions: [StarterKit, TextCase],
            content: "<p>hello world</p>",
        });

        editor.commands.setTextSelection({ from: 1, to: 6 });
        editor.commands.setTextCase("uppercase");

        expect(editor.getText()).toContain("HELLO world");
    });

    it("should convert text to lowercase", () => {
        editor = new Editor({
            extensions: [StarterKit, TextCase],
            content: "<p>HELLO WORLD</p>",
        });

        editor.commands.setTextSelection({ from: 1, to: 6 });
        editor.commands.setTextCase("lowercase");

        expect(editor.getText()).toContain("hello WORLD");
    });

    it("should convert text to capitalize", () => {
        editor = new Editor({
            extensions: [StarterKit, TextCase],
            content: "<p>hello world</p>",
        });

        editor.commands.setTextSelection({ from: 1, to: 12 });
        editor.commands.setTextCase("capitalize");

        expect(editor.getText()).toContain("Hello World");
    });

    it("should not change anything if selection is empty", () => {
        editor = new Editor({
            extensions: [StarterKit, TextCase],
            content: "<p>hello world</p>",
        });

        editor.commands.setTextSelection(1);
        editor.commands.setTextCase("uppercase");

        expect(editor.getText()).toBe("hello world");
    });
});
