import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const caller = appRouter.createCaller(await createTRPCContext(req));
  const response = await caller.seed();
  if (response.status === "OK") {
    return NextResponse.json({ status: "OK" }, { status: 200 });
  } else {
    return NextResponse.json(
      { status: "ERROR", error: response },
      { status: 500 },
    );
  }
}
