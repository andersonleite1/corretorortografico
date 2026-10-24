describe("Corretor ortográfico — editor", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get(".tiptap", { timeout: 20000 }).should("be.visible");
  });

  it("renders the editor and the LanguageTool review panel", () => {
    cy.get('input[type="text"]').should("be.visible");
    cy.contains("button", "Resumo").should("be.visible");
    cy.contains("button", "Dados detalhados").should("be.visible");
  });

  it("accepts a draft title and text", () => {
    const title = "Redação escolar";
    const content = "Este é um texto para revisar no corretor ortográfico.";

    cy.get('input[type="text"]').first().clear().type(title).should("have.value", title);
    cy.get(".tiptap").first().click().type(content).should("contain.text", content);
  });

  it("shows LanguageTool suggestions in the detailed results tab", () => {
    cy.get(".tiptap").first().click().type("Este eh um texto com erros.");
    cy.contains("button", "Dados detalhados").click();

    cy.get(".tiptap", { timeout: 20000 }).should("be.visible");
    cy.get('[aria-label="Resultados do LanguageTool"]').should("be.visible");
  });
});
