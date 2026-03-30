import {useCallback, useEffect, useRef, useState} from "react"
import {convertToHtml, parseEditorContent, renderContent, sanitizeContentItems} from "../../../services/commentService";
import {EXTRA_HTML_ATTR} from "../../../Constants";

export const useCommentFormEditor = ({quote, setQuote, file}) => {
    const editableRef = useRef(null);
    const [preview, setPreview] = useState("");
    const debounceRef = useRef(null);

    useEffect(() => {
        if (!quote?.id) return;
        insertQuote(quote);
    }, [quote]);

    useEffect(() => {
        updatePreview();
    }, [file]);

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
    }

    const insertQuote = useCallback(async (quote) => {
        const {id, contentItems} = quote;
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

        const range = document.createRange();
        range.setStart(br, 0);
        range.collapse(true);

        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        updatePreview();
        setQuote(null);
    }, [quote]);

    const updatePreview = useCallback(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(async () => {
            if (!editableRef.current) return;

            const html = editableRef.current.innerHTML;
            const contentItems = parseEditorContent(html);
            const sanitizedContentItems = sanitizeContentItems(contentItems);

            const result = await renderContent(sanitizedContentItems, file);
            setPreview(convertToHtml(result));
        }, 300);
    }, [file]);

    const clearEditor = () => {
        if (editableRef.current) {
            editableRef.current.innerHTML = "";
            updatePreview?.();
        }
    }

    return {
        editableRef,
        preview,
        handleClickTagButton,
        insertQuote,
        updatePreview,
        clearEditor
    }
}
