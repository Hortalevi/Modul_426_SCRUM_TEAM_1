using Microsoft.EntityFrameworkCore;
using ScrumifyApi.Models;

namespace ScrumifyApi.Data
{
    /// <summary>
    /// Entity Framework DbContext for the Team Dashboard application
    /// </summary>
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Team> Teams { get; set; } = null!;
        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<ScrumGroup> ScrumGroups { get; set; } = null!;
        public DbSet<TeamMember> TeamMembers { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(e => e.Id);
                entity.HasIndex(u => u.Username).IsUnique();
                entity.HasIndex(u => u.Email).IsUnique();
            });

            // Configure Team entity
            modelBuilder.Entity<Team>(entity =>
            {
                entity.ToTable("teams");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

                entity.HasMany(e => e.Projects)
                    .WithOne()
                    .HasForeignKey(e => e.TeamId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.Name);
            });

            // Configure Project entity
            modelBuilder.Entity<Project>(entity =>
            {
                entity.ToTable("projects");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

                entity.HasIndex(e => e.TeamId);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure ScrumGroup entity
            modelBuilder.Entity<ScrumGroup>(entity =>
            {
                entity.ToTable("scrum_groups");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(500);
            });
        }
    }
}
