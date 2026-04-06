import { useCallback, useEffect, useState } from "react";
import { getCommentsPage } from "../features/comments/commentApi";

export const useCommentsData = () => {
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 25,
        totalItems: 0,
        totalPages: 0,
    });
    const [commentsPage, setCommentsPage] = useState([]);
    const [sortType, setSortType] = useState("default");

    const updateComments = useCallback(async (nextPage) => {
        const pageToLoad = nextPage || pagination.page;

        const commentResponse = await getCommentsPage(pageToLoad, sortType);

        if (!commentResponse.success) {
            return console.log(commentResponse.message);
        }

        setCommentsPage(commentResponse.data.comments);
        setPagination(commentResponse.data.pagination);
    }, [sortType, pagination]);

    useEffect(() => {
        updateComments();
    }, [sortType]);

    return {
        commentsPage, setCommentsPage,
        updateComments,
        pagination, setPagination,
        setSortType
    };
}
