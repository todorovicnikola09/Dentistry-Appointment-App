using BazaPodataka;
using Domen;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using System;
using System.Collections.Generic;

namespace API.Controllers
{
    [ApiController]
    [Route("api/korisnik")]
    public class StomatologController : ControllerBase
    {
        [HttpGet("stomatolozi")]
        public IActionResult GetStomatolozi()
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();

                // Koristimo tvoja imena kolona iz baze: id, ime, prezime, email, brojLicence
                string upit = "SELECT id, ime, prezime, email, brojLicence FROM Korisnik WHERE uloga = 'Stomatolog'";

                DataTable dt = Broker.Instance().IzvrsiUpit(upit);
                var lista = new List<object>();

                foreach (DataRow dr in dt.Rows)
                {
                    lista.Add(new
                    {
                        // Ovo su ključevi koje React vidi
                        id = (int)dr["id"],
                        ime = dr["ime"].ToString(),
                        prezime = dr["prezime"].ToString(),
                        email = dr["email"].ToString(),
                        brojLicence = dr["brojLicence"].ToString()
                    });
                }
                return Ok(lista);
            }
            catch (Exception ex)
            {
                return BadRequest("Greška pri učitavanju stomatologa: " + ex.Message);
            }
            finally
            {
                Broker.Instance().ZatvoriKonekciju();
            }
        }

        [HttpPut("postavi-mentora")]
        public IActionResult PostaviMentora(int stomatologId, int mentorId)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                string upit = "UPDATE Korisnik SET mentorId=@mId WHERE id=@sId AND uloga='Stomatolog'";

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