import type { DaySchedule } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const PDF_FILENAME = 'NISSPY-Haftalik-Plan.pdf';
const EXCEL_FILENAME = 'NISSPY-Haftalik-Plan.xlsx';

/** Gün gün yatay tablo: 7 sütun (her gün bir sütun), görevler satır satır */
function buildHorizontalTable(schedule: DaySchedule[]) {
  const dayNames = schedule.map(d => d.dayName);
  const maxTasks = Math.max(1, ...schedule.map(d => d.blocks.length));

  const head = [dayNames];
  const body: string[][] = [];

  // Satır 1: Gün tipi (Trainee, Focus, ...)
  body.push(schedule.map(d => d.status));

  // Sonraki satırlar: her sütunda o günün 1., 2., 3. ... görevi (saat varsa başta)
  for (let i = 0; i < maxTasks; i++) {
    const row = schedule.map(day => {
      const block = day.blocks[i];
      if (!block) return '—';
      const timePart = block.time ? `${block.time} – ` : '';
      return `${timePart}${block.title} (${block.duration} dk)`;
    });
    body.push(row);
  }

  return { head, body };
}

/** Liste formatı (Excel): Gün, Tip, Görev, Saat, Süre, Kategori */
function scheduleToRows(schedule: DaySchedule[]): string[][] {
  const rows: string[][] = [['Gün', 'Gün tipi', 'Görev adı', 'Saat', 'Süre (dk)', 'Kategori']];
  for (const day of schedule) {
    if (day.blocks.length === 0) {
      rows.push([day.dayName, day.status, '—', '', '0', '—']);
    } else {
      day.blocks.forEach((block, i) => {
        rows.push([
          i === 0 ? day.dayName : '',
          i === 0 ? day.status : '',
          block.title,
          block.time ?? '',
          String(block.duration),
          block.category,
        ]);
      });
    }
  }
  return rows;
}

export function exportScheduleToPdf(schedule: DaySchedule[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 10;
  const tableW = pageW - margin * 2;

  doc.setFontSize(14);
  doc.text('NISSPY – Haftalık Plan', margin, 14);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString('tr-TR'), margin, 21);

  const { head, body } = buildHorizontalTable(schedule);
  const colCount = 7;
  const colWidth = tableW / colCount;

  autoTable(doc, {
    head,
    body,
    startY: 26,
    theme: 'grid',
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: 255,
      fontSize: 9,
      cellWidth: colWidth,
      overflow: 'linebreak',
    },
    bodyStyles: { fontSize: 8, cellWidth: colWidth, overflow: 'linebreak' },
    columnStyles: Object.fromEntries(
      Array.from({ length: colCount }, (_, i) => [
        String(i),
        { cellWidth: colWidth, overflow: 'linebreak' as const },
      ])
    ),
    margin: { left: margin, right: margin },
    tableWidth: tableW,
  });

  doc.save(PDF_FILENAME);
}

export function exportScheduleToExcel(schedule: DaySchedule[]) {
  const rows = scheduleToRows(schedule);
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const colWidths = [
    { wch: 14 },
    { wch: 12 },
    { wch: 40 },
    { wch: 8 },
    { wch: 10 },
    { wch: 12 },
  ];
  ws['!cols'] = colWidths;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Haftalık Plan');
  XLSX.writeFile(wb, EXCEL_FILENAME);
}
