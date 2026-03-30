import {SORT_FIELDS} from "../../../Constants";
import {useCallback, useEffect, useMemo, useState} from "react";
import {
    buildCommentTrees,
    reverseComments,
    sortByCreatedAt,
    sortByEmail,
    sortByUserName
} from "../../../services/commentService";

const LIMIT_COMMENTS_PER_PAGE = 25;

export const useCommentBoardState = ({comments, users}) => {
    const [rootComments, setRootComments] = useState([]);
    const [sortedRootComments, setSortedRootComments] = useState([]);
    const [page, setPage] = useState(0);

    useEffect(() => {
        const commentsMap = buildCommentTrees(comments);
        const roots = Array.from(commentsMap.values());
        const reversedRoots = reverseComments(roots);
        setRootComments(reversedRoots);
        setSortedRootComments(reversedRoots);
        setPage(0);
    }, [comments]);

    const handleSortChange = useCallback((chosenSortKey) => {
        let sorted = [...rootComments];

        switch (chosenSortKey) {
            case SORT_FIELDS.DEFAULT:
            case SORT_FIELDS.CREATED_AT:
                sorted = sortByCreatedAt(rootComments);
                break;
            case SORT_FIELDS.USER_NAME:
                sorted = sortByUserName(rootComments, users);
                break;
            case SORT_FIELDS.EMAIL:
                sorted = sortByEmail(rootComments, users);
                break;
            default:
                break;
        }

        const reversedSorted = reverseComments(sorted);

        setSortedRootComments(reversedSorted);
        setPage(0);
    }, [rootComments, users]);

    const handleOrderChange = useCallback(() => {
        setSortedRootComments((prev) => [...prev].reverse());
    }, []);

    const totalPages = useMemo(() => {
        return Math.ceil(sortedRootComments.length / LIMIT_COMMENTS_PER_PAGE);
    }, [sortedRootComments.length]);

    const handleNext = useCallback(() => {
        setPage((prev) => Math.min(prev + 1, totalPages - 1));
    }, [totalPages]);

    const handlePrev = useCallback(() => {
        setPage((prev) => Math.max(prev - 1, 0));
    }, []);

    const currentComments = useMemo(() => {
        const start = page * LIMIT_COMMENTS_PER_PAGE;

        return sortedRootComments.slice(start, start + LIMIT_COMMENTS_PER_PAGE);
    }, [sortedRootComments, page]);

    return {
        handleSortChange,
        handleOrderChange,
        handleNext,
        handlePrev,
        currentComments,
        page,
        totalPages,
    }
}
