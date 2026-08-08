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

// ========== 深色/亮色模式切换（View Transition API，从按钮扩散） ==========
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

  themeToggle.addEventListener('click', async () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // 获取按钮的中心位置作为视图过渡的起点
    const rect = themeToggle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // 设置 CSS 自定义属性供过渡动画使用
    document.documentElement.style.setProperty('--transition-x', `${x}px`);
    document.documentElement.style.setProperty('--transition-y', `${y}px`);
    
    // 启动视图过渡
    if (document.startViewTransition) {
      await document.startViewTransition(() => {
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
      }).ready;
      
      // 自定义过渡动画：从按钮中心圆形扩散
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0% at ${x}px ${y}px)`,
            `circle(100% at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: 'ease-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    } else {
      // 降级：直接切换
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
    }
  });
}


  
  // ========== 评论系统（支持回复） ==========
const API_BASE = 'https://xiaoyugan.pythonanywhere.com';
let authToken = localStorage.getItem('access_token');
let currentUsername = '';

async function apiCall(endpoint, options = {}) {
  const url = API_BASE + endpoint;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (authToken && !endpoint.includes('/login') && !endpoint.includes('/register')) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401 && authToken) {
    localStorage.removeItem('access_token');
    authToken = null;
    window.location.reload();
  }
  return response;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

function showCommentStatus(msg, isError = false) {
  const div = document.getElementById('comment-status');
  if (div) {
    div.innerHTML = `<p style="color: ${isError ? '#f87171' : '#86efac'};">${msg}</p>`;
    setTimeout(() => { if (div.innerHTML === `<p style="color: ${isError ? '#f87171' : '#86efac'};">${msg}</p>`) div.innerHTML = ''; }, 3000);
  }
}

// ========== 渲染评论树 ==========
function renderComment(comment, depth = 0) {
  const indent = depth * 20;
  const isReply = depth > 0;
  
  return `
    <div class="comment-item" style="margin-left: ${indent}px; ${isReply ? 'border-left: 2px solid var(--accent); padding-left: 12px; margin-top: 8px;' : ''}">
      <div class="card" style="margin-bottom: 0.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong>${escapeHtml(comment.username)}</strong>
          <small style="color: var(--text-muted);">${new Date(comment.created_at).toLocaleString()}</small>
        </div>
        <p style="margin: 0.3rem 0;">${escapeHtml(comment.content)}</p>
        <div style="display: flex; gap: 0.5rem; margin-top: 0.3rem; align-items: center;">
          <button class="reply-btn btn" data-id="${comment.id}" style="padding: 0.1rem 0.5rem; font-size: 0.7rem; background: transparent; color: var(--accent); border: 1px solid var(--accent);">💬 回复</button>
          ${comment.username === currentUsername ? 
            `<button class="delete-comment-btn" data-id="${comment.id}" style="background: none; border: none; color: #f87171; cursor: pointer; font-size: 0.7rem;">删除</button>` : 
            ''}
          ${comment.replies && comment.replies.length > 0 ? 
            `<span style="color: var(--text-muted); font-size: 0.7rem;">${comment.replies.length} 条回复</span>` :
            ''}
        </div>
        <!-- 回复表单 -->
        <div id="reply-form-${comment.id}" style="display: none; margin-top: 0.5rem;">
          <textarea id="reply-input-${comment.id}" class="reply-input" rows="2" placeholder="写下你的回复..." style="width: 100%; padding: 0.4rem; border-radius: 6px; border: 1px solid var(--border); background: transparent; color: var(--text);"></textarea>
          <button class="submit-reply btn" data-id="${comment.id}" style="padding: 0.2rem 0.8rem; font-size: 0.8rem; margin-top: 0.3rem;">提交回复</button>
        </div>
      </div>
      ${comment.replies && comment.replies.length > 0 ? 
        comment.replies.map(r => renderComment(r, depth + 1)).join('') : 
        ''}
    </div>
  `;
}

