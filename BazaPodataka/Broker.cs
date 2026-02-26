using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BazaPodataka
{
    public class Broker
    {
        DbConnection connection;
        private static Broker instance;

        private Broker()
        {
            connection = new DbConnection();
        }

        public static Broker Instance()
        {
            if(instance == null)
            {
                instance = new Broker();
            }
            return instance;
        }

        public void OtvoriKonekciju() => connection.OpenConnection();
        public void ZatvoriKonekciju() => connection.CloseConnection();
        public void PocniTransakciju() => connection.BeginTransaction();
        public void PotvrdiTransakciju() => connection.Commit();
        public void PonistiTransakciju() => connection.RollBack();

        // 1. Metoda za ČITANJE podataka (SELECT) - vraća tabelu
        // Dodata podrška za parametre (bitno za sigurnost i pretragu)
        public DataTable IzvrsiUpit(string upit, List<SqlParameter> parametri = null)
        {
            DataTable dt = new DataTable();
            using (SqlCommand cmd = connection.CreateCommand(upit))
            {
                if (parametri != null) cmd.Parameters.AddRange(parametri.ToArray());

                using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                {
                    da.Fill(dt);
                }
            }
            return dt;
        }

        // 2. Metoda za UPIS, IZMENU i BRISANJE (INSERT, UPDATE, DELETE)
        // Vraća broj redova koji su promenjeni (npr. 1 ako je uspešno)
        public int IzvrsiKomandu(string upit, List<SqlParameter> parametri = null)
        {
            using (SqlCommand cmd = connection.CreateCommand(upit))
            {
                if (parametri != null) cmd.Parameters.AddRange(parametri.ToArray());
                return cmd.ExecuteNonQuery();
            }
        }
    
}
}
