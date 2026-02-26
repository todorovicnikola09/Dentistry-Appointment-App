using Microsoft.AspNetCore.Mvc;
using BazaPodataka;
using Microsoft.Data.SqlClient;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SistemController : ControllerBase
    {
        // 1. Dugme za testnog pacijenta
        [HttpPost("testni-pacijent")]
        public IActionResult DodajPacijenta()
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                // Generišemo nasumičan broj da bi email bio unikatan
                int r = new Random().Next(100, 999);
                string upit = $@"INSERT INTO Korisnici (Ime, Prezime, Email, Lozinka, UlogaKorisnika, JMBG, Telefon) 
                                VALUES ('Pacijent', '{r}', 'pacijent{r}@test.com', '123', 'Pacijent', '1234567890123', '060123456')";

                Broker.Instance().IzvrsiKomandu(upit, null);
                return Ok($"Dodat testni pacijent {r}!");
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }

        // 2. Dugme za testnu uslugu
        [HttpPost("testna-usluga")]
        public IActionResult DodajUslugu()
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                string[] nazivi = { "Izbeljivanje", "Popravka", "Krunica", "Snimanje" };
                string naziv = nazivi[new Random().Next(nazivi.Length)];
                int cena = new Random().Next(2000, 10000);

                string upit = $"INSERT INTO Usluge (Naziv, Cena) VALUES ('{naziv}', {cena})";
                Broker.Instance().IzvrsiKomandu(upit, null);
                return Ok($"Dodata testna usluga: {naziv}!");
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }

        // 3. Inicijalni Stomatolog (ovo ti treba da bi uopšte mogla da zakazuješ)
        [HttpPost("inicijalizuj-doktora")]
        public IActionResult InicijalizujDoktora()
        {
            try
            {
                Broker.Instance().OtvoriKonekciju();
                string upit = @"IF NOT EXISTS (SELECT * FROM Korisnici WHERE UlogaKorisnika = 'Stomatolog')
                                BEGIN
                                    INSERT INTO Korisnici (Ime, Prezime, Email, Lozinka, UlogaKorisnika, Specijalizacija) 
                                    VALUES ('Dr. Marko', 'Markovic', 'doc@smile.com', '123', 'Stomatolog', 'Ortodont');
                                END";
                Broker.Instance().IzvrsiKomandu(upit, null);
                return Ok("Glavni stomatolog je spreman!");
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
            finally { Broker.Instance().ZatvoriKonekciju(); }
        }
    }
}