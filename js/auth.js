/**
 * Authentication Module - 用户认证与权限管理
 * Task: T059-T063 - US8
 */

class Auth {
    constructor(supabaseClient) {
        this.client = supabaseClient;
        this.currentUser = null;
        this.userRole = null;
    }
    
    /**
     * 用户登录
     * Task: T059
     * @param {string} email - 邮箱
     * @param {string} password - 密码
     */
    async login(email, password) {
        try {
            const { data, error } = await this.client.supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            this.currentUser = data.user;
            
            // 加载用户角色信息
            await this.loadUserProfile(data.user.id);
            
            Utils.showNotification('登录成功！', 'success');
            return data.user;
            
        } catch (error) {
            console.error('登录失败:', error);
            Utils.showNotification(`登录失败: ${error.message}`, 'error');
            return null;
        }
    }
    
    /**
     * 用户注册
     * Task: T059
     * @param {Object} userData - 用户数据
     */
    async register(userData) {
        try {
            // 1. 创建Auth用户
            const { data: authData, error: authError } = await this.client.supabase.auth.signUp({
                email: userData.email,
                password: userData.password
            });
            
            if (authError) throw authError;
            
            // 2. 创建用户资料
            const { error: profileError } = await this.client.supabase
                .from('users')
                .insert([{
                    id: authData.user.id,
                    username: userData.username,
                    email: userData.email,
                    full_name: userData.full_name,
                    role: userData.role || 'operator',
                    department: userData.department,
                    phone: userData.phone,
                    certification: userData.certification,
                    certification_date: userData.certification_date
                }]);
            
            if (profileError) throw profileError;
            
            Utils.showNotification('注册成功！请检查邮箱验证链接。', 'success');
            return authData.user;
            
        } catch (error) {
            console.error('注册失败:', error);
            Utils.showNotification(`注册失败: ${error.message}`, 'error');
            return null;
        }
    }
    
    /**
     * 用户登出
     * Task: T059
     */
    async logout() {
        try {
            const { error } = await this.client.supabase.auth.signOut();
            
            if (error) throw error;
            
            this.currentUser = null;
            this.userRole = null;
            
            Utils.showNotification('已登出', 'info');
            
            // 刷新页面
            window.location.reload();
            
        } catch (error) {
            console.error('登出失败:', error);
            Utils.showNotification(`登出失败: ${error.message}`, 'error');
        }
    }
    
    /**
     * 获取当前用户
     * Task: T059
     */
    async getCurrentUser() {
        try {
            const { data: { user } } = await this.client.supabase.auth.getUser();
            
            if (user) {
                this.currentUser = user;
                await this.loadUserProfile(user.id);
            }
            
            return user;
            
        } catch (error) {
            console.error('获取用户信息失败:', error);
            return null;
        }
    }
    
