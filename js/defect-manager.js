/**
 * Defect Manager Module - 缺陷记录与分析模块
 * Task: T037-T042 - US4
 */

class DefectManager {
    constructor(supabaseClient, dataManager) {
        this.client = supabaseClient;
        this.dataManager = dataManager;
        this.defects = [];
        this.statisticsChart = null;
    }
    
    /**
     * 显示缺陷记录表单
     * Task: T037, T038
     * @param {number} timestamp - 时间戳
     * @param {number} amplitude - 幅值
     */
    showDefectForm(timestamp, amplitude) {
        const experiment = this.dataManager.getCurrentExperiment();
        if (!experiment) {
            Utils.showNotification('请先加载或创建实验', 'warning');
            return;
        }
        
        // 创建表单HTML
        const formHTML = `
            <div class="modal-overlay" id="defect-form-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>缺陷记录</h3>
                        <button class="btn-close" onclick="closeDefectForm()">×</button>
                    </div>
                    <form id="defect-form" onsubmit="submitDefectForm(event)">
                        <div class="form-group">
                            <label>缺陷类型 <span class="required">*</span></label>
                            <select name="defect_type" required>
                                <option value="">请选择</option>
                                <option value="裂纹">裂纹 (Crack)</option>
                                <option value="气孔">气孔 (Porosity)</option>
                                <option value="夹杂">夹杂 (Inclusion)</option>
                                <option value="未熔合">未熔合 (Lack of Fusion)</option>
                                <option value="未焊透">未焊透 (Incomplete Penetration)</option>
                                <option value="咬边">咬边 (Undercut)</option>
                                <option value="其他">其他 (Other)</option>
                            </select>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>位置 X (mm)</label>
                                <input type="number" name="position_x" step="0.1" value="${(timestamp * 100).toFixed(1)}" required>
                            </div>
                            <div class="form-group">
                                <label>位置 Y (mm)</label>
                                <input type="number" name="position_y" step="0.1" value="0" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>长度 (mm)</label>
                                <input type="number" name="length" step="0.1" min="0" placeholder="缺陷长度">
                            </div>
                            <div class="form-group">
                                <label>宽度 (mm)</label>
                                <input type="number" name="width" step="0.1" min="0" placeholder="缺陷宽度">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>严重程度 <span class="required">*</span></label>
                            <div class="severity-selector">
                                <label><input type="radio" name="severity" value="1" required> ⭐ 轻微</label>
                                <label><input type="radio" name="severity" value="2"> ⭐⭐ 一般</label>
                                <label><input type="radio" name="severity" value="3" checked> ⭐⭐⭐ 中等</label>
                                <label><input type="radio" name="severity" value="4"> ⭐⭐⭐⭐ 严重</label>
                                <label><input type="radio" name="severity" value="5"> ⭐⭐⭐⭐⭐ 危险</label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>描述</label>
                            <textarea name="description" rows="3" placeholder="详细描述缺陷特征..."></textarea>
                        </div>
                        
                        <input type="hidden" name="signal_amplitude" value="${amplitude.toFixed(2)}">
                        <input type="hidden" name="detection_time" value="${timestamp.toFixed(3)}">
                        
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">保存缺陷记录</button>
                            <button type="button" class="btn-secondary" onclick="closeDefectForm()">取消</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // 插入DOM
        document.body.insertAdjacentHTML('beforeend', formHTML);
    }
    
    /**
     * 提交缺陷表单
     * Task: T039
     */
    async submitDefectForm(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        // 转换为对象
        const data = {
            experiment_id: this.dataManager.currentExperiment.id,
            defect_type: formData.get('defect_type'),
            position_x: parseFloat(formData.get('position_x')),
            position_y: parseFloat(formData.get('position_y')),
            length: parseFloat(formData.get('length')) || null,
            width: parseFloat(formData.get('width')) || null,
            severity: parseInt(formData.get('severity')),
            description: formData.get('description'),
            signal_amplitude: parseFloat(formData.get('signal_amplitude')),
            detection_time: parseFloat(formData.get('detection_time'))
        };
        
        try {
            // 保存到数据库
            const defect = await this.dataManager.createDefect(data);
            
            // 添加到本地列表
            this.defects.push(defect);
            
            // 关闭表单
            closeDefectForm();
            
            // 刷新缺陷列表
            this.refreshDefectList();
            
            // 更新统计
            this.updateStatistics();
            
        } catch (error) {
            console.error('保存缺陷失败:', error);
        }
    }
    
    /**
     * 加载实验的所有缺陷
     * @param {string} experimentId - 实验ID
     */
    async loadDefects(experimentId) {
        try {
            const { data, error } = await this.client.supabase
                .from('defects')
                .select('*')
                .eq('experiment_id', experimentId)
                .order('detection_time', { ascending: true });
            
            if (error) throw error;
            
            this.defects = data || [];
            this.refreshDefectList();
            this.updateStatistics();
            
        } catch (error) {
            console.error('加载缺陷列表失败:', error);
            this.defects = [];
        }
    }
    
    /**
     * 刷新缺陷列表视图
     * Task: T040
     */
    refreshDefectList() {
        const listContainer = document.getElementById('defect-list');
        if (!listContainer) return;
        
        if (this.defects.length === 0) {
            listContainer.innerHTML = '<div class="empty-state">暂无缺陷记录</div>';
            return;
        }
        
        listContainer.innerHTML = this.defects.map((defect, index) => `
            <div class="defect-item" onclick="highlightDefect('${defect.id}')">
                <div class="defect-header">
                    <span class="defect-number">#${index + 1}</span>
                    <span class="defect-type">${defect.defect_type}</span>
                    <span class="defect-severity">${this.getSeverityStars(defect.severity)}</span>
                </div>
                <div class="defect-info">
                    位置: (${defect.position_x.toFixed(1)}, ${defect.position_y.toFixed(1)}) mm |
                    时间: ${defect.detection_time.toFixed(3)}s |
                    幅值: ${defect.signal_amplitude.toFixed(2)} mV
                </div>
                ${defect.description ? `<div class="defect-desc">${defect.description}</div>` : ''}
            </div>
        `).join('');
    }
    
    /**
     * 计算缺陷统计数据
     * Task: T041
     */
    calculateStatistics() {
        if (this.defects.length === 0) {
            return {
                total: 0,
                byType: {},
                bySeverity: {},
                density: 0,
                qualificationRate: 100
            };
        }
        
        // 按类型统计
        const byType = {};
        this.defects.forEach(d => {
            byType[d.defect_type] = (byType[d.defect_type] || 0) + 1;
        });
        
        // 按严重程度统计
        const bySeverity = {};
        this.defects.forEach(d => {
            bySeverity[d.severity] = (bySeverity[d.severity] || 0) + 1;
        });
        
        // 缺陷密度（假设检测长度为最大位置X）
        const maxX = Math.max(...this.defects.map(d => d.position_x));
        const density = maxX > 0 ? (this.defects.length / maxX * 1000).toFixed(2) : 0;
        
        // 合格率（严重程度4-5为不合格）
        const criticalDefects = this.defects.filter(d => d.severity >= 4).length;
        const qualificationRate = ((1 - criticalDefects / this.defects.length) * 100).toFixed(1);
        
        return {
            total: this.defects.length,
            byType,
            bySeverity,
            density,
            qualificationRate
        };
    }
    
    /**
     * 更新统计信息显示
     * Task: T041
     */
    updateStatistics() {
        const stats = this.calculateStatistics();
        
        // 更新统计数字
        const statsContainer = document.getElementById('defect-statistics');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-label">缺陷总数</div>
                    <div class="stat-value">${stats.total}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">缺陷密度</div>
                    <div class="stat-value">${stats.density} 个/米</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">合格率</div>
                    <div class="stat-value ${stats.qualificationRate >= 90 ? 'stat-good' : 'stat-bad'}">
                        ${stats.qualificationRate}%
                    </div>
                </div>
            `;
        }
        
