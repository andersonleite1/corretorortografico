# 🚀 Guia de Configuração do Stripe

Este guia detalha os passos necessários no Dashboard do Stripe para conectar a aplicação e habilitar o sistema de assinaturas.

## 1. Criar Conta e Ativar Modo de Teste

1. Acesse [stripe.com](https://stripe.com) e crie sua conta.
2. No Dashboard, ative a chave **"Test mode"** (Modo de teste) no canto superior direito para não usar dinheiro real.

## 2. Criar Produtos e Preços

A aplicação espera dois planos: **Pro** e **Team**.

1. Vá para **Product Catalog** -> **Add Product**.
2. **Produto 1: Pro Creator**
   - Nome: `Pro Creator`
   - Preço: `$12` (ou o valor que preferir)
   - Periodicidade: `Monthly` (Mensal)
   - **Importante:** Salve o produto e copie o **API ID** (começa com `price_...`).
3. **Produto 2: Team Business**
   - Nome: `Team Business`
   - Preço: `$25`
   - Periodicidade: `Monthly` (Mensal)
   - **Importante:** Salve o produto e copie o **API ID**.

## 3. Configurar o Portal do Cliente (Billing Portal)

Isso permite que os usuários gerenciem cartões e cancelem assinaturas sem código adicional.

1. Vá em **Settings** (ícone de engrenagem) -> **Billing** -> **Customer portal**.
2. Ative as funcionalidades que deseja (ex: permitir cancelamento, troca de plano).
3. Salve as mudanças.

## 4. Configurar Webhooks

Os webhooks informam sua aplicação quando um pagamento é aprovado ou uma assinatura é cancelada.

1. Vá em **Developers** -> **Webhooks**.
2. Clique em **Add endpoint**.
3. **Endpoint URL:** `https://seu-dominio.com/api/webhooks/stripe`
   - _Para testes locais, veja a seção abaixo sobre Stripe CLI._
4. **Select events:** Adicione os seguintes eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Após criar, copie a **Signing secret** (começa com `whsec_...`).

## 5. Atualizar o `.env.local`

Copie as chaves para o seu arquivo `.env.local`:

```env
# Chaves de API
STRIPE_SECRET_KEY=sk_test_...          # De Developers -> API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # De Developers -> API Keys
STRIPE_WEBHOOK_SECRET=whsec_...        # De Developers -> Webhooks

# IDs dos Preços (obtidos no Passo 2)
STRIPE_PRO_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...

# URL da App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🛠️ Testando Localmente (Recomendado)

Para testar os webhooks sem publicar o site, use o **Stripe CLI**:

1. [Instale o Stripe CLI](https://stripe.com/docs/stripe-cli).
2. No terminal: `stripe login`
3. Inicie o encaminhamento: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. O terminal mostrará um `whsec_...` temporário. Use este no seu `.env.local` enquanto estiver testando no PC.
