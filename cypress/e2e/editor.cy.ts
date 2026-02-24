describe('Text Editor E2E', () => {
    beforeEach(() => {
        // We assume the default locale is 'pt' or it redirects to it
        cy.visit('/');
    });

    it('should load the editor page correctly', () => {
        // Check if the title input exists
        cy.get('input[type="text"]').should('be.visible');

        // Check if the Tiptap editor is present
        // Tiptap usually renders a div with the class .tiptap or .ProseMirror
        cy.get('.tiptap').should('exist');
    });

    it('should allow typing in the title', () => {
        const testTitle = 'Meu Documento de Teste';
        cy.get('input[type="text"]')
            .clear()
            .type(testTitle)
            .should('have.value', testTitle);
    });

    it('should allow typing in the editor', () => {
        const testContent = 'Olá, este é um teste de conteúdo no editor.';
        cy.get('.tiptap')
            .first()
            .clear()
            .type(testContent)
            .should('contain.text', testContent);
    });

    it('should open the bug report dialog', () => {
        cy.get('#bug-report-open-btn').click();
        cy.get('div[role="dialog"]').should('be.visible');
        cy.contains('Reportar um Problema').should('be.visible');
    });
});
