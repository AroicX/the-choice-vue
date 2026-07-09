import { createHash } from "crypto";
import { NextResponse } from "next/server";

type SignBody = {
  resourceType?: "image" | "video";
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as SignBody;
    const resourceType = body.resourceType === "video" ? "video" : "image";

    const cloudName = requiredEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
    const apiKey = requiredEnv("NEXT_PUBLIC_CLOUDINARY_API_KEY");
    const apiSecret = requiredEnv("CLOUDINARY_API_SECRET");
    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "thechoice9ja";
    const timestamp = Math.floor(Date.now() / 1000);

    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash("sha1").update(paramsToSign).digest("hex");

    return NextResponse.json({
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      resourceType
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not sign upload" },
      { status: 500 }
    );
  }
}
