import { useRef, useState } from "react";
import { parseEditorContent, sanitizeContentItems } from "../../../services/commentService";
import { addUser } from "../../users/userApi";
import { addComment, addReplyComment } from "../commentApi";
import { parseApiErrors } from "../../parseApiErrors";
import { CommentDto } from "../models/CommentDto";
import { resizeImage, validateFile } from "../../../services/fileService";

export const useCommentFormState = ({
    parentCommentId,
    setParentCommentId,
    updateData,
}) => {
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [homePage, setHomePage] = useState("");
    const [file, setFile] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const validateForm = ({ userName, email, homePage, html }) => {
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

        if (!html?.trim()) {
            errors.push("Text is required");
        }

        return errors;
    }

    const validateAndSubmit = async (html, file) => {
        setMessages([]);
        const validationErrors = validateForm({ userName, email, homePage, html });

        if (validationErrors.length > 0) {
            return setMessages(validationErrors);
        }

        try {
            const userResult = await addUser({ userName, email, homePage });
            const userId = userResult.data.data.id;

            const contentItems = parseEditorContent(html);
            const sanitizedContentItems = sanitizeContentItems(contentItems);

            const newCommentDto = new CommentDto({
                userId: userId,
                contentItems: sanitizedContentItems,
            })

            const commentResult =
                parentCommentId === 0
                    ? await addComment(newCommentDto, file)
                    : await addReplyComment(parentCommentId, newCommentDto, file);

            if (commentResult.success) {
                setMessages((prev) => ["Comment added successfully!"]);
                resetForm();
                updateData();
                resetMessagesAfterDelay();
                return true;
            } else {
                setMessages((prev) => [...prev, commentResult.error]);
                return false;
            }

        } catch (error) {
            const errorList = parseApiErrors(error);
            setMessages(errorList);
            return false;
        }
    }

    const handleCancelReply = () => {
        setParentCommentId?.(0);
    };

    const handleAttachFile = async (e) => {
        const file = e.target.files[0];
        setMessages([]);

        if (!file) return;

        const isFileValid = await validateFile(file);

        if (!isFileValid) {
            fileInputRef.current.value = "";
            setMessages(prev => [...prev, "Invalid file"]);
            return;
        }

        let finaleResult = file;

        if (file.type.startsWith("image/")) {
            finaleResult = await resizeImage(finaleResult);
        }

        setFile(finaleResult);

    }

    const handleRemoveFile = () => {
        if (fileInputRef.current) {
            setFile(null);
            fileInputRef.current.value = "";
        }
    }


    const resetForm = () => {
        setUserName("");
        setEmail("");
        setHomePage("");
        setFile(null);
        setParentCommentId?.(0);
        setFile(null);
        fileInputRef.current.value = "";
    }

    const resetMessagesAfterDelay = (delay = 5000) => {
        setTimeout(() => {
            setMessages([]);
        }, delay);
    }

    return {
        userName, setUserName,
        email, setEmail,
        homePage, setHomePage,
        file, setFile,
        messages, setMessages,
        validateAndSubmit,
        resetForm,
        resetMessagesAfterDelay,
        isSubmitting, setIsSubmitting,
        handleAttachFile, handleRemoveFile,
        fileInputRef,
        handleCancelReply,
    }
}
