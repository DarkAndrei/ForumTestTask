import { SortDropdown } from "../../components/SortDropdown";
import CommentBlock from "./CommentBlock";
import { useCommentBoardState } from "./hooks/useCommentBoardState";
import { useCallback } from "react";
import PaginationBlock from "../../components/PaginationBlock";

export const CommentBoard = ({
    commentsPage, setCommentsPage,
    users,
    onReplyClick,
    onQuoteClick,
    setSortType,
    pagination, setPagination,
    updateComments,
}) => {
    const {
        handleSortChange,
        handleOrderChange,
        handleNext,
        handlePrev,
    } = useCommentBoardState({
        setSortType,
        setPagination,
        setCommentsPage,
        updateComments
    });
    const renderComments = useCallback((comments, level = 0) => {
        return comments
            .filter(c => c?.id)
            .map((comment) => (
                <CommentBlock
                    key={comment.id}
                    comment={comment}
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

            {pagination.totalPages > 1 && (
                <PaginationBlock
                    pagination={pagination}
                    handlePrev={handlePrev}
                    handleNext={handleNext}
                />
            )}

            <div className="comment-list">
                {commentsPage.length === 0 ? (
                    <p>No comments yet.</p>
                ) : (
                    renderComments(commentsPage)
                )}
            </div>

            {pagination.totalPages > 1 && (
                <PaginationBlock
                    pagination={pagination}
                    handlePrev={handlePrev}
                    handleNext={handleNext}
                />
            )}
        </div>
    );
};

export default CommentBoard;
