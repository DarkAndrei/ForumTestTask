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
        var existingUser = _context.Users.Include(u => u.Comments).FirstOrDefault(u => u.UserName == userDto.UserName && u.Email == userDto.Email);

        if (existingUser != null)
        {
            return BadRequest("User with this name already exists.");
        }
        var user = new User
        {
            UserName = userDto.UserName,
            Email = userDto.Email
        };

        _context.Users.Add(user);
        _context.SaveChanges();
        return Ok(user);
    }

    [HttpGet]
    public IActionResult GetUsers()
    {
        var users = _context.Users.Include(u => u.Comments).ToList();
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
