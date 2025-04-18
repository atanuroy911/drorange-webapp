import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("📥 Incoming POST JSON data:", data);

    return NextResponse.json({ success: true, received: data });
  } catch (jsonError) {
    console.warn("⚠️ Not JSON, trying alternative parsing...");

    const contentType = req.headers.get("content-type") || "";

    if (contentType.startsWith("image/")) {
      try {
        const imageBuffer = await req.arrayBuffer();
        const imageData = Buffer.from(imageBuffer);

        console.log(`🖼️ Received image of size: ${imageData.length} bytes`);

        return NextResponse.json({ 
          success: true, 
          message: "Image received", 
          size: imageData.length 
        });
      } catch (imageError) {
        console.error("❌ Error handling image:", imageError);
        return NextResponse.json(
          { success: false, message: "Invalid image data" },
          { status: 400 }
        );
      }
    } else if (contentType === "application/x-www-form-urlencoded") {
      try {
        const formDataString = await req.text();
        const formData = Object.fromEntries(new URLSearchParams(formDataString));
        console.log("📝 Received URL-encoded form data:", formData);

        return NextResponse.json({ 
          success: true, 
          received: formData 
        });
      } catch (formError) {
        console.error("❌ Error parsing form data:", formError);
        return NextResponse.json(
          { success: false, message: "Invalid form data" },
          { status: 400 }
        );
      }
    } else {
      console.error("❌ Unsupported content type:", contentType);
      return NextResponse.json(
        { success: false, message: "Unsupported content type" },
        { status: 415 } // 415 Unsupported Media Type
      );
    }
  }
}
