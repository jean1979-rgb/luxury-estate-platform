import type {PDFFont,PDFPage,RGB} from "pdf-lib";
import {drawPemFooter} from "./editorial-shared";

type Params={
 page:PDFPage;
 width:number;
 height:number;

 fonts:{
  regular:PDFFont;
  bold:PDFFont;
  serif:PDFFont;
  serifBold:PDFFont;
 };

 colors:{
  black:RGB;
  white:RGB;
  gold:RGB;
  muted:RGB;
  line:RGB;
 };
};

export function drawEditorialContact({
 page,
 width,
 height,
 fonts,
 colors
}:Params){

const {regular,bold,serif}=fonts;
const {black,white,gold,muted,line}=colors;

page.drawRectangle({
 x:0,
 y:0,
 width,
 height,
 color:black
});

page.drawRectangle({
 x:26,
 y:26,
 width:width-52,
 height:height-52,
 borderColor:line,
 borderWidth:0.45
});

page.drawText(
"PRIVATE ESTATES MEXICO",
{
 x:44,
 y:height-72,
 size:8,
 font:bold,
 color:gold
}
);

page.drawText(
"Private Inquiry",
{
 x:44,
 y:height-122,
 size:32,
 font:serif,
 color:white
}
);

page.drawLine({
 start:{x:44,y:height-145},
 end:{x:width-44,y:height-145},
 thickness:0.7,
 color:gold
});

page.drawText(
"PRIVATE ESTATES MEXICO",
{
 x:44,
 y:560,
 size:15,
 font:serif,
 color:white
}
);

page.drawText(
"Editorial Collection",
{
 x:44,
 y:530,
 size:11,
 font:regular,
 color:muted
}
);

page.drawText(
"privateestatesmexico.com",
{
 x:44,
 y:470,
 size:11,
 font:regular,
 color:white
}
);

page.drawText(
"info@privateestatesmexico.com",
{
 x:44,
 y:440,
 size:11,
 font:regular,
 color:white
}
);

page.drawText(
"Request a private presentation",
{
 x:44,
 y:380,
 size:10,
 font:regular,
 color:muted
}
);

drawPemFooter({
 page,
 width,
 regular,
 gold,
 line
});

}
