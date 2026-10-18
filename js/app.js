/**
 * Main Application Controller for Campus Outfit Recommender
 */

import {
  getGPSLocation,
  reverseGeocode,
  fetchWeatherData,
  UNIVERSITY_PRESETS
} from './weatherService.js';

import {
  generateOutfitRecommendation,
  getDefaultScheduleMode,
  SCHEDULE_MODES
} from './outfitEngine.js';

// Application State
const state = {
  location: {
    lat: UNIVERSITY_PRESETS[0].lat,
    lon: UNIVERSITY_PRESETS[0].lon,
    name: UNIVERSITY_PRESETS[0].name,
    isGPS: false
  },
  weatherData: null,
  scheduleMode: getDefaultScheduleMode(), // auto-detect today's weekday
  customDep: 9,
  customRet: 17,
  gender: 'unisex',
  sensitivity: 0,
  checkedItems: new Set(),
  theme: 'auto', // 'auto' | 'dark' | 'light'
  chartHoverHour: null
};

// DOM Elements
const elements = {};

function cacheElements() {
  elements.locationName = document.getElementById('locationName');
  elements.gpsBtn = document.getElementById('gpsBtn');
  elements.presetSelect = document.getElementById('presetSelect');
  elements.refreshBtn = document.getElementById('refreshBtn');
  elements.lastUpdated = document.getElementById('lastUpdated');

  // Schedule Buttons
  elements.modeMonThu = document.getElementById('modeMonThu');
  elements.modeWedFri = document.getElementById('modeWedFri');
  elements.modeCustom = document.getElementById('modeCustom');
  elements.customScheduleInputs = document.getElementById('customScheduleInputs');
  elements.depHourInput = document.getElementById('depHourInput');
  elements.retHourInput = document.getElementById('retHourInput');
  elements.depHourVal = document.getElementById('depHourVal');
  elements.retHourVal = document.getElementById('retHourVal');

  // Sensitivity & Gender
  elements.sensitivitySlider = document.getElementById('sensitivitySlider');
  elements.sensitivityText = document.getElementById('sensitivityText');
  elements.genderBtns = document.querySelectorAll('.gender-btn');

  // Weather Overview
  elements.currentWeatherHero = document.getElementById('currentWeatherHero');
  elements.morningSlotCard = document.getElementById('morningSlotCard');
  elements.lunchSlotCard = document.getElementById('lunchSlotCard');
  elements.eveningSlotCard = document.getElementById('eveningSlotCard');

  // Chart Canvas
  elements.tempChartCanvas = document.getElementById('tempChartCanvas');

  // Recommendation Elements
  elements.outfitHeadline = document.getElementById('outfitHeadline');
  elements.outfitRationale = document.getElementById('outfitRationale');
  elements.outfitBadges = document.getElementById('outfitBadges');
  elements.outerItemsGrid = document.getElementById('outerItemsGrid');
  elements.topItemsGrid = document.getElementById('topItemsGrid');
  elements.bottomItemsGrid = document.getElementById('bottomItemsGrid');
  elements.shoesItemsGrid = document.getElementById('shoesItemsGrid');
  elements.accItemsGrid = document.getElementById('accItemsGrid');

  // Checklist & Copy
  elements.checklistContainer = document.getElementById('checklistContainer');
  elements.copySummaryBtn = document.getElementById('copySummaryBtn');
  elements.toastContainer = document.getElementById('toastContainer');
  elements.presetChipsContainer = document.getElementById('presetChips');
}

/**
 * Initialize application
 */
async function init() {
  cacheElements();
  populatePresets();
  setupEventListeners();
  updateScheduleUI();

  // Try GPS first, fallback to preset
  showToast('📍 GPS 위치를 확인하고 있습니다...', 'info');
  await acquireLocationAndLoadWeather(true);
}

/**
 * Populate presets dropdown and fast chips
 */
