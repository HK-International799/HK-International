import { BRAND } from "./brandConfig.js";

/**
 * "modern" — clean, minimalist layout with a solid left sidebar carrying
 * the logo/org name, and content laid out left-aligned rather than the
 * classic template's fully-centered, bordered look.
 */
const render = (doc, data) => {
  const { primaryColor, accentColor } = BRAND;
  const sidebarWidth = 190;
  const pageW = doc.page.width;
  const pageH = doc.page.height;

  // ── Sidebar ──
  doc.rect(0, 0, sidebarWidth, pageH).fill(primaryColor);
  doc.rect(sidebarWidth, 0, 4, pageH).fill(accentColor);

  if (data.hkLogoBuffer) {
    try {
      doc.image(data.hkLogoBuffer, sidebarWidth / 2 - 30, 50, { width: 60 });
    } catch {
      /* ignore */
    }
  }

  doc.fillColor("#ffffff").fontSize(13).font("Helvetica-Bold")
    .text(BRAND.orgName, 24, 130, { width: sidebarWidth - 48, align: "left" });
  doc.font("Helvetica").fontSize(9).fillColor("#c5cae9")
    .text(BRAND.orgTagline, 24, 155, { width: sidebarWidth - 48, align: "left" });

  doc.fontSize(9).fillColor("#c5cae9")
    .text(`Certificate No.\n${data.certificateNumber}`, 24, pageH - 150, { width: sidebarWidth - 48 });
  doc.fontSize(9).fillColor("#c5cae9")
    .text(`Date of Issue\n${data.issuedDate}`, 24, pageH - 100, { width: sidebarWidth - 48 });

  if (data.qrImageBuffer) {
    try {
      doc.image(data.qrImageBuffer, sidebarWidth / 2 - 30, pageH - 240, { width: 60 });
      doc.fontSize(7).fillColor("#c5cae9")
        .text("Scan to verify", 24, pageH - 175, { width: sidebarWidth - 48, align: "center" });
    } catch {
      /* ignore */
    }
  }

  // ── Main content area ──
  const contentX = sidebarWidth + 50;
  const contentW = pageW - contentX - 50;

  doc.fillColor("#9e9e9e").fontSize(12).font("Helvetica")
    .text("CERTIFICATE OF COMPLETION", contentX, 70, { width: contentW, characterSpacing: 2 });

  doc.moveDown(1.2);
  doc.fillColor("#333").fontSize(13).text("This certifies that", contentX, doc.y, { width: contentW });

  doc.moveDown(0.4);
  doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(32)
    .text(data.studentName, contentX, doc.y, { width: contentW });
  doc.font("Helvetica");

  doc.moveDown(0.6);
  doc.fillColor("#333").fontSize(13).text("has successfully completed", contentX, doc.y, { width: contentW });
  doc.moveDown(0.2);
  doc.fillColor("#333").fontSize(20).font("Helvetica-Bold")
    .text(data.courseName, contentX, doc.y, { width: contentW });
  doc.font("Helvetica");

  if (data.grade || (data.score !== undefined && data.score !== null)) {
    doc.moveDown(0.4);
    const scoreText = data.grade ? `Grade: ${data.grade}` : `Score: ${data.score}%`;
    doc.fillColor("#666").fontSize(13).text(scoreText, contentX, doc.y, { width: contentW });
  }

  if (data.courseCode || data.durationText) {
    doc.moveDown(0.2);
    const bits = [
      data.courseCode && `Course Code: ${data.courseCode}`,
      data.durationText && `Duration: ${data.durationText}`,
    ]
      .filter(Boolean)
      .join("    •    ");
    doc.fontSize(9).fillColor("#999").text(bits, contentX, doc.y, { width: contentW });
  }

  if (data.hasExpiry && data.expiryDateText) {
    doc.moveDown(0.4);
    doc.fontSize(9).fillColor("#999").text(`Valid until ${data.expiryDateText}`, contentX, doc.y, { width: contentW });
  }

  if (data.aoName) {
    doc.moveDown(0.6);
    if (data.aoLogoBuffer) {
      try {
        doc.image(data.aoLogoBuffer, contentX, doc.y, { width: 30 });
        doc.fontSize(9).fillColor("#888").text(`Accredited by ${data.aoName}`, contentX + 38, doc.y - 18, { width: contentW - 38 });
      } catch {
        doc.fontSize(9).fillColor("#888").text(`Accredited by ${data.aoName}`, contentX, doc.y, { width: contentW });
      }
    } else {
      doc.fontSize(9).fillColor("#888").text(`Accredited by ${data.aoName}`, contentX, doc.y, { width: contentW });
    }
  }

  // ── Signature block (bottom-right of content area) ──
  const signY = pageH - 110;
  doc.fontSize(16).font("Times-Italic").fillColor("#333")
    .text(BRAND.signatoryName, contentX + contentW - 200, signY - 22, { width: 200, align: "center" });
  doc.font("Helvetica");
  doc.moveTo(contentX + contentW - 200, signY).lineTo(contentX + contentW, signY).stroke("#333");
  doc.fontSize(10).fillColor("#333")
    .text(BRAND.signatoryTitle, contentX + contentW - 200, signY + 5, { width: 200, align: "center" });

  // ── Revoked watermark ──
  if (data.revoked) {
    doc.save();
    doc.opacity(0.22);
    doc.rotate(-28, { origin: [pageW / 2, pageH / 2] });
    doc.fontSize(90).fillColor("#c62828")
      .text("REVOKED", 0, pageH / 2 - 45, { align: "center", width: pageW });
    doc.restore();
  }
};

export default { render };
