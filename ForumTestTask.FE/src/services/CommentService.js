export const buildRelationCommentTree = (id, itemsById, used = new Set()) => {
    if (used.has(id)) return null;

    used.add(id);

    const comment = itemsById.get(id);
    if (!comment) return null;

    const children = new Map();

    for (const replyId of comment.replyIds || []) {
        const childTree = buildRelationCommentTree(replyId, itemsById, used);
        if (childTree !== null) {
            children.set(replyId, childTree);
        }
    }

    return children;
}
