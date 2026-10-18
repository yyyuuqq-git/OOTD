/**
 * Campus Outfit Recommendation Engine
 * Analyzes weather by morning (9-10 AM), lunch (12 PM), and evening (4-5 PM)
 * tailored to university schedules (Mon/Thu afternoon class vs Wed/Fri lunch dismissal)
 */

export const SCHEDULE_MODES = {
  MON_THU: {
    id: 'mon_thu',
    label: '월·목 모드 (오후 수업 / 17시 하교)',
    shortLabel: '월·목 (종일)',
    departureHour: 9,
    returnHour: 17,
    description: '09:00 등교 ~ 17:00 하교. 아침 찬바람과 저녁 기온 급강하를 모두 대비하는 레이어드 코디가 필수입니다.'
  },
  WED_FRI: {
    id: 'wed_fri',
    label: '수·금 모드 (점심 하교 / 12시 하교)',
    shortLabel: '수·금 (반일)',
    departureHour: 9,
    returnHour: 12,
    description: '09:00 등교 ~ 12:00 하교. 등교길 쌀쌀함만 견디면 점심에는 따뜻하므로, 벗어서 보관하기 편한 가벼운 겉옷이 유리합니다.'
  },
  CUSTOM: {
    id: 'custom',
    label: '자율 스케줄 모드',
    shortLabel: '자율 설정',
    departureHour: 9,
    returnHour: 17,
    description: '사용자가 지정한 등하교 시간에 맞추어 실시간 날씨를 분석합니다.'
  }
};

/**
 * Determine default schedule mode based on day of the week
 * 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
 */
export function getDefaultScheduleMode() {
  const day = new Date().getDay();
  if (day === 1 || day === 4) { // Monday or Thursday
    return 'mon_thu';
  } else if (day === 3 || day === 5) { // Wednesday or Friday
    return 'wed_fri';
  } else {
    // Tuesday, Saturday, Sunday
    return 'mon_thu';
  }
}

/**
 * Detailed clothing database categorized by temperature brackets, gender, and style
 */
