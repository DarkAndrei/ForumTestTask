import {useEffect, useRef, useState} from "react";
import {addComment, addReplyComment} from "./commentApi";
import {addUser, getUser} from "../users/userApi";
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

    useEffect(() => {
        updatePreview();
    }, [file, setFile])

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
        span.innerHTML = convertToHtml(text);

        editable.appendChild(span);

        const br = document.createElement("br");
        editable.appendChild(br);

        // const spaceNode = document.createTextNode("");
        // editable.appendChild(spaceNode);

        const range = document.createRange();
        range.setStart(br, 0);
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
        const errors = await validateForm({userName, email, homePage, html});

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
            setMessage("");
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

    const validateForm = async ({userName, email, homePage, textContent}) => {
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

    const handleRemoveFile = () => {
        setFile(null);
    };

    const updatePreview = async () => {
        if (!editableRef.current) return;
        console.log('Editing preview');

        const html = editableRef.current.innerHTML;
        const contentItems = parseEditorContent(html);
        const sanitizedContentItems = sanitizeContentItems(contentItems);
        const result = await renderContent(sanitizedContentItems, file);

        setPreview(convertToHtml(result));
    };

    return (
        <form onSubmit={handleSubmit} className="comment-form">
            <div className="form-group">
                <label>User Name</label>
                <input
                    type="text"
                    placeholder="Enter your name..."
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Email</label>
                <input
                    type="text"
                    placeholder="Enter your email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Home Page (optional)</label>
                <input
                    type="text"
                    placeholder="https://example.com"
                    value={homePage}
                    onChange={(e) => setHomePage(e.target.value)}
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
                {parentId !== 0 && (
                    <div className="reply-box">
                        Reply to user with ID: {getUser(parentId)}
                        <button type="button" className="reply-close" onClick={cancelReply}>
                            ×
                        </button>
                    </div>
                )}
            </div>

            <div className="form-group">
                <label>Attach file (optional)</label>
                <input
                    type="file"
                    onChange={(e) => {
                        const f = e.target.files[0];
                        setFile(f);
                        updatePreview();
                    }}/>
                {file && <button
                    className="remove-file-button"
                    type="button"
                    onClick={handleRemoveFile}
                >
                    Remove file
                </button>}
            </div>
            <button type="submit" className="submit-button">Submit</button>

            {preview && (
                <div className="form-group">
                    <label>Comment preview</label>

                    <div
                        className="preview-box"
                        dangerouslySetInnerHTML={{__html: preview}}
                    />
                </div>
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