import {useEffect, useMemo, useState} from "react";
import {
    buildCommentTrees,
    reverseMap,
    sortByCreatedAt,
    sortByEmail,
    sortByUserName
} from "../../services/CommentService.js"
import {SortDropdown} from "../../components/SortDropdown";
import {SORT_FIELDS} from "../../Constants";
import {getUserNameById} from "../../services/UserService";
import CommentBlock from "./CommentBlock";

export const CommentBoard = ({comments, users, onReplyClick, onQuoteClick}) => {
    const [repliesByComment, setRepliesByComment] = useState(new Map());
    const [page, setPage] = useState(0);

    const COMMENTS_PER_PAGE = 25;

    useEffect(() => {
        const map = buildCommentTrees(comments);
        const LifoMap = map.toReversed();
        console.log("LifoMap", LifoMap);
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

    const handleClickSortDropdown = async (chosenSortKey) => {
        let sortedMap = new Map();
        console.log("sortedMap", sortByUserName(users, repliesByComment));

        switch (chosenSortKey) {
            case SORT_FIELDS.DEFAULT:
                sortedMap = sortByCreatedAt(repliesByComment);
                break;
            case SORT_FIELDS.USER_NAME:
                sortedMap = sortByUserName(users, repliesByComment);
                break;
            case SORT_FIELDS.EMAIL:
                sortedMap = sortByEmail(users, repliesByComment);
                break;
            case SORT_FIELDS.CREATED_AT:
                sortedMap = sortByCreatedAt(repliesByComment);
                break;
            default:
                break;
        }

        console.log("sortedMap", sortedMap);
        setRepliesByComment(sortedMap);
        setPage(0);
    };

    const renderComments = (commentsArray, level = 0) => {
        return commentsArray.map(comment => {
            if (!comment || !comment.userId) return null;

            return (
                <div key={comment.id}>
                    <CommentBlock
                        comment={comment}
                        userName={getUserNameById(users, comment.userId)}
                        level={level}
                        onReplyClick={onReplyClick}
                        onQuoteClick={onQuoteClick}
                    />
                    {Array.isArray(comment.children) && comment.children.length > 0 &&
                        renderComments(comment.children, level + 1)}
                </div>
            );
        });
    };

    const handleOrderChange = () => {
        setRepliesByComment(reverseMap(repliesByComment));
    }

    return (
        <div className="comment-board">
            <div className="comment-header">
                <h2 className="comment-title">Comments</h2>

                <SortDropdown
                    onSortChange={handleClickSortDropdown}
                    onOrderChange={handleOrderChange}
                />
            </div>

            {currentComments.length === 0 && <p>No comments yet.</p>}

            <div className="comment-list">
                {currentComments.length === 0 ? (
                    <p>No comments yet.</p>
                ) : (
                    renderComments(currentComments)
                )}
            </div>

            <div className="pagination">
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