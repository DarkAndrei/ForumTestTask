import {useCallback, useEffect, useState} from "react";
import {getUsers} from "../features/users/userApi";

export const useUserData = () => {
    const [users, setUsers] = useState([]);

    const updateUsers = useCallback(async () => {
        const usersResponse = await getUsers();

        if (!usersResponse.success) {
            return console.log(usersResponse.message);
        }

        setUsers(usersResponse.data.users);
    }, []);

    useEffect(() => {
        updateUsers();
    }, [updateUsers])

    return {users};
}
