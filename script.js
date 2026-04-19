// 移动端导航
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', function () {
    const expanded = mainNav.classList.toggle('show');
    navToggle.setAttribute('aria-expanded', expanded);
    navToggle.setAttribute('aria-label', expanded ? '关闭导航' : '打开导航');
  });
}

// 表单 _next 动态设置
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  let nextInput = contactForm.querySelector('input[name="_next"]');
  if (!nextInput) {
    nextInput = document.createElement('input');
    nextInput.type = 'hidden';
    nextInput.name = '_next';
    contactForm.appendChild(nextInput);
  }
  const currentUrl = window.location.href.split('?')[0];
  nextInput.value = currentUrl + '?success=true';
}

// 表单成功提示
window.addEventListener('load', function () {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      const msg = document.getElementById('formMsg');
      if (msg) {
        msg.textContent = '✓ 邮件已成功发送！谢谢你的信息，我会尽快回复。';
        msg.style.color = '#d1fae5';
      }
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  } catch (err) {
    console.error(err);
  }
});

// 动态更新时间
const lastUpdated = "2026年4月18日";
const footerSmall = document.querySelector('.site-footer small');
if (footerSmall) {
  const originalText = footerSmall.innerHTML;
  if (!originalText.includes('最后更新')) {
    footerSmall.innerHTML = originalText + ` | 最后更新：${lastUpdated}`;
  }
}

// 打字机效果
const typedTitle = document.getElementById('typed-title');
if (typedTitle) {
  const phrases = [
    "欢迎来到我的网站 🚀",
    "这里有小鱼干的项目 💻",
    "一起探索代码世界 ✨",
    "创意无限，持续更新 📝"
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let currentText = '';

  function typeEffect() {
    const fullText = phrases[phraseIndex];
    if (isDeleting) {
      currentText = fullText.substring(0, charIndex - 1);
      charIndex--;
    } else {
      currentText = fullText.substring(0, charIndex + 1);
      charIndex++;
    }
    typedTitle.textContent = currentText;

    if (!isDeleting && charIndex === fullText.length) {
      isDeleting = true;
      setTimeout(typeEffect, 1500);
      return;
    }
    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(typeEffect, 300);
      return;
    }
    const speed = isDeleting ? 30 : 50;
    setTimeout(typeEffect, speed);
  }
  typeEffect();
}

// ========== 深色/亮色模式切换 ==========
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme = prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', defaultTheme);
    themeToggle.textContent = defaultTheme === 'light' ? '🌙' : '☀️';
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
  });
}