    /**
     * 加载用户资料
     */
    async loadUserProfile(userId) {
        try {
            const { data, error } = await this.client.supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error) throw error;
            
            this.userRole = data.role;
            return data;
            
        } catch (error) {
            console.error('加载用户资料失败:', error);
            this.userRole = 'viewer'; // 默认最低权限
            return null;
        }
    }
    
    /**
     * 权限检查
     * Task: T061
     * @param {string} action - 操作类型 (create, read, update, delete)
     * @returns {boolean}
     */
    checkPermission(action) {
        const permissions = {
            admin: ['create', 'read', 'update', 'delete'],
            operator: ['create', 'read', 'update'],
            viewer: ['read']
        };
        
        const userPermissions = permissions[this.userRole] || [];
        return userPermissions.includes(action);
    }
    
    /**
     * 检查是否为管理员
     */
    isAdmin() {
        return this.userRole === 'admin';
    }
    
    /**
     * 获取所有用户（管理员功能）
     * Task: T062
     */
    async getAllUsers() {
        if (!this.isAdmin()) {
            Utils.showNotification('权限不足', 'error');
            return [];
        }
        
        try {
            const { data, error } = await this.client.supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            return data || [];
            
        } catch (error) {
            console.error('获取用户列表失败:', error);
            return [];
        }
    }
    
    /**
     * 更新用户角色（管理员功能）
     * Task: T062
     */
    async updateUserRole(userId, newRole) {
        if (!this.isAdmin()) {
            Utils.showNotification('权限不足', 'error');
            return false;
        }
        
        try {
            const { error } = await this.client.supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', userId);
            
            if (error) throw error;
            
            // 记录操作日志
            await this.logAction('update_user_role', 'user', userId, { new_role: newRole });
            
            Utils.showNotification('用户角色已更新', 'success');
            return true;
            
        } catch (error) {
            console.error('更新用户角色失败:', error);
            Utils.showNotification('更新失败', 'error');
            return false;
        }
    }
    
    /**
     * 启用/禁用用户账户（管理员功能）
     * Task: T062
     */
    async toggleUserStatus(userId, isActive) {
        if (!this.isAdmin()) {
            Utils.showNotification('权限不足', 'error');
            return false;
        }
        
        try {
            const { error } = await this.client.supabase
                .from('users')
                .update({ is_active: isActive })
                .eq('id', userId);
            
            if (error) throw error;
            
            // 记录操作日志
            await this.logAction(
                isActive ? 'enable_user' : 'disable_user',
                'user',
                userId
            );
            
            Utils.showNotification(
                isActive ? '用户已启用' : '用户已禁用',
                'success'
            );
            return true;
            
        } catch (error) {
            console.error('更新用户状态失败:', error);
            Utils.showNotification('更新失败', 'error');
            return false;
        }
    }
    
    /**
     * 记录操作日志
     * Task: T063
     */
    async logAction(action, resourceType, resourceId, metadata = {}) {
        try {
            const logData = {
                user_id: this.currentUser?.id,
                action: action,
                resource_type: resourceType,
                resource_id: resourceId,
                metadata: metadata,
                ip_address: await this.getClientIP(),
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString()
            };
            
            const { error } = await this.client.supabase
                .from('system_logs')
                .insert([logData]);
            
            if (error) {
                console.error('记录日志失败:', error);
            }
            
        } catch (error) {
            console.error('记录日志失败:', error);
        }
    }
    
    /**
     * 获取客户端IP地址（简化版）
     */
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }
    
    /**
     * 显示登录表单
     * Task: T060
     */
    showLoginForm() {
        const formHTML = `
            <div class="modal-overlay" id="login-modal">
                <div class="modal-content modal-small">
                    <div class="modal-header">
                        <h3>用户登录</h3>
                    </div>
                    <form id="login-form" onsubmit="handleLogin(event)">
                        <div class="form-group">
                            <label>邮箱</label>
                            <input type="email" name="email" required placeholder="your.email@example.com">
                        </div>
                        <div class="form-group">
                            <label>密码</label>
                            <input type="password" name="password" required placeholder="密码">
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">登录</button>
                            <button type="button" class="btn-secondary" onclick="showRegisterForm()">注册</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', formHTML);
    }
    
    /**
     * 显示注册表单
     * Task: T060
     */
    showRegisterForm() {
        // 关闭登录表单
        const loginModal = document.getElementById('login-modal');
        if (loginModal) loginModal.remove();
        
        const formHTML = `
            <div class="modal-overlay" id="register-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>用户注册</h3>
                        <button class="btn-close" onclick="closeRegisterForm()">×</button>
                    </div>
                    <form id="register-form" onsubmit="handleRegister(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label>用户名 <span class="required">*</span></label>
                                <input type="text" name="username" required placeholder="username">
                            </div>
                            <div class="form-group">
                                <label>姓名 <span class="required">*</span></label>
                                <input type="text" name="full_name" required placeholder="张三">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>邮箱 <span class="required">*</span></label>
                            <input type="email" name="email" required placeholder="your.email@example.com">
                        </div>
                        
                        <div class="form-group">
                            <label>密码 <span class="required">*</span></label>
                            <input type="password" name="password" required minlength="6" placeholder="至少6位">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>部门</label>
                                <input type="text" name="department" placeholder="质量控制部">
                            </div>
                            <div class="form-group">
                                <label>电话</label>
                                <input type="tel" name="phone" placeholder="13800138000">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>资质证书编号</label>
                                <input type="text" name="certification" placeholder="NDT-UT-001">
                            </div>
                            <div class="form-group">
                                <label>资质获取日期</label>
                                <input type="date" name="certification_date">
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">注册</button>
                            <button type="button" class="btn-secondary" onclick="closeRegisterForm()">取消</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', formHTML);
    }
}

// 全局函数
window.handleLogin = async function(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    if (window.AppState && window.AppState.auth) {
        const user = await window.AppState.auth.login(
            formData.get('email'),
            formData.get('password')
        );
        
        if (user) {
            const modal = document.getElementById('login-modal');
            if (modal) modal.remove();
            
            // 刷新界面
            window.location.reload();
        }
    }
};

window.handleRegister = async function(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const userData = {};
    formData.forEach((value, key) => {
        userData[key] = value;
    });
    
    if (window.AppState && window.AppState.auth) {
        const user = await window.AppState.auth.register(userData);
        
        if (user) {
            closeRegisterForm();
            Utils.showNotification('注册成功！请检查邮箱进行验证。', 'success');
        }
    }
};

window.showRegisterForm = function() {
    if (window.AppState && window.AppState.auth) {
        window.AppState.auth.showRegisterForm();
    }
};

window.closeRegisterForm = function() {
    const modal = document.getElementById('register-modal');
    if (modal) modal.remove();
};

// 导出
window.Auth = Auth;
