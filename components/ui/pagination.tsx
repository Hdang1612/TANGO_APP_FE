"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PaginationProps extends React.ComponentProps<"nav"> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  itemLabel?: string;
  theme?: "default" | "blue" | "purple" | "green";
  showItemCount?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  itemLabel = "mục",
  theme = "default",
  showItemCount = true,
  className,
  ...props
}: PaginationProps) {
  if (totalPages <= 0 && (!totalItems || totalItems <= 0)) {
    return null;
  }

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }
    return pages;
  };

  const pages = getPageNumbers();

  // Active theme styles
  const activeClass =
    theme === "blue"
      ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white"
      : theme === "purple"
      ? "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-600 dark:text-white"
      : theme === "green"
      ? "bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:text-white"
      : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900";

  // Item count range
  const startItem =
    pageSize && totalItems
      ? Math.min((currentPage - 1) * pageSize + 1, totalItems)
      : null;
  const endItem =
    pageSize && totalItems
      ? Math.min(currentPage * pageSize, totalItems)
      : null;

  return (
    <nav
      role="navigation"
      aria-label="Phân trang"
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2",
        className
      )}
      {...props}
    >
      {/* Item info */}
      <div className="text-sm text-slate-500 dark:text-slate-400 order-2 sm:order-1">
        {showItemCount && totalItems !== undefined ? (
          <span>
            {startItem !== null && endItem !== null ? (
              <>
                Hiển thị{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {startItem}-{endItem}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {totalItems}
                </span>{" "}
                {itemLabel}
              </>
            ) : (
              <>
                Tổng số{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {totalItems}
                </span>{" "}
                {itemLabel}
              </>
            )}
          </span>
        ) : (
          <span>
            Trang{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {currentPage}
            </span>{" "}
            / {totalPages}
          </span>
        )}
      </div>

      {/* Page controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1 order-1 sm:order-2 flex-wrap justify-center">
          {/* First page button */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 hidden sm:flex cursor-pointer disabled:opacity-40"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            title="Trang đầu"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page button */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 sm:px-3 text-xs sm:text-sm gap-1 cursor-pointer disabled:opacity-40"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Trước</span>
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pages.map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="flex h-8 w-8 items-center justify-center text-slate-400"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                );
              }

              const isCurrent = p === currentPage;
              return (
                <Button
                  key={`page-${p}`}
                  variant={isCurrent ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    "h-8 w-8 text-xs sm:text-sm font-medium transition-colors cursor-pointer",
                    isCurrent
                      ? activeClass
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  )}
                  onClick={() => onPageChange(p as number)}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {p}
                </Button>
              );
            })}
          </div>

          {/* Next page button */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 sm:px-3 text-xs sm:text-sm gap-1 cursor-pointer disabled:opacity-40"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="Trang sau"
          >
            <span className="hidden sm:inline">Sau</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page button */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 hidden sm:flex cursor-pointer disabled:opacity-40"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            title="Trang cuối"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </nav>
  );
}

export default Pagination;

