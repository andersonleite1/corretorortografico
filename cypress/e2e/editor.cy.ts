describe("Text Editor E2E", () => {
  beforeEach(() => {
    // Visit the root page which will rewrite to /pt internally without a hard redirect if possible
    // or just let the middleware handle it naturally.
    cy.visit("/");

    // Explicitly wait for the editor to be ready
    // We use a long timeout because dynamic imports can be slow in development
    cy.get(".tiptap", { timeout: 20000 }).should("exist");
  });

  it("should load the editor page correctly", () => {
    // Check if the title input exists
    cy.get('input[type="text"]').should("be.visible");
  });

  it("should allow typing in the title", () => {
    const testTitle = "Meu Documento de Teste";
    cy.get('input[type="text"]')
      .clear()
      .type(testTitle)
      .should("have.value", testTitle);
  });

  it("should allow typing in the editor", () => {
    const testContent = "Olá, este é um teste de conteúdo no editor.";
    cy.get(".tiptap")
      .first()
      .clear()
      .type(testContent)
      .should("contain.text", testContent);
  });

  it("should open the bug report dialog", () => {
    cy.get("#bug-report-open-btn").click();
    cy.get('div[role="dialog"]').should("be.visible");
    cy.contains("Reportar Problema").should("be.visible");
  });
});
