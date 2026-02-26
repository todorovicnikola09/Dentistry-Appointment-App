using Microsoft.AspNetCore.Mvc;
using BazaPodataka;
using System.Data;
using Microsoft.Data.SqlClient;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        [HttpPost]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            try
            {
                // 1. HARDKODIRAN ADMIN (nije u bazi)
                if (request.Email == "admin@dentify.com" && request.Password == "admin123")
                {
                    return Ok(new { Role = "Admin", Token = "admin-token", Ime = "Administrator" });
                }

                Broker.Instance().OtvoriKonekciju();

                // 2. PROVERA U TABELI KORISNICI
                string upit = "SELECT * FROM Korisnik WHERE email = @email AND lozinka = @pass";
                var parametri = new List<SqlParameter> {
                    new SqlParameter("@email", request.Email),
                    new SqlParameter("@pass", request.Password)
                };

                DataTable dt = Broker.Instance().IzvrsiUpit(upit, parametri);

                if (dt.Rows.Count > 0)
                {
                    DataRow row = dt.Rows[0];
                    string uloga = row["uloga"].ToString(); // Ovde citamo 'Pacijent' ili 'Stomatolog'

                    return Ok(new
                    {
                        Id = row["id"],
                        Ime = row["ime"].ToString(),
                        Role = uloga,
                        Token = uloga.ToLower() + "-token-secret"
                    });
                }

                return Unauthorized("Pogrešan email ili lozinka!");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            finally
            {
                Broker.Instance().ZatvoriKonekciju();
            }
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}