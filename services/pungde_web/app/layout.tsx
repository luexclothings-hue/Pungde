import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { SessionProvider } from "@/context/SessionContext";

export const metadata = {
  title: "Pungde",
  description: "Personal AI Farmer Assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <div className="shell">
            <Sidebar />
            <main className="main">{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
