document.addEventListener('DOMContentLoaded', () => {
  // ===== МАППИНГ СЕКТОРОВ → КАТЕГОРИЙ =====
  const sectorToCategory = {
    '1': 'scanners', '2': 'materials', '3': 'farms',
    '4': 'education', '5': 'postprocessing', '6': 'mat-equip',
    '7': 'consulting', '8': 'software', '9': 'printers'
  };

  const sectors = document.querySelectorAll('.sector-hex');
  const cards = document.querySelectorAll('.card');

  // ===== ПОДСВЕТКА КАРТОЧКИ =====
  function highlightCard(category, add) {
    cards.forEach(card => {
      if (card.dataset.category === category) {
        card.classList.toggle('highlighted', add);
      }
    });
  }

  // ===== ОБРАБОТЧИКИ ДЛЯ СЕКТОРОВ =====
  sectors.forEach(sector => {
    const sectorNum = sector.dataset.sector;
    const category = sectorToCategory[sectorNum];
    if (!category) return;

    // Десктоп: hover
    sector.addEventListener('mouseenter', () => {
      if (window.innerWidth >= 1450) highlightCard(category, true);
    });
    sector.addEventListener('mouseleave', () => {
      if (window.innerWidth >= 1450) highlightCard(category, false);
    });

    // Клик (универсальный): скролл к карточке
    sector.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetCard = document.querySelector(`.card[data-category="${category}"]`);
      if (targetCard) {
        const headerOffset = window.innerWidth < 1440 ? 20 : 80;
        const rect = targetCard.getBoundingClientRect();
        const y = rect.top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        
        // На мобильных: подсветить и скрыть кнопку, если видна
        if (window.innerWidth < 1440) {
          highlightCard(category, true);
          const btn = document.querySelector('.floating-hub-btn');
          if (btn) btn.classList.remove('visible');
        }
      }
    });
  });

  // ===== ПЛАВАЮЩАЯ КНОПКА: создаём всегда, показываем только на мобильных =====
  const btn = document.createElement('div');
  btn.className = 'floating-hub-btn';
btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 19V5m-7 7l7-7 7 7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
  document.body.appendChild(btn);

  // Клик по кнопке → возврат наверх
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    btn.classList.remove('visible');
  });

  // Функция обновления видимости кнопки
  function updateButtonVisibility(isHubVisible) {
    const isMobile = window.innerWidth < 1440;
    if (!isMobile) {
      btn.classList.remove('visible');
      return;
    }
    // На мобильных: показываем, если диаграмма НЕ видна
    if (isHubVisible) {
      btn.classList.remove('visible');
    } else {
      btn.classList.add('visible');
    }
  }

  // IntersectionObserver для отслеживания видимости диаграммы
  const centralHub = document.querySelector('.central-hub');
  if (centralHub) {
    const observer = new IntersectionObserver((entries) => {
      const isHubVisible = entries[0]?.isIntersecting ?? false;
      updateButtonVisibility(isHubVisible);
    }, { threshold: 0.15 });
    observer.observe(centralHub);
  }

  // Обработчик ресайза: пересчитываем видимость
  window.addEventListener('resize', () => {
    // Если перешли на десктоп — скрываем кнопку
    if (window.innerWidth >= 1440) {
      btn.classList.remove('visible');
      return;
    }
    // Если на мобильном — перепроверяем видимость диаграммы
    if (centralHub) {
      const rect = centralHub.getBoundingClientRect();
      const isHubVisible = rect.top < window.innerHeight && rect.bottom > 0;
      updateButtonVisibility(isHubVisible);
    }
  });

  // ===== СБРОС ПОДСВЕТКИ ПРИ КЛИКЕ ВНЕ СЕКТОРОВ =====
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.sector-hub') && !e.target.closest('.floating-hub-btn')) {
      document.querySelectorAll('.card.highlighted, .sector-hex.active')
        .forEach(el => el.classList.remove('highlighted', 'active'));
    }
  });
});

// ===== ЗАМЕНА БИТЫХ ИЗОБРАЖЕНИЙ =====
(function() {
  function replaceBrokenImages() {
    document.querySelectorAll('img.tag').forEach(img => {
      if (!img.src || img.src === window.location.href) handleMissing(img);
      else img.onerror = function() { handleMissing(this); };
    });
  }
  function handleMissing(img) {
    const span = document.createElement('span');
    span.className = 'fake-logo';
    span.textContent = img.alt || 'Логотип';
    img.parentNode.replaceChild(span, img);
  }
  document.readyState === 'loading' 
    ? document.addEventListener('DOMContentLoaded', replaceBrokenImages)
    : replaceBrokenImages();
})();