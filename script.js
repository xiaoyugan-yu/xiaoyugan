// 移动端导航：更好的可访问性
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', function () {
    const expanded = mainNav.classList.toggle('show');
    navToggle.setAttribute('aria-expanded', expanded);
    navToggle.setAttribute('aria-label', expanded ? '关闭导航' : '打开导航');
  });
}

// 动态设置表单的 _next 参数，确保重定向地址正确（解决硬编码问题）
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

// 如果用户从 FormSubmit 重定向回来（?success=true），显示成功提示
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

// ========== 动态更新时间（手动维护） ==========
const lastUpdated = "2026年4月18日";  // 每次修改网站后记得更新这个日期
const footerSmall = document.querySelector('.site-footer small');
if (footerSmall) {
  const originalText = footerSmall.innerHTML;
  // 避免重复添加“最后更新”
  if (!originalText.includes('最后更新')) {
    footerSmall.innerHTML = originalText + ` | 最后更新：${lastUpdated}`;
  }
}