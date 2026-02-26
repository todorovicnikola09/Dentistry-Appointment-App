using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// 1. DODAVANJE SERVISA U KONTEJNER

// Podešavamo kontrolere i iskljuèujemo automatsku promenu imena JSON propertija 
// (da bi React dobio npr. "Naziv" umesto "naziv" ako tako želiš)
builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });

// Konfiguracija CORS-a - definišemo jednu polisu "DozvoliSve"
builder.Services.AddCors(options =>
{
    options.AddPolicy("DozvoliSve",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// Dodavanje Swagger-a za testiranje API-ja
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 2. KONFIGURACIJA HTTP PIPELINE-A (Redosled je kritièan!)

// Omoguæavamo Swagger u development modu (na http://localhost:PORT/swagger)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// VAŽNO: CORS mora doæi pre Authorization i MapControllers
app.UseCors("DozvoliSve");

app.UseAuthorization();

// Mapiranje ruta ka tvojim kontrolerima (npr. UslugaController)
app.MapControllers();

app.Run();