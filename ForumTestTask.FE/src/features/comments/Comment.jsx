import {convertToHtml, sanitizeText} from "../../services/CommentService";

export const Comment = ({
                            comment,
                            userName,
                            level,
                            onReplyClick,
                            onQuoteClick
                        }) => {
    const handleReply = () => {
        onReplyClick(comment.id);
    };

    const handleQuote = () => {
        onQuoteClick(comment.text);
    };

    return (
        <div className="comment-card" style={{marginLeft: `${level * 20}px`}}>
            <div className="comment-header">
                <img
                    className="avatar" src="https://i.pravatar.cc/40" alt="User avatar"
                />
                <span className="username">
                    {userName}
                </span>
                <span className="comment-date">
                    {comment.createdAt}
                </span>
            </div>
            <div className="comment-body">
                <p dangerouslySetInnerHTML={{
                    __html: convertToHtml(sanitizeText(comment.text))
                }}></p>
            </div>
            <div className="comment-button">
                <button onClick={handleQuote}>Quote</button>
                <button onClick={handleReply}>Reply</button>
            </div>
        </div>
    )
}

export default Comment;