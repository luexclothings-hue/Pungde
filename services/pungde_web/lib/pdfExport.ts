import jsPDF from "jspdf";

// ------------------------------------------------------------
// NATURAL PROFESSIONAL COLOR PALETTE
// Inspired by nature, agriculture, and premium design
// ------------------------------------------------------------
const THEME = {
  // Warm Natural Theme - Professional & Inviting
  natural: {
    bg: [250, 250, 248] as [number, number, number],           // Soft cream white
    surface: [255, 255, 255] as [number, number, number],      // Pure white for cards
    surfaceAlt: [245, 247, 245] as [number, number, number],   // Light sage for alternating
    text: [34, 40, 34] as [number, number, number],            // Deep forest green (almost black)
    textSecondary: [95, 105, 95] as [number, number, number],  // Medium forest green
    accent: [76, 140, 74] as [number, number, number],         // Fresh leaf green
    accentLight: [139, 195, 74] as [number, number, number],   // Bright lime green
    border: [220, 225, 220] as [number, number, number],       // Soft sage border
    success: [76, 175, 80] as [number, number, number],        // Success green
    link: [33, 150, 243] as [number, number, number],          // Trust blue for links
    warning: [255, 152, 0] as [number, number, number],        // Warm orange
  },
};

// ------------------------------------------------------------
// EMOJI REMOVAL
// ------------------------------------------------------------
function removeEmojis(text: string): string {
  // Remove all emojis and special unicode characters
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
    .replace(/[\u{200D}]/gu, '')            // Zero Width Joiner
    .replace(/\p{Emoji_Presentation}/gu, '') // All emoji presentations
    .replace(/\p{Extended_Pictographic}/gu, '') // Extended pictographic
    .trim();
}

// ------------------------------------------------------------
// MARKDOWN PARSING
// ------------------------------------------------------------
interface ParsedElement {
  type: "text" | "header" | "bold" | "link" | "image" | "table" | "list" | "separator";
  content: string;
  level?: number;
  url?: string;
  alt?: string;
  rows?: string[][];
  items?: string[];
}

function parseMarkdown(text: string): ParsedElement[] {
  // Remove all emojis first
  text = removeEmojis(text);
  const elements: ParsedElement[] = [];
  const lines = text.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      i++;
      continue;
    }

    // Horizontal separator
    if (line.match(/^---+$/)) {
      elements.push({ type: "separator", content: "" });
      i++;
      continue;
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      elements.push({
        type: "header",
        content: headerMatch[2].replace(/\*\*/g, ""),
        level: headerMatch[1].length,
      });
      i++;
      continue;
    }

    // Tables
    if (line.startsWith("|")) {
      const tableRows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const row = lines[i]
          .trim()
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => cell);
        if (!row.every((cell) => cell.match(/^[-:]+$/))) {
          tableRows.push(row);
        }
        i++;
      }
      if (tableRows.length > 0) {
        elements.push({ type: "table", content: "", rows: tableRows });
      }
      continue;
    }

    // Lists
    const listMatch = line.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^[-*]\s+/)) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      elements.push({ type: "list", content: "", items });
      continue;
    }

    // Images
    const imageMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
    if (imageMatch) {
      elements.push({
        type: "image",
        content: "",
        alt: imageMatch[1] || "Image",
        url: imageMatch[2],
      });
      i++;
      continue;
    }

    // Links (extract for clickable)
    const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/g);
    if (linkMatch) {
      elements.push({ type: "link", content: line });
      i++;
      continue;
    }

    // Regular text (with bold support)
    elements.push({ type: "text", content: line });
    i++;
  }

  return elements;
}

// ------------------------------------------------------------
// IMAGE LOADING (CORS SAFE)
// ------------------------------------------------------------
async function loadImageAsDataURL(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject("Failed to load image");
    img.src = url;
  });
}

// ------------------------------------------------------------
// RENDER FUNCTIONS
// ------------------------------------------------------------
function addPageIfNeeded(
  doc: jsPDF,
  y: number,
  requiredSpace: number,
  pageHeight: number,
  pageWidth: number,
  theme: typeof THEME.natural
): number {
  if (y + requiredSpace > pageHeight - 25) {
    doc.addPage();
    
    // Apply background to new page
    doc.setFillColor(...theme.bg);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    
    // Top accent bar
    doc.setFillColor(...theme.accent);
    doc.rect(0, 0, pageWidth, 3, "F");
    
    // Page number
    const pageNum = doc.getCurrentPageInfo().pageNumber;
    doc.setFontSize(8);
    doc.setTextColor(...theme.textSecondary);
    doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    
    return 20;
  }
  return y;
}

