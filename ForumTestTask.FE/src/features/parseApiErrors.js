export const parseApiErrors = (error) => {
    try {
        if (!error?.errors) return ["Unknown error"];

        return Object.entries(error.errors).flatMap(
            ([field, messages]) =>
                messages.map(msg => `${field}: ${msg}`)
        );
    } catch {
        return ["Failed to parse server response"];
    }
};
