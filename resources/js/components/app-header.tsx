import type { BreadcrumbItem as BreadcrumbItemType } from "@/types"
import { Link } from "@inertiajs/react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function AppHeader({
  breadcrumbs = [],
}: {
  breadcrumbs?: BreadcrumbItemType[]
}) {
  const lastIdx = breadcrumbs.length - 1

  // If no breadcrumbs, you might want to show something else
  if (breadcrumbs.length === 0) {
    return (
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          {/* Optional: Show page title or logo when no breadcrumbs */}
        </div>
      </header>
    )
  }

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <Breadcrumb>
          <BreadcrumbList>
            {/* Home breadcrumb (optional) */}
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/dashboard">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />

            {breadcrumbs.map((item, idx) => {
              const isLast = idx === lastIdx

              return (
                <BreadcrumbItem key={`${item.title}-${idx}`}>
                  {isLast ? (
                    <BreadcrumbPage>{item.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href ?? "#"}>{item.title}</Link>
                    </BreadcrumbLink>
                  )}
                  {!isLast && <BreadcrumbSeparator />}
                </BreadcrumbItem>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
