namespace ScrumifyApi.DTOs
{
    /// <summary>
    /// Data Transfer Object for Project creation
    /// </summary>
    public class CreateProjectDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TeamId { get; set; }
    }

    /// <summary>
    /// Data Transfer Object for Project updates
    /// </summary>
    public class UpdateProjectDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TeamId { get; set; }
    }

    /// <summary>
    /// Data Transfer Object for Project responses
    /// </summary>
    public class ProjectResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public int TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
    }
}
