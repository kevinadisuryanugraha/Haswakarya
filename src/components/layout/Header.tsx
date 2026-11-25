"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  Ship,
  Users,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { TopBar } from "./TopBar";
import { MobileDrawer } from "./MobileDrawer";
import { NAV_MENU_ITEMS, NavMenuItem, QUICK_SEARCH_INDEX } from "@/data/haswakarya-data";
import { resolveNavHref } from "@/lib/navigation/anchors";

export interface HeaderProps {
  showTopBar?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showTopBar = true }) => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Monitor scroll state for sticky header backdrop and shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto focus search input when search is opened
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
    }
  }, [isSearchOpen]);

  // Handle ESC key for search bar dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const handleDropdownClick = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const filteredSearchResults = searchQuery.trim()
    ? QUICK_SEARCH_INDEX.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : QUICK_SEARCH_INDEX.slice(0, 6);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 print:hidden ${
          isScrolled
            ? "shadow-md bg-white/95 backdrop-blur-md"
            : "bg-white border-b border-border-light"
        }`}
      >
        {/* Optional Collapsible TopBar */}
        {showTopBar && (
          <div
            className={`transition-all duration-300 ease-in-out ${
              isScrolled
                ? "max-h-0 opacity-0 overflow-hidden"
                : "max-h-16 opacity-100 overflow-visible"
            }`}
          >
            <TopBar />
          </div>
        )}

        {/* Main Navigation Container with Strict Anti-Collision & Canonical Alignment */}
        <div className="site-container">
          <div
            className={`flex items-center justify-between gap-4 transition-all duration-300 ${
              isScrolled ? "h-16 md:h-18" : "h-18 md:h-20"
            }`}
          >
            {/* Left Zone: Corporate Logo & Nearby Navigation */}
            <div className="flex items-center gap-5 sm:gap-6 lg:gap-7 xl:gap-8 min-w-0">
              {/* Corporate Logo — Clean True-Ratio Fit with Zero Empty Box */}
              <Link
                href="/#hero"
                className="flex items-center shrink-0 group focus:outline-none focus:ring-2 focus:ring-primary rounded-lg py-1"
                aria-label="PT Haswakarya Andalan Sedare Home"
              >
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 transition-transform group-hover:scale-105">
                  <Image
                    src="/images/logo-haswakarya.png"
                    alt="PT Haswakarya Andalan Sedare - Crew Manning Agency"
                    fill
                    sizes="(max-width: 640px) 44px, 48px"
                    className="object-contain object-left"
                    priority
                  />
                </div>
              </Link>

              {/* Desktop Navigation Menu: Sitting closely & comfortably beside the logo */}
              <nav
                className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 shrink-0"
                aria-label="Main Navigation"
              >
                {NAV_MENU_ITEMS.map((item: NavMenuItem) => {
                  const hasChildren = item.children && item.children.length > 0;
                  const isOpen = activeDropdown === item.label;

                  if (!hasChildren) {
                    return (
                      <Link
                        key={item.label}
                        href={resolveNavHref(item.href, pathname)}
                        className="px-1.5 xl:px-2 2xl:px-2.5 py-1.5 text-[11px] xl:text-xs 2xl:text-sm font-semibold text-navy hover:text-primary transition-colors rounded-md hover:bg-slate-50 whitespace-nowrap"
                      >
                        {item.label}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={item.label}
                      className="relative shrink-0"
                      onMouseEnter={() => handleMouseEnter(item.label)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        type="button"
                        onClick={() => handleDropdownClick(item.label)}
                        className={`inline-flex items-center gap-0.5 xl:gap-1 px-1.5 xl:px-2 2xl:px-2.5 py-1.5 text-[11px] xl:text-xs 2xl:text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                          isOpen
                            ? "text-primary bg-ice/40"
                            : "text-navy hover:text-primary hover:bg-slate-50"
                        }`}
                        aria-expanded={isOpen}
                        aria-haspopup="true"
                      >
                        <span className="whitespace-nowrap">{item.label}</span>
                        <ChevronDown
                          className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform duration-200 shrink-0 ${
                            isOpen ? "rotate-180 text-primary" : "text-slate-400"
                          }`}
                        />
                      </button>

                      {/* Dropdown Panel */}
                      {isOpen && (
                        <div className="absolute top-full left-0 w-80 bg-white rounded-xl shadow-2xl border border-border-light py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="px-3 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                              {item.label}
                            </span>
                            <span className="text-[10px] text-primary font-semibold">
                              Haswakarya
                            </span>
                          </div>
                          <div className="py-1">
                            {item.children?.map((sub) => (
                              <Link
                                key={sub.label}
                                href={resolveNavHref(sub.href, pathname)}
                                onClick={() => setActiveDropdown(null)}
                                className="block px-4 py-2.5 hover:bg-ice/25 transition-colors border-l-2 border-transparent hover:border-primary group"
                              >
                                <div className="text-xs font-semibold text-navy group-hover:text-primary flex items-center justify-between">
                                  <span>{sub.label}</span>
                                  <ArrowRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all shrink-0" />
                                </div>
                                {sub.description && (
                                  <p className="text-[11px] text-muted line-clamp-1 mt-0.5">
                                    {sub.description}
                                  </p>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Right Side Actions: Cleanly proportioned, zero overlapping */}
            <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-2.5 shrink-0 flex-nowrap">
              {/* Search Toggle Button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 rounded-lg transition-colors shrink-0 ${
                  isSearchOpen
                    ? "bg-primary text-white"
                    : "text-navy hover:text-primary hover:bg-slate-100"
                }`}
                aria-label="Toggle website search"
                title="Search website content"
              >
                {isSearchOpen ? (
                  <X className="w-4 h-4 shrink-0" />
                ) : (
                  <Search className="w-4 h-4 shrink-0" />
                )}
              </button>

              {/* H-COS Enterprise Portal Link */}
              <Link
                href="/portal"
                className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                title="Open Haswakarya Crewing Operating System"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>H-COS Portal</span>
              </Link>

              {/* Join as Crew: dedicated page (Active on 2xl to preserve breathing room) */}
              <Link
                href="/join-as-crew"
                className="hidden 2xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/50 hover:border-primary hover:bg-primary hover:text-white rounded-lg transition-all shadow-2xs whitespace-nowrap shrink-0"
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Join As Crew</span>
              </Link>

              {/* Recruit Crew CTA Button: Primary business conversion button, always prominent */}
              <Link
                href="/recruit-crew"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-accent hover:bg-accent/90 rounded-lg shadow-sm hover:shadow transition-all group whitespace-nowrap shrink-0 min-w-fit cursor-pointer"
                title="Recruit Crew — Fleet Manning Requisition"
              >
                <Ship className="w-3.5 h-3.5 shrink-0 group-hover:scale-105 transition-transform" />
                <span className="whitespace-nowrap">Recruit Crew</span>
              </Link>

              {/* Mobile Hamburger Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="p-2 text-navy hover:text-primary hover:bg-slate-100 rounded-lg lg:hidden transition-colors shrink-0"
                aria-label="Open mobile navigation"
                aria-expanded={isMobileDrawerOpen}
              >
                <Menu className="w-5 h-5 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Search Overlay Panel */}
        {isSearchOpen && (
          <div className="w-full bg-white border-t border-b border-border-light shadow-xl py-4 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="site-container">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Haswakarya services, 9-stage pipeline, qualifications, SIUKAK license, offices..."
                  className="w-full pl-10 pr-20 py-2.5 text-sm bg-slate-50 border border-border-light rounded-lg text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-navy px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 transition"
                >
                  ESC
                </button>
              </div>

              {/* Search Suggestions & Results */}
              <div className="mt-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {searchQuery.trim() ? "Search Results" : "Quick Links & Suggestions"}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-60 overflow-y-auto">
                  {filteredSearchResults.map((result, idx) => (
                    <a
                      key={`${result.title}-${idx}`}
                      href={resolveNavHref(result.href, pathname)}
                      target={result.isExternal ? "_blank" : undefined}
                      rel={result.isExternal ? "noopener noreferrer" : undefined}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-ice/30 border border-transparent hover:border-ice transition group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white transition-colors">
                          {result.category}
                        </span>
                        <span className="text-xs font-medium text-navy group-hover:text-primary transition-colors line-clamp-1">
                          {result.title}
                        </span>
                      </div>
                      {result.isExternal ? (
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-primary shrink-0 ml-1" />
                      ) : (
                        <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-primary shrink-0 ml-1" />
                      )}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Slide-In Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />
    </>
  );
};

export default Header;
