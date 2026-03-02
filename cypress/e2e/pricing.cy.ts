describe("Pricing Redirection E2E", () => {
  const locales = ["pt", "en", "es"];

  locales.forEach((locale) => {
    it(`should redirect from /${locale}/pricing to /${locale}#pricing`, () => {
      // Visit /locale/pricing
      cy.visit(`/${locale}/pricing`, { failOnStatusCode: false });

      // Verify URL has changed to include #pricing
      // Middleware redirects to /locale#pricing
      cy.url().should(
        "match",
        new RegExp(`\\/${locale}(\\/)?(#pricing|\\?.*#pricing)$`),
      );

      // Verify pricing section is visible
      cy.get("#pricing").should("be.visible");
    });
  });

  it("should redirect from root /pricing to /pt#pricing", () => {
    cy.visit("/pricing", { failOnStatusCode: false });
    // Root /pricing should redirect to default locale /pt#pricing
    cy.url().should("match", /\/pt(\/)?(#pricing|\?.*#pricing)$/);
  });

  it("should navigate to #pricing when clicking 'Começar Gratuitamente' in the Pricing section (Guest)", () => {
    cy.visit("/pt");

    // Smooth scroll to pricing might be happening, let's ensure it's there
    cy.get("#pricing").scrollIntoView();

    // Find a link in the pricing section and click it
    cy.contains("Começar Gratuitamente").click();

    // Since we are not logged in, it should go to sign-up
    cy.url().should("include", "/sign-up");
  });

  it("should have correct hash links on the landing page CTAs", () => {
    cy.visit("/pt");

    // Check LandingHero CTA - and verify it's a hash link to #editor
    cy.get(".landing-hero__actions a").should("have.attr", "href", "#editor");

    // Verify clicking it scrolls to editor
    cy.get(".landing-hero__actions a").click();
    cy.get("#editor-form").should("be.visible");
  });

  it("should redirect from a nested path /any/path/pricing to /any/path#pricing", () => {
    cy.visit("/any/path/pricing", { failOnStatusCode: false });
    cy.url().should("match", /\/any\/path(#pricing|\?.*#pricing)$/);
  });
});
