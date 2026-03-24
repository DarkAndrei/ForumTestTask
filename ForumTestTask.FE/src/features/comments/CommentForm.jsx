import {useEffect, useRef, useState} from "react";
import {addComment, addReplyComment} from "./commentApi";
import {addUser} from "../users/userApi";
import {HtmlTagButtons} from "../../components/HtmlTagButtons";
import {
    convertToHtml,
    parseEditorContent,
    replaceBrToN,
    sanitizeContentItems,
    sanitizeText
} from "../../services/CommentService";
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
        if (quote !== null) {
            addQuote(quote);
        }
    }, [quote, setQuote]);

    useEffect(() => {
        setErrors([]);
        buildPreview();
    }, [editableRef]); //does not work fine


    const addQuote = async (quoteData) => {
        console.log("quoteData: ", quoteData);

        const {id: quoteId, contentItems} = quoteData;

        const quoteText =
            contentItems.find(i => i?.type?.toLowerCase() === "text" && i.value?.trim())
                ?.value?.replace(/\n/g, " ") || "[Quote]";

        if (!quoteId || !quoteText.trim()) return;

        const editable = editableRef.current;
        if (!editable) return;

        const lastNode = editable.lastChild;
        if (
            lastNode &&
            ((lastNode.nodeType === Node.ELEMENT_NODE && lastNode.nodeName !== "BR") ||
                (lastNode.nodeType === Node.TEXT_NODE && lastNode.textContent.trim() !== ""))
        ) {
            editable.appendChild(document.createElement("br"));
        }

        // Create the quote span
        const quoteSpan = document.createElement("span");
        quoteSpan.setAttribute(EXTRA_HTML_ATTR.DATA_QUOTE_ID, quoteId);
        quoteSpan.contentEditable = "false";

        //here
        quoteSpan.innerHTML = quoteText;

        editable.appendChild(quoteSpan);


        editable.appendChild(document.createElement("br"));
        const textNode = document.createTextNode("\u00a0");
        editable.appendChild(textNode);

        const range = document.createRange();
        range.setStart(textNode, 0);
        range.collapse(true);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        // Clear quote state
        setQuote({id: "", contentItems: []});
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

        buildPreview();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const textContent = editableRef.current.innerHTML;
        const errors = validateForm({userName, email, homePage, textContent});

        setErrors(errors);

        if (errors.length === 0) {
            try {
                const userResult = await addUser({userName, email, homePage});
                const userId = userResult.data.id;

                const contentItems = parseEditorContent(textContent);
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

                    updateData();

                    setUserName("");
                    setEmail("");
                    setHomePage("");
                    setFile(null);
                    editableRef.current.innerHTML = "";
                    setParentId(0);
                    setPreview("");
                    setErrors([])
                }
            } catch (error) {
                const errorList = parseApiErrors(error);
                setErrors(errorList);
            }
        }
    }

    const validateForm = ({userName, email, homePage, textContent}) => {
        const errors = [];

        if (!userName.trim()) {
            errors.push("Enter your name");
        } else if (userName.length < 3 || userName.length > 50) {
            errors.push("UserName must be between 3 and 50 characters");
        }

        if (!email.trim()) {
            errors.push("Enter your email");
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.push("Email is not a valid e-mail address");
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


    const buildPreview = () => {
        if (!editableRef.current) return;

        const htmlText = editableRef.current.innerHTML;
        const normalizedText = replaceBrToN(htmlText);
        const sanitizedText = convertToHtml(sanitizeText(normalizedText));

        setPreview(sanitizedText);
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
                    onInput={buildPreview}
                ></div>


            </div>
            <input type="file" onChange={(e) => setFile(e.target.files[0])}/>

            <button type="submit">Submit</button>

            {preview && (
                <div
                    className="preview-box"
                    style={{whiteSpace: "pre-line"}}
                    dangerouslySetInnerHTML={{__html: preview}}
                />
            )}

            {errors.length > 0 && (
                <ul className="message-error">
                    {errors.map((err, i) => (
                        <li key={i}>{err}</li>
                    ))}
                </ul>
            )}

            {message && (
                <p className={errors.length > 0 ? "message-error" : "message-success"}>
                    {message}
                </p>
            )}
        </form>
    );
};

export default CommentForm;