import jsPDF from 'jspdf';
import 'jspdf-autotable';


export function generatePDF(rowdata, headers,fileName) {
  const doc = new jsPDF();

  // Add a title
  doc.text('Grid Data Export', 10, 10);

  // Add a table with explicitly passed headers
  (doc).autoTable({
    head: [headers],
    body: rowdata,
  });

  doc.save(`${fileName}-list.pdf`);
}
window.generatePDF = generatePDF;