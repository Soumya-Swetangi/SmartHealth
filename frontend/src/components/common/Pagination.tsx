import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-[#685044]/15 rounded-b-xl sm:px-6">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          {totalItems !== undefined && (
            <p className="text-xs text-[#685044]">
              Showing page <span className="font-semibold text-[#3a405a]">{currentPage}</span> of{' '}
              <span className="font-semibold text-[#3a405a]">{totalPages}</span> ({totalItems} total entries)
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md text-[#3a405a] bg-[#f9dec9]/50 hover:bg-[#99b2dd]/50 border border-[#685044]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="px-3 py-1.5 text-xs font-bold text-[#3a405a] bg-[#99b2dd]/30 rounded-md">
            {currentPage}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md text-[#3a405a] bg-[#f9dec9]/50 hover:bg-[#99b2dd]/50 border border-[#685044]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
