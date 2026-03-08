// 简单交互：移动端导航
document.getElementById('navToggle').addEventListener('click', function(){
  document.getElementById('mainNav').classList.toggle('show');
});

// 显示成功消息（如果从 FormSubmit 重定向回来）
window.addEventListener('load', function(){
  const urlParams = new URLSearchParams(window.location.search);
  if(urlParams.get('success') === 'true'){
    const msg = document.getElementById('formMsg');
    if(msg){
      msg.textContent = '✓ 邮件已成功发送！谢谢你的消息，我会尽快回复。';
      msg.style.color = '#d1fae5';
      // 清除 URL 中的参数
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
});
