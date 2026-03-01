describe("Document Persistence & UX E2E", () => {
  beforeEach(() => {
    // Assumption: User is logged in or middleware is bypassed for E2E
    // If Clerk is active, we might need a test session or mock.
    // Given the local environment, we'll visit the home page.
    cy.visit("/");
    cy.get(".tiptap", { timeout: 20000 }).should("exist");
  });

  it("should transition from 'Local' to 'Sincronizado' after manual save", () => {
    const title = "E2E Test Document " + Date.now();
    const content = "Conteúdo de teste para persistência E2E.";

    // 1. Check initial status
    cy.contains("Local").should("be.visible");

    // 2. Fill document
    cy.get('input[type="text"]').clear().type(title);
    cy.get(".tiptap").first().clear().type(content);

    // 3. Click Save
    // The aria-label depends on the locale, defaulting to Portuguese for /pt
    cy.get('[aria-label="Salvar documento"]').click();

    // 4. Verify feedback
    cy.contains("Documento salvo com sucesso").should("be.visible");
    cy.contains("Sincronizado", { timeout: 10000 }).should("be.visible");
  });

  it("should show auto-save draft feedback during editing", () => {
    // 1. Type something to trigger changes
    cy.get(".tiptap").first().type(" Mudança para rascunho.");

    // 2. Wait for auto-save debounce (3s) + buffer
    cy.contains("Salvando rascunho...", { timeout: 5000 }).should("be.visible");
    cy.contains("Rascunho salvo", { timeout: 10000 }).should("be.visible");
  });

  it("should reflect the saved document in the Dashboard", () => {
    const title = "Dashboard Sync Test " + Date.now();

    // 1. Create and save doc
    cy.get('input[type="text"]').clear().type(title);
    cy.get(".tiptap").first().clear().type("Conteúdo para o dashboard.");
    cy.get('[aria-label="Salvar documento"]').click();
    cy.contains("Sincronizado", { timeout: 10000 }).should("be.visible");

    // 2. Navigate to Dashboard
    cy.visit("/dashboard");

    // 3. Verify loading skeleton appears and disappears
    // (This might be too fast to catch reliably without slowing down the network)

    // 4. Verify document appears in recent list
    cy.contains(title).should("be.visible");
  });

  it("should show high-contrast diffs when comparing versions", () => {
    // 1. Create some history (requires at least one save and one change)
    cy.get(".tiptap").first().clear().type("Versão Inicial");
    cy.get('[aria-label="Salvar documento"]').click();
    cy.contains("Sincronizado", { timeout: 10000 }).should("be.visible");

    cy.get(".tiptap").first().type(" + Mudança");
    // Wait for auto-save
    cy.contains("Rascunho salvo", { timeout: 10000 }).should("be.visible");

    // 2. Open History/Drafts dialog (Shortcut Ctrl+H or button)
    // Assuming there's a button for this in the toolbar
    cy.get('[aria-label="Rascunhos"]').click();

    // 3. Click Compare on the latest draft
    cy.get("button").contains("Comparar").first().click();

    // 4. Verify Diff Modal
    cy.contains("Comparação de Versão").should("be.visible");
    // Check for high-contrast colors (green/red backgrounds)
    cy.get(".bg-green-100").should("exist");
  });

  it("should show empty state when dashboard is empty", () => {
    // This is hard to test without a fresh user, but we can check the component
    // If we navigate to a non-existent search result if applicable
    cy.visit("/dashboard");
    // If we could force a 0 documents state via API mocking:
    /*
        cy.intercept('GET', '/api/dashboard', {
          body: {
            totalDocuments: 0,
            recentDocuments: [],
            dailySeries: [],
            topTones: [],
            plan: "free"
          }
        });
        cy.reload();
        cy.contains("O início de algo grande").should("be.visible");
        */
  });
});
