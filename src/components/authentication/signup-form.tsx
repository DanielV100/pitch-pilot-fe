"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/input";
import VerificationModal from "@/components/authentication/verification-modal";
import { signup } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

export function SignupForm({ className }: { className?: string }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [email2, setEmail2] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const router = useRouter();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        if (email !== email2) {
            setError("E-mail addresses don’t match.");
            return;
        }

        try {
            await signup(username, email, password);
            setModalOpen(true);
        } catch {
            setError("Sign-up failed — please try again.");
        }
    }

    return (
        <>
            <form onSubmit={onSubmit} className={cn("grid gap-6", className)}>
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900">Sign&nbsp;Up</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Welcome! Let’s set up your account.
                    </p>
                </div>

                {/* fields */}
                <div className="grid gap-4">
                    <FloatingLabelInput
                        id="username"
                        label="First and Last Name *"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <FloatingLabelInput
                        id="email"
                        label="E-mail Address *"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <FloatingLabelInput
                        id="email2"
                        label="Confirm E-mail Address *"
                        type="email"
                        value={email2}
                        onChange={(e) => setEmail2(e.target.value)}
                        required
                    />

                    <FloatingLabelInput
                        id="password"
                        label="Password *"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <p className="-mt-2 text-xs text-muted-foreground">
                        * required fields
                    </p>
                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <Button type="submit" className="w-full">
                        Create&nbsp;Account
                    </Button>
                </div>

                <p className="text-center text-sm">
                    Already have an account?{" "}
                    <Link
                        href="/boarding-pass"
                        className="font-medium text-sky-600 hover:underline"
                    >
                        Sign&nbsp;in!
                    </Link>
                </p>
            </form>

            <VerificationModal
                email={email}
                open={modalOpen}
                onOpenChange={setModalOpen}
            />
        </>
    );
}
