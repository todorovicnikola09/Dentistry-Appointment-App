using BazaPodataka;
using Domen;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StomatologController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                DataTable dt = Broker.Instance().IzvrsiUpit("SELECT * FROM Korisnici WHERE UlogaKorisnika = 'Stomatolog'");
                List<Stomatolog> lista = new List<Stomatolog>();
                foreach (DataRow dr in dt.Rows)
                {
                    lista.Add(new Stomatolog { Id = (int)dr["Id"], Ime = dr["Ime"].ToString(), Prezime = dr["Prezime"].ToString(), BrojLicence = dr["BrojLicence"].ToString() });
                }
                return Ok(lista);
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }
        [HttpPost]
        public IActionResult Insert([FromBody] Usluga u)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                string upit = "INSERT INTO Usluge (Naziv, Cena) VALUES (@naziv, @cena)";
                List<SqlParameter> p = new List<SqlParameter> {
            new SqlParameter("@naziv", u.Naziv),
            new SqlParameter("@cena", u.Cena)
        };
                Broker.Instance().IzvrsiKomandu(upit, p);
                return Ok("Nova usluga dodata u cenovnik!");
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
                Broker.Instance().IzvrsiKomandu("DELETE FROM Usluge WHERE Id=" + id, null);
                return Ok("Usluga uklonjena!");
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }

        [HttpPut("postavi-mentora")]
        public IActionResult PostaviMentora(int stomatologId, int mentorId)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                // Ovde pokazujemo SELF-TRANSITION: MentorId pokazuje na Id u istoj tabeli
                string upit = "UPDATE Korisnici SET MentorId=@mId WHERE Id=@sId AND UlogaKorisnika='Stomatolog'";
                List<SqlParameter> p = new List<SqlParameter> {
            new SqlParameter("@mId", mentorId),
            new SqlParameter("@sId", stomatologId)
        };
                Broker.Instance().IzvrsiKomandu(upit, p);
                return Ok("Mentor uspešno dodeljen!");
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }
    }
}