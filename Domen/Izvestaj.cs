using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domen
{
    public class Izvestaj
    {
        public int Id { get; set; }
        public string OpisDijagnoze { get; set; }

        // Kompozicija: Izvestaj ne postoji bez Termina
        public Termin Termin { get; set; }
        public double UkupnaCena { get; set; }
    }
}
