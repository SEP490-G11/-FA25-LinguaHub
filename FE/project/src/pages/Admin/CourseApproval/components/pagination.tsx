import React from 'react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void | Promise<void>;
};

function range(start: number, end: number) {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  total,
  limit,
  isLoading,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);

  // Build a simple page list with ellipses when there are many pages
  let pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    pages = range(1, totalPages);
  } else {
    // always show first and last, and neighbors around current
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);
    pages = [1];
    if (left > 2) pages.push('...');
    pages = pages.concat(range(left, right));
    if (right < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }

  const handlePage = (p: number) => {
    if (isLoading || p === currentPage) return;
    onPageChange(p);
  };

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between">
      <div className="text-sm text-gray-600 mb-3 sm:mb-0">
        Showing <strong>{start}</strong> - <strong>{end}</strong> of <strong>{total}</strong>
      </div>

      <nav className="inline-flex items-center space-x-2" aria-label="Pagination">
        <button
          onClick={() => handlePage(Math.max(1, currentPage - 1))}
          disabled={isLoading || currentPage === 1}
          className={`px-3 py-1 rounded-md border text-sm font-medium ${
            currentPage === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300'
          }`}
        >
          Prev
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e-${i}`} className="px-2 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => handlePage(Number(p))}
              disabled={isLoading || p === currentPage}
              className={`px-3 py-1 rounded-md border text-sm font-medium ${
                p === currentPage
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => handlePage(Math.min(totalPages, currentPage + 1))}
          disabled={isLoading || currentPage === totalPages}
          className={`px-3 py-1 rounded-md border text-sm font-medium ${
            currentPage === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300'
          }`}
        >
          Next
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
