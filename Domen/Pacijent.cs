using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domen
{
    public class Pacijent : Korisnik
    {
        public string JMBG { get; set; } 
        public string Telefon { get; set; } 

        // Asocijacija: Jedan pacijent ima više termina
        public virtual List<Termin> Termini { get; set; } = new List<Termin>();
    }
}
