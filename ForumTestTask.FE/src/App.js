import './App.css';
import CommentForm from "./features/comments/CommentForm";
import CommentBoard from "./features/comments/CommentBoard";
import { useCommentsData } from "./hooks/useCommentsData";
import { useCommentInteractions } from "./features/comments/hooks/useCommentInteractions";
import { useUserData } from "./hooks/useUserData";

export const App = () => {
    const { users } = useUserData();
    const {
        commentsPage, setCommentsPage,
        pagination, setPagination,
        updateComments,
        setSortType
    } = useCommentsData();
    const {
        quote,
        setQuote,
        parentCommentId,
        setParentCommentId,
        handleReplyClick,
        handleQuoteClick,
    } = useCommentInteractions();

    return (
        <div className="App">
            <header className="App-header">
                <div>
                    <CommentForm
                        parentCommentId={parentCommentId}
                        setParentCommentId={setParentCommentId}
                        quote={quote}
                        setQuote={setQuote}
                        updateComments={updateComments}
                    />
                </div>

                <CommentBoard
                    commentsPage={commentsPage}
                    setCommentsPage={setCommentsPage}
                    users={users}
                    onReplyClick={handleReplyClick}
                    onQuoteClick={handleQuoteClick}
                    pagination={pagination}
                    setPagination={setPagination}
                    setSortType={setSortType}
                    updateComments={updateComments}
                />
            </header>
        </div>
    );
}

export default App;
