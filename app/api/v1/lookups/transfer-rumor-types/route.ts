import { successResponse } from "@/lib/http/api-response";
import { getTransferRumorTypesLookup } from "@/lib/services/lookups";

export const runtime = "nodejs";

export async function GET() {
  return successResponse({ data: getTransferRumorTypesLookup() });
}
