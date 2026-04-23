import { successResponse } from "@/lib/http/api-response";
import { getTransferRumorStatusesLookup } from "@/lib/services/lookups";

export const runtime = "nodejs";

export async function GET() {
  return successResponse({ data: getTransferRumorStatusesLookup() });
}
