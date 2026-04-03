import PDFDocument from "pdfkit";

/**
 * Generate a certificate PDF and return it as a Buffer.
 * @param {Object} data
 * @param {string} data.studentName
 * @param {string} data.courseName
 * @param {string} data.certificateNumber
 * @param {string} data.issuedDate
 * @param {string} [data.grade]
 * @param {number} [data.score]
 * @returns {Promise<Buffer>}
 */
const generateCertificatePDF = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 50 });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // ── Border ──
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(3).stroke("#1a237e");
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).lineWidth(1).stroke("#90caf9");

      // ── Header ──
      doc.fontSize(14).fillColor("#666").text("1A HK International", 0, 60, { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(36).fillColor("#1a237e").text("Certificate of Completion", { align: "center" });

      // ── Decorative line ──
      doc.moveTo(200, 155).lineTo(doc.page.width - 200, 155).lineWidth(2).stroke("#ffc107");

      // ── Body ──
      doc.moveDown(1.5);
      doc.fontSize(14).fillColor("#333").text("This is to certify that", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(28).fillColor("#1a237e").text(data.studentName, { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(14).fillColor("#333").text("has successfully completed the course", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(22).fillColor("#333").text(`"${data.courseName}"`, { align: "center" });

      if (data.grade || data.score !== undefined) {
        doc.moveDown(0.5);
        const scoreText = data.grade
          ? `Grade: ${data.grade}`
          : `Score: ${data.score}%`;
        doc.fontSize(16).fillColor("#666").text(scoreText, { align: "center" });
      }

      // ── Footer ──
      doc.moveDown(2);
      doc.fontSize(12).fillColor("#666").text(`Certificate No: ${data.certificateNumber}`, { align: "center" });
      doc.moveDown(0.3);
      doc.text(`Date of Issue: ${data.issuedDate}`, { align: "center" });

      // ── Signature line ──
      doc.moveDown(2);
      const signY = doc.y;
      doc.moveTo(doc.page.width / 2 - 100, signY).lineTo(doc.page.width / 2 + 100, signY).stroke("#333");
      doc.fontSize(11).text("Authorized Signatory", doc.page.width / 2 - 100, signY + 5, { width: 200, align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export default generateCertificatePDF;
