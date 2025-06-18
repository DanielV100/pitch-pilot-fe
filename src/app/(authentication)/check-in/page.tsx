import Image from "next/image";
import { SignupForm } from "@/components/authentication/signup-form";

export default function CheckInPage() {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <div className="flex flex-col justify-center px-6 py-12 md:px-10">
                <SignupForm className="mx-auto w-full max-w-sm" />
            </div>
            <div className="relative hidden lg:block bg-sky-50">
                <Image
                    src="/key-visuals/authentication/auth_signup.svg"
                    alt="Join PitchPilot illustration"
                    fill
                    priority
                    className="object-contain p-4 bg-[#E6F6FD]"
                />
            </div>
        </div>
    );
}
