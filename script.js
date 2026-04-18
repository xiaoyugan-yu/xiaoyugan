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
  // 检查是否已经存在 _next 隐藏域，如果没有则创建
  let nextInput = contactForm.querySelector('input[name="_next"]');
  if (!nextInput) {
    nextInput = document.createElement('input');
    nextInput.type = 'hidden';
    nextInput.name = '_next';
    contactForm.appendChild(nextInput);
  }
  // 设置当前页面的完整 URL + success 参数
  const currentUrl = window.location.href.split('?')[0]; // 去掉已有的参数
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
      // 清除 URL 中的参数，避免刷新时重复显示
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  } catch (err) {
    console.error(err);
  }
});