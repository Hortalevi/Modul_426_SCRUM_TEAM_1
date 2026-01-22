using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScrumifyApi.Data;

namespace ScrumifyApi.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.FirstName,
                    u.LastName,
                    Name = u.FirstName + " " + u.LastName
                })
                .ToListAsync();

            return Ok(users);
        }

        // Get users NOT already in a specific group (for the add member dropdown)
        [HttpGet("available/{groupId}")]
        public async Task<IActionResult> GetAvailableUsers(int groupId)
        {
            var existingMemberIds = await _context.TeamMembers
                .Where(m => m.ScrumGroupId == groupId)
                .Select(m => m.UserId)
                .ToListAsync();

            var availableUsers = await _context.Users
                .Where(u => !existingMemberIds.Contains(u.Id))
                .Select(u => new {
                    u.Id,
                    u.Username,
                    u.Email,
                    Name = u.FirstName + " " + u.LastName
                })
                .ToListAsync();

            return Ok(availableUsers);
        }
    }
}
