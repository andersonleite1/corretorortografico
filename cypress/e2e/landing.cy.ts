describe("Landing do corretor ortográfico", () => {
  it("apresenta a proposta de revisão de texto em português", () => {
    cy.visit("/");

    cy.title().should("contain", "Corretor Ortográfico Online");
    cy.get("h1").should("contain.text", "Corretor ortográfico online grátis");
    cy.contains("LanguageTool").should("be.visible");
    cy.get('link[rel="canonical"]')
      .should("have.attr", "href")
      .and("match", /^https:\/\/corretorortografico\.online\/?$/);
  });

  it("explica as categorias revisadas e responde dúvidas frequentes", () => {
    cy.visit("/");

    cy.contains("h2", "Revise a ortografia e a gramática do seu texto").should("be.visible");
    cy.contains("h2", "Dúvidas frequentes sobre o corretor ortográfico online").should("be.visible");
    cy.contains("Como usar o corretor ortográfico online?").should("be.visible");
    cy.contains("O rascunho fica salvo localmente neste navegador").should("be.visible");
  });

  it("leva o link de dúvidas frequentes à seção correspondente", () => {
    cy.visit("/");
    cy.get('a[href="#duvidas"]').first().click();
    cy.location("hash").should("equal", "#duvidas");
    cy.get("#duvidas").should("be.visible");
  });
});
