
/**
 * Utility to export data as CSV or JSON
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function downloadFile(content: string, fileName: string, contentType: string) {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function exportToJSON(data: any, fileName: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${fileName}.json`, 'application/json');
}

export function exportToTXT(content: string, fileName: string) {
  downloadFile(content, `${fileName}.txt`, 'text/plain;charset=utf-8;');
}

export function exportToMD(content: string, fileName: string) {
  downloadFile(content, `${fileName}.md`, 'text/markdown;charset=utf-8;');
}

export async function exportToPDF(elementId: string, fileName: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#030712' // navy-black
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("PDF Export failed:", error);
  }
}

export function exportToCSV(data: any[], fileName: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\n');
  downloadFile(csvContent, `${fileName}.csv`, 'text/csv;charset=utf-8;');
}
