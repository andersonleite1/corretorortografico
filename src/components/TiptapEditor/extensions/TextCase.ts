import { Extension } from "@tiptap/core";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        textCase: {
            /**
             * Set the text case
             */
            setTextCase: (caseType: "uppercase" | "lowercase" | "capitalize") => ReturnType;
        };
    }
}

export const TextCase = Extension.create({
    name: "textCase",

    addCommands() {
        return {
            setTextCase:
                (caseType) =>
                    ({ chain, state }) => {
                        const { from, to, empty } = state.selection;

                        if (empty) return false;

                        const text = state.doc.textBetween(from, to, " ");
                        let transformedText = "";

                        switch (caseType) {
                            case "uppercase":
                                transformedText = text.toUpperCase();
                                break;
                            case "lowercase":
                                transformedText = text.toLowerCase();
                                break;
                            case "capitalize":
                                transformedText = text
                                    .toLowerCase()
                                    .split(" ")
                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(" ");
                                break;
                            default:
                                return false;
                        }

                        return chain().focus().insertContentAt({ from, to }, transformedText).run();
                    },
        };
    },
});

export default TextCase;
