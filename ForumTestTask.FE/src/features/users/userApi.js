import {API_BASE_URL, USERS_ENDPOINT} from "../../config";

export default async function addUser(newUser) {
    const response = await fetch(API_BASE_URL + USERS_ENDPOINT, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newUser),
    });

    if (!response.ok) throw new Error(await response.text());
    return response.json();
}