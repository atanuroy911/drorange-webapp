import { NextResponse } from "next/server";
import dbConnect from "@/lib/db"; // or wherever your db connect function is
import Prediction from "@/models/Prediction"; // assuming you have this

export async function DELETE(req: Request, context: { params: { id: string } }) {
  try {
    await dbConnect;

    const { id } = context.params; // <- use context.params, not just params

    const deleted = await Prediction.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: "Prediction not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Prediction deleted successfully" });
  } catch (error) {
    console.error("Error deleting prediction:", error);
    return NextResponse.json({ message: "Failed to delete prediction" }, { status: 500 });
  }
}
