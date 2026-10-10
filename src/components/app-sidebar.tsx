"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ComponentType, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileUp,
  LibraryBig,
  Settings2,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/use-sidebar-store";
import { ChatAmbientGlow } from "@/components/chat/chat-ambient-glow";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type NavigationItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const navigationItems: NavigationItem[] = [
  { href: "/", label: "챗봇", icon: Bot },
  { href: "/upload", label: "문서 업로드", icon: FileUp },
  { href: "/knowledge", label: "지식카드", icon: LibraryBig },
];

const SIDEBAR_WIDTH = {
  collapsed: 72,
  expanded: 240,
} as const;

const labelClassName =
  "whitespace-nowrap transition-opacity duration-150 ease-out motion-reduce:transition-none";

function SidebarRowContent({
  icon: Icon,
  label,
  collapsed,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  collapsed: boolean;
}) {
  return (
    <>
      <Icon className="size-5 shrink-0" aria-hidden />
      <span
        className={cn(
          "min-w-0 truncate",
          labelClassName,
          collapsed && "pointer-events-none opacity-0",
          "max-md:opacity-0",
        )}
      >
        {label}
      </span>
    </>
  );
}

function SidebarLink({
  item,
  collapsed,
  active,
}: {
  item: NavigationItem;
  collapsed: boolean;
  active: boolean;
}) {
  const link = (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex h-11 w-full cursor-pointer items-center gap-2.5 overflow-hidden rounded-xl py-0 pl-3.5 pr-3 text-sm font-medium text-zinc-500 transition-[background-color,color,transform] duration-200 hover:bg-zinc-100 hover:text-zinc-950 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/45",
        active && "bg-emerald-50 text-emerald-950",
      )}
    >
      <SidebarRowContent icon={item.icon} label={item.label} collapsed={collapsed} />
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const collapsed = useSidebarStore((state) => state.collapsed);
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);
  const reducedMotion = useReducedMotion();
  const isChatRoute = pathname === "/";
  const usesAmbientGlow = pathname === "/" || pathname.startsWith("/upload");

  return (
    <div
      style={
        {
          "--sidebar-collapsed-width": `${SIDEBAR_WIDTH.collapsed}px`,
        } as CSSProperties
      }
      className={cn(
        "app-shell relative flex bg-[#f6f6f3] p-3 text-zinc-950 sm:p-4",
        isChatRoute
          ? "h-dvh overflow-hidden pr-0 sm:pr-0"
          : "min-h-dvh",
        usesAmbientGlow && "isolate",
      )}
    >
      {usesAmbientGlow && <ChatAmbientGlow />}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded,
        }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
        }
        className={cn(
          "relative z-10 flex shrink-0 flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/90 p-3 shadow-[0_18px_45px_-34px_rgba(24,36,31,0.45)] backdrop-blur-sm",
          isChatRoute
            ? "h-full"
            : "sticky top-3 h-[calc(100dvh-1.5rem)] sm:top-4 sm:h-[calc(100dvh-2rem)]",
          "max-md:!w-[var(--sidebar-collapsed-width)]",
        )}
      >
        <div className="grid h-11 grid-cols-[3rem_minmax(0,1fr)_2rem] items-center">
          <SidebarBrand
            collapsed={collapsed}
            onExpand={() => setCollapsed(false)}
            onHome={() => router.push("/")}
          />
          <span
            className={cn(
              "min-w-0 truncate pl-2 text-sm font-semibold tracking-[-0.02em]",
              labelClassName,
              collapsed && "pointer-events-none opacity-0",
              "max-md:opacity-0",
            )}
          >
            Knowledge
          </span>
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="grid size-8 cursor-pointer place-items-center justify-self-end rounded-lg text-zinc-400 transition-[background-color,color,transform] duration-200 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/45 max-md:hidden"
              aria-label="사이드바 접기"
              title="사이드바 접기"
            >
              <ChevronLeft className="size-[18px]" aria-hidden />
            </button>
          )}
        </div>

        <nav aria-label="주요 메뉴" className="mt-8 space-y-1">
          {navigationItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              active={pathname === item.href}
            />
          ))}
        </nav>

        <div className="mt-auto space-y-1 border-t border-zinc-100 pt-3">
          <SidebarUtility
            icon={CircleHelp}
            label="도움말"
            collapsed={collapsed}
            cursorDefault
          />
          <SidebarUtility
            icon={Settings2}
            label="설정"
            collapsed={collapsed}
            cursorDefault
          />
          <div className="mt-3 grid h-12 grid-cols-[3rem_minmax(0,1fr)] items-center overflow-hidden rounded-xl bg-zinc-50">
            <span className="grid size-12 place-items-center">
              <span className="grid size-7 place-items-center rounded-lg bg-emerald-100 text-[11px] font-semibold text-emerald-800">
                K
              </span>
            </span>
            <span
              className={cn(
                "min-w-0 whitespace-nowrap transition-opacity duration-150 ease-out motion-reduce:transition-none",
                collapsed && "pointer-events-none opacity-0",
                "max-md:opacity-0",
              )}
            >
              <span className="block text-xs font-medium text-zinc-800">Knowledge</span>
              <span className="block text-[11px] text-zinc-400">Workspace</span>
            </span>
          </div>
        </div>
      </motion.aside>

      <div className={cn("relative z-10 min-w-0 flex-1", isChatRoute && "min-h-0")}>{children}</div>
    </div>
  );
}

function SidebarBrand({
  collapsed,
  onExpand,
  onHome,
}: {
  collapsed: boolean;
  onExpand: () => void;
  onHome: () => void;
}) {
  return (
    <div className="grid size-12 place-items-center">
      <button
        type="button"
        onClick={collapsed ? onExpand : onHome}
        className="group relative inline-grid cursor-pointer place-items-center rounded-2xl p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/45"
        aria-label={collapsed ? "사이드바 펼치기" : "Knowledge 홈"}
        title={collapsed ? "사이드바 펼치기" : "Knowledge 홈"}
      >
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-2xl bg-zinc-950",
            collapsed &&
              "transition-[background-color] duration-300 ease-in-out group-hover:bg-zinc-100 motion-reduce:transition-none",
          )}
        />
        <Sparkles
          className={cn(
            "relative z-10 size-5 pointer-events-none text-white",
            collapsed &&
              "transition-opacity duration-300 ease-in-out group-hover:opacity-0 motion-reduce:transition-none",
          )}
          aria-hidden
        />
        <ChevronRight
          className={cn(
            "absolute z-10 size-5 pointer-events-none text-zinc-900",
            collapsed
              ? "opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100 motion-reduce:transition-none"
              : "hidden",
          )}
          aria-hidden
        />
      </button>
    </div>
  );
}

function SidebarUtility({
  icon: Icon,
  label,
  collapsed,
  cursorDefault = false,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  collapsed: boolean;
  cursorDefault?: boolean;
}) {
  const button = (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center gap-2.5 overflow-hidden rounded-xl py-0 pl-3.5 pr-3 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/45",
        cursorDefault ? "cursor-default" : "cursor-pointer",
      )}
    >
      <SidebarRowContent icon={Icon} label={label} collapsed={collapsed} />
    </button>
  );

  if (!collapsed || cursorDefault) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
