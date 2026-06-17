import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { htmlContent } = await request.json();

        if (!htmlContent) {
            return NextResponse.json({ error: 'Conteúdo HTML ausente' }, { status: 400 });
        }

        const formData = new FormData();

        // Em Next.js no backend, criar um File a partir do conteúdo HTML
        const htmlFile = new File([htmlContent], 'index.html', { type: 'text/html' });
        formData.append('files', htmlFile);

        formData.append('marginTop', '1');
        formData.append('marginBottom', '1');
        formData.append('marginLeft', '1');
        formData.append('marginRight', '1');
        formData.append('paperWidth', '8.27'); // A4 Width
        formData.append('paperHeight', '11.69'); // A4 Height

        const gotenbergUrl = process.env.GOTENBERG_URL || 'http://localhost:8080';
        const gotenbergUsername = process.env.GOTENBERG_API_BASIC_AUTH_USERNAME;
        const gotenbergPassword = process.env.GOTENBERG_API_BASIC_AUTH_PASSWORD;
        const headers = new Headers();

        if (gotenbergUsername && gotenbergPassword) {
            const basicAuthToken = Buffer.from(`${gotenbergUsername}:${gotenbergPassword}`).toString('base64');
            headers.set('Authorization', `Basic ${basicAuthToken}`);
        }

        const response = await fetch(`${gotenbergUrl}/forms/chromium/convert/html`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const errorText = await response.text();
                errorMessage = errorText;
            } catch (e) {
                // ignore
            }
            throw new Error(`Erro no Gotenberg: ${response.status} - ${errorMessage}`);
        }

        // Recebe o buffer do PDF gerado
        const pdfBuffer = await response.arrayBuffer();

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="documento.pdf"',
            },
        });

    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        return NextResponse.json({ error: 'Falha ao exportar PDF' }, { status: 500 });
    }
}
