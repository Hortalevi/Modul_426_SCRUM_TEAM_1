using ScrumifyApi.Models;

namespace ScrumifyApi.Services
{
    public interface IJwtTokenService
    {
        string GenerateToken(User user);
    }
}
