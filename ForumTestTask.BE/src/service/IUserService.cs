public interface IUserService
{
    Task<int> AddUserAsync(UserDto userDto);
    Task<List<User>> GetUsersAsync();
    Task<User?> GetUserByIdAsync(int id);
}
