// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Add Vercel protection bypass header if secret is available
const bypassSecret = Cypress.env("VERCEL_AUTOMATION_BYPASS_SECRET");
if (bypassSecret) {
  Cypress.on("window:before:load", (win) => {
    // This handles headers for visit() and other window-based requests
  });

  // For cy.request()
  Cypress.Commands.overwrite("request", (originalFn, ...args) => {
    const options = args[0];
    if (typeof options === "object") {
      options.headers = {
        ...options.headers,
        "x-vercel-protection-bypass": bypassSecret,
      };
    }
    return originalFn(...args);
  });
}
