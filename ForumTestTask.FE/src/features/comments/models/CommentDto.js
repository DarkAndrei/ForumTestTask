export class CommentDto {
    constructor({userId, text, parentId = 0}) {
        this.userId = userId;
        this.text = text;
    }
}