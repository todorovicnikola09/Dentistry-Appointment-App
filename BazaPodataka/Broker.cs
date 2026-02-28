using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;

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
            if (instance == null)
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

        public int IzvrsiKomandu(string upit, List<SqlParameter> parametri = null)
        {
            using (SqlCommand cmd = connection.CreateCommand(upit))
            {
                if (parametri != null) cmd.Parameters.AddRange(parametri.ToArray());
                return cmd.ExecuteNonQuery();
            }
        }

        public object IzvrsiScalar(string upit, List<SqlParameter> parametri = null)
        {
            using (SqlCommand cmd = connection.CreateCommand(upit))
            {
                if (parametri != null) cmd.Parameters.AddRange(parametri.ToArray());
                return cmd.ExecuteScalar();
            }
        }
    }
}