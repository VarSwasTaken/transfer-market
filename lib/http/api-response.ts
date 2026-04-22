type ApiErrorPayload = {
  error: string;
  dependencies?: Record<string, number>;
  warnings?: string[];
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

export function successResponse<T extends Record<string, unknown>>(body: T) {
  return jsonResponse({ ok: true, ...body });
}

export function createdResponse<T extends Record<string, unknown>>(body: T) {
  return jsonResponse({ ok: true, ...body }, 201);
}

export function badRequest(error: string, extra?: Omit<ApiErrorPayload, "error">) {
  return jsonResponse({ ok: false, error, ...extra }, 400);
}

export function notFound(error: string, extra?: Omit<ApiErrorPayload, "error">) {
  return jsonResponse({ ok: false, error, ...extra }, 404);
}

export function conflict(error: string, extra?: Omit<ApiErrorPayload, "error">) {
  return jsonResponse({ ok: false, error, ...extra }, 409);
}
