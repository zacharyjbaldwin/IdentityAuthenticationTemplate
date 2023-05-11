using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Runtime.InteropServices;

namespace API.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AdminController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<AppRole> _roleManager;

        public AdminController(UserManager<AppUser> userManager, RoleManager<AppRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        [HttpGet("roles")]
        public async Task<ActionResult> GetRoles()
        {
            var roles = await _roleManager.Roles
                .OrderBy(role => role.Name)
                .Select(role => new
                {
                    role.Id,
                    role.Name,
                    role.NormalizedName,
                    role.ConcurrencyStamp
                })
                .ToListAsync();
            return Ok(roles);
        }

        [HttpPost("roles")]
        public async Task<ActionResult> AddRole([FromQuery] string roleName)
        {
            if (string.IsNullOrEmpty(roleName)) return BadRequest("roleName cannot be null.");
            if (await _roleManager.RoleExistsAsync(roleName)) return Conflict("That role already exists.");
            var role = new AppRole { Name = roleName };
            var result = await _roleManager.CreateAsync(role);
            if (!result.Succeeded) return Problem("Failed to create role.");
            return Created("Created role.", role);
        }

        [HttpDelete("roles/{roleId}")]
        public async Task<ActionResult> DeleteRoleById(string roleId)
        {
            if (string.IsNullOrEmpty(roleId)) return BadRequest("roleId cannot be null.");
            var result = await _roleManager.DeleteAsync(new AppRole { Id = roleId });
            if (!result.Succeeded) return Problem("Failed to delete role.");
            return NoContent();
        }

        [HttpGet("users")]
        public async Task<ActionResult> GetUsersWithRoles()
        {
            var users = await _userManager.Users
                .Include(user => user.UserRoles)
                .Select(user => new
                {
                    UserId = user.Id,
                    user.FirstName,
                    user.LastName,
                    user.Email,
                    Roles = user.UserRoles.Select(role => role.Role.Name).ToList()
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPatch("users/edit-roles/{userId}")]
        public async Task<ActionResult> UpdateUserById(string userId, EditRolesRequestDto editRolesRequestDto)
        {
            var selectedRoles = editRolesRequestDto.Roles;
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound("No user found with that ID.");
            var userRoles = await _userManager.GetRolesAsync(user);
            var result = await _userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles));
            if (!result.Succeeded) return BadRequest("Failed to add to roles.");
            result = await _userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles));
            if (!result.Succeeded) return BadRequest("Failed to remove from roles.");
            return Ok(await _userManager.GetRolesAsync(user));
        }

        [HttpDelete("users/{userId}")]
        public async Task<ActionResult> DeleteUserById(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound("No user found with that ID.");
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded) return Problem("Failed to delete user.");
            return NoContent();
        }
    }
}
