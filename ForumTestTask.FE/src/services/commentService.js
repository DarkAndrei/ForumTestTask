import DOMPurify from "dompurify";
import { EXTRA_HTML_ATTR, HTML_ATTR, HTML_TAGS } from "../Constants";
import { getCommentById } from "../features/comments/commentApi";

export const convertToHtml = (input) => {
    if (!input) return "";

    if (Array.isArray(input)) {
        input = input
            .map(item => item.type === "text" ? item.value : "")
            .join("\n");
    }
    return input
        .replace(/\[b](.*?)\[\/b]/gi, "<b>$1</b>")
        .replace(/\[i](.*?)\[\/i]/gi, "<i>$1</i>")
        .replace(/\[strong](.*?)\[\/strong]/gi, "<strong>$1</strong>")
        .replace(/\[code](.*?)\[\/code]/gi, "<code>$1</code>")
        .replace(/\[a](.*?)\|(.*?)\[\/a]/gi, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\[a](.*?)\[\/a]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
};

export const sanitizeText = (input) => {
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [
            HTML_TAGS.CODE,
            HTML_TAGS.ANCHOR,
            HTML_TAGS.ITALIC,
            HTML_TAGS.STRONG
        ],
        ALLOWED_ATTR: [
            HTML_ATTR.HREF,
            HTML_ATTR.TITLE,
            EXTRA_HTML_ATTR.DATA_QUOTE_ID
        ],
    });
}

export const sanitizeContentItems = (items) => {
    return items.map(item => {
        if (item.type === "text") {
            return {
                ...item,
                value: sanitizeText(item.value)
            };
        }
        return item;
    });
};

export const parseEditorContent = (html) => {
    const container = document.createElement("div");
    container.innerHTML = html;

    const result = [];

    const content = (node) => {
        if (
            node.nodeType === Node.ELEMENT_NODE &&
            node.hasAttribute("data-quote-id")
        ) {
            const id = Number(node.getAttribute("data-quote-id"));
            result.push({ type: "quote", id });
            return;
        }

        if (node.nodeName === "BR") {
            result.push({ type: "text", value: "<br>" });
            return;
        }

        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.replace(/\u00a0/g, " ");
            if (text.trim()) {
                result.push({ type: "text", value: text });
            }
            return;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            node.childNodes.forEach(content);
        }
    };

    container.childNodes.forEach(content);

    return result;
};

export const renderContent = async (itemsInput, file) => {
    if (!itemsInput) return "";

    const items = Array.isArray(itemsInput) ? itemsInput : JSON.parse(itemsInput);
    if (!Array.isArray(items)) return "";

    const parts = [];

    if (file) {
        const previewUrl = URL.createObjectURL(file);

        if (file.type.startsWith("image/")) {
            parts.push(`<div class="file-preview"><img src="${previewUrl}" alt="preview"/></div>`);
        } else {
            parts.push(`<div class="file-preview"><a href="${previewUrl}" target="_blank" rel="noreferrer">${file.name}</a></div>`);
        }
    }

    for (const item of items) {
        const type = item.type.toLowerCase();

        if (!type) continue;

        if (type === "text") {
            if (item.value === "<br>") {
            } else {
                parts.push(sanitizeText(item.value));
                parts.push("<br>");
            }
        }

        if (type === "quote" && item.id) {
            try {
                const resp = await getCommentById(item.id);
                if (!resp?.success || !resp?.data.data) {
                    parts.push(`<div class="quote-block">Quote not found</div>`);
                    continue;
                }

                const quoteItems = resp.data.data.contentItems;
                const quoteText = getFirstTextValue(
                    Array.isArray(quoteItems) ? quoteItems : JSON.parse(quoteItems)
                );

                parts.push(`<div class="quote-block" contenteditable="false" data-quote-id="${item.id}">${quoteText}</div>`);
            } catch {
                parts.push(`<div class="quote-block">Quote not found</div>`);
            }
        }
    }

    return parts.join("");
};

export const getDateString = (date) => {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} в ${hours}:${minutes}:${seconds}`;
};

const getFirstTextValue = (items) => {
    if (!Array.isArray(items)) return "[Quote]";

    const firstValid = items.find(i => i?.type?.toLowerCase() === "text" && i.value?.trim());

    return firstValid?.value?.replace(/\n/g, " ") || "[Quote]";
};
