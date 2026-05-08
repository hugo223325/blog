import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  if (!type || !["todos", "schedule"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  const filePath = path.join(process.cwd(), "content", "data", `${type}.json`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      type === "todos" ? { version: 1, items: [] } : { version: 1, events: [] }
    );
  }
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return NextResponse.json(data);
}
