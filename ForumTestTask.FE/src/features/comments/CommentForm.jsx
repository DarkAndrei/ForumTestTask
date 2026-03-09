import {useEffect, useRef, useState} from "react";
import {addComment} from "./commentApi";
import addUser from "../users/userApi";
import BaseTagButtons from "../../components/BaseTagButtons";
import DOMPurify from "dompurify";

export const CommentForm = () => {
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);
    const textareaRef = useRef(null);
    const [preview, setPreview] = useState(null);

    const ALLOWED_TAGS = ["a", "b", "i", "strong", "code"];
    const ALLOWED_ATTR = ["href", "title"];
    const COMMENT_SUCCESSES = "Comment added successfully!";

    useEffect(() => {
        setPreview(sanitizeUserInput(text));
    }, [text]);

    const handleSubmit = async (e) => {
        e.preventDefault(); // this is need better understand
        if (!userName.trim() || !email.trim() || !text.trim()) return;

        console.log("before sanitize:", text);
        const safeText = sanitizeUserInput(text);
        console.log("after sanitizer^", safeText);

        if (!validateXHTML(safeText)) {
            setMessage("Does not complete tag HTML.");
            setError(true);
            return;
        }

        const user = {
            username: userName,
            email: email
        }
        const userId = await addUser(user);

        const newComment = {
            userId: userId,
            text: safeText
        };
        const result = await addComment(newComment, file);

        if (!result.success) {
            setMessage(result.message);
            setError(true);
            return;
        }

        setMessage(COMMENT_SUCCESSES);

        setUserName('');
        setEmail('');
        setText('');
        setFile(null);
        setError(false);
        setPreview("");
        e.target.reset();
    }

    const sanitizeUserInput = (input) =>
        DOMPurify.sanitize(input, {ALLOWED_TAGS: ALLOWED_TAGS, ALLOWED_ATTR: ALLOWED_ATTR});

    const validateXHTML = (safeText) => {
        try {
            const parser = new DOMParser();
            const wrapped = `<root>${safeText}</root>`;

            const doc = parser.parseFromString(wrapped, "application/xml");
            const parserError = doc.getElementsByTagName("parsererror");
            return parserError.length === 0;
        } catch (e) {
            return false;
        }
    }

    const handleClickTagButton = (tag) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const before = text.substring(0, start);
        const selected = text.substring(start, end);
        const after = text.substring(end);

        // Wrap selected text with tag, or just insert empty tag
        const newText = `${before}<${tag}>${selected}</${tag}>${after}`;

        setText(newText);

        // Move cursor inside the tag if nothing selected
        const pos = selected ? end + tag.length * 2 + 5 : start + tag.length + 2;
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(pos, pos);
        }, 0);
    }

    return (
        <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: "8px", maxWidth: "400px"}}>
            <input
                type="text"
                placeholder="Write your name..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}/>
            <input
                type="text"
                placeholder="Write your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}/>
            <div>
                <BaseTagButtons
                    handleClickTagButton={handleClickTagButton}
                />
                <textarea
                    ref={textareaRef}
                    placeholder="Write a comment..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}/>
            </div>

            <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}/>

            {/*<ReCAPTCHA*/}
            {/*    sitekey={SITE_KEY}*/}
            {/*    onChange={(token) => setCaptchaToken(token)}*/}
            {/*/>*/}

            <button type="submit">Add Comment</button>

            <div
                style={{border: "1px solid #ccc", padding: "8px", marginTop: "8px"}}
                dangerouslySetInnerHTML={{__html: preview}}
            />

            {message && (
                <p style={{color: error ? "red" : "green"}}>
                    {message}
                </p>
            )}
        </form>
    )
}

export default CommentForm;