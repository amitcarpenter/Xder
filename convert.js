const fs = require('fs');
const PDFDocument = require('pdfkit');

// HTML content to be converted to PDF
const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>HTML to PDF Example</title>
</head>
<body>
  <h1>Hello, World!</h1>
</body>
</html>`;

// Create a new PDF document
const doc = new PDFDocument();

// Pipe the PDF document to a writable stream (file)
const outputStream = fs.createWriteStream('output.pdf');
doc.pipe(outputStream);

// Convert HTML to PDF
// For simplicity, we are just rendering the text without HTML formatting
// You can customize this to handle HTML tags and styles as needed
//doc.fontSize(18).text('HTML to PDF Example', { align: 'left' });
// Add the HTML content to the PDF

doc.fontSize(12).text(htmlContent, { align: 'left' });

// Finalize the PDF document
doc.end();

// Log a message once the PDF is generated
outputStream.on('finish', () => {
  console.log('PDF successfully generated: output.pdf');
});