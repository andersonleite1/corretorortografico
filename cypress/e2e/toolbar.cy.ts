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
    // These come from the messages.export object
    cy.contains("Exportar Word (DOC)").should("be.visible");
    cy.contains("Exportar TXT").should("be.visible");
    cy.contains("Exportar PDF").should("be.visible");
  });

  it("should open Preview dropdown and show options", () => {
    cy.get('button[aria-label^="Visualizar"]').should("be.visible").click();
    // These come from the messages.preview object
    cy.contains("Pré-visualizar PDF").should("be.visible");
    cy.contains("Pré-visualizar post").should("be.visible");
  });

  it("should NOT see Documents button when not logged in", () => {
    // There are two buttons for Documents, one with text "Documentos" and one icon-only
    cy.contains("button", "Documentos").should("not.exist");
  });

  it("should NOT see Drafts button when not logged in", () => {
    cy.contains("button", "Rascunhos").should("not.exist");
  });

  it("should clear the editor content", () => {
    getEditor().type("Conteúdo para limpar");
    cy.get('button[aria-label^="Limpar conteúdo"]')
      .should("be.visible")
      .click();

    // Check if content is cleared
    getEditor().should("have.text", "");
  });

  it("should see LanguageTool sidebar open by default on desktop", () => {
    // On desktop, the sidebar should be visible
    cy.contains("button", "Resumo").should("be.visible");
  });

  it("should close LanguageTool sidebar when clicking the close button", () => {
    cy.get('button[title="Fechar"]').should("be.visible").click();
    cy.contains("h3", "Corretor").should("not.exist");
  });

  it("should open Bug Report dialog", () => {
    // The bug report button is outside the main toolbar but in the header/form area
    cy.get("#bug-report-open-btn").should("be.visible").click();
    // The dialog has the heading "Reportar Problema"
    cy.contains("h2", "Reportar Problema").should("be.visible");
  });

  it("should see AI Rewrite button (disabled if not logged in)", () => {
    cy.contains("button", "Reescrever IA").should("be.visible");
    // Since we are likely not logged in during the test (standard visit), it should be disabled
    cy.contains("button", "Reescrever IA").should("be.disabled");
  });
});