const CLOTHING_DATABASE = [
  {
    range: [-50, 4],
    level: 'extreme_cold',
    levelName: '혹한기 (4℃ 이하)',
    summary: '패딩과 기모는 필수! 방한 대책을 단단히 세워야 하는 날씨',
    items: {
      outer: [
        { name: '헤비 롱패딩 / 숏패딩', desc: '찬 공기를 완벽 차단하는 필수 아우터', icon: '🧥' },
        { name: '두툼한 울 헤비 코트', desc: '이너를 든든히 껴입은 울 90% 이상 코트', icon: '🧥' },
        { name: '무스탕 / 다운 파카', desc: '캠퍼스 칼바람을 막아주는 방풍 아우터', icon: '❄️' }
      ],
      top: [
        { name: '발열내의 (히트텍) + 두꺼운 울 니트', desc: '체온을 2~3도 올려주는 필수 레이어드', icon: '👕' },
        { name: '기모 맨투맨 / 기모 후드티', desc: '활동성 좋고 보온성 높은 캠퍼스 기본 상의', icon: '🥼' },
        { name: '터틀넥 (목폴라) 니트', desc: '목으로 들어오는 찬바람을 원천 차단', icon: '🧣' }
      ],
      bottom: [
        { name: '기모 본딩 와이드 데님', desc: '안감에 기모가 덧대어져 따뜻한 팬츠', icon: '👖' },
        { name: '울 슬랙스 / 기모 조거팬츠', desc: '수업 들을 때 편안하면서도 따뜻한 하의', icon: '👖' },
        { name: '도톰한 골덴(코듀로이) 팬츠', desc: '계절감이 살아있는 따뜻한 소재', icon: '👖' }
      ],
      shoes: [
        { name: '어그 / 방한 부츠', desc: '발끝 시림을 방지하는 필수 슈즈', icon: '🥾' },
        { name: '두꺼운 울 양말 + 가죽 스니커즈', desc: '찬 바람이 발목으로 들어오지 않도록 커버', icon: '👟' }
      ],
      acc: [
        { name: '도톰한 캐시미어 머플러', desc: '체감온도를 즉각 3도 올려주는 목도리', icon: '🧣' },
        { name: '스마트폰 터치 장갑 & 핫팩', desc: '등하교 스마트폰 이용 시 손 시림 방지', icon: '🧤' },
        { name: '비니 / 귀도리', desc: '장시간 야외 이동 시 귀를 보호', icon: '🧢' }
      ]
    }
  },
  {
    range: [5, 8],
    level: 'cold',
    levelName: '초겨울/늦가을 (5℃ ~ 8℃)',
    summary: '울코트와 가죽자켓, 니트 조합이 가장 멋스럽게 어울리는 날씨',
    items: {
      outer: [
        { name: '오버핏 울 핸드메이드 코트', desc: '단정하고 분위기 있는 캠퍼스 룩의 정석', icon: '🧥' },
        { name: '경량 패딩 / 숏 다운 자켓', desc: '가볍지만 든든하게 체온을 지켜주는 아우터', icon: '🧥' },
        { name: '오버사이즈 가죽/레더 자켓', desc: '바람을 잘 막아주는 시크한 스트릿 감성', icon: '🧥' }
      ],
      top: [
        { name: '발열 이너 + 포근한 꽈배기 니트', desc: '강의실 실내에서도 답답하지 않은 두께', icon: '🧶' },
        { name: '셔츠 + 하프집업 니트 레이어드', desc: '지퍼를 열고 닫아 실내외 온도 조절 용이', icon: '👔' },
        { name: '두툼한 기모 맨투맨', desc: '단독으로 입어도 든든한 캠퍼스 원마일웨어', icon: '👕' }
      ],
      bottom: [
        { name: '세미 와이드 흑청/중청 데님', desc: '바람이 덜 통하는 짱짱한 원단의 청바지', icon: '👖' },
        { name: '도톰한 핀턱 울 슬랙스', desc: '단정하고 깔끔한 실루엣의 팬츠', icon: '👖' },
        { name: '코듀로이 스트레이트 팬츠', desc: '부드러운 촉감과 포근한 보온성', icon: '👖' }
      ],
      shoes: [
        { name: '첼시 부츠 / 워커', desc: '바람을 막아주고 코트와 찰떡궁합인 부츠', icon: '👞' },
        { name: '단단한 레더 스니커즈 (반스/에어포스)', desc: '찬 바람을 막아주는 탄탄한 스니커즈', icon: '👟' }
      ],
      acc: [
        { name: '울 머플러', desc: '아침 등교길 쌀쌀함을 커버하는 포인트 아이템', icon: '🧣' },
        { name: '레더 크로스백 or 튼튼한 캔버스 백팩', desc: '두꺼운 옷에도 편안한 착용감', icon: '🎒' }
      ]
    }
  },
  {
    range: [9, 11],
    level: 'chilly',
    levelName: '쌀쌀한 환절기 (9℃ ~ 11℃)',
    summary: '트렌치코트, 자켓, 야상이 빛을 발하는 캠퍼스 룩의 황금기',
    items: {
      outer: [
        { name: '클래식 트렌치코트', desc: '가을/봄 감성의 대학생 정석 아우터', icon: '🧥' },
        { name: '울 블레이저 자켓', desc: '포멀하면서도 단정한 남친/여친룩', icon: '🧥' },
        { name: 'M-65 필드 야상 자켓 / 무스탕 베스트', desc: '스타일리시하면서도 보온성 챙긴 아우터', icon: '🧥' }
      ],
      top: [
        { name: '베이직 라운드넥 울 니트', desc: '자켓 안에 단정하게 입기 좋은 두께감', icon: '👕' },
        { name: '옥스포드 셔츠 + 브이넥 니트 베스트', desc: '낮에 더우면 겉옷을 벗어도 완벽한 룩', icon: '👔' },
        { name: '적당한 두께의 후드티', desc: '캐주얼하고 활동성 높은 상의', icon: '👕' }
      ],
      bottom: [
        { name: '레귤러 스트레이트 진', desc: '사계절 무난하게 매치 가능한 데님', icon: '👖' },
        { name: '와이드 치노 팬츠 (베이지/카키)', desc: '트렌치코트 및 자켓과 잘 어울리는 조합', icon: '👖' },
        { name: '원턱 세미와이드 슬랙스', desc: '장시간 강의 착석에도 구김이 덜 가는 바지', icon: '👖' }
      ],
      shoes: [
        { name: '독일군 스니커즈 / 레트로 러닝화', desc: '오래 걸어도 발이 편한 캠퍼스 스테디셀러', icon: '👟' },
        { name: '로퍼 or 더비 슈즈', desc: '자켓이나 코트와 매치하기 좋은 깔끔한 신발', icon: '👞' }
      ],
      acc: [
        { name: '가벼운 캐시미어 쁘띠 머플러', desc: '아침/저녁에만 가볍게 둘렀다 가방에 쏙', icon: '🧣' },
        { name: '나일론 메신저백 or 백팩', desc: '노트북과 교재를 수납하기 좋은 실용적 가방', icon: '🎒' }
      ]
    }
  },
  {
    range: [12, 16],
    level: 'cool',
    levelName: '선선한 날씨 (12℃ ~ 16℃)',
    summary: '일교차가 큰 시기! 가디건, 자켓, 청자켓을 가볍게 걸치기 좋은 기온',
    items: {
      outer: [
        { name: '두툼한 오버핏 가디건', desc: '아침엔 입고, 낮엔 어깨에 두르거나 가방에 넣기 최적', icon: '🧥' },
        { name: '오버핏 청자켓 (데님 자켓)', desc: '청춘 느낌 물씬 나는 캐주얼 필수템', icon: '🧥' },
        { name: '나일론 바람막이 (윈드브레이커)', desc: '가볍고 바람을 막아주어 등하교길 최적', icon: '🧥' },
        { name: '캐주얼 싱글 자켓', desc: '셔츠나 티셔츠 위에 툭 걸치는 댄디 스타일', icon: '🧥' }
      ],
      top: [
        { name: '세미오버핏 맨투맨 (스웨트셔츠)', desc: '단품으로도 핏이 예쁜 대학생 필수템', icon: '👕' },
        { name: '루즈핏 롱슬리브 티셔츠', desc: '이너로 레이어드하기 좋은 부드러운 코튼', icon: '👕' },
        { name: '스트라이프 셔츠 or 체크 셔츠', desc: '단추를 풀거나 잠가 기온에 대응 가능', icon: '👔' }
      ],
      bottom: [
        { name: '와이드 연청/중청 데님 팬츠', desc: '트렌디한 실루엣의 데일리 청바지', icon: '👖' },
        { name: '블랙 와이드 슬랙스', desc: '어떤 아우터와도 잘 어울리는 기본 아이템', icon: '👖' },
        { name: '스웨트 팬츠 (조거)', desc: '편안함을 최우선으로 할 때 추천', icon: '👖' }
      ],
      shoes: [
        { name: '뉴발란스/나이키 레트로 스니커즈', desc: '캠퍼스 언덕길도 거뜬한 쿠셔닝 슈즈', icon: '👟' },
        { name: '컨버스 척 70 / 반스 올드스쿨', desc: '청자켓과 찰떡궁합인 클래식 스니커즈', icon: '👟' }
      ],
      acc: [
        { name: '캔버스 토트백 or 에코백', desc: '가벼운 겉옷을 벗어서 담아두기 좋은 넉넉한 가방', icon: '👜' },
        { name: '코튼 볼캡 (야구모자)', desc: '자연스러운 꾸안꾸 포인트를 주는 아이템', icon: '🧢' }
      ]
    }
  },
  {
    range: [17, 19],
    level: 'mild',
    levelName: '포근하고 쾌적 (17℃ ~ 19℃)',
    summary: '단품으로 입기 가장 이상적인 기온! 얇은 니트, 맨투맨 하나로 완성',
    items: {
      outer: [
        { name: '얇은 니트 가디건 (휴대용)', desc: '아침 등교길이나 에어컨 실내 대비용', icon: '🧥' },
        { name: '가벼운 셔츠 아우터', desc: '반팔 티 위에 단추 풀고 가볍게 덧입기', icon: '👔' },
        { name: '얇은 후드 집업', desc: '등하교길 간편하게 들고 다니기 좋은 아이템', icon: '🧥' }
      ],
      top: [
        { name: '원포인트 맨투맨 / 롱슬리브 티', desc: '한 장만으로도 센스 있는 실루엣', icon: '👕' },
        { name: '화사한 컬러의 코튼 니트', desc: '단정하면서도 생기 있는 인상을 주는 상의', icon: '👕' },
        { name: '루즈핏 옥스포드/린넨 혼방 셔츠', desc: '소매를 걷어올려 자연스럽게 연출', icon: '👔' }
      ],
      bottom: [
        { name: '세미 와이드 크림진 / 생지 데님', desc: '화사하고 세련된 하의 컬러링', icon: '👖' },
        { name: '얇은 코튼 카고 팬츠', desc: '트렌디한 수납 디테일과 편안한 핏', icon: '👖' },
        { name: '찰랑거리는 쿨 슬랙스', desc: '걸을 때마다 산뜻한 착용감', icon: '👖' }
      ],
      shoes: [
        { name: '클래식 화이트 스니커즈', desc: '어떤 코디에도 깔끔하게 녹아드는 신발', icon: '👟' },
        { name: '뮬 or 블로퍼', desc: '신고 벗기 편하고 스타일리시한 슈즈', icon: '👞' }
      ],
      acc: [
        { name: '미니멀 백팩 / 슬링백', desc: '소지품만 간편하게 챙기는 산뜻한 가방', icon: '🎒' },
        { name: '스마트워치 or 가죽 스트랩 시계', desc: '손목에 산뜻한 포인트', icon: '⌚' }
      ]
    }
  },
  {
    range: [20, 22],
    level: 'warm',
    levelName: '따뜻함 (20℃ ~ 22℃)',
    summary: '낮에는 반팔도 가능! 긴팔 티셔츠나 얇은 셔츠 단독 착용 추천',
    items: {
      outer: [
        { name: '초경량 윈드브레이커 (휴대용)', desc: '가방에 쏙 들어가는 초경량 아침용 외투', icon: '🧥' },
        { name: '린넨/시어서커 여름 셔츠', desc: '실내 냉방 대비용 걸치기 아이템', icon: '👔' }
      ],
      top: [
        { name: '단색 긴팔 티셔츠 (소매 롤업)', desc: '단정하고 호불호 없는 심플 룩', icon: '👕' },
        { name: '오버핏 반팔 티셔츠 (레이어드)', desc: '낮 기온 대비 반팔에 얇은 셔츠 레이어드', icon: '👕' },
        { name: '피케(카라) 폴로 반팔 셔츠', desc: '깔끔하고 단정한 프레피 캠퍼스 무드', icon: '👕' }
      ],
      bottom: [
        { name: '연청 스트레이트 진', desc: '청량감 넘치는 밝은 톤의 데님', icon: '👖' },
        { name: '얇은 원단의 와이드 슬랙스', desc: '통풍이 잘되어 낮에도 쾌적한 바지', icon: '👖' },
        { name: '무릎 길이 버뮤다 쇼츠', desc: '트렌디하고 시원한 반바지 연출', icon: '🩳' }
      ],
      shoes: [
        { name: '통기성 좋은 매쉬 러닝화', desc: '낮에도 발에 땀이 차지 않는 편안함', icon: '👟' },
        { name: '캔버스 단화 (스니커즈)', desc: '가볍고 발걸음이 경쾌한 신발', icon: '👟' }
      ],
      acc: [
        { name: '가벼운 나일론 에코백', desc: '어깨에 부담 없는 가벼운 데일리백', icon: '👜' },
        { name: '선크림 & 립밤', desc: '점심시간 야외 활동 시 자외선 차단 필수', icon: '🧴' }
      ]
    }
  },
  {
    range: [23, 27],
    level: 'hot',
    levelName: '더움 (23℃ ~ 27℃)',
    summary: '반팔과 반바지, 린넨 소재로 시원함을 최우선으로 해야 하는 날씨',
    items: {
      outer: [
        { name: '얇은 에어컨 대비용 거즈 셔츠', desc: '냉방이 강한 대형 강의실에서만 꺼내 입기', icon: '👔' }
      ],
      top: [
        { name: '쿨링 기능성 반팔 티셔츠', desc: '땀 흡수와 건조가 빠른 기능성 소재', icon: '👕' },
        { name: '오버핏 그래픽 반팔 티셔츠', desc: '시원하고 개성 있는 스트릿 캠퍼스룩', icon: '👕' },
        { name: '린넨 오픈카라 반팔 셔츠', desc: '바람이 솔솔 통하는 시원한 셔츠', icon: '👔' }
      ],
      bottom: [
        { name: '나일론 이지 쇼츠 (반바지)', desc: '가볍고 물에 젖어도 금방 마르는 반바지', icon: '🩳' },
        { name: '린넨 블렌드 와이드 팬츠', desc: '긴바지지만 린넨 소재라 시원하고 살 안 탐', icon: '👖' },
        { name: '얇은 라이트 데님 쇼츠 / 스커트', desc: '캐주얼하고 산뜻한 여름 스타일링', icon: '🩳' }
      ],
      shoes: [
        { name: '스포티 스트랩 샌들', desc: '발에 땀 차지 않고 쾌적한 등하교', icon: '👡' },
        { name: '초경량 플라이니트 스니커즈', desc: '통풍성이 극대화된 신발', icon: '👟' }
      ],
      acc: [
        { name: '자외선 차단 볼캡 / 버킷햇', desc: '낮 시간대 강한 햇빛 차단', icon: '🧢' },
        { name: '미니 텀블러 or 보냉백', desc: '시원한 얼음물을 챙겨 수분 보충', icon: '🧊' }
      ]
    }
  },
  {
    range: [28, 60],
    level: 'extreme_hot',
    levelName: '폭염주의 (28℃ 이상)',
    summary: '통기성과 땀 배출이 최고! 최대한 가볍고 시원한 최소 착장 필수',
    items: {
      outer: [
        { name: '극초경량 냉방병 방지 린넨 셔츠', desc: '강의실 에어컨 추위 방지용', icon: '👔' }
      ],
      top: [
        { name: '루즈핏 민소매 (슬리브리스) / 나시', desc: '어깨와 팔을 시원하게 드러낸 룩', icon: '🎽' },
        { name: '초경량 린넨 반팔 티셔츠', desc: '몸에 달라붙지 않는 통기성 최우선 티셔츠', icon: '👕' }
      ],
      bottom: [
        { name: '초경량 스윔/나일론 쇼츠', desc: '가장 시원하고 땀이 안 차는 쇼츠', icon: '🩳' },
        { name: '와이드 린넨 플리츠 팬츠', desc: '햇볕 차단과 통풍을 동시에 잡는 긴바지', icon: '👖' }
      ],
      shoes: [
        { name: '쿠셔닝 슬라이드 (쪼리/슬리퍼)', desc: '발가락이 시원한 최고 편안함', icon: '🩴' },
        { name: '피셔맨 샌들 / 스트랩 샌들', desc: '교수님 앞에서도 예의를 갖춘 시원한 신발', icon: '👡' }
      ],
      acc: [
        { name: '휴대용 손선풍기 (손풍기)', desc: '등하교 버스/지하철 기다릴 때 생존템', icon: '🌀' },
        { name: 'UV 차단 양우산', desc: '체감온도를 5도 이상 낮춰주는 필수 소지품', icon: '☂️' }
      ]
    }
  }
];

