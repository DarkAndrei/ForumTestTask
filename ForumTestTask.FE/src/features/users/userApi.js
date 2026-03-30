import {BACKEND_API_URL, USERS_ENDPOINT} from "../../apiConfig.js";

export const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = "An unexpected error occurred";

        try {
            const errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorJson.error || errorText;
            } catch {
                errorMessage = errorText || errorMessage;
            }
        } catch {
        }

        return {
            success: false,
            error: errorMessage,
            data: null
        };
    }

    try {
        const data = await response.json();
        return {
            success: true,
            data,
            error: null
        };
    } catch (e) {
        return {
            success: false,
            error: "Failed to parse server response",
            data: null
        };
    }
}

export const addUser = async (newUser) => {
    try {
        const res = await fetch(`${BACKEND_API_URL}${USERS_ENDPOINT}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newUser),
        });

        return await handleResponse(res);
    } catch (error) {
        console.error("addUser error:", error);
        return {success: false, error: error.message, data: null};
    }
}

export const getUsers = async () => {
    try {
        const res = await fetch(`${BACKEND_API_URL}${USERS_ENDPOINT}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
        });

        return await handleResponse(res);
    } catch (error) {
        console.error("getUsers error:", error);
        return {success: false, error: error.message, data: []};
    }
}

export const getUser = async (userId) => {
    try {
        const res = await fetch(`${BACKEND_API_URL}${USERS_ENDPOINT}/${userId}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
        });

        return await handleResponse(res);
    } catch (error) {
        console.error("getUser error:", error);
        return {success: false, error: error.message, data: null};
    }
}
