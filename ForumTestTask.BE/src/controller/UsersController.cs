using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public IActionResult CreateUser(UserDto userDto)
    {
        var existingUser = _context.Users.FirstOrDefault(u => u.UserName == userDto.UserName && u.Email == userDto.Email);

        if (existingUser != null)
        {
            return Ok(existingUser.Id);
        }

        var newUser = new User
        {
            UserName = userDto.UserName,
            Email = userDto.Email,
            HomePage = userDto.HomePage
        };

        _context.Users.Add(newUser);
        _context.SaveChanges();
        return Ok(newUser.Id);
    }

    // Accepts a list of users from JSON
    [HttpPost("bulk")]
    public IActionResult CreateUsers([FromBody] List<UserDto> usersDto)
    {
        if (usersDto == null || !usersDto.Any())
            return BadRequest("No users provided.");

        var result = new List<object>();

        foreach (var userDto in usersDto)
        {
            // Check if user already exists
            var existingUser = _context.Users
                .FirstOrDefault(u => u.UserName == userDto.UserName && u.Email == userDto.Email);

            if (existingUser != null)
            {
                // Add existing user's Id
                result.Add(new { UserName = userDto.UserName, Email = userDto.Email, Id = existingUser.Id });
                continue;
            }

            // Create new user
            var newUser = new User
            {
                UserName = userDto.UserName,
                Email = userDto.Email,
                HomePage = userDto.HomePage
            };

            _context.Users.Add(newUser);
            _context.SaveChanges();

            result.Add(new { UserName = userDto.UserName, Email = userDto.Email, Id = newUser.Id });
        }

        return Ok(result);
    }

    [HttpGet]
    public IActionResult GetUsers()
    {
        var users = _context.Users.ToList();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public IActionResult GetUser(int id)
    {
        var userDto = _context.Users.Find(id);
        if (userDto == null)
        {
            return NotFound("User not found.");
        }
        return Ok(userDto);
    }
}
