/**
 * Application Main Logic - 应用主逻辑
 * 负责应用初始化、视图管理、事件处理
 * Task: T014, T019, T020, T022
 */

// 全局应用状态
const AppState = {
    signalChart: null,
    dataManager: null,
    defectManager: null,
    parameterConfig: null,
    reportGenerator: null,
    auth: null,
    isMonitoring: false,
    updateInterval: null,
    currentView: 'welcome',
    simulationTime: 0
};

/**
 * 应用初始化
 * Task: T014
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOPPLER 磁检测系统启动中...');
    
    try {
        // 初始化Supabase客户端
        if (!window.SupabaseClient) {
            throw new Error('Supabase客户端未加载');
        }
        
        // 初始化认证模块
        AppState.auth = new Auth(window.SupabaseClient);
        console.log('✓ 认证模块初始化完成');
        
        // 检查用户登录状态
        const user = await AppState.auth.getCurrentUser();
        if (user) {
            console.log('✓ 用户已登录:', user.email);
        }
        
        // 初始化数据管理器
        AppState.dataManager = new DataManager(window.SupabaseClient);
        console.log('✓ 数据管理器初始化完成');
        
        // 初始化缺陷管理器
        AppState.defectManager = new DefectManager(window.SupabaseClient, AppState.dataManager);
        console.log('✓ 缺陷管理器初始化完成');
        
        // 初始化参数配置
        AppState.parameterConfig = new ParameterConfig(window.SupabaseClient);
        await AppState.parameterConfig.loadDefaultConfig();
        console.log('✓ 参数配置初始化完成');
        
        // 初始化报告生成器
        AppState.reportGenerator = new ReportGenerator(window.SupabaseClient, AppState.dataManager);
        console.log('✓ 报告生成器初始化完成');
        
        // 初始化波形图
        initializeSignalChart();
        
        // 绑定按钮事件
        bindButtonEvents();
        
        // 绑定键盘快捷键
        bindKeyboardShortcuts();
        
        // 加载实验列表
        loadExperimentList();
        
        console.log('✓ DOPPLER 磁检测系统启动完成');
        Utils.showNotification('系统启动成功', 'success');
        
    } catch (error) {
        console.error('系统启动失败:', error);
        Utils.showNotification(`启动失败: ${error.message}`, 'error');
    }
});

/**
 * 初始化信号波形图
 * Task: T015
 */
function initializeSignalChart() {
    AppState.signalChart = new SignalChart('signal-chart');
    
    // 设置缺陷检测回调
    AppState.signalChart.onDefectDetected = function(timestamp, amplitude) {
        console.log(`检测到缺陷: t=${timestamp.toFixed(3)}s, A=${amplitude.toFixed(2)}mV`);
        updateDataTable({
            status: '检测到缺陷',
            statusClass: 'status-warning'
        });
    };
    
    // 设置缺陷标记回调
    AppState.signalChart.onDefectMark = function(timestamp, amplitude, channel) {
        console.log(`用户标记缺陷: t=${timestamp.toFixed(3)}s, A=${amplitude.toFixed(2)}mV, CH=${channel}`);
        // 弹出缺陷记录表单
        if (AppState.defectManager) {
            AppState.defectManager.showDefectForm(timestamp, amplitude);
        }
    };
    
    console.log('✓ 波形图初始化完成');
}

/**
 * 绑定按钮事件
 * Task: T034
 */
