import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/mongoose";

export async function GET() {
  try {
    const mongo = await connectToDatabase();

    return Response.json({
      ok: true,
      readyState: mongoose.connection.readyState,
      database: mongo.connection.name,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "MongoDB connection failed.";

    return Response.json(
      {
        ok: false,
        message,
      },
      {
        status: 500,
      },
    );
  }
}
