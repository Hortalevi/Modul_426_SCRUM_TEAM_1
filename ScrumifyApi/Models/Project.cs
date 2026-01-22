using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ScrumifyApi.Models
{
    /// <summary>
    /// Represents a Project entity that belongs to a Team
    /// </summary>
    public class Project
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key
        [Required]
        public int TeamId { get; set; }

        // Navigation property
        [ForeignKey("TeamId")]
        public virtual ScrumGroup Team { get; set; } = null!;
    }
}
