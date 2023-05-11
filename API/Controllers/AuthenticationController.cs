using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [AllowAnonymous]
    public class AuthenticationController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly ITokenService _tokenService;

        public AuthenticationController(UserManager<AppUser> userManager, ITokenService tokenService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterRequestDto registerRequestDto)
        {
            if (await EmailExists(registerRequestDto.Email)) return BadRequest("That email address is already in use.");
            var user = new AppUser
            {
                UserName = registerRequestDto.Email,
                Email = registerRequestDto.Email,
                FirstName = registerRequestDto.FirstName,
                LastName = registerRequestDto.LastName
            };
            var result = await _userManager.CreateAsync(user, registerRequestDto.Password);
            if (!result.Succeeded) return Problem("Failed to create user.");
            result = await _userManager.AddToRoleAsync(user, "Member");
            if (!result.Succeeded) return Problem("Failed to add user to role.");
            return Ok(new AuthResponseDto
            {
                UserId = user.Id,
                Token = await _tokenService.CreateToken(user),
                ExpiresIn = 3600,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Roles = user.UserRoles.Select(role => role.Role.Name).ToList()
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginRequestDto loginRequestDto)
        {
            if (!await EmailExists(loginRequestDto.Email)) return Unauthorized("Invalid email address.");
            var user = await _userManager.FindByEmailAsync(loginRequestDto.Email);

            var passwordMatches = await _userManager.CheckPasswordAsync(user, loginRequestDto.Password);
            if (!passwordMatches) return Unauthorized("Invalid password.");

            return Ok(new AuthResponseDto
            {
                UserId = user.Id,
                Token = await _tokenService.CreateToken(user),
                ExpiresIn = 3600,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Roles = (await _userManager.GetRolesAsync(user)).ToList()
            });
        }

        [Authorize(Roles = "Member, Admin")]
        [HttpPut("change-password")]
        public async Task<ActionResult> ChangePassword(ChangePasswordRequestDto changePasswordRequestDto)
        {
            var user = await _userManager.FindByIdAsync(User.GetId());
            if (user == null) return Unauthorized(false);
            var result = await _userManager.ChangePasswordAsync(user, changePasswordRequestDto.OldPassword, changePasswordRequestDto.NewPassword);
            if (!result.Succeeded) return Unauthorized(false);
            return Ok(true);
        }

        private async Task<bool> EmailExists(string email)
        {
            return await _userManager.FindByEmailAsync(email) != null;
        }
    }
}
