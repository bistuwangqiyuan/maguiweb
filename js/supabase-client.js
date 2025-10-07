/**
 * Supabase客户端模块
 * 负责与Supabase后端进行数据交互
 */

class SupabaseClient {
  constructor() {
    this.supabase = null;
    this.initialized = false;
  }

  /**
   * 初始化Supabase客户端
   */
  async init() {
    try {
      // 注意：需要在HTML中引入Supabase CDN
      if (typeof supabase === 'undefined') {
        throw new Error('Supabase library not loaded');
      }

      this.supabase = supabase.createClient(
        CONFIG.SUPABASE_URL,
        CONFIG.SUPABASE_ANON_KEY
      );

      this.initialized = true;
      console.log('✅ Supabase客户端初始化成功');
      return true;
    } catch (error) {
      console.error('❌ Supabase客户端初始化失败:', error);
      return false;
    }
  }

  /**
   * 检查客户端是否已初始化
   */
  checkInitialized() {
    if (!this.initialized) {
      throw new Error('Supabase client not initialized. Call init() first.');
    }
  }

  // ==================== 实验数据操作 ====================

  /**
   * 创建新实验
   * @param {Object} experimentData - 实验数据
   * @returns {Promise<Object>} 创建的实验记录
   */
  async createExperiment(experimentData) {
    this.checkInitialized();
    
    const { data, error } = await this.supabase
      .from('experiments')
      .insert(experimentData)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ 实验创建成功:', data.id);
    return data;
  }

  /**
   * 获取实验列表
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 实验列表
   */
  async getExperiments(options = {}) {
    this.checkInitialized();
    
    let query = this.supabase
      .from('experiments')
      .select('*')
      .order('created_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.testResult) {
      query = query.eq('test_result', options.testResult);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * 根据ID获取实验详情
   * @param {string} experimentId - 实验ID
   * @returns {Promise<Object>} 实验详情
   */
  async getExperimentById(experimentId) {
    this.checkInitialized();
    
    const { data, error } = await this.supabase
      .from('experiments')
      .select('*')
      .eq('id', experimentId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 更新实验数据
   * @param {string} experimentId - 实验ID
   * @param {Object} updates - 更新的数据
   * @returns {Promise<Object>} 更新后的实验记录
   */
  async updateExperiment(experimentId, updates) {
    this.checkInitialized();
    
    const { data, error } = await this.supabase
      .from('experiments')
      .update(updates)
      .eq('id', experimentId)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ 实验更新成功:', experimentId);
    return data;
  }

  // ==================== 信号数据操作 ====================

  /**
   * 批量保存信号数据
   * @param {Array} signalDataArray - 信号数据数组
   * @returns {Promise<Array>} 保存的信号数据
   */
  async saveSignalData(signalDataArray) {
    this.checkInitialized();
    
    const { data, error } = await this.supabase
      .from('signal_data')
      .insert(signalDataArray);

    if (error) throw error;
    console.log(`✅ 保存 ${signalDataArray.length} 条信号数据`);
    return data;
  }

  /**
   * 获取实验的信号数据
   * @param {string} experimentId - 实验ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 信号数据列表
   */
  async getSignalData(experimentId, options = {}) {
    this.checkInitialized();
    
    let query = this.supabase
      .from('signal_data')
      .select('*')
      .eq('experiment_id', experimentId)
      .order('timestamp', { ascending: true });

    if (options.channel) {
      query = query.eq('channel', options.channel);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // ==================== 缺陷数据操作 ====================

  /**
   * 创建缺陷记录
   * @param {Object} defectData - 缺陷数据
   * @returns {Promise<Object>} 创建的缺陷记录
   */
  async createDefect(defectData) {
    this.checkInitialized();
    
    const { data, error } = await this.supabase
      .from('defects')
      .insert(defectData)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ 缺陷记录创建成功:', data.id);
    return data;
  }

  /**
   * 获取实验的缺陷列表
   * @param {string} experimentId - 实验ID
   * @returns {Promise<Array>} 缺陷列表
   */
  async getDefects(experimentId) {
    this.checkInitialized();
    
    const { data, error } = await this.supabase
      .from('defects')
      .select('*')
      .eq('experiment_id', experimentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ==================== 配置管理 ====================

  /**
   * 保存参数配置
   * @param {Object} configData - 配置数据
   * @returns {Promise<Object>} 保存的配置
   */
  async saveConfiguration(configData) {
    this.checkInitialized();
    
    const { data, error } = await this.supabase
      .from('configurations')
      .insert(configData)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ 配置保存成功:', data.id);
    return data;
  }

  /**
   * 获取用户的配置列表
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>} 配置列表
   */
  async getConfigurations(userId) {
    this.checkInitialized();
    
    const { data, error } = await this.supabase
      .from('configurations')
      .select('*')
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ==================== 实时订阅 ====================

  /**
   * 订阅实验数据变化
   * @param {string} experimentId - 实验ID
   * @param {Function} callback - 回调函数
   * @returns {Object} 订阅对象
   */
  subscribeToExperiment(experimentId, callback) {
    this.checkInitialized();
    
    const subscription = this.supabase
      .channel(`experiment:${experimentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'experiments',
          filter: `id=eq.${experimentId}`
        },
        callback
      )
      .subscribe();

    console.log('✅ 订阅实验数据变化:', experimentId);
    return subscription;
  }

  /**
   * 取消订阅
   * @param {Object} subscription - 订阅对象
   */
  async unsubscribe(subscription) {
    if (subscription) {
      await this.supabase.removeChannel(subscription);
      console.log('✅ 取消订阅成功');
    }
  }

  // ==================== 文件操作 ====================

  /**
   * 上传文件到Supabase Storage
   * @param {File} file - 文件对象
   * @param {string} path - 存储路径
   * @returns {Promise<string>} 文件URL
   */
  async uploadFile(file, path) {
    this.checkInitialized();
    
    const { data, error } = await this.supabase.storage
      .from('experiments')
      .upload(path, file);

    if (error) throw error;

    const { data: urlData } = this.supabase.storage
      .from('experiments')
      .getPublicUrl(path);

    console.log('✅ 文件上传成功:', path);
    return urlData.publicUrl;
  }

  // ==================== 认证操作 ====================

  /**
   * 用户登录
   * @param {string} email - 邮箱
   * @param {string} password - 密码
   * @returns {Promise<Object>} 用户信息
   */
  async signIn(email, password) {
    this.checkInitialized();
    
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    console.log('✅ 登录成功');
    return data;
  }

  /**
   * 用户注册
   * @param {string} email - 邮箱
   * @param {string} password - 密码
   * @returns {Promise<Object>} 用户信息
   */
  async signUp(email, password) {
    this.checkInitialized();
    
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;
    console.log('✅ 注册成功');
    return data;
  }

  /**
   * 用户登出
   */
  async signOut() {
    this.checkInitialized();
    
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
    console.log('✅ 登出成功');
  }

  /**
   * 获取当前用户
   * @returns {Promise<Object>} 当前用户信息
   */
  async getCurrentUser() {
    this.checkInitialized();
    
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }
}

// 创建全局实例
const supabaseClient = new SupabaseClient();
