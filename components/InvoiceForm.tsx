import React, { useState } from 'react';
import { InvoiceData, LineItem, DesignStyle, Currency } from '../types';

interface InvoiceFormProps {
  data: InvoiceData;
  onDataChange: (data: InvoiceData) => void;
  onGenerate: (style: DesignStyle) => void;
  onReset: () => void;
  isLoading: boolean;
}

const currencySymbols = {
  [Currency.USD]: '$',
  [Currency.EUR]: '€',
};

const InvoiceForm: React.FC<InvoiceFormProps> = ({ data, onDataChange, onGenerate, onReset, isLoading }) => {
  const [designStyle, setDesignStyle] = useState<DesignStyle>(DesignStyle.Modern);

  const currencySymbol = currencySymbols[data.currency];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    onDataChange({ ...data, [name]: type === 'number' ? parseFloat(value) || 0 : value });
  };

  const handleLineItemChange = (id: string, field: keyof Omit<LineItem, 'id'>, value: string | number) => {
    onDataChange({
      ...data,
      lineItems: data.lineItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const addLineItem = () => {
    onDataChange({
      ...data,
      lineItems: [
        ...data.lineItems,
        { id: Date.now().toString(), description: '', quantity: 1, price: 0 },
      ],
    });
  };

  const removeLineItem = (id: string) => {
    onDataChange({
      ...data,
      lineItems: data.lineItems.filter(item => item.id !== id),
    });
  };

  const subtotal = data.lineItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const taxAmount = subtotal * (data.taxRate / 100);
  const total = subtotal + taxAmount - data.discount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(designStyle);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Invoice Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">From</h3>
          <input type="text" name="fromName" value={data.fromName} onChange={handleInputChange} placeholder="Your Name / Company" className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" required />
          <textarea name="fromAddress" value={data.fromAddress} onChange={handleInputChange} placeholder="Your Address" className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" rows={3} required />
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">To</h3>
          <input type="text" name="toName" value={data.toName} onChange={handleInputChange} placeholder="Client's Name / Company" className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" required />
          <textarea name="toAddress" value={data.toAddress} onChange={handleInputChange} placeholder="Client's Address" className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" rows={3} required />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t pt-6">
        <div className="col-span-2 md:col-span-1">
          <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-1">Invoice #</label>
          <input type="text" id="invoiceNumber" name="invoiceNumber" value={data.invoiceNumber} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" id="date" name="date" value={data.date} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input type="date" id="dueDate" name="dueDate" value={data.dueDate} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select id="currency" name="currency" value={data.currency} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-white appearance-none">
            <option value={Currency.USD}>USD ($)</option>
            <option value={Currency.EUR}>EUR (€)</option>
          </select>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Items</h3>
        <div className="space-y-3">
          {data.lineItems.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
              <input type="text" value={item.description} onChange={e => handleLineItemChange(item.id, 'description', e.target.value)} placeholder="Item description" className="col-span-6 p-2 border rounded-md focus:ring-2 focus:ring-blue-500" required />
              <input type="number" value={item.quantity} onChange={e => handleLineItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)} placeholder="Qty" className="col-span-2 p-2 border rounded-md focus:ring-2 focus:ring-blue-500" required min="0"/>
              <input type="number" value={item.price} onChange={e => handleLineItemChange(item.id, 'price', parseFloat(e.target.value) || 0)} placeholder="Price" className="col-span-2 p-2 border rounded-md focus:ring-2 focus:ring-blue-500" required min="0"/>
              <div className="col-span-1 text-center text-gray-600">{currencySymbol}{(item.quantity * item.price).toFixed(2)}</div>
              <button type="button" onClick={() => removeLineItem(item.id)} className="col-span-1 text-red-500 hover:text-red-700 font-bold">X</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addLineItem} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">+ Add Item</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Notes</h3>
          <textarea name="notes" value={data.notes} onChange={handleInputChange} placeholder="e.g. Thank you for your business" className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" rows={4} />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-gray-600">Subtotal</label>
            <span className="font-semibold text-gray-800">{currencySymbol}{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <label htmlFor="taxRate" className="text-gray-600">Tax Rate (%)</label>
            <input type="number" id="taxRate" name="taxRate" value={data.taxRate} onChange={handleInputChange} className="w-24 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-right" />
          </div>
          <div className="flex justify-between items-center">
            <label htmlFor="discount" className="text-gray-600">Discount ({currencySymbol})</label>
            <input type="number" id="discount" name="discount" value={data.discount} onChange={handleInputChange} className="w-24 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-right" />
          </div>
          <div className="flex justify-between items-center border-t pt-3 mt-3">
            <label className="text-xl font-bold text-gray-800">Total</label>
            <span className="text-xl font-bold text-gray-800">{currencySymbol}{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Design Style</h3>
        <select value={designStyle} onChange={e => setDesignStyle(e.target.value as DesignStyle)} className="w-full p-3 bg-white border rounded-md focus:ring-2 focus:ring-blue-500">
          {Object.values(DesignStyle).map(style => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>
        <div className="flex flex-col sm:flex-row-reverse gap-3">
          <button type="submit" disabled={isLoading} className="w-full p-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 flex items-center justify-center">
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isLoading ? 'Generating...' : 'Generate Invoice'}
          </button>
          <button type="button" onClick={onReset} className="w-full sm:w-auto sm:px-6 py-4 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors">
              Reset Form
          </button>
        </div>
      </div>
    </form>
  );
};

export default InvoiceForm;
