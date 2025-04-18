"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, QrCode, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import html2canvas from "html2canvas-pro";
import { Dialog, DialogContent } from "@/components/ui/dialog"; // Import Dialog
import Image from "next/image";
import { DialogTitle } from "@radix-ui/react-dialog";
import { exportPredictionsToCSV } from "@/lib/exportCsv";

type Prediction = {
  _id: string;
  treeId: string;
  link: { [key: string]: number };
  lastImage: string; // base64 image
  createdAt: string;
};

export default function DashboardPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [visibleCount, setVisibleCount] = useState(4);
  // Inside the DashboardPage component:
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [predictionToDelete, setPredictionToDelete] =
    useState<Prediction | null>(null);

  const router = useRouter();

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const res = await fetch("/api/predictions");
      const data = await res.json();
      console.log("Fetched predictions:", data); // <<< ADD THIS
      setPredictions(data.predictions);
    } catch {
      toast.error("Failed to load predictions");
    }
  };

  const loadMore = () => {
    setVisibleCount((prev) => prev + 4);
    toast.success("More charts loaded");
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (res.ok) {
        toast.success("Logged out successfully");
        router.push("/login");
      } else {
        toast.error("Failed to logout");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleShowQRCode = async (prediction: Prediction) => {
    const qrData = JSON.stringify(prediction.link);
    const qrCodeURL = await QRCode.toDataURL(qrData);
    setQrCodeUrl(qrCodeURL);
    setQrModalOpen(true);
  };

  const generatePDF = async (prediction: Prediction) => {
    const doc = new jsPDF("p", "mm", "a4");

    const dateObj = new Date(prediction.createdAt);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString();
    const fileName = `${prediction.treeId}-${dateStr}-${timeStr}`.replace(
      /[:/]/g,
      "-"
    );

    // Header
    doc.setFillColor(59, 130, 246); // blue-500
    doc.rect(0, 0, 210, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Dr. Orange - Tree Report", 35, 18);

    // Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Tree ID: ${prediction.treeId}`, 10, 40);
    doc.text(`Date: ${dateStr}    Time: ${timeStr}`, 10, 48);

    // QR Code
    const qrData = JSON.stringify(prediction.link);
    const qrCodeURL = await QRCode.toDataURL(qrData);
    doc.addImage(qrCodeURL, "PNG", 150, 35, 45, 45);

    // Captured Image
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text("Captured Image:", 10, 65);
    doc.line(10, 67, 200, 67);

    const imgData = `data:image/png;base64,${prediction.lastImage}`;
    doc.addImage(imgData, "PNG", 10, 70, 80, 60);

    // Result Chart
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text("Result Chart:", 10, 140);
    doc.line(10, 142, 200, 142);

    const chartContainer = document.getElementById(
      `chart-res-container-${prediction._id}`
    );
    console.log("Chart container found:", chartContainer);

    if (!chartContainer) {
      toast.error("Chart not found. Please reload and try again.");
      return;
    }

    // Capture the chart
    // Add a small delay before capturing the canvas
    setTimeout(async () => {
      // Capture the chart after a short delay
      const chartCanvas = await html2canvas(chartContainer, {
        backgroundColor: "#ffffff", // Force background color to white
        useCORS: true, // Allow CORS
        scale: 2, // Increase canvas scale for better quality
      });

      // Convert the canvas to image
      const chartDataUrl = chartCanvas.toDataURL("image/png");
      doc.addImage(chartDataUrl, "PNG", 10, 145, 180, 70);

      // Raw Data
      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246);
      doc.text("Raw Data:", 10, 225);
      doc.line(10, 227, 200, 227);

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const rawData = JSON.stringify(prediction.link, null, 2);
      const lines = doc.splitTextToSize(rawData, 180);
      doc.text(lines, 10, 232);

      doc.save(`${fileName}.pdf`);
    }, 300); // Set delay (300ms or more depending on the chart render time)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex justify-between items-center px-6 py-4 shadow bg-white">
        <div className="text-xl font-bold text-blue-700">
          🧃 Dr. Orange Dashboard
        </div>
        <div className="flex gap-4">
          <Button variant="outline">See Analysis</Button>
          <Button
            variant="outline"
            onClick={() => exportPredictionsToCSV(predictions)}
          >
            Download CSV
          </Button>

          <Button variant="outline">Download Report</Button>
          <Button onClick={handleLogout} variant="destructive">
            Logout
          </Button>
        </div>
      </header>

      <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {predictions.slice(0, visibleCount).map((prediction) => {
          const chartData = Object.entries(prediction.link).map(
            ([key, value]) => ({
              name: key,
              value: value as number,
            })
          );

          return (
            <Card key={prediction._id} className="p-4 shadow rounded-2xl">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold">{prediction.treeId}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => generatePDF(prediction)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShowQRCode(prediction)}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setPredictionToDelete(prediction);
                      setDeleteModalOpen(true);
                    }}
                  >
                    <Trash className="text-red-700 h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div id={`chart-container-${prediction._id}`}>
                <ResponsiveContainer
                  id={`chart-res-container-${prediction._id}`}
                  width="100%"
                  height={200}
                >
                  <BarChart data={chartData} id={`chart-${prediction._id}`}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      fill="rgb(59, 130, 246)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          );
        })}
      </main>

      <div className="flex justify-center py-6">
        {visibleCount < predictions.length && (
          <Button onClick={loadMore}>Load More</Button>
        )}
      </div>
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="flex flex-col items-center justify-center">
          <DialogTitle className="text-bold">
            Download results in QR Format
          </DialogTitle>
          {qrCodeUrl && (
            <Image
              src={qrCodeUrl}
              width={300}
              height={200}
              alt="QR Code"
              className="w-48 h-48"
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="flex flex-col items-center justify-center space-y-4">
          <DialogTitle className="text-red-600 text-lg font-bold">
            Confirm Deletion
          </DialogTitle>
          <p className="text-center text-gray-600">
            Are you sure you want to delete this prediction? <br /> This action
            cannot be undone.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!predictionToDelete) return;

                try {
                  const res = await fetch(
                    `/api/predictions/${predictionToDelete._id}`,
                    {
                      method: "DELETE",
                    }
                  );

                  if (res.ok) {
                    toast.success("Prediction deleted successfully");
                    setPredictions((prev) =>
                      prev.filter((p) => p._id !== predictionToDelete._id)
                    );
                  } else {
                    toast.error("Failed to delete prediction");
                  }
                } catch (error) {
                  console.error(error);
                  toast.error("Something went wrong");
                } finally {
                  setDeleteModalOpen(false);
                  setPredictionToDelete(null);
                }
              }}
            >
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
