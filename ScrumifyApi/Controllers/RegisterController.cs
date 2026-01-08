using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScrumifyApi.Data;
using ScrumifyApi.Models;
using ScrumifyApi.Services;

namespace ScrumifyApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegisterController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ILogger<RegisterController> _logger;

        public RegisterController(
            ApplicationDbContext context, 
            IPasswordHasher passwordHasher,
            ILogger<RegisterController> logger)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                // Validate model state
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Normalize email and username
                var normalizedEmail = request.Email.ToLowerInvariant().Trim();
                var normalizedUsername = request.Username.ToLowerInvariant().Trim();

                // Check if username already exists
                var existingUsername = await _context.Users
                    .AnyAsync(u => u.Username.ToLower() == normalizedUsername);
                    
                if (existingUsername)
                {
                    return BadRequest(new { message = "Username is already taken" });
                }

                // Check if email already exists
                var existingEmail = await _context.Users
                    .AnyAsync(u => u.Email.ToLower() == normalizedEmail);
                    
                if (existingEmail)
                {
                    return BadRequest(new { message = "Email is already registered" });
                }

                // Hash the password using BCrypt
                var passwordHash = _passwordHasher.HashPassword(request.Password);

                // Create new user
                var user = new User
                {
                    FirstName = request.FirstName.Trim(),
                    LastName = request.LastName.Trim(),
                    Username = request.Username.Trim(),
                    Email = normalizedEmail,
                    PasswordHash = passwordHash,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation("New user registered: {Username}", user.Username);

                return Ok(new 
                { 
                    message = "Account successfully created",
                    userId = user.Id
                });
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error during registration");
                return StatusCode(500, new { message = "An error occurred while creating your account. Please try again." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during registration");
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }
    }
}
