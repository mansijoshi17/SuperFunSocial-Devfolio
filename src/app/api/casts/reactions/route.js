import neynarClient from "@/clients/neynar";
import { isApiErrorResponse } from "@neynar/nodejs-sdk";
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();

  const result = await neynarClient.publishReactionToCast(
    body.signerUid,
    body.reactionType,
    body.hash,
    {}
  );

  if (isApiErrorResponse(result)) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result, { status: 200 });
}
