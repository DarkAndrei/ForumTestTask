export const PaginationControls = (({
                                        totalPages,
                                        page,
                                        handlePrev,
                                        handleNext
                                    }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="pagination">
            <button
                onClick={handlePrev}
                disabled={page === 0}
                aria-label="Previous page"
            >
                Prev
            </button>

            <span>
                    Page {page + 1} / {totalPages}
                </span>

            <button
                onClick={handleNext}
                disabled={page >= totalPages - 1}
                aria-label="Next page"
            >
                Next
            </button>
        </div>
    );
});

export default PaginationControls;
