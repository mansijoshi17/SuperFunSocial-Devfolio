 
import { NextResponse } from "next/server";

export async function GET(request) {
    const data={
        appId:"superfunsocial"
    } 
   return NextResponse.json({  data: data }, { status: 200 }); 
}