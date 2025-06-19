"use client"


import { useRouter } from "next/navigation"
import { NavUser } from "./nav-user"
import { useEffect, useState } from "react"
import { PitchPilotLogoIcon } from "../icons/PitchPilotLogoIcon"


export function SiteHeader() {
  const router = useRouter()

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <PitchPilotLogoIcon className="text-pitch-pilot-purple w-20 h-20" />
        <div className="sm:ml-auto sm:w-auto flex items-center gap-2 min-w-48">
          <NavUser user={{ isVerified: true, hashed_password: "tets", id: "hdgsa", email: "tets.de", username: "Daniel" }} />
        </div>
      </div>
    </header>
  )
}
