import { createRequire } from 'node:module';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import { isR2Configured } from '../config/env.js';
import type { CompanyDocument } from '../models/Company.js';
import type { InvoiceDocument } from '../models/Invoice.js';
import { vatBreakdown } from './invoice.service.js';
import { getFileBuffer } from './storage.service.js';

// DejaVu covers č, ć, đ, š, ž and Cyrillic – the built-in PDF fonts don't.
const fontDir = path.join(path.dirname(createRequire(import.meta.url).resolve('dejavu-fonts-ttf/package.json')), 'ttf');
const FONT_REGULAR = path.join(fontDir, 'DejaVuSans.ttf');
const FONT_BOLD = path.join(fontDir, 'DejaVuSans-Bold.ttf');

const MARGIN = 40;
const COLOR_TEXT = '#1f2937';
const COLOR_MUTED = '#6b7280';
const COLOR_BORDER = '#d1d5db';
const COLOR_HEADER_BG = '#f3f4f6';

const moneyFormat = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const qtyFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 3 });

const money = (value: number) => moneyFormat.format(value);
const formatDate = (value: Date | null | undefined) => {
  if (!value) return '—';
  const d = new Date(value);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}.`;
};

interface Column {
  key: string;
  label: string;
  width: number;
  align: 'left' | 'right' | 'center';
}

const COLUMNS: Column[] = [
  { key: 'index', label: 'R.br.', width: 28, align: 'center' },
  { key: 'name', label: 'Naziv', width: 137, align: 'left' },
  { key: 'unit', label: 'Jed.', width: 30, align: 'center' },
  { key: 'quantity', label: 'Kol.', width: 38, align: 'right' },
  { key: 'unitPrice', label: 'Cijena po jed.', width: 60, align: 'right' },
  { key: 'netAmount', label: 'Iznos bez PDV', width: 62, align: 'right' },
  { key: 'vatRate', label: 'PDV %', width: 34, align: 'right' },
  { key: 'vatAmount', label: 'Iznos PDV', width: 56, align: 'right' },
  { key: 'totalAmount', label: 'Ukupno', width: 70, align: 'right' },
];

type Party = InvoiceDocument['seller'];

const partyLines = (party: Party): string[] =>
  [
    party.address,
    [party.postalCode, party.city].filter(Boolean).join(' '),
    party.country,
    party.taxId && `PIB: ${party.taxId}`,
    party.registrationNumber && `Matični broj: ${party.registrationNumber}`,
    party.vatNumber && `PDV broj: ${party.vatNumber}`,
    party.phone && `Tel: ${party.phone}`,
    party.email && `Email: ${party.email}`,
  ].filter((line): line is string => Boolean(line));

const loadImages = async (company: CompanyDocument, invoice: InvoiceDocument) => {
  if (!isR2Configured) return { logo: null, stamps: [] as Buffer[] };

  const selected = new Set(invoice.stampIds.map((id) => id.toString()));
  const stamps = company.stamps.filter((stamp) => selected.has(stamp._id.toString()));

  const [logo, ...stampBuffers] = await Promise.all([
    company.logo ? getFileBuffer(company.logo.key) : Promise.resolve(null),
    ...stamps.map((stamp) => getFileBuffer(stamp.key)),
  ]);

  return { logo, stamps: stampBuffers.filter((buffer): buffer is Buffer => buffer !== null) };
};

export const generateInvoicePdf = async (invoice: InvoiceDocument, company: CompanyDocument): Promise<Buffer> => {
  const { logo, stamps } = await loadImages(company, invoice);

  const doc = new PDFDocument({
    size: 'A4',
    margin: MARGIN,
    bufferPages: true,
    info: { Title: `Faktura ${invoice.number}`, Author: invoice.seller.name, Creator: 'Invoices' },
  });
  doc.registerFont('Regular', FONT_REGULAR);
  doc.registerFont('Bold', FONT_BOLD);

  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - MARGIN * 2;
  const bottomLimit = () => doc.page.height - MARGIN - 30; // leave room for the footer
  const currency = invoice.currency;

  // ── Header: logo + title ────────────────────────────────────────────────
  let headerBottom = MARGIN;
  if (logo) {
    try {
      doc.image(logo, MARGIN, MARGIN, { fit: [160, 70] });
      headerBottom = MARGIN + 70;
    } catch {
      // Corrupt image – render the invoice without it.
    }
  }

  doc.font('Bold').fontSize(22).fillColor(COLOR_TEXT).text('FAKTURA', MARGIN, MARGIN, { width: contentWidth, align: 'right' });
  // "Broj: F-1/2026", right-aligned, with label and value in different weights.
  const numberY = doc.y + 2;
  const label = 'Broj: ';
  doc.font('Bold').fontSize(11);
  const numberWidth = doc.widthOfString(invoice.number);
  doc.font('Regular');
  const labelWidth = doc.widthOfString(label);
  const rightEdge = MARGIN + contentWidth;
  doc.fillColor(COLOR_MUTED).text(label, rightEdge - numberWidth - labelWidth, numberY, { lineBreak: false });
  doc.font('Bold').fillColor(COLOR_TEXT).text(invoice.number, rightEdge - numberWidth, numberY, { lineBreak: false });
  headerBottom = Math.max(headerBottom, numberY + 16);

  // ── Seller / buyer ──────────────────────────────────────────────────────
  const boxTop = headerBottom + 20;
  const boxWidth = (contentWidth - 20) / 2;

  const drawParty = (title: string, party: Party, x: number) => {
    doc.font('Bold').fontSize(8).fillColor(COLOR_MUTED).text(title.toUpperCase(), x, boxTop, { width: boxWidth, characterSpacing: 0.5 });
    doc.moveDown(0.3);
    doc.font('Bold').fontSize(11).fillColor(COLOR_TEXT).text(party.name, { width: boxWidth });
    doc.font('Regular').fontSize(9).fillColor(COLOR_TEXT);
    for (const line of partyLines(party)) {
      doc.text(line, { width: boxWidth });
    }
    return doc.y;
  };

  const sellerBottom = drawParty('Izdavalac', invoice.seller, MARGIN);
  const buyerBottom = drawParty('Kupac', invoice.buyer, MARGIN + boxWidth + 20);

  // ── Dates ───────────────────────────────────────────────────────────────
  const detailsTop = Math.max(sellerBottom, buyerBottom) + 18;
  const details: [string, string][] = [
    ['Datum izdavanja', formatDate(invoice.issueDate)],
    ['Datum prometa', formatDate(invoice.serviceDate ?? invoice.issueDate)],
    ['Rok plaćanja', formatDate(invoice.dueDate)],
    ['Mjesto izdavanja', invoice.placeOfIssue || '—'],
    ['Valuta', currency],
  ];
  const detailWidth = contentWidth / details.length;
  doc.rect(MARGIN, detailsTop, contentWidth, 34).fillAndStroke(COLOR_HEADER_BG, COLOR_BORDER);
  details.forEach(([label, value], i) => {
    const x = MARGIN + i * detailWidth + 8;
    doc.font('Regular').fontSize(7.5).fillColor(COLOR_MUTED).text(label, x, detailsTop + 6, { width: detailWidth - 16 });
    doc.font('Bold').fontSize(9).fillColor(COLOR_TEXT).text(value, x, detailsTop + 18, { width: detailWidth - 16 });
  });

  // ── Items table ─────────────────────────────────────────────────────────
  const cellPadding = 4;
  let y = detailsTop + 34 + 18;

  const drawTableHeader = () => {
    doc.font('Bold').fontSize(7.5);
    const height = Math.max(...COLUMNS.map((c) => doc.heightOfString(c.label, { width: c.width - cellPadding * 2 }))) + cellPadding * 2;
    doc.rect(MARGIN, y, contentWidth, height).fill(COLOR_HEADER_BG);
    let x = MARGIN;
    doc.fillColor(COLOR_TEXT);
    for (const col of COLUMNS) {
      doc.text(col.label, x + cellPadding, y + cellPadding, { width: col.width - cellPadding * 2, align: col.align });
      x += col.width;
    }
    y += height;
    doc.moveTo(MARGIN, y).lineTo(MARGIN + contentWidth, y).strokeColor(COLOR_BORDER).lineWidth(0.8).stroke();
  };

  drawTableHeader();

  invoice.items.forEach((item, index) => {
    const values: Record<string, string> = {
      index: `${index + 1}.`,
      name: item.name,
      unit: item.unit,
      quantity: qtyFormat.format(item.quantity),
      unitPrice: money(item.unitPrice),
      netAmount: money(item.netAmount),
      vatRate: `${qtyFormat.format(item.vatRate)}%`,
      vatAmount: money(item.vatAmount),
      totalAmount: money(item.totalAmount),
    };

    const nameWidth = COLUMNS[1]!.width - cellPadding * 2;
    doc.font('Regular').fontSize(8.5);
    let rowHeight = doc.heightOfString(item.name, { width: nameWidth });
    if (item.description) {
      doc.fontSize(7);
      rowHeight += doc.heightOfString(item.description, { width: nameWidth }) + 2;
    }
    rowHeight += cellPadding * 2;

    if (y + rowHeight > bottomLimit()) {
      doc.addPage();
      y = MARGIN;
      drawTableHeader();
    }

    let x = MARGIN;
    for (const col of COLUMNS) {
      const opts = { width: col.width - cellPadding * 2, align: col.align };
      doc.font(col.key === 'totalAmount' ? 'Bold' : 'Regular').fontSize(8.5).fillColor(COLOR_TEXT);
      doc.text(values[col.key] ?? '', x + cellPadding, y + cellPadding, opts);
      if (col.key === 'name' && item.description) {
        doc.font('Regular').fontSize(7).fillColor(COLOR_MUTED).text(item.description, opts);
      }
      x += col.width;
    }

    y += rowHeight;
    doc.moveTo(MARGIN, y).lineTo(MARGIN + contentWidth, y).strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();
  });

  // ── Totals ──────────────────────────────────────────────────────────────
  const breakdown = vatBreakdown(invoice.items);
  const totalsRows: [string, string, boolean][] = [
    ['Ukupno bez PDV-a', `${money(invoice.subtotal)} ${currency}`, false],
    ...breakdown.map(
      (g): [string, string, boolean] => [`PDV ${qtyFormat.format(g.rate)}% (osnovica ${money(g.base)})`, `${money(g.vat)} ${currency}`, false],
    ),
    ['Ukupan PDV', `${money(invoice.vatTotal)} ${currency}`, false],
  ];
  const totalsWidth = 260;
  const totalsX = MARGIN + contentWidth - totalsWidth;
  const totalsHeight = totalsRows.length * 16 + 30;

  y += 14;
  if (y + totalsHeight > bottomLimit()) {
    doc.addPage();
    y = MARGIN;
  }

  for (const [label, value] of totalsRows) {
    doc.font('Regular').fontSize(8.5).fillColor(COLOR_MUTED).text(label, totalsX, y, { width: totalsWidth - 100 });
    doc.fillColor(COLOR_TEXT).text(value, totalsX + totalsWidth - 100, y, { width: 100, align: 'right' });
    y += 16;
  }
  doc.rect(totalsX, y, totalsWidth, 26).fill(COLOR_TEXT);
  doc.font('Bold').fontSize(10).fillColor('#ffffff').text('UKUPNO ZA UPLATU', totalsX + 8, y + 8, { width: totalsWidth - 120 });
  doc.text(`${money(invoice.total)} ${currency}`, totalsX + totalsWidth - 120, y + 8, { width: 112, align: 'right' });
  y += 26 + 20;

  // ── Payment info & notes ────────────────────────────────────────────────
  doc.fillColor(COLOR_TEXT);
  const paymentLines = [
    invoice.seller.bankAccount && `Žiro račun: ${invoice.seller.bankAccount}${invoice.seller.bankName ? ` (${invoice.seller.bankName})` : ''}`,
    `Poziv na broj: ${invoice.number}`,
  ].filter(Boolean) as string[];

  const writeBlock = (title: string, text: string) => {
    doc.font('Regular').fontSize(8.5);
    const height = doc.heightOfString(text, { width: contentWidth }) + 16;
    if (y + height > bottomLimit()) {
      doc.addPage();
      y = MARGIN;
    }
    doc.font('Bold').fontSize(8).fillColor(COLOR_MUTED).text(title.toUpperCase(), MARGIN, y, { characterSpacing: 0.5 });
    doc.font('Regular').fontSize(8.5).fillColor(COLOR_TEXT).text(text, MARGIN, doc.y + 2, { width: contentWidth });
    y = doc.y + 12;
  };

  writeBlock('Podaci za plaćanje', paymentLines.join('\n'));
  if (invoice.notes) {
    writeBlock('Napomena', invoice.notes);
  }

  // ── Stamps / signature at the bottom of the last page ──────────────────
  const stampAreaHeight = 95;
  if (y + stampAreaHeight + 20 > bottomLimit()) {
    doc.addPage();
  }
  const stampTop = bottomLimit() - stampAreaHeight;

  if (invoice.issuedBy) {
    doc.font('Regular').fontSize(9.5).fillColor(COLOR_TEXT);
    doc.text(invoice.issuedBy, MARGIN, stampTop + stampAreaHeight - 28, { width: 160, align: 'center', lineBreak: false, ellipsis: true });
  }
  doc.font('Regular').fontSize(8).fillColor(COLOR_MUTED);
  doc.text('Fakturu izdao', MARGIN, stampTop + stampAreaHeight - 10, { width: 160, align: 'center' });
  doc.moveTo(MARGIN, stampTop + stampAreaHeight - 14).lineTo(MARGIN + 160, stampTop + stampAreaHeight - 14).strokeColor(COLOR_BORDER).stroke();

  const stampWidth = 120;
  const stampGap = 12;
  let stampX = MARGIN + contentWidth - stampWidth;
  for (const stamp of stamps) {
    if (stampX < MARGIN + 180) break; // don't overlap the signature line
    try {
      doc.image(stamp, stampX, stampTop, { fit: [stampWidth, stampAreaHeight], align: 'center', valign: 'bottom' });
      stampX -= stampWidth + stampGap;
    } catch {
      // Skip images PDFKit can't decode.
    }
  }

  // ── Footer with page numbers ────────────────────────────────────────────
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    const footerY = doc.page.height - MARGIN - 10;
    doc.page.margins.bottom = 0;
    doc.font('Regular').fontSize(7.5).fillColor(COLOR_MUTED);
    doc.text(`${invoice.seller.name} · Faktura ${invoice.number}`, MARGIN, footerY, { width: contentWidth / 2, lineBreak: false });
    doc.text(`Strana ${i + 1} od ${range.count}`, MARGIN + contentWidth / 2, footerY, {
      width: contentWidth / 2,
      align: 'right',
      lineBreak: false,
    });
  }

  doc.end();
  return finished;
};

/** File name safe for Content-Disposition, e.g. "Faktura-INV-7-2026.pdf". */
export const invoiceFileName = (invoice: InvoiceDocument) =>
  `Faktura-${invoice.number.replace(/[^\w.-]+/g, '-')}.pdf`;
