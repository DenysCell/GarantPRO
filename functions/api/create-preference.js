import { json } from '../_utils.js';

export async function onRequestPost({ env }) {
  const accessToken = env.MP_ACCESS_TOKEN;
  const siteUrl = (env.SITE_URL || 'https://garantpro.website').replace(/\/$/, '');

  if (!accessToken) return json({ error: 'Credencial do Mercado Pago não configurada.' }, 500);

  const preference = {
    items: [{
      id: 'garantpro-vitalicio',
      title: 'GarantPro - Licença Vitalícia',
      description: 'Sistema de controle profissional de garantias, sem mensalidade.',
      quantity: 1,
      currency_id: 'BRL',
      unit_price: 29.90
    }],
    external_reference: 'GARANTPRO-VITALICIO',
    statement_descriptor: 'GARANTPRO',
    back_urls: {
      success: `${siteUrl}/sucesso.html`,
      pending: `${siteUrl}/sucesso.html?status=pending`,
      failure: `${siteUrl}/checkout.html?status=failure`
    },
    auto_return: 'approved',
    payment_methods: { installments: 12 }
  };

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `garantpro-${Date.now()}-${crypto.randomUUID()}`
      },
      body: JSON.stringify(preference)
    });
    const data = await response.json();
    if (!response.ok || !data.init_point) return json({ error: 'Não foi possível abrir o pagamento agora.' }, 502);
    return json({ checkout_url: data.init_point });
  } catch {
    return json({ error: 'Erro ao conectar com o Mercado Pago.' }, 500);
  }
}

export function onRequest() {
  return json({ error: 'Método não permitido.' }, 405, { allow: 'POST' });
}
