import { json, fetchPayment, validatePayment, createDownloadToken } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const accessToken = env.MP_ACCESS_TOKEN;
  const tokenSecret = env.DOWNLOAD_TOKEN_SECRET;
  const url = new URL(request.url);
  const paymentId = url.searchParams.get('payment_id') || url.searchParams.get('collection_id');

  if (!accessToken || !tokenSecret) return json({ approved: false, error: 'Servidor ainda não configurado.' }, 500);
  if (!paymentId || !/^\d+$/.test(paymentId)) return json({ approved: false, error: 'Pagamento não identificado.' }, 400);

  try {
    const payment = await fetchPayment(paymentId, accessToken);
    const result = validatePayment(payment);
    if (!result.approved) return json({ approved: false, status: result.status, status_detail: result.statusDetail });
    const downloadToken = await createDownloadToken(paymentId, tokenSecret, 900);
    return json({ approved: true, status: result.status, download_url: `/api/download?token=${encodeURIComponent(downloadToken)}` });
  } catch {
    return json({ approved: false, error: 'Erro ao verificar o pagamento.' }, 500);
  }
}

export function onRequest() {
  return json({ approved: false, error: 'Método não permitido.' }, 405, { allow: 'GET' });
}
