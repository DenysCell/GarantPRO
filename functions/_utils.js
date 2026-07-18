const EXPECTED_REFERENCE = 'GARANTPRO-VITALICIO';
const EXPECTED_AMOUNT = 29.90;
const EXPECTED_CURRENCY = 'BRL';

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extraHeaders
    }
  });
}

export async function fetchPayment(paymentId, accessToken) {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const payment = await response.json();
  if (!response.ok) throw new Error('Não foi possível consultar o pagamento.');
  return payment;
}

export function validatePayment(payment) {
  const amount = Number(payment.transaction_amount);
  const approved =
    payment.status === 'approved' &&
    payment.external_reference === EXPECTED_REFERENCE &&
    payment.currency_id === EXPECTED_CURRENCY &&
    Number.isFinite(amount) &&
    Math.abs(amount - EXPECTED_AMOUNT) < 0.001;

  return {
    approved,
    status: payment.status || null,
    statusDetail: payment.status_detail || null
  };
}

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function textToBase64Url(text) {
  return bytesToBase64Url(new TextEncoder().encode(text));
}

function base64UrlToText(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function createDownloadToken(paymentId, secret, ttlSeconds = 900) {
  const payload = {
    paymentId: String(paymentId),
    exp: Math.floor(Date.now() / 1000) + ttlSeconds
  };
  const encoded = textToBase64Url(JSON.stringify(payload));
  const signature = await sign(encoded, secret);
  return `${encoded}.${signature}`;
}

export async function verifyDownloadToken(token, secret) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  const expected = await sign(encoded, secret);
  if (signature !== expected) return null;

  try {
    const payload = JSON.parse(base64UrlToText(encoded));
    if (!payload.paymentId || !/^\d+$/.test(String(payload.paymentId))) return null;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
