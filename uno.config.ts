import { defineConfig, presetUno, presetWebFonts } from "unocss";
import { presetScrollbar } from "unocss-preset-scrollbar";

export default defineConfig({
  presets: [
    presetUno(),
    presetWebFonts({
      provider: "none",
      fonts: {
        sans: "Komet",
        m45: "Mono45 Headline",
      },
    }),
    presetScrollbar({}),
  ],
  shortcuts: {
    "skeleton-nr": "bg-slate-200 animate-pulse",
    skeleton: "skeleton-nr rounded-md",
  },
});
