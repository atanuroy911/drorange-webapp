"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Eye, QrCode, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import html2canvas from "html2canvas-pro";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { exportPredictionsToCSV } from "@/lib/exportCsv";
import { useLocale, useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ClassInfo } from "@/data/classInfo.en";
import { font } from "@/fonts/notosansfont"; // Adjust the path
import { bengali_font } from "@/fonts/notosansbengali";
import { arabic_font } from "@/fonts/notosansarabic";

type Prediction = {
  _id: string;
  treeId: string;
  treeDesc: string;
  treeAuthor: string;
  link: { [key: string]: number };
  lastImage: string;
  createdAt: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
  const [selectedPrediction, setSelectedPrediction] =
    useState<Prediction | null>(null);
  const [chartDetailsModalOpen, setChartDetailsModalOpen] = useState(false);

  const [topPredictionInfo, setTopPredictionInfo] = useState<ClassInfo | null>(
    null
  );

  const [classInfoList, setClassInfoList] = useState<ClassInfo[]>([]);

  const locale = useLocale();

  // const getClassInfoList = async () => {
  //   try {
  //     const classInfoModule = await import(`@/data/classInfo.${locale}`);
  //     setClassInfoList(classInfoModule.classInfoList); // Store in state
  //   } catch (error) {
  //     console.error(`Failed to load class info for locale: ${locale}`, error);
  //     setClassInfoList([]); // Fallback to empty list
  //   }
  // };

  const { data } = useSWR("/api/predictions", fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
  });

  useEffect(() => {
    const loadClassInfo = async () => {
      try {
        const classInfoModule = await import(`@/data/classInfo.${locale}`);
        setClassInfoList(classInfoModule.classInfoList); // Store in state
      } catch (error) {
        console.error(`Failed to load class info for locale: ${locale}`, error);
        setClassInfoList([]); // Fallback to empty list
      }
    };

    loadClassInfo();
  }, [locale]);

  useEffect(() => {
    if (data?.predictions) {
      setPredictions(data.predictions); // Update the predictions state
      const aggregate: { [key: string]: number } = {};

      data.predictions.forEach((prediction: Prediction) => {
        if (prediction.link && typeof prediction.link === "object") {
          Object.entries(prediction.link).forEach(([key, value]) => {
            const numericValue = Number(value);
            if (!isNaN(numericValue)) {
              aggregate[key] = (aggregate[key] || 0) + numericValue;
            }
          });
        }
      });

      const aggregatedArray = Object.entries(aggregate)
        .map(([key, value]) => ({ name: key, value }))
        .sort((a, b) => b.value - a.value);

      setAggregatedData(aggregatedArray);
    }
  }, [data]);

  const router = useRouter();
  const t = useTranslations("DashboardPage");

  // useEffect(() => {
  //   fetchPredictions();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // const fetchPredictions = async () => {
  //   try {
  //     const res = await fetch("/api/predictions");
  //     const data = await res.json();
  //     setPredictions(data.predictions);
  //   } catch {
  //     toast.error(t("failed_to_load_predictions"));
  //   }
  // };

  const loadMore = () => {
    setVisibleCount((prev) => prev + 4);
    toast.success(t("more_charts_loaded"));
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (res.ok) {
        toast.success(t("logged_out_successfully"));
        router.push(`/${locale}/login`);
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

  const getClassInfo = (className: string): ClassInfo | undefined => {
    // Ensure className is a non-empty string before proceeding
    if (!className || typeof className !== "string") {
      console.warn("getClassInfo received invalid className:", className);
      return undefined;
    }

    const normalizedInputName = className.trim().toLowerCase();

    // Handle cases where trimming results in an empty string
    if (!normalizedInputName) {
      console.warn("getClassInfo: className became empty after trimming.");
      return undefined;
    }

    console.log(
      `getClassInfo: Searching for match for "${normalizedInputName}"`
    ); // Debug log

    const found = classInfoList.find((classInfo) => {
      // Ensure classInfo.className is also a valid string
      if (!classInfo.className || typeof classInfo.className !== "string") {
        console.warn(
          "getClassInfo: Skipping invalid className in classInfoList:",
          classInfo.className
        );
        return false; // Skip this entry if its className is invalid
      }

      const normalizedListName = classInfo.className.trim().toLowerCase();

      // Improved partial match: check if one string contains the other
      const isMatch =
        normalizedListName.includes(normalizedInputName) ||
        normalizedInputName.includes(normalizedListName);

      // if (isMatch) { // Optional: Log when a match is found during search
      //   console.log(`getClassInfo: Matched "${normalizedInputName}" with "${normalizedListName}"`);
      // }

      return isMatch;
    });

    if (!found) {
      console.warn(
        `getClassInfo: No match found in classInfoList for "${normalizedInputName}"`
      ); // Debug log
    }

    return found;
  };

  const handleOpenAnalysis = () => {
    const aggregate: { [key: string]: number } = {};

    predictions.forEach((prediction) => {
      Object.entries(prediction.link).forEach(([key, value]) => {
        aggregate[key] = (aggregate[key] || 0) + value;
      });
    });

    const aggregatedArray = Object.entries(aggregate)
      .map(([key, value]) => ({ name: key, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    setAggregatedData(aggregatedArray);
    setAnalysisModalOpen(true);
  };

  // Helper function within DashboardPage component
  const getTopPredictionDetails = (link: {
    [key: string]: number;
  }): {
    topClassName: string | null;
    topValue: number;
    classInfo: ClassInfo | null;
  } => {
    let topClassName: string | null = null;
    let topValue = -Infinity;
    let classInfo: ClassInfo | null = null;

    if (link && typeof link === "object" && Object.keys(link).length > 0) {
      Object.entries(link).forEach(([key, value]) => {
        const numericValue = Number(value);
        if (!isNaN(numericValue) && numericValue > topValue) {
          topValue = numericValue;
          topClassName = key;
        }
      });
    }

    if (topClassName) {
      // Assuming getClassInfo is defined in the same scope
      const info = getClassInfo(topClassName);
      classInfo = info || null;
    }

    return { topClassName, topValue, classInfo };
  };

  // You can now simplify handleShowChartDetails slightly if you want:
  const handleShowChartDetails = (prediction: Prediction) => {
    setSelectedPrediction(prediction);
    const { classInfo } = getTopPredictionDetails(prediction.link); // Use the helper
    setTopPredictionInfo(classInfo); // Set the state directly
    setChartDetailsModalOpen(true);
  };

  const calculatePercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(2);
  };

  // Add this function within your DashboardPage component
  const generateAggregatePDF = async () => {
    if (
      !predictions ||
      predictions.length === 0 ||
      !aggregatedData ||
      aggregatedData.length === 0
    ) {
      toast.info(t("no_data_to_generate_report")); // Add a new translation key
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");
    if (locale === "bn") {
      doc.addFileToVFS("notosansbn-normal.ttf.ttf", bengali_font);
      doc.addFont("notosansbn-normal.ttf.ttf", "notosansbn", "normal");
      doc.setFont("notosansbn");
    } else if (locale == "fa") {
      doc.addFileToVFS("notosansfa-normal.ttf.ttf", arabic_font);
      doc.addFont("notosansfa-normal.ttf.ttf", "notosansfa", "normal");
      doc.setFont("notosansfa");
    } else {
      doc.addFileToVFS("notosans-normal.ttf", font);
      doc.addFont("notosans-normal.ttf", "notosans", "normal");
      doc.setFont("notosans");
    }

    let yPos = 10;

    // --- Header ---
    doc.setFillColor(255, 165, 0);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Dr. Orange - Garden Aggregate Report", 35, 18);
    yPos = 40;

    // --- Get Pre-calculated Aggregate Data ---
    // Use the state directly, which is updated in the useEffect
    const overallHighest = aggregatedData.length > 0 ? aggregatedData[0] : null;
    const top3Defects = aggregatedData.slice(0, 3);

    let highestPredictedClassInfo: ClassInfo | null = null;
    if (overallHighest) {
      highestPredictedClassInfo = getClassInfo(overallHighest.name) || null;
    }

    // --- Add Chart to PDF ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Overall Garden Analysis - Prediction Distribution:", 10, yPos);
    doc.line(10, yPos + 2, 200, yPos + 2);
    yPos += 8;

    const chartContainer = document.getElementById(
      "aggregate-pie-chart-container"
    );

    if (chartContainer) {
      try {
        // Small delay to ensure the chart is rendered with the updated aggregatedData
        // This might still be necessary depending on browser rendering speeds
        await new Promise((resolve) => setTimeout(resolve, 200)); // Increased delay slightly

        const chartCanvas = await html2canvas(chartContainer, {
          backgroundColor: "#ffffff",
          useCORS: true,
          scale: 2,
        });
        const chartDataUrl = chartCanvas.toDataURL("image/png", 1.0);

        const chartAspectRatio = chartCanvas.width / chartCanvas.height;
        let chartImgWidth = 150;
        let chartImgHeight = chartImgWidth / chartAspectRatio;
        const maxChartHeight = 80;

        if (chartImgHeight > maxChartHeight) {
          chartImgHeight = maxChartHeight;
          chartImgWidth = chartImgHeight * chartAspectRatio;
        }

        doc.addImage(
          chartDataUrl,
          "PNG",
          30,
          yPos,
          chartImgWidth,
          chartImgHeight
        );
        yPos += chartImgHeight + 10;
      } catch (canvasError) {
        console.error(
          "Failed to render aggregate chart to canvas for PDF:",
          canvasError
        );
        toast.error(t("failed_to_render_aggregate_chart")); // Add translation key
        doc.setTextColor(255, 0, 0);
        doc.text("Aggregate chart rendering error.", 10, yPos + 10);
        doc.setTextColor(0, 0, 0);
        yPos += 20;
      }
    } else {
      doc.setTextColor(255, 0, 0);
      doc.text("Aggregate chart container not found.", 10, yPos + 10);
      doc.setTextColor(0, 0, 0);
      yPos += 20;
    }

    // --- Report Content (Summary and Details) ---
    if (yPos > 240) {
      doc.addPage();
      yPos = 15;
      doc.setTextColor(0, 0, 0);
    }

    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text("Summary and Details:", 10, yPos);
    doc.line(10, yPos + 2, 200, yPos + 2);
    yPos += 8;

    // Highest Predicted Class (Use aggregatedData state)
    doc.setFontSize(12);

    doc.text("Highest Predicted Class:", 10, yPos);

    if (overallHighest) {
      doc.text(
        `${
          overallHighest.name
        } (Aggregate Value: ${overallHighest.value.toFixed(2)})`,
        70,
        yPos
      );
    } else {
      doc.text("N/A", 70, yPos);
    }
    yPos += 8;

    // Details for Highest Predicted Class (Use highestPredictedClassInfo)
    if (highestPredictedClassInfo) {
      doc.text("Details:", 10, yPos);

      yPos += 6;

      doc.setFontSize(10);
      const addDetail = (label: string, text: string) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 15;
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
        }

        doc.text(`${label}:`, 15, yPos);

        const lines = doc.splitTextToSize(text || "N/A", 160);
        doc.text(lines, 45, yPos);
        yPos += lines.length * 4 + 2;
      };

      addDetail("Type", highestPredictedClassInfo.type);
      addDetail("Description", highestPredictedClassInfo.description);
      addDetail("Potential Damage", highestPredictedClassInfo.damage);

      if (yPos > 270) {
        doc.addPage();
        yPos = 15;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
      }

      doc.text("Suggested Solutions:", 15, yPos);

      yPos += 6;

      if (
        highestPredictedClassInfo.solutions &&
        highestPredictedClassInfo.solutions.length > 0
      ) {
        highestPredictedClassInfo.solutions.forEach((solution) => {
          if (yPos > 280) {
            doc.addPage();
            yPos = 15;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);

            doc.text("Suggested Solutions (cont.):", 15, yPos);

            yPos += 6;
          }
          const lines = doc.splitTextToSize(`- ${solution}`, 160);
          doc.text(lines, 20, yPos);
          yPos += lines.length * 4 + 1;
        });
      } else {
        doc.text("- N/A", 20, yPos);
        yPos += 6;
      }
      yPos += 5;
    } else {
      doc.setFontSize(10);
      doc.text(
        "Details not available for the highest predicted class.",
        15,
        yPos
      );
      yPos += 10;
    }

    // Top 3 Detected Defects (Use aggregatedData state)
    if (yPos > 250) {
      doc.addPage();
      yPos = 15;
      doc.setTextColor(0, 0, 0);
    }
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text("Top 3 Detected Defects:", 10, yPos);
    doc.line(10, yPos + 2, 200, yPos + 2);
    yPos += 8;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    if (top3Defects && top3Defects.length > 0) {
      top3Defects.forEach((defect, index) => {
        if (yPos > 285) {
          doc.addPage();
          yPos = 15;
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(12);
        }
        doc.text(
          `${index + 1}. ${
            defect.name
          } (Aggregate Value: ${defect.value.toFixed(2)})`,
          15,
          yPos
        );
        yPos += 7;
      });
    } else {
      doc.text("No defects detected.", 15, yPos);
      yPos += 7;
    }
    yPos += 5;

    // --- Footer ---
    if (yPos > 270) {
      doc.addPage();
      yPos = 15;
      doc.setTextColor(0, 0, 0);
    }
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Report Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      10,
      290
    );

    // --- Save ---
    const fileName = `Garden_Aggregate_Report_${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "_")}.pdf`;

    doc.save(fileName);
    toast.success(t("pdf_generated_successfully"));
  };

  const generatePDF = async (prediction: Prediction) => {
    const doc = new jsPDF("p", "mm", "a4");

    if (locale === "bn") {
      doc.addFileToVFS("notosansbn-normal.ttf.ttf", bengali_font);
      doc.addFont("notosansbn-normal.ttf.ttf", "notosansbn", "normal");
      doc.setFont("notosansbn");
    } else if (locale == "fa") {
      doc.addFileToVFS("notosansfa-normal.ttf.ttf", arabic_font);
      doc.addFont("notosansfa-normal.ttf.ttf", "notosansfa", "normal");
      doc.setFont("notosansfa");
    } else {
      doc.addFileToVFS("notosans-normal.ttf", font);
      doc.addFont("notosans-normal.ttf", "notosans", "normal");
      doc.setFont("notosans");
    }

    let yPos = 10; // Use a variable to track vertical position

    // --- Header ---
    doc.setFillColor(255, 165, 0);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Dr. Orange - Tree Report", 35, 18); // Main title

    // Add subheading for the author
    doc.setFontSize(12);
    doc.text(`Reported by: ${prediction.treeAuthor || "N/A"}`, 35, 25); // Subheading
    yPos = 40; // Adjust yPos for the next section

    // --- Basic Info & QR ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`${t("tree_id")} ${prediction.treeId}`, 10, yPos);
    const dateObj = new Date(prediction.createdAt);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString();
    doc.text(`Tree Description: ${prediction.treeDesc}`, 10, yPos + 6);
    doc.text(`Date: ${dateStr}`, 10, yPos + 12);
    doc.text(`Time: ${timeStr}`, 10, yPos + 18);

    try {
      // Add try-catch for async QR code generation
      const qrData = JSON.stringify(prediction.link);
      const qrCodeURL = await QRCode.toDataURL(qrData);
      doc.addImage(qrCodeURL, "PNG", 150, yPos - 5, 45, 45);
    } catch (qrError) {
      console.error("Failed to generate QR Code for PDF:", qrError);
      doc.setTextColor(255, 0, 0);
      doc.text("QR Code Error", 150, yPos + 15);
      doc.setTextColor(0, 0, 0);
    }
    yPos += 40; // Adjust yPos

    // --- Captured Image ---
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text("Captured Image:", 10, yPos);
    doc.line(10, yPos + 2, 200, yPos + 2);
    yPos += 5;
    try {
      // Add try-catch for image loading
      const imgData = `data:image/png;base64,${prediction.lastImage}`;
      // Calculate aspect ratio to fit width or height
      const imgProps = doc.getImageProperties(imgData);
      const aspectRatio = imgProps.width / imgProps.height;
      let imgWidth = 80; // Max width
      let imgHeight = imgWidth / aspectRatio;
      const maxHeight = 60;
      if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = imgHeight * aspectRatio;
      }
      doc.addImage(imgData, "PNG", 10, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 5; // Move below image
    } catch (imgError) {
      console.error("Failed to add image to PDF:", imgError);
      doc.setTextColor(255, 0, 0);
      doc.text("Error loading image.", 10, yPos + 10);
      doc.setTextColor(0, 0, 0);
      yPos += 20;
    }

    // --- Result Chart ---
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text("Result Chart:", 10, yPos);
    doc.line(10, yPos + 2, 200, yPos + 2);
    yPos += 5;

    const chartContainer = document.getElementById(
      `chart-res-container-${prediction._id}`
    );
    if (!chartContainer) {
      toast.error(t("chart_not_found"));
      doc.setTextColor(255, 0, 0);
      doc.text("Chart rendering error.", 10, yPos + 10);
      yPos += 20;
      // Continue without chart? Or stop? Decide based on requirements.
      // For now, we'll continue to add other details.
    } else {
      try {
        // Add try-catch for html2canvas
        const chartCanvas = await html2canvas(chartContainer, {
          backgroundColor: "#ffffff",
          useCORS: true,
          scale: 2, // Increase scale for better resolution
        });
        const chartDataUrl = chartCanvas.toDataURL("image/png", 1.0); // Use PNG with high quality

        // Calculate aspect ratio for chart image
        const chartAspectRatio = chartCanvas.width / chartCanvas.height;
        let chartImgWidth = 180; // Max width
        let chartImgHeight = chartImgWidth / chartAspectRatio;
        const maxChartHeight = 80; // Max height allowed for chart
        if (chartImgHeight > maxChartHeight) {
          chartImgHeight = maxChartHeight;
          chartImgWidth = chartImgHeight * chartAspectRatio;
        }

        doc.addImage(
          chartDataUrl,
          "PNG",
          10,
          yPos,
          chartImgWidth,
          chartImgHeight
        );
        yPos += chartImgHeight + 5; // Move below chart
      } catch (canvasError) {
        console.error("Failed to render chart to canvas for PDF:", canvasError);
        toast.error(t("failed_to_render_chart_for_pdf"));
        doc.setTextColor(255, 0, 0);
        doc.text("Chart rendering error.", 10, yPos + 10);
        doc.setTextColor(0, 0, 0);
        yPos += 20;
      }
    }

    // --- Top Prediction Details --- (NEW SECTION)
    const { classInfo } = getTopPredictionDetails(prediction.link); // Use helper

    // Check if adding this section exceeds page height (approx 297mm)
    if (yPos > 260) {
      // Leave some margin at the bottom
      doc.addPage();
      yPos = 15; // Reset yPos for new page
    }

    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text("Top Prediction Details:", 10, yPos);
    doc.line(10, yPos + 2, 200, yPos + 2);
    yPos += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    if (classInfo) {
      doc.text("Class:", 10, yPos);

      doc.text(classInfo.className || "N/A", 35, yPos);
      yPos += 6;

      doc.text("Type:", 10, yPos);

      doc.text(classInfo.type || "N/A", 35, yPos);
      yPos += 6;

      doc.text("Description:", 10, yPos);

      const descLines = doc.splitTextToSize(
        classInfo.description || "N/A",
        160
      ); // Max width for description
      doc.text(descLines, 35, yPos);
      yPos += descLines.length * 4 + 2; // Adjust spacing based on lines

      doc.text("Damage:", 10, yPos);

      const damageLines = doc.splitTextToSize(classInfo.damage || "N/A", 160);
      doc.text(damageLines, 35, yPos);
      yPos += damageLines.length * 4 + 2;

      doc.text("Solutions:", 10, yPos);

      yPos += 6; // Add space before solutions
      if (classInfo.solutions && classInfo.solutions.length > 0) {
        classInfo.solutions.forEach((solution) => {
          // Check for page break before adding solution
          if (yPos > 280) {
            doc.addPage();
            yPos = 15;
            // Optional: Repeat section header on new page?
          }
          const solutionLines = doc.splitTextToSize(`- ${solution}`, 160);
          doc.text(solutionLines, 15, yPos); // Indent solutions
          yPos += solutionLines.length * 4 + 1;
        });
      } else {
        doc.text("- N/A", 15, yPos);
        yPos += 6;
      }
    } else {
      doc.text("Details not available for the top prediction.", 10, yPos);
      yPos += 6;
    }
    yPos += 5; // Add some space before next section

    // --- Raw Data ---
    // Check for page break before adding Raw Data
    if (yPos > 250) {
      // Leave more space for Raw Data potentially
      doc.addPage();
      yPos = 15;
    }
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text("Raw Data:", 10, yPos);
    doc.line(10, yPos + 2, 200, yPos + 2);
    yPos += 8;

    doc.setFontSize(9); // Smaller font for raw data
    doc.setTextColor(0, 0, 0);
    try {
      const rawData = JSON.stringify(prediction.link, null, 2);
      const lines = doc.splitTextToSize(rawData, 180); // Max width
      // Check page break for each line of raw data potentially
      lines.forEach((line: string) => {
        if (yPos > 285) {
          // Check before printing line
          doc.addPage();
          yPos = 15;
          // Optional: Repeat header?
        }
        doc.text(line, 10, yPos);
        yPos += 4; // Adjust line height for smaller font
      });
    } catch (jsonError) {
      console.error("Failed to stringify raw data for PDF:", jsonError);
      doc.text("Error displaying raw data.", 10, yPos);
      yPos += 6;
    }

    // --- Save ---
    const fileName = `${prediction.treeId}-${dateStr}-${timeStr}`
      .replace(
        /[/:]/g, // Replace slashes and colons
        "-"
      )
      .replace(/\s+/g, "_"); // Replace spaces with underscore

    // Use setTimeout only if truly necessary for rendering delays (like charts)
    // For text additions, it's generally not needed.
    // Consider if html2canvas needs the delay. If so, move save inside its callback/promise.
    // Assuming html2canvas promise resolves before this point if it was successful.
    doc.save(`${fileName}.pdf`);
    toast.success(t("pdf_generated_successfully"));

    // Remove the setTimeout wrapper unless html2canvas consistently fails without it.
    // If you keep setTimeout, ensure doc.save() is inside the timeout callback.
    // setTimeout(async () => {
    //     // ... (code that might need delay, like canvas rendering) ...
    //     doc.save(`${fileName}.pdf`);
    //     toast.success(t("pdf_generated_successfully"));
    // }, 300); // Delay might not be needed anymore if using await correctly
  };

  const formatLabel = (label: string) =>
    label.length > 10 ? `${label.slice(0, 10)}...` : label;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="flex justify-between items-center px-6 py-4 shadow bg-white">
        <div className="flex items-center text-xl font-bold text-black">
          <Image
            src="/logo3.png"
            alt="Dr Orange Logo"
            width={40}
            height={40}
            className="mr-2"
          />
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
          <Button
            variant="outline"
            // onClick={() => toast.info("Select individual reports to download.")} // Remove or comment out the old handler
            onClick={generateAggregatePDF} // Add the new handler
          >
            {t("download_report")}{" "}
            {/* Use the existing translation key or the new one */}
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            {t("logout")}
          </Button>
          <LanguageSwitcher />
        </div>
      </header>

      {/* MAIN GRID */}
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
                <div className="flex flex-col">
                  <h3 className="font-semibold">
                    {t("tree_id")} : {prediction.treeId}
                  </h3>
                  <p className="text-gray-700">
                    {t("submission_time")} :{" "}
                    {new Date(prediction?.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {/* Eye Button - New addition */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShowChartDetails(prediction)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
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

      {/* Chart Details Modal - UPDATED */}
      <Dialog
        open={chartDetailsModalOpen}
        onOpenChange={(isOpen) => {
          setChartDetailsModalOpen(isOpen);
          // Reset top prediction info when closing
          if (!isOpen) {
            setTopPredictionInfo(null);
            setSelectedPrediction(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          {/* Increased width and scroll */}
          <DialogTitle className="text-center text-xl font-semibold mb-4">
            {t("chart_details_title")} for {t("tree_id")}:{" "}
            {selectedPrediction?.treeId}
          </DialogTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {" "}
            {/* Use grid for layout */}
            {/* Left Column: Image and Pie Chart */}
            <div className="flex flex-col items-center space-y-4">
              {/* Display the Last Image */}
              {selectedPrediction?.lastImage && (
                <div className="w-full bg-gray-50 p-4 rounded-lg shadow-md">
                  <h4 className="font-semibold text-center py-2">
                    {t("last_image_title")}
                  </h4>
                  <Image
                    src={`data:image/png;base64,${selectedPrediction.lastImage.trimEnd()}`}
                    alt="Last Image"
                    width={400} // Adjust size as needed
                    height={300} // Adjust size as needed
                    className="rounded-md object-contain mx-auto" // Ensure image fits well
                  />
                </div>
              )}

              {/* Display the Pie Chart */}
              {selectedPrediction && (
                <div className="w-full bg-gray-50 p-4 rounded-lg shadow-md">
                  <h4 className="font-semibold mb-2 text-center">
                    {t("pie_chart_title")}
                  </h4>
                  <ResponsiveContainer width={400} height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(selectedPrediction.link)
                          .sort(
                            ([, aVal], [, bVal]) =>
                              (bVal as number) - (aVal as number)
                          ) // Sort data for consistent colors if needed
                          .map(([key, value]) => {
                            const total = Object.values(
                              selectedPrediction.link
                            ).reduce((acc, val) => acc + (val as number), 0);
                            return {
                              name: key,
                              value: value as number,
                              percentage: calculatePercentage(
                                value as number,
                                total
                              ),
                            };
                          })}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90} // Adjust radius
                        fill="#8884d8"
                        label={({ name, percentage }) =>
                          `${name} (${percentage}%)`
                        } // Show percentage on label
                        labelLine={false} // Optionally hide label lines if cluttered
                      >
                        {Object.entries(selectedPrediction.link)
                          .sort(
                            ([, aVal], [, bVal]) =>
                              (bVal as number) - (aVal as number)
                          )
                          .map(([key], index) => (
                            <Cell
                              key={`cell-${key}-${index}`}
                              // Use more distinct colors or a predefined color scale
                              fill={
                                [
                                  "#FF6384",
                                  "#36A2EB",
                                  "#FFCE56",
                                  "#4BC0C0",
                                  "#9966FF",
                                  "#FF9F40",
                                ][index % 6]
                              }
                            />
                          ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string, props) => [
                          `${value} (${props.payload.percentage}%)`,
                          name,
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            {/* Right Column: Top Prediction Details */}
            <div className="flex flex-col space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                  {t("submission_details")}
                </h3>
                <div className="space-y-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600">
                      {t("description")}:
                    </h4>
                    <p className="text-gray-700">
                      {selectedPrediction?.treeDesc || t("not_available")}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600">
                      {t("submission_time")}:
                    </h4>
                    <p className="text-gray-700">
                      {selectedPrediction?.createdAt
                        ? new Date(
                            selectedPrediction.createdAt
                          ).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600">
                      {t("reported_by")}:
                    </h4>
                    <p className="text-gray-700">
                      {selectedPrediction?.treeAuthor || t("not_available")}
                    </p>
                  </div>
                </div>
              </div>
              {topPredictionInfo ? (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold border-b pb-2">
                      {t("top_prediction_details")}
                    </h3>
                    <div>
                      <h4 className="font-medium text-md">
                        {t("class_name")}:
                      </h4>
                      <p className="text-gray-700">
                        {topPredictionInfo.className}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-md">{t("type")}:</h4>
                      <p className="text-gray-700">{topPredictionInfo.type}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-md">
                        {t("description")}:
                      </h4>
                      <p className="text-gray-700">
                        {topPredictionInfo.description}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-md">
                        {t("potential_damage")}:
                      </h4>
                      <p className="text-gray-700">
                        {topPredictionInfo.damage}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-md">
                        {t("suggested_solutions")}:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {topPredictionInfo.solutions.map((solution, index) => (
                          <li key={index}>{solution}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                selectedPrediction && ( // Show only if a prediction is selected but no info found
                  <p className="text-center text-gray-500">
                    {t("no_details_found")}
                  </p>
                )
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
        <DialogContent className="flex flex-col items-center justify-center sm:max-w-[1200px] max-h-[90vh] overflow-y-auto p-8">
          <DialogTitle className="text-2xl font-bold text-orange-500 mb-6">
            {t("top_3_analysis")}
          </DialogTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* Chart Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {`Chart for the garden`}
              </h3>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aggregatedData}>
                    <XAxis dataKey="name" tickFormatter={formatLabel} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
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

              {/* Legends */}
              <div className="flex flex-col mt-6 space-y-3">
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
                    <div key={entry.name} className="flex items-center gap-3">
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
            </div>

            {/* Solutions Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {t("suggested_solutions")}
              </h3>
              <div className="space-y-6 overflow-y-auto">
                {aggregatedData.map((entry) => {
                  const classInfo = getClassInfo(entry.name);
                  return (
                    <div key={entry.name} className="space-y-2">
                      <h4 className="font-medium text-md text-gray-700">
                        {entry.name}:
                      </h4>
                      {classInfo?.solutions &&
                      classInfo.solutions.length > 0 ? (
                        <ul className="list-disc list-inside text-gray-600 ml-4">
                          {classInfo.solutions.map((solution, index) => (
                            <li key={index}>{solution}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">
                          {t("no_solutions_available")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div
        id="aggregate-pie-chart-container"
        style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
      >
        {aggregatedData && aggregatedData.length > 0 && (
          <ResponsiveContainer width={400} height={300}>
            <PieChart>
              <Pie
                data={aggregatedData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                fill="#8884d8" // You might want a color scale here
                label={({ name }) => `${name}`} // Adjust label if percentage is not in aggregatedData
                labelLine={false}
              >
                {aggregatedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56",
                        "#4BC0C0",
                        "#9966FF",
                        "#FF9F40",
                      ][index % 6] // Using a simple color scale
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)}`,
                  name,
                ]}
              />{" "}
              {/* Adjust tooltip */}
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
