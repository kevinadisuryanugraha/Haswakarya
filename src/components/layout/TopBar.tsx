import React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  Mail,
  MapPin,
  MessageSquare,
  Printer,
  ShieldCheck,
} from "lucide-react";
import {
  TOP_BAR,
  TOP_BAR_REVEAL,
  type TopBarItemId,
  type TopBarLink,
  type TopBarTone,
} from "@/data/siteTopBar";
import { cn } from "@/lib/utils";

/**
 * TopBar Perusahaan Maritim Haswakarya.
 *
 * Arsitektur Anti-Tabrakan:
 * - Terbagi menjadi DUA ZONA TEGAS (Zone Left = Kontak, Zone Right = Kredensial & Status).
 * - TIDAK menggunakan 3-elemen justify-between yang dapat memicu tabrakan di tengah.
 * - Zone Left diikat di sisi kiri, Zone Right diikat di sisi kanan dengan gap pengaman.
 * - Tangga reveal menyembunyikan item sekunder (Fax & Hubs) pada layar laptop/desktop standar (< 1536px)
 *   sehingga selalu ada ruang kosong minimal 200px di tengah.
 */

const ICONS: Partial<Record<TopBarItemId, LucideIcon>> = {
  whatsapp: MessageSquare,
  email: Mail,
  fax: Printer,
  nib: ShieldCheck,
  mlc: Award,
  hubs: MapPin,
};

const TONE: Record<TopBarTone, string> = {
  emerald: "text-emerald-400",
  sky: "text-sky-400",
  slate: "text-slate-400",
  amber: "text-amber-400",
  accent: "text-accent",
  none: "",
};

const ITEM_BASE =
  "inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium leading-4 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy";
const ITEM_INTERACTIVE = "text-slate-300 transition-colors hover:text-white";
const ITEM_STATIC = "text-slate-400";
const DIVIDER = "h-3 w-px shrink-0 bg-white/20";

function ItemValue({ item }: { item: TopBarLink }) {
  if (item.id === "nib") {
    return (
      <>
        <span className="text-slate-400">{item.label}</span>
        <strong className="font-semibold tracking-wide text-white">
          {item.value}
        </strong>
      </>
    );
  }

  if (item.id === "email") {
    return (
      <span className="font-medium text-slate-200">
        {item.value}
      </span>
    );
  }

  if (item.id === "mlc") {
    return (
      <span>{item.value}</span>
    );
  }

  return (
    <>
      {item.label ? <span className="font-semibold text-white">{item.label}</span> : null}
      <span className="font-medium text-slate-200">{item.value}</span>
    </>
  );
}

function StripItem({ item }: { item: TopBarLink }) {
  const Icon = ICONS[item.id];
  const interactive = Boolean(item.href);
  const className = cn(
    ITEM_BASE,
    interactive ? ITEM_INTERACTIVE : ITEM_STATIC,
  );

  const content = (
    <>
      {Icon ? (
        <Icon
          aria-hidden="true"
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            TONE[item.tone],
            interactive && "transition-transform group-hover:scale-110",
          )}
        />
      ) : null}
      <ItemValue item={item} />
    </>
  );

  if (!item.href) {
    return (
      <span className={className} title={item.title}>
        {content}
      </span>
    );
  }

  const shared = {
    className: cn(className, "group"),
    title: item.title,
    "aria-label": item.ariaLabel,
  };

  if (item.href.startsWith("/")) {
    return (
      <Link href={item.href} {...shared}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={item.href}
      {...shared}
      {...(item.external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {content}
    </a>
  );
}

function StripList({
  items,
  className,
}: {
  items: TopBarLink[];
  className?: string;
}) {
  return (
    <ul className={cn("flex items-center", className)}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 ? (
            <li
              aria-hidden="true"
              className={cn("mx-2 sm:mx-3 h-3 w-px bg-white/20 shrink-0", TOP_BAR_REVEAL[item.id])}
            />
          ) : null}
          <li
            data-topbar-item={item.id}
            className={cn("items-center shrink-0", TOP_BAR_REVEAL[item.id])}
          >
            <StripItem item={item} />
          </li>
        </React.Fragment>
      ))}
    </ul>
  );
}

export const TopBar: React.FC = () => {
  return (
    <aside
      aria-label="Corporate quick contacts and compliance credentials"
      className="w-full border-b border-white/10 bg-[#06122A] text-[11px] font-medium leading-4 text-slate-300 select-none"
    >
      <div className="site-container py-1.5 lg:py-2 flex items-center justify-between gap-4">
        {/* Zone Kiri: Kontak Resmi Perusahaan */}
        <div className="flex items-center shrink-0 min-w-0">
          <StripList items={TOP_BAR.contacts} />
        </div>

        {/* Zone Kanan: Kredensial SIUKAK, MLC, Hubs & Status Operasional */}
        <div className="flex items-center shrink-0">
          <StripList items={TOP_BAR.credentials} />

          <span
            aria-hidden="true"
            className={cn("mx-2 sm:mx-3 h-3 w-px bg-white/20 shrink-0", TOP_BAR_REVEAL.status)}
          />

          {/* Status Operasional GMT+7 Active */}
          <div
            data-topbar-item="status"
            title={TOP_BAR.status.title}
            className={cn(
              "items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/70 px-2.5 py-0.5 font-mono text-[10px] font-medium leading-4 tracking-wide text-emerald-300 shrink-0",
              TOP_BAR_REVEAL.status,
            )}
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 motion-safe:animate-pulse"
            />
            <span>{TOP_BAR.status.value}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default TopBar;
