import { saveAs } from "file-saver";

export const exportPredictionsToCSV = (predictions: any[]) => {
  if (predictions.length === 0) {
    return;
  }

  const headers = ["Tree ID", "Created At", "Link Data"];

  const rows = predictions.map((prediction) => [
    prediction.treeId,
    new Date(prediction.createdAt).toLocaleString(),
    JSON.stringify(prediction.link),
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);

  saveAs(encodedUri, `predictions_${new Date().toISOString()}.csv`);
};
