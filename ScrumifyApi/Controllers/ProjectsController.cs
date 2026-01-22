using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScrumifyApi.Data;
using ScrumifyApi.DTOs;
using ScrumifyApi.Models;

namespace ScrumifyApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProjectsController> _logger;

        public ProjectsController(ApplicationDbContext context, ILogger<ProjectsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get all projects
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectResponseDto>>> GetProjects([FromQuery] int? teamId = null)
        {
            try
            {
                var query = _context.Projects.Include(p => p.Team).AsQueryable();

                // Filter by team if teamId is provided
                if (teamId.HasValue)
                {
                    query = query.Where(p => p.TeamId == teamId.Value);
                }

                var projects = await query
                    .Select(p => new ProjectResponseDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Description = p.Description,
                        CreatedAt = p.CreatedAt,
                        TeamId = p.TeamId,
                        TeamName = p.Team.Name
                    })
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();

                return Ok(projects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving projects");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get a specific project by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectResponseDto>> GetProject(int id)
        {
            try
            {
                var project = await _context.Projects
                    .Include(p => p.Team)
                    .Where(p => p.Id == id)
                    .Select(p => new ProjectResponseDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Description = p.Description,
                        CreatedAt = p.CreatedAt,
                        TeamId = p.TeamId,
                        TeamName = p.Team.Name
                    })
                    .FirstOrDefaultAsync();

                if (project == null)
                {
                    return NotFound($"Project with ID {id} not found");
                }

                return Ok(project);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving project {ProjectId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Create a new project
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ProjectResponseDto>> CreateProject([FromBody] CreateProjectDto createProjectDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(createProjectDto.Name))
                {
                    return BadRequest("Project name is required");
                }

                // Verify team exists
                var teamExists = await _context.Teams.AnyAsync(t => t.Id == createProjectDto.TeamId);
                if (!teamExists)
                {
                    return BadRequest($"Team with ID {createProjectDto.TeamId} does not exist");
                }

                var project = new Project
                {
                    Name = createProjectDto.Name.Trim(),
                    Description = createProjectDto.Description?.Trim(),
                    TeamId = createProjectDto.TeamId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Projects.Add(project);
                await _context.SaveChangesAsync();

                // Load the team for the response
                await _context.Entry(project).Reference(p => p.Team).LoadAsync();

                var responseDto = new ProjectResponseDto
                {
                    Id = project.Id,
                    Name = project.Name,
                    Description = project.Description,
                    CreatedAt = project.CreatedAt,
                    TeamId = project.TeamId,
                    TeamName = project.Team.Name
                };

                return CreatedAtAction(nameof(GetProject), new { id = project.Id }, responseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating project");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update an existing project
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(int id, [FromBody] UpdateProjectDto updateProjectDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(updateProjectDto.Name))
                {
                    return BadRequest("Project name is required");
                }

                var project = await _context.Projects.FindAsync(id);
                if (project == null)
                {
                    return NotFound($"Project with ID {id} not found");
                }

                // Verify team exists if changing team
                if (project.TeamId != updateProjectDto.TeamId)
                {
                    var teamExists = await _context.Teams.AnyAsync(t => t.Id == updateProjectDto.TeamId);
                    if (!teamExists)
                    {
                        return BadRequest($"Team with ID {updateProjectDto.TeamId} does not exist");
                    }
                }

                project.Name = updateProjectDto.Name.Trim();
                project.Description = updateProjectDto.Description?.Trim();
                project.TeamId = updateProjectDto.TeamId;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating project {ProjectId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Delete a project
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            try
            {
                var project = await _context.Projects.FindAsync(id);
                if (project == null)
                {
                    return NotFound($"Project with ID {id} not found");
                }

                _context.Projects.Remove(project);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting project {ProjectId}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
