import { successResponse } from "@/lib/http/api-response";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query")?.trim();

  const nationalities = await prisma.nationality.findMany({
    where:
      query && query.length > 0
        ? {
            name: {
              contains: query,
              mode: "insensitive",
            },
          }
        : undefined,
    select: {
      id: true,
      name: true,
      flagUrl: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return successResponse({ data: nationalities });
}
