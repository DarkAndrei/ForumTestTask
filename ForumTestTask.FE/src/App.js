import './App.css';
import CommentForm from "./features/comments/CommentForm";
import CommentBoard from "./features/comments/CommentBoard";
import {useState} from "react";
import {useCommentsData} from "./hooks/useCommentsData";

export const App = () => {
    const [quote, setQuote] = useState({id: "", contentItems: []});
    const [parentCommentId, setParentCommentId] = useState(0);

    const {comments, users, updateData} = useCommentsData();

    const handleReplyClick = (commentId) => {
        setParentCommentId(commentId);
    }

    const handleQuoteClick = (quoteData) => {
        handleSetQuote(quoteData);
    }

    const handleSetQuote = (data) => {
        // Parse the JSON string from quoteText
        let contentItems = [];
        try {
            contentItems = JSON.parse(data.quoteText);
        } catch (err) {
            console.error("Invalid JSON in quoteText", err);
            contentItems = [];
        }

        setQuote({
            id: data.commentId,       // store the comment ID
            contentItems: contentItems // parsed array
        });
    };

    return (
        <div className="App">
            <header className="App-header">
                <div style={{marginBottom: "16px"}}>
                    <CommentForm
                        parentId={parentCommentId}
                        setParentId={setParentCommentId}
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
