'use client'
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/sidebar/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Loader2 } from "lucide-react"; // <- Spinner Icon from Lucide/Shadcn

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const { user } = useCurrentUser();

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="[--header-height:calc(--spacing(18))]">
            <SidebarProvider className="flex flex-col">
                <SiteHeader user={user!} />
                <div className="flex flex-1">

                    <main className="flex flex-1 flex-col gap-4 p-4">
                        {children}
                    </main>

                </div>
            </SidebarProvider>
        </div>
    )
}
