using Microsoft.EntityFrameworkCore;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<int> AddUserAsync(UserDto userDto)
    {
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Name == userDto.Name && u.Email == userDto.Email);

        if (existingUser != null)
            return existingUser.Id;

        var newUser = new User
        {
            Name = userDto.Name,
            Email = userDto.Email,
            HomePage = userDto.HomePage
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        return newUser.Id;
    }

    public async Task<List<User>> GetUsersAsync()
    {
        return await _context.Users.AsNoTracking().ToListAsync();
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }
}