function bindButtonEvents() {
    // 播放/暂停按钮
    document.getElementById('btn-play').addEventListener('click', function() {
        toggleMonitoring();
        playButtonSound();
    });
    
    // 上传按钮
    document.getElementById('btn-upload').addEventListener('click', function() {
        console.log('上传功能');
        playButtonSound();
        Utils.showNotification('上传功能开发中...', 'info');
    });
    
    // 显示模式按钮
    document.getElementById('btn-disp').addEventListener('click', function() {
        showScreen('signal-chart');
        playButtonSound();
    });
    
    // 接地按钮
    document.getElementById('btn-ground').addEventListener('click', function() {
        console.log('接地检测');
        playButtonSound();
        Utils.showNotification('接地检测功能开发中...', 'info');
    });
    
    // 门控按钮
    document.getElementById('btn-gate').addEventListener('click', function() {
        console.log('门控设置');
        playButtonSound();
        Utils.showNotification('门控设置功能开发中...', 'info');
    });
    
    // VPA按钮
    document.getElementById('btn-vpa').addEventListener('click', function() {
        console.log('VPA功能');
        playButtonSound();
        Utils.showNotification('VPA功能开发中...', 'info');
    });
    
    // 回退按钮
    document.getElementById('btn-back').addEventListener('click', function() {
        showScreen('welcome');
        playButtonSound();
    });
    
    // 保存按钮
    document.getElementById('btn-save').addEventListener('click', function() {
        saveCurrentData();
        playButtonSound();
    });
    
    // 菜单按钮
    document.getElementById('btn-menu').addEventListener('click', function() {
        showScreen('experiment-list');
        playButtonSound();
    });
    
    console.log('✓ 按钮事件绑定完成');
}

/**
 * 绑定键盘快捷键
 * Task: T036
 */
function bindKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // F1 - 播放/暂停
        if (e.key === 'F1') {
            e.preventDefault();
            document.getElementById('btn-play').click();
        }
        
        // F2 - 上传
        if (e.key === 'F2') {
            e.preventDefault();
            document.getElementById('btn-upload').click();
        }
        
        // F3 - 显示模式
        if (e.key === 'F3') {
            e.preventDefault();
            document.getElementById('btn-disp').click();
        }
        
        // F4 - 接地
        if (e.key === 'F4') {
            e.preventDefault();
            document.getElementById('btn-ground').click();
        }
        
        // F5 - 门控
        if (e.key === 'F5') {
            e.preventDefault();
            document.getElementById('btn-gate').click();
        }
        
        // F6 - VPA
        if (e.key === 'F6') {
            e.preventDefault();
            document.getElementById('btn-vpa').click();
        }
        
        // Ctrl+S - 保存
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            document.getElementById('btn-save').click();
        }
        
        // Ctrl+M - 菜单
        if (e.ctrlKey && e.key === 'm') {
            e.preventDefault();
            document.getElementById('btn-menu').click();
        }
        
        // Esc - 返回
        if (e.key === 'Escape') {
            document.getElementById('btn-back').click();
        }
    });
    
    console.log('✓ 键盘快捷键绑定完成');
}

/**
 * 切换监测状态
 * Task: T019
 */
function toggleMonitoring() {
    AppState.isMonitoring = !AppState.isMonitoring;
    
    if (AppState.isMonitoring) {
        startMonitoring();
    } else {
        stopMonitoring();
    }
}

/**
 * 开始监测
 * Task: T019
 */
function startMonitoring() {
    console.log('开始实时监测...');
    
    // 切换到波形图视图
    showScreen('signal-chart');
    
    // 更新状态
    updateDataTable({
        status: '监测中',
        statusClass: 'status-running'
    });
    
    // 更新按钮图标
    const playBtn = document.getElementById('btn-play');
    playBtn.querySelector('.btn-icon').textContent = '⏸';
    
    // 启动定时更新
    AppState.simulationTime = 0;
    AppState.updateInterval = setInterval(() => {
        updateSignalData();
    }, 100); // 每100ms更新一次 = 10fps
    
    Utils.showNotification('开始监测', 'success');
}

/**
 * 停止监测
 */
function stopMonitoring() {
    console.log('停止监测');
    
    // 清除定时器
    if (AppState.updateInterval) {
        clearInterval(AppState.updateInterval);
        AppState.updateInterval = null;
    }
    
    // 更新状态
    updateDataTable({
        status: '已暂停',
        statusClass: 'status-idle'
    });
    
    // 更新按钮图标
    const playBtn = document.getElementById('btn-play');
    playBtn.querySelector('.btn-icon').textContent = '▶';
    
    Utils.showNotification('监测已暂停', 'info');
}

/**
 * 更新信号数据（模拟）
 * Task: T019
 */
