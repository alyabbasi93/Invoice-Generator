import React, { useState, useCallback, useEffect } from 'react';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import { InvoiceData, DesignStyle, Currency } from './types';
import { generateInvoiceHtml } from './services/geminiService';

const getInitialDate = (addDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + addDays);
  return d.toISOString().split('T')[0];
}

const defaultInvoiceData: InvoiceData = {
  fromName: 'Your Company LLC',
  fromAddress: '123 Main Street\nCity, State 12345',
  toName: 'Client Inc.',
  toAddress: '456 Client Avenue\nTown, State 67890',
  invoiceNumber: 'INV-001',
  date: getInitialDate(),
  dueDate: getInitialDate(14),
  lineItems: [
    { id: '1', description: 'Website Design', quantity: 1, price: 2500 },
    { id: '2', description: 'Hosting (1 year)', quantity: 1, price: 300 },
  ],
  notes: 'Thank you for your business. Payment is due within 14 days.',
  taxRate: 8.5,
  discount: 100,
  currency: Currency.USD,
};

const LOCAL_STORAGE_KEY = 'ai-invoice-generator-data';

const getInitialData = (): InvoiceData => {
  try {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error("Failed to load or parse saved data, using default.", error);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
  return defaultInvoiceData;
};


function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(getInitialData);
  const [invoiceHtml, setInvoiceHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(invoiceData));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [invoiceData]);

  const handleGenerateInvoice = useCallback(async (style: DesignStyle) => {
    setIsLoading(true);
    setError(null);
    setInvoiceHtml('');

    try {
      const html = await generateInvoiceHtml(invoiceData, style);
      setInvoiceHtml(html);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [invoiceData]);
  
  const handleResetData = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the form? All current data will be lost.')) {
      setInvoiceData(defaultInvoiceData);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-md p-4 no-print">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-gray-800">AI Invoice Generator</h1>
          <p className="text-gray-600">Create professional invoices with the power of Gemini.</p>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="lg:sticky top-8 no-print">
            <InvoiceForm
              data={invoiceData}
              onDataChange={setInvoiceData}
              onGenerate={handleGenerateInvoice}
              onReset={handleResetData}
              isLoading={isLoading}
            />
          </div>
          <div className="min-w-0">
             <InvoicePreview htmlContent={invoiceHtml} />
          </div>
        </div>
      </main>
       <footer className="text-center text-gray-500 py-4 mt-8 no-print">
        <p>Built by a world-class React engineer.</p>
      </footer>
    </div>
  );
}

export default App;
