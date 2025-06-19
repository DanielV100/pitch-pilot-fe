import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/sidebar/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="[--header-height:calc(--spacing(18))]">
            <SidebarProvider className="flex flex-col">
                <SiteHeader />
                <div className="flex flex-1">
                    <AppSidebar />
                    <SidebarInset>
                        <main className="flex flex-1 flex-col gap-4 p-4">
                            {children}
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    )
}
