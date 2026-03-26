import {useCallback, useEffect, useState} from "react";
import {getComments} from "../features/comments/commentApi";
import {getUsers} from "../features/users/userApi";

export const useCommentsData = () => {
    const [comments, setComments] = useState([]);
    const [users, setUsers] = useState({});

    const updateData = useCallback(async () => {
        const usersResponse = await getUsers();
        const commentsResponse = await getComments();

        if (!usersResponse.success) {
            return console.log(usersResponse.message);
        }

        if (!commentsResponse.success) {
            return console.log(commentsResponse.message);
        }

        setUsers(usersResponse.data.data);
        setComments(commentsResponse.data.data);
    }, []);

    useEffect(() => {
        updateData();
    }, [])

    return {comments, users, updateData}
}
