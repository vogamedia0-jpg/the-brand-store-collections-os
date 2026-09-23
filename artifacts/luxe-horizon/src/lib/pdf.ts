import { jsPDF } from 'jspdf';
import { BRAND, categoryLabel } from '@/lib/brand';
import { imageSrc } from '@/components/product-image';

type PdfProduct = {
  brand?: string | null;
  category: string;
  gender: string;
  images?: { imagePath: string; isPrimary: boolean }[];
};

/* Exact brand palette — no other colours are introduced. */
const NAVY = '#0B1F44';
const GOLD = '#C9A96A';
const BEIGE = '#EADCC6';
const TAUPE = '#9A8F7F';
const IVORY = '#F8F5ED';

const imageDataUrl = async (src: string) => {
  const response = await fetch(src);
  const blob = await response.blob();
  return new Promise<{ data: string; format: 'PNG' | 'JPEG' }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        data: String(reader.result),
        format: blob.type.includes('png') ? 'PNG' : 'JPEG',
      });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
};

export async function generateBrandedCataloguePdf(title: string, products: PdfProduct[]) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // Cover
  doc.setFillColor(IVORY);
  doc.rect(0, 0, 210, 297, 'F');
  doc.setFillColor(NAVY);
  doc.rect(0, 0, 210, 96, 'F');
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.4);
  doc.line(22, 118, 78, 118);

  doc.setTextColor(GOLD);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('T H E', 22, 70);
  doc.setTextColor(IVORY);
  doc.setFont('times', 'normal');
  doc.setFontSize(30);
  doc.text('BRAND STORE', 22, 84);
  doc.setTextColor(GOLD);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(BRAND.tagline, 22, 92);

  doc.setTextColor(NAVY);
  doc.setFont('times', 'normal');
  doc.setFontSize(18);
  doc.text(title, 22, 136);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(TAUPE);
  doc.text(`${products.length} ${products.length === 1 ? 'piece' : 'pieces'} · Prepared for personal sharing`, 22, 145);

  doc.setFontSize(8);
  doc.text(BRAND.name, 22, 272);
  doc.setTextColor(GOLD);
  doc.text(BRAND.positioning, 22, 278);

  // Product plates
  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    if (index % 2 === 0) {
      doc.addPage();
      doc.setFillColor(IVORY);
      doc.rect(0, 0, 210, 297, 'F');
    }

    const column = index % 2;
    const x = column === 0 ? 18 : 111;
    const y = 24;

    const imagePath = product.images?.find((image) => image.isPrimary)?.imagePath || product.images?.[0]?.imagePath;
    const src = imageSrc(imagePath);

    let placed = false;
    if (src) {
      try {
        const image = await imageDataUrl(src);
        doc.addImage(image.data, image.format, x, y, 80, 104, undefined, 'FAST');
        placed = true;
      } catch {
        placed = false;
      }
    }
    if (!placed) {
      doc.setFillColor(BEIGE);
      doc.rect(x, y, 80, 104, 'F');
      doc.setDrawColor(GOLD);
      doc.setLineWidth(0.2);
      doc.rect(x + 3, y + 3, 74, 98);
      doc.setTextColor(TAUPE);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('PHOTOGRAPHY FORTHCOMING', x + 40, y + 54, { align: 'center' });
    }

    doc.setTextColor(NAVY);
    doc.setFont('times', 'normal');
    doc.setFontSize(15);
    doc.text(product.brand || 'House selection', x, 142);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(TAUPE);
    doc.setFontSize(7.5);
    doc.text(`${product.gender.toUpperCase()} · ${categoryLabel(product.category).toUpperCase()}`, x, 149);
    doc.setDrawColor(GOLD);
    doc.setLineWidth(0.3);
    doc.line(x, 155, x + 34, 155);
  }

  const safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'the-brand-store-catalogue';
  doc.save(`${safeName}.pdf`);
}
