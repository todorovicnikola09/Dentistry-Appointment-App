using Microsoft.AspNetCore.Mvc;
using BazaPodataka;
using Domen;
using Microsoft.Data.SqlClient;
using System.Data;
using System;
using System.Collections.Generic;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UslugaController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                string upit = "SELECT id AS Id, naziv AS Naziv, opis AS Opis, cena AS Cena FROM Usluga";
                DataTable dt = Broker.Instance().IzvrsiUpit(upit);

                List<Usluga> listaUsluga = new List<Usluga>();
                foreach (DataRow row in dt.Rows)
                {
                    listaUsluga.Add(new Usluga
                    {
                        Id = Convert.ToInt32(row["Id"]),
                        Naziv = row["Naziv"]?.ToString(),
                        Opis = row["Opis"]?.ToString(),
                        Cena = Convert.ToDecimal(row["Cena"])
                    });
                }
                return Ok(listaUsluga);
            }
            catch (Exception ex)
            {
                return BadRequest("Greška pri čitanju: " + ex.Message);
            }
            finally
            {
                Broker.Instance().ZatvoriKonekciju();
            }
        }

        [HttpPost]
        public IActionResult Post([FromBody] Usluga u)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                string upit = "INSERT INTO Usluga (naziv, opis, cena) VALUES (@naziv, @opis, @cena)";

                List<SqlParameter> parametri = new List<SqlParameter>
                {
                    new SqlParameter("@naziv", u.Naziv),
                    new SqlParameter("@opis", u.Opis),
                    new SqlParameter("@cena", u.Cena)
                };

                Broker.Instance().IzvrsiKomandu(upit, parametri);
                return Ok("Usluga uspešno dodata.");
            }
            catch (Exception ex)
            {
                return BadRequest("Greška pri dodavanju: " + ex.Message);
            }
            finally
            {
                Broker.Instance().ZatvoriKonekciju();
            }
        }

        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] Usluga u)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                string upit = "UPDATE Usluga SET naziv=@naziv, opis=@opis, cena=@cena WHERE id=@id";

                List<SqlParameter> parametri = new List<SqlParameter>
                {
                    new SqlParameter("@id", id),
                    new SqlParameter("@naziv", u.Naziv),
                    new SqlParameter("@opis", u.Opis),
                    new SqlParameter("@cena", u.Cena)
                };

                Broker.Instance().IzvrsiKomandu(upit, parametri);
                return Ok("Usluga uspešno izmenjena.");
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
        public IActionResult Delete(int id)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                string upit = "DELETE FROM Usluga WHERE id=@id";

                List<SqlParameter> parametri = new List<SqlParameter>
                {
                    new SqlParameter("@id", id)
                };

                Broker.Instance().IzvrsiKomandu(upit, parametri);
                return Ok("Usluga uspešno obrisana.");
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
    }
}