function renderHeader(
  doc: jsPDF,
  content: string,
  level: number,
  y: number,
  margin: number,
  pageWidth: number,
  theme: typeof THEME.natural
): number {
  const sizes = [18, 16, 14, 12, 11, 10];
  doc.setFontSize(sizes[level - 1] || 10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...theme.text);

  const lines = doc.splitTextToSize(content, pageWidth - margin * 2);
  for (const line of lines) {
    doc.text(line, margin, y);
    y += sizes[level - 1] * 0.5 + 2;
  }

  return y + 3;
}

function renderText(
  doc: jsPDF,
  content: string,
  y: number,
  margin: number,
  pageWidth: number,
  pageHeight: number,
  theme: typeof THEME.natural,
  isBold: boolean = false
): number {
  doc.setFontSize(10);
  doc.setFont("helvetica", isBold ? "bold" : "normal");
  doc.setTextColor(...theme.textSecondary);

  // Handle bold inline
  const parts = content.split(/(\*\*.*?\*\*)/g);
  let currentY = y;

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.replace(/\*\*/g, "");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...theme.text);
      const lines = doc.splitTextToSize(boldText, pageWidth - margin * 2);
      for (const line of lines) {
        currentY = addPageIfNeeded(doc, currentY, 6, pageHeight, pageWidth, theme);
        doc.text(line, margin, currentY);
        currentY += 6;
      }
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...theme.textSecondary);
    } else {
      const lines = doc.splitTextToSize(part, pageWidth - margin * 2);
      for (const line of lines) {
        currentY = addPageIfNeeded(doc, currentY, 6, pageHeight, pageWidth, theme);
        doc.text(line, margin, currentY);
        currentY += 6;
      }
    }
  }

  return currentY + 2;
}

function renderLink(
  doc: jsPDF,
  content: string,
  y: number,
  margin: number,
  pageWidth: number,
  pageHeight: number,
  theme: typeof THEME.natural
): number {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  let currentY = y;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const parts = content.split(linkRegex);
  for (let i = 0; i < parts.length; i++) {
    if (i % 3 === 0 && parts[i]) {
      // Regular text
      doc.setTextColor(...theme.textSecondary);
      const lines = doc.splitTextToSize(parts[i], pageWidth - margin * 2);
      for (const line of lines) {
        currentY = addPageIfNeeded(doc, currentY, 6, pageHeight, pageWidth, theme);
        doc.text(line, margin, currentY);
        currentY += 6;
      }
    } else if (i % 3 === 1) {
      // Link text
      const linkText = parts[i];
      const linkUrl = parts[i + 1];

      currentY = addPageIfNeeded(doc, currentY, 6, pageHeight, pageWidth, theme);

      // Blue underlined clickable link
      doc.setTextColor(...theme.link);
      doc.setFont("helvetica", "bold");
      doc.textWithLink(linkText, margin, currentY, { url: linkUrl });

      // Underline
      const textWidth = doc.getTextWidth(linkText);
      doc.setDrawColor(...theme.link);
      doc.setLineWidth(0.3);
      doc.line(margin, currentY + 1, margin + textWidth, currentY + 1);

      currentY += 6;
      doc.setFont("helvetica", "normal");
      i++; // Skip URL part
    }
  }

  return currentY + 2;
}

