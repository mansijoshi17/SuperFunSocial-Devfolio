import neynarClient from "@/clients/neynar";
import { isApiErrorResponse } from "@neynar/nodejs-sdk";
import { NextResponse } from "next/server";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const fid = searchParams.get("fid");

  if (fid) {
    const casts = await neynarClient.fetchAllCastsCreatedByUser(Number(fid), {
      limit: 50,
    });

    return NextResponse.json({ casts: casts.result.casts }, { status: 200 });
  }

  const feed = await neynarClient.fetchFeed(FeedType.Filter, {
    filterType: FilterType.GlobalTrending,
    withReplies: false,
    fid: Number(fid),
  });

  return NextResponse.json({ feed }, { status: 200 });
}

export async function POST(request) {
  const body = await request.json();

  const result = await neynarClient.publishCast(body.signerUid, body.text, body.embeds, {});

  if (isApiErrorResponse(result)) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result, { status: 200 });
}




export async function DELETE(request) {
  const body = await request.json();

  const result = await neynarClient.deleteCast(
    body.signerUid,
    String(body.hash)
  );

  if (isApiErrorResponse(result)) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result, { status: 200 });
}
