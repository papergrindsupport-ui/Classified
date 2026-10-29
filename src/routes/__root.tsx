import { cardSettingsStore } from "@/lib/prefs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";

import { useEffect, type ReactNode } from "react";
import { Toaster } from "react-hot-toast";

import appCss from "../styles.css?url";
import { ThemeControls, useThemeEffect } from "@/components/ThemeControls";
import { cn } from "@/lib/utils";
import { ChevronDown, Dna, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuestionTimersClock } from "@/components/QuestionTimer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Classified — IGCSE Biology Past Papers" },
      {
        name: "description",
        content:
          "Solve, classify and track Cambridge IGCSE Biology (0610) past-paper questions by topic, lesson and year.",
      },
      { property: "og:title", content: "Classified — IGCSE Biology Past Papers" },
      {
        property: "og:description",
        content:
          "Solve, classify and track Cambridge IGCSE Biology (0610) past-paper questions by topic, lesson and year.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@100..800&family=Space+Grotesk:wght@500;600;700&family=Playpen+Sans+Arabic:wght@100..800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  // Apply the persisted theme before first paint to avoid a flash.
  const themeBootstrap = `try{var t=JSON.parse(localStorage.getItem("bp.theme")||"null")||{};document.documentElement.classList.toggle("dark",(t.mode||"dark")!=="light");document.documentElement.dataset.accent=t.accent||"pink";document.documentElement.dataset.subject=(location.pathname==="/solve-chem"||location.pathname==="/track-chem")?"chem":"bio";var c=JSON.parse(localStorage.getItem("bp.cardSettings")||"null")||{};document.documentElement.dataset.chemColor=c.chemColor===false?"off":"on";}catch(e){}`;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    document.documentElement.dataset["subject"] =
      pathname === "/solve-chem" || pathname === "/track-chem" ? "chem" : "bio";
  }, [pathname]);
  const chemColor = cardSettingsStore.useStore((s) => s.chemColor);
  useEffect(() => {
    document.documentElement.dataset["chemColor"] = chemColor ? "on" : "off";
  }, [chemColor]);
  const solveActive = pathname.startsWith("/solve");
  const trackActive = pathname.startsWith("/track");
  const linkClass = (active: boolean) =>
    cn(
      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
      active
        ? "bg-muted text-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-lg font-bold tracking-tight">Classified</span>
        </Link>
        <nav className="ml-2 flex items-center gap-1">
          {(["Solve", "Track"] as const).map((label) => (
            <DropdownMenu key={label}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={linkClass(label === "Solve" ? solveActive : trackActive)}
                >
                  {label}
                  <ChevronDown className="ml-1 size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link to={label === "Solve" ? "/solve" : "/track"}>
                    <Dna />
                    Biology
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={label === "Solve" ? "/solve-chem" : "/track-chem"}>
                    <FlaskConical />
                    Chemistry
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </nav>
        <div className="ml-auto">
          <ThemeControls />
        </div>
      </div>
    </header>
  );
}

function RootComponent() {
  useThemeEffect();
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <QuestionTimersClock />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <Toaster position="top-center" />
      </div>
    </QueryClientProvider>
  );
}