async function loadComments() {
  try {
    const res = await apiCall('/api/comments');
    if (!res.ok) throw new Error();
    const comments = await res.json();
    const container = document.getElementById('comments-list');
    if (!container) return;
    
    if (comments.length === 0) {
      container.innerHTML = '<p>还没有评论，快来抢沙发～</p>';
      return;
    }
    
    container.innerHTML = comments.map(c => renderComment(c)).join('');
    
    // 绑定回复按钮事件
    document.querySelectorAll('.reply-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const commentId = this.dataset.id;
        const replyForm = document.getElementById(`reply-form-${commentId}`);
        if (replyForm) {
          const isHidden = replyForm.style.display === 'none';
          // 隐藏其他回复表单
          document.querySelectorAll('.reply-form').forEach(f => {
            if (f.id !== `reply-form-${commentId}`) {
              f.style.display = 'none';
            }
          });
          replyForm.style.display = isHidden ? 'block' : 'none';
          if (isHidden) {
            replyForm.querySelector('.reply-input').focus();
          }
        }
      });
    });
    
    // 绑定提交回复事件
    document.querySelectorAll('.submit-reply').forEach(btn => {
      btn.addEventListener('click', async function() {
        const commentId = this.dataset.id;
        const input = document.getElementById(`reply-input-${commentId}`);
        const content = input.value.trim();
        if (!content) return showCommentStatus('请输入回复内容', true);
        
        if (!authToken) {
          window.location.href = 'account.html';
          return;
        }
        
        const res = await apiCall('/api/comments', {
          method: 'POST',
          body: JSON.stringify({ content, parent_id: parseInt(commentId) })
        });
        
        if (res.ok) {
          input.value = '';
          document.getElementById(`reply-form-${commentId}`).style.display = 'none';
          showCommentStatus('回复成功！');
          loadComments();
        } else {
          const data = await res.json();
          showCommentStatus(data.msg || '回复失败', true);
        }
      });
    });
    
    // 绑定删除评论事件
    document.querySelectorAll('.delete-comment-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (!confirm('确定删除这条评论吗？')) return;
        const res = await apiCall(`/api/comments/${id}`, { method: 'DELETE' });
        if (res.ok) {
          showCommentStatus('删除成功');
          loadComments();
        } else {
          const data = await res.json();
          showCommentStatus(data.msg || '删除失败', true);
        }
      });
    });
    
  } catch (err) {
    console.error(err);
    showCommentStatus('无法加载评论，请检查后端服务是否启动', true);
  }
}

// ========== 登录状态检测 ==========
async function updateUIByAuth() {
  if (authToken) {
    try {
      const res = await apiCall('/api/me');
      if (res.ok) {
        const user = await res.json();
        currentUsername = user.username;
        const loggedinPanel = document.getElementById('loggedin-panel');
        if (loggedinPanel) {
          loggedinPanel.style.display = 'block';
          document.getElementById('current-username').innerText = currentUsername;
        }
        loadComments();
        return;
      } else {
        throw new Error();
      }
    } catch {
      localStorage.removeItem('access_token');
      authToken = null;
    }
  }
  
  const loggedinPanel = document.getElementById('loggedin-panel');
  if (loggedinPanel) loggedinPanel.style.display = 'none';
  
  const commentApp = document.getElementById('comment-app');
  if (commentApp && !document.getElementById('login-prompt')) {
    const promptDiv = document.createElement('div');
    promptDiv.id = 'login-prompt';
    promptDiv.innerHTML = `
      <div style="text-align: center; padding: 2rem; background: var(--card-bg); border-radius: 12px; margin-top: 1rem;">
        <p>📝 想要发表评论？请先登录</p>
        <a href="account.html" class="btn">去登录 / 注册</a>
      </div>
    `;
    commentApp.appendChild(promptDiv);
  }
  loadComments();
}

// ========== 发表评论 ==========
document.getElementById('submit-comment')?.addEventListener('click', async () => {
  if (!authToken) {
    window.location.href = 'account.html';
    return;
  }
  const content = document.getElementById('new-comment').value.trim();
  if (!content) return showCommentStatus('评论内容不能为空', true);
  const res = await apiCall('/api/comments', {
    method: 'POST',
    body: JSON.stringify({ content, parent_id: null })
  });
  if (res.ok) {
    document.getElementById('new-comment').value = '';
    showCommentStatus('评论发表成功');
    loadComments();
  } else {
    const data = await res.json();
    showCommentStatus(data.msg || '发表失败', true);
  }
});

// ========== 登出 ==========
document.getElementById('logout-btn')?.addEventListener('click', () => {
  localStorage.removeItem('access_token');
  authToken = null;
  showCommentStatus('已登出');
  updateUIByAuth();
});

// ========== 启动评论系统 ==========
if (document.getElementById('comment-app')) {
  updateUIByAuth();
}
