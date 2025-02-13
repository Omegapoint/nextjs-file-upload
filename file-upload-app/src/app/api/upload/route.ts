import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const chunkIndex = req.headers.get("X-Chunk-Index");
    const fileName = req.headers.get("X-File-Name");

    if (!chunkIndex || !fileName) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const chunk = await req.arrayBuffer();

    console.log(`Received chunk ${chunkIndex} for file ${fileName}`);
    console.log("Chunk is: ", chunk);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
