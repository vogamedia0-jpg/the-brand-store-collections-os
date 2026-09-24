import { jsPDF } from 'jspdf';

type PdfProduct = {
  brand?: string | null;
  category: string;
  gender: string;
  images?: { imagePath: string; isPrimary: boolean }[];
};

const imageDataUrl = async (src: string) => {
  const response = await fetch(src);
  const blob = await response.blob();
  return new Promise<{ data: string; format: 'PNG' | 'JPEG' }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      data: String(reader.result),
      format: blob.type.includes('png') ? 'PNG' : 'JPEG',
    });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
};

export async function generateBrandedCataloguePdf(
  title: string,
  products: PdfProduct[],
  resolveImage: (path?: string | null) => string,
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const navy = '#0B1F44';
  const ivory = '#F8F5ED';
  const gold = '#C9A96A';
  const taupe = '#9A8F7F';

  doc.setFillColor(ivory);
  doc.rect(0, 0, 210, 297, 'F');
  doc.setFillColor(navy);
  doc.rect(0, 0, 210, 12, 'F');
  try {
    const logo = await imageDataUrl('/assets/logo-gold.png');
    doc.addImage(logo.data, logo.format, 23, 36, 64, 20, undefined, 'FAST');
  } catch {
    doc.setTextColor(navy);
    doc.setFont('times', 'italic');
    doc.setFontSize(34);
    doc.text('THE BRAND STORE', 22, 82);
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(taupe);
  doc.text('LUXURY LIVES HERE', 23, 92);
  doc.setDrawColor(gold);
  doc.line(23, 104, 78, 104);
  doc.setFontSize(14);
  doc.setTextColor(navy);
  doc.text(title, 23, 124);
  doc.setFontSize(9);
  doc.setTextColor(taupe);
  doc.text(`${products.length} pieces`, 23, 133);
  doc.setFontSize(8);
  doc.text('THE BRAND STORE catalogue', 23, 270);
  doc.setTextColor(navy);
  doc.text('THE BRAND STORE', 23, 278);

  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    if (index % 2 === 0) {
      doc.addPage();
      doc.setFillColor(ivory);
      doc.rect(0, 0, 210, 297, 'F');
    }
    const column = index % 2;
    const x = column === 0 ? 18 : 111;
    const y = 24;
    const imagePath = product.images?.find((image) => image.isPrimary)?.imagePath || product.images?.[0]?.imagePath;
    try {
      if (imagePath) {
        const image = await imageDataUrl(resolveImage(imagePath));
        doc.addImage(image.data, image.format, x, y, 80, 104, undefined, 'FAST');
      }
    } catch {
      doc.setFillColor('#EADCC6');
      doc.rect(x, y, 80, 104, 'F');
    }
    doc.setTextColor(navy);
    doc.setFont('times', 'normal');
    doc.setFontSize(16);
    doc.text(product.brand || 'The Brand Store', x, 144);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(taupe);
    doc.setFontSize(8);
    doc.text(`${product.gender.toUpperCase()} · ${product.category.toUpperCase()}`, x, 151);
    doc.setDrawColor('#EADCC6');
    doc.line(x, 158, x + 38, 158);
  }

  const safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'the-brand-store-catalogue';
  doc.save(`${safeName}.pdf`);
}
