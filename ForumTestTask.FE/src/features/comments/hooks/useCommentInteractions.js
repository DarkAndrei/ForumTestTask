import {useCallback, useState} from "react";
import {parseQuote} from "../../../services/utilityService";

export const useCommentInteractions = () => {
    const [quote, setQuote] = useState({id: 0, contentItems: []});
    const [parentCommentId, setParentCommentId] = useState(0);

    const handleReplyClick = useCallback((commentId) => {
        setParentCommentId(commentId);
    }, [parentCommentId]);

    const handleQuoteClick = useCallback((quoteData) => {
        const contentItems = parseQuote(quoteData);
        setQuote({
            id: quoteData.id,
            contentItems: contentItems
        });
    }, []);

    // const resetInteractions = useCallback(() => {
    //     setParentCommentId(0);
    //     setQuote({ id: 0, contentItems: [] });
    // }, []);

    return {
        quote,
        setQuote,
        parentCommentId,
        setParentCommentId,
        handleReplyClick,
        handleQuoteClick
    }
}