        // 更新图表
        this.updateStatisticsCharts(stats);
    }
    
    /**
     * 更新统计图表
     * Task: T042
     */
    updateStatisticsCharts(stats) {
        // 饼图 - 缺陷类型分布
        const typeChartContainer = document.getElementById('defect-type-chart');
        if (typeChartContainer && stats.total > 0) {
            if (!this.typeChart) {
                this.typeChart = echarts.init(typeChartContainer, 'dark');
            }
            
            const typeData = Object.entries(stats.byType).map(([type, count]) => ({
                name: type,
                value: count
            }));
            
            this.typeChart.setOption({
                title: {
                    text: '缺陷类型分布',
                    left: 'center',
                    textStyle: { color: '#FF6B00' }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)'
                },
                series: [{
                    type: 'pie',
                    radius: '60%',
                    data: typeData,
                    label: {
                        color: '#E0E0E0'
                    }
                }]
            });
        }
        
        // 柱状图 - 严重程度分布
        const severityChartContainer = document.getElementById('defect-severity-chart');
        if (severityChartContainer && stats.total > 0) {
            if (!this.severityChart) {
                this.severityChart = echarts.init(severityChartContainer, 'dark');
            }
            
            const severityData = [1, 2, 3, 4, 5].map(level => stats.bySeverity[level] || 0);
            
            this.severityChart.setOption({
                title: {
                    text: '严重程度分布',
                    left: 'center',
                    textStyle: { color: '#FF6B00' }
                },
                tooltip: {
                    trigger: 'axis'
                },
                xAxis: {
                    type: 'category',
                    data: ['轻微', '一般', '中等', '严重', '危险'],
                    axisLabel: { color: '#999' }
                },
                yAxis: {
                    type: 'value',
                    axisLabel: { color: '#999' }
                },
                series: [{
                    type: 'bar',
                    data: severityData,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#FF6B00' },
                            { offset: 1, color: '#CC5500' }
                        ])
                    }
                }]
            });
        }
    }
    
    /**
     * 获取严重程度星级显示
     */
    getSeverityStars(severity) {
        const stars = '⭐'.repeat(severity);
        const colors = ['#999', '#FFD700', '#FFA500', '#FF6B00', '#FF3333'];
        return `<span style="color: ${colors[severity - 1]}">${stars}</span>`;
    }
    
    /**
     * 高亮显示波形图上的缺陷
     */
    highlightDefect(defectId) {
        const defect = this.defects.find(d => d.id === defectId);
        if (!defect) return;
        
        // 在波形图上高亮显示
        if (window.AppState && window.AppState.signalChart) {
            // 可以通过缩放到该位置来高亮
            Utils.showNotification(`缺陷位置: ${defect.detection_time.toFixed(3)}s`, 'info');
        }
    }
}

// 全局函数
window.closeDefectForm = function() {
    const modal = document.getElementById('defect-form-modal');
    if (modal) {
        modal.remove();
    }
};

window.submitDefectForm = async function(event) {
    if (window.AppState && window.AppState.defectManager) {
        await window.AppState.defectManager.submitDefectForm(event);
    }
};

window.highlightDefect = function(defectId) {
    if (window.AppState && window.AppState.defectManager) {
        window.AppState.defectManager.highlightDefect(defectId);
    }
};

// 导出
window.DefectManager = DefectManager;
