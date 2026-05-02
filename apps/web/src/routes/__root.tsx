import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@wallzapp/ui/components/sonner";

import { ThemeProvider } from "../components/theme-provider";

import "../index.css";

export type RouterAppContext = Record<string, never>;

function RootComponent() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isGameRoute = pathname === "/";

  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <Outlet />
        <Toaster richColors />
      </ThemeProvider>
      {isGameRoute ? null : <TanStackRouterDevtools position="bottom-left" />}
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