function populatePresets() {
  elements.presetSelect.innerHTML = UNIVERSITY_PRESETS.map((p, idx) => `
    <option value="${idx}">${p.name} (${p.region})</option>
  `).join('');

  // Top 5 popular chips
  const popular = [0, 1, 2, 3, 4, 8, 10]; // Shinchon, Hyehwa, Anam, Gwanak, Wangsimni, Suwon, Daejeon
  elements.presetChipsContainer.innerHTML = popular.map(idx => {
    const p = UNIVERSITY_PRESETS[idx];
    const short = p.name.split(' ')[0];
    return `<button class="chip-btn" data-preset="${idx}">${short}</button>`;
  }).join('');
}

/**
 * Event Listeners
 */
function setupEventListeners() {
  // GPS Button
  elements.gpsBtn.addEventListener('click', async () => {
    elements.gpsBtn.classList.add('loading');
    showToast('📡 현재 GPS 위치를 탐색 중입니다...', 'info');
    await acquireLocationAndLoadWeather(true);
    elements.gpsBtn.classList.remove('loading');
  });

  // Preset Select
  elements.presetSelect.addEventListener('change', async (e) => {
    const idx = parseInt(e.target.value, 10);
    const p = UNIVERSITY_PRESETS[idx];
    state.location = {
      lat: p.lat,
      lon: p.lon,
      name: `${p.name} (${p.region})`,
      isGPS: false
    };
    await loadWeatherData();
  });

  // Preset Chips
  elements.presetChipsContainer.addEventListener('click', async (e) => {
    const btn = e.target.closest('.chip-btn');
    if (!btn) return;
    const idx = parseInt(btn.dataset.preset, 10);
    elements.presetSelect.value = idx;
    const p = UNIVERSITY_PRESETS[idx];
    state.location = {
      lat: p.lat,
      lon: p.lon,
      name: `${p.name} (${p.region})`,
      isGPS: false
    };
    await loadWeatherData();
  });

  // Refresh
  elements.refreshBtn.addEventListener('click', async () => {
    elements.refreshBtn.classList.add('spinning');
    await loadWeatherData();
    setTimeout(() => elements.refreshBtn.classList.remove('spinning'), 600);
    showToast('🔄 최신 날씨 정보를 갱신했습니다.', 'success');
  });

  // Schedule Buttons
  elements.modeMonThu.addEventListener('click', () => setScheduleMode('mon_thu'));
  elements.modeWedFri.addEventListener('click', () => setScheduleMode('wed_fri'));
  elements.modeCustom.addEventListener('click', () => setScheduleMode('custom'));

  // Custom Hour Sliders
  elements.depHourInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    state.customDep = val;
    elements.depHourVal.textContent = `${val}:00`;
    if (state.customRet <= val) {
      state.customRet = Math.min(23, val + 1);
      elements.retHourInput.value = state.customRet;
      elements.retHourVal.textContent = `${state.customRet}:00`;
    }
    renderRecommendations();
    renderChart();
  });

  elements.retHourInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    state.customRet = val;
    elements.retHourVal.textContent = `${val}:00`;
    if (val <= state.customDep) {
      state.customDep = Math.max(0, val - 1);
      elements.depHourInput.value = state.customDep;
      elements.depHourVal.textContent = `${state.customDep}:00`;
    }
    renderRecommendations();
    renderChart();
  });

  // Sensitivity Slider
  elements.sensitivitySlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    state.sensitivity = val;
    let text = '체감온도 보통 (표준 기준)';
    if (val === -2) text = '❄️ 더위를 많이 타요 (-2℃ 얇게 추천)';
    if (val === 2) text = '🧣 추위를 많이 타요 (+2℃ 따뜻하게 추천)';
    elements.sensitivityText.textContent = text;
    renderRecommendations();
  });

  // Gender Buttons
  elements.genderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.genderBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.gender = btn.dataset.gender;
      renderRecommendations();
    });
  });

  // Copy Summary
  elements.copySummaryBtn.addEventListener('click', copyOutfitSummary);

  // Window resize for chart
  window.addEventListener('resize', () => {
    renderChart();
  });

  // Canvas mousemove
  if (elements.tempChartCanvas) {
    elements.tempChartCanvas.addEventListener('mousemove', handleChartHover);
    elements.tempChartCanvas.addEventListener('mouseleave', () => {
      state.chartHoverHour = null;
      renderChart();
    });
  }
}

/**
 * Acquire GPS location or fallback
 */
