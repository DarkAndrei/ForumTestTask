import {BACKEND_API_URL, USERS_ENDPOINT} from "../../apiConfig.js";

export const addUser = async (newUser) => {
    const response = await fetch(BACKEND_API_URL + USERS_ENDPOINT, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newUser),
    });
    const data = await response.json();

    if (!response.ok) {
        throw data;
    }

    return data;
}

export const getUsers = async () => {
    const response = await fetch(BACKEND_API_URL + USERS_ENDPOINT, {
        method: "GET",
        headers: {"Content-Type": "application/json"}
    });

    const data = await response.json();


    if (!response.ok) {
        throw data;
    }

    return data;
}
