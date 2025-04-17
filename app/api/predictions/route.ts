import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db"; // your existing dbConnect
import Prediction from "@/models/Prediction";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { link, "Tree ID": treeId, lastImage } = body;

    if (!link || !treeId || !lastImage) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    }

    const newPrediction = new Prediction({
      link,         // <- keep as string
      treeId,
      lastImage,
    });

    await newPrediction.save();

    console.log("✅ New prediction saved:", newPrediction);

    return NextResponse.json({ success: true, prediction: newPrediction });
  } catch (error) {
    console.error("❌ Error saving prediction:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const predictions = await Prediction.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, predictions });
  } catch (error) {
    console.error("❌ Error fetching predictions:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
