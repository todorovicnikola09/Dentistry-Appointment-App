using Domen; // Ovo dodajemo da bi prepoznao klasu Termin

namespace API.Services
{
    public class EmailService
    {
        // Ova metoda prima objekat klase Termin kao parametar.
        // To je po definiciji VEZA ZAVISNOSTI (Dependency) 
        // jer EmailService ne može da uradi svoj posao bez klase Termin.
        public void PosaljiPotvrduOZakazivanju(Termin termin)
        {
            // Ovde samo simuliramo ispis u konzolu (za odbranu je dovoljno)
            Console.WriteLine($"[EMAIL SERVICE] Šaljem mejl pacijentu {termin.Pacijent.Ime}...");
            Console.WriteLine($"[EMAIL SERVICE] Termin zakazan kod dr {termin.Stomatolog.Prezime} za datum {termin.Datum}.");
        }
    }
}