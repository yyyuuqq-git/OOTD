/**
 * Weather Service for Campus Weather & Outfit Recommendation App
 * Utilizes Open-Meteo API (Free, high-accuracy, no API key required)
 * and Geolocation with Fallback presets.
 */

export const UNIVERSITY_PRESETS = [
  { name: '신촌 (연세대/이화여대/서강대)', lat: 37.5598, lon: 126.9426, region: '서울 서대문구' },
  { name: '혜화/대학로 (성균관대/서울대병원)', lat: 37.5833, lon: 127.0019, region: '서울 종로구' },
  { name: '안암 (고려대)', lat: 37.5864, lon: 127.0292, region: '서울 성북구' },
  { name: '관악 (서울대)', lat: 37.4599, lon: 126.9519, region: '서울 관악구' },
  { name: '왕십리 (한양대)', lat: 37.5619, lon: 127.0378, region: '서울 성동구' },
  { name: '회기/이문 (경희대/한국외대/서울시립대)', lat: 37.5962, lon: 127.0526, region: '서울 동대문구' },
  { name: '흑석/상도 (중앙대/숭실대)', lat: 37.5050, lon: 126.9571, region: '서울 동작구' },
  { name: '건대입구 (건국대/세종대)', lat: 37.5407, lon: 127.0692, region: '서울 광진구' },
  { name: '수원 (성균관대 자연과학캠/아주대)', lat: 37.2933, lon: 126.9749, region: '경기 수원시' },
  { name: '송도 (인천대/연세대 송도캠)', lat: 37.3828, lon: 126.6575, region: '인천 연수구' },
  { name: '대전 유성 (KAIST/충남대)', lat: 36.3688, lon: 127.3568, region: '대전 유성구' },
  { name: '대구 (경북대/계명대)', lat: 35.8906, lon: 128.6121, region: '대구 북구' },
  { name: '부산 (부산대/부경대)', lat: 35.2335, lon: 129.0799, region: '부산 금정구' },
  { name: '광주 (전남대/조선대)', lat: 35.1764, lon: 126.9080, region: '광주 북구' },
  { name: '서울 강남', lat: 37.4979, lon: 127.0276, region: '서울 강남구' },
  { name: '판교 테크노밸리', lat: 37.3948, lon: 127.1119, region: '경기 성남시' }
];

export const WMO_WEATHER_MAP = {
  0: { label: '맑음', icon: '☀️', type: 'clear', bg: 'sunny' },
  1: { label: '대체로 맑음', icon: '🌤️', type: 'clear', bg: 'sunny' },
  2: { label: '구름 조금', icon: '⛅', type: 'cloudy', bg: 'cloudy' },
  3: { label: '흐림', icon: '☁️', type: 'cloudy', bg: 'cloudy' },
  45: { label: '안개', icon: '🌫️', type: 'fog', bg: 'fog' },
  48: { label: '성에 안개', icon: '🌫️', type: 'fog', bg: 'fog' },
  51: { label: '약한 이슬비', icon: '🌦️', type: 'rain', bg: 'rain' },
  53: { label: '이슬비', icon: '🌦️', type: 'rain', bg: 'rain' },
  55: { label: '강한 이슬비', icon: '🌧️', type: 'rain', bg: 'rain' },
  56: { label: '얼어붙는 이슬비', icon: '🌧️❄️', type: 'rain', bg: 'rain' },
  57: { label: '강한 얼어붙는 이슬비', icon: '🌧️❄️', type: 'rain', bg: 'rain' },
  61: { label: '약한 비', icon: '🌧️', type: 'rain', bg: 'rain' },
  63: { label: '보통 비', icon: '🌧️', type: 'rain', bg: 'rain' },
  65: { label: '강한 비', icon: '⛈️', type: 'rain', bg: 'rain' },
  66: { label: '약한 진눈깨비', icon: '🌨️', type: 'rain-snow', bg: 'rain' },
  67: { label: '강한 진눈깨비', icon: '🌨️', type: 'rain-snow', bg: 'rain' },
  71: { label: '약한 눈', icon: '🌨️', type: 'snow', bg: 'snow' },
  73: { label: '보통 눈', icon: '❄️', type: 'snow', bg: 'snow' },
  75: { label: '대설', icon: '❄️☃️', type: 'snow', bg: 'snow' },
  77: { label: '싸락눈', icon: '🌨️', type: 'snow', bg: 'snow' },
  80: { label: '약한 소나기', icon: '🌦️', type: 'rain', bg: 'rain' },
  81: { label: '소나기', icon: '🌧️', type: 'rain', bg: 'rain' },
  82: { label: '폭우성 소나기', icon: '⛈️', type: 'rain', bg: 'rain' },
  85: { label: '약한 눈 소나기', icon: '🌨️', type: 'snow', bg: 'snow' },
  86: { label: '강한 눈 소나기', icon: '❄️', type: 'snow', bg: 'snow' },
  95: { label: '천둥번개', icon: '⛈️⚡', type: 'thunder', bg: 'rain' },
  96: { label: '우박 동반 뇌우', icon: '⛈️⚡', type: 'thunder', bg: 'rain' },
  99: { label: '강한 우박 뇌우', icon: '⛈️⚡', type: 'thunder', bg: 'rain' }
};

