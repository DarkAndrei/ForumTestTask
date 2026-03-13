import './App.css';
import CommentForm from "./features/comments/CommentForm";
import CommentBoard from "./components/CommentBoard";
import {useState} from "react";
import {useCommentsData} from "./hooks/useCommentsData";

export const App = () => {
    const [quoteText, setQuoteText] = useState("");
    const [parentCommentId, setParentCommentId] = useState(0);

    const {comments, users, updateData} = useCommentsData();

    const handleReplyClick = (commentId) => {
        setParentCommentId(commentId);
    }

    const handleQuoteClick = (text) => {
        setQuoteText(text);
    }

    return (
        <div className="App">
            <header className="App-header">
                <div style={{marginBottom: "16px"}}>
                    <CommentForm
                        parentId={parentCommentId}
                        setParentId={setParentCommentId}
                        quoteText={quoteText}
                        setQuoteText={setQuoteText}
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
