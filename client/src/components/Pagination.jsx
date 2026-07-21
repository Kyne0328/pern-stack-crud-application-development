export default function Pagination({meta, loading, onPageChange}) {
  const {page, pageSize, total, totalPages} = meta;
  const firstRecord = total === 0 ? 0 : ((page - 1) * pageSize) + 1;
  const lastRecord = Math.min(page * pageSize, total);

  return (
    <div className="pagination" aria-label="Employee list pagination">
      <p>
        Showing <strong>{firstRecord}–{lastRecord}</strong> of <strong>{total}</strong> matching records
      </p>
      <div className="pagination-actions">
        <button
          className="button button-secondary"
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={loading || page <= 1}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          className="button button-secondary"
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={loading || page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
