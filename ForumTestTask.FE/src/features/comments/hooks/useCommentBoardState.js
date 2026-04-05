import { useCallback } from "react";

export const useCommentBoardState = ({
    setSortType,
    setPagination,
    setCommentsPage,
    updateComments
}) => {
    const handleSortChange = useCallback(async (chosenSortKey) => {
        setSortType(chosenSortKey);

        setPagination((prev) => ({
            ...prev,
            page: 1,
        }));
    }, []);

    const handleOrderChange = useCallback(() => {
        setCommentsPage((prev) => [...prev].reverse());
    }, []);

    const handleNext = useCallback(() => {
        setPagination((prev) => {
            const nextPage = prev.page + 1;
            updateComments(nextPage);

            return { ...prev, page: nextPage };
        });
    }, []);

    const handlePrev = useCallback(() => {
        setPagination((prev) => {
            const nextPage = prev.page - 1;
            updateComments(nextPage);

            return { ...prev, page: nextPage };
        });
    }, []);

    return {
        handleSortChange,
        handleOrderChange,
        handleNext,
        handlePrev
    }
}
