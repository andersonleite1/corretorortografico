import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { toast } from "sonner";

export const ImageUpload = Extension.create({
    name: "imageUpload",

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey("imageUpload"),
                props: {
                    handlePaste(view, event) {
                        const items = event.clipboardData?.items;
                        const html = event.clipboardData?.getData("text/html");

                        if (!items) return false;

                        // 1. Handle actual files (screenshots, etc.)
                        const files = Array.from(items)
                            .filter((item) => item.type.startsWith("image/"))
                            .map((item) => item.getAsFile())
                            .filter((file): file is File => file !== null);

                        if (files.length > 0) {
                            event.preventDefault();
                            files.forEach((file) => {
                                uploadAndInsert(view, { file });
                            });
                            return true;
                        }

                        // 2. Handle <img> tags in HTML (External URLs)
                        if (html) {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(html, "text/html");
                            const imgs = Array.from(doc.querySelectorAll("img"));

                            const externalImgs = imgs.filter((img) => {
                                const src = img.getAttribute("src");
                                return (
                                    src &&
                                    src.startsWith("http") &&
                                    !src.includes("res.cloudinary.com")
                                );
                            });

                            if (externalImgs.length > 0) {
                                // We don't preventDefault here because we want the rest of the HTML to paste.
                                // But we will "capture" these images and upload them.
                                // However, Tiptap might have already pasted them.
                                // A better way is to let them paste, then finding them in the doc and replacing them.
                                // For simplicity in this first version, let's just toast and start uploads.
                                externalImgs.forEach((img) => {
                                    const src = img.getAttribute("src")!;
                                    uploadAndReplace(view, src);
                                });
                            }
                        }

                        return false;
                    },
                    handleDrop(view, event) {
                        const files = Array.from(event.dataTransfer?.files ?? []).filter(
                            (file) => file.type.startsWith("image/"),
                        );

                        if (files.length > 0) {
                            event.preventDefault();
                            files.forEach((file) => {
                                uploadAndInsert(view, { file });
                            });
                            return true;
                        }

                        return false;
                    },
                },
            }),
        ];
    },
});

async function uploadAndInsert(view: any, { file, url }: { file?: File; url?: string }) {
    const formData = new FormData();
    if (file) formData.append("file", file);
    if (url) formData.append("url", url);

    try {
        const response = await fetch("/api/images", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        const { schema } = view.state;
        const node = schema.nodes.image.create({ src: data.url });
        const transaction = view.state.tr.replaceSelectionWith(node);
        view.dispatch(transaction);
    } catch (error) {
        console.error("Upload error:", error);
        toast.error("Erro ao fazer upload da imagem.");
    }
}

async function uploadAndReplace(view: any, url: string) {
    try {
        const response = await fetch("/api/images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) return; // Silent fail for external capture

        const data = await response.json();

        // Find all images with this source in the document and replace them
        view.state.doc.descendants((node: any, pos: number) => {
            if (node.type.name === "image" && node.attrs.src === url) {
                const transaction = view.state.tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    src: data.url,
                });
                view.dispatch(transaction);
            }
        });
    } catch (error) {
        console.error("Capture error:", error);
    }
}
