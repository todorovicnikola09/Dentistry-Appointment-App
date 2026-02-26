using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domen
{
    public class Termin
    {
        public int Id { get; set; }
        public DateTime Datum { get; set; }
        public DateTime Vreme { get; set; }

        // Asocijacija

        public  Pacijent Pacijent { get; set; } 

        public  Stomatolog Stomatolog { get; set; } 

        // Agregacija: Direktna veza sa Uslugama (Many-to-Many)
        // Ovo rešava tvoj zahtev da nema posebne klase za stavke
        public  List<Usluga> Usluge { get; set; } = new List<Usluga>();

        // Kompozicija: Izveštaj je deo termina
        public virtual Izvestaj? Izvestaj { get; set; }
    }
}
