using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class Seed
    {
        public static async Task SeedRoles(RoleManager<AppRole> roleManager)
        {
            if (await roleManager.Roles.AnyAsync()) return;

            var roles = new List<AppRole>
            {
                new AppRole { Name = "User" },
                new AppRole { Name = "Admin" }
            };

            foreach (var role in roles)
            {
                await roleManager.CreateAsync(role);
            }
        }

        public static async Task SeedAdminUser(UserManager<AppUser> userManager, IConfiguration config)
        {
            if (await userManager.Users.AnyAsync()) return;

            var admin = new AppUser
            {
                UserName = config["AdminCredentials:UserName"],
                Email = config["AdminCredentials:EmailAddress"]
            };

            await userManager.CreateAsync(admin, config["AdminCredentials:Password"]);
            await userManager.AddToRoleAsync(admin, "Admin");
        }
    }
}
