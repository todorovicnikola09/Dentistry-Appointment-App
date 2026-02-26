using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domen
{
    public class Stomatolog : Korisnik
    {
        public string BrojLicence { get; set; } 

        // Self-transition: Stomatolog može imati mentora koji je takođe Stomatolog
        public int? MentorId { get; set; }
        public virtual Stomatolog? Mentor { get; set; }

        public virtual List<Termin> Termini { get; set; } = new List<Termin>();
    }
}
