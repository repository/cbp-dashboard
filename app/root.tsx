import { Global, css } from "@emotion/react";
import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import reset from "@unocss/reset/tailwind.css";
import { useEffect } from "react";
import useLocalStorageState from "use-local-storage-state";
import kometBold from "~/fonts/KometBold.woff2";
import kometBoldItalic from "~/fonts/KometBoldItalic.woff2";
import kometMedium from "~/fonts/KometMedium.woff2";
import kometMediumItalic from "~/fonts/KometMediumItalic.woff2";
import kometRegular from "~/fonts/KometRegular.woff2";
import kometRegularItalic from "~/fonts/KometRegularItalic.woff2";
import mono45HeadlineLight from "~/fonts/Mono45HeadlineLight.woff2";
import mono45HeadlineRegular from "~/fonts/Mono45HeadlineRegular.woff2";
import unocss from "~/styles/uno.css";
import type { Team } from "./processing";
import { useLSTeams } from "./utils/local-storage";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: reset },
  { rel: "stylesheet", href: unocss },
];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "CyberPatriot Dashboard",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  const [legacyTeams, , { removeItem: removeLegacyTeams }] = useLocalStorageState<Team[]>("teams");
  const [, setTeams] = useLSTeams();

  useEffect(() => {
    if (legacyTeams) {
      setTeams(legacyTeams);
      removeLegacyTeams();
    }
  }, [legacyTeams, removeLegacyTeams, setTeams]);

  return (
    <html lang="en" className="font-sans">
      <head>
        <Meta />
        <Links />
        <Global
          styles={css([
            {
              "@font-face": {
                fontFamily: "Komet",
                src: `url(${kometRegular}) format('woff2')`,
                fontWeight: 400,
                fontStyle: "normal",
              },
            },
            {
              "@font-face": {
                fontFamily: "Komet",
                src: `url(${kometRegularItalic}) format('woff2')`,
                fontWeight: 400,
                fontStyle: "italic",
              },
            },
            {
              "@font-face": {
                fontFamily: "Komet",
                src: `url(${kometMedium}) format('woff2')`,
                fontWeight: 500,
                fontStyle: "normal",
              },
            },
            {
              "@font-face": {
                fontFamily: "Komet",
                src: `url(${kometMediumItalic}) format('woff2')`,
                fontWeight: 500,
                fontStyle: "italic",
              },
            },
            {
              "@font-face": {
                fontFamily: "Komet",
                src: `url(${kometBold}) format('woff2')`,
                fontWeight: 700,
                fontStyle: "normal",
              },
            },
            {
              "@font-face": {
                fontFamily: "Komet",
                src: `url(${kometBoldItalic}) format('woff2')`,
                fontWeight: 700,
                fontStyle: "italic",
              },
            },
            {
              "@font-face": {
                fontFamily: "Mono45 Headline",
                src: `url(${mono45HeadlineLight}) format('woff2')`,
                fontWeight: 300,
                fontStyle: "normal",
              },
            },
            {
              "@font-face": {
                fontFamily: "Mono45 Headline",
                src: `url(${mono45HeadlineRegular}) format('woff2')`,
                fontWeight: 400,
                fontStyle: "normal",
              },
            },
            {
              ".text-transition.bs-team-name > div": {
                maxWidth: "60rem",
                height: "fit-content",
                // overflowWrap: "break-word",
                // height: "9rem",
              },
            },
          ])}
        />
      </head>
      <body className="bg-slate-50">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
