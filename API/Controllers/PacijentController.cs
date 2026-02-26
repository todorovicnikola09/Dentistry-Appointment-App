using BazaPodataka;
using Domen;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PacijentController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                DataTable dt = Broker.Instance().IzvrsiUpit("SELECT * FROM Korisnici WHERE UlogaKorisnika = 'Pacijent'");
                List<Pacijent> lista = new List<Pacijent>();
                foreach (DataRow dr in dt.Rows)
                {
                    lista.Add(new Pacijent { Id = (int)dr["Id"], Ime = dr["Ime"].ToString(), Prezime = dr["Prezime"].ToString(), JMBG = dr["JMBG"].ToString() });
                }
                return Ok(lista);
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }
        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Pacijent p)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                string upit = "UPDATE Korisnici SET Ime=@ime, Prezime=@prezime, Telefon=@tel, Alergije=@aler WHERE Id=@id";
                List<SqlParameter> parametri = new List<SqlParameter> {
            new SqlParameter("@ime", p.Ime),
            new SqlParameter("@prezime", p.Prezime),
            new SqlParameter("@tel", p.Telefon),
            new SqlParameter("@id", id)
        };
                Broker.Instance().IzvrsiKomandu(upit, parametri);
                return Ok("Podaci pacijenta uspešno izmenjeni!");
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }

        // DELETE: api/Pacijent/5 (Brisanje pacijenta)
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                Broker.Instance().IzvrsiKomandu("DELETE FROM Korisnici WHERE Id=" + id, null);
                return Ok("Pacijent obrisan!");
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }
    }
}