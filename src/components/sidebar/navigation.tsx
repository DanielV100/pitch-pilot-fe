"use client"

import {
  PanelRightClose,
  PanelRightOpen,
  Plus,
  type LucideIcon,
} from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { useActiveIdStore } from "@/hooks/sidebar/useActiveIdStore"
import { SidebarMenuItemType } from "./app-sidebar"
import Link from "next/link"
import { Separator } from "@radix-ui/react-separator"
import { Title } from "@radix-ui/react-dialog"

export function Navigation({ primaryNavItems }: { primaryNavItems: SidebarMenuItemType[] }) {
  const router = useRouter()
  const sidebar = useSidebar()
  const { activeId, setActiveId } = useActiveIdStore()

  function handleClick(item: SidebarMenuItemType) {
    if (item.id === 0) {
      sidebar.toggleSidebar()
      item.icon = item.icon === PanelRightOpen ? PanelRightClose : PanelRightOpen
      return
    }
    if (item.id !== undefined) {
      setActiveId(item.id)
    }
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {primaryNavItems.map((item) => {
          const isActive = item.id === activeId
          return (
            <SidebarMenuItem key={item.id} className="rounded-md">
              {item.needsLabel && (
                <SidebarGroupLabel>Presentations</SidebarGroupLabel>
              )}
              <SidebarMenuButton
                className={`${isActive ? "bg-black text-white" : ""}`}
                tooltip={item.title}
                onClick={() => handleClick(item)}
                asChild
              >
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>

            </SidebarMenuItem>
          )
        })}
        <Separator className="my-4 bg-gray-200 h-px w-full"/>

        {sidebar.state === "expanded" && (
          <p className="text-[12px] text-gray-500">Projects</p>
        )}

<Button
          variant="outline"
          onClick={() => router.push("/mission-control")}
          className="flex items-center gap-2 mt-2"
        >
          <Plus />
          {sidebar.state === "expanded" && <span>New Presentation</span>}
        </Button>
        
      </SidebarMenu>
    </SidebarGroup>
  )
}
