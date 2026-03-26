import {BACKEND_API_URL, COMMENTS_ENDPOINT, REPLY_ENDPOINT} from "../../apiConfig.js";

export async function addComment(newComment, file) {
    try {
        const formData = new FormData();
        formData.append("userId", newComment.userId);
        formData.append("contentItems", JSON.stringify(newComment.contentItems));
        if (file) formData.append("file", file);

        const res = await fetch(`${BACKEND_API_URL}${COMMENTS_ENDPOINT}`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const message = await res.text();
            return {success: false, message};
        }

        const data = await res.json();
        return {success: true, data};

    } catch (error) {
        console.error("addComment error:", error);
        return {success: false, message: error.message};
    }
}

export async function getComments() {
    try {
        const res = await fetch(`${BACKEND_API_URL}${COMMENTS_ENDPOINT}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
        });

        if (!res.ok) throw new Error("Failed to fetch comments");

        const data = await res.json();
        return {success: true, data};
    } catch (error) {
        console.error("getComments error:", error);
        return {success: false, data: [], message: error.message};
    }
}

export async function addReplyComment(parentId, newReplyComment, file) {
    try {
        const formData = new FormData();
        formData.append("parentId", parentId);
        formData.append("userId", newReplyComment.userId);
        formData.append("contentItems", JSON.stringify(newReplyComment.contentItems));
        if (file) formData.append("file", file);

        const res = await fetch(`${BACKEND_API_URL}${REPLY_ENDPOINT}`, {
            method: "PUT",
            body: formData,
        });

        if (!res.ok) {
            const message = await res.text();
            return {success: false, message};
        }

        const data = await res.json();
        return {success: true, data};

    } catch (error) {
        console.error("addReplyComment error:", error);
        return {success: false, message: error.message};
    }
}

export async function getCommentById(commentId) {
    try {
        const res = await fetch(`${BACKEND_API_URL}${COMMENTS_ENDPOINT}/${commentId}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
        });

        if (!res.ok) throw new Error("Failed to fetch comment");

        const data = await res.json();
        return {success: true, data};

    } catch (error) {
        console.error("getCommentById error:", error);
        return {success: false, data: null, message: error.message};
    }
}