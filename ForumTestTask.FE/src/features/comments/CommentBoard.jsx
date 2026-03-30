import {SortDropdown} from "../../components/SortDropdown";
import {getUserNameByIdAndUsers} from "../../services/userService";
import CommentBlock from "./CommentBlock";
import {useCommentBoardState} from "./hooks/useCommentBoardState";
import {useCallback} from "react";
import PaginationBlock from "../../components/PaginationBlock";

export const CommentBoard = ({comments, users, onReplyClick, onQuoteClick}) => {
    const {
        handleSortChange,
        handleOrderChange,
        handleNext,
        handlePrev,
        currentComments,
        page,
        totalPages,
    } = useCommentBoardState({comments, users});

    const renderComments = useCallback((commentsArray, level = 0) => {
        return commentsArray
            .filter(c => c?.id && c?.userId)
            .map((comment) => (
                <CommentBlock
                    key={comment.id}
                    comment={comment}
                    userName={getUserNameByIdAndUsers(users, comment.userId)}
                    level={level}
                    onReplyClick={onReplyClick}
                    onQuoteClick={onQuoteClick}
                >
                    {comment.children?.length > 0 &&
                        renderComments(comment.children, level + 1)
                    }
                </CommentBlock>
            ));
    }, [users, onReplyClick, onQuoteClick]);

    return (
        <div className="comment-board">
            <div className="comment-header">
                <h2 className="comment-title">Comments</h2>

                <SortDropdown
                    onSortChange={handleSortChange}
                    onOrderChange={handleOrderChange}
                />
            </div>

            {totalPages > 1 && (
                <PaginationBlock
                    totalPages={totalPages}
                    page={page}
                    handlePrev={handlePrev}
                    handleNext={handleNext}
                />
            )}

            <div className="comment-list">
                {currentComments.length === 0 ? (
                    <p>No comments yet.</p>
                ) : (
                    renderComments(currentComments)
                )}
            </div>

            {totalPages > 1 && (
                <PaginationBlock
                    totalPages={totalPages}
                    page={page}
                    handlePrev={handlePrev}
                    handleNext={handleNext}
                />
            )}
        </div>
    );
};

export default CommentBoard;
