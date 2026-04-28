const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const todayView = document.getElementById("todayView");
const calendarView = document.getElementById("calendarView");
const todayTab = document.getElementById("todayTab");
const calendarTab = document.getElementById("calendarTab");

const monthTitle = document.getElementById("monthTitle");
const monthHint = document.getElementById("monthHint");
const calendarDays = document.getElementById("calendarDays");
const dayDetails = document.getElementById("dayDetails");

const softTheme = document.getElementById("softTheme");
const moonTheme = document.getElementById("moonTheme");
const moonShadow = document.getElementById("moonShadow");

softTheme.addEventListener("click", () => {
  document.body.classList.add("theme-cosmic");
  softTheme.classList.add("active");
  moonTheme.classList.remove("active");
});

moonTheme.addEventListener("click", () => {
  document.body.classList.remove("theme-cosmic");
  moonTheme.classList.add("active");
  softTheme.classList.remove("active");
});

todayTab.addEventListener("click", () => {
  todayTab.classList.add("active");
  calendarTab.classList.remove("active");
  todayView.classList.remove("hidden");
  calendarView.classList.add("hidden");
});

calendarTab.addEventListener("click", () => {
  calendarTab.classList.add("active");
  todayTab.classList.remove("active");

  calendarView.classList.remove("hidden");
  todayView.classList.add("hidden");

  renderCalendar();
});

function renderToday() {
  const today = new Date();
  const phase = moonPhase(today);
  const age = moonAge(today);
  const moonDay = Math.max(1, Math.min(30, Math.floor(age) + 1));
  const sign = moonSign(today);

  const readableDate = today.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short"
  });

  document.getElementById("todayDate").textContent = readableDate;
  document.getElementById("todayPhaseLabel").textContent = `${phase.emoji} ${phase.name}`;
  document.getElementById("mainTitle").textContent = `${moonDay} лунный день`;
  document.getElementById("mainSubtitle").textContent = `Луна в ${sign}`;
  document.getElementById("phaseName").textContent = phase.name;
  document.getElementById("phaseAdvice").textContent = phase.advice;
  document.getElementById("moonSign").textContent = sign;
  document.getElementById("dayAdvice").textContent = dayComment(today, phase);

  updateMoonVisual(age);

  const events = importantEvents[dateKey(today)] || [];
  document.getElementById("skyEvents").textContent = events.length
    ? events.join(". ")
    : "Сегодня без резких астрологических акцентов. Хорошо двигаться спокойно и без лишнего давления.";
}

const monthNames = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

let viewDate = new Date();
let selectedDateKey = null;

const importantEvents = {
  // MVP: сюда можно руками добавить важные периоды.
  // Позже заменим на API.
  "2026-02-26": ["☿ Меркурий ретроградный"],
  "2026-03-20": ["🌸 Равноденствие"],
  "2026-04-01": ["☿ Меркурий разворачивается"],
};

function updateMoonVisual(age) {
  const cycle = 29.53058867;
  const phase = age / cycle;

  // 0 = новолуние, 0.5 = полнолуние, 1 = новолуние
  // Двигаем тень по диску, чтобы визуально показывать фазу.
  let translate;

  if (phase <= 0.5) {
    // растущая: тень уходит влево, Луна открывается
    translate = -100 + phase * 200;
  } else {
    // убывающая: тень возвращается вправо
    translate = (phase - 0.5) * 200;
  }

  const shadow = document.getElementById("moonShadow");
  if (!shadow) return;

  shadow.style.transform = `translateX(${translate}%)`;

  if (phase > 0.48 && phase < 0.52) {
    shadow.style.opacity = "0";
  } else {
    shadow.style.opacity = "1";
  }
}

function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function moonAge(date) {
  // Approximation: known new moon near Jan 6, 2000.
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14));
  const current = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0));
  const diffDays = (current - knownNewMoon) / 86400000;
  const lunarCycle = 29.53058867;
  return ((diffDays % lunarCycle) + lunarCycle) % lunarCycle;
}

function moonPhase(date) {
  const age = moonAge(date);

  if (age < 1.2 || age > 28.3) {
    return {
      emoji: "🌑",
      name: "Новолуние",
      type: "new",
      advice: "День для тишины, настройки намерений и мягкого старта. Лучше не перегружать себя."
    };
  }

  if (age < 6.8) {
    return {
      emoji: "🌒",
      name: "Растущая Луна",
      type: "waxing",
      advice: "Хорошее время начинать, пробовать новое и постепенно добавлять энергию в планы."
    };
  }

  if (age < 8.8) {
    return {
      emoji: "🌓",
      name: "Первая четверть",
      type: "quarter",
      advice: "День действий и первых решений. Полезно не откладывать то, что уже созрело."
    };
  }

  if (age < 13.8) {
    return {
      emoji: "🌔",
      name: "Растущая Луна",
      type: "waxing",
      advice: "Период усиления. Хорошо развивать начатое, договариваться и проявляться заметнее."
    };
  }

  if (age < 16.2) {
    return {
      emoji: "🌕",
      name: "Полнолуние",
      type: "full",
      advice: "Эмоции и события могут быть ярче обычного. Хорошо видеть результат и не действовать на пике импульса."
    };
  }

  if (age < 21.8) {
    return {
      emoji: "🌖",
      name: "Убывающая Луна",
      type: "waning",
      advice: "Время завершать, анализировать и освобождать пространство от лишнего."
    };
  }

  if (age < 23.8) {
    return {
      emoji: "🌗",
      name: "Последняя четверть",
      type: "quarter",
      advice: "День пересмотра. Полезно честно увидеть, что работает, а что пора отпустить."
    };
  }

  return {
    emoji: "🌘",
    name: "Убывающая Луна",
    type: "waning",
    advice: "Подходит для спокойного завершения, отдыха, очищения планов и мягкого восстановления."
  };
}

