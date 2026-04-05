public interface ICommentService
{
    Task<Comment?> AddCommentAsync(CreateCommentDto createCommentDto, IFormFile? file, int? parentId = null);
    Task<Comment?> AddReplyAsync(int parentId, CreateCommentDto createCommentDto, IFormFile? file);
    Task<List<Comment>> GetCommentsAsync();
    Task<(List<CommentResponseDto> comments, int totalItems, int totalPages)> GetCommentsByPageAsync(int pageNumber, SortType sortType);
    Task<Comment?> GetCommentByIdAsync(int id);
}