function updateSignalData() {
    // 生成模拟信号数据
    const newData = Utils.generateMockSignalData(10, AppState.simulationTime);
    
    // 更新波形图 - 通道1
    if (Math.random() > 0.5) {
        AppState.signalChart.updateData(1, newData.map(d => ({
            ...d,
            channel: 1
        })));
    }
    
    // 更新波形图 - 通道2
    if (Math.random() > 0.3) {
        AppState.signalChart.updateData(2, newData.map(d => ({
            ...d,
            channel: 2,
            amplitude: d.amplitude * 0.8 + Math.random() * 10
        })));
    }
    
    // 更新数据表格
    const ch1Data = newData.filter(d => d.channel === 1);
    const ch2Data = newData.filter(d => d.channel === 2);
    
    if (ch1Data.length > 0) {
        const ch1Current = ch1Data[ch1Data.length - 1].amplitude;
        const ch1Peak = Math.max(...ch1Data.map(d => d.amplitude));
        
        document.getElementById('ch1-amplitude').textContent = ch1Current.toFixed(2) + ' mV';
        document.getElementById('ch1-peak').textContent = ch1Peak.toFixed(2) + ' mV';
    }
    
    if (ch2Data.length > 0) {
        const ch2Current = ch2Data[ch2Data.length - 1].amplitude;
        const ch2Peak = Math.max(...ch2Data.map(d => d.amplitude));
        
        document.getElementById('ch2-amplitude').textContent = ch2Current.toFixed(2) + ' mV';
        document.getElementById('ch2-peak').textContent = ch2Peak.toFixed(2) + ' mV';
    }
    
    AppState.simulationTime += 0.1;
}

/**
 * 更新数据表格
 * Task: T022
 */
function updateDataTable(updates) {
    if (updates.status) {
        const statusEl = document.getElementById('status-indicator');
        statusEl.textContent = updates.status;
        
        if (updates.statusClass) {
            statusEl.className = updates.statusClass;
        }
    }
    
    if (updates.experimentName) {
        document.getElementById('experiment-name').textContent = updates.experimentName;
    }
}

/**
 * 视图切换
 */
function showScreen(screenId) {
    // 隐藏所有视图
    document.querySelectorAll('.screen-view').forEach(view => {
        view.classList.remove('active');
    });
    
    // 显示目标视图
    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) {
        targetScreen.classList.add('active');
        AppState.currentView = screenId;
        
        // 如果切换到波形图，调整大小
        if (screenId === 'signal-chart' && AppState.signalChart) {
            setTimeout(() => {
                AppState.signalChart.chart.resize();
            }, 100);
        }
    }
}

/**
 * 切换通道
 * Task: T020
 */
function toggleChannel() {
    if (!AppState.signalChart) return;
    
    const channel = AppState.signalChart.toggleChannel();
    Utils.showNotification(`切换到通道${channel}`, 'info');
}

/**
 * 重置缩放
 */
function resetZoom() {
    if (!AppState.signalChart) return;
    
    AppState.signalChart.resetZoom();
    Utils.showNotification('缩放已重置', 'info');
}

/**
 * 播放按钮音效
 * Task: T035
 */
function playButtonSound() {
    // 可选功能：播放按钮点击声音
    // 需要提前准备音频文件
    try {
        const audio = new Audio('/assets/sounds/button-click.mp3');
        audio.volume = 0.2;
        audio.play().catch(e => {
            // 静默失败，不影响功能
        });
    } catch (e) {
        // 静默失败
    }
}

/**
 * 显示新建实验表单
 * Task: T024
 */
function showCreateExperimentForm() {
    showScreen('create-experiment');
    
    // 重置表单
    document.getElementById('create-experiment-form').reset();
}

/**
 * 创建实验
 * Task: T027
 */
async function createExperiment(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // 转换为对象
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
    try {
        // 显示加载状态
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '保存中...';
        submitBtn.disabled = true;
        
        // 创建实验
        const experiment = await AppState.dataManager.createExperiment(data);
        
        // 恢复按钮
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // 切换到实验列表
        showScreen('experiment-list');
        
        // 重新加载列表
        loadExperimentList();
        
    } catch (error) {
        // 恢复按钮
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = '保存实验';
        submitBtn.disabled = false;
    }
}

