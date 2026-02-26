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

                string upit = "SELECT Id, naziv, opis, cena FROM Usluga";
                DataTable dt = Broker.Instance().IzvrsiUpit(upit);

                List<Usluga> listaUsluga = new List<Usluga>();

                foreach (DataRow row in dt.Rows)
                {
                    listaUsluga.Add(new Usluga
                    {
                        // Koristimo Convert radi sigurnosti ako su tipovi u bazi labavi
                        Id = Convert.ToInt32(row["Id"]),
                        Naziv = row["naziv"]?.ToString(),
                        Opis = row["opis"]?.ToString(),
                        Cena = Convert.ToDecimal(row["cena"])
                    });
                }

                return Ok(listaUsluga);
            }
            catch (Exception ex)
            {
                // Vraćamo tačnu grešku da bi u Network tabu video šta nije u redu
                return BadRequest("Greška u bazi: " + ex.Message);
            }
            finally
            {
                Broker.Instance().ZatvoriKonekciju();
            }
        }
    }
}