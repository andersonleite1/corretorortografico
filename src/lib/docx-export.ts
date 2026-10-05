/** Minimal OpenXML package using Word's HTML import (altChunk).
 * Other readers may not support altChunk; the UI identifies Word compatibility.
 * Reference: Microsoft Learn, DocumentFormat.OpenXml.Wordprocessing.AltChunk.
 * ZIP uses the store method so no new compression dependency is needed.
 */
const DOCX_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const encoder = new TextEncoder();
function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function zip(parts: Record<string, string>): Blob {
  const files: Uint8Array[] = [],
    directory: Uint8Array[] = [];
  let offset = 0;
  for (const [path, text] of Object.entries(parts)) {
    const name = encoder.encode(path),
      data = encoder.encode(text),
      crc = crc32(data);
    const local = new Uint8Array(30 + name.length);
    const view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0x800, true);
    view.setUint16(12, 33, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, data.length, true);
    view.setUint32(22, data.length, true);
    view.setUint16(26, name.length, true);
    local.set(name, 30);
    const central = new Uint8Array(46 + name.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x800, true);
    cv.setUint16(14, 33, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    central.set(name, 46);
    files.push(local, data);
    directory.push(central);
    offset += local.length + data.length;
  }
  const end = new Uint8Array(22),
    view = new DataView(end.buffer);
  const count = directory.length,
    directorySize = directory.reduce((size, part) => size + part.length, 0);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, count, true);
  view.setUint16(10, count, true);
  view.setUint32(12, directorySize, true);
  view.setUint32(16, offset, true);
  return new Blob(
    [...files, ...directory, end].map((part) => part.slice().buffer),
    { type: DOCX_TYPE },
  );
}
export function createWordDocument(html: string, title: string): Blob {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  parsed
    .querySelectorAll("script,iframe,object,embed,form")
    .forEach((node) => node.remove());
  parsed.querySelectorAll("*").forEach((node) => {
    for (const attribute of Array.from(node.attributes)) {
      if (
        attribute.name.startsWith("on") ||
        (["href", "src"].includes(attribute.name) &&
          /^\s*javascript:/i.test(attribute.value))
      )
        node.removeAttribute(attribute.name);
    }
  });
  const escapedTitle = title.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[char] || char,
  );
  const documentHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapedTitle}</title><style>body{font-family:Arial,sans-serif;font-size:12pt;line-height:1.6}table{border-collapse:collapse;width:100%}td,th{border:1px solid #888;padding:6px}img{max-width:100%}.has-text-align-center{text-align:center}.has-text-align-right{text-align:right}.has-text-align-justify{text-align:justify}pre,code{font-family:monospace}</style></head><body>${parsed.body.innerHTML}</body></html>`;
  return zip({
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/content.html" ContentType="text/html"/></Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
    "word/document.xml": `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body><w:altChunk r:id="htmlContent"/><w:p/><w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`,
    "word/_rels/document.xml.rels": `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="htmlContent" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/aFChunk" Target="content.html" TargetMode="Internal"/></Relationships>`,
    "word/content.html": documentHtml,
  });
}
