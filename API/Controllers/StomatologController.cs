using BazaPodataka;
using Domen;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("api/korisnik")]
    public class StomatologController : ControllerBase
    {
        private string ProveriDuplikate(string email, string jmbg, string licenca, int? iskljuciId = null)
        {
            string upitEmail = "SELECT COUNT(*) FROM Korisnik WHERE email = @email" + (iskljuciId.HasValue ? " AND id <> @id" : "");
            var paramEmail = new List<SqlParameter> { new SqlParameter("@email", email) };
            if (iskljuciId.HasValue) paramEmail.Add(new SqlParameter("@id", iskljuciId.Value));

            int emailCount = Convert.ToInt32(Broker.Instance().IzvrsiScalar(upitEmail, paramEmail));
            if (emailCount > 0) return "Email već postoji u bazi!";

            string upitJmbg = "SELECT COUNT(*) FROM Korisnik WHERE jmbg = @jmbg" + (iskljuciId.HasValue ? " AND id <> @id" : "");
            var paramJmbg = new List<SqlParameter> { new SqlParameter("@jmbg", jmbg) };
            if (iskljuciId.HasValue) paramJmbg.Add(new SqlParameter("@id", iskljuciId.Value));

            int jmbgCount = Convert.ToInt32(Broker.Instance().IzvrsiScalar(upitJmbg, paramJmbg));
            if (jmbgCount > 0) return "JMBG već postoji u bazi!";

            string upitLicenca = "SELECT COUNT(*) FROM Korisnik WHERE brojLicence = @lic" + (iskljuciId.HasValue ? " AND id <> @id" : "");
            var paramLic = new List<SqlParameter> { new SqlParameter("@lic", licenca) };
            if (iskljuciId.HasValue) paramLic.Add(new SqlParameter("@id", iskljuciId.Value));

            int licencaCount = Convert.ToInt32(Broker.Instance().IzvrsiScalar(upitLicenca, paramLic));
            if (licencaCount > 0) return "Broj licence već postoji u bazi!";

            return null;
        }

        [HttpGet("stomatolozi")]
        public IActionResult GetStomatolozi()
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                string upit = "SELECT id, ime, prezime, email, jmbg, brojTelefona, brojLicence, mentorId FROM Korisnik WHERE uloga = 'Stomatolog'";
                DataTable dt = Broker.Instance().IzvrsiUpit(upit);
                var lista = new List<object>();
                foreach (DataRow dr in dt.Rows)
                {
                    lista.Add(new
                    {
                        id = (int)dr["id"],
                        ime = dr["ime"].ToString(),
                        prezime = dr["prezime"].ToString(),
                        email = dr["email"].ToString(),
                        jmbg = dr["jmbg"].ToString(),
                        brojTelefona = dr["brojTelefona"].ToString(),
                        brojLicence = dr["brojLicence"].ToString(),
                        mentorId = dr["mentorId"] == DBNull.Value ? null : (int?)dr["mentorId"]
                    });
                }
                return Ok(lista);
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }

        [HttpPost("stomatolozi")]
        public IActionResult Post([FromBody] System.Text.Json.JsonElement k)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();

                string email = k.GetProperty("email").GetString();
                string jmbg = k.GetProperty("jmbg").GetString();
                string licenca = k.GetProperty("brojLicence").GetString();

                string greska = ProveriDuplikate(email, jmbg, licenca);
                if (greska != null) return BadRequest(greska);

                string upit = "INSERT INTO Korisnik (ime, prezime, email, lozinka, uloga, jmbg, brojTelefona, brojLicence) " +
                              "VALUES (@ime, @prezime, @email, @loz, 'Stomatolog', @jmbg, @tel, @lic)";

                List<SqlParameter> parametri = new List<SqlParameter> {
                    new SqlParameter("@ime", k.GetProperty("ime").GetString()),
                    new SqlParameter("@prezime", k.GetProperty("prezime").GetString()),
                    new SqlParameter("@email", email),
                    new SqlParameter("@loz", k.TryGetProperty("lozinka", out var p) ? p.GetString() : "stom123"),
                    new SqlParameter("@jmbg", jmbg),
                    new SqlParameter("@tel", k.GetProperty("brojTelefona").GetString()),
                    new SqlParameter("@lic", licenca)
                };

                Broker.Instance().IzvrsiKomandu(upit, parametri);
                return Ok("Stomatolog dodat!");
            }
            catch (Exception ex) { return BadRequest("Sistemska greška: " + ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }

        [HttpPut("stomatolozi/{id}")]
        public IActionResult Put(int id, [FromBody] System.Text.Json.JsonElement k)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();

                string email = k.GetProperty("email").GetString();
                string jmbg = k.GetProperty("jmbg").GetString();
                string licenca = k.GetProperty("brojLicence").GetString();

                string greska = ProveriDuplikate(email, jmbg, licenca, id);
                if (greska != null) return BadRequest(greska);

                string upit = "UPDATE Korisnik SET ime=@ime, prezime=@prezime, email=@email, brojTelefona=@tel WHERE id=@id";
                List<SqlParameter> parametri = new List<SqlParameter> {
                    new SqlParameter("@id", id),
                    new SqlParameter("@ime", k.GetProperty("ime").GetString()),
                    new SqlParameter("@prezime", k.GetProperty("prezime").GetString()),
                    new SqlParameter("@email", email),
                    new SqlParameter("@tel", k.GetProperty("brojTelefona").GetString())
                };

                Broker.Instance().IzvrsiKomandu(upit, parametri);
                return Ok("Uspešno izmenjeno!");
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }

        [HttpPut("stomatolozi/{id}/dodeli-mentora")]
        public IActionResult DodeliMentora(int id, [FromBody] System.Text.Json.JsonElement body)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();

                int? mentorId = null;
                if (body.ValueKind != System.Text.Json.JsonValueKind.Null)
                {
                    mentorId = body.GetInt32();
                }

                string upit = "UPDATE Korisnik SET mentorId=@mentorId WHERE id=@id AND uloga='Stomatolog'";

                List<SqlParameter> parametri = new List<SqlParameter> {
                    new SqlParameter("@id", id),
                    new SqlParameter("@mentorId", (object)mentorId ?? DBNull.Value)
                };

                Broker.Instance().IzvrsiKomandu(upit, parametri);
                return Ok("Mentor uspešno dodeljen!");
            }
            catch (Exception ex) { return BadRequest("Greška pri dodeli mentora: " + ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }

        [HttpDelete("stomatolozi/{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                Broker.Instance().IzvrsiKomandu("DELETE FROM Korisnik WHERE id=@id", new List<SqlParameter> { new SqlParameter("@id", id) });
                return Ok("Obrisan!");
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }
    }
}