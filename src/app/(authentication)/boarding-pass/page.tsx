import { LoginForm } from "@/components/authentication/login-form"
import Image from "next/image"

export default function BoardingPassPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block bg-sky-50">
        <Image
          src="/key-visuals/authentication/auth_login.svg"
          alt="PitchPilot welcome graphic"
          fill
          className="object-contain p-4 bg-[#E6F6FD]"
          priority
        />
      </div>
      <div className="flex flex-col justify-center px-6 py-12 md:px-10">
        <LoginForm className="mx-auto w-full max-w-sm" />
      </div>
    </div>
  )
}
