import React, { useState } from 'react';

declare global {
  interface Window {
    html2canvas: any;
    jspdf: any;
  }
}

interface InvoicePreviewProps {
  htmlContent: string;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ htmlContent }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!htmlContent || !window.html2canvas || !window.jspdf) {
      console.error("PDF generation prerequisites not met.");
      alert("PDF generation libraries are not loaded. Please try again later.");
      return;
    }
    
    const invoiceContentElement = document.querySelector<HTMLElement>('#invoice-preview-container > div');
    if (!invoiceContentElement) {
      console.error("Invoice content element not found for PDF generation.");
      return;
    }

    setIsDownloading(true);

    try {
      const canvas = await window.html2canvas(invoiceContentElement, {
        scale: 2, // Higher scale for better quality
      });

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new window.jspdf.jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / pdfWidth;
      const imgHeight = canvasHeight / ratio;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = position - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save('invoice.pdf');
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Sorry, there was an error generating the PDF. Please check the console for details.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg relative">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-gray-800">Preview</h2>
        <div className="flex items-center gap-3 no-print">
          <button 
            onClick={handleDownloadPdf} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center font-semibold"
            disabled={!htmlContent || isDownloading}
          >
            {isDownloading ? (
               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
          <button 
            onClick={handlePrint} 
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 font-semibold"
            disabled={!htmlContent}
          >
            Print
          </button>
        </div>
      </div>

      <div 
        id="invoice-preview-container"
        className="w-full aspect-[8.5/11] bg-white border border-gray-200 shadow-md overflow-y-auto"
      >
        {htmlContent ? (
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Invoice Generated</h3>
              <p className="mt-1 text-sm text-gray-500">Fill out the form and click "Generate Invoice" to see your preview here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicePreview;
