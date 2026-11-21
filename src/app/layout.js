import "./app.css";
import "./dashboard.css";
import AppShell from "@/components/app-shell";

export const metadata = {
  title: "NIPO ITAMS | Dashboard",
  description:
    "IT asset management dashboard for the National Intellectual Property Office of Sri Lanka.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
