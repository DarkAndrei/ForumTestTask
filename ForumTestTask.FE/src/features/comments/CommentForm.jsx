import {HtmlTagButtons} from "../../components/HtmlTagButtons";
import {useCommentFormState} from "./hooks/useCommentFormState";
import {useCommentFormEditor} from "./hooks/useCommentFormEditor";


export const CommentForm = ({
                                parentCommentId = 0,
                                setParentCommentId,
                                quote,
                                setQuote,
                                updateData
                            }) => {
    const form = useCommentFormState({
        parentCommentId,
        updateData,
        setParentCommentId,
    });

    const {
        editableRef,
        preview,
        updatePreview,
        handleClickTagButton,
        clearEditor
    } = useCommentFormEditor({quote, setQuote, file: form.file});


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.isSubmitting) return;
        if (!editableRef.current) return;

        form.setIsSubmitting(true);

        try {
            const html = editableRef.current?.innerHTML || "";
            const isValidatedAndSubmitted =
                await form.validateAndSubmit(html, form.file);

            if (isValidatedAndSubmitted) {
                clearEditor();
            }
        } catch (error) {
            console.error("Submit error:", error);
        } finally {
            form.setIsSubmitting(false);
        }
    };

    const handleClickCancelReplyButton = () => {
        setParentCommentId?.(0);
    };

    return (
        <form onSubmit={handleSubmit} className="comment-form">
            <div className="form-group">
                <label>User Name</label>
                <input
                    type="text"
                    placeholder="Enter your name..."
                    value={form.userName}
                    onChange={(e) => form.setUserName(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Email</label>
                <input
                    type="text"
                    placeholder="Enter your email..."
                    value={form.email}
                    onChange={(e) => form.setEmail(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Home Page (optional)</label>
                <input
                    type="text"
                    placeholder="https://example.com"
                    value={form.homePage}
                    onChange={(e) => form.setHomePage(e.target.value)}
                />
            </div>

            <div>
                <label>Comment</label>
                <HtmlTagButtons handleClickTagButton={handleClickTagButton}/>

                <div
                    ref={editableRef}
                    contentEditable
                    className="comment-editor"
                    onInput={updatePreview}
                ></div>
                {parentCommentId !== 0 && (
                    <div className="reply-box">
                        Reply to comment with ID: {parentCommentId}
                        <button type="button" className="reply-close" onClick={handleClickCancelReplyButton}>
                            ×
                        </button>
                    </div>
                )}
            </div>

            <div className="form-group">
                <label>Attach file (optional)</label>
                <input
                    type="file"
                    ref={form.fileInputRef}
                    onChange={(e) => form.handleAttachFileCLick(e)}
                />
                {form.file &&
                    <div className="file-info">
                        <button
                            className="remove-file-button"
                            type="button"
                            onClick={form.handleClickRemoveFileButton}
                        >
                            Remove file
                        </button>
                    </div>
                }
            </div>
            <button
                type="submit"
                className="submit-button"
                disabled={form.isSubmitting}
            >
                {form.isSubmitting ? "Submitting..." : "Submit"}
            </button>

            {preview && (
                <div className="form-group">
                    <label>Comment preview</label>

                    <div
                        className="preview-box"
                        dangerouslySetInnerHTML={{__html: preview}}
                    />
                </div>
            )}

            {form.messages && form.messages.length > 0 && (
                <ul className="messages-list">
                    {form.messages.map((message, index) => {
                        const messageStr = String(message || '').toLowerCase();
                        const isSuccess = messageStr.includes("successfully");

                        return (
                            <li
                                key={index}
                                className={isSuccess ? "message-success" : "message-error"}
                            >
                                {message}
                            </li>
                        );
                    })}
                </ul>
            )}
        </form>
    );
};

export default CommentForm;
