/**
 * Data Manager Module - 实验数据管理模块
 * 负责实验的CRUD操作和数据验证
 * Task: T023 - US2
 */

class DataManager {
    constructor(supabaseClient) {
        this.client = supabaseClient;
        this.currentExperiment = null;
        this.currentUser = null;
    }
    
    /**
     * 创建新实验
     * Task: T027
     * @param {Object} data - 实验数据
     * @returns {Promise<Object>} 创建的实验对象
     */
    async createExperiment(data) {
        try {
            // 验证数据
            const validation = this.validateExperimentData(data);
            if (!validation.isValid) {
                throw new Error(validation.errors.join('; '));
            }
            
            // 添加默认值
            const experimentData = {
                ...data,
                status: 'pending',
                start_time: new Date().toISOString(),
                defect_count: 0,
                is_qualified: null,
                created_by: this.currentUser?.id || null
            };
            
            // 插入数据库
            const result = await this.client.createExperiment(experimentData);
            
            if (result.error) {
                throw new Error(result.error.message);
            }
            
            this.currentExperiment = result.data;
            Utils.showNotification('实验创建成功！', 'success');
            
            return result.data;
        } catch (error) {
            console.error('创建实验失败:', error);
            Utils.showNotification(`创建失败: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * 验证实验数据
     * Task: T026
     * @param {Object} data - 待验证的数据
     * @returns {Object} {isValid: boolean, errors: string[]}
     */
    validateExperimentData(data) {
        const errors = [];
        
        // 必填字段验证
        if (!data.project_name || data.project_name.trim() === '') {
            errors.push('项目名称不能为空');
        }
        
        if (!data.workpiece_name || data.workpiece_name.trim() === '') {
            errors.push('工件名称不能为空');
        }
        
        if (!data.operator_name || data.operator_name.trim() === '') {
            errors.push('操作员姓名不能为空');
        }
        
        if (!data.magnetization_method) {
            errors.push('必须选择磁化方式');
        }
        
        // 数值范围验证
        if (data.magnetization_current) {
            const current = parseFloat(data.magnetization_current);
            if (isNaN(current) || current < 0 || current > 2000) {
                errors.push('磁化电流应在0-2000mA之间');
            }
        }
        
        if (data.magnetization_frequency) {
            const frequency = parseFloat(data.magnetization_frequency);
            if (isNaN(frequency) || frequency < 0 || frequency > 1000) {
                errors.push('磁化频率应在0-1000Hz之间');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    /**
     * 加载实验
     * Task: T028
     * @param {string} experimentId - 实验ID
     * @returns {Promise<Object>} 实验对象
     */
    async loadExperiment(experimentId) {
        try {
            const result = await this.client.getExperiment(experimentId);
            
            if (result.error) {
                throw new Error(result.error.message);
            }
            
            this.currentExperiment = result.data;
            return result.data;
        } catch (error) {
            console.error('加载实验失败:', error);
            Utils.showNotification(`加载失败: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * 搜索实验
     * Task: T029
     * @param {Object} criteria - 搜索条件
     * @returns {Promise<Array>} 实验列表
     */
    async searchExperiments(criteria) {
        try {
            let query = this.client.supabase
                .from('experiments')
                .select('*');
            
            // 按项目名称搜索
            if (criteria.project_name) {
                query = query.ilike('project_name', `%${criteria.project_name}%`);
            }
            
            // 按工件名称搜索
            if (criteria.workpiece_name) {
                query = query.ilike('workpiece_name', `%${criteria.workpiece_name}%`);
            }
            
            // 按日期范围搜索
            if (criteria.start_date) {
                query = query.gte('start_time', criteria.start_date);
            }
            
            if (criteria.end_date) {
                query = query.lte('start_time', criteria.end_date);
            }
            
            // 按状态搜索
            if (criteria.status) {
                query = query.eq('status', criteria.status);
            }
            
            // 排序
            query = query.order('start_time', { ascending: false });
            
            // 限制数量
            if (criteria.limit) {
                query = query.limit(criteria.limit);
            }
            
            const { data, error } = await query;
            
            if (error) {
                throw new Error(error.message);
            }
            
            return data || [];
        } catch (error) {
            console.error('搜索实验失败:', error);
            Utils.showNotification(`搜索失败: ${error.message}`, 'error');
            return [];
        }
    }
    
    /**
     * 获取所有实验
     * @returns {Promise<Array>} 实验列表
     */
    async getAllExperiments() {
        try {
            const { data, error } = await this.client.supabase
                .from('experiments')
                .select('*')
                .order('start_time', { ascending: false });
            
            if (error) {
                throw new Error(error.message);
            }
            
            return data || [];
        } catch (error) {
            console.error('获取实验列表失败:', error);
            return [];
        }
    }
    
    /**
     * 更新实验
     * @param {string} experimentId - 实验ID
     * @param {Object} updates - 更新的字段
     * @returns {Promise<Object>} 更新后的实验对象
     */
    async updateExperiment(experimentId, updates) {
        try {
            const result = await this.client.updateExperiment(experimentId, updates);
            
            if (result.error) {
                throw new Error(result.error.message);
            }
            
            if (this.currentExperiment && this.currentExperiment.id === experimentId) {
                this.currentExperiment = { ...this.currentExperiment, ...updates };
            }
            
            Utils.showNotification('实验更新成功', 'success');
            return result.data;
        } catch (error) {
            console.error('更新实验失败:', error);
            Utils.showNotification(`更新失败: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * 删除实验
     * @param {string} experimentId - 实验ID
     * @returns {Promise<boolean>} 是否成功
     */
    async deleteExperiment(experimentId) {
        try {
            if (!confirm('确定要删除此实验吗？此操作不可恢复。')) {
                return false;
            }
            
            const { error } = await this.client.supabase
                .from('experiments')
                .delete()
                .eq('id', experimentId);
            
            if (error) {
                throw new Error(error.message);
            }
            
            if (this.currentExperiment && this.currentExperiment.id === experimentId) {
                this.currentExperiment = null;
            }
            
            Utils.showNotification('实验删除成功', 'success');
            return true;
        } catch (error) {
            console.error('删除实验失败:', error);
            Utils.showNotification(`删除失败: ${error.message}`, 'error');
            return false;
        }
    }
    
    /**
     * 保存信号数据
     * @param {string} experimentId - 实验ID
     * @param {Array} signalData - 信号数据
     * @returns {Promise<boolean>} 是否成功
     */
    async saveSignalData(experimentId, signalData) {
        try {
            const dataToSave = signalData.map(point => ({
                experiment_id: experimentId,
                timestamp: point.timestamp,
                channel: point.channel,
                amplitude: point.amplitude,
                frequency: point.frequency || null
            }));
            
            const { error } = await this.client.supabase
                .from('signal_data')
                .insert(dataToSave);
            
            if (error) {
                throw new Error(error.message);
            }
            
            return true;
        } catch (error) {
            console.error('保存信号数据失败:', error);
            return false;
        }
    }
    
    /**
     * 创建缺陷记录
     * @param {Object} defectData - 缺陷数据
     * @returns {Promise<Object>} 创建的缺陷对象
     */
    async createDefect(defectData) {
        try {
            const result = await this.client.createDefect(defectData);
            
            if (result.error) {
                throw new Error(result.error.message);
            }
            
            // 更新实验的缺陷计数
            if (this.currentExperiment) {
                const newCount = (this.currentExperiment.defect_count || 0) + 1;
                await this.updateExperiment(this.currentExperiment.id, {
                    defect_count: newCount
                });
            }
            
            Utils.showNotification('缺陷记录已保存', 'success');
            return result.data;
        } catch (error) {
            console.error('创建缺陷记录失败:', error);
            Utils.showNotification(`保存失败: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * 导出信号数据为CSV
     * Task: T064 - US9
     * @param {string} experimentId - 实验ID
     * @returns {Promise<void>}
     */
    async exportSignalDataToCSV(experimentId) {
        try {
            const { data, error } = await this.client.supabase
                .from('signal_data')
                .select('*')
                .eq('experiment_id', experimentId)
                .order('timestamp', { ascending: true });
            
            if (error) {
                throw new Error(error.message);
            }
            
            if (!data || data.length === 0) {
                Utils.showNotification('没有数据可导出', 'warning');
                return;
            }
            
            // 生成CSV
            const headers = ['timestamp', 'channel', 'amplitude', 'frequency'];
            const csv = [
                headers.join(','),
                ...data.map(row => headers.map(h => row[h] || '').join(','))
            ].join('\n');
            
            // 下载
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            Utils.downloadFile(blob, `signal-data-${experimentId}.csv`);
            
            Utils.showNotification('CSV导出成功', 'success');
        } catch (error) {
            console.error('导出CSV失败:', error);
            Utils.showNotification(`导出失败: ${error.message}`, 'error');
        }
    }
    
    /**
     * 设置当前用户
     * @param {Object} user - 用户对象
     */
    setCurrentUser(user) {
        this.currentUser = user;
    }
    
    /**
     * 获取当前实验
     * @returns {Object|null} 当前实验对象
     */
    getCurrentExperiment() {
        return this.currentExperiment;
    }
}

// 导出
window.DataManager = DataManager;
