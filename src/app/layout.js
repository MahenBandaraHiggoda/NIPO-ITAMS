import "./app.css";

export const metadata = {
  title: "NIPO ITAMS | Appwrite Connection",
  description:
    "Check the Appwrite connection for the NIPO IT Asset Management System.",
  icons: { icon: "/appwrite.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
