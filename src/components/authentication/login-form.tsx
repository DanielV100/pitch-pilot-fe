"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FloatingInput, FloatingLabel, FloatingLabelInput, Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { login } from "@/lib/api/auth"

export function LoginForm({ className }: { className?: string }) {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await login(identifier, password)
      router.replace("/a/cockpit")
    } catch (err) {
      setError("Invalid credentials — please try again.")
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("grid gap-6", className)}>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Sign&nbsp;In</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage, practice, and perfect your presentations.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <FloatingLabelInput
            id="identifier"
            label="Email&nbsp;Address or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <FloatingLabelInput
            id="password"
            type="password"
            value={password}
            label="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="mt-2 w-full">
          Login
        </Button>
      </div>

      <p className="text-center text-sm">
        Don’t have an account?{" "}
        <a
          href="/check-in"
          className="font-medium text-sky-600 hover:underline"
        >
          Sign&nbsp;Up
        </a>
      </p>
    </form>
  )
}
