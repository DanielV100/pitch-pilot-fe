"use client"

import * as React from "react"
import {
  LayoutDashboard,
  LifeBuoy,
  LucideIcon,
  PanelRightOpen,
  Send,
  Settings, Plane, PlaneLanding, PlaneTakeoff, TicketsPlane, Wind
} from "lucide-react"
import { Navigation } from "@/components/sidebar/navigation"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { NavSecondary } from "./nav-secondary"
import { useEffect, useState } from "react"


export interface SidebarMenuItemType {
  id?: number
  title: string
  url: string
  icon: LucideIcon
  needsLabel?: boolean
  isActive?: boolean
}

const iconMap = { Plane, PlaneLanding, PlaneTakeoff, TicketsPlane, Wind }


const hardCodedMenuItems: SidebarMenuItemType[] = [
  {
    title: "Collapse",
    url: "#",
    icon: PanelRightOpen,
    id: 0,
    isActive: false,
  },
  {
    title: "Dashboard",
    url: "/p/dashboard",
    icon: LayoutDashboard,
    id: 1,
    isActive: true,
  },
  {
    title: "Dashboard",
    url: "/p/dashboard",
    icon: LayoutDashboard,
    id: 2,
    isActive: false,
    needsLabel: true,
  }
]

const hardCodedSubMenuItems: SidebarMenuItemType[] = [
  {
    title: "Support",
    url: "#",
    icon: LifeBuoy,
  },
  {
    title: "Feedback",
    url: "#",
    icon: Send,
  }
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [navData, setNavData] = useState<SidebarMenuItemType[]>(hardCodedMenuItems)


  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarContent>
        <Navigation primaryNavItems={navData} />
        <NavSecondary items={hardCodedSubMenuItems} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
