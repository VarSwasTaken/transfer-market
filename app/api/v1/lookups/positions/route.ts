import { successResponse } from "@/lib/http/api-response";
import { getPositionsLookup } from "@/lib/services/lookups";

export const runtime = "nodejs";

export async function GET() {
  return successResponse({ data: getPositionsLookup() });
}
