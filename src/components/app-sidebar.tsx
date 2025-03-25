import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup />
        <SidebarMenuButton asChild>
          <Link href="/" className="">
            Home
          </Link>
        </SidebarMenuButton>
        <SidebarMenuButton asChild>
          <Link href="/bst" className="">
            BST
          </Link>
        </SidebarMenuButton>

        <SidebarMenuButton asChild>
          <Link href="/avl" className="">
            AVL
          </Link>
        </SidebarMenuButton>

        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
