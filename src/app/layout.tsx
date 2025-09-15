import "./globals.css";
// import { Inter } from "next/font/google";
import { ReactQueryClientProvider } from "@/utils/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Abhaya_Libre } from "next/font/google";

const abhaya = Abhaya_Libre({
  subsets: ["latin"],
  weight: ["400", "600"],
});
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
      <body className={`${abhaya.className} bg-helper-sand`}>
        <ReactQueryClientProvider>
          {" "}
          <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
              <SidebarTrigger />
              {children}
            </main>
          </SidebarProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
