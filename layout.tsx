import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";
export const metadata = { title: "SUCF Uniuyo Membership Registration", description: "Scripture Union Campus Fellowship, Uniuyo Town Campus" };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@600;700&family=Nunito+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <header><div className="bar">
          <Link href="/" className="brand">SUCF Uniuyo<small>Scripture Union Campus Fellowship</small></Link>
          <Link href="/admin" className="btn">Admin</Link>
        </div></header>
        <main>{children}</main>
        <footer>
          <p><b>Upholding righteous standards as a Unique fellowship on Campus</b></p>
          <p>Facebook: SUCF UNI UYO · 09024596708 · 09076997248</p>
          <p>&copy; 2026 Scripture Union Campus Fellowship, Uniuyo. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