export function getWeatherInfo(code) {
  return WMO_WEATHER_MAP[code] || { label: '맑음/보통', icon: '🌤️', type: 'clear', bg: 'sunny' };
}

/**
 * Get device GPS coordinates with timeout and fallback
 */
export async function getGPSLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        success: false,
        error: '브라우저가 위치 정보를 지원하지 않습니다.',
        coords: { lat: UNIVERSITY_PRESETS[0].lat, lon: UNIVERSITY_PRESETS[0].lon, name: UNIVERSITY_PRESETS[0].name }
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          coords: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
            name: 'GPS 실시간 위치'
          }
        });
      },
      (error) => {
        let msg = '위치 접근 권한이 필요합니다.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'GPS 권한이 거부되어 기본 대학가(신촌) 위치로 설정되었습니다.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = '위치 신호를 찾을 수 없어 기본 위치로 설정되었습니다.';
        } else if (error.code === error.TIMEOUT) {
          msg = '위치 요청 시간이 초과되어 기본 위치로 설정되었습니다.';
        }
        resolve({
          success: false,
          error: msg,
          coords: { lat: UNIVERSITY_PRESETS[0].lat, lon: UNIVERSITY_PRESETS[0].lon, name: UNIVERSITY_PRESETS[0].name }
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000
      }
    );
  });
}

/**
 * Reverse geocode latitude and longitude to human-readable address
 */
export async function reverseGeocode(lat, lon) {
  try {
    // Attempt BigDataCloud client-side free reverse geocoding API
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ko`
    );
    if (response.ok) {
      const data = await response.json();
      const parts = [];
      if (data.principalSubdivision) parts.push(data.principalSubdivision);
      if (data.city && data.city !== data.principalSubdivision) parts.push(data.city);
      if (data.locality) parts.push(data.locality);
      if (parts.length > 0) {
        return parts.join(' ');
      }
    }
  } catch (e) {
    console.warn('Reverse geocoding failed, falling back to closest preset calculation:', e);
  }

  // Fallback: calculate nearest preset
  let nearest = UNIVERSITY_PRESETS[0];
  let minDistance = Infinity;

  for (const preset of UNIVERSITY_PRESETS) {
    const d = Math.hypot(preset.lat - lat, preset.lon - lon);
    if (d < minDistance) {
      minDistance = d;
      nearest = preset;
    }
  }

  if (minDistance < 0.15) {
    return `${nearest.name} 부근 (${nearest.region})`;
  }
  return `좌표 (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`;
}

/**
 * Fetch detailed weather forecast from Open-Meteo
 */
export async function fetchWeatherData(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=Asia%2FSeoul`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`날씨 데이터를 불러오는데 실패했습니다: ${response.status}`);
  }

  const raw = await response.json();
  return parseForecastData(raw);
}

/**
 * Parse Open-Meteo hourly & daily data into convenient university timetable slots
 */
