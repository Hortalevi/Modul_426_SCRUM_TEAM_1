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

<<<<<<< HEAD
        public DbSet<User> Users { get; set; }
        public DbSet<ScrumGroup> ScrumGroups => Set<ScrumGroup>();
=======
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Team> Teams { get; set; } = null!;
        public DbSet<Project> Projects { get; set; } = null!;
>>>>>>> 97cb5ad66a7f6ba2e7918f2bfb6001248a350947

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users"); // PostgreSQL convention - lowercase
                entity.HasKey(e => e.Id);
                
                // Unique indexes for username and email
                entity.HasIndex(u => u.Username).IsUnique();
                entity.HasIndex(u => u.Email).IsUnique();
            });

            // Configure Team entity
            modelBuilder.Entity<Team>(entity =>
            {
                entity.ToTable("teams"); // Using lowercase for PostgreSQL convention
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

                // Configure one-to-many relationship
                entity.HasMany(e => e.Projects)
                    .WithOne(e => e.Team)
                    .HasForeignKey(e => e.TeamId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Create index on Name for faster lookups
                entity.HasIndex(e => e.Name);
            });

            // Configure Project entity
            modelBuilder.Entity<Project>(entity =>
            {
                entity.ToTable("projects"); // Using lowercase for PostgreSQL convention
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

                // Create index on TeamId for faster queries
                entity.HasIndex(e => e.TeamId);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Seed initial data (optional)
            modelBuilder.Entity<Team>().HasData(
            );

            modelBuilder.Entity<Project>().HasData(
            );
        }
    }
}
