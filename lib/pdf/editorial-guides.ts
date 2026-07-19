import type { PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";

/*
 * CAMBIAR A false CUANDO EL PDF ESTÉ TERMINADO.
 */
export const SHOW_PDF_GUIDES = true;

export function drawPdfGuides(
  page: PDFPage,
  width: number,
  height: number
) {
  if (!SHOW_PDF_GUIDES) return;

  const verticalColor = rgb(0, 0.85, 1);
  const horizontalColor = rgb(1, 0.15, 0.65);
  const centerColor = rgb(0.2, 1, 0.25);

  const verticals = [
    10,       // marco exterior izquierdo
    34,       // margen de contenido izquierdo
    width / 2,
    385,      // división principal portada
    420,      // inicio bloque score
    480.5,    // centro exacto score y laureles
    540,      // final bloque score
    width - 10,
  ];

  const horizontals = [
    10,
    67,
    92,
    105,
    145,      // / 100
    181,      // 100 principal
    247,      // LUXURY SCORE
    286,
    300,
    335,
    height - 390,
    height - 285,
    height - 170,
    height - 10,
  ];

  for (const x of verticals) {
    page.drawLine({
      start: { x, y: 0 },
      end: { x, y: height },
      thickness: x === width / 2 || x === 480.5 ? 0.8 : 0.35,
      color: x === width / 2 || x === 480.5 ? centerColor : verticalColor,
      opacity: 0.75,
    });
  }

  for (const y of horizontals) {
    page.drawLine({
      start: { x: 0, y },
      end: { x: width, y },
      thickness: 0.35,
      color: horizontalColor,
      opacity: 0.65,
    });
  }
}
