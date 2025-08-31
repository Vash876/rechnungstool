import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

export interface PDFDocumentData {
  type: 'invoice' | 'quote';
  number: string;
  date: string;
  dueDate?: string;
  customer: {
    name: string;
    email?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    phone?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  notes?: string;
  companySettings: {
    companyName: string;
    address?: string;
    city?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
    website?: string;
    taxNumber?: string;
    vatNumber?: string;
    logoUrl?: string;
  };
}

class PDFService {
  private generateHTML(data: PDFDocumentData): string {
    // Handle logo path - can be relative or absolute
    let logoPath = null;
    if (data.companySettings.logoUrl) {
      if (data.companySettings.logoUrl.startsWith('uploads/')) {
        // Relative path from uploads folder
        logoPath = path.resolve(process.cwd(), data.companySettings.logoUrl);
      } else {
        // Absolute path or direct file path
        logoPath = path.resolve(data.companySettings.logoUrl);
      }
    }
    
    const logoBase64 = logoPath && fs.existsSync(logoPath) 
      ? `data:image/png;base64,${fs.readFileSync(logoPath, 'base64')}`
      : null;

    const documentTitle = data.type === 'invoice' ? 'Rechnung' : 'Angebot';

    return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${documentTitle}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        ${this.getStatusStyles(data.status)}
        
        /* Custom print styles */
        @media print {
            body { 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
        
        /* Page break handling */
        .page-break {
            page-break-before: always;
        }
        
        .avoid-break {
            page-break-inside: avoid;
        }
        
        /* Table headers repeat on each page */
        thead {
            display: table-header-group;
        }
        
        /* Übertrag für Seitenumbrüche */
        .page-carry-over {
            page-break-after: always;
        }
        
        .page-carry-forward {
            page-break-before: avoid;
        }
        
        /* Seitenumbruch nach bestimmter Anzahl von Zeilen */
        @media print {
            .invoice-table tr:nth-child(n+25) {
                page-break-inside: avoid;
            }
        }
        
        /* Override Tailwind defaults for smaller text and spacing */
        body {
            font-size: 12px !important;
            line-height: 1.4 !important;
            margin: 0 !important;
            padding: 0.2rem !important;
        }
        
        .w-full {
            width: 100% !important;
        }
        
        .mx-auto {
            margin-left: auto !important;
            margin-right: auto !important;
        }
        
        .p-8 {
            padding: 1rem !important;
        }
        
        .p-6 {
            padding: 0.75rem !important;
        }
        
        .mb-8 {
            margin-bottom: 1rem !important;
        }
        
        .mb-6 {
            margin-bottom: 0.75rem !important;
        }
        
        .text-2xl {
            font-size: 1.25rem !important;
        }
        
        .text-xl {
            font-size: 1.1rem !important;
        }
        
        .text-lg {
            font-size: 1rem !important;
        }
        
        .text-sm {
            font-size: 0.8rem !important;
        }
        
        .gap-8 {
            gap: 1rem !important;
        }
        
        .space-y-4 > * + * {
            margin-top: 0.5rem !important;
        }
        
        h1, h2, h3, h4, h5, h6 {
            font-size: inherit !important;
            line-height: 1.3 !important;
        }
        
        table {
            font-size: 11px !important;
        }
        
        th, td {
            padding: 0.4rem 0.5rem !important;
        }
        
        /* Grid Layout für 2 Spalten */
        .grid-cols-2 {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 2rem !important;
        }
        
        .grid {
            display: grid !important;
        }
    </style>
</head>
<body class="bg-white text-sm">
    <div class="w-full mx-auto p-2">
        <!-- Invoice Content - ohne Schatten für PDF -->
        <div class="bg-white">
            <div class="px-2 py-2">
                <!-- Company Header - genau wie InvoiceDetailView -->
                <div class="flex justify-between items-start mb-3 pb-2 border-b border-gray-200">
                    <div class="flex items-start space-x-4">
                        ${logoBase64 ? `<img src="${logoBase64}" alt="${data.companySettings.companyName}" class="h-12 w-auto object-contain">` : ''}
                        <div>
                            <h2 class="text-lg font-bold text-gray-900">${data.companySettings.companyName}</h2>
                            ${data.companySettings.address ? `<div class="text-xs text-gray-600 mt-1">${data.companySettings.address}</div>` : ''}
                            <div class="text-xs text-gray-600">
                                ${data.companySettings.email ? `<span>${data.companySettings.email}</span>` : ''}
                                ${data.companySettings.phone && data.companySettings.email ? ' • ' : ''}
                                ${data.companySettings.phone ? `<span>${data.companySettings.phone}</span>` : ''}
                            </div>
                            ${data.companySettings.website ? `<div class="text-xs text-gray-600">${data.companySettings.website}</div>` : ''}
                        </div>
                    </div>
                    
                    <div class="text-right text-sm text-gray-600">
                        ${data.companySettings.taxNumber ? `<div>Steuernr.: ${data.companySettings.taxNumber}</div>` : ''}
                        ${data.companySettings.vatNumber ? `<div>USt-IdNr.: ${data.companySettings.vatNumber}</div>` : ''}
                    </div>
                </div>

                <!-- Header Info - genau wie InvoiceDetailView -->
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h1 class="text-xl font-bold text-gray-900">
                            ${documentTitle} #${data.number.toString().padStart(5, '0')}
                        </h1>
                        <div class="mt-1 flex items-center">
                            <span class="status-badge text-xs">
                                ${this.getStatusText(data.status)}
                            </span>
                        </div>
                    </div>
                    
                    <div class="text-right">
                        <div class="text-lg font-semibold text-gray-900">
                            ${this.formatCurrency(data.total)}
                        </div>
                        ${data.dueDate ? `<div class="text-xs text-gray-500">Fällig: ${this.formatDate(data.dueDate)}</div>` : '<div class="text-xs text-gray-500">Fällig: Nicht festgelegt</div>'}
                    </div>
                </div>

                <!-- Customer & Invoice Info - 2 Spalten nebeneinander -->
                <div class="grid grid-cols-2 mb-6">
                    <!-- Customer Info -->
                    <div>
                        <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Rechnungsempfänger
                        </h3>
                        <div class="text-xs text-gray-900">
                            <div class="font-medium">${data.customer.name}</div>
                            ${data.customer.address ? `<div class="mt-1">${data.customer.address}</div>` : ''}
                            ${data.customer.postalCode || data.customer.city ? `<div>${data.customer.postalCode || ''} ${data.customer.city || ''}</div>` : ''}
                            ${data.customer.email ? `<div class="mt-2">${data.customer.email}</div>` : ''}
                            ${data.customer.phone ? `<div>${data.customer.phone}</div>` : ''}
                        </div>
                    </div>

                    <!-- Invoice Info -->
                    <div>
                        <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Rechnungsdetails
                        </h3>
                        <div class="text-xs text-gray-900">
                            <div class="flex justify-between">
                                <span>Rechnungsnummer:</span>
                                <span class="font-medium">#${data.number.toString().padStart(5, '0')}</span>
                            </div>
                            <div class="flex justify-between mt-1">
                                <span>Rechnungsdatum:</span>
                                <span>${this.formatDate(data.date)}</span>
                            </div>
                            <div class="flex justify-between mt-1">
                                <span>Fälligkeitsdatum:</span>
                                <span>${data.dueDate ? this.formatDate(data.dueDate) : 'Nicht festgelegt'}</span>
                            </div>
                            <div class="flex justify-between mt-1">
                                <span>Steuersatz:</span>
                                <span>19%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Items Table - mit automatischen Seitenumbrüchen -->
                <div class="mb-6">
                    <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Rechnungsposten
                    </h3>
                    <div class="border border-gray-300 rounded-lg overflow-hidden">
                        <table class="w-full divide-y divide-gray-300 invoice-table">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Beschreibung
                                    </th>
                                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Menge
                                    </th>
                                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Einzelpreis
                                    </th>
                                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Gesamt
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${this.generateItemsWithPageBreaks(data.items)}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Totals - breiter für PDF -->
                <div class="flex justify-end">
                    <div class="w-64">
                        <div class="border-t border-gray-200 pt-3 space-y-1">
                            <div class="flex justify-between text-xs">
                                <span class="text-gray-500">Nettobetrag:</span>
                                <span class="text-gray-900">${this.formatCurrency(data.subtotal)}</span>
                            </div>
                            <div class="flex justify-between text-xs">
                                <span class="text-gray-500">MwSt. (19%):</span>
                                <span class="text-gray-900">${this.formatCurrency(data.tax)}</span>
                            </div>
                            <div class="flex justify-between text-sm font-bold border-t border-gray-200 pt-2">
                                <span>Gesamtbetrag:</span>
                                <span>${this.formatCurrency(data.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Notes - genau wie InvoiceDetailView -->
                ${data.notes ? `
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Notizen
                    </h3>
                    <p class="text-xs text-gray-900">${data.notes}</p>
                </div>
                ` : ''}
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  private getStatusStyles(status: string): string {
    const baseClasses = 'inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide';
    
    switch (status.toLowerCase()) {
      case 'bezahlt':
      case 'paid':
        return `.status-badge { @apply ${baseClasses} bg-green-100 text-green-800; }`;
      case 'offen':
      case 'open':
        return `.status-badge { @apply ${baseClasses} bg-yellow-100 text-yellow-800; }`;
      case 'überfällig':
      case 'overdue':
        return `.status-badge { @apply ${baseClasses} bg-red-100 text-red-800; }`;
      case 'angenommen':
      case 'accepted':
        return `.status-badge { @apply ${baseClasses} bg-green-100 text-green-800; }`;
      case 'abgelehnt':
      case 'rejected':
        return `.status-badge { @apply ${baseClasses} bg-red-100 text-red-800; }`;
      case 'entwurf':
      case 'draft':
        return `.status-badge { @apply ${baseClasses} bg-gray-100 text-gray-800; }`;
      default:
        return `.status-badge { @apply ${baseClasses} bg-gray-100 text-gray-800; }`;
    }
  }

  private getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'Entwurf';
      case 'sent':
        return 'Versendet';
      case 'paid':
        return 'Bezahlt';
      case 'overdue':
        return 'Überfällig';
      case 'offen':
        return 'Offen';
      case 'bezahlt':
        return 'Bezahlt';
      case 'überfällig':
        return 'Überfällig';
      default:
        return status;
    }
  }

  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('de-DE');
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  private formatNumber(number: number): string {
    return new Intl.NumberFormat('de-DE').format(number);
  }

  private generateItemsWithPageBreaks(items: any[], itemsPerPage: number = 15): string {
    if (items.length <= itemsPerPage) {
      // Alle Items passen auf eine Seite
      return items.map(item => `
        <tr>
          <td class="px-3 py-2 text-xs text-gray-900">
            ${item.description}
          </td>
          <td class="px-3 py-2 text-xs text-gray-900 text-right">
            ${this.formatNumber(item.quantity)}
          </td>
          <td class="px-3 py-2 text-xs text-gray-900 text-right">
            ${this.formatCurrency(item.unitPrice)}
          </td>
          <td class="px-3 py-2 text-xs text-gray-900 text-right font-medium">
            ${this.formatCurrency(item.total)}
          </td>
        </tr>
      `).join('');
    }

    // Mehrseitige Tabelle mit Überträgen
    let html = '';
    let pageNumber = 1;
    let itemIndex = 0;

    while (itemIndex < items.length) {
      // Items für diese Seite
      const pageItems = items.slice(itemIndex, itemIndex + itemsPerPage);
      
      // Items der aktuellen Seite hinzufügen
      pageItems.forEach(item => {
        html += `
          <tr>
            <td class="px-3 py-2 text-xs text-gray-900">
              ${item.description}
            </td>
            <td class="px-3 py-2 text-xs text-gray-900 text-right">
              ${this.formatNumber(item.quantity)}
            </td>
            <td class="px-3 py-2 text-xs text-gray-900 text-right">
              ${this.formatCurrency(item.unitPrice)}
            </td>
            <td class="px-3 py-2 text-xs text-gray-900 text-right font-medium">
              ${this.formatCurrency(item.total)}
            </td>
          </tr>
        `;
      });

      itemIndex += pageItems.length;

      // Wenn noch weitere Items kommen, Übertrag auf DIESER Seite hinzufügen
      if (itemIndex < items.length) {
        const carryOverTotal = items.slice(0, itemIndex).reduce((sum, item) => sum + item.total, 0);
        
        html += `
          <tr class="bg-gray-100 font-semibold border-t-2 border-gray-300">
            <td class="px-3 py-2 text-xs text-gray-900" colspan="3">
              Übertrag zu Seite ${pageNumber + 1}
            </td>
            <td class="px-3 py-2 text-xs text-gray-900 text-right">
              ${this.formatCurrency(carryOverTotal)}
            </td>
          </tr>
        </tbody></table></div></div>
        <div class="page-break"></div>
        <div class="mb-4">
          <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Rechnungsposten (Fortsetzung)
          </h3>
          <div class="border border-gray-300 rounded-lg overflow-hidden">
            <table class="w-full divide-y divide-gray-300 invoice-table">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Beschreibung
                  </th>
                  <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Menge
                  </th>
                  <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Einzelpreis
                  </th>
                  <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Gesamt
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr class="bg-gray-100 font-semibold border-b-2 border-gray-300">
                  <td class="px-3 py-2 text-xs text-gray-900" colspan="3">
                    Übertrag von Seite ${pageNumber}
                  </td>
                  <td class="px-3 py-2 text-xs text-gray-900 text-right">
                    ${this.formatCurrency(carryOverTotal)}
                  </td>
                </tr>
        `;
        
        pageNumber++;
      }
    }

    return html;
  }

  async generatePDF(data: PDFDocumentData): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      const html = this.generateHTML(data);
      
      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
}

export default new PDFService();
