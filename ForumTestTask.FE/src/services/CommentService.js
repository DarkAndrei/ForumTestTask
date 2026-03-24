import DOMPurify from "dompurify";
import {EXTRA_HTML_ATTR, EXTRA_HTML_TAGS, HTML_ATTR, HTML_TAGS} from "../Constants";

export const buildCommentTrees = (allComments) => {
    const itemsById = new Map();
    allComments.forEach(c => itemsById.set(c.id, c));

    // Identify top-level comments: comments that are not referenced in any replyIds
    const replyIdsSet = new Set();
    allComments.forEach(c => {
        (c.replyIds || []).forEach(id => replyIdsSet.add(id));
    });

    const topLevelComments = allComments.filter(c => !replyIdsSet.has(c.id));

    // Build tree for each top-level comment
    const buildTree = (comment) => {
        const children = (comment.replyIds || [])
            .slice()
            .reverse()
            .map(id => {
                const child = itemsById.get(id);
                if (!child) return null;
                return buildTree(child);
            }).filter(Boolean); // remove nulls

        return {...comment, children};
    };

    return topLevelComments.map(buildTree);
};

export const sortByUserName = (users, mapComments) => {
    const sortedUsers = Object.values(users).sort((a, b) =>
        a.userName.localeCompare(b.userName)
    );

    const sortedMapComments = new Map();

    for (const user of sortedUsers) {
        for (const [commentId, commentData] of mapComments.entries()) {
            if (commentData.userId === user.id) {
                sortedMapComments.set(commentId, commentData);
            }
        }
    }

    return sortedMapComments;
}

export const sortByEmail = (users, mapComments) => {
    const sortedUsers = Object.values(users).sort((a, b) =>
        a.email.localeCompare(b.email)
    );

    const sortedMapComments = new Map();

    for (const user of sortedUsers) {
        for (const [commentId, commentData] of mapComments.entries()) {
            if (commentData.userId === user.id) {
                sortedMapComments.set(commentId, commentData);
            }
        }
    }

    return sortedMapComments;
}

export const sortByCreatedAt = (mapComments) => {
    return new Map(
        [...mapComments.entries()].sort(([, a], [, b]) =>
            a.createdAt.localeCompare(b.createdAt)
        )
    );
}

export const reverseMap = (mapComments) => {
    return new Map(
        [...mapComments.entries()].reverse());
}

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
        .replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>")
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
            ,
            EXTRA_HTML_TAGS.SPAN
        ],
        ALLOWED_ATTR: [
            HTML_ATTR.HREF,
            HTML_ATTR.TITLE
            ,
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

export const replaceBrToN = (input) => {
    return input.replace(/<div><br><\/div>/gi, '\n')
        .replace(/<div>/gi, '\n')
        .replace(/<\/div>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/^\s*\n+/, "");
}

export const parseEditorContent = (html) => {
    const container = document.createElement("div");
    container.innerHTML = html;

    const result = [];

    container.childNodes.forEach(node => {
        // TEXT NODE
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.replace(/\u00a0/g, " ").trim();
            if (text) {
                result.push({type: "text", value: text});
            }
        }

        // BR → treat as newline
        if (node.nodeName === "BR") {
            result.push({type: "text", value: "\n"});
        }

        // QUOTE NODE
        if (
            node.nodeType === Node.ELEMENT_NODE &&
            node.hasAttribute("data-quote-id")
        ) {
            const id = Number(node.getAttribute("data-quote-id"));
            result.push({type: "quote", id});
        }

        // OTHER ELEMENTS (optional: keep formatting)
        if (
            node.nodeType === Node.ELEMENT_NODE &&
            !node.hasAttribute("data-quote-id") &&
            node.nodeName !== "BR"
        ) {
            const text = node.textContent.replace(/\u00a0/g, " ").trim();
            if (text) {
                result.push({type: "text", value: text});
            }
        }
    });

    return result;
};
