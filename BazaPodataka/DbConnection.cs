using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BazaPodataka
{
    public class DbConnection
    {
        SqlConnection connection = new SqlConnection("Data Source = (localdb)\\MSSQLLocalDB; Initial Catalog = stomatoloska_ordinacija; Integrated Security = True; Connect Timeout = 30; Encrypt = False; Trust Server Certificate = False; Application Intent = ReadWrite; Multi Subnet Failover = False");
        SqlTransaction transaction;

        public void RollBack()
        {
            transaction.Rollback();
        }

        public void Commit()
        {
            transaction.Commit();
        }

        public void BeginTransaction()
        {
            transaction = connection.BeginTransaction();
        }

        public void CloseConnection()
        {
            if (connection.State != ConnectionState.Closed)
            {
                connection.Close();
            }
        }

        public void OpenConnection()
        {
            if(connection.State!= ConnectionState.Open)
            {
                connection.Open();
            }
        }

        public SqlCommand CreateCommand(string upit)
        {
            return new SqlCommand(upit, connection, transaction);
        }
    }
}
