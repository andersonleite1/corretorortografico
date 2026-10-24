describe("Editor Toolbar E2E", () => {
  beforeEach(() => {
    // Visit the root page
    cy.visit("/");
    // Wait for the editor to be ready with a longer timeout
    cy.get(".tiptap", { timeout: 20000 }).should("exist");
  });

  const getEditor = () => cy.get(".tiptap").first();

  it("should toggle Bold formatting", () => {
    getEditor().type("Texto Negrito");
    getEditor().type("{selectall}");
    cy.get('button[aria-label^="Negrito"]').should("be.visible").click();

    // Check if bold is applied (Tiptap uses <strong>)
    getEditor().find("strong").should("contain.text", "Texto Negrito");

    cy.get('button[aria-label^="Negrito"]').click();
    getEditor().find("strong").should("not.exist");
  });

  it("should toggle Italic formatting", () => {
    getEditor().type("Texto Italico");
    getEditor().type("{selectall}");
    cy.get('button[aria-label^="Itálico"]').should("be.visible").click();

    // Check if italic is applied (Tiptap uses <em>)
    getEditor().find("em").should("contain.text", "Texto Italico");

    cy.get('button[aria-label^="Itálico"]').click();
    getEditor().find("em").should("not.exist");
  });

  it("should change Headings", () => {
    getEditor().type("Título Teste");
    getEditor().type("{selectall}");
    cy.get('button[aria-label^="Títulos"]').should("be.visible").click();

    // Click on "Título 1" in the dropdown
    cy.contains("Título 1").should("be.visible").click();

    getEditor().find("h1").should("contain.text", "Título Teste");
  });

  it("should toggle Bullet List", () => {
    getEditor().type("Item 1{enter}Item 2");
    getEditor().type("{selectall}");
    cy.get('button[aria-label^="Lista com marcadores"]')
      .should("be.visible")
      .click();

    getEditor().find("ul li").should("have.length", 2);
    getEditor().find("ul li").first().should("contain.text", "Item 1");
  });

  it("should open Export dropdown and show options", () => {
    cy.get('button[aria-label^="Exportar"]').should("be.visible").click();
    cy.contains("Exportar Word (.docx)").should("be.visible");
    cy.contains("Exportar TXT").should("be.visible");
    cy.contains("Exportar PDF").should("be.visible");
  });

  it("opens advanced tools automatically on mouse hover", () => {
    cy.window().then((window) => {
      const originalMatchMedia = window.matchMedia.bind(window);
      cy.stub(window, "matchMedia").callsFake((query: string) =>
        query === "(hover: hover) and (pointer: fine)"
          ? ({ matches: true, media: query } as MediaQueryList)
          : originalMatchMedia(query),
      );
    });

    cy.get('.rte-category-trigger[aria-haspopup="dialog"]')
      .contains("Formatar")
      .trigger("pointerover", { pointerType: "mouse", bubbles: true });

    cy.get('.rte-tools-panel[aria-label="Ferramentas avançadas"]').should("be.visible");
    cy.contains("button", "Fonte").should("be.visible");
  });

  it("should NOT see Documents button when not logged in", () => {
    // There are two buttons for Documents, one with text "Documentos" and one icon-only
    cy.contains("button", "Documentos").should("not.exist");
  });

  it("should NOT see Drafts button when not logged in", () => {
    cy.contains("button", "Rascunhos").should("not.exist");
  });

  it("should see LanguageTool sidebar open by default on desktop", () => {
    // On desktop, the sidebar should be visible
    cy.contains("button", "Resumo").should("be.visible");
  });

  it("should close LanguageTool sidebar when clicking the close button", () => {
    cy.get('button[title="Fechar"]').should("be.visible").click();
    cy.contains("h3", "Corretor").should("not.exist");
  });

});
