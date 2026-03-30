export const parseQuote = (quoteData) => {
    if (!quoteData.contentItems) return [];

    let contentItems = [];

    try {
        contentItems = JSON.parse(quoteData.contentItems);
    } catch (err) {
        console.error("Invalid JSON in quoteText", err);
        contentItems = [];
    }
    return contentItems;
}
