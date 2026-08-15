import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { getTemplate } from "./certificateTemplates/index.js";
import fetchImageBuffer from "./certificateTemplates/fetchImageBuffer.js";

/**
 * Generate a certificate PDF and return it as a Buffer.
 *
 * This is the single pluggable entry point for all certificate PDF
 * rendering — issuance, regenerate, and download all call this. It owns
 * fetching the QR code / logo assets and handing the drawing to the
 * selected template (server/src/services/certificateTemplates/).
 *
 * @param {Object} data
 * @param {string} data.studentName
 * @param {string} data.courseName
 * @param {string} data.certificateNumber
 * @param {string} data.issuedDate
 * @param {string} [data.grade]
 * @param {number} [data.score]
 * @param {string} [data.templateKey] - "classic" | "modern" | "accredited"
 * @param {string} [data.verifyUrl] - public verification URL to embed as a QR code
 * @param {string} [data.hkLogoUrl] - org wordmark image URL (best-effort fetch)
 * @param {string} [data.aoName] - resolved accrediting body name
 * @param {string} [data.aoLogoUrl] - resolved accrediting body logo URL (best-effort fetch)
 * @param {string} [data.courseCode]
 * @param {string} [data.durationText]
 * @param {boolean} [data.hasExpiry]
 * @param {string} [data.expiryDateText]
 * @param {boolean} [data.revoked]
 * @returns {Promise<Buffer>}
 */
const generateCertificatePDF = async (data) => {
  const template = getTemplate(data.templateKey);

  // Best-effort asset fetches — never let a slow/broken logo URL fail
  // certificate generation. Run in parallel.
  const [qrImageBuffer, hkLogoBuffer, aoLogoBuffer, signatureImageBuffer] =
    await Promise.all([
      data.verifyUrl
        ? QRCode.toBuffer(data.verifyUrl, {
            margin: 1,
            width: 240,
          }).catch(() => null)
        : Promise.resolve(null),

      fetchImageBuffer(data.hkLogoUrl),

      fetchImageBuffer(data.aoLogoUrl),

      fetchImageBuffer(data.signatureUrl),
    ]);

  return new Promise((resolve, reject) => {
    try {
      // Bottom margin kept small on purpose: templates place footer elements
      // (signature line, QR code, accreditation strip) using absolute
      // coordinates close to the page edge. PDFKit auto-inserts a new page
      // if a text/image draw would cross the margin boundary, even when
      // given explicit x/y — a larger bottom margin was silently producing
      // blank trailing pages once QR/AO footer elements were added.
      const doc = new PDFDocument({
        size: "A4",
        layout: "portrait",
        margins: { top: 50, bottom: 18, left: 50, right: 50 },
      });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      template.render(doc, {
        ...data,
        qrImageBuffer,
        hkLogoBuffer,
        aoLogoBuffer,
        signatureImageBuffer,
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export default generateCertificatePDF;
