import jsPDF from "jspdf";

// ------------------------------------------------------------
// MARKDOWN IMAGE EXTRACTION
// ------------------------------------------------------------
function extractImages(text: string) {
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  const images: { alt: string; url: string }[] = [];
  let match;
  while ((match = imageRegex.exec(text)) !== null) {
    images.push({ alt: match[1] || "Image", url: match[2] });
  }
  return images;
}

// ------------------------------------------------------------
// CLEAN MARKDOWN (TEXT ONLY)
// ------------------------------------------------------------
function cleanMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "[Image Below]")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
    .trim();
}

// ------------------------------------------------------------
// EMOJI SUPPORT (extract + convert)
// ------------------------------------------------------------
function extractEmojis(text: string): string[] {
  return Array.from(text).filter(char => /\p{Extended_Pictographic}/u.test(char));
}

async function emojiToBase64(emoji: string): Promise<string> {
  const code = emoji.codePointAt(0)?.toString(16);
  const svgUrl = `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${code}.svg`;

  const svgText = await fetch(svgUrl).then(r => r.text());

  const img = new Image();
  img.src = "data:image/svg+xml;base64," + btoa(svgText);
  await new Promise(res => (img.onload = res));

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, 64, 64);

  return canvas.toDataURL("image/png");
}

// ------------------------------------------------------------
// IMAGE FETCHING (CORS SAFE)
// ------------------------------------------------------------
async function loadImageAsDataURL(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // ✅ Crucial for GCS
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject("Failed to fetch image");
    img.src = url;
  });
}

// ------------------------------------------------------------
// MAIN PDF EXPORT FUNCTION
// ------------------------------------------------------------
export async function exportChatToPDF(
  messages: Array<{ role: "user" | "assistant"; content: string }>
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = 30;
  let questionCount = 0;

  // ------------------------------------------------------------
  // COVER PAGE (Luxury Apple/Uber Style)
  // ------------------------------------------------------------
  doc.setFillColor(15, 17, 21);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setTextColor(235, 235, 235);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("Pungde", pageWidth / 2, 100, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("AI Farming Consultation Report", pageWidth / 2, 120, { align: "center" });

  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString(), pageWidth / 2, 135, { align: "center" });

  // Content Page
  doc.addPage();
  y = 25;

  // ------------------------------------------------------------
  // CHAT CONTENT
  // ------------------------------------------------------------
  for (const msg of messages) {
    if (msg.role === "assistant" && msg.content.includes("Namaste")) continue;

    if (msg.role === "user") {
      questionCount++;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(45, 49, 56);
      doc.text(`Q${questionCount}:`, margin, y);
      y += 6;
    } else {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 120, 10);
      doc.text("Answer:", margin, y);
      y += 6;
    }

    // clean text + remove emojis temporarily
    const cleaned = cleanMarkdown(msg.content);
    const emojis = extractEmojis(cleaned);
    const textWithoutEmojis = cleaned.replace(/\p{Extended_Pictographic}/gu, " "); // Leave space

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    for (const line of doc.splitTextToSize(textWithoutEmojis, pageWidth - margin * 2)) {
      if (y > pageHeight - 20) { doc.addPage(); y = 20; }
      doc.text(line, margin, y);
      y += 6;
    }

    // Now print emojis visually
    for (const emoji of emojis) {
      const emojiImg = await emojiToBase64(emoji);
      if (y > pageHeight - 20) { doc.addPage(); y = 20; }
      doc.addImage(emojiImg, "PNG", margin, y, 6, 6);
      y += 7;
    }

    y += 5;

    // Insert images from markdown
    const images = extractImages(msg.content);
    for (const image of images) {
      const dataURL = await loadImageAsDataURL(image.url);
      const imageWidth = pageWidth - margin * 2;
      const imageHeight = 60;

      if (y > pageHeight - 80) { doc.addPage(); y = 20; }
      doc.addImage(dataURL, "PNG", margin, y, imageWidth, imageHeight);
      y += imageHeight + 10;
    }

    y += 10;
  }

  // FOOTER
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Generated by Pungde AI Farming Assistant", pageWidth / 2, pageHeight - 10, { align: "center" });

  doc.save(`Pungde-${new Date().toISOString().split("T")[0]}.pdf`);
}
