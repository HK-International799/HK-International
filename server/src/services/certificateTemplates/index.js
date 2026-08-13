import classic from "./classic.js";
import modern from "./modern.js";
import accredited from "./accredited.js";

const templates = { classic, modern, accredited };

export const TEMPLATE_KEYS = Object.keys(templates);

/**
 * @param {string} key
 * @returns {{ render: (doc: PDFKit.PDFDocument, data: Object) => void }}
 */
export const getTemplate = (key) => templates[key] || templates.classic;

export default templates;
