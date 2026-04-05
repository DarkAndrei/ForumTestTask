import { COMMENTS_ENDPOINT, REPLY_ENDPOINT } from "../../apiConfig.js";

const handleResponse = async (response) => {
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
        } catch (e) {
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
};

export async function addComment(newComment, file) {
    try {
        const formData = new FormData();
        formData.append("userId", newComment.userId);
        formData.append("contentItems", JSON.stringify(newComment.contentItems));
        if (file) formData.append("file", file);

        const res = await fetch(COMMENTS_ENDPOINT, {
            method: "POST",
            body: formData,
        });

        return await handleResponse(res);
    } catch (error) {
        console.error("addComment error:", error);
        return {
            success: false,
            error: error.message || "Failed to add comment",
            data: null
        };
    }
}

export async function addReplyComment(parentId, newReplyComment, file) {
    try {
        const formData = new FormData();
        formData.append("parentId", parentId);
        formData.append("userId", newReplyComment.userId);
        formData.append("contentItems", JSON.stringify(newReplyComment.contentItems));
        if (file) formData.append("file", file);

        const res = await fetch(REPLY_ENDPOINT, {
            method: "PUT",
            body: formData,
        });

        return await handleResponse(res);
    } catch (error) {
        console.error("addReplyComment error:", error);
        return {
            success: false,
            error: error.message || "Failed to add reply",
            data: null
        };
    }
}

export async function getComments() {
    try {
        const res = await fetch(COMMENTS_ENDPOINT, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        return await handleResponse(res);
    } catch (error) {
        console.error("getComments error:", error);
        return {
            success: false,
            error: error.message || "Failed to fetch comments",
            data: []
        };
    }
}

export async function getCommentById(commentId) {
    try {
        const res = await fetch(COMMENTS_ENDPOINT + `/${commentId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        return await handleResponse(res);
    } catch (error) {
        console.error("getCommentById error:", error);
        return {
            success: false,
            error: error.message || "Failed to fetch comment",
            data: null
        };
    }
}

export async function getCommentsPage(page, sortType) {
    try {
        const res = await fetch(
            `${COMMENTS_ENDPOINT}?page=${page}&sortType=${sortType}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }
        );

        return await handleResponse(res);
    } catch (error) {
        console.error("getCommentsPage error:", error);
        return {
            success: false,
            error: error.message || "Failed to fetch comments",
            data: null,
        };
    }
}
