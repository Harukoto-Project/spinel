import { Fragment } from 'react';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { NavItemConfig } from '@/config/navigation';

type PageBreadcrumbProps = {
  rootLabel: string;
  trail: NavItemConfig[];
  onRootClick: () => void;
  onItemClick: (id: string) => void;
};

export function PageBreadcrumb({ rootLabel, trail, onRootClick, onItemClick }: PageBreadcrumbProps) {
  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap gap-2 sm:gap-2">
        <BreadcrumbItem className="max-sm:hidden">
          <BreadcrumbLink asChild>
            <button type="button" className="cursor-pointer truncate" onClick={onRootClick}>
              {rootLabel}
            </button>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {trail.length > 1 ? (
          <BreadcrumbItem className="sm:hidden">
            <BreadcrumbEllipsis className="size-8" />
          </BreadcrumbItem>
        ) : null}
        <BreadcrumbSeparator className={trail.length > 1 ? undefined : 'max-sm:hidden'} />
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          return (
            <Fragment key={item.id}>
              <BreadcrumbItem className={isLast ? 'min-w-0' : 'min-w-0 max-sm:hidden'}>
                {isLast ? (
                  <BreadcrumbPage className="truncate font-medium text-foreground">{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <button type="button" className="cursor-pointer truncate" onClick={() => onItemClick(item.id)}>
                      {item.label}
                    </button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {isLast ? null : <BreadcrumbSeparator className="max-sm:hidden" />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
