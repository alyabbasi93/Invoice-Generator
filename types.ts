export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceData {
  fromName: string;
  fromAddress: string;
  toName: string;
  toAddress: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  lineItems: LineItem[];
  notes: string;
  taxRate: number;
  discount: number;
  currency: Currency;
}

export enum DesignStyle {
  Modern = 'Modern and Clean',
  Classic = 'Classic and Professional',
  Creative = 'Creative and Colorful',
}
