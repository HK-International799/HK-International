import { BRAND } from "./brandConfig.js";

/**
 * "classic" — the original single hardcoded layout, refactored into the
 * template interface. Visually unchanged for existing certificates that
 * don't set a templateKey (getTemplate() defaults to this), plus the new
 * additive elements: QR code, expiry line, AO accreditation strip, and a
 * REVOKED watermark.
 * @param {PDFKit.PDFDocument} doc
 * @param {Object} data
 */
const render = (doc, data) => {
  const { primaryColor, accentColor } = BRAND;

  // ── Border ──
  doc
    .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
    .lineWidth(3)
    .stroke(primaryColor);
  doc
    .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
    .lineWidth(1)
    .stroke("#90caf9");

  // ── Logo (real asset if fetched, else nothing — keeps header text-only like before) ──
  if (data.hkLogoBuffer) {
    try {
      doc.image(data.hkLogoBuffer, 45, 30, {
        width: 125,
      });
    } catch {
      /* corrupt/unsupported image — ignore, header text still renders */
    }
  }

  // ── Header ──
  doc.fontSize(22).fillColor("#6A1B9A").text(BRAND.orgName, 0, 55, {
    align: "center",
  });

  doc.fontSize(10).fillColor("#f57c00").text(BRAND.orgTagline, {
    align: "center",
  });

  doc.moveDown(1.5);

  doc
    .font("Times-Italic") // or another registered cursive font
    .fontSize(34)
    .fillColor(primaryColor)
    .text("Certificate of Completion", {
      align: "center",
    });

  doc.font("Helvetica");

  // ── Decorative line ──
  const lineY = doc.y + 6;

  doc
    .moveTo(220, lineY)
    .lineTo(doc.page.width - 240, lineY)
    .lineWidth(1.5)
    .stroke(accentColor);

  doc.moveDown(0.8);

  // ── Body ──
  doc
    .fontSize(14)
    .fillColor("#333")
    .text("This is to certify that", { align: "center" });
  doc.moveDown(0.5);
  doc.moveDown(0.4);

  doc
    .font("Helvetica-Bold")
    .fontSize(32)
    .fillColor("#0D1B52")
    .text(data.studentName.toUpperCase(), {
      align: "center",
      underline: true,
    });

  doc.font("Helvetica");
  doc.moveDown(0.3);
  doc
    .fontSize(14)
    .fillColor("#333")
    .text("has successfully completed the course", { align: "center" });
  doc.moveDown(0.5);
  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor("#111")
    .text(data.courseName, {
      align: "center",
    });

  doc.moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#555")
    .text(
      "This certificate is proudly awarded to the above participant in recognition of the successful completion of all required training, assessments, and competency requirements for this programme. The holder has demonstrated the knowledge, practical understanding, and professional standards established by 1A HK International.",
      110,
      doc.y,
      {
        width: doc.page.width - 220,
        align: "center",
        lineGap: 3,
      },
    );

  if (data.grade || (data.score !== undefined && data.score !== null)) {
    doc.moveDown(0.5);
    const scoreText = data.grade
      ? `Grade: ${data.grade}`
      : `Score: ${data.score}%`;
    doc.fontSize(16).fillColor("#666").text(scoreText, { align: "center" });
  }

  if (data.courseCode || data.durationText) {
    doc.moveDown(0.3);
    const bits = [
      data.courseCode && `Course Code: ${data.courseCode}`,
      data.durationText && `Duration: ${data.durationText}`,
    ]
      .filter(Boolean)
      .join("    •    ");
    doc.fontSize(10).fillColor("#888").text(bits, { align: "center" });
  }

  // ── Footer ──

  if (data.hasExpiry && data.expiryDateText) {
    doc.moveDown(0.2);
    doc
      .fontSize(10)
      .fillColor("#999")
      .text(`Valid Until: ${data.expiryDateText}`, { align: "center" });
  }

  // ── Signature line ──
  const signY = doc.page.height - 145;

  const signX = 140;

  if (data.signatureImageBuffer) {
    try {
      doc.image(data.signatureImageBuffer, signX - 15, signY - 70, {
        width: 150,
      });
    } catch {}
  }

  doc
    .moveTo(signX - 5, signY)
    .lineTo(signX + 110, signY)
    .stroke("#333");

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#333")
    .text(BRAND.signatoryName, signX - 15, signY + 8, {
      width: 140,
      align: "center",
    });

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#666")
    .text(BRAND.signatoryTitle, signX - 15, signY + 24, {
      width: 140,
      align: "center",
    });
  // ── Accreditation strip (bottom-left, only if an AO resolved for the course) ──
  if (data.aoName) {
    if (data.aoLogoBuffer) {
      try {
        doc.image(data.aoLogoBuffer, 55, doc.page.height - 105, { width: 36 });
      } catch {
        /* ignore */
      }
    }
    doc
      .fontSize(9)
      .fillColor("#888")
      .text(`Accredited by ${data.aoName}`, 55, doc.page.height - 60, {
        width: 230,
      });
  }

  // ── QR code (bottom-right, links to public verification page) ──
  // ── QR Code + Verification Details ───────────────────────────────
  if (data.qrImageBuffer) {
    try {
      const qrSize = 82;

      const qrX = doc.page.width - 250;
      const qrY = doc.page.height - 200;

      // QR Image
      doc.image(data.qrImageBuffer, qrX, qrY, {
        width: qrSize,
      });

      // Scan text
      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor("#555")
        .text("Scan to Verify", qrX - 6, qrY + qrSize + 5, {
          width: 95,
          align: "center",
        });

      // Certificate Number
      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor("#777")
        .text(
          `Certificate No.\n${data.certificateNumber}`,
          qrX - 12,
          qrY + qrSize + 20,
          {
            width: 105,
            align: "center",
          },
        );

      // Issue Date
      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor("#777")
        .text(`Issued\n${data.issuedDate}`, qrX - 12, qrY + qrSize + 46, {
          width: 105,
          align: "center",
        });
    } catch {
      /* ignore */
    }
  }

  // ── Revoked watermark ──
  if (data.revoked) {
    doc.save();
    doc.opacity(0.22);
    doc.rotate(-28, { origin: [doc.page.width / 2, doc.page.height / 2] });
    doc
      .fontSize(90)
      .fillColor("#c62828")
      .text("REVOKED", 0, doc.page.height / 2 - 45, {
        align: "center",
        width: doc.page.width,
      });
    doc.restore();
  }
};

export default { render };
