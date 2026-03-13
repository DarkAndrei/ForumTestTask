import {useEffect, useMemo, useState} from "react";
import {
    buildCommentTrees,
    reverseMap,
    sortByCreatedAt,
    sortByEmail,
    sortByUserName
} from "../services/CommentService.js"
import {SortButtons} from "./SortButtons";
import {SORT_FIELDS} from "../Constants";
import {Comment} from "../features/comments/Comment";
import {getUserNameById} from "../services/UserService";

export const CommentBoard = ({comments, users, onReplyClick, onQuoteClick}) => {
    const [repliesByComment, setRepliesByComment] = useState(new Map());
    const [page, setPage] = useState(0);

    const COMMENTS_PER_PAGE = 25;

    useEffect(() => {
        const map = buildCommentTrees(comments);
        const LifoMap = map.toReversed();
        setRepliesByComment(LifoMap);
    }, [comments]);

    const currentComments = useMemo(() => {
        const start = page * COMMENTS_PER_PAGE;
        const end = start + COMMENTS_PER_PAGE;
        return [...repliesByComment.values()].slice(start, end);
    }, [repliesByComment, page]);

    const commentsArray = [...repliesByComment.entries()].map(([id, comment]) => ({
        id,
        ...comment,
    }));

    const totalPages = Math.ceil(commentsArray.length / COMMENTS_PER_PAGE);

    const handleNext = () => {
        if (page < totalPages - 1) setPage(page + 1);
    };

    const handlePrev = () => {
        if (page > 0) setPage(page - 1);
    };

    const handleClickSortButtons = async (sortField) => {
        let sortedMap = new Map(repliesByComment); // default

        switch (sortField) {
            case SORT_FIELDS.USER_NAME:
                sortedMap = sortByUserName(users, repliesByComment);
                break;
            case SORT_FIELDS.EMAIL:
                sortedMap = sortByEmail(users, repliesByComment);
                break;
            case SORT_FIELDS.CREATED_AT:
                sortedMap = sortByCreatedAt(repliesByComment);
                break;
            case SORT_FIELDS.REVERSE:
                sortedMap = reverseMap(repliesByComment);
                break;
            default:
                break;
        }
        setRepliesByComment(sortedMap);
        setPage(0);
    };

    const renderComments = (commentsArray, level = 0) => {
        return commentsArray.map(comment => (
            <div key={comment.id}>
                <Comment
                    comment={comment}
                    userName={getUserNameById(users, comment.userId)}
                    level={level}
                    onReplyClick={onReplyClick}
                    onQuoteClick={onQuoteClick}
                />
                {comment.children && comment.children.length > 0 && renderComments(comment.children, level + 1)}
            </div>
        ));
    };

    return (
        <div style={{border: "1px solid #ccc", padding: "16px", maxWidth: "600px"}}>
            <h2>Comments</h2>
            < SortButtons
                handleClickSortButtons={handleClickSortButtons}
            />

            {currentComments.length === 0 && <p>No comments yet.</p>}

            <div>
                {currentComments.length === 0 ? (
                    <p>No comments yet.</p>
                ) : (
                    renderComments(currentComments)
                )}
            </div>

            <div style={{marginTop: "12px", display: "flex", justifyContent: "space-between"}}>
                <button onClick={handlePrev} disabled={page === 0}>
                    Prev
                </button>
                <span>
          Page {page + 1} / {totalPages}
        </span>
                <button onClick={handleNext} disabled={page >= totalPages - 1}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default CommentBoard;