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
        public virtual List<Termin> Termini { get; set; } = new List<Termin>();
    }
}
