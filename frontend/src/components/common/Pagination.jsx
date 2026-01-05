import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    siblingCount = 1
}) => {
    if (totalPages <= 1) return null;

    // Helper to generate page numbers
    const generatePagination = () => {
        const pages = [];

        // Always show first page
        pages.push(1);

        if (currentPage > siblingCount + 2) {
            pages.push('...');
        }

        let start = Math.max(2, currentPage - siblingCount);
        let end = Math.min(totalPages - 1, currentPage + siblingCount);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - siblingCount - 1) {
            pages.push('...');
        }

        // Always show last page if more than 1 page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    const pages = generatePagination();

    return (
        <div className="flex items-center justify-center gap-2 mt-8 py-4 px-2 overflow-x-auto">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-9 w-9 rounded-lg border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elevated))]"
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
            </Button>

            <div className="flex items-center gap-1.5">
                {pages.map((page, index) => {
                    if (page === '...') {
                        return (
                            <div key={`ellipsis-${index}`} className="flex items-center justify-center h-9 w-9">
                                <MoreHorizontal className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                            </div>
                        );
                    }

                    return (
                        <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(page)}
                            className={`h-9 w-min min-w-[2.25rem] rounded-lg transition-all ${currentPage === page
                                    ? "bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white border-transparent shadow-md"
                                    : "border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))]"
                                }`}
                        >
                            {page}
                        </Button>
                    );
                })}
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-9 w-9 rounded-lg border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elevated))]"
            >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
            </Button>
        </div>
    );
};

export default Pagination;
