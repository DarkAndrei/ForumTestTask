import {BACKEND_API_URL, COMMENTS_ENDPOINT, REPLY_ENDPOINT} from "../../apiConfig.js"


export async function addComment(newComment, file) {
    const formData = new FormData();

    formData.append("userId", newComment.userId);
    formData.append("contentItems", JSON.stringify(newComment.contentItems));

    if (file) {
        formData.append("file", file);
    }

    const response = await fetch(BACKEND_API_URL + COMMENTS_ENDPOINT, {
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
        const response = await fetch(BACKEND_API_URL + COMMENTS_ENDPOINT, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
        });

        if (!response.ok) new Error("Failed to fetch comments");

        return await response.json();

    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
}

export async function addReplyComment(parentId, newReplyComment, file) {
    const formData = new FormData();

    formData.append("parentId", parentId);
    formData.append("userId", newReplyComment.userId);
    formData.append("contentItems", JSON.stringify(newReplyComment.contentItems));

    if (file) {
        formData.append("file", file);
    }

    const response = await fetch(BACKEND_API_URL + REPLY_ENDPOINT, {
        method: "PUT",
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

export async function getCommentById(parentId) {
    try {
        const response = await fetch(BACKEND_API_URL + COMMENTS_ENDPOINT + "/" + parentId, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
        });

        if (!response.ok) new Error("Failed to fetch comments");

        return await response.json();

    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
}
