using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domen
{
    public class Korisnik
    {
        public int Id { get; set; }
        public string Ime { get; set; }
        public string Prezime { get; set; } 
        public string Email { get; set; } 
        public string Lozinka { get; set; } 
        public string UlogaKorisnika { get; set; }
    }
}
