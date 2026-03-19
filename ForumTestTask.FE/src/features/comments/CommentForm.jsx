import { useEffect, useRef, useState } from "react";
import { addComment, addReplyComment } from "./commentApi";
import { addUser } from "../users/userApi";
import { HtmlTagButtons } from "../../components/HtmlTagButtons";
import { convertToHtml, sanitizeText } from "../../services/CommentService";
import { CommentDto } from "./models/CommentDto";

export const CommentForm = ({
    parentId = 0,
    setParentId,
    quoteText = "",
    setQuoteText,
    updateData
}) => {
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [homePage, setHomePage] = useState("");
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);
    const editableRef = useRef(null);
    const [preview, setPreview] = useState("");
    const [contentBlocks, setContentBlocks] = useState([]);

    useEffect(() => {
        if (quoteText.trim()) {
            addQuote(quoteText);
            setQuoteText("");
        }
    }, [quoteText]);

    useEffect(() => {
        if (parentId !== 0) {
            addReply(parentId);
        }
    }, [parentId]);

    useEffect(() => {
        buildPreview();
    }, [contentBlocks]);

    const addQuote = (quote) => {
        const editable = editableRef.current;

        const wrapper = document.createElement("div");
        wrapper.className = "quote-wrapper";
        wrapper.contentEditable = "false";

        const quoteDiv = document.createElement("div");
        quoteDiv.className = "quote-block";
        // quoteDiv.innerHTML = sanitizeText(quote);

        wrapper.appendChild(quoteDiv);

        editable.appendChild(wrapper);

        const br = document.createElement("br");
        editable.appendChild(br);

        const range = document.createRange();
        range.setStartAfter(br);
        range.collapse(true);

        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        setContentBlocks((prev) => [...prev, { type: "quote", text: quote }]);
    };

    const addReply = () => {
        setContentBlocks((prev) => {

            const withoutReply = prev.filter(
                (block) => block.type !== "reply"
            );

            return [
                { type: "reply", parentId },
                ...withoutReply
            ];
        });
    }

    const cancelReply = () => {
        setParentId(0);
    };

    const handleInput = () => {
        const editable = editableRef.current;
        const nodes = Array.from(editable.childNodes);

        const newBlocks = nodes
            .map((node) => {
                // sanitizeText(node.textContent);

                if (node.nodeType === Node.ELEMENT_NODE && node.contentEditable === "false") {
                    return { type: "quote", text: node.innerHTML };
                }

                return { type: "text", text: node.textContent || "" };
            })
            .filter(Boolean);


        setContentBlocks(newBlocks);
    }

    const handleClickTagButton = (tag) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        const newNode = document.createTextNode(`[${tag}]${selectedText}[/${tag}]`);
        range.deleteContents();
        range.insertNode(newNode);
        handleInput();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const textContent = editableRef.current.innerHTML;

        // const textContent = contentBlocks
        //     .map((block) => (block.type === "quote" ? `${block.text}` : block.text))
        //     .join("<br>");

        if (!userName.trim() || !email.trim() || !textContent.trim()) return;

        const sanitizedText = sanitizeText(textContent);
        const userId = await addUser({ userName, email, homePage });

        const newCommentDto = new CommentDto({
            userId: userId,
            text: sanitizedText,
        })

        const result =
            parentId === 0
                ? await addComment(newCommentDto, file)
                : await addReplyComment(parentId, newCommentDto, file);

        if (result.success) {
            setMessage("Comment added successfully!");

            updateData();

            setUserName("");
            setEmail("");
            setHomePage("");
            setFile(null);
            editableRef.current.innerHTML = "";
            setContentBlocks([]);
            setParentId(0);
        } else {
            setError(false);
            setMessage(result.message);
            setError(true);
        }


    };

    // const buildPreview = () => {
    //     const textForPreview = contentBlocks
    //         .map(block => block.type === "quote" ? block.text : block.text)
    //         .join("<br>");
    //     const sanitizedText = convertToHtml(sanitizeText(textForPreview));
    //     setPreview(sanitizedText);
    // }
    const buildPreview = () => {
        if (!editableRef.current) return;

        const text = editableRef.current.innerHTML;
        const sanitizedText = convertToHtml(sanitizeText(text));

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

            <HtmlTagButtons handleClickTagButton={handleClickTagButton} />

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
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />

            <button type="submit">Submit</button>

            {preview && (
                <div
                    className="preview-box"
                    dangerouslySetInnerHTML={{ __html: preview }}
                />
            )}

            {message && (
                <p className={error ? "message-error" : "message-success"}>
                    {message}
                </p>
            )}
        </form>
    );
};

export default CommentForm;