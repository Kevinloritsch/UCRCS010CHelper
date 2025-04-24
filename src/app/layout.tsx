import "./globals.css";
import { Inter } from "next/font/google";
import { ReactQueryClientProvider } from "@/utils/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "UCR CS010C Helper Website",
  description:
    "Created by students to help entry-level computer science courses.",
};

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-helper-teal-100`}>
        <ReactQueryClientProvider>
          {" "}
          <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
              <SidebarTrigger className="absolute left-0 top-0 z-10" />
              {children}
            </main>
          </SidebarProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
