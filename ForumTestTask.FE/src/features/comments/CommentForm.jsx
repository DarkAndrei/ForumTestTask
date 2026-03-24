import {useEffect, useRef, useState} from "react";
import {addComment, addReplyComment} from "./commentApi";
import {addUser} from "../users/userApi";
import {HtmlTagButtons} from "../../components/HtmlTagButtons";
import {convertToHtml, parseEditorContent, renderContent, sanitizeContentItems} from "../../services/CommentService";
import {CommentDto} from "./models/CommentDto";
import {parseApiErrors} from "../parseApiErrors";
import {EXTRA_HTML_ATTR} from "../../Constants";

export const CommentForm = ({
                                parentId = 0,
                                setParentId,
                                quote,
                                setQuote,
                                updateData
                            }) => {
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [homePage, setHomePage] = useState("");
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const editableRef = useRef(null);
    const [preview, setPreview] = useState("");
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        if (!quote) return;
        insertQuote(quote);
    }, [quote]);

    const insertQuote = async (quoteData) => {
        const {id, contentItems} = quoteData;
        if (!id) return;

        const editable = editableRef.current;
        if (!editable) return;

        const text = contentItems
            ?.find(i => i?.type?.toLowerCase() === "text" && i.value?.trim())
            ?.value || "[Quote]";

        const span = document.createElement("span");
        span.setAttribute(EXTRA_HTML_ATTR.DATA_QUOTE_ID, id);
        span.contentEditable = "false";
        span.innerHTML = text;

        editable.appendChild(span);

        const textNode = document.createTextNode("\u00a0");
        editable.appendChild(textNode);

        const range = document.createRange();
        range.setStart(textNode, 0);
        range.collapse(true);

        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        updatePreview();
        setQuote(null);
    };

    const cancelReply = () => {
        setParentId(0);
    };

    const handleClickTagButton = (tag) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const selectedText = range.toString();

        const span = document.createElement("span");
        span.textContent = `[${tag}]${selectedText}[/${tag}]`;

        range.deleteContents();
        range.insertNode(span);

        updatePreview();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const html = editableRef.current.innerHTML;
        const errors = validateForm({userName, email, homePage, html});

        setErrors(errors);

        if (errors.length === 0) return;

        try {
            const userResult = await addUser({userName, email, homePage});
            const userId = userResult.data.id;

            const contentItems = parseEditorContent(html);
            const sanitizedContentItems = sanitizeContentItems(contentItems);

            const newCommentDto = new CommentDto({
                userId: userId,
                contentItems: sanitizedContentItems,
            })

            const commentResult =
                parentId === 0
                    ? await addComment(newCommentDto, file)
                    : await addReplyComment(parentId, newCommentDto, file);

            if (commentResult.success) {
                setMessage("Comment added successfully!");
                resetForm();
                updateData();
            }
        } catch (error) {
            const errorList = parseApiErrors(error);
            setErrors(errorList);
        }
    }

    const resetForm = () => {
        setUserName("");
        setEmail("");
        setHomePage("");
        setFile(null);
        setPreview("");
        setErrors([]);
        editableRef.current.innerHTML = "";
        setParentId(0);
    };

    const validateForm = ({userName, email, homePage, textContent}) => {
        const errors = [];

        if (!userName.trim()) errors.push("Enter your name");
        if (userName.length < 3 || userName.length > 50) errors.push("UserName must be between 3 and 50 characters");


        if (!email.trim()) {
            errors.push("Enter your email");
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.push("Invalid email");
            }
        }

        if (homePage?.trim()) {
            try {
                const url = new URL(homePage);
                if (!["http:", "https:", "ftp:"].includes(url.protocol)) {
                    errors.push("HomePage must be a valid http, https, or ftp URL");
                }
            } catch {
                errors.push("HomePage must be a valid http, https, or ftp URL");
            }
        }

        if (!textContent?.trim()) {
            errors.push("Text is required");
        }

        return errors;
    };

    const updatePreview = async () => {
        if (!editableRef.current) return;

        const html = editableRef.current.innerHTML;
        const contentItems = parseEditorContent(html);
        const sanitizedContentItems = sanitizeContentItems(contentItems);
        const result = await renderContent(sanitizedContentItems);

        setPreview(convertToHtml(result));
    };

    return (
        <form onSubmit={handleSubmit} className="comment-form">
            <input
                type="text"
                placeholder="Write your name..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
            />

            <input
                type="text"
                placeholder="Write your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="text"
                placeholder="Write your home page..."
                value={homePage}
                onChange={(e) => setHomePage(e.target.value)}
            />

            <HtmlTagButtons handleClickTagButton={handleClickTagButton}/>

            <div>
                {parentId !== 0 &&
                    <div className="reply-box">
                        Reply to user with ID: {parentId}
                        <button
                            type="button"
                            className="reply-close"
                            onClick={cancelReply}
                        >
                            ×
                        </button>
                    </div>
                }

                <div
                    ref={editableRef}
                    contentEditable
                    className="comment-editor"
                    onInput={updatePreview}
                ></div>


            </div>
            <input type="file" onChange={(e) => setFile(e.target.files[0])}/>

            <button type="submit">Submit</button>

            {preview && (
                <div
                    className="preview-box"
                    dangerouslySetInnerHTML={{__html: preview}}
                />
            )}

            {errors.length > 0 && (
                <ul className="message-error">
                    {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
            )}

            {message && <p className="message-success">{message}</p>}
        </form>
    );
};

export default CommentForm;