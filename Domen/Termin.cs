using System;
using System.Collections.Generic;

namespace Domen
{
    public class Termin
    {
        public int Id { get; set; }
        public DateTime Datum { get; set; }
        public DateTime Vreme { get; set; }
        public string Status { get; set; } = "Na čekanju";
        public Pacijent Pacijent { get; set; }
        public Stomatolog Stomatolog { get; set; }
        public List<Usluga> Usluge { get; set; } = new List<Usluga>();
        public virtual Izvestaj? Izvestaj { get; set; }
    }
}