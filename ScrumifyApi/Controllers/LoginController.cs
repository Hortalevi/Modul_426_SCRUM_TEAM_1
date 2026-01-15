using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScrumifyApi.Data;
using ScrumifyApi.Models;
using ScrumifyApi.Services;

namespace ScrumifyApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenService _tokenService;
        private readonly ILogger<LoginController> _logger;

        public LoginController(
            ApplicationDbContext context,
            IPasswordHasher passwordHasher,
            IJwtTokenService tokenService,
            ILogger<LoginController> logger)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Validate model state
                if (!ModelState.IsValid)
                {
                    return BadRequest(new LoginResponse
                    {
                        Success = false,
                        Message = "Invalid request data"
                    });
                }

                // Normalize input
                var normalizedInput = request.UsernameOrEmail.ToLowerInvariant().Trim();

                // Find user by username or email
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => 
                        u.Username.ToLower() == normalizedInput || 
                        u.Email.ToLower() == normalizedInput);

                if (user == null)
                {
                    _logger.LogWarning("Login attempt failed: User not found - {Input}", 
                        request.UsernameOrEmail);
                    
                    // Generic error message for security
                    return Unauthorized(new LoginResponse
                    {
                        Success = false,
                        Message = "Invalid username/email or password"
                    });
                }

                // Verify password using BCrypt
                if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
                {
                    _logger.LogWarning("Login attempt failed: Invalid password for user - {Username}", 
                        user.Username);
                    
                    // Generic error message for security
                    return Unauthorized(new LoginResponse
                    {
                        Success = false,
                        Message = "Invalid username/email or password"
                    });
                }

                // Generate JWT token
                var token = _tokenService.GenerateToken(user);

                _logger.LogInformation("User logged in successfully - {Username}", user.Username);

                return Ok(new LoginResponse
                {
                    Success = true,
                    Token = token,
                    Message = "Login successful",
                    User = new UserInfo
                    {
                        Id = user.Id,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        Username = user.Username,
                        Email = user.Email
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login attempt");
                return StatusCode(500, new LoginResponse
                {
                    Success = false,
                    Message = "An error occurred during login. Please try again later."
                });
            }
        }
    }
}
