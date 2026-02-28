using Microsoft.AspNetCore.Mvc;
using BazaPodataka;
using Domen;
using Microsoft.Data.SqlClient;
using System.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Globalization;

namespace API.Controllers
{
    public class TerminRequest
    {
        public string Datum { get; set; }
        public string Vreme { get; set; }
        public int PacijentId { get; set; }
        public int StomatologId { get; set; }
        public List<int> UslugaIds { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class TerminController : ControllerBase
    {
        private void ProveriIAzurirajStatuse()
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                string upit = "SELECT id, datum, vreme, status FROM Termin WHERE status NOT IN ('Završeno', 'Odbijeno')";
                DataTable dt = Broker.Instance().IzvrsiUpit(upit, new List<SqlParameter>());

                DateTime sada = DateTime.Now;

                foreach (DataRow dr in dt.Rows)
                {
                    int id = (int)dr["id"];
                    DateTime datum = Convert.ToDateTime(dr["datum"]);
                    TimeSpan vreme = (TimeSpan)dr["vreme"];
                    string trenutniStatus = dr["status"].ToString();

                    DateTime vremeTermina = datum.Date + vreme;
                    string noviStatus = trenutniStatus;

                    if (sada > vremeTermina.AddHours(1))
                    {
                        noviStatus = "Završeno";
                    }
                    else if (sada > vremeTermina)
                    {
                        noviStatus = "U toku";
                    }

                    if (noviStatus != trenutniStatus)
                    {
                        string updateUpit = "UPDATE Termin SET status = @status WHERE id = @id";
                        Broker.Instance().IzvrsiKomandu(updateUpit, new List<SqlParameter> {
                            new SqlParameter("@status", noviStatus),
                            new SqlParameter("@id", id)
                        });
                    }
                }
            }
            catch (Exception ex) { Console.WriteLine("Auto-update greška: " + ex.Message); }
        }

        [HttpGet("pacijent/{id}")]
        public IActionResult VratiPoPacijentu(int id)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                ProveriIAzurirajStatuse(); 

