import { defineConfig, presetUno, presetWebFonts } from "unocss";

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
  ],
  shortcuts: {
    "skeleton-nr": "bg-slate-200 animate-pulse",
    skeleton: "skeleton-nr rounded-md",
  },
});