async function renderImage(
  doc: jsPDF,
  url: string,
  alt: string,
  y: number,
  margin: number,
  pageWidth: number,
  pageHeight: number,
  theme: typeof THEME.natural
): Promise<number> {
  try {
    const dataURL = await loadImageAsDataURL(url);

    // Calculate proper image dimensions (maintain aspect ratio)
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = 80; // Max height for images

    const img = new Image();
    img.src = dataURL;
    await new Promise((resolve) => (img.onload = resolve));

    let imgWidth = img.width;
    let imgHeight = img.height;

    // Scale to fit
    if (imgWidth > maxWidth) {
      const ratio = maxWidth / imgWidth;
      imgWidth = maxWidth;
      imgHeight = imgHeight * ratio;
    }

    if (imgHeight > maxHeight) {
      const ratio = maxHeight / imgHeight;
      imgHeight = maxHeight;
      imgWidth = imgWidth * ratio;
    }

    y = addPageIfNeeded(doc, y, imgHeight + 15, pageHeight, pageWidth, theme);

    // Add border/shadow effect
    doc.setFillColor(...theme.surface);
    doc.roundedRect(margin - 2, y - 2, imgWidth + 4, imgHeight + 4, 3, 3, "F");

    // Add image
    doc.addImage(dataURL, "PNG", margin, y, imgWidth, imgHeight);

    // Add caption
    if (alt) {
      doc.setFontSize(8);
      doc.setTextColor(...theme.textSecondary);
      doc.setFont("helvetica", "italic");
      doc.text(alt, margin, y + imgHeight + 8);
    }

    return y + imgHeight + 15;
  } catch (error) {
    console.error("Failed to load image:", error);
    doc.setFontSize(9);
    doc.setTextColor(200, 100, 100);
    doc.text(`[Image: ${alt}]`, margin, y);
    return y + 10;
  }
}

function renderTable(
  doc: jsPDF,
  rows: string[][],
  y: number,
  margin: number,
  pageWidth: number,
  pageHeight: number,
  theme: typeof THEME.natural
): number {
  if (rows.length === 0) return y;

  const colCount = rows[0].length;
  const colWidth = (pageWidth - margin * 2) / colCount;
  const rowHeight = 8;

  let currentY = y;

  // Header row
  doc.setFillColor(...theme.surface);
  doc.rect(margin, currentY, pageWidth - margin * 2, rowHeight, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...theme.text);

  for (let i = 0; i < rows[0].length; i++) {
    doc.text(rows[0][i], margin + i * colWidth + 2, currentY + 6);
  }

  currentY += rowHeight;

  // Data rows
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...theme.text);

  for (let r = 1; r < rows.length; r++) {
    currentY = addPageIfNeeded(doc, currentY, rowHeight, pageHeight, pageWidth, theme);

    // Alternating row colors
    if (r % 2 === 0) {
      doc.setFillColor(...theme.surfaceAlt);
      doc.rect(margin, currentY, pageWidth - margin * 2, rowHeight, "F");
    }

    for (let c = 0; c < rows[r].length; c++) {
      doc.text(rows[r][c], margin + c * colWidth + 2, currentY + 6);
    }

    currentY += rowHeight;
  }

  // Border
  doc.setDrawColor(...theme.border);
  doc.setLineWidth(0.5);
  doc.rect(margin, y, pageWidth - margin * 2, currentY - y);

  return currentY + 5;
}

function renderList(
  doc: jsPDF,
  items: string[],
  y: number,
  margin: number,
  pageWidth: number,
  pageHeight: number,
  theme: typeof THEME.natural
): number {
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...theme.textSecondary);

  let currentY = y;

  for (const item of items) {
    currentY = addPageIfNeeded(doc, currentY, 6, pageHeight, pageWidth, theme);

    // Bullet point
    doc.setFillColor(...theme.accent);
    doc.circle(margin + 2, currentY - 2, 1, "F");

    // Item text
    const lines = doc.splitTextToSize(item, pageWidth - margin * 2 - 8);
    for (const line of lines) {
      doc.text(line, margin + 6, currentY);
      currentY += 6;
    }
  }

  return currentY + 3;
}

