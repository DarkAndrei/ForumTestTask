import {sanitizeText} from "../../services/CommentService";
import {BACKEND_URL} from "../../apiConfig";
import 'lightbox2/dist/css/lightbox.min.css';
import 'lightbox2/dist/js/lightbox-plus-jquery.min.js';
import {getCommentById} from "./commentApi";
import {useEffect, useState} from "react";

export const CommentBlock = ({comment, userName, level, onReplyClick, onQuoteClick}) => {
    const [htmlContent, setHtmlContent] = useState("");

    useEffect(() => {
        const loadContent = async () => {
            const rendered = await renderContent(comment.contentItems);
            setHtmlContent(rendered);
        };
        loadContent();
    }, [comment]);

    const getFirstTextValue = (items) => {
        if (!Array.isArray(items)) return "[Quote]";
        const firstValid = items.find(i => i?.type?.toLowerCase() === "text" && i.value?.trim());
        return firstValid?.value?.replace(/\n/g, " ") || "[Quote]";
    };

    const renderContent = async (itemsInput) => {
        if (!itemsInput) return "";

        let items = Array.isArray(itemsInput) ? itemsInput : JSON.parse(itemsInput);
        if (!Array.isArray(items)) return "";

        const parts = [];

        for (const item of items) {
            if (!item?.type) continue;

            const type = item.type.toLowerCase();

            if (type === "text") {
                parts.push(item.value === "\n" ? "<br>" : sanitizeText(item.value ?? ""));
            }

            if (type === "quote" && item.id) {
                try {
                    const resp = await getCommentById(item.id);
                    if (!resp?.success || !resp?.data) {
                        parts.push(`<div class="quote-block">Quote not found</div>`);
                        continue;
                    }

                    const quoteItems = resp.data.contentItems;
                    const quoteText = getFirstTextValue(
                        Array.isArray(quoteItems) ? quoteItems : JSON.parse(quoteItems)
                    );

                    parts.push(`<div class="quote-block" data-quote-id="${item.id}">${quoteText}</div>`);
                } catch {
                    parts.push(`<div class="quote-block">Quote not found</div>`);
                }
            }
        }

        return parts.join("");
    };

    const fileUrl = comment.filePath ? `${BACKEND_URL}${comment.filePath}` : null;

    return (
        <div className="comment-card" style={{marginLeft: `${level * 20}px`}}>
            <div className="comment-header">
                <img className="avatar" src="https://i.pravatar.cc/40" alt="User avatar"/>
                <span className="username">{userName}</span>
                <span className="comment-date">{comment.createdAt}</span>
            </div>

            {fileUrl && (
                <div className="comment-file" style={{margin: "5px 0"}}>
                    {fileUrl.endsWith(".txt") ? (
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">Open file</a>
                    ) : (
                        <a href={fileUrl} data-lightbox={`comment-${comment.id}`}>
                            <img
                                src={fileUrl}
                                alt="attachment"
                                style={{maxWidth: "100px", maxHeight: "100px", cursor: "pointer", borderRadius: "4px"}}
                            />
                        </a>
                    )}
                </div>
            )}

            <div className="comment-body">
                <div dangerouslySetInnerHTML={{__html: htmlContent}}/>
            </div>

            <div className="comment-button">
                <button onClick={() => onQuoteClick({commentId: comment.id, quoteText: comment.contentItems})}>Quote
                </button>
                <button onClick={() => onReplyClick(comment.id)}>Reply</button>
            </div>
        </div>
    );
};

export default CommentBlock;