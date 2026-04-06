export const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

export const COMMENTS_ENDPOINT = `${API_BASE}/api/comments`;
export const USERS_ENDPOINT = `${API_BASE}/api/users`;
export const REPLY_ENDPOINT = `${API_BASE}/api/comments/reply`;
