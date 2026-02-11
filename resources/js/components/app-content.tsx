import type { PropsWithChildren } from "react"

import { cn } from "@/lib/utils"
import { SidebarInset } from "@/components/ui/sidebar"

export type AppContentProps = PropsWithChildren<{
  variant?: "default" | "sidebar"
  className?: string
}>

export function AppContent({
  variant = "default",
  className,
  children,
}: AppContentProps) {
  if (variant === "sidebar") {
    return <SidebarInset className={className}>{children}</SidebarInset>
  }

  return (
    <main className={cn("flex w-full flex-1 flex-col", className)}>
      {children}
    </main>
  )
}
