import { GoogleGenAI, Type } from "@google/genai";
import { InvoiceData, DesignStyle, Currency } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    html: {
      type: Type.STRING,
      description: 'The full HTML content of the invoice, styled with Tailwind CSS. This should be a self-contained block of HTML starting with a div, without html, head, or body tags.'
    }
  },
  required: ['html']
};

const currencySymbols = {
  [Currency.USD]: '$',
  [Currency.EUR]: '€',
};

export const generateInvoiceHtml = async (
  invoiceData: InvoiceData,
  designStyle: DesignStyle
): Promise<string> => {
  const currencySymbol = currencySymbols[invoiceData.currency];

  const prompt = `
    You are an expert web designer specializing in creating beautiful invoices with HTML and Tailwind CSS.
    Your task is to generate a single HTML content block for an invoice based on the JSON data provided below.

    **Instructions:**
    1. Use Tailwind CSS for ALL styling. Do NOT use any inline styles (\`style="..."\`) or \`<style>\` blocks.
    2. The output MUST be a valid JSON object with a single key "html". The value should be a string containing the HTML.
    3. The HTML should be self-contained and ready to be rendered in a browser. Do NOT include \`<html>\`, \`<head>\`, or \`<body>\` tags. The root element should be a single \`<div>\`.
    4. The design style should be: **${designStyle}**.
        - 'Modern and Clean': Use clean lines, sans-serif fonts, ample whitespace, and a minimalist color palette (e.g., shades of gray, a single accent color).
        - 'Classic and Professional': Use serif fonts for headings, a more traditional layout, and a formal color scheme (e.g., navy, burgundy, dark gray, off-white).
        - 'Creative and Colorful': Use bold colors, unique font pairings, and a more unconventional but still readable layout. Don't be afraid to use gradients or background colors.
    5. Ensure all calculations (item totals, subtotal, tax, discount, grand total) are correct and clearly displayed.
    6. **IMPORTANT**: Use the correct currency symbol for all monetary values. The currency for this invoice is ${invoiceData.currency}, so use the "${currencySymbol}" symbol.
    7. The invoice should be responsive and look good on both desktop (A4-like view) and mobile screens. Use Tailwind's responsive prefixes (e.g., \`sm:\`, \`md:\`).
    8. Pay close attention to typography, spacing, and alignment to create a professional and easy-to-read document.

    **Invoice Data:**
    \`\`\`json
    ${JSON.stringify(invoiceData, null, 2)}
    \`\`\`

    Generate the HTML for the invoice now.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    
    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (result && typeof result.html === 'string') {
      return result.html;
    } else {
      throw new Error("Invalid response format from API. Expected a JSON object with an 'html' key.");
    }
  } catch (error) {
    console.error("Error generating invoice:", error);
    throw new Error("Failed to generate invoice. Please check the console for more details.");
  }
};
