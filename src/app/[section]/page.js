import { notFound } from "next/navigation";
import SectionPlaceholder from "@/components/section-placeholder";

const sections = {
  inventory: {
    title: "Inventory",
    description:
      "View and manage equipment recorded in the NIPO asset register.",
    icon: "inventory",
  },
  employees: {
    title: "Employees",
    description: "Find staff members and see the equipment assigned to them.",
    icon: "employees",
  },
  store: {
    title: "Store",
    description:
      "Track stock on hand, receipts and equipment issued from stores.",
    icon: "store",
  },
  procurement: {
    title: "Procurement",
    description: "Follow equipment requests, purchase orders and approvals.",
    icon: "procurement",
  },
  maintenance: {
    title: "Maintenance",
    description: "Coordinate service requests, repairs and equipment upkeep.",
    icon: "maintenance",
  },
  reports: {
    title: "Reports",
    description: "Review asset summaries and operational reports.",
    icon: "reports",
  },
  users: {
    title: "Users",
    description: "Manage workspace access and user roles.",
    icon: "users",
  },
};

export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}

export default async function SectionPage({ params }) {
  const { section } = await params;
  const page = sections[section];

  if (!page) notFound();

  return <SectionPlaceholder {...page} />;
}
