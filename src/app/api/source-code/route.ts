import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { isAdmin } = await getCurrentUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const requestedFile = searchParams.get("file");

  const SRC_DIR = path.join(process.cwd(), "src");

  if (requestedFile) {
    const filePath = path.join(SRC_DIR, requestedFile);
    const normalizedSrc = path.resolve(SRC_DIR);
    const normalizedFile = path.resolve(filePath);

    if (!normalizedFile.startsWith(normalizedSrc)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const stats = fs.statSync(filePath);

    return NextResponse.json({
      file: requestedFile,
      content,
      size: stats.size,
      lines: content.split("\n").length,
    });
  }

  function getFiles(dir: string, basePath: string = ""): { path: string; size: number; type: string }[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const results: { path: string; size: number; type: string }[] = [];

    for (const entry of entries) {
      const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".next") continue;
        results.push(...getFiles(fullPath, relativePath));
      } else if (
        entry.name.endsWith(".ts") ||
        entry.name.endsWith(".tsx") ||
        entry.name.endsWith(".css") ||
        entry.name.endsWith(".mjs")
      ) {
        const stats = fs.statSync(fullPath);
        results.push({
          path: relativePath,
          size: stats.size,
          type: path.extname(entry.name),
        });
      }
    }

    return results.sort((a, b) => a.path.localeCompare(b.path));
  }

  const files = getFiles(SRC_DIR);

  return NextResponse.json({
    files,
    totalFiles: files.length,
    totalSize: files.reduce((sum, f) => sum + f.size, 0),
  });
}
