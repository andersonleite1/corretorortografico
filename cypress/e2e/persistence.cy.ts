describe("Rascunho local", () => {
  beforeEach(() => {
    cy.visit("/", {
      onBeforeLoad(window) {
        window.localStorage.removeItem("local_documents");
      },
    });
    cy.get(".tiptap", { timeout: 20000 }).should("be.visible");
  });

  it("saves a draft in this browser after editing", () => {
    const title = `Rascunho local ${Date.now()}`;
    const text = "Texto salvo automaticamente neste navegador.";

    cy.get('input[type="text"]').first().clear().type(title);
    cy.get(".tiptap").first().click().type(text);

    cy.window().should((window) => {
      const drafts = JSON.parse(window.localStorage.getItem("local_documents") || "[]");
      expect(drafts).to.have.length(1);
      expect(drafts[0].title).to.equal(title);
      expect(JSON.stringify(drafts[0].content)).to.contain(text);
    });
  });

  it("restores the locally saved draft after reloading", () => {
    const title = `Rascunho para recarregar ${Date.now()}`;
    const text = "O texto continua disponível neste navegador.";

    cy.get('input[type="text"]').first().clear().type(title);
    cy.get(".tiptap").first().click().type(text);
    cy.window().should((window) => {
      const drafts = JSON.parse(window.localStorage.getItem("local_documents") || "[]");
      expect(drafts[0]?.title).to.equal(title);
    });

    cy.reload();
    cy.get(".tiptap", { timeout: 20000 }).should("contain.text", text);
    cy.get('input[type="text"]').first().should("have.value", title);
  });
});
