import { fetchPayment, validatePayment, verifyDownloadToken } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const accessToken = env.MP_ACCESS_TOKEN;
  const tokenSecret = env.DOWNLOAD_TOKEN_SECRET;
  const downloadUrl = env.GARANTPRO_DOWNLOAD_URL;
  if (!accessToken || !tokenSecret || !downloadUrl) return new Response('Download ainda não configurado.', { status: 500 });

  const url = new URL(request.url);
  const payload = await verifyDownloadToken(url.searchParams.get('token'), tokenSecret);
  if (!payload) return new Response('Link de download inválido ou expirado. Volte à página de confirmação.', { status: 401 });

  try {
    const payment = await fetchPayment(payload.paymentId, accessToken);
    const result = validatePayment(payment);
    if (!result.approved) return new Response('Pagamento não aprovado.', { status: 403 });
    return Response.redirect(downloadUrl, 302);
  } catch {
    return new Response('Não foi possível liberar o download agora.', { status: 500 });
  }
}

export function onRequest() {
  return new Response('Método não permitido.', { status: 405, headers: { allow: 'GET' } });
}
