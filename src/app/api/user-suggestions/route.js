import { NextResponse } from "next/server";
import neynarClient from "@/clients/neynar";
import { isApiErrorResponse } from "@neynar/nodejs-sdk";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  try { 
    const {
      result: { users },
    } = await neynarClient.searchUser(q);
    return NextResponse.json({ users }, { status: 200 });
  } catch (err) {
    if (isApiErrorResponse(err)) {
      return NextResponse.json(
        { ...err.response.data },
        { status: err.response.status }
      );
    } else {
      return NextResponse.json(
        { message: "Something went wrong" },
        { status: 500 }
      );
    }
  }
}