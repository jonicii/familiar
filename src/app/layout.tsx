import type { Metadata } from "next";
import "@/styles.css";

export const metadata: Metadata = {
  title: "Familiar — Family Kitchen Hub",
  description: "A family planning tool for the kitchen counter",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#FDF6EA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh' }}>{children}</body>
    </html>
  );
}