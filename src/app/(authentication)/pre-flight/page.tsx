"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { verifyEmail } from "@/lib/api/auth";

export default function PreFlightPage() {
    const [state, setState] = useState<"verifying" | "success" | "error">(
        "verifying"
    );
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get("token");

    useEffect(() => {
        if (!token) {
            setState("error");
            return;
        }
        (async () => {
            try {
                await verifyEmail(token);
                setState("success");
                setTimeout(() => router.replace("/cockpit"), 5_000);
            } catch {
                setState("error");
            }
        })();
    }, [token, router]);

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-6 py-20 text-center">
            <Image
                src="/key-visuals/authentication/auth_dashed-path.svg"
                alt=""
                width={900}
                height={450}
                className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 select-none"
            />

            <Image
                src="/key-visuals/authentication/auth_confetti-plane.svg"
                alt=""
                width={120}
                height={120}
                priority
            />

            <h1 className="mt-10 text-4xl font-bold text-slate-900">
                {state === "success"
                    ? "Email confirmed!"
                    : state === "error"
                        ? "Link invalid or expired"
                        : "Confirming e-mail…"}
            </h1>

            {state === "success" && (
                <p className="mx-auto mt-4 max-w-md text-sm text-slate-600">
                    Your e-mail address has been successfully verified.<br />
                    You can now log in and start using PitchPilot.<br />
                    You’ll be redirected automatically in a few seconds…
                </p>
            )}
            {state === "error" && (
                <p className="mx-auto mt-4 max-w-md text-sm text-red-600">
                    Something went wrong. Try the link again or request a new
                    verification e-mail.
                </p>
            )}
            {state === "verifying" && (
                <p className="mx-auto mt-4 max-w-md text-sm text-slate-600">
                    Please hold while we clear you for take-off…
                </p>
            )}

            {/* CTA */}
            {state !== "verifying" ? (
                <Button className="mt-10" onClick={() => router.replace("/boarding-pass")}>
                    Go&nbsp;to&nbsp;Boarding-Pass
                </Button>
            ) : (
                <Button className="mt-10" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating
                </Button>
            )}

            <Image
                src="/key-visuals/authentication/auth_screen-lightbulb.svg"
                alt=""
                width={140}
                height={140}
                className="pointer-events-none absolute bottom-12 left-6 select-none"
            />
        </div>
    );
}