function parseForecastData(data) {
  const hourly = data.hourly;
  const daily = data.daily;
  const current = data.current;

  // Find today's hours (first 24 slots)
  const todayTimes = hourly.time.slice(0, 24);
  const todayHourly = todayTimes.map((timeStr, idx) => {
    const hour = new Date(timeStr).getHours();
    const weatherInfo = getWeatherInfo(hourly.weather_code[idx]);
    return {
      time: timeStr,
      hour,
      temp: Math.round(hourly.temperature_2m[idx]),
      apparentTemp: Math.round(hourly.apparent_temperature[idx]),
      rainProb: hourly.precipitation_probability ? hourly.precipitation_probability[idx] : 0,
      precipitation: hourly.precipitation[idx] || 0,
      humidity: hourly.relative_humidity_2m[idx],
      windSpeed: Math.round(hourly.wind_speed_10m[idx] * 10) / 10,
      uvIndex: hourly.uv_index ? hourly.uv_index[idx] : 0,
      weatherCode: hourly.weather_code[idx],
      weatherInfo
    };
  });

  // Extract key slots requested:
  // 1. Morning (09:00 ~ 10:00) : 등교 시간
  const morningSlot9 = todayHourly.find(h => h.hour === 9) || todayHourly[9] || todayHourly[0];
  const morningSlot10 = todayHourly.find(h => h.hour === 10) || todayHourly[10] || morningSlot9;
  const morningAvgTemp = Math.round((morningSlot9.temp + morningSlot10.temp) / 2);
  const morningAvgApparent = Math.round((morningSlot9.apparentTemp + morningSlot10.apparentTemp) / 2);
  const morningRainProb = Math.max(morningSlot9.rainProb, morningSlot10.rainProb);
  const morningWeather = (morningSlot9.rainProb > morningSlot10.rainProb) ? morningSlot9.weatherInfo : morningSlot10.weatherInfo;

  const morning = {
    title: '아침 등교 시간',
    timeRange: '09:00 ~ 10:00',
    hour: 9,
    temp: morningAvgTemp,
    apparentTemp: morningAvgApparent,
    rainProb: morningRainProb,
    weatherInfo: morningWeather,
    windSpeed: morningSlot9.windSpeed,
    humidity: morningSlot9.humidity,
    uvIndex: morningSlot9.uvIndex,
    slot9: morningSlot9,
    slot10: morningSlot10
  };

  // 2. Lunch (12:00 ~ 13:00) : 점심 및 수/금 하교 시간
  const lunchSlot = todayHourly.find(h => h.hour === 12) || todayHourly[12] || todayHourly[0];
  const lunch = {
    title: '점심 / 수·금 하교',
    timeRange: '12:00 ~ 13:00',
    hour: 12,
    temp: lunchSlot.temp,
    apparentTemp: lunchSlot.apparentTemp,
    rainProb: lunchSlot.rainProb,
    weatherInfo: lunchSlot.weatherInfo,
    windSpeed: lunchSlot.windSpeed,
    humidity: lunchSlot.humidity,
    uvIndex: lunchSlot.uvIndex,
    slot12: lunchSlot
  };

  // 3. Evening (16:00 ~ 17:00) : 월/목 늦은 하교 시간
  const eveningSlot16 = todayHourly.find(h => h.hour === 16) || todayHourly[16] || todayHourly[0];
  const eveningSlot17 = todayHourly.find(h => h.hour === 17) || todayHourly[17] || eveningSlot16;
  const eveningAvgTemp = Math.round((eveningSlot16.temp + eveningSlot17.temp) / 2);
  const eveningAvgApparent = Math.round((eveningSlot16.apparentTemp + eveningSlot17.apparentTemp) / 2);
  const eveningRainProb = Math.max(eveningSlot16.rainProb, eveningSlot17.rainProb);
  const eveningWeather = (eveningSlot17.rainProb > eveningSlot16.rainProb) ? eveningSlot17.weatherInfo : eveningSlot16.weatherInfo;

  const evening = {
    title: '저녁 / 월·목 하교',
    timeRange: '16:00 ~ 17:00',
    hour: 17,
    temp: eveningAvgTemp,
    apparentTemp: eveningAvgApparent,
    rainProb: eveningRainProb,
    weatherInfo: eveningWeather,
    windSpeed: eveningSlot17.windSpeed,
    humidity: eveningSlot17.humidity,
    uvIndex: eveningSlot17.uvIndex,
    slot16: eveningSlot16,
    slot17: eveningSlot17
  };

  // Daily summary
  const minTemp = Math.round(daily.temperature_2m_min[0]);
  const maxTemp = Math.round(daily.temperature_2m_max[0]);
  const tempDiff = maxTemp - minTemp; // Daily temperature swing (일교차)

  // Current weather
  const currentInfo = {
    temp: Math.round(current.temperature_2m),
    apparentTemp: Math.round(current.apparent_temperature),
    weatherInfo: getWeatherInfo(current.weather_code),
    windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
    humidity: current.relative_humidity_2m
  };

  return {
    current: currentInfo,
    daily: {
      minTemp,
      maxTemp,
      tempDiff,
      sunrise: daily.sunrise[0],
      sunset: daily.sunset[0],
      precipitationSum: daily.precipitation_sum ? daily.precipitation_sum[0] : 0
    },
    slots: {
      morning,
      lunch,
      evening
    },
    hourly: todayHourly
  };
}