function renderSeparator(
  doc: jsPDF,
  y: number,
  margin: number,
  pageWidth: number,
  theme: typeof THEME.natural
): number {
  doc.setDrawColor(...theme.border);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  return y + 8;
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
  const margin = 15;

  // Use natural professional theme
  const theme = THEME.natural;

  // ------------------------------------------------------------
  // COVER PAGE (Natural Professional Style)
  // ------------------------------------------------------------
  // Gradient background effect (light to lighter)
  doc.setFillColor(245, 247, 245);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Top accent bar
  doc.setFillColor(...theme.accent);
  doc.rect(0, 0, pageWidth, 8, "F");

  // Large decorative circle (subtle)
  doc.setFillColor(255, 255, 255);
  doc.circle(pageWidth / 2, 100, 60, "F");
  doc.setDrawColor(...theme.accentLight);
  doc.setLineWidth(3);
  doc.circle(pageWidth / 2, 100, 60, "S");

  // Logo/Title
  doc.setTextColor(...theme.accent);
  doc.setFontSize(42);
  doc.setFont("helvetica", "bold");
  doc.text("Pungda", pageWidth / 2, 105, { align: "center" });

  // Subtitle (moved up, away from circle)
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...theme.text);
  doc.text("AI Farming Consultation Report", pageWidth / 2, 175, { align: "center" });

  // Date (moved down more)
  doc.setFontSize(11);
  doc.setTextColor(...theme.textSecondary);
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(date, pageWidth / 2, 190, { align: "center" });

  // Decorative elements
  doc.setDrawColor(...theme.border);
  doc.setLineWidth(0.5);
  doc.line(margin, 180, pageWidth - margin, 180);

  // Bottom section with info
  doc.setFontSize(10);
  doc.setTextColor(...theme.textSecondary);
  doc.text("Personalized agricultural insights powered by AI", pageWidth / 2, 200, { align: "center" });

  // Footer with branding
  doc.setFontSize(9);
  doc.setTextColor(...theme.accent);
  doc.setFont("helvetica", "bold");
  doc.text("Generated by Pungda AI", pageWidth / 2, pageHeight - 20, { align: "center" });
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...theme.textSecondary);
  doc.text("Helping farmers grow better, naturally", pageWidth / 2, pageHeight - 12, { align: "center" });

  // ------------------------------------------------------------
  // CONTENT PAGES
  // ------------------------------------------------------------
  doc.addPage();
  
  // Apply background to all pages
  const applyPageBackground = () => {
    doc.setFillColor(...theme.bg);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    
    // Top accent bar on every page
    doc.setFillColor(...theme.accent);
    doc.rect(0, 0, pageWidth, 3, "F");
    
    // Page number footer
    const pageNum = doc.getCurrentPageInfo().pageNumber;
    doc.setFontSize(8);
    doc.setTextColor(...theme.textSecondary);
    doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: "center" });
  };
  
  applyPageBackground();

  let y = 20;
  let questionCount = 0;

  for (const msg of messages) {
    // Skip welcome message
    if (msg.role === "assistant" && msg.content.includes("Namaste")) continue;

    // Question header
    if (msg.role === "user") {
      questionCount++;
      y = addPageIfNeeded(doc, y, 15, pageHeight, pageWidth, theme);

      // Question box with border
      doc.setFillColor(...theme.surface);
      doc.roundedRect(margin, y - 5, pageWidth - margin * 2, 12, 3, 3, "F");
      doc.setDrawColor(...theme.accent);
      doc.setLineWidth(1);
      doc.roundedRect(margin, y - 5, pageWidth - margin * 2, 12, 3, 3, "S");

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...theme.accent);
      doc.text(`Q${questionCount}:`, margin + 3, y + 3);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...theme.text);
      const qLines = doc.splitTextToSize(msg.content, pageWidth - margin * 2 - 20);
      doc.text(qLines[0], margin + 18, y + 3);

      y += 15;
    }

    // Answer content
    if (msg.role === "assistant") {
      y = addPageIfNeeded(doc, y, 10, pageHeight, pageWidth, theme);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...theme.success);
      doc.text("Answer:", margin, y);
      y += 8;

      // Parse and render markdown
      const elements = parseMarkdown(msg.content);

      for (const element of elements) {
        switch (element.type) {
          case "header":
            y = renderHeader(doc, element.content, element.level || 1, y, margin, pageWidth, theme);
            break;
          case "text":
            y = renderText(doc, element.content, y, margin, pageWidth, pageHeight, theme);
            break;
          case "link":
            y = renderLink(doc, element.content, y, margin, pageWidth, pageHeight, theme);
            break;
          case "image":
            y = await renderImage(doc, element.url!, element.alt!, y, margin, pageWidth, pageHeight, theme);
            break;
          case "table":
            y = renderTable(doc, element.rows!, y, margin, pageWidth, pageHeight, theme);
            break;
          case "list":
            y = renderList(doc, element.items!, y, margin, pageWidth, pageHeight, theme);
            break;
          case "separator":
            y = renderSeparator(doc, y, margin, pageWidth, theme);
            break;
        }
      }

      y += 10;
    }
  }

  // Save
  doc.save(`Pungda-${new Date().toISOString().split("T")[0]}.pdf`);
}
