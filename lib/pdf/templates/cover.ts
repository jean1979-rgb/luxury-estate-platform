export const coverTemplate = {
  page: {
    width: 595.28,
    height: 841.89,
  },

  frame: {
    x: 10,
    y: 10,
    width: 575.28,
    height: 821.89,
  },

  photo: {
    x: 0,
    y: 305,
    width: 595.28,
    height: 405,
    mode: "contain",
  },

  logo: {
    x: 105,
    y: 636,
    width: 385,
    height: 165,
  },

  title: {
    x: 34,
    y: 258,
    width: 348,
    lineHeight: 24,
    fontSize: 23.5,
  },

  coverLabel: {
    x: 34,
    y: 306,
  },

  dividerTop: {
    x1: 34,
    y1: 292,
    x2: 205,
    y2: 292,
  },

  dividerMiddle: {
    x1: 34,
    y1: 198,
    x2: 382,
    y2: 198,
  },

  dividerVertical: {
    x1: 385,
    y1: 238,
    x2: 385,
    y2: 92,
  },

  laurel: {
    x: 410,
    y: 106,
    width: 136,
    height: 103,
  },

  score: {
    titleX: 475,
    titleY: 214,
    valueX: 475,
    valueY: 153,
    slashX: 475,
    slashY: 128,
  },

  footer: {
    x: 96,
    y: 16,
    width: 403,
    height: 34,
  },

  facts: {
    startY: 166,
    iconX: 34,
    valueX: 140,
  },
} as const;
