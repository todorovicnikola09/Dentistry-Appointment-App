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
    public class TerminController : ControllerBase
    {
        // 1. METODA ZA PRIKAZ REZERVACIJA (GET)
        [HttpGet("pacijent/{id}")]
        public IActionResult VratiPoPacijentu(int id)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();

                // ISPRAVLJENO: Tabela se zove TerminUsluga, a ne StavkaTermina
                // Takođe provereno: tabela Korisnik se koristi za stomatologa
                string upit = @"
                    SELECT t.id, t.datum, t.vreme, u.naziv AS UslugaNaziv, u.opis AS UslugaOpis, 
                           k.ime AS StomIme, k.prezime AS StomPrezime
                    FROM Termin t
                    JOIN TerminUsluga tu ON t.id = tu.terminId
                    JOIN Usluga u ON tu.uslugaId = u.id
                    JOIN Korisnik k ON t.stomatologId = k.id
                    WHERE t.pacijentId = @pId";

                List<SqlParameter> parametri = new List<SqlParameter> { new SqlParameter("@pId", id) };
                DataTable dt = Broker.Instance().IzvrsiUpit(upit, parametri);

                var lista = new List<object>();
                foreach (DataRow dr in dt.Rows)
                {
                    // Sređivanje vremena
                    TimeSpan ts = (TimeSpan)dr["vreme"];
                    string vremeFormatirano = ts.ToString(@"hh\:mm");

                    lista.Add(new
                    {
                        Id = dr["id"],
                        Datum = Convert.ToDateTime(dr["datum"]).ToString("dd.MM.yyyy"),
                        Vreme = vremeFormatirano,
                        Usluga = dr["UslugaNaziv"].ToString(),
                        Opis = dr["UslugaOpis"].ToString(),
                        Stomatolog = "dr " + dr["StomIme"].ToString() + " " + dr["StomPrezime"].ToString()
                    });
                }
                return Ok(lista);
            }
            catch (Exception ex)
            {
                return BadRequest("Greška u bazi: " + ex.Message);
            }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }

        // 2. METODA ZA ZAKAZIVANJE (POST)
        [HttpPost]
        public IActionResult Zakazi([FromBody] Termin t)
        {
            if (t == null || t.Pacijent == null || t.Stomatolog == null)
                return BadRequest("Podaci nisu kompletni.");

            try
            {
                Broker.Instance().OtvoriKonekciju();
                Broker.Instance().PocniTransakciju();

                // INSERT u tabelu Termin
                string upitTermin = "INSERT INTO Termin (datum, vreme, pacijentId, stomatologId) OUTPUT INSERTED.id VALUES (@datum, @vreme, @pId, @sId)";
                List<SqlParameter> p1 = new List<SqlParameter> {
                    new SqlParameter("@datum", t.Datum),
                    new SqlParameter("@vreme", t.Vreme),
                    new SqlParameter("@pId", t.Pacijent.Id),
                    new SqlParameter("@sId", t.Stomatolog.Id)
                };

                DataTable dt = Broker.Instance().IzvrsiUpit(upitTermin, p1);
                int noviId = (int)dt.Rows[0]["id"];

                // ISPRAVLJENO: INSERT ide u TerminUsluga
                if (t.Usluge != null)
                {
                    foreach (var u in t.Usluge)
                    {
                        string upitStavka = "INSERT INTO TerminUsluga (terminId, uslugaId) VALUES (@tId, @uId)";
                        Broker.Instance().IzvrsiKomandu(upitStavka, new List<SqlParameter>{
                            new SqlParameter("@tId", noviId),
                            new SqlParameter("@uId", u.Id)
                        });
                    }
                }

                Broker.Instance().PotvrdiTransakciju();
                return Ok("Uspešno zakazano!");
            }
            catch (Exception ex)
            {
                Broker.Instance().PonistiTransakciju();
                return BadRequest("SQL Greška: " + ex.Message);
            }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }
    }
}