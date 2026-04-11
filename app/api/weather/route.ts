import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat') || '30.3165'; // Default Dehradun
    const lon = searchParams.get('lon') || '78.0322';

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,visibility&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json();

    // Mapping open-meteo WMO codes to our app's icons and names
    const mapWMO = (code: number) => {
      if (code === 0) return { icon: 'sun', condition: 'Clear Sky', conditionHi: 'साफ आसमान' };
      if ([1,2,3].includes(code)) return { icon: code === 1 ? 'sun' : 'cloud-sun', condition: 'Partly Cloudy', conditionHi: 'आंशिक बादल' };
      if ([45, 48].includes(code)) return { icon: 'cloud', condition: 'Fog', conditionHi: 'कोहरा' };
      if ([51,53,55,56,57].includes(code)) return { icon: 'cloud-rain', condition: 'Drizzle', conditionHi: 'बूंदाबांदी' };
      if ([61,63,65,66,67].includes(code)) return { icon: 'cloud-rain', condition: 'Rain', conditionHi: 'बारिश' };
      if ([71,73,75,77].includes(code)) return { icon: 'cloud', condition: 'Snow', conditionHi: 'बर्फबारी' };
      if ([80,81,82].includes(code)) return { icon: 'cloud-rain', condition: 'Showers', conditionHi: 'बौछार' };
      if ([95,96,99].includes(code)) return { icon: 'storm', condition: 'Thunderstorm', conditionHi: 'आंधी तूफान' };
      return { icon: 'sun', condition: 'Sunny', conditionHi: 'धूप' };
    };

    const currentWmo = mapWMO(data.current.weather_code);

    const formattedData = {
      current: {
        temp: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        condition: currentWmo.condition,
        conditionHi: currentWmo.conditionHi,
        humidity: Math.round(data.current.relative_humidity_2m),
        windSpeed: Math.round(data.current.wind_speed_10m),
        visibility: Math.round(data.current.visibility / 1000), // convert m to km
        uvIndex: data.daily.uv_index_max[0] ? Math.round(data.daily.uv_index_max[0]) : 7,
        pressure: Math.round(data.current.surface_pressure),
        sunrise: new Date(data.daily.sunrise[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        sunset: new Date(data.daily.sunset[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      },
      soilMoisture: 45, // usually requires premium ag API, keeping mocked for now
      alerts: data.current.precipitation > 0 ? [
        {
          type: 'rain',
          severity: 'medium',
          message: `Rain detected. ${data.current.precipitation}mm expected.`,
          messageHi: `बारिश। ${data.current.precipitation}mm बारिश होने की उम्मीद।`,
        }
      ] : [],
      hourly: data.hourly.temperature_2m.slice(0, 6).map((temp: number, i: number) => ({
        time: i === 0 ? 'Now' : new Date(data.hourly.time[i]).toLocaleTimeString([], {hour: 'numeric'}),
        temp: Math.round(temp),
        icon: mapWMO(data.hourly.weather_code[i]).icon
      })),
      daily: data.daily.time.slice(0, 5).map((timeStr: string, i: number) => {
        const wmo = mapWMO(data.daily.weather_code[i]);
        return {
          day: i === 0 ? 'Today' : new Date(timeStr).toLocaleDateString([], {weekday: 'short'}),
          high: Math.round(data.daily.temperature_2m_max[i]),
          low: Math.round(data.daily.temperature_2m_min[i]),
          icon: wmo.icon,
          condition: wmo.condition,
          conditionHi: wmo.conditionHi
        };
      }),
      farmingInsights: [
        { title: 'Best time to irrigate', titleHi: 'सिंचाई का सही समय', value: '6-8 AM', iconName: 'Droplets', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { 
            title: 'Spray pesticide', 
            titleHi: 'कीटनाशक छिड़काव', 
            value: data.current.precipitation > 0 ? 'Not today' : 'Favorable', 
            valueHi: data.current.precipitation > 0 ? 'आज नहीं' : 'अनुकूल', 
            iconName: 'Leaf', 
            color: data.current.precipitation > 0 ? 'text-amber-500' : 'text-green-500', 
            bg: data.current.precipitation > 0 ? 'bg-amber-500/10' : 'bg-green-500/10' 
        },
        { 
            title: 'Harvest conditions', 
            titleHi: 'कटाई की स्थिति', 
            value: currentWmo.icon === 'sun' ? 'Good' : 'Wait', 
            valueHi: currentWmo.icon === 'sun' ? 'अच्छी' : 'प्रतीक्षा करें', 
            iconName: 'Sun', 
            color: 'text-green-500', 
            bg: 'bg-green-500/10' 
        },
      ],
    };

    return NextResponse.json(formattedData);
  } catch (err) {
    console.error("Weather API error", err);
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
