import { rgb } from "pdf-lib";

import { RenderContext } from "../context";
import { loadFonts } from "./fonts";
import {
  cleanText,
  drawCenteredText,
} from "./template-text";
import type {
  Artboard,
  TemplateItem,
} from "./types";
import { loadTemplate } from "../template-reader";
import { render_text } from "./renderers/render-text";
import { render_score } from "./renderers/render-score";
import { render_single_image } from "./renderers/render-single-image";
import { render_qr } from "./renderers/render-qr";
import { render_gallery } from "./renderers/render-gallery";
import { render_materials } from "./renderers/render-materials";
import { render_amenities } from "./renderers/render-amenities";
import { loadTemplatePage } from "../templates";

export async function renderEditorialPage(
  ctx: RenderContext,
  pageNumber: number,
) {
  const pdfTemplate = await loadTemplatePage(
    ctx.pdf,
    pageNumber,
  );

  const template = await loadTemplate(
    pageNumber,
  );

  console.log("NEW PAGE SIZE:", pdfTemplate.width, pdfTemplate.height);

  const page = ctx.pdf.addPage([
    pdfTemplate.width,
    pdfTemplate.height,
  ]);

  page.drawPage(pdfTemplate);

  switch (pageNumber) {
    case 1:
      await renderPage1(ctx, page, template);
      break;

    case 2:
      await renderPage2(ctx, page, template);
      break;

    case 3:
      await renderPage3(ctx, page, template);
      break;

    case 4:
      await renderPage4(ctx, page, template);
      break;

    case 5:
      await renderPage5(ctx, page, template);
      break;

    case 6:
      await renderPage6(ctx, page, template);
      break;

    case 7:
      await renderPage7(ctx, page, template);
      break;

    case 8:
      await renderPage8(ctx, page, template);
      break;

    case 9:
      await renderPage9(ctx, page, template);
      break;
  }

  return page;
}



async function renderPage1(
  ctx: RenderContext,
  page: any,
  template: any,
) {
  await render_text(
    ctx,
    page,
    template,
    true,
  );

  await render_single_image(
    ctx,
    page,
    template,
    "cover",
  );
}

async function renderPage2(
  ctx: RenderContext,
  page: any,
  template: any,
) {
  await render_text(
    ctx,
    page,
    template,
  );

  await render_single_image(
    ctx,
    page,
    template,
    "architecture",
  );
}

async function renderPage3(
  ctx: RenderContext,
  page: any,
  template: any,
) {
  await render_text(
    ctx,
    page,
    template,
  );

  await render_gallery(
    ctx,
    page,
    template,
    "spaces",
    [
      "Foto 1",
      "Foto 2",
      "Foto 3",
      "Foto 4",
    ],
  );
}

async function renderPage4(
  ctx: RenderContext,
  page: any,
  template: any,
) {
  await render_text(
    ctx,
    page,
    template,
  );

  await render_materials(
    ctx,
    page,
    template,
  );
}

async function renderPage5(
  ctx: RenderContext,
  page: any,
  template: any,
) {
  await render_amenities(
    ctx,
    page,
    template,
  );
}

async function renderPage6(
  ctx: RenderContext,
  page: any,
  template: any,
) {
  await render_gallery(
    ctx,
    page,
    template,
    "spaces",
    [
      "Foto 1",
      "Foto 2",
      "Foto 3",
      "Foto 4",
    ],
  );
}

async function renderPage7(
  ctx: RenderContext,
  page: any,
  template: any,
) {
  await render_text(
    ctx,
    page,
    template,
  );

  await render_single_image(
    ctx,
    page,
    template,
    "destination",
  );
}

async function renderPage8(
  ctx: RenderContext,
  page: any,
  template: any,
) {
  await render_text(
    ctx,
    page,
    template,
  );

  await render_single_image(
    ctx,
    page,
    template,
    "investment",
  );
}

async function renderPage9(
  ctx: RenderContext,
  page: any,
  template: any,
) {
  await render_text(
    ctx,
    page,
    template,
  );

  await render_score(
    ctx,
    page,
    template,
  );

  await render_single_image(
    ctx,
    page,
    template,
    "contact",
  );

  await render_qr(
    ctx,
    page,
    template,
  );
}
