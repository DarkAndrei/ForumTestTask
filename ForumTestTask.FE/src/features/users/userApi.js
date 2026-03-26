import {BACKEND_API_URL, USERS_ENDPOINT} from "../../apiConfig.js";

export const addUser = async (newUser) => {
    try {
        const res = await fetch(`${BACKEND_API_URL}${USERS_ENDPOINT}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newUser),
        });

        const data = await res.json();

        if (!res.ok) {
            return {success: false, message: data?.message || "Failed to add user"};
        }

        return {success: true, data};
    } catch (error) {
        console.error("addUser error:", error);
        return {success: false, message: error.message};
    }
};

export const getUsers = async () => {
    try {
        const res = await fetch(`${BACKEND_API_URL}${USERS_ENDPOINT}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
        });

        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();
        return {success: true, data};
    } catch (error) {
        console.error("getUsers error:", error);
        return {success: false, data: [], message: error.message};
    }
};

export const getUser = async (userId) => {
    try {
        const res = await fetch(`${BACKEND_API_URL}${USERS_ENDPOINT}/${userId}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
        });

        if (!res.ok) {
            const message = await res.text();
            return {success: false, message};
        }

        const data = await res.json();
        return {success: true, data};
    } catch (error) {
        console.error("getUser error:", error);
        return {success: false, data: null, message: error.message};
    }
};