                string upit = @"
                    SELECT t.id, t.datum, t.vreme, t.status, u.naziv AS UslugaNaziv, u.opis AS UslugaOpis, 
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
                    TimeSpan ts = (TimeSpan)dr["vreme"];
                    lista.Add(new
                    {
                        Id = dr["id"],
                        Datum = Convert.ToDateTime(dr["datum"]).ToString("dd.MM.yyyy"),
                        Vreme = ts.ToString(@"hh\:mm"),
                        Status = dr["status"].ToString(),
                        Usluga = dr["UslugaNaziv"].ToString(),
                        Opis = dr["UslugaOpis"].ToString(),
                        Stomatolog = "dr " + dr["StomIme"].ToString() + " " + dr["StomPrezime"].ToString()
                    });
                }
                return Ok(lista);
            }
            catch (Exception ex) { return BadRequest("Greška: " + ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }

        [HttpGet("stomatolog/{id}")]
        public IActionResult VratiPoStomatologu(int id)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                ProveriIAzurirajStatuse(); 

                string upit = @"
                    SELECT t.id, t.datum, t.vreme, t.status, u.naziv AS UslugaNaziv, u.opis AS UslugaOpis, 
                           k.ime AS PacIme, k.prezime AS PacPrezime
                    FROM Termin t
                    JOIN TerminUsluga tu ON t.id = tu.terminId
                    JOIN Usluga u ON tu.uslugaId = u.id
                    JOIN Korisnik k ON t.pacijentId = k.id
                    WHERE t.stomatologId = @sId";

                List<SqlParameter> parametri = new List<SqlParameter> { new SqlParameter("@sId", id) };
                DataTable dt = Broker.Instance().IzvrsiUpit(upit, parametri);

                var lista = new List<object>();
                foreach (DataRow dr in dt.Rows)
                {
                    TimeSpan ts = (TimeSpan)dr["vreme"];
                    lista.Add(new
                    {
                        Id = dr["id"],
                        Datum = Convert.ToDateTime(dr["datum"]).ToString("dd.MM.yyyy"),
                        Vreme = ts.ToString(@"hh\:mm"),
                        Status = dr["status"].ToString(),
                        Usluga = dr["UslugaNaziv"].ToString(),
                        Opis = dr["UslugaOpis"].ToString(),
                        Pacijent = dr["PacIme"].ToString() + " " + dr["PacPrezime"].ToString()
                    });
                }
                return Ok(lista);
            }
            catch (Exception ex) { return BadRequest("Greška: " + ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }

        [HttpPost]
        public IActionResult Zakazi([FromBody] TerminRequest req)
        {
            if (req == null) return BadRequest("Zahtev je prazan.");
            try
            {
                Broker.Instance().OtvoriKonekciju();
                Broker.Instance().PocniTransakciju();
                TimeSpan ts = TimeSpan.Parse(req.Vreme);
                string upitTermin = "INSERT INTO Termin (datum, vreme, pacijentId, stomatologId, status) OUTPUT INSERTED.id VALUES (@datum, @vreme, @pId, @sId, @status)";
                List<SqlParameter> p1 = new List<SqlParameter> {
                    new SqlParameter("@datum", SqlDbType.Date) { Value = req.Datum },
                    new SqlParameter("@vreme", SqlDbType.Time) { Value = ts },
                    new SqlParameter("@pId", req.PacijentId),
                    new SqlParameter("@sId", req.StomatologId),
                    new SqlParameter("@status", "Na čekanju")
                };
                DataTable dt = Broker.Instance().IzvrsiUpit(upitTermin, p1);
                int noviId = (int)dt.Rows[0]["id"];
                if (req.UslugaIds != null)
                {
                    foreach (var uId in req.UslugaIds)
                    {
                        string upitStavka = "INSERT INTO TerminUsluga (terminId, uslugaId) VALUES (@tId, @uId)";
                        Broker.Instance().IzvrsiKomandu(upitStavka, new List<SqlParameter>{
                            new SqlParameter("@tId", noviId),
                            new SqlParameter("@uId", uId)
                        });
                    }
                }
                Broker.Instance().PotvrdiTransakciju();
                return Ok("Uspešno zakazano!");
            }
            catch (Exception ex)
            {
                Broker.Instance().PonistiTransakciju();
                return BadRequest("Greška: " + ex.Message);
            }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }

        [HttpPut("promeni-status/{id}")]
        public IActionResult PromeniStatus(int id, [FromBody] string noviStatus)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                string upit = "UPDATE Termin SET status = @status WHERE id = @id";
                List<SqlParameter> parametri = new List<SqlParameter> {
                    new SqlParameter("@status", noviStatus),
                    new SqlParameter("@id", id)
                };
                Broker.Instance().IzvrsiKomandu(upit, parametri);
                return Ok(new { Poruka = $"Termin {id} je prešao u stanje: {noviStatus}" });
            }
            catch (Exception ex) { return BadRequest("Greška pri tranziciji: " + ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }

        [HttpGet("slob_vremena")]
        public IActionResult GetSlobodnaVremena(int stomatologId, string datum)
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                string upit = "SELECT vreme FROM Termin WHERE stomatologId = @sId AND datum = @datum AND status != 'Odbijeno'";
                List<SqlParameter> p = new List<SqlParameter> {
                    new SqlParameter("@sId", stomatologId),
                    new SqlParameter("@datum", datum)
                };
                DataTable dt = Broker.Instance().IzvrsiUpit(upit, p);
                List<string> zauzeta = new List<string>();
                foreach (DataRow dr in dt.Rows)
                {
                    zauzeta.Add(((TimeSpan)dr["vreme"]).ToString(@"hh\:mm"));
                }
                List<string> svaVremena = new List<string> {
                    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
                    "11:00", "11:30", "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"
                };
                return Ok(svaVremena.Where(v => !zauzeta.Contains(v)).ToList());
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }
    }
}