/**
 * Main recommendation generator
 * @param {Object} weatherForecast - Object returned by weatherService
 * @param {string} scheduleMode - 'mon_thu' | 'wed_fri' | 'custom'
 * @param {Object} options - { gender: 'unisex'|'male'|'female', sensitivity: -2|0|2, customDep: 9, customRet: 17 }
 */
export function generateOutfitRecommendation(weatherForecast, scheduleMode = 'mon_thu', options = {}) {
  const { gender = 'unisex', sensitivity = 0, customDep = 9, customRet = 17 } = options;

  const slots = weatherForecast.slots;
  const morning = slots.morning;
  const lunch = slots.lunch;
  const evening = slots.evening;

  // Determine schedule context
  let depHour = 9;
  let retHour = 17;
  let scheduleInfo = SCHEDULE_MODES.MON_THU;

  if (scheduleMode === 'wed_fri') {
    retHour = 12;
    scheduleInfo = SCHEDULE_MODES.WED_FRI;
  } else if (scheduleMode === 'custom') {
    depHour = customDep;
    retHour = customRet;
    scheduleInfo = {
      ...SCHEDULE_MODES.CUSTOM,
      departureHour: depHour,
      returnHour: retHour,
      description: `${depHour}:00 등교 ~ ${retHour}:00 하교 맞춤 분석입니다.`
    };
  }

  // Determine departure & return weather slots
  const depSlot = morning;
  const retSlot = (retHour <= 13) ? lunch : evening;

  // Temperatures with user sensitivity offset (+2 if feels cold easily, -2 if feels hot easily)
  const effectiveMorningTemp = morning.apparentTemp + sensitivity;
  const effectiveLunchTemp = lunch.apparentTemp + sensitivity;
  const effectiveEveningTemp = evening.apparentTemp + sensitivity;

  // Range of temperatures during campus hours
  const activeTemps = (retHour <= 13)
    ? [effectiveMorningTemp, effectiveLunchTemp]
    : [effectiveMorningTemp, effectiveLunchTemp, effectiveEveningTemp];

  const minCampusTemp = Math.min(...activeTemps);
  const maxCampusTemp = Math.max(...activeTemps);
  const diurnalSwing = maxCampusTemp - minCampusTemp; // Temperature difference during school hours

  // Base clothing bracket based on the coolest campus hour (usually morning or evening)
  // Layering advice will bridge the gap to maxCampusTemp!
  const baseBracket = findBracket(minCampusTemp);
  const maxBracket = findBracket(maxCampusTemp);

  // Analyze Rain/Precipitation during campus hours
  const activeRainProbs = (retHour <= 13)
    ? [morning.rainProb, lunch.rainProb]
    : [morning.rainProb, lunch.rainProb, evening.rainProb];
  const maxRainProb = Math.max(...activeRainProbs);
  const willRain = maxRainProb >= 40 || [morning.weatherInfo.type, lunch.weatherInfo.type, evening.weatherInfo.type].includes('rain');

  // Analyze Wind
  const maxWind = Math.max(morning.windSpeed, lunch.windSpeed, evening.windSpeed);
  const isWindy = maxWind >= 4.5;

  // Generate personalized headline and detailed story
  let headline = '';
  let rationale = '';
  const badges = [];

  // Diurnal Swing Badge & Advice
  if (diurnalSwing >= 9) {
    badges.push({ type: 'warning', text: `일교차 심함 (${diurnalSwing}℃ 차이)` });
  } else if (diurnalSwing >= 5) {
    badges.push({ type: 'info', text: `일교차 보통 (${diurnalSwing}℃ 차이)` });
  } else {
    badges.push({ type: 'good', text: `기온 일정 (${diurnalSwing}℃ 차이)` });
  }

  // Rain Badge
  if (willRain) {
    badges.push({ type: 'rain', text: `비 소식 (최고 ${maxRainProb}% / 우산 필수)` });
  }

  // Wind Badge
  if (isWindy) {
    badges.push({ type: 'wind', text: `바람 다소 강함 (${maxWind}m/s)` });
  }

  // Schedule Badge
  if (scheduleMode === 'mon_thu') {
    badges.push({ type: 'schedule', text: '월·목 종일 수업 모드' });
  } else if (scheduleMode === 'wed_fri') {
    badges.push({ type: 'schedule', text: '수·금 점심 하교 모드' });
  }

  // Craft Headline and Rationale
  if (scheduleMode === 'mon_thu') {
    if (diurnalSwing >= 8) {
      headline = '월·목 오후 풀타임 수업! 큰 일교차 대비 "겉옷 탈착형 레이어드 룩" 추천';
      rationale = `아침 9시 등교길(${morning.temp}℃)은 쌀쌀하고 낮(${lunch.temp}℃)엔 기온이 올랐다가, 17시 하교길(${evening.temp}℃)에 다시 찬바람이 붑니다. 강의실에서는 가볍게 벗고 하교 시 다시 챙겨 입을 수 있는 집업, 가디건, 자켓 레이어드가 최선입니다.`;
    } else {
      headline = '월·목 오후 하교까지 안정적인 하루! 단정한 캠퍼스 데일리룩';
      rationale = `아침부터 17시 하교까지 기온 편차가 크지 않아(${minCampusTemp}℃ ~ ${maxCampusTemp}℃), 한 벌의 편안하고 단정한 착장으로 쾌적하게 하루를 보낼 수 있습니다.`;
    }
  } else if (scheduleMode === 'wed_fri') {
    if (diurnalSwing >= 6) {
      headline = '수·금 점심 꿀하교! 아침만 가볍게 버티는 "이지 캐주얼 룩" 추천';
      rationale = `09:00 등교길(${morning.temp}℃) 찬 공기만 가벼운 외투로 커버하면, 12:00 하교 시점(${lunch.temp}℃)에는 기온이 최고조에 달합니다. 하교 후 가방에 가볍게 접어 넣거나 어깨에 걸치기 좋은 가디건/셔츠가 제격입니다!`;
    } else {
      headline = '수·금 빠른 점심 하교! 가볍고 산뜻한 반일 캠퍼스룩';
      rationale = `점심 12시에 수업이 끝나므로 저녁 추위를 걱정할 필요가 없습니다. 점심 날씨(${lunch.temp}℃)에 맞춘 편안한 이너 중심 착장을 권장합니다.`;
    }
  } else {
    headline = `${depHour}시 등교 ~ ${retHour}시 하교 맞춤 스마트 코디`;
    rationale = `등교(${depSlot.temp}℃)와 하교(${retSlot.temp}℃) 사이의 체감온도(${minCampusTemp}℃ ~ ${maxCampusTemp}℃)를 종합하여 가장 편안한 착장을 조합했습니다.`;
  }

  // Filter items based on rain / wind / diurnal swing
  const selectedOuter = [...baseBracket.items.outer];
  const selectedTop = [...baseBracket.items.top];
  const selectedBottom = [...baseBracket.items.bottom];
  const selectedShoes = [...baseBracket.items.shoes];
  const selectedAcc = [...baseBracket.items.acc];

  // If diurnal swing is large, inject top/outer recommendations from maxBracket or layer tips
  if (diurnalSwing >= 7) {
    selectedOuter.unshift({
      name: '입고 벗기 편한 이너+아우터 (가디건 / 집업 / 오버셔츠)',
      desc: `아침(${minCampusTemp}℃)과 낮(${maxCampusTemp}℃) 기온차(${diurnalSwing}℃)를 해결하는 레이어드 필수 아이템`,
      icon: '🧥'
    });
  }

  // If rain expected
  if (willRain) {
    selectedAcc.unshift({
      name: '휴대용 3단 우산 or 장우산',
      desc: `등하교 시간 중 비올 확률이 ${maxRainProb}%입니다. 가방에 꼭 챙기세요!`,
      icon: '☂️'
    });
    selectedShoes.unshift({
      name: '어두운 톤 방수 스니커즈 or 레인부츠',
      desc: '젖기 쉬운 밝은 캔버스화 대신 물이 덜 스며드는 가죽/방수 소재 추천',
      icon: '🥾'
    });
  }

  // If windy
  if (isWindy) {
    selectedOuter.unshift({
      name: '방풍 나일론 바람막이 (윈드브레이커)',
      desc: `최대 풍속 ${maxWind}m/s의 캠퍼스 칼바람을 막아주는 기능성 아우터`,
      icon: '💨'
    });
  }

  // Generate Slot-specific micro tips
  const slotTips = {
    morning: {
      time: '09:00 ~ 10:00 (등교길)',
      temp: `${morning.temp}℃ (체감 ${morning.apparentTemp}℃)`,
      weather: morning.weatherInfo.label,
      tip: (morning.temp <= 12)
        ? '찬 공기가 강한 시간대입니다. 목이나 손목 쪽으로 바람이 들지 않게 외투를 단단히 잠그고 출발하세요.'
        : '아침 공기가 상쾌하지만 그늘진 등교길은 서늘할 수 있으니 얇은 겉옷을 챙기세요.'
    },
    lunch: {
      time: '12:00 ~ 13:00 (점심 / 수·금 하교)',
      temp: `${lunch.temp}℃ (체감 ${lunch.apparentTemp}℃)`,
      weather: lunch.weatherInfo.label,
      tip: (scheduleMode === 'wed_fri')
        ? '🎉 꿀 같은 점심 하교 시간! 겉옷을 가볍게 벗어 팔에 걸치거나 에코백에 넣고 경쾌하게 귀가하세요.'
        : '햇볕이 가장 강해 실외는 포근하고 실내는 살짝 더울 수 있습니다. 외투 단추를 풀어 환기하세요.'
    },
    evening: {
      time: '16:00 ~ 17:00 (월·목 하교)',
      temp: `${evening.temp}℃ (체감 ${evening.apparentTemp}℃)`,
      weather: evening.weatherInfo.label,
      tip: (scheduleMode === 'mon_thu')
        ? '해가 기울면서 기온이 다시 떨어집니다. 낮 동안 벗어두었던 겉옷을 다시 챙겨 입고 하교하세요!'
        : '오후 늦은 시간 야외 활동 시 체감온도 하락에 주의하세요.'
    }
  };

  // Checklist for user's morning preparation
  const checklist = [
    { id: 'item_outer', text: `아우터 챙기기: ${selectedOuter[0].name}` },
    { id: 'item_top', text: `상의 착용: ${selectedTop[0].name}` },
    { id: 'item_bottom', text: `하의 착용: ${selectedBottom[0].name}` },
    { id: 'item_shoes', text: `신발 선택: ${selectedShoes[0].name}` }
  ];

  if (willRain) {
    checklist.push({ id: 'item_umbrella', text: `☔ 우산 챙기기 (강수확률 ${maxRainProb}%)` });
  }
  if (diurnalSwing >= 7) {
    checklist.push({ id: 'item_layer', text: `🧣 큰 일교차(${diurnalSwing}℃) 대비 레이어드 챙기기` });
  }

  return {
    headline,
    rationale,
    scheduleMode,
    scheduleInfo,
    badges,
    bracketInfo: baseBracket,
    diurnalSwing,
    minCampusTemp,
    maxCampusTemp,
    willRain,
    maxRainProb,
    isWindy,
    slotTips,
    recommendations: {
      outer: selectedOuter.slice(0, 3),
      top: selectedTop.slice(0, 3),
      bottom: selectedBottom.slice(0, 3),
      shoes: selectedShoes.slice(0, 2),
      acc: selectedAcc.slice(0, 3)
    },
    checklist
  };
}

/**
 * Find matching bracket from clothing database
 */
function findBracket(temp) {
  for (const bracket of CLOTHING_DATABASE) {
    if (temp >= bracket.range[0] && temp <= bracket.range[1]) {
      return bracket;
    }
  }
  return CLOTHING_DATABASE[3]; // default: cool 12-16
}
