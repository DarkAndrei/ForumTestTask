import {BACKEND_URL} from "../../apiConfig";
import 'lightbox2/dist/css/lightbox.min.css';
import 'lightbox2/dist/js/lightbox-plus-jquery.min.js';
import {useEffect, useState} from "react";
import {convertToHtml, getDateString, renderContent} from "../../services/CommentService";

export const CommentBlock = ({comment, userName, level, onReplyClick, onQuoteClick}) => {
    const [htmlContent, setHtmlContent] = useState("");

    useEffect(() => {
        const loadContent = async () => {
            const rendered = await renderContent(comment.contentItems);
            setHtmlContent(convertToHtml(rendered));
        };
        loadContent();
    }, [comment]);

    const fileUrl = comment.filePath ? `${BACKEND_URL}${comment.filePath}` : null;
    
    return (
        <div className="comment-card" style={{marginLeft: `${level * 20}px`}}>
            <div className="comment-header">
                <img className="avatar" src="https://i.pravatar.cc/40" alt="User avatar"/>
                <span className="username">{userName}</span>
                <span className="comment-date">{getDateString(comment.createdAt)}</span>
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