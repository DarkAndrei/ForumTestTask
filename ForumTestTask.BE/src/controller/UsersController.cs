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
    public IActionResult AddUser([FromBody] UserDto userDto)
    {
        Console.WriteLine($"Received user: {userDto.UserName}, {userDto.Email}, {userDto.HomePage}");

        if (!ModelState.IsValid)
            return BadRequest(new { success = false, errors = ModelState });

        var existingUser = _context.Users
            .FirstOrDefault(u => u.UserName == userDto.UserName && u.Email == userDto.Email);

        if (existingUser != null)
            return Ok(new { success = true, data = new { id = existingUser.Id } });

        var newUser = new User
        {
            UserName = userDto.UserName,
            Email = userDto.Email,
            HomePage = userDto.HomePage
        };

        _context.Users.Add(newUser);
        _context.SaveChanges();

        return CreatedAtAction(nameof(AddUser), new { id = newUser.Id }, new
        {
            success = true,
            data = new { id = newUser.Id }
        });
    }

    [HttpGet]
    public IActionResult GetUsers()
    {
        var users = _context.Users.ToList();
        if (users == null || !users.Any())
        {
            return BadRequest(new { success = false, Message = "No users found." });
        }

        return Ok(new { success = true, data = users });
    }

    [HttpGet("{id}")]
    public IActionResult GetUser(int id)
    {
        var userDto = _context.Users.Find(id);
        if (userDto == null)
        {
            return BadRequest(new { success = false, Message = "User not found." });
        }
        return Ok(new { success = true, data = userDto });
    }



    //temporarily file for accepting a list of users from JSON
    [HttpPost("bulk")]
    public IActionResult AddUsers([FromBody] List<UserDto> usersDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, errors = ModelState });


        if (usersDto == null || !usersDto.Any())
            return BadRequest(new { success = false, Message = "No users provided." });

        var result = new List<object>();

        foreach (var userDto in usersDto)
        {
            // Check if user already exists
            var existingUser = _context.Users
                .FirstOrDefault(u => u.UserName == userDto.UserName && u.Email == userDto.Email);

            if (existingUser != null)
            {
                result.Add(new { UserName = userDto.UserName, Email = userDto.Email, Id = existingUser.Id });
                continue;
            }

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

        return Ok(new { success = true, data = result });
    }
}
