// Iconos pixel-art placeholder por categoría, usados solo para sembrar
// datos de ejemplo. El usuario puede reemplazarlos por fotos reales cuando quiera.

const POT_ROWS = [
  "......KK......",
  "......KK......",
  "....LLLLLL....",
  "..LLLLLLLLLL..",
  "LLLLLLLLLLLLLL",
  "llllllllllllll",
  "HPPPPPPPPPPPPH",
  "HPPPPPPPPPPPPH",
  ".PPPPPPPPPPPP.",
  ".PPPPPPPPPPPP.",
  "..PPPPPPPPPP..",
  "..pppppppppp..",
  "...pppppppp...",
];

const BOWL_ROWS = [
  "..S........S..",
  "...S......S...",
  "..............",
  ".RRRRRRRRRRRR.",
  "RRRRRRRRRRRRRR",
  "BBBBBBBBBBBBBB",
  "BBBBBBBBBBBBBB",
  ".BBBBBBBBBBBB.",
  "..BBBBBBBBBB..",
  "...bbbbbbbb...",
  "....bbbbbb....",
  ".....bbbb.....",
  "......bb......",
];

const PLATE_ROWS = [
  "..............",
  "....PPPPPP....",
  "..PPPPPPPPPP..",
  "PPPPPPPPPPPPPP",
  "PWWWWWWWWWWWWP",
  "PWYYYYWGGGGWWP",
  "PWYYYYWGGGGWWP",
  "PWWWWWWWWWWWWP",
  "PPPPPPPPPPPPPP",
  "..pppppppppp..",
  "....pppppp....",
];

const JAR_ROWS = [
  "...LLLL...",
  "...LLLL...",
  "..llllll..",
  "..JJJJJJ..",
  ".JJJJJJJJ.",
  "JJJJJJJJJJ",
  "JSSSSSSSSJ",
  "JSSSSSSSSJ",
  "JSSSSSSSSJ",
  "JJJJJJJJJJ",
  ".jjjjjjjj.",
];

export const ICONS = {
  guisados: {
    rows: POT_ROWS,
    background: "#fbead1",
    palette: {
      K: "#6b3e26",
      L: "#d9d9e3",
      l: "#b8b8c8",
      H: "#6b3e26",
      P: "#e0693e",
      p: "#b8492c",
    },
  },
  sopas: {
    rows: BOWL_ROWS,
    background: "#ffe8df",
    palette: {
      S: "#ffffff",
      R: "#ffe9c7",
      B: "#ff6b4a",
      b: "#c94f34",
    },
  },
  guarniciones: {
    rows: PLATE_ROWS,
    background: "#eef7ea",
    palette: {
      P: "#e8e2d6",
      W: "#faf7f0",
      Y: "#ffce54",
      G: "#6ab04c",
      p: "#c7c0b0",
    },
  },
  salsas_roja: {
    rows: JAR_ROWS,
    background: "#fff6e0",
    palette: { L: "#cfd3d6", l: "#9aa0a5", J: "#eef3f5", S: "#e74c3c", j: "#b8bcc0" },
  },
  salsas_verde: {
    rows: JAR_ROWS,
    background: "#fff6e0",
    palette: { L: "#cfd3d6", l: "#9aa0a5", J: "#eef3f5", S: "#6ab04c", j: "#b8bcc0" },
  },
  salsas_adobo: {
    rows: JAR_ROWS,
    background: "#fff6e0",
    palette: { L: "#cfd3d6", l: "#9aa0a5", J: "#eef3f5", S: "#e8a53d", j: "#b8bcc0" },
  },
};
