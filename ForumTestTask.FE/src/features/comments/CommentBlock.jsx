import 'lightbox2/dist/css/lightbox.min.css';
import 'lightbox2/dist/js/lightbox-plus-jquery.min.js';
import { useEffect, useState } from "react";
import { convertToHtml, getDateString, renderContent } from "../../services/commentService";
import { getFileUrl } from "../../services/fileService";

export const CommentBlock = ({
    comment,
    userName,
    level,
    onReplyClick,
    onQuoteClick,
    children
}) => {
    const AVATAR_URL = "https://i.pravatar.cc/40";

    const [htmlContent, setHtmlContent] = useState("");
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadContent = async () => {
            const rendered = await renderContent(comment.contentItems);

            if (isMounted) {
                setHtmlContent(convertToHtml(rendered));
            }
        };

        loadContent();

        return () => {
            isMounted = false;
        };
    }, [comment.contentItems]);

    const fileUrl = getFileUrl(comment?.filePath);

    const handleQuote = () => {
        onQuoteClick({
            id: comment.id,
            contentItems: comment.contentItems
        });
    };

    return (
        <div
            className="comment-card"
            style={{ marginLeft: `${level * 20}px` }}
        >
            <div className="comment-header">
                <img className="avatar" src={AVATAR_URL} alt="User avatar" />
                <span className="username">{userName}</span>
                <span className="comment-date">{getDateString(comment.createdAt)}</span>
            </div>

            {fileUrl && (
                <div className="comment-file">
                    {fileUrl?.toLowerCase().endsWith(".txt") ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setShowPreview(prev => !prev)}
                                className="txt-file-link"
                            >
                                {showPreview ? "Hide file" : "Open File"}
                            </button>

                            {showPreview && (
                                <iframe
                                    src={fileUrl}
                                    title="txt preview"
                                    className="txt-iframe"
                                />
                            )}
                        </>
                    ) : (
                        <a href={fileUrl} data-lightbox={`comment-${comment.id}`}>
                            <img
                                src={fileUrl}
                                alt="attachment"
                                className="comment-image"
                            />
                        </a>
                    )}
                </div>
            )}

            <div className="comment-body">
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>

            <div className="comment-button">
                <button
                    type="button"
                    onClick={() => handleQuote()}
                >
                    Quote
                </button>
                <button onClick={() => onReplyClick(comment.id)}>Reply</button>
            </div>

            {children && (
                <div className="comment-children">
                    {children}
                </div>
            )}
        </div>
    );
};

export default CommentBlock; 
