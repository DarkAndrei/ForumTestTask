import {useCallback, useEffect, useState} from "react";
import {getComments} from "../features/comments/commentApi";
import {getUsers} from "../features/users/userApi";

export const useCommentsData = () => {
    const [comments, setComments] = useState([]);
    const [users, setUsers] = useState({});

    const updateData = useCallback(async () => {
        const usersData = await getUsers();
        const commentsData = await getComments();

        setUsers(usersData);
        setComments(commentsData ?? []);
    }, []);

    useEffect(() => {
        updateData();
    }, [])

    return {comments, users, updateData}
}
