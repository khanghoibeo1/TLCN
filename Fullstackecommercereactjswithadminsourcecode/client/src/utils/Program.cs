using System.Data;
using System.Data.SqlClient;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace MyApp.Services
{
    public class AuthService
    {
        private readonly string _connectionString;

        public AuthService(string connectionString)
        {
            _connectionString = connectionString;
        }

        // Tạo SHA-256 hash
        private static string ComputeSha256Hash(string raw)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(raw));
            var sb = new StringBuilder();
            foreach (var b in bytes)
                sb.Append(b.ToString("x2"));
            return sb.ToString();
        }

        // Kiểm tra async xem user/pass có hợp lệ hay không
        public async Task<bool> AuthenticateAsync(string username, string password)
        {
            var hash = ComputeSha256Hash(password);

            const string sql = @"
                SELECT COUNT(1)
                FROM Users
                WHERE Username = @u AND PasswordHash = @p";

            await using var conn = new SqlConnection(_connectionString);
            await using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.Add("@u", SqlDbType.NVarChar, 50).Value = username;
            cmd.Parameters.Add("@p", SqlDbType.NVarChar, 64).Value = hash;

            await conn.OpenAsync();
            var cnt = (int)await cmd.ExecuteScalarAsync();
            return cnt == 1;
        }
    }
}
