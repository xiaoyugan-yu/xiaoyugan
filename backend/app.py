import sqlite3
from datetime import datetime, timedelta, timezone
from functools import wraps

from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)  # 允许所有跨域请求（开发环境）

# JWT 配置
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
jwt = JWTManager(app)

# 数据库文件路径
DATABASE = 'database.db'

# ------------------- 数据库操作辅助函数 -------------------
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row  # 使返回结果像字典
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    """初始化数据库：创建用户表和评论表"""
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        # 用户表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        # 评论表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        ''')
        db.commit()

# 启动时初始化表
init_db()

# ------------------- API 路由 -------------------
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'msg': '用户名和密码不能为空'}), 400

    db = get_db()
    # 检查用户名是否已存在
    user = db.execute('SELECT id FROM users WHERE username = ?', (username,)).fetchone()
    if user:
        return jsonify({'msg': '用户名已存在'}), 409

    password_hash = generate_password_hash(password)
    db.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)',
               (username, password_hash))
    db.commit()
    return jsonify({'msg': '注册成功'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'msg': '用户名和密码不能为空'}), 400

    db = get_db()
    user = db.execute('SELECT id, password_hash FROM users WHERE username = ?', (username,)).fetchone()
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'msg': '用户名或密码错误'}), 401

    access_token = create_access_token(identity=str(user['id']), additional_claims={'username': username})
    return jsonify(access_token=access_token), 200

@app.route('/api/comments', methods=['GET'])
def get_comments():
    db = get_db()
    # 联表查询获取用户名和评论内容，按时间倒序
    rows = db.execute('''
        SELECT comments.id, users.username, comments.content, comments.created_at
        FROM comments
        JOIN users ON comments.user_id = users.id
        ORDER BY comments.created_at DESC
    ''').fetchall()
    comments = []
    for row in rows:
        comments.append({
            'id': row['id'],
            'username': row['username'],
            'content': row['content'],
            'created_at': row['created_at']
        })
    return jsonify(comments), 200

@app.route('/api/comments', methods=['POST'])
@jwt_required()
def add_comment():
    user_id = get_jwt_identity()
    data = request.get_json()
    content = data.get('content')
    if not content or len(content.strip()) == 0:
        return jsonify({'msg': '评论内容不能为空'}), 400

    db = get_db()
    db.execute('INSERT INTO comments (user_id, content) VALUES (?, ?)', (user_id, content))
    db.commit()
    # 返回新评论的详细信息（可选，方便前端更新）
    new_id = db.execute('SELECT last_insert_rowid()').fetchone()[0]
    row = db.execute('''
        SELECT comments.id, users.username, comments.content, comments.created_at
        FROM comments
        JOIN users ON comments.user_id = users.id
        WHERE comments.id = ?
    ''', (new_id,)).fetchone()
    return jsonify({
        'id': row['id'],
        'username': row['username'],
        'content': row['content'],
        'created_at': row['created_at']
    }), 201

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    user_id = get_jwt_identity()
    db = get_db()
    # 检查这条评论是否属于当前用户
    comment = db.execute('SELECT id FROM comments WHERE id = ? AND user_id = ?',
                         (comment_id, user_id)).fetchone()
    if not comment:
        return jsonify({'msg': '评论不存在或无权删除'}), 404
    db.execute('DELETE FROM comments WHERE id = ?', (comment_id,))
    db.commit()
    return jsonify({'msg': '删除成功'}), 200

# 可选：获取当前用户信息（测试用）
@app.route('/api/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    db = get_db()
    user = db.execute('SELECT id, username FROM users WHERE id = ?', (user_id,)).fetchone()
    if not user:
        return jsonify({'msg': '用户不存在'}), 404
    return jsonify({'id': user['id'], 'username': user['username']}), 200

# ------------------- 启动服务器 -------------------
if __name__ == '__main__':
    app.run(debug=True, port=5000)