async function acquireLocationAndLoadWeather(tryGPS = true) {
  if (tryGPS) {
    const gpsResult = await getGPSLocation();
    if (gpsResult.success) {
      const address = await reverseGeocode(gpsResult.coords.lat, gpsResult.coords.lon);
      state.location = {
        lat: gpsResult.coords.lat,
        lon: gpsResult.coords.lon,
        name: address || 'GPS 실시간 위치',
        isGPS: true
      };
      showToast('📍 GPS 위치를 성공적으로 가져왔습니다!', 'success');
    } else {
      showToast(gpsResult.error, 'info');
      // Keep default preset
    }
  }

  await loadWeatherData();
}

/**
 * Load Weather Data from Service
 */
async function loadWeatherData() {
  try {
    elements.locationName.textContent = state.location.name;
    const data = await fetchWeatherData(state.location.lat, state.location.lon);
    state.weatherData = data;

    updateHeroWeather(data);
    updateSlotCards(data);
    renderChart();
    renderRecommendations();

    const now = new Date();
    elements.lastUpdated.textContent = `업데이트: ${now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
  } catch (err) {
    console.error(err);
    showToast('날씨 정보를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
  }
}

/**
 * Switch schedule mode
 */
function setScheduleMode(mode) {
  state.scheduleMode = mode;
  updateScheduleUI();
  renderRecommendations();
  renderChart();
}

function updateScheduleUI() {
  elements.modeMonThu.classList.toggle('active', state.scheduleMode === 'mon_thu');
  elements.modeWedFri.classList.toggle('active', state.scheduleMode === 'wed_fri');
  elements.modeCustom.classList.toggle('active', state.scheduleMode === 'custom');

  if (state.scheduleMode === 'custom') {
    elements.customScheduleInputs.style.display = 'flex';
  } else {
    elements.customScheduleInputs.style.display = 'none';
  }

  // Highlight active slot cards
  if (elements.morningSlotCard) {
    elements.morningSlotCard.classList.add('scheduled-active');
  }
  if (elements.lunchSlotCard) {
    elements.lunchSlotCard.classList.toggle('scheduled-active', state.scheduleMode === 'wed_fri');
  }
  if (elements.eveningSlotCard) {
    elements.eveningSlotCard.classList.toggle('scheduled-active', state.scheduleMode === 'mon_thu');
  }
}

/**
 * Render Hero Current Weather
 */
function updateHeroWeather(data) {
  const current = data.current;
  const daily = data.daily;
  const weather = current.weatherInfo;

  // Background dynamic class
  const heroCard = document.querySelector('.weather-hero-card');
  if (heroCard) {
    heroCard.className = `weather-hero-card weather-bg-${weather.bg || 'sunny'}`;
  }

  elements.currentWeatherHero.innerHTML = `
    <div class="hero-main-group">
      <div class="hero-weather-icon-badge">
        <span class="hero-emoji">${weather.icon}</span>
        <span class="hero-weather-text">${weather.label}</span>
      </div>
      <div class="hero-temp-block">
        <div class="hero-temp">${current.temp}<span class="unit">°C</span></div>
        <div class="hero-apparent">체감온도 <strong>${current.apparentTemp}°C</strong></div>
      </div>
    </div>

    <div class="hero-meta-grid">
      <div class="meta-item">
        <span class="meta-icon">🌡️</span>
        <span class="meta-label">최저 / 최고</span>
        <span class="meta-val">${daily.minTemp}° / ${daily.maxTemp}°</span>
      </div>
      <div class="meta-item">
        <span class="meta-icon">💨</span>
        <span class="meta-label">풍속</span>
        <span class="meta-val">${current.windSpeed} m/s</span>
      </div>
      <div class="meta-item">
        <span class="meta-icon">💧</span>
        <span class="meta-label">습도</span>
        <span class="meta-val">${current.humidity}%</span>
      </div>
      <div class="meta-item">
        <span class="meta-icon">⚖️</span>
        <span class="meta-label">오늘 일교차</span>
        <span class="meta-val highlight-swing">${daily.tempDiff}°C</span>
      </div>
    </div>
  `;
}

/**
 * Render 3 Key Timetable Slot Cards
 */
function updateSlotCards(data) {
  const { morning, lunch, evening } = data.slots;

  renderSingleSlotCard(elements.morningSlotCard, morning, {
    badgeText: '등교 공통',
    badgeClass: 'badge-morning',
    subText: '하루 중 가장 쌀쌀한 시간'
  });

  renderSingleSlotCard(elements.lunchSlotCard, lunch, {
    badgeText: '수·금 하교',
    badgeClass: 'badge-lunch',
    subText: '점심시간 & 빠른 하교'
  });

  renderSingleSlotCard(elements.eveningSlotCard, evening, {
    badgeText: '월·목 하교',
    badgeClass: 'badge-evening',
    subText: '오후 수업 후 늦은 하교'
  });
}

function renderSingleSlotCard(container, slot, meta) {
  if (!container) return;
  const isRain = slot.rainProb >= 40;
  container.innerHTML = `
    <div class="slot-card-header">
      <div class="slot-time-group">
        <span class="slot-time">${slot.timeRange}</span>
        <span class="slot-badge ${meta.badgeClass}">${meta.badgeText}</span>
      </div>
      <span class="slot-icon">${slot.weatherInfo.icon}</span>
    </div>

    <div class="slot-temp-row">
      <div class="slot-temp">${slot.temp}°C</div>
      <div class="slot-apparent">체감 ${slot.apparentTemp}°C</div>
    </div>

    <div class="slot-status-pill ${isRain ? 'slot-rain-alert' : ''}">
      <span>${slot.weatherInfo.label}</span>
      <span>•</span>
      <span>강수확률 ${slot.rainProb}%</span>
    </div>

    <div class="slot-meta-row">
      <span>💨 ${slot.windSpeed}m/s</span>
      <span>💧 ${slot.humidity}%</span>
      <span>☀️ UV ${slot.uvIndex}</span>
    </div>

    <div class="slot-subtext">${meta.subText}</div>
  `;
}

/**
 * Interactive 24-Hour Temperature Curve with Bézier Spline
 */
function renderChart() {
  const canvas = elements.tempChartCanvas;
  if (!canvas || !state.weatherData) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  // Responsive canvas sizing
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  ctx.clearRect(0, 0, width, height);

  const hourly = state.weatherData.hourly;
  if (!hourly || hourly.length === 0) return;

  // Determine active schedule hours to highlight
  let depHour = 9;
  let retHour = 17;
  if (state.scheduleMode === 'wed_fri') {
    retHour = 12;
  } else if (state.scheduleMode === 'custom') {
    depHour = state.customDep;
    retHour = state.customRet;
  }

  // Padding
  const padLeft = 32;
  const padRight = 32;
  const padTop = 38;
  const padBottom = 34;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // Find min and max temps
  const temps = hourly.map(h => h.temp);
  const minT = Math.min(...temps) - 2;
  const maxT = Math.max(...temps) + 2;
  const rangeT = Math.max(1, maxT - minT);

  const getX = (idx) => padLeft + (idx / 23) * plotW;
  const getY = (temp) => padTop + plotH - ((temp - minT) / rangeT) * plotH;

  // 1. Draw scheduled time range highlight (background band between depHour and retHour)
  const xDep = getX(depHour);
  const xRet = getX(retHour);
  const gradBand = ctx.createLinearGradient(0, 0, 0, height);
  gradBand.addColorStop(0, 'rgba(99, 102, 241, 0.16)');
  gradBand.addColorStop(1, 'rgba(99, 102, 241, 0.02)');
  ctx.fillStyle = gradBand;
  ctx.fillRect(xDep, padTop, xRet - xDep, plotH);

  // Border lines for dep and ret
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(xDep, padTop);
  ctx.lineTo(xDep, height - padBottom);
  ctx.moveTo(xRet, padTop);
  ctx.lineTo(xRet, height - padBottom);
  ctx.stroke();
  ctx.setLineDash([]);

  // 2. Draw subtle horizontal grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  const stepT = Math.ceil(rangeT / 4);
  for (let t = Math.ceil(minT); t <= maxT; t += stepT) {
    const y = getY(t);
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();

    ctx.fillStyle = 'rgba(150, 160, 185, 0.6)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${t}°`, padLeft - 6, y + 3);
  }

  // 3. Draw Temperature Area & Curve
  ctx.beginPath();
  ctx.moveTo(getX(0), getY(hourly[0].temp));
  for (let i = 0; i < 23; i++) {
    const x0 = getX(i);
    const y0 = getY(hourly[i].temp);
    const x1 = getX(i + 1);
    const y1 = getY(hourly[i + 1].temp);
    const mx = (x0 + x1) / 2;
    ctx.bezierCurveTo(mx, y0, mx, y1, x1, y1);
  }

  // Stroke line
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(99, 102, 241, 0.5)';
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Fill gradient
  ctx.lineTo(getX(23), height - padBottom);
  ctx.lineTo(getX(0), height - padBottom);
  ctx.closePath();
  const areaGrad = ctx.createLinearGradient(0, padTop, 0, height - padBottom);
  areaGrad.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
  areaGrad.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
  ctx.fillStyle = areaGrad;
  ctx.fill();

  // 4. Draw points and labels for key hours (09:00, 12:00, 17:00 + schedule ends)
  const keyHours = new Set([9, 12, 16, 17, depHour, retHour]);

  hourly.forEach((h, idx) => {
    const x = getX(idx);
    const y = getY(h.temp);
    const isKey = keyHours.has(idx);
    const isHover = state.chartHoverHour === idx;

    // Time labels at bottom
    if (idx % 3 === 0 || isKey) {
      ctx.fillStyle = isKey ? '#a5b4fc' : 'rgba(150, 160, 185, 0.7)';
      ctx.font = isKey ? 'bold 11px sans-serif' : '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${idx}시`, x, height - padBottom + 16);
    }

    if (isKey || isHover) {
      // Glow circle
      ctx.beginPath();
      ctx.arc(x, y, isHover ? 6 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = (idx === depHour || idx === retHour) ? '#ec4899' : '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Temp text above point
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${h.temp}°`, x, y - 10);
    }
  });

  // 5. Draw pinned badges for 등교 & 하교
  drawBadgePin(ctx, getX(depHour), getY(hourly[depHour].temp), '등교 09시', '#38bdf8');
  const retLabel = (state.scheduleMode === 'wed_fri') ? '수·금 하교 12시' : (state.scheduleMode === 'mon_thu') ? '월·목 하교 17시' : `하교 ${retHour}시`;
  drawBadgePin(ctx, getX(retHour), getY(hourly[retHour].temp), retLabel, '#ec4899');
}

function drawBadgePin(ctx, x, y, text, color) {
  ctx.save();
  ctx.font = 'bold 10px sans-serif';
  const textWidth = ctx.measureText(text).width;
  const padX = 8;
  const pillW = textWidth + padX * 2;
  const pillH = 18;
  const pillX = Math.max(4, Math.min(ctx.canvas.width / (window.devicePixelRatio || 1) - pillW - 4, x - pillW / 2));
  const pillY = y - 28;

  // Background pill
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 9);
  ctx.fill();

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, pillX + pillW / 2, pillY + pillH / 2);
  ctx.restore();
}

function handleChartHover(e) {
  const canvas = elements.tempChartCanvas;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const padLeft = 32;
  const padRight = 32;
  const plotW = rect.width - padLeft - padRight;

  const ratio = Math.max(0, Math.min(1, (mouseX - padLeft) / plotW));
  const hour = Math.round(ratio * 23);
  if (state.chartHoverHour !== hour) {
    state.chartHoverHour = hour;
    renderChart();
  }
}

/**
 * Render Smart Outfit Recommendations
 */
function renderRecommendations() {
  if (!state.weatherData) return;

  const rec = generateOutfitRecommendation(state.weatherData, state.scheduleMode, {
    gender: state.gender,
    sensitivity: state.sensitivity,
    customDep: state.customDep,
    customRet: state.customRet
  });

  // Headline & Rationale
  elements.outfitHeadline.textContent = rec.headline;
  elements.outfitRationale.textContent = rec.rationale;

  // Badges
  elements.outfitBadges.innerHTML = rec.badges.map(b => `
    <span class="outfit-tag outfit-tag-${b.type}">${b.text}</span>
  `).join('');

  // Items Grids
  renderItemCategory(elements.outerItemsGrid, rec.recommendations.outer);
  renderItemCategory(elements.topItemsGrid, rec.recommendations.top);
  renderItemCategory(elements.bottomItemsGrid, rec.recommendations.bottom);
  renderItemCategory(elements.shoesItemsGrid, rec.recommendations.shoes);
  renderItemCategory(elements.accItemsGrid, rec.recommendations.acc);

  // Morning Checklist
  renderChecklist(rec.checklist);
}

function renderItemCategory(container, items) {
  if (!container) return;
  container.innerHTML = items.map(item => `
    <div class="clothing-card">
      <div class="clothing-icon">${item.icon || '👕'}</div>
      <div class="clothing-info">
        <h4 class="clothing-name">${item.name}</h4>
        <p class="clothing-desc">${item.desc}</p>
      </div>
    </div>
  `).join('');
}

function renderChecklist(checklist) {
  if (!elements.checklistContainer) return;
  elements.checklistContainer.innerHTML = checklist.map((item, idx) => {
    const isChecked = state.checkedItems.has(item.id);
    return `
      <label class="checklist-item ${isChecked ? 'checked' : ''}" data-id="${item.id}">
        <input type="checkbox" ${isChecked ? 'checked' : ''}>
        <span class="custom-checkbox"></span>
        <span class="checklist-text">${item.text}</span>
      </label>
    `;
  }).join('');

  // Add click handlers for checkboxes
  elements.checklistContainer.querySelectorAll('.checklist-item').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const id = el.dataset.id;
      const checkbox = el.querySelector('input');
      const newState = !checkbox.checked;
      checkbox.checked = newState;
      el.classList.toggle('checked', newState);
      if (newState) {
        state.checkedItems.add(id);
      } else {
        state.checkedItems.delete(id);
      }
    });
  });
}

/**
 * Copy Outfit Summary to Clipboard
 */
function copyOutfitSummary() {
  if (!state.weatherData) return;

  const rec = generateOutfitRecommendation(state.weatherData, state.scheduleMode, {
    gender: state.gender,
    sensitivity: state.sensitivity,
    customDep: state.customDep,
    customRet: state.customRet
  });

  const slots = state.weatherData.slots;
  const summaryText = `[🎓 캠퍼스 등하교 날씨 & OOTD 코디 추천]
📍 위치: ${state.location.name}
📅 스케줄: ${rec.scheduleInfo.label}

🌤️ 시간대별 날씨
- 09시 등교길: ${slots.morning.temp}℃ (${slots.morning.weatherInfo.label}, 강수 ${slots.morning.rainProb}%)
- 12시 점심(수·금 하교): ${slots.lunch.temp}℃ (${slots.lunch.weatherInfo.label}, 강수 ${slots.lunch.rainProb}%)
- 17시 저녁(월·목 하교): ${slots.evening.temp}℃ (${slots.evening.weatherInfo.label}, 강수 ${slots.evening.rainProb}%)

💡 오늘 코디 요약:
${rec.headline}
${rec.rationale}

👔 추천 착장:
- 아우터: ${rec.recommendations.outer[0]?.name || '없음'}
- 상의: ${rec.recommendations.top[0]?.name || '기본 셔츠/니트'}
- 하의: ${rec.recommendations.bottom[0]?.name || '데님/슬랙스'}
- 신발: ${rec.recommendations.shoes[0]?.name || '스니커즈'}
- 소품: ${rec.recommendations.acc[0]?.name || '가방'}

(기온차 ${rec.diurnalSwing}℃ / ${rec.willRain ? '우산 필수 지참! ☔' : '비 소식 없음 ☀️'})
`;

  navigator.clipboard.writeText(summaryText).then(() => {
    showToast('📋 오늘의 코디 요약이 클립보드에 복사되었습니다!', 'success');
  }).catch(() => {
    showToast('복사에 실패했습니다. 권한을 확인해주세요.', 'error');
  });
}

/**
 * Modern Toast Notifications
 */
function showToast(message, type = 'info') {
  if (!elements.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
    <span class="toast-msg">${message}</span>
  `;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// Kick off when DOM is ready
document.addEventListener('DOMContentLoaded', init);
