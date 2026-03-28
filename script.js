// 简单交互：移动端导航
const navToggle = document.getElementById('navToggle');
if (navToggle) {
  navToggle.addEventListener('click', function () {
    const mainNav = document.getElementById('mainNav');
    if (mainNav) mainNav.classList.toggle('show');
  });
}

// 如果用户从 FormSubmit 重定向回来（_next 带 success=true），显示成功提示
window.addEventListener('load', function () {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      const msg = document.getElementById('formMsg');
      if (msg) {
        msg.textContent = '✓ 邮件已成功发送！谢谢你的��息，我会尽快回复。';
        msg.style.color = '#d1fae5';
      }
      // 清除 URL 中的参数，避免刷新时重复显示
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  } catch (err) {
    // 忽略 URL 处理错误
    console.error(err);
  }
});