function moonSign(date) {
  // MVP approximation: Moon moves through signs about every 2.3 days.
  const signs = [
    "Овне", "Тельце", "Близнецах", "Раке", "Льве", "Деве",
    "Весах", "Скорпионе", "Стрельце", "Козероге", "Водолее", "Рыбах"
  ];

  const base = new Date(Date.UTC(2026, 0, 1, 12, 0));
  const current = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0));
  const diffDays = Math.floor((current - base) / 86400000);
  const index = Math.floor(diffDays / 2.35) % 12;
  return signs[(index + 12) % 12];
}

function dayComment(date, phase) {
  const sign = moonSign(date);

  if (phase.type === "new") {
    return `Луна в ${sign}. День лучше использовать для настройки намерений, спокойного планирования и бережного старта.`;
  }

  if (phase.type === "full") {
    return `Луна в ${sign}. День может подсветить эмоции, желания и важные разговоры. Лучше не спешить с резкими решениями.`;
  }

  if (phase.type === "waxing") {
    return `Луна в ${sign}. Хороший день, чтобы развивать начатое, проявляться и делать шаги к росту.`;
  }

  if (phase.type === "waning") {
    return `Луна в ${sign}. Подходит для завершения, наведения порядка и спокойного пересмотра планов.`;
  }

  return `Луна в ${sign}. День помогает увидеть, где нужен выбор, корректировка или более честный взгляд на ситуацию.`;
}

function renderCalendar() {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  monthTitle.textContent = `${monthNames[month]} ${year}`;

  calendarDays.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  for (let i = 0; i < startOffset; i++) {
    const empty = document.createElement("button");
    empty.className = "day empty";
    calendarDays.appendChild(empty);
  }

  const todayKey = dateKey(new Date());

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const current = new Date(year, month, day);
    const key = dateKey(current);
    const phase = moonPhase(current);
    const events = importantEvents[key] || [];

    const btn = document.createElement("button");
    btn.className = "day";

    if (key === todayKey) btn.classList.add("today");
    if (key === selectedDateKey) btn.classList.add("selected");

    btn.innerHTML = `
      <span class="day-number">${day}</span>
      <span class="moon">${phase.emoji}</span>
      ${events.length ? '<span class="event-dot"></span>' : ''}
    `;

    btn.addEventListener("click", () => {
      selectedDateKey = key;
      renderCalendar();
      renderDetails(current);
    });

    calendarDays.appendChild(btn);
  }
}

function renderDetails(date) {
  const key = dateKey(date);
  const phase = moonPhase(date);
  const sign = moonSign(date);
  const events = importantEvents[key] || [];

  const readableDate = date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  dayDetails.innerHTML = `
    <h3>${phase.emoji} ${readableDate}</h3>

    <div class="info-grid">
      <div class="info-card">
        <strong>Фаза Луны</strong>
        <p>${phase.name}</p>
      </div>

      <div class="info-card">
        <strong>Луна в знаке</strong>
        <p>Луна в ${sign}</p>
      </div>

      <div class="info-card">
        <strong>Энергия дня</strong>
        <p>${dayComment(date, phase)}</p>
      </div>

      <div class="info-card">
        <strong>Совет</strong>
        <p>${phase.advice}</p>
      </div>
    </div>

    <div class="tag-list">
      ${events.length ? events.map(event => `<span class="tag">${event}</span>`).join("") : `<span class="tag">Спокойный день</span>`}
    </div>
  `;
}

document.getElementById("prevMonth").addEventListener("click", () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
  selectedDateKey = null;
  renderCalendar();
  dayDetails.innerHTML = `<p class="details-empty">Нажми на день в календаре, чтобы увидеть фазу Луны и подсказку.</p>`;
});

document.getElementById("nextMonth").addEventListener("click", () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  selectedDateKey = null;
  renderCalendar();
  dayDetails.innerHTML = `<p class="details-empty">Нажми на день в календаре, чтобы увидеть фазу Луны и подсказку.</p>`;
});

renderToday();
renderCalendar();