export const PaginationControls = ({
    pagination,
    handlePrev,
    handleNext
}) => {
    if (pagination.totalPages <= 1) return null;

    return (
        <div className="pagination">
            <button
                onClick={handlePrev}
                disabled={pagination.page === 1}
                aria-label="Previous page"
            >
                Prev
            </button>

            <span>
                Page {pagination.page} / {pagination.totalPages}
            </span>

            <button
                onClick={handleNext}
                disabled={pagination.page >= pagination.totalPages}
                aria-label="Next page"
            >
                Next
            </button>
        </div>
    );
};

export default PaginationControls;
