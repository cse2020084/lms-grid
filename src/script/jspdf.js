import jsPDF from 'jspdf';
import 'jspdf-autotable';


export function generatePDF(rowdata) {
    
    const doc = new jsPDF();

     // Add a title
  doc.text('Grid Data Export', 10, 10);

  // Add a table
  (doc).autoTable({
    head: [['Name', 'Code', 'UserName']], // Example headers
    body:rowdata, // Dynamic row data passed from the component
  });


    doc.save('Country-list.pdf');


}
window.generatePDF = generatePDF;