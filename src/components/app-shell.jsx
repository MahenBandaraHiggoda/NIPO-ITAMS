"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Boxes,
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  Menu,
  PackageOpen,
  Settings2,
  ShieldCheck,
  Users,
  Wrench,
  X,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    group: "WORKSPACE",
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: Boxes,
    group: "ASSET MANAGEMENT",
  },
  {
    label: "Employees",
    href: "/employees",
    icon: Users,
    group: "ASSET MANAGEMENT",
  },
  {
    label: "Store",
    href: "/store",
    icon: PackageOpen,
    group: "ASSET MANAGEMENT",
  },
  {
    label: "Procurement",
    href: "/procurement",
    icon: BriefcaseBusiness,
    group: "ASSET MANAGEMENT",
  },
  {
    label: "Maintenance",
    href: "/maintenance",
    icon: Wrench,
    group: "ASSET MANAGEMENT",
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    group: "INSIGHTS & ADMIN",
  },
  {
    label: "Users",
    href: "/users",
    icon: ShieldCheck,
    group: "INSIGHTS & ADMIN",
  },
];

function Sidebar({ pathname, onNavigate }) {
  let currentGroup = "";

  return (
    <aside className="nipo-sidebar">
      <Link href="/" className="nipo-brand" onClick={onNavigate}>
        <span className="nipo-seal" aria-hidden="true">
          <span>N</span>
        </span>
        <span className="nipo-brand-copy">
          <strong>
            NIPO <i>ITAMS</i>
          </strong>
          <small>ASSET MANAGEMENT</small>
        </span>
      </Link>

      <div className="office-label">
        <Building2 size={15} aria-hidden="true" />
        <span>National IP Office</span>
      </div>

      <nav className="side-navigation" aria-label="Main navigation">
        {navigation.map((item) => {
          const Icon = item.icon;
          const showGroup = currentGroup !== item.group;
          currentGroup = item.group;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <div key={item.href}>
              {showGroup && <p className="navigation-group">{item.group}</p>}
              <Link
                href={item.href}
                className={`side-link${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
              >
                <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                <span>{item.label}</span>
                {item.href === "/inventory" && (
                  <span className="side-link-count">IT</span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-security">
          <span className="security-icon">
            <ShieldCheck size={17} aria-hidden="true" />
          </span>
          <span>
            <strong>Secure workspace</strong>
            <small>Internal use only</small>
          </span>
        </div>
        <div className="sidebar-version">NIPO · SRI LANKA</div>
      </div>
    </aside>
  );
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="nipo-app">
      <div className="government-strip">
        <div className="government-strip-inner">
          <span>DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA</span>
          <span>MINISTRY OF INDUSTRY &amp; ENTREPRENEURSHIP DEVELOPMENT</span>
        </div>
      </div>

      <div className="application-shell">
        <Sidebar pathname={pathname} />

        {menuOpen && (
          <button
            type="button"
            className="sidebar-scrim"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          />
        )}
        <div className={`mobile-sidebar${menuOpen ? " is-open" : ""}`}>
          <button
            type="button"
            className="mobile-sidebar-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
          <Sidebar pathname={pathname} onNavigate={() => setMenuOpen(false)} />
        </div>

        <div className="nipo-main">
          <header className="office-header">
            <div className="office-header-title">
              <button
                type="button"
                className="mobile-menu-button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open navigation"
              >
                <Menu size={21} />
              </button>
              <Link
                href="/"
                className="office-brand"
                aria-label="NIPO ITAMS home"
              >
                <Image
                  src="/images/nipo-official-header.png"
                  alt="National Intellectual Property Office — Ministry of Trade, Commerce, Food Security & Co-operative Development"
                  width={1326}
                  height={174}
                  sizes="(max-width: 760px) 54vw, 560px"
                  priority
                />
              </Link>
            </div>
            <div className="header-actions">
              <div className="notification-wrap">
                <button
                  type="button"
                  className={`icon-button${notificationsOpen ? " is-selected" : ""}`}
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                  onClick={() => setNotificationsOpen((open) => !open)}
                >
                  <Bell size={18} />
                  <span className="notification-dot" />
                </button>
                {notificationsOpen && (
                  <div className="notification-popover" role="status">
                    <strong>Notifications</strong>
                    <p>You have 6 approvals waiting for review.</p>
                    <Link
                      href="/procurement"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      Review procurement
                    </Link>
                  </div>
                )}
              </div>
              <span className="header-divider" />
              <div className="profile-block">
                <span className="profile-avatar">MB</span>
                <span className="profile-copy">
                  <strong>Mahen Bandara</strong>
                  <small>IT Asset Administrator</small>
                </span>
                <Settings2
                  className="profile-settings"
                  size={16}
                  aria-hidden="true"
                />
              </div>
            </div>
          </header>

          <main className="nipo-content">{children}</main>

          <footer className="application-footer">
            <span>National Intellectual Property Office · Sri Lanka</span>
            <span>IT Asset Management System</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
