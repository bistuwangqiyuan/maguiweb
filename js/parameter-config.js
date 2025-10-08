/**
 * Parameter Configuration Module - 参数配置与预设管理
 * Task: T043-T048 - US5
 */

class ParameterConfig {
    constructor(supabaseClient) {
        this.client = supabaseClient;
        this.currentConfig = null;
        this.presets = [];
    }
    
    /**
     * 获取默认配置
     */
    getDefaultConfig() {
        return {
            // 磁化参数
            magnetization_current: 500, // mA
            magnetization_frequency: 50, // Hz
            magnetization_duration: 2.0, // s
            
            // 增益参数
            gain_channel1: 40, // dB (0-100)
            gain_channel2: 40, // dB
            
            // 门控参数
            gate_position: 0, // mm
            gate_width: 100, // mm
            gate_threshold: 80, // %
            
            // 滤波器参数
            filter_type: 'bandpass', // none, lowpass, highpass, bandpass
            filter_low_freq: 10, // Hz
            filter_high_freq: 500, // Hz
            
            // 采样参数
            sampling_rate: 1000, // Hz
            data_points: 500
        };
    }
    
    /**
     * 显示参数配置界面
     * Task: T044
     */
    showConfigUI() {
        const config = this.currentConfig || this.getDefaultConfig();
        
        const configHTML = `
            <div class="modal-overlay" id="config-modal">
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h3>参数配置</h3>
                        <button class="btn-close" onclick="closeConfigModal()">×</button>
                    </div>
                    <form id="config-form" onsubmit="applyConfig(event)">
                        <!-- 磁化参数 -->
                        <div class="config-section">
                            <h4>磁化参数</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>磁化电流 (mA)</label>
                                    <input type="number" name="magnetization_current" 
                                           value="${config.magnetization_current}" 
                                           min="0" max="2000" step="10" required>
                                    <small>范围: 0-2000 mA</small>
                                </div>
                                <div class="form-group">
                                    <label>磁化频率 (Hz)</label>
                                    <input type="number" name="magnetization_frequency" 
                                           value="${config.magnetization_frequency}" 
                                           min="0" max="1000" step="1" required>
                                    <small>范围: 0-1000 Hz</small>
                                </div>
                                <div class="form-group">
                                    <label>磁化时间 (s)</label>
                                    <input type="number" name="magnetization_duration" 
                                           value="${config.magnetization_duration}" 
                                           min="0.1" max="10" step="0.1" required>
                                    <small>范围: 0.1-10 s</small>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 增益参数 -->
                        <div class="config-section">
                            <h4>增益参数</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>通道1增益 (dB)</label>
                                    <input type="range" name="gain_channel1" 
                                           value="${config.gain_channel1}" 
                                           min="0" max="100" step="1"
                                           oninput="updateGainDisplay(this, 1)">
                                    <span id="gain-display-1">${config.gain_channel1} dB</span>
                                </div>
                                <div class="form-group">
                                    <label>通道2增益 (dB)</label>
                                    <input type="range" name="gain_channel2" 
                                           value="${config.gain_channel2}" 
                                           min="0" max="100" step="1"
                                           oninput="updateGainDisplay(this, 2)">
                                    <span id="gain-display-2">${config.gain_channel2} dB</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 门控参数 -->
                        <div class="config-section">
                            <h4>门控参数</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>门控位置 (mm)</label>
                                    <input type="number" name="gate_position" 
                                           value="${config.gate_position}" 
                                           min="0" max="1000" step="1">
                                </div>
                                <div class="form-group">
                                    <label>门控宽度 (mm)</label>
                                    <input type="number" name="gate_width" 
                                           value="${config.gate_width}" 
                                           min="1" max="1000" step="1">
                                </div>
                                <div class="form-group">
                                    <label>门控阈值 (%)</label>
                                    <input type="number" name="gate_threshold" 
                                           value="${config.gate_threshold}" 
                                           min="0" max="100" step="1">
                                </div>
                            </div>
                        </div>
                        
                        <!-- 滤波器参数 -->
                        <div class="config-section">
                            <h4>滤波器参数</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>滤波器类型</label>
                                    <select name="filter_type" onchange="updateFilterInputs(this.value)">
                                        <option value="none" ${config.filter_type === 'none' ? 'selected' : ''}>无滤波</option>
                                        <option value="lowpass" ${config.filter_type === 'lowpass' ? 'selected' : ''}>低通滤波</option>
                                        <option value="highpass" ${config.filter_type === 'highpass' ? 'selected' : ''}>高通滤波</option>
                                        <option value="bandpass" ${config.filter_type === 'bandpass' ? 'selected' : ''}>带通滤波</option>
                                    </select>
                                </div>
                                <div class="form-group" id="filter-low-group">
                                    <label>低频截止 (Hz)</label>
                                    <input type="number" name="filter_low_freq" 
                                           value="${config.filter_low_freq}" 
                                           min="1" max="5000" step="1">
                                </div>
                                <div class="form-group" id="filter-high-group">
                                    <label>高频截止 (Hz)</label>
                                    <input type="number" name="filter_high_freq" 
                                           value="${config.filter_high_freq}" 
                                           min="1" max="5000" step="1">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">应用配置</button>
                            <button type="button" class="btn-secondary" onclick="saveAsPreset()">另存为预设</button>
                            <button type="button" class="btn-secondary" onclick="loadPreset()">加载预设</button>
                            <button type="button" class="btn-secondary" onclick="resetToDefault()">恢复默认</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', configHTML);
    }
    
    /**
     * 验证参数范围
     * Task: T045
     */
    validateConfig(config) {
        const errors = [];
        
        // 磁化电流
        if (config.magnetization_current < 0 || config.magnetization_current > 2000) {
            errors.push('磁化电流应在0-2000mA之间');
        }
        
        // 磁化频率
        if (config.magnetization_frequency < 0 || config.magnetization_frequency > 1000) {
            errors.push('磁化频率应在0-1000Hz之间');
        }
        
        // 增益
        if (config.gain_channel1 < 0 || config.gain_channel1 > 100) {
            errors.push('通道1增益应在0-100dB之间');
        }
        if (config.gain_channel2 < 0 || config.gain_channel2 > 100) {
            errors.push('通道2增益应在0-100dB之间');
        }
        
        // 门控阈值
        if (config.gate_threshold < 0 || config.gate_threshold > 100) {
            errors.push('门控阈值应在0-100%之间');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    /**
     * 应用配置
     * Task: T045
     */
    async applyConfig(configData) {
        // 验证
        const validation = this.validateConfig(configData);
        if (!validation.isValid) {
            Utils.showNotification(validation.errors.join('; '), 'error');
            return false;
        }
        
        // 保存到内存
        this.currentConfig = configData;
        
        // 记录日志
        console.log('配置已应用:', configData);
        
        // 更新系统参数（这里可以实际应用到硬件或软件参数）
        if (window.AppState && window.AppState.signalChart) {
            window.AppState.signalChart.threshold = configData.gate_threshold;
        }
        
        Utils.showNotification('配置应用成功', 'success');
        return true;
    }
    
    /**
     * 保存为预设
     * Task: T046
     */
    async savePreset(name, config) {
        try {
            const presetData = {
                name: name,
                config: config,
                created_at: new Date().toISOString(),
                is_default: false
            };
            
            const { data, error } = await this.client.supabase
                .from('configurations')
                .insert([presetData])
                .select();
            
            if (error) throw error;
            
            this.presets.push(data[0]);
            Utils.showNotification(`预设"${name}"保存成功`, 'success');
            
            return data[0];
        } catch (error) {
            console.error('保存预设失败:', error);
            Utils.showNotification('保存预设失败', 'error');
            return null;
        }
    }
    
    /**
     * 加载预设列表
     * Task: T047
     */
    async loadPresets() {
        try {
            const { data, error } = await this.client.supabase
                .from('configurations')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            this.presets = data || [];
            return this.presets;
        } catch (error) {
            console.error('加载预设失败:', error);
            this.presets = [];
            return [];
        }
    }
    
    /**
     * 加载指定预设
     * Task: T047
     */
    async loadPreset(presetId) {
        try {
            const preset = this.presets.find(p => p.id === presetId);
            if (!preset) {
                throw new Error('预设不存在');
            }
            
            this.currentConfig = preset.config;
            await this.applyConfig(preset.config);
            
            Utils.showNotification(`预设"${preset.name}"已加载`, 'success');
            return preset;
        } catch (error) {
            console.error('加载预设失败:', error);
            Utils.showNotification('加载预设失败', 'error');
            return null;
        }
    }
    
    /**
     * 设置默认预设
     * Task: T048
     */
    async setDefaultPreset(presetId) {
        try {
            // 清除所有is_default标记
            await this.client.supabase
                .from('configurations')
                .update({ is_default: false })
                .neq('id', '00000000-0000-0000-0000-000000000000');
            
            // 设置指定预设为默认
            const { error } = await this.client.supabase
                .from('configurations')
                .update({ is_default: true })
                .eq('id', presetId);
            
            if (error) throw error;
            
            Utils.showNotification('默认预设已设置', 'success');
            return true;
        } catch (error) {
            console.error('设置默认预设失败:', error);
            Utils.showNotification('设置失败', 'error');
            return false;
        }
    }
    
    /**
     * 加载默认配置
     * Task: T048
     */
    async loadDefaultConfig() {
        try {
            const { data, error } = await this.client.supabase
                .from('configurations')
                .select('*')
                .eq('is_default', true)
                .single();
            
            if (error || !data) {
                // 使用系统默认配置
                this.currentConfig = this.getDefaultConfig();
                return this.currentConfig;
            }
            
            this.currentConfig = data.config;
            await this.applyConfig(data.config);
            
            return data;
        } catch (error) {
            console.error('加载默认配置失败:', error);
            this.currentConfig = this.getDefaultConfig();
            return this.currentConfig;
        }
    }
}

// 全局函数
window.closeConfigModal = function() {
    const modal = document.getElementById('config-modal');
    if (modal) modal.remove();
};

window.applyConfig = async function(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const config = {};
    formData.forEach((value, key) => {
        config[key] = isNaN(value) ? value : parseFloat(value);
    });
    
    if (window.AppState && window.AppState.parameterConfig) {
        const success = await window.AppState.parameterConfig.applyConfig(config);
        if (success) {
            closeConfigModal();
        }
    }
};

window.updateGainDisplay = function(input, channel) {
    const display = document.getElementById(`gain-display-${channel}`);
    if (display) {
        display.textContent = `${input.value} dB`;
    }
};

window.updateFilterInputs = function(filterType) {
    const lowGroup = document.getElementById('filter-low-group');
    const highGroup = document.getElementById('filter-high-group');
    
    if (filterType === 'none') {
        lowGroup.style.display = 'none';
        highGroup.style.display = 'none';
    } else if (filterType === 'lowpass') {
        lowGroup.style.display = 'none';
        highGroup.style.display = 'block';
    } else if (filterType === 'highpass') {
        lowGroup.style.display = 'block';
        highGroup.style.display = 'none';
    } else {
        lowGroup.style.display = 'block';
        highGroup.style.display = 'block';
    }
};

window.saveAsPreset = async function() {
    const name = prompt('请输入预设名称:');
    if (!name) return;
    
    const form = document.getElementById('config-form');
    const formData = new FormData(form);
    
    const config = {};
    formData.forEach((value, key) => {
        config[key] = isNaN(value) ? value : parseFloat(value);
    });
    
    if (window.AppState && window.AppState.parameterConfig) {
        await window.AppState.parameterConfig.savePreset(name, config);
    }
};

window.loadPreset = async function() {
    if (!window.AppState || !window.AppState.parameterConfig) return;
    
    const presets = await window.AppState.parameterConfig.loadPresets();
    if (presets.length === 0) {
        Utils.showNotification('暂无保存的预设', 'info');
        return;
    }
    
    // 显示预设选择对话框（简化版）
    const presetList = presets.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
    const choice = prompt(`选择预设（输入编号）:\n${presetList}`);
    
    if (choice) {
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < presets.length) {
            await window.AppState.parameterConfig.loadPreset(presets[index].id);
            closeConfigModal();
            window.AppState.parameterConfig.showConfigUI();
        }
    }
};

window.resetToDefault = function() {
    if (confirm('确定要恢复为默认配置吗？')) {
        closeConfigModal();
        if (window.AppState && window.AppState.parameterConfig) {
            window.AppState.parameterConfig.currentConfig = null;
            window.AppState.parameterConfig.showConfigUI();
        }
    }
};

// 导出
window.ParameterConfig = ParameterConfig;
