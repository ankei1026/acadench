import type { BreadcrumbItem as BreadcrumbItemType } from "@/types"

import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function AppSidebarHeader({
  breadcrumbs = [],
}: {
  breadcrumbs?: BreadcrumbItemType[]
}) {
  const lastIdx = breadcrumbs.length - 1

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />

        {breadcrumbs.length > 0 ? (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, idx) => {
                const isLast = idx === lastIdx
                const showOnDesktopOnly = idx < lastIdx

                return (
                  <span key={`${item.title}-${idx}`} className="inline-flex">
                    <BreadcrumbItem className={showOnDesktopOnly ? "hidden md:block" : undefined}>
                      {isLast ? (
                        <BreadcrumbPage>{item.title}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.href ?? "#"}>
                          {item.title}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast ? (
                      <BreadcrumbSeparator className="hidden md:block" />
                    ) : null}
                  </span>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        ) : null}
      </div>
    </header>
  )
}