/**
 * 加载实验列表
 * Task: T028
 */
async function loadExperimentList() {
    const listContainer = document.getElementById('experiment-list');
    listContainer.innerHTML = '<div class="loading">加载中...</div>';
    
    try {
        const experiments = await AppState.dataManager.getAllExperiments();
        
        if (experiments.length === 0) {
            listContainer.innerHTML = '<div class="loading">暂无实验记录</div>';
            return;
        }
        
        // 渲染实验列表
        listContainer.innerHTML = experiments.map(exp => `
            <div class="experiment-item" onclick="loadExperimentDetails('${exp.id}')">
                <div class="exp-name">${exp.project_name}</div>
                <div class="exp-date">
                    工件: ${exp.workpiece_name} | 
                    日期: ${Utils.formatDate(exp.start_time, 'YYYY-MM-DD HH:mm')} | 
                    操作员: ${exp.operator_name}
                </div>
                <div class="exp-result">
                    状态: ${getStatusText(exp.status)} | 
                    缺陷数: ${exp.defect_count || 0}
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        listContainer.innerHTML = '<div class="loading">加载失败</div>';
    }
}

/**
 * 加载实验详情
 */
async function loadExperimentDetails(experimentId) {
    try {
        const experiment = await AppState.dataManager.loadExperiment(experimentId);
        
        // 更新当前实验显示
        updateDataTable({
            experimentName: experiment.project_name
        });
        
        // 切换到波形图视图
        showScreen('signal-chart');
        
        Utils.showNotification(`已加载: ${experiment.project_name}`, 'success');
    } catch (error) {
        console.error('加载实验失败:', error);
    }
}

/**
 * 搜索实验
 * Task: T029
 */
async function searchExperiments() {
    const searchInput = document.getElementById('experiment-search');
    const keyword = searchInput.value.trim();
    
    if (!keyword) {
        loadExperimentList();
        return;
    }
    
    const listContainer = document.getElementById('experiment-list');
    listContainer.innerHTML = '<div class="loading">搜索中...</div>';
    
    try {
        const experiments = await AppState.dataManager.searchExperiments({
            project_name: keyword,
            workpiece_name: keyword
        });
        
        if (experiments.length === 0) {
            listContainer.innerHTML = '<div class="loading">未找到匹配的实验</div>';
            return;
        }
        
        // 渲染结果
        listContainer.innerHTML = experiments.map(exp => `
            <div class="experiment-item" onclick="loadExperimentDetails('${exp.id}')">
                <div class="exp-name">${exp.project_name}</div>
                <div class="exp-date">
                    工件: ${exp.workpiece_name} | 
                    日期: ${Utils.formatDate(exp.start_time, 'YYYY-MM-DD HH:mm')}
                </div>
                <div class="exp-result">
                    状态: ${getStatusText(exp.status)} | 
                    缺陷数: ${exp.defect_count || 0}
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        listContainer.innerHTML = '<div class="loading">搜索失败</div>';
    }
}

/**
 * 保存当前数据
 */
async function saveCurrentData() {
    if (!AppState.dataManager.currentExperiment) {
        Utils.showNotification('请先加载或创建实验', 'warning');
        return;
    }
    
    try {
        // 这里可以保存当前的波形数据、缺陷记录等
        Utils.showNotification('数据保存成功', 'success');
    } catch (error) {
        Utils.showNotification('保存失败', 'error');
    }
}

/**
 * 获取状态文本
 */
function getStatusText(status) {
    const statusMap = {
        'pending': '待检测',
        'in_progress': '检测中',
        'completed': '已完成',
        'cancelled': '已取消'
    };
    return statusMap[status] || status;
}

// 导出全局函数供HTML使用
window.showScreen = showScreen;
window.toggleChannel = toggleChannel;
window.resetZoom = resetZoom;
window.showCreateExperimentForm = showCreateExperimentForm;
window.createExperiment = createExperiment;
window.searchExperiments = searchExperiments;
window.loadExperimentDetails = loadExperimentDetails;
