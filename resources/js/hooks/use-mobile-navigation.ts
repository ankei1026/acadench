import * as React from "react"

import { useSidebar } from "@/components/ui/sidebar"

/**
 * Close the mobile sidebar after a navigation/menu action.
 * Useful when menu items live inside the sidebar on small screens.
 */
export function useMobileNavigation() {
  const { isMobile, setOpenMobile } = useSidebar()

  return React.useCallback(() => {
    if (isMobile) setOpenMobile(false)
  }, [isMobile, setOpenMobile])
}

