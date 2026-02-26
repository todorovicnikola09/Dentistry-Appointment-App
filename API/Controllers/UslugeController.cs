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

                // Koristimo aliase (AS) da budemo 100% sigurni u nazive kolona
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
                return BadRequest("Greška u bazi: " + ex.Message);
            }
            finally
            {
                Broker.Instance().ZatvoriKonekciju();
            }
        }
    }
}