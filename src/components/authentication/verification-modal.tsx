"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { resendVerification } from "@/lib/api/auth";

interface Props {
    email: string;
    open: boolean;
    onOpenChange: (v: boolean) => void;
}

export default function VerificationModal({ email, open, onOpenChange }: Props) {
    const [busy, setBusy] = useState(false);

    async function handleResend() {
        setBusy(true);
        try {
            await resendVerification(email);
        } finally {
            setBusy(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogTitle />

                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-sky-50">
                    <Image src="/key-visuals/authentication/auth_mail-sent.svg" alt="" width={64} height={64} />
                </div>

                <h2 className="text-center text-lg font-semibold text-slate-900">
                    You’re almost ready to take off with Pitch&nbsp;Pilot!
                </h2>
                <p className="text-center text-sm text-slate-600 mt-2">
                    We’ve sent a confirmation e-mail to&nbsp;
                    <span className="font-medium text-slate-900">{email}</span>. <br />
                    Click the link to complete your registration.
                </p>

                <p className="text-center text-xs text-slate-500 mt-4">
                    Didn’t receive the e-mail? Check your spam folder or click below to
                    resend it.
                </p>

                <Button
                    variant="default"
                    className="mx-auto mt-4 w-40"
                    onClick={handleResend}
                    disabled={busy}
                >
                    {busy ? "Sending…" : "Resend E-mail"}
                </Button>
                <Image
                    src="/key-visuals/authentication/auth_plane-outline.svg"
                    width={90}
                    height={90}
                    alt=""
                    className="absolute bottom-8 left-10 opacity-20"
                />
                <Image
                    src="/key-visuals/authentication/auth_plane-outline.svg"
                    width={70}
                    height={70}
                    alt=""
                    className="absolute bottom-20 right-14 rotate-45 opacity-20"
                />
            </DialogContent>
        </Dialog>
    );
}
