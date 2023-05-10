using Microsoft.AspNetCore.Identity;

namespace API.Entities
{
    public class AppRole : IdentityRole<string>
    {
        public virtual ICollection<AppUserRole> UserRoles { get; set; }
    }
}
