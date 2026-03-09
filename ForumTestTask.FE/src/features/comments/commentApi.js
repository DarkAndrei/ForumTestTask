import {API_BASE_URL, COMMENTS_ENDPOINT} from "../../config.js"


export async function addComment(newComment, file) {
    const formData = new FormData();

    formData.append("userId", newComment.userId);
    formData.append("text", newComment.text);

    if (file) {
        formData.append("file", file);
    }

    const response = await fetch(API_BASE_URL + COMMENTS_ENDPOINT, {
        method: "POST",
        body: formData
    });

    // handle backend error
    if (!response.ok) {
        const errorText = await response.text();
        return {success: false, message: errorText};
    }

    const data = await response.json();
    return {success: true, data};
}

export async function getComments() {
    try {
        const response = await fetch(API_BASE_URL + COMMENTS_ENDPOINT, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
        });

        if (!response.ok) throw new Error("Failed to fetch comments");

        return await response.json();

    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
}
