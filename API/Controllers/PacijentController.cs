using BazaPodataka;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using System;
using System.Collections.Generic;

namespace API.Controllers
{
    [ApiController]
    [Route("api/pacijent")]
    public class PacijentController : ControllerBase
    {
        private string ProveriDuplikate(string email, string jmbg, int? iskljuciId = null)
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
            if (jmbgCount > 0) return "Korisnik sa ovim JMBG-om već postoji!";

            return null;
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                string upit = "SELECT id, ime, prezime, email, jmbg, brojTelefona FROM Korisnik WHERE uloga = 'Pacijent'";
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
                        brojTelefona = dr["brojTelefona"].ToString()
                    });
                }
                return Ok(lista);
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }

        [HttpPost]
        public IActionResult Post([FromBody] System.Text.Json.JsonElement k)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                string email = k.GetProperty("email").GetString();
                string jmbg = k.GetProperty("jmbg").GetString();

                string greska = ProveriDuplikate(email, jmbg);
                if (greska != null) return BadRequest(greska);

                string upit = "INSERT INTO Korisnik (ime, prezime, email, lozinka, uloga, jmbg, brojTelefona) " +
                              "VALUES (@ime, @prezime, @email, @loz, 'Pacijent', @jmbg, @tel)";

                List<SqlParameter> parametri = new List<SqlParameter> {
                    new SqlParameter("@ime", k.GetProperty("ime").GetString()),
                    new SqlParameter("@prezime", k.GetProperty("prezime").GetString()),
                    new SqlParameter("@email", email),
                    new SqlParameter("@loz", k.TryGetProperty("lozinka", out var p) ? p.GetString() : "pac123"),
                    new SqlParameter("@jmbg", jmbg),
                    new SqlParameter("@tel", k.GetProperty("brojTelefona").GetString())
                };

                Broker.Instance().IzvrsiKomandu(upit, parametri);
                return Ok("Pacijent dodat!");
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] System.Text.Json.JsonElement k)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                string email = k.GetProperty("email").GetString();
                string jmbg = k.GetProperty("jmbg").GetString();

                string greska = ProveriDuplikate(email, jmbg, id);
                if (greska != null) return BadRequest(greska);

                string upit = "UPDATE Korisnik SET ime=@ime, prezime=@prezime, email=@email, brojTelefona=@tel WHERE id=@id";
                List<SqlParameter> parametri = new List<SqlParameter> {
                    new SqlParameter("@ime", k.GetProperty("ime").GetString()),
                    new SqlParameter("@prezime", k.GetProperty("prezime").GetString()),
                    new SqlParameter("@email", email),
                    new SqlParameter("@tel", k.GetProperty("brojTelefona").GetString()),
                    new SqlParameter("@id", id)
                };
                Broker.Instance().IzvrsiKomandu(upit, parametri);
                return Ok("Podaci izmenjeni!");
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                Broker.Instance().IzvrsiKomandu("DELETE FROM Korisnik WHERE id=@id", new List<SqlParameter> { new SqlParameter("@id", id) });
                return Ok("Pacijent obrisan!");
            }
            catch (Exception ex) { return BadRequest("Greška: Verovatno pacijent ima zakazane termine."); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }
    }
}