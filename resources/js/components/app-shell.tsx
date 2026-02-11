import type { PropsWithChildren } from "react"

import { cn } from "@/lib/utils"
import { SidebarProvider } from "@/components/ui/sidebar"

export type AppShellProps = PropsWithChildren<{
  variant?: "default" | "sidebar"
  className?: string
}>

export function AppShell({
  variant = "default",
  className,
  children,
}: AppShellProps) {
  if (variant === "sidebar") {
    return <SidebarProvider className={className}>{children}</SidebarProvider>
  }

  return (
    <div className={cn("flex min-h-svh w-full flex-col", className)}>
      {children}
    </div>
  )
}
