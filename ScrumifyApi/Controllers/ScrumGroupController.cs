using Microsoft.AspNetCore.Mvc;
using ScrumifyApi.Data;
using ScrumifyApi.Models;

namespace ScrumifyApi.Controllers;

[ApiController]
[Route("api/scrum-groups")]
public class ScrumGroupController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ScrumGroupController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(_context.ScrumGroups.ToList());
    }

    [HttpPost]
    public IActionResult Create(ScrumGroup group)
    {
        _context.ScrumGroups.Add(group);
        _context.SaveChanges();
        return Ok(group);
    }
}
