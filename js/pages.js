document.addEventListener('DOMContentLoaded', () => {
  const currentPage = document.body.dataset.page;
  const storageKey = 'aquacontrol-retos';

  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  if (currentPage === 'dashboard') {
    loadWeather();
  }

  if (currentPage === 'retos') {
    initializeChallenges(storageKey);
  }

  if (currentPage === 'guia') {
    initializeGuide();
  }

  if (currentPage === 'reporte') {
    initializeReportForm();
  }
});

async function loadWeather() {
  const weatherStatus = document.getElementById('weather-status');
  const weatherValue = document.getElementById('weather-value');
  const weatherDetails = document.getElementById('weather-details');

  if (!weatherStatus || !weatherValue || !weatherDetails) return;

  try {
    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=3.42&longitude=-76.52&current=temperature_2m,precipitation,weather_code&timezone=auto'
    );
    if (!response.ok) throw new Error('No se pudo consultar el clima.');

    const data = await response.json();
    const current = data.current;
    weatherValue.textContent = `${Math.round(current.temperature_2m)} °C`;
    weatherDetails.textContent = `Precipitación actual: ${current.precipitation} mm`;
    weatherStatus.textContent = 'Actualizado desde Open-Meteo';
    weatherStatus.className = 'status status-success';
  } catch (error) {
    weatherValue.textContent = 'Datos no disponibles';
    weatherDetails.textContent = 'Puedes consultar los indicadores locales mientras se restablece la conexión.';
    weatherStatus.textContent = 'Modo demostración';
    weatherStatus.className = 'status status-warning';
  }
}

function initializeChallenges(storageKey) {
  const completed = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const challengeCards = document.querySelectorAll('[data-challenge]');
  const points = document.getElementById('challenge-points');
  const progress = document.getElementById('challenge-progress');

  const updateChallenges = () => {
    const totalPoints = [...challengeCards].reduce((sum, card) => {
      return sum + (completed.includes(card.dataset.challenge) ? Number(card.dataset.points) : 0);
    }, 0);
    const percentage = Math.round((completed.length / challengeCards.length) * 100);
    points.textContent = `${totalPoints} pts`;
    progress.textContent = `${percentage}%`;
    challengeCards.forEach((card) => {
      const button = card.querySelector('button');
      const isComplete = completed.includes(card.dataset.challenge);
      card.classList.toggle('is-complete', isComplete);
      button.textContent = isComplete ? 'Completado ✓' : 'Completar reto';
      button.setAttribute('aria-pressed', String(isComplete));
    });
  };

  challengeCards.forEach((card) => {
    card.querySelector('button').addEventListener('click', () => {
      const challenge = card.dataset.challenge;
      const index = completed.indexOf(challenge);
      if (index === -1) completed.push(challenge);
      else completed.splice(index, 1);
      localStorage.setItem(storageKey, JSON.stringify(completed));
      updateChallenges();
    });
  });

  updateChallenges();
}

function initializeGuide() {
  const filterButtons = document.querySelectorAll('[data-filter]');
  const guideCards = document.querySelectorAll('[data-category]');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((item) => item.classList.remove('filter-active'));
      button.classList.add('filter-active');
      const selected = button.dataset.filter;
      guideCards.forEach((card) => {
        card.hidden = selected !== 'todos' && card.dataset.category !== selected;
      });
    });
  });
}

function initializeReportForm() {
  const form = document.getElementById('report-form');
  const confirmation = document.getElementById('report-confirmation');
  const reportList = document.getElementById('report-list');
  const reportKey = 'aquacontrol-reportes';

  const renderReports = () => {
    const reports = JSON.parse(localStorage.getItem(reportKey) || '[]');
    reportList.innerHTML = reports.length
      ? reports.map((report) => `<li><strong>${report.location}</strong><span>${report.type} · Recibido</span></li>`).join('')
      : '<li class="empty-state">Aún no hay reportes registrados en este dispositivo.</li>';
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const reports = JSON.parse(localStorage.getItem(reportKey) || '[]');
    reports.unshift({
      location: formData.get('location'),
      type: formData.get('type')
    });
    localStorage.setItem(reportKey, JSON.stringify(reports.slice(0, 5)));
    form.reset();
    confirmation.hidden = false;
    renderReports();
  });

  renderReports();
}
