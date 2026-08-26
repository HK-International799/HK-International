/**
 * csvExport
 *
 * Minimal, dependency-free multi-section CSV builder used by the Complete
 * Candidate History Export. The existing `exportRegistrationsCSV`
 * (adminController.js) already builds CSV manually rather than via the
 * `json2csv` package that is listed as a dependency but not actually used
 * anywhere — this follows that same established, working pattern rather
 * than introducing a new one, but adds proper value escaping (the
 * existing implementation just does `Object.values(r).join(",")`, which
 * breaks on any value containing a comma, quote, or newline — candidate
 * remarks/feedback fields can contain any of these).
 */

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return "";
  const str = value instanceof Date ? value.toISOString() : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const rowsToCsv = (rows) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.map(escapeCsvValue).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsvValue(row[h])).join(","));
  }
  return lines.join("\r\n");
};

/**
 * Builds a single CSV document from multiple named sections, each with its
 * own header row. Sections with zero rows still emit a section title and
 * an empty-state line, so "no data" is explicit rather than a silently
 * missing section.
 *
 * @param {{title: string, rows: object[]}[]} sections
 */
export const toCsv = (sections) => {
  const blocks = sections.map(({ title, rows }) => {
    const heading = `## ${title}`;
    if (!rows || !rows.length) {
      return `${heading}\r\n(No records)`;
    }
    return `${heading}\r\n${rowsToCsv(rows)}`;
  });
  return blocks.join("\r\n\r\n");
};

export default { toCsv };
