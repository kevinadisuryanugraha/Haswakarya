"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  X,
  ChevronDown,
  ChevronRight,
  Phone,
  Printer,
  Mail,
  ShieldCheck,
  MapPin,
  MessageSquare,
  Search,
  ExternalLink,
  Users,
  Ship,
  ArrowRight,
} from "lucide-react";
import { COMPANY_INFO, NAV_MENU_ITEMS, NavMenuItem, QUICK_SEARCH_INDEX } from "@/data/haswakarya-data";
import { resolveNavHref } from "@/lib/navigation/anchors";

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Lock body scroll when mobile drawer is open & handle ESC key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, onClose]);

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleLinkClick = () => {
    onClose();
  };

  // Quick Search results when search query is typed
  const quickSearchResults = searchQuery.trim()
    ? QUICK_SEARCH_INDEX.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Filter menu items if search query is typed
  const filteredMenuItems: NavMenuItem[] = searchQuery.trim()
    ? NAV_MENU_ITEMS.filter((item) => {
        const matchesLabel = item.label.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesChildren = item.children?.some(
          (c) =>
            c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        return matchesLabel || matchesChildren;
      })
    : NAV_MENU_ITEMS;

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 lg:hidden ${
        isOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
      }`}
      aria-modal="true"
      role="dialog"
      aria-label="Mobile Navigation Menu"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-navy/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer slide-in panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[88%] max-w-md bg-white shadow-2xl flex flex-col z-10 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-light bg-surface/80">
          <Link href={resolveNavHref("#hero", pathname)} onClick={handleLinkClick} className="flex items-center gap-2">
            <div className="relative w-36 h-11">
              <Image
                src="/images/logo-haswakarya.png"
                alt="Haswakarya Crew Agency"
                fill
                sizes="150px"
                className="object-contain object-left"
              />
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-navy hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close navigation drawer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Search inside Drawer */}
        <div className="px-5 pt-3 pb-2 border-b border-border-light bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search services, standards, offices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-border-light rounded-lg text-navy focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy text-xs font-semibold px-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {/* If searching, render Quick Search Results */}
          {searchQuery.trim() ? (
            <div className="space-y-2 py-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Search Results ({quickSearchResults.length})
              </div>
              {quickSearchResults.length > 0 ? (
                <div className="space-y-1.5">
                  {quickSearchResults.map((result, idx) => (
                    <a
                      key={`${result.title}-${idx}`}
                      href={resolveNavHref(result.href, pathname)}
                      target={result.isExternal ? "_blank" : undefined}
                      rel={result.isExternal ? "noopener noreferrer" : undefined}
                      onClick={handleLinkClick}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-ice/30 border border-slate-100 hover:border-ice transition group"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                          {result.category}
                        </span>
                        <span className="text-xs font-semibold text-navy group-hover:text-primary transition-colors truncate">
                          {result.title}
                        </span>
                      </div>
                      {result.isExternal ? (
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary shrink-0" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary shrink-0" />
                      )}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted py-6 text-center">
                  No matching services or topics found for &ldquo;{searchQuery}&rdquo;.
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Main Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pb-4 mb-3 border-b border-border-light">
                <a
                  href={resolveNavHref("#services", pathname)}
                  onClick={handleLinkClick}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-accent text-white font-bold text-xs rounded-lg uppercase tracking-wider text-center shadow-sm hover:bg-accent/90 transition"
                >
                  <Ship className="w-3.5 h-3.5" />
                  <span>Recruit Crew</span>
                </a>
                <Link
                  href="/join-as-crew"
                  onClick={handleLinkClick}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 border border-primary text-primary font-bold text-xs rounded-lg uppercase tracking-wider text-center hover:bg-primary hover:text-white transition"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Join As Crew</span>
                </Link>
              </div>

              {/* Navigation Accordion Items */}
              <nav aria-label="Mobile Navigation">
                <ul className="space-y-1">
                  {filteredMenuItems.map((item) => {
                    const hasChildren = item.children && item.children.length > 0;
                    const isExpanded = expandedSections[item.label] ?? false;

                    if (!hasChildren) {
                      return (
                        <li key={item.label}>
                          <Link
                            href={resolveNavHref(item.href, pathname)}
                            onClick={handleLinkClick}
                            className="flex items-center justify-between py-2.5 px-3 text-sm font-semibold text-navy hover:text-primary hover:bg-ice/20 rounded-lg transition"
                          >
                            <span>{item.label}</span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </Link>
                        </li>
                      );
                    }

                    return (
                      <li key={item.label} className="border-b border-slate-100/80 last:border-0 pb-1">
                        <button
                          type="button"
                          onClick={() => toggleSection(item.label)}
                          className="w-full flex items-center justify-between py-2.5 px-3 text-sm font-semibold text-navy hover:text-primary hover:bg-ice/20 rounded-lg transition text-left"
                          aria-expanded={isExpanded}
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-primary" : ""
                            }`}
                          />
                        </button>

                        {/* Accordion Content */}
                        {isExpanded && (
                          <ul className="pl-4 pr-1 py-1.5 space-y-1 bg-slate-50/70 rounded-lg mt-1 border-l-2 border-primary/40">
                            {item.children?.map((subItem) => (
                              <li key={subItem.label}>
                                <Link
                                  href={resolveNavHref(subItem.href, pathname)}
                                  onClick={handleLinkClick}
                                  className="block py-2 px-3 text-xs rounded-md text-slate-700 hover:text-primary hover:bg-ice/40 transition group"
                                >
                                  <div className="font-semibold text-navy group-hover:text-primary">
                                    {subItem.label}
                                  </div>
                                  {subItem.description && (
                                    <p className="text-[11px] text-muted mt-0.5 line-clamp-1">
                                      {subItem.description}
                                    </p>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </>
          )}

          {/* Quick Direct Communication Buttons */}
          <div className="pt-4 mt-4 border-t border-border-light space-y-2">
            <a
              href={COMPANY_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#25D366] text-white font-semibold text-xs rounded-lg shadow-sm hover:bg-[#20bd5a] transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp 24/7 Hotline</span>
              <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-75" />
            </a>

            <a
              href={`tel:${COMPANY_INFO.headOfficeStructured.fax?.replace(/[^0-9+]/g, "") || "+62778326066"}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-navy text-white font-semibold text-xs rounded-lg hover:bg-navy/90 transition"
            >
              <Printer className="w-4 h-4 text-ice" />
              <span>Batam Fax: {COMPANY_INFO.fax}</span>
            </a>

            <a
              href={`mailto:${COMPANY_INFO.email}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 text-slate-800 font-semibold text-xs rounded-lg hover:bg-slate-200 transition"
            >
              <Mail className="w-4 h-4 text-primary" />
              <span>{COMPANY_INFO.email}</span>
            </a>
          </div>
        </div>

        {/* Drawer Footer: Office Addresses & License Summary */}
        <div className="px-5 py-4 border-t border-border-light bg-surface text-[11px] text-slate-600 space-y-2.5">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <div>
              <strong className="text-navy font-bold">Batam Head Office:</strong>
              <p className="line-clamp-2 text-slate-500">
                {COMPANY_INFO.headOfficeStructured.address}, Batam, Kepri
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
            <div>
              <strong className="text-navy font-bold">Jakarta Branch:</strong>
              <p className="line-clamp-2 text-slate-500">
                {COMPANY_INFO.branchOfficeStructured.address}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-primary" />
              SIUKAK &amp; NIB: <strong>{COMPANY_INFO.nib}</strong>
            </span>
            <span className="font-semibold text-navy">MLC 2006</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDrawer;
