import './App.css';
import CommentForm from "./features/comments/CommentForm";
import CommentBoard from "./features/comments/CommentBoard";
import {useCommentsData} from "./hooks/useCommentsData";
import {useCommentInteractions} from "./features/comments/hooks/useCommentInteractions";

export const App = () => {
    const {comments, users, updateData} = useCommentsData();
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
                        updateData={updateData}
                    />
                </div>

                <CommentBoard
                    comments={comments}
                    users={users}
                    onReplyClick={handleReplyClick}
                    onQuoteClick={handleQuoteClick}
                />
            </header>
        </div>
    );
}

export default App;
