import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { Toaster } from "@wallzapp/ui/components/sonner";

import { ThemeProvider } from "../components/theme-provider";

import "../index.css";

export type RouterAppContext = Record<string, never>;

function RootComponent() {
  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <Outlet />
        <Toaster richColors />
      </ThemeProvider>
    </>
  );
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    links: [
      {
        href: "/favicon.ico",
        rel: "icon",
      },
    ],
    meta: [
      {
        title: "wallzapp",
      },
      {
        content: "wallzapp is a web application",
        name: "description",
      },
    ],
  }),
});
