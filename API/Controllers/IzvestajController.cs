using Microsoft.AspNetCore.Mvc;
using BazaPodataka;
using Domen;
using Microsoft.Data.SqlClient;
using System.Data;
using System;
using System.Collections.Generic;
using System.Linq;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IzvestajController : ControllerBase
    {
        public class IzvestajRequest
        {
            public string Opis { get; set; }
            public int TerminId { get; set; }
            public double UkupnaCena { get; set; }
        }

        [HttpPost]
        public IActionResult Dodaj([FromBody] IzvestajRequest req)
        {
            if (req == null) return BadRequest("Podaci o izveštaju nisu validni.");

            try
            {
                Broker.Instance().OtvoriKonekciju();

                string upit = "INSERT INTO Izvestaj (opis, terminId, ukupnaCena) VALUES (@opis, @tId, @cena)";

                List<SqlParameter> parametri = new List<SqlParameter>
                {
                    new SqlParameter("@opis", req.Opis),
                    new SqlParameter("@tId", req.TerminId),
                    new SqlParameter("@cena", req.UkupnaCena)
                };

                Broker.Instance().IzvrsiKomandu(upit, parametri);

                string upitStatus = "UPDATE Termin SET status = 'Završeno' WHERE id = @tId";
                Broker.Instance().IzvrsiKomandu(upitStatus, new List<SqlParameter> { new SqlParameter("@tId", req.TerminId) });

                return Ok("Izveštaj je uspešno sačuvan.");
            }
            catch (Exception ex)
            {
                return BadRequest("Greška pri čuvanju izveštaja: " + ex.Message);
            }
            finally
            {
                Broker.Instance().ZatvoriKonekciju();
            }
        }

        [HttpPut("{id}")]
        public IActionResult Izmeni(int id, [FromBody] IzvestajRequest req)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();

                string upit = "UPDATE Izvestaj SET opis = @opis, ukupnaCena = @cena WHERE id = @id";

                List<SqlParameter> parametri = new List<SqlParameter>
                {
                    new SqlParameter("@opis", req.Opis),
                    new SqlParameter("@cena", req.UkupnaCena),
                    new SqlParameter("@id", id)
                };

                Broker.Instance().IzvrsiKomandu(upit, parametri);
                return Ok("Izveštaj je uspešno izmenjen.");
            }
            catch (Exception ex)
            {
                return BadRequest("Greška pri izmeni: " + ex.Message);
            }
            finally
            {
                Broker.Instance().ZatvoriKonekciju();
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Obrisi(int id)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();

                string upit = "DELETE FROM Izvestaj WHERE id = @id";
                List<SqlParameter> parametri = new List<SqlParameter> { new SqlParameter("@id", id) };

                Broker.Instance().IzvrsiKomandu(upit, parametri);
                return Ok("Izveštaj je uspešno obrisan.");
            }
            catch (Exception ex)
            {
                return BadRequest("Greška pri brisanju: " + ex.Message);
            }
            finally
            {
                Broker.Instance().ZatvoriKonekciju();
            }
        }

        [HttpGet]
        public IActionResult VratiSve()
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                string upit = "SELECT id, opis, terminId, ukupnaCena FROM Izvestaj";
                DataTable dt = Broker.Instance().IzvrsiUpit(upit, new List<SqlParameter>());

                List<object> izvestaji = new List<object>();
                foreach (DataRow dr in dt.Rows)
                {
                    izvestaji.Add(new
                    {
                        Id = dr["id"],
                        Opis = dr["opis"],
                        TerminId = dr["terminId"],
                        UkupnaCena = dr["ukupnaCena"]
                    });
                }
                return Ok(izvestaji);
            }
            catch (Exception ex)
            {
                return BadRequest("Greška: " + ex.Message);
            }
            finally
            {
                Broker.Instance().ZatvoriKonekciju();
            }
        }
    }
}