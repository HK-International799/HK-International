import { BRAND } from "./brandConfig.js";

/**
 * "classic" — redesigned to the colourful geometric "Certificate of
 * Achievement" layout. Same data contract as before: QR verification,
 * expiry, AO accreditation strip, and the REVOKED watermark are untouched
 * logic-wise, only re-positioned to fit the new visual design.
 * @param {PDFKit.PDFDocument} doc
 * @param {Object} data
 */
const render = (doc, data) => {
  // This template is full-bleed and hand-positions every element itself
  // (including its own border). PDFKit checks flowing text/pagination
  // against doc.page.margins on every text() call — even with explicit
  // x/y — and silently starts a new page once content crosses
  // (page.height - margins.bottom). The generator sets real margins for
  // other purposes, so we neutralize them here, scoped to this render
  // call, to guarantee this template always stays on a single page.
  doc.page.margins = { top: 0, bottom: 0, left: 0, right: 0 };

  const pageW = doc.page.width;
  const pageH = doc.page.height;

  const COLOR = {
    blue: "#131F8C",
    red: "#E8342A",
    purple: "#4B1E8F",
    pink: "#D6127A",
    gold: "#E8A93A",
    goldLight: "#F5C863",
    orange: "#F26A21",
    accentBlue: "#2244C7",
    text: "#2B2B2B",
    muted: "#7A7A7A",
  };

  // ── Decorative corner triangles (top-left) ──
  doc.save();
  doc.polygon([0, 0], [pageW * 0.5, 0], [0, pageH * 0.32]).fill(COLOR.pink);
  doc.polygon([0, 0], [pageW * 0.34, 0], [0, pageH * 0.21]).fill(COLOR.purple);
  doc
    .polygon([0, pageH * 0.02], [pageW * 0.2, 0], [0, pageH * 0.22])
    .fill(COLOR.accentBlue);
  doc
    .polygon(
      [0, pageH * 0.13],
      [pageW * 0.13, pageH * 0.015],
      [0, pageH * 0.29],
    )
    .fill(COLOR.gold);
  doc.restore();

  // ── Decorative corner triangles (bottom-right) ──
  doc.save();
  doc
    .polygon([pageW, pageH], [pageW * 0.72, pageH], [pageW, pageH * 0.78])
    .fill(COLOR.purple);
  doc
    .polygon([pageW, pageH], [pageW * 0.84, pageH], [pageW, pageH * 0.88])
    .fill(COLOR.orange);
  doc
    .polygon([pageW, pageH], [pageW * 0.93, pageH], [pageW, pageH * 0.93])
    .fill(COLOR.accentBlue);
  doc.restore();

  // ── Logo (top-right) ──
  if (data.hkLogoBuffer) {
    try {
      doc.image(data.hkLogoBuffer, pageW - 175, 45, { width: 130 });
    } catch {
      /* corrupt/unsupported image — ignore */
    }
  }

  // ── Title ──
  doc
    .font("Helvetica-Bold")
    .fontSize(42)
    .fillColor(COLOR.blue)
    .text("CERTIFICATE", 0, 130, { align: "center" });

  doc
    .font("Helvetica-Bold")
    .fontSize(26)
    .fillColor(COLOR.red)
    .text("OF ACHIEVEMENT", { align: "center" });

  doc.moveDown(1.4);

  // ── Presented to ──
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor(COLOR.text)
    .text("This Award is Presented to", { align: "center" });

  doc.moveDown(0.6);

  // ── Student name ──
  doc
    .font("Times-Italic")
    .fontSize(32)
    .fillColor(COLOR.blue)
    .text(data.studentName, { align: "center" });

  const nameLineY = doc.y + 6;
  doc
    .moveTo(pageW / 2 - 160, nameLineY)
    .lineTo(pageW / 2 + 160, nameLineY)
    .lineWidth(1.2)
    .stroke(COLOR.gold);

  doc.font("Helvetica");
  doc.moveDown(1.1);

  // ── Course ──
  doc
    .fontSize(13)
    .fillColor(COLOR.text)
    .text("has successfully completed the", { align: "center" });

  doc.moveDown(0.4);

  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor("#111")
    .text(data.courseName.toUpperCase(), { align: "center" });

  doc.font("Helvetica");

  if (data.grade || (data.score !== undefined && data.score !== null)) {
    doc.moveDown(0.9);
    const scoreText = data.grade
      ? `Grade: ${data.grade}`
      : `Score: ${data.score}%`;
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(COLOR.muted)
      .text(scoreText, { align: "center" });
    doc.font("Helvetica");
  }

  // ── Meta info block (left-aligned, above QR) ──
  const metaX = 70;
  let metaY = Math.min(doc.y + 45, pageH - pageH * 0.297);

  doc.fontSize(10).fillColor(COLOR.text);
  if (data.courseCode) {
    doc.text(`Course Code: ${data.courseCode}`, metaX, metaY);
    metaY = doc.y + 2;
  }
  doc.text(`Date of Completion: ${data.issuedDate}`, metaX, metaY);
  metaY = doc.y + 2;
  doc.text(`Certificate Number: ${data.certificateNumber}`, metaX, metaY);
  metaY = doc.y + 2;

  if (data.durationText) {
    doc.text(`Duration: ${data.durationText}`, metaX, metaY);
    metaY = doc.y + 2;
  }

  if (data.hasExpiry && data.expiryDateText) {
    doc
      .fillColor(COLOR.muted)
      .text(`Valid Until: ${data.expiryDateText}`, metaX, metaY);
    doc.fillColor(COLOR.text);
  }

  // ── QR code (bottom-left, verification — unchanged logic) ──
  if (data.qrImageBuffer) {
    try {
      const qrSize = 92;
      const qrX = 70;
      const qrY = pageH - pageH * 0.172 - 100;

      doc.image(data.qrImageBuffer, qrX, qrY, { width: qrSize });

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(COLOR.text)
        .text("SCAN TO VERIFY", qrX - 5, qrY + qrSize + 6, {
          width: qrSize + 10,
          align: "left",
        });

      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(COLOR.muted)
        .text(data.certificateNumber, qrX - 5, qrY + qrSize + 19, {
          width: qrSize + 15,
          align: "left",
        });
    } catch {
      /* ignore */
    }
  }

  // ── Medal graphic (bottom-centre) ─────────────────────────────────
  const cx = pageW / 2;

  // Move the entire medal upward
  const medalY = pageH - pageH * 0.208 - 60;

  // Ribbon dimensions
  const ribbonTop = medalY - 90;
  const ribbonBottom = medalY - 12;

  // Left ribbon
  doc
    .polygon(
      [cx - 30, ribbonTop],
      [cx - 10, ribbonTop],
      [cx, ribbonBottom], // moved closer to centre
    )
    .fill("#C9962C");

  // Right ribbon
  doc
    .polygon(
      [cx + 10, ribbonTop],
      [cx + 30, ribbonTop],
      [cx, ribbonBottom], // moved closer to centre
    )
    .fill("#C9962C");

  // Medal
  doc.circle(cx, medalY, 42).fill(COLOR.gold);

  doc.circle(cx, medalY, 32).fill(COLOR.goldLight);

  doc.circle(cx, medalY, 32).lineWidth(1.5).stroke("#C9962C");

  // ── Signature (right of medal) ──
  const signX = pageW - 200;
  const signY = medalY - pageH * 0.065 + 30;

  if (data.signatureImageBuffer) {
    try {
      doc.image(data.signatureImageBuffer, signX, signY, { width: 130 });
    } catch {
      /* ignore */
    }
  }

  const signLineY = signY + 60;
  doc
    .moveTo(signX + 5, signLineY)
    .lineTo(signX + 135, signLineY)
    .lineWidth(1)
    .stroke("#333");

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(COLOR.text)
    .text(BRAND.signatoryName, signX, signLineY + 8, {
      width: 140,
      align: "center",
    });

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLOR.muted)
    .text(BRAND.signatoryTitle, signX, signLineY + 24, {
      width: 140,
      align: "center",
    });

  // ── Accreditation strip (only if an AO resolved for the course) ──
  if (data.aoName) {
    const aoY = pageH - pageH * 0.0925;
    if (data.aoLogoBuffer) {
      try {
        doc.image(data.aoLogoBuffer, pageW / 2 - 140, aoY - 4, { width: 22 });
      } catch {
        /* ignore */
      }
    }
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLOR.muted)
      .text(`Accredited by ${data.aoName}`, pageW / 2 - 110, aoY, {
        width: 220,
        align: "left",
      });
  }

  // ── Footer: divider + org name ──
  const footerY = pageH - pageH * 0.057;
  const dotX = pageW / 2;

  doc
    .moveTo(dotX - 90, footerY)
    .lineTo(dotX - 12, footerY)
    .lineWidth(1)
    .stroke("#999");
  doc
    .moveTo(dotX + 12, footerY)
    .lineTo(dotX + 90, footerY)
    .lineWidth(1)
    .stroke("#999");
  doc.circle(dotX, footerY, 2).fill("#999");

  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor(COLOR.purple)
    .text(BRAND.orgName, 0, footerY + 10, { align: "center" });

  // ── Revoked watermark (unchanged) ──
  if (data.revoked) {
    doc.save();
    doc.opacity(0.22);
    doc.rotate(-28, { origin: [pageW / 2, pageH / 2] });
    doc
      .fontSize(90)
      .fillColor("#c62828")
      .text("REVOKED", 0, pageH / 2 - 45, {
        align: "center",
        width: pageW,
      });
    doc.restore();
  }
};

export default { render };
