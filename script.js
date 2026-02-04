// 简单交互：移动端导航、表单提交
document.getElementById('navToggle').addEventListener('click', function(){
  document.getElementById('mainNav').classList.toggle('show');
});

document.getElementById('contactForm').addEventListener('submit', function(e){
  e.preventDefault();
  const form = e.currentTarget;
  const data = new FormData(form);
  // 这里演示：用 mailto 快速打开邮件客户端（也可以接入后端或服务）
  const name = data.get('name') || '匿名';
  const email = data.get('email') || '';
  const message = data.get('message') || '';
  const subject = encodeURIComponent(`来自网站的消息 - ${name}`);
  const body = encodeURIComponent(`姓名: ${name}\n邮箱: ${email}\n\n内容:\n${message}`);
  const mailto = `mailto:xuanming.yu@hotmail.com?subject=${subject}&body=${body}`;
  // 尝试打开邮件客户端
  window.location.href = mailto;
  const msg = document.getElementById('formMsg');
  msg.textContent = '已尝试打开邮件客户端，你也可以直接发邮件到xuanming.yu@hotmail.com ';
});