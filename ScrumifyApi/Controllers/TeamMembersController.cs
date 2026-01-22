using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScrumifyApi.Data;
using ScrumifyApi.Models;

namespace ScrumifyApi.Controllers
{
    [ApiController]
    [Route("api/scrum-groups/{groupId}/members")]
    public class TeamMembersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TeamMembersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMembers(int groupId)
        {
            var members = await _context.TeamMembers
                .Include(m => m.User)
                .Where(m => m.ScrumGroupId == groupId)
                .Select(m => new {
                    m.Id,
                    m.Role,
                    m.JoinedAt,
                    Name = m.User.FirstName + " " + m.User.LastName,
                    m.User.Email,
                    m.User.Username
                })
                .ToListAsync();

            return Ok(members);
        }

        [HttpPost]
        public async Task<IActionResult> AddMember(int groupId, [FromBody] AddMemberDto dto)
        {
            // Check if group exists
            var groupExists = await _context.ScrumGroups.AnyAsync(g => g.Id == groupId);
            if (!groupExists)
                return NotFound("Scrum group not found");

            // Check if user exists
            var userExists = await _context.Users.AnyAsync(u => u.Id == dto.UserId);
            if (!userExists)
                return NotFound("User not found");

            // Check if already a member
            var alreadyMember = await _context.TeamMembers
                .AnyAsync(m => m.ScrumGroupId == groupId && m.UserId == dto.UserId);
            if (alreadyMember)
                return BadRequest("User is already a member of this group");

            var member = new TeamMember
            {
                UserId = dto.UserId,
                ScrumGroupId = groupId,
                Role = dto.Role
            };

            _context.TeamMembers.Add(member);
            await _context.SaveChangesAsync();

            // Return the member with user details
            var user = await _context.Users.FindAsync(dto.UserId);
            return CreatedAtAction(nameof(GetMembers), new { groupId }, new {
                member.Id,
                member.Role,
                member.JoinedAt,
                Name = user!.FirstName + " " + user.LastName,
                user.Email,
                user.Username
            });
        }

        [HttpPut("{memberId}")]
        public async Task<IActionResult> UpdateMemberRole(int groupId, int memberId, [FromBody] UpdateRoleDto dto)
        {
            var member = await _context.TeamMembers.FindAsync(memberId);
            if (member == null || member.ScrumGroupId != groupId)
                return NotFound();

            member.Role = dto.Role;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{memberId}")]
        public async Task<IActionResult> RemoveMember(int groupId, int memberId)
        {
            var member = await _context.TeamMembers.FindAsync(memberId);
            if (member == null || member.ScrumGroupId != groupId)
                return NotFound();

            _context.TeamMembers.Remove(member);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class AddMemberDto
    {
        public int UserId { get; set; }
        public string Role { get; set; } = "Developer";
    }

    public class UpdateRoleDto
    {
        public string Role { get; set; } = "Developer";
    }
}
