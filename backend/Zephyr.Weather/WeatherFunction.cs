using System.Globalization;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace Zephyr.Weather;

public class WeatherFunction
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<WeatherFunction> _logger;

    public WeatherFunction(
        HttpClient httpClient,
        ILogger<WeatherFunction> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    [Function("Weather")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequest req)
    {
        const double latitude = 51.44083;
        const double longitude = 5.47778;

        var url =
            $"https://api.open-meteo.com/v1/forecast" +
            $"?latitude={latitude.ToString(CultureInfo.InvariantCulture)}" +
            $"&longitude={longitude.ToString(CultureInfo.InvariantCulture)}" +
            $"&current=temperature_2m,apparent_temperature," +
            $"relative_humidity_2m,precipitation,weather_code,wind_speed_10m";

        _logger.LogInformation($"Requesting weather data using url: ${url}");

        var weather = await _httpClient.GetFromJsonAsync<OpenMeteoResponse>(url);

        return new OkObjectResult(new { precipitation = weather.Current.Precipitation });
    }

    public sealed record OpenMeteoResponse(
        double Latitude,
        double Longitude,
        string Timezone,
        CurrentWeather Current);

    public sealed record CurrentWeather(
        DateTime Time,
        double Temperature_2m,
        double Apparent_temperature,
        int Relative_humidity_2m,
        double Precipitation,
        int Weather_code,
        double Wind_speed_10m);
}
