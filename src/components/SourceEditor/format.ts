type PrettierModule = typeof import("prettier/standalone");
type HtmlPluginModule = typeof import("prettier/plugins/html");

let prettierLoader: Promise<{
  prettier: PrettierModule;
  parserHtml: HtmlPluginModule;
}> | null = null;

async function loadPrettier() {
  if (!prettierLoader) {
    prettierLoader = Promise.all([
      import("prettier/standalone"),
      import("prettier/plugins/html"),
    ]).then(([prettier, parserHtml]) => ({
      prettier: prettier.default ?? prettier,
      parserHtml: parserHtml.default ?? parserHtml,
    }));
  }

  return prettierLoader;
}

function removeHtmlEntities(html: string) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  return textarea.value;
}

export const formatHtml = async (content: string) => {
  try {
    const { prettier, parserHtml } = await loadPrettier();
    const decodedContent = removeHtmlEntities(content).trim();
    return await prettier.format(decodedContent, {
      parser: "html",
      plugins: [parserHtml],
      printWidth: 80,
      htmlWhitespaceSensitivity: "ignore",
      bracketSameLine: true,
      singleAttributePerLine: true,
      useTabs: false,
      tabWidth: 2,
    });
  } catch (error) {
    console.error("Format failed:", error);
    return content;
  }
};
