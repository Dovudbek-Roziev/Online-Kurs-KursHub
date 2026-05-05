const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

function findSystemFont(filename) {
  const dirs = [
    process.env.WINDIR ? path.join(process.env.WINDIR, "Fonts") : null,
    "C:/Windows/Fonts",
    "/usr/share/fonts/truetype/dejavu",
    "/usr/share/fonts/dejavu",
    "/usr/share/fonts/truetype/msttcorefonts",
    "/usr/share/fonts/truetype/liberation",
    "/usr/share/fonts/TTF",
  ].filter(Boolean);
  for (const dir of dirs) {
    try {
      const full = path.join(dir, filename);
      if (fs.existsSync(full)) return full;
    } catch {}
  }
  return null;
}

function diamond(doc, cx, cy, size, color) {
  doc
    .moveTo(cx, cy - size)
    .lineTo(cx + size, cy)
    .lineTo(cx, cy + size)
    .lineTo(cx - size, cy)
    .closePath()
    .fill(color);
}

function buildCertificateBuffer({ userName, courseTitle, completionDate, certificateId }) {
  return new Promise((resolve, reject) => {
    const W = 841.89;
    const H = 595.28;

    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
    const chunks = [];
    doc.on("data", c => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const rFont = findSystemFont("arial.ttf") ||
                  findSystemFont("DejaVuSans.ttf") ||
                  findSystemFont("LiberationSans-Regular.ttf");
    const bFont = findSystemFont("arialbd.ttf") ||
                  findSystemFont("DejaVuSans-Bold.ttf") ||
                  findSystemFont("LiberationSans-Bold.ttf");
    if (rFont) doc.registerFont("FR", rFont);
    if (bFont) doc.registerFont("FB", bFont);
    const fR = rFont ? "FR" : "Helvetica";
    const fB = bFont ? "FB" : "Helvetica-Bold";

    // ── Palette ────────────────────────────────────────────────────────────
    const NAVY  = "#1B2A4A";
    const GOLD  = "#C9A451";
    const GOLD2 = "#E8C87A";
    const BG    = "#FDFCF7";
    const GRAY  = "#6B7280";
    const WHITE = "#FFFFFF";
    const SEAL  = "#F9F5E8";

    // ── Background ─────────────────────────────────────────────────────────
    doc.rect(0, 0, W, H).fill(BG);

    // ── Outer & inner borders ───────────────────────────────────────────────
    doc.rect(18, 18, W - 36, H - 36).lineWidth(3.5).stroke(GOLD);
    doc.rect(29, 29, W - 58, H - 58).lineWidth(0.8).stroke(GOLD);

    // Corner diamonds
    [[18, 18], [W - 18, 18], [18, H - 18], [W - 18, H - 18]].forEach(([cx, cy]) =>
      diamond(doc, cx, cy, 9, GOLD)
    );
    // Mid-border diamonds
    [[W / 2, 18], [W / 2, H - 18], [18, H / 2], [W - 18, H / 2]].forEach(([cx, cy]) =>
      diamond(doc, cx, cy, 5, GOLD)
    );

    // ── Header band ────────────────────────────────────────────────────────
    doc.rect(29, 29, W - 58, 88).fill(NAVY);

    doc.font(fB).fontSize(9.5).fillColor(GOLD2)
      .text("KursHub · ОБРАЗОВАТЕЛЬНАЯ ПЛАТФОРМА", 29, 42, {
        width: W - 58, align: "center", characterSpacing: 3,
      });

    doc.font(fB).fontSize(29).fillColor(WHITE)
      .text("С Е Р Т И Ф И К А Т", 29, 64, {
        width: W - 58, align: "center",
      });

    // ── Divider ornament ───────────────────────────────────────────────────
    const MX = W / 2;
    const divY = 135;
    doc.moveTo(88, divY).lineTo(MX - 30, divY).lineWidth(1).stroke(GOLD);
    doc.moveTo(MX + 30, divY).lineTo(W - 88, divY).lineWidth(1).stroke(GOLD);
    diamond(doc, MX, divY, 8, GOLD);

    // ── Body ───────────────────────────────────────────────────────────────
    doc.font(fR).fontSize(13).fillColor(GRAY)
      .text("Настоящий сертификат подтверждает, что", 0, 153, {
        width: W, align: "center",
      });

    // Name
    doc.font(fB).fontSize(40).fillColor(NAVY);
    const nameW = Math.min(doc.widthOfString(userName), W - 180);
    doc.text(userName, 80, 178, { width: W - 160, align: "center" });

    // Underline
    const ulY = 238;
    doc.moveTo((W - nameW) / 2, ulY)
      .lineTo((W + nameW) / 2, ulY)
      .lineWidth(1.5).stroke(GOLD);

    doc.font(fR).fontSize(13).fillColor(GRAY)
      .text("успешно завершил(а) обучение по курсу", 0, 253, {
        width: W, align: "center",
      });

    // Course title
    doc.font(fB).fontSize(20).fillColor(NAVY)
      .text(`«${courseTitle}»`, 90, 278, {
        width: W - 180, align: "center",
      });

    // ── Bottom divider ─────────────────────────────────────────────────────
    const botY = 453;
    doc.moveTo(68, botY).lineTo(W - 68, botY).lineWidth(0.7).stroke(GOLD);

    // ── Date (left) ────────────────────────────────────────────────────────
    doc.font(fB).fontSize(8).fillColor(GOLD)
      .text("ДАТА ВЫДАЧИ", 90, botY + 13, { characterSpacing: 2 });
    doc.font(fB).fontSize(14).fillColor(NAVY)
      .text(completionDate, 90, botY + 29);

    // ── Seal (center) ──────────────────────────────────────────────────────
    const sX = W / 2, sY = botY + 44;
    doc.circle(sX, sY, 41).lineWidth(2).stroke(GOLD);
    doc.circle(sX, sY, 31).lineWidth(0.7).stroke(GOLD);
    doc.circle(sX, sY, 29).fill(SEAL);
    doc.circle(sX, sY, 5).fill(GOLD);

    doc.font(fB).fontSize(6.5).fillColor(GOLD)
      .text("ОФИЦИАЛЬНЫЙ ДОКУМЕНТ", sX - 27, sY - 15, {
        width: 54, align: "center",
      });
    if (certificateId) {
      doc.font(fR).fontSize(5.5).fillColor(NAVY)
        .text(`ID: ${certificateId}`, sX - 27, sY + 6, {
          width: 54, align: "center",
        });
    }

    // ── Signature (right) ──────────────────────────────────────────────────
    const sigX = W - 215;
    doc.moveTo(sigX, botY + 49).lineTo(W - 88, botY + 49)
      .lineWidth(0.7).stroke(GRAY);
    doc.font(fB).fontSize(8).fillColor(GOLD)
      .text("ДИРЕКТОР ПЛАТФОРМЫ", sigX, botY + 55, {
        width: W - 88 - sigX, align: "center", characterSpacing: 1.5,
      });

    // ── Footer ─────────────────────────────────────────────────────────────
    doc.font(fR).fontSize(7.5).fillColor(GRAY)
      .text(
        "Данный документ является официальным подтверждением успешного прохождения онлайн-курса на образовательной платформе.",
        90, H - 40, { width: W - 180, align: "center" }
      );

    doc.end();
  });
}

module.exports = { buildCertificateBuffer };
