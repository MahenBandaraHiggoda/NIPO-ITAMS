import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  PackageOpen,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";

const icons = {
  inventory: Boxes,
  employees: Users,
  store: PackageOpen,
  procurement: BriefcaseBusiness,
  maintenance: Wrench,
  reports: BarChart3,
  users: ShieldCheck,
};

export default function SectionPlaceholder({ title, description, icon }) {
  const Icon = icons[icon];

  return (
    <section className="module-placeholder">
      <div className="module-breadcrumb">
        <Link href="/">Dashboard</Link>
        <span>/</span>
        <span>{title}</span>
      </div>
      <div className="module-card">
        <span className="module-icon">
          <Icon size={25} strokeWidth={1.6} aria-hidden="true" />
        </span>
        <span className="section-kicker">NIPO ITAMS MODULE</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="module-notice">
          <span />
          This module is being developed and will be connected to the shared
          register as it becomes available.
        </div>
        <Link href="/" className="module-back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Return to dashboard
        </Link>
      </div>
    </section>
  );
}
