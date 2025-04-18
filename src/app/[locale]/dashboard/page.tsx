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
  Cell,
} from "recharts";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, QrCode, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import html2canvas from "html2canvas-pro";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import Image from "next/image";
import { exportPredictionsToCSV } from "@/lib/exportCsv";
import { useLocale, useTranslations } from "next-intl"; // 👈 Import translations
import LanguageSwitcher from "@/components/LanguageSwitcher";

type Prediction = {
  _id: string;
  treeId: string;
  link: { [key: string]: number };
  lastImage: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [predictionToDelete, setPredictionToDelete] =
    useState<Prediction | null>(null);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [aggregatedData, setAggregatedData] = useState<
    { name: string; value: number }[]
  >([]);

  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("DashboardPage"); // 👈 Hook to use translations

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const res = await fetch("/api/predictions");
      const data = await res.json();
      setPredictions(data.predictions);
    } catch {
      toast.error(t("failed_to_load_predictions"));
    }
  };

  const loadMore = () => {
    setVisibleCount((prev) => prev + 4);
    toast.success(t("more_charts_loaded"));
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (res.ok) {
        toast.success(t("logged_out_successfully"));
        router.push(`\/${locale}/login`);
      } else {
        toast.error(t("failed_to_logout"));
      }
    } catch {
      toast.error(t("something_went_wrong"));
    }
  };

  const handleShowQRCode = async (prediction: Prediction) => {
    const qrData = JSON.stringify(prediction.link);
    const qrCodeURL = await QRCode.toDataURL(qrData);
    setQrCodeUrl(qrCodeURL);
    setQrModalOpen(true);
  };

  const handleOpenAnalysis = () => {
    const aggregate: { [key: string]: number } = {};

    predictions.forEach((prediction) => {
      Object.entries(prediction.link).forEach(([key, value]) => {
        if (!aggregate[key]) {
          aggregate[key] = 0;
        }
        aggregate[key] += value;
      });
    });

    const aggregatedArray = Object.entries(aggregate)
      .map(([key, value]) => ({ name: key, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3); // Only top 3

    setAggregatedData(aggregatedArray);
    setAnalysisModalOpen(true);
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

    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Dr. Orange - Tree Report", 35, 18);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Tree ID: ${prediction.treeId}`, 10, 40);
    doc.text(`Date: ${dateStr}    Time: ${timeStr}`, 10, 48);

    const qrData = JSON.stringify(prediction.link);
    const qrCodeURL = await QRCode.toDataURL(qrData);
    doc.addImage(qrCodeURL, "PNG", 150, 35, 45, 45);

    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text("Captured Image:", 10, 65);
    doc.line(10, 67, 200, 67);

    const imgData = `data:image/png;base64,${prediction.lastImage}`;
    doc.addImage(imgData, "PNG", 10, 70, 80, 60);

    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text("Result Chart:", 10, 140);
    doc.line(10, 142, 200, 142);

    const chartContainer = document.getElementById(
      `chart-res-container-${prediction._id}`
    );

    if (!chartContainer) {
      toast.error(t("chart_not_found"));
      return;
    }

    setTimeout(async () => {
      const chartCanvas = await html2canvas(chartContainer, {
        backgroundColor: "#ffffff",
        useCORS: true,
        scale: 2,
      });

      const chartDataUrl = chartCanvas.toDataURL("image/png");
      doc.addImage(chartDataUrl, "PNG", 10, 145, 180, 70);

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
    }, 300);
  };

  const formatLabel = (label: string) =>
    label.length > 10 ? `${label.slice(0, 10)}...` : label;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex justify-between items-center px-6 py-4 shadow bg-white">
        <div className="text-xl font-bold text-blue-700">
          {t("dashboard_title")}
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleOpenAnalysis}>
            {t("see_analysis")}
          </Button>

          <Button
            variant="outline"
            onClick={() => exportPredictionsToCSV(predictions)}
          >
            {t("download_csv")}
          </Button>
          <Button variant="outline">{t("download_report")}</Button>
          <Button onClick={handleLogout} variant="destructive">
            {t("logout")}
          </Button>
          {/* Language Switcher */}
          <div className="">
            <LanguageSwitcher />
          </div>
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
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData
                        .sort((a, b) => b.value - a.value)
                        .map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              index === 0
                                ? "red"
                                : index === 1
                                ? "green"
                                : index === 2
                                ? "yellow"
                                : "rgb(59, 130, 246)"
                            }
                          />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          );
        })}
      </main>

      <div className="flex justify-center py-6">
        {visibleCount < predictions.length && (
          <Button onClick={loadMore}>{t("load_more")}</Button>
        )}
      </div>

      {/* QR Dialog */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="flex flex-col items-center justify-center">
          <DialogTitle className="text-bold">
            {t("download_qr_title")}
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

      {/* Delete Dialog */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="flex flex-col items-center justify-center space-y-4">
          <DialogTitle className="text-red-600 text-lg font-bold">
            {t("confirm_deletion_title")}
          </DialogTitle>
          <p className="text-center text-gray-600">
            {t("confirm_deletion_text")}
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!predictionToDelete) return;

                try {
                  const res = await fetch(
                    `/api/predictions/${predictionToDelete._id}`,
                    { method: "DELETE" }
                  );
                  if (res.ok) {
                    toast.success(t("prediction_deleted_successfully"));
                    setPredictions((prev) =>
                      prev.filter((p) => p._id !== predictionToDelete._id)
                    );
                  } else {
                    toast.error(t("failed_to_delete_prediction"));
                  }
                } catch (error) {
                  console.error(error);
                  toast.error(t("something_went_wrong"));
                } finally {
                  setDeleteModalOpen(false);
                  setPredictionToDelete(null);
                }
              }}
            >
              {t("confirm_delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={analysisModalOpen} onOpenChange={setAnalysisModalOpen}>
        <DialogContent className="flex flex-col items-center justify-center space-y-6">
          <DialogTitle className="text-lg font-bold text-blue-700">
            {t("top_3_analysis")}
          </DialogTitle>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aggregatedData}>
                <XAxis dataKey="name" tickFormatter={formatLabel} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {aggregatedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === 0
                          ? "red"
                          : index === 1
                          ? "green"
                          : index === 2
                          ? "yellow"
                          : "rgb(59, 130, 246)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* LEGENDS */}
          <div className="flex flex-col w-full px-6 space-y-2">
            {aggregatedData.map((entry, index) => {
              const total = aggregatedData.reduce(
                (sum, item) => sum + item.value,
                0
              );
              const percentage = ((entry.value / total) * 100).toFixed(1);

              const color =
                index === 0
                  ? "red"
                  : index === 1
                  ? "green"
                  : index === 2
                  ? "yellow"
                  : "gray";

              return (
                <div key={entry.name} className="flex items-center gap-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: color }}
                  ></div>
                  <div className="flex justify-between w-full text-sm">
                    <span className="font-medium">{entry.name}</span>
                    <span className="text-gray-500">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
