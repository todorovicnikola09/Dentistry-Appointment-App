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
        public Termin Termin { get; set; }
        public double UkupnaCena { get; set; }
    }
}
