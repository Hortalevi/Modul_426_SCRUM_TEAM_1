using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ScrumifyApi.Models
{
    public class TeamMember
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [Required]
        public int ScrumGroupId { get; set; }

        [ForeignKey("ScrumGroupId")]
        public virtual ScrumGroup ScrumGroup { get; set; } = null!;

        [Required]
        [StringLength(50)]
        public string Role { get; set; } = "Developer";

        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }
}
