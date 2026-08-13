import { BRAND } from "./brandConfig.js";

/**
 * "accredited" — for courses with a resolved AwardingOrganisation. Puts
 * both the 1A HK wordmark and the AO logo in a top ribbon so the
 * accrediting body is the most visually prominent element, with an
 * "Accredited Course" banner. Falls back gracefully (still renders a
 * complete, sensible certificate) if no AO could be resolved for the
 * course — templateKey is a certificate-level choice, not tied 1:1 to AO
 * presence, so admins can still pick this look intentionally.
 */
const render = (doc, data) => {
  const { primaryColor, accentColor } = BRAND;
  const pageW = doc.page.width;
  const pageH = doc.page.height;

  // ── Outer frame ──
  doc.rect(18, 18, pageW - 36, pageH - 36).lineWidth(2).stroke(primaryColor);

  // ── Top ribbon: dual branding ──
  doc.rect(18, 18, pageW - 36, 78).fill("#f4f6fb");

  if (data.hkLogoBuffer) {
    try {
      doc.image(data.hkLogoBuffer, 40, 32, { width: 50 });
    } catch {
      /* ignore */
    }
  }
  doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(13)
    .text(BRAND.orgName, 100, 40, { width: 260 });
  doc.font("Helvetica").fillColor("#666").fontSize(9)
    .text(BRAND.orgTagline, 100, 58, { width: 260 });

  if (data.aoName) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(accentColor)
      .text("ACCREDITED COURSE", pageW - 300, 34, { width: 260, align: "right" });
    if (data.aoLogoBuffer) {
      try {
        doc.image(data.aoLogoBuffer, pageW - 90, 30, { width: 46 });
      } catch {
        /* ignore */
      }
    }
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#333")
      .text(data.aoName, pageW - 300, 50, { width: data.aoLogoBuffer ? 190 : 260, align: "right" });
  }

  // ── Title ──
  doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(32)
    .text("Certificate of Completion", 0, 130, { align: "center" });
  doc.moveTo(220, 172).lineTo(pageW - 220, 172).lineWidth(2).stroke(accentColor);
  doc.font("Helvetica");

  // ── Body ──
  doc.moveDown(1.6);
  doc.fontSize(13).fillColor("#333").text("This is to certify that", { align: "center" });
  doc.moveDown(0.4);
  doc.fontSize(27).fillColor(primaryColor).font("Helvetica-Bold")
    .text(data.studentName, { align: "center" });
  doc.font("Helvetica");
  doc.moveDown(0.4);
  doc.fontSize(13).fillColor("#333")
    .text("has successfully completed the accredited course", { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(21).fillColor("#333").text(`"${data.courseName}"`, { align: "center" });

  if (data.grade || (data.score !== undefined && data.score !== null)) {
    doc.moveDown(0.3);
    const scoreText = data.grade ? `Grade: ${data.grade}` : `Score: ${data.score}%`;
    doc.fontSize(15).fillColor("#666").text(scoreText, { align: "center" });
  }

  if (data.courseCode || data.durationText) {
    doc.moveDown(0.25);
    const bits = [
      data.courseCode && `Course Code: ${data.courseCode}`,
      data.durationText && `Duration: ${data.durationText}`,
    ]
      .filter(Boolean)
      .join("    •    ");
    doc.fontSize(10).fillColor("#888").text(bits, { align: "center" });
  }

  doc.moveDown(0.7);
  doc.fontSize(11).fillColor("#666").text(`Certificate No: ${data.certificateNumber}`, { align: "center" });
  doc.moveDown(0.15);
  doc.text(`Date of Issue: ${data.issuedDate}`, { align: "center" });
  if (data.hasExpiry && data.expiryDateText) {
    doc.moveDown(0.15);
    doc.fontSize(9).fillColor("#999").text(`Valid Until: ${data.expiryDateText}`, { align: "center" });
  }

  // ── Signature ──
  const signY = pageH - 78;
  doc.fontSize(17).font("Times-Italic").fillColor("#333")
    .text(BRAND.signatoryName, pageW / 2 - 105, signY - 22, { width: 210, align: "center" });
  doc.font("Helvetica");
  doc.moveTo(pageW / 2 - 100, signY).lineTo(pageW / 2 + 100, signY).stroke("#333");
  doc.fontSize(10).fillColor("#333")
    .text(BRAND.signatoryTitle, pageW / 2 - 100, signY + 5, { width: 200, align: "center" });

  // ── QR ──
  if (data.qrImageBuffer) {
    try {
      doc.image(data.qrImageBuffer, pageW - 118, pageH - 118, { width: 62 });
      doc.fontSize(7).fillColor("#999")
        .text("Scan to verify", pageW - 128, pageH - 50, { width: 82, align: "center" });
    } catch {
      /* ignore */
    }
  }

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
