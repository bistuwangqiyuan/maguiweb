-- ============================================================================
-- 磁检测仪器软件 - Supabase数据库Schema
-- ============================================================================
-- 版本: 1.0
-- 创建日期: 2025-10-07
-- 符合标准: ISO 9934-1:2016
-- ============================================================================

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. 用户表 (users)
-- ============================================================================
-- 说明: 存储系统用户信息，继承Supabase Auth的用户表
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer')),
    certification VARCHAR(100), -- 资质证书编号
    certification_date DATE, -- 资质获取日期
    phone VARCHAR(20),
    department VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户表注释
COMMENT ON TABLE public.users IS '系统用户表';
COMMENT ON COLUMN public.users.role IS '用户角色：admin-管理员, operator-操作员, viewer-查看者';
COMMENT ON COLUMN public.users.certification IS 'NDT资质证书编号';

-- ============================================================================
-- 2. 实验项目表 (experiments)
-- ============================================================================
-- 说明: 存储磁检测实验的主要信息
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 项目基本信息
    project_name VARCHAR(200) NOT NULL,
    project_code VARCHAR(50) UNIQUE, -- 项目编号
    
    -- 工件信息
    workpiece_name VARCHAR(100) NOT NULL,
    workpiece_material VARCHAR(50), -- 材料类型（Q345、16Mn等）
    workpiece_spec VARCHAR(100), -- 规格尺寸
    batch_number VARCHAR(50), -- 批次号
    surface_condition VARCHAR(50), -- 表面状态
    
    -- 检测标准
    standard_reference VARCHAR(100) DEFAULT 'ISO 9934-1:2016', -- 检测标准
    acceptance_criteria VARCHAR(100), -- 验收标准
    
    -- 操作人员信息
    operator_id UUID REFERENCES public.users(id),
    operator_name VARCHAR(100) NOT NULL,
    operator_cert VARCHAR(100), -- 操作员资质
    inspector_name VARCHAR(100), -- 检验员
    inspector_cert VARCHAR(100), -- 检验员资质
    
    -- 检测日期
    test_date DATE NOT NULL DEFAULT CURRENT_DATE,
    test_start_time TIMESTAMPTZ,
    test_end_time TIMESTAMPTZ,
    
    -- 磁化参数
    magnetization_method VARCHAR(50) NOT NULL, -- 磁化方式（直流/交流/脉冲/剩磁）
    magnetization_type VARCHAR(50), -- 磁化类型（直接/间接/复合）
    magnetization_current INTEGER, -- 磁化电流(mA)
    magnetization_frequency DECIMAL(10,2), -- 磁化频率(Hz)，DC为0
    magnetization_voltage DECIMAL(10,2), -- 磁化电压(V)
    magnetization_time DECIMAL(5,2), -- 磁化时间(秒)
    
    -- 检测介质
    magnetic_powder_type VARCHAR(50), -- 磁粉类型（湿法/干法）
    magnetic_powder_color VARCHAR(20), -- 磁粉颜色
    magnetic_powder_brand VARCHAR(50), -- 磁粉品牌
    carrier_fluid VARCHAR(50), -- 载液类型
    suspension_concentration DECIMAL(5,2), -- 悬液浓度(g/L)
    
    -- 观察条件
    light_type VARCHAR(50), -- 光照类型（可见光/紫外线）
    light_intensity DECIMAL(10,2), -- 光照强度(lux)
    uv_intensity DECIMAL(10,2), -- 紫外线强度(μW/cm²)
    ambient_temperature DECIMAL(5,2), -- 环境温度(℃)
    ambient_humidity DECIMAL(5,2), -- 环境湿度(%)
    
    -- 检测参数
    sensitivity_level VARCHAR(20), -- 灵敏度等级
    scan_speed DECIMAL(10,2), -- 扫描速度(mm/s)
    gain_level INTEGER, -- 增益等级(dB)
    gate_position DECIMAL(10,2), -- 门控位置(mm)
    gate_width DECIMAL(10,2), -- 门控宽度(mm)
    gate_threshold DECIMAL(5,2), -- 门控阈值(%)
    
    -- 检测结果
    test_result VARCHAR(20) DEFAULT '检测中' CHECK (test_result IN ('合格', '不合格', '检测中', '待复检')),
    defect_count INTEGER DEFAULT 0, -- 缺陷数量
    total_scan_length DECIMAL(10,2), -- 总扫描长度(mm)
    defect_density DECIMAL(10,4), -- 缺陷密度(个/m)
    
    -- 退磁和清洗
    demagnetization_method VARCHAR(50), -- 退磁方法
    demagnetization_current DECIMAL(10,2), -- 退磁电流(A)
    cleaning_method VARCHAR(50), -- 清洗方法
    
    -- 报告信息
    report_number VARCHAR(50) UNIQUE, -- 报告编号
    report_generated BOOLEAN DEFAULT false,
    report_url TEXT, -- 报告PDF URL
    
    -- 备注
    remarks TEXT,
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 实验表索引
CREATE INDEX idx_experiments_project_name ON public.experiments(project_name);
CREATE INDEX idx_experiments_test_date ON public.experiments(test_date DESC);
CREATE INDEX idx_experiments_operator_id ON public.experiments(operator_id);
CREATE INDEX idx_experiments_test_result ON public.experiments(test_result);

-- 实验表注释
COMMENT ON TABLE public.experiments IS '磁检测实验项目表';
COMMENT ON COLUMN public.experiments.magnetization_method IS '磁化方式：直流磁化、交流磁化、脉冲磁化、剩磁法';

-- ============================================================================
-- 3. 磁信号数据表 (signal_data)
-- ============================================================================
-- 说明: 存储实时采集的磁信号波形数据
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.signal_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
    
    -- 通道信息
    channel INTEGER NOT NULL CHECK (channel IN (1, 2)), -- 通道号（1-横向，2-纵向）
    
    -- 时间和位置
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    position DECIMAL(10,3), -- 扫描位置(mm)
    scan_line INTEGER, -- 扫描线编号
    
    -- 信号参数
    amplitude DECIMAL(10,4) NOT NULL, -- 信号幅值(mV)
    frequency DECIMAL(10,2), -- 频率(Hz)
    phase DECIMAL(10,2), -- 相位(度)
    
    -- 处理后的信号
    filtered_amplitude DECIMAL(10,4), -- 滤波后幅值
    baseline DECIMAL(10,4), -- 基线值
    signal_to_noise_ratio DECIMAL(10,2), -- 信噪比(dB)
    
    -- 异常标记
    is_anomaly BOOLEAN DEFAULT false, -- 是否异常信号
    anomaly_confidence DECIMAL(5,4), -- 异常置信度(0-1)
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 信号数据表索引
CREATE INDEX idx_signal_data_experiment_id ON public.signal_data(experiment_id);
CREATE INDEX idx_signal_data_timestamp ON public.signal_data(timestamp);
CREATE INDEX idx_signal_data_position ON public.signal_data(position);
CREATE INDEX idx_signal_data_channel ON public.signal_data(channel);

-- 信号数据表注释
COMMENT ON TABLE public.signal_data IS '磁信号波形数据表';
COMMENT ON COLUMN public.signal_data.channel IS '通道1-横向磁化信号，通道2-纵向磁化信号';

-- ============================================================================
-- 4. 缺陷记录表 (defects)
-- ============================================================================
-- 说明: 存储检测到的缺陷信息
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.defects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
    
    -- 缺陷编号
    defect_number VARCHAR(50), -- 缺陷编号（如：D-001）
    
    -- 缺陷类型
    defect_type VARCHAR(50) NOT NULL, -- 缺陷类型（裂纹/气孔/夹杂/未熔合/未焊透等）
    defect_category VARCHAR(50), -- 缺陷大类（表面/内部）
    
    -- 位置信息
    position_x DECIMAL(10,3) NOT NULL, -- X坐标(mm)
    position_y DECIMAL(10,3), -- Y坐标(mm)
    position_z DECIMAL(10,3), -- Z坐标（深度，mm）
    depth_estimate DECIMAL(10,3), -- 深度估算(mm)
    orientation DECIMAL(10,2), -- 缺陷方向(度)
    
    -- 尺寸信息
    length DECIMAL(10,3), -- 长度(mm)
    width DECIMAL(10,3), -- 宽度(mm)
    area DECIMAL(10,3), -- 面积(mm²)
    volume DECIMAL(10,3), -- 体积(mm³)
    
    -- 严重程度
    severity INTEGER CHECK (severity BETWEEN 1 AND 5), -- 严重程度(1-5级)
    severity_description VARCHAR(100), -- 严重程度描述
    
    -- 信号特征
    signal_amplitude DECIMAL(10,4) NOT NULL, -- 信号幅值(mV)
    signal_frequency DECIMAL(10,2), -- 信号频率(Hz)
    signal_width DECIMAL(10,3), -- 信号宽度(ms)
    peak_to_peak DECIMAL(10,4), -- 峰峰值(mV)
    
    -- 图像信息
    image_url TEXT, -- 缺陷图像URL（Supabase Storage）
    waveform_snapshot TEXT, -- 波形快照（Base64或URL）
    
    -- 分析结果
    detection_method VARCHAR(50), -- 检测方法（自动/人工）
    detection_confidence DECIMAL(5,4), -- 检测置信度(0-1)
    is_confirmed BOOLEAN DEFAULT false, -- 是否已确认
    confirmed_by VARCHAR(100), -- 确认人
    confirmed_at TIMESTAMPTZ, -- 确认时间
    
    -- 判定结果
    is_acceptable BOOLEAN, -- 是否可接受
    rejection_reason TEXT, -- 拒收原因
    
    -- 描述
    description TEXT, -- 缺陷描述
    remarks TEXT, -- 备注
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 缺陷表索引
CREATE INDEX idx_defects_experiment_id ON public.defects(experiment_id);
CREATE INDEX idx_defects_type ON public.defects(defect_type);
CREATE INDEX idx_defects_severity ON public.defects(severity);

-- 缺陷表注释
COMMENT ON TABLE public.defects IS '缺陷记录表';
COMMENT ON COLUMN public.defects.defect_type IS '缺陷类型：裂纹、气孔、夹杂、未熔合、未焊透、咬边等';

-- ============================================================================
-- 5. 参数配置表 (configurations)
-- ============================================================================
-- 说明: 存储设备参数预设配置
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    
    -- 配置基本信息
    config_name VARCHAR(100) NOT NULL,
    config_description TEXT,
    config_category VARCHAR(50), -- 配置类别（通用/特定材料/特定缺陷）
    
    -- 磁化参数
    magnetization_current INTEGER, -- 磁化电流(mA)
    magnetization_frequency DECIMAL(10,2), -- 磁化频率(Hz)
    magnetization_time DECIMAL(5,2), -- 磁化时间(秒)
    
    -- 增益和滤波
    gain INTEGER, -- 增益(dB)
    gain_channel1 INTEGER, -- 通道1增益
    gain_channel2 INTEGER, -- 通道2增益
    filter_type VARCHAR(50), -- 滤波器类型（低通/高通/带通）
    filter_cutoff_low DECIMAL(10,2), -- 低频截止(Hz)
    filter_cutoff_high DECIMAL(10,2), -- 高频截止(Hz)
    noise_suppression BOOLEAN DEFAULT false, -- 噪声抑制开关
    
    -- 门控参数
    gate_position DECIMAL(10,2), -- 门控位置(mm)
    gate_width DECIMAL(10,2), -- 门控宽度(mm)
    gate_threshold DECIMAL(5,2), -- 门控阈值(%)
    gate_mode VARCHAR(20), -- 门控模式（单门/双门）
    
    -- 显示参数
    display_range_min DECIMAL(10,2), -- 显示范围最小值
    display_range_max DECIMAL(10,2), -- 显示范围最大值
    waveform_color_ch1 VARCHAR(20) DEFAULT '#00FF00', -- 通道1波形颜色
    waveform_color_ch2 VARCHAR(20) DEFAULT '#0000FF', -- 通道2波形颜色
    grid_enabled BOOLEAN DEFAULT true, -- 网格显示
    
    -- 扫描参数
    scan_speed DECIMAL(10,2), -- 扫描速度(mm/s)
    sample_rate INTEGER, -- 采样率(Hz)
    
    -- 报警参数
    alarm_threshold DECIMAL(10,4), -- 报警阈值
    alarm_enabled BOOLEAN DEFAULT true,
    
    -- 配置状态
    is_default BOOLEAN DEFAULT false, -- 是否默认配置
    is_public BOOLEAN DEFAULT false, -- 是否公开配置
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 配置表索引
CREATE INDEX idx_configurations_user_id ON public.configurations(user_id);
CREATE INDEX idx_configurations_is_default ON public.configurations(is_default);

-- 配置表注释
COMMENT ON TABLE public.configurations IS '参数配置预设表';

-- ============================================================================
-- 6. 系统日志表 (system_logs)
-- ============================================================================
-- 说明: 记录系统操作日志
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    
    -- 操作信息
    action VARCHAR(100) NOT NULL, -- 操作类型（login/logout/create/update/delete等）
    action_category VARCHAR(50), -- 操作类别（auth/experiment/config/system）
    
    -- 详细描述
    description TEXT NOT NULL,
    
    -- 影响的资源
    resource_type VARCHAR(50), -- 资源类型（experiment/defect/config等）
    resource_id UUID, -- 资源ID
    
    -- 请求信息
    ip_address VARCHAR(45), -- IP地址（支持IPv6）
    user_agent TEXT, -- 用户代理
    
    -- 结果
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failure', 'warning')),
    error_message TEXT, -- 错误信息
    
    -- 附加数据
    metadata JSONB, -- 附加JSON数据
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 系统日志表索引
CREATE INDEX idx_system_logs_user_id ON public.system_logs(user_id);
CREATE INDEX idx_system_logs_action ON public.system_logs(action);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);

-- 系统日志表注释
COMMENT ON TABLE public.system_logs IS '系统操作日志表';

-- ============================================================================
-- 7. 设备校准记录表 (calibration_records)
-- ============================================================================
-- 说明: 记录设备校准历史
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.calibration_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 校准基本信息
    calibration_date DATE NOT NULL,
    next_calibration_date DATE NOT NULL,
    calibration_status VARCHAR(20) DEFAULT '合格' CHECK (calibration_status IN ('合格', '不合格', '待校准')),
    
    -- 校准人员
    calibrator_name VARCHAR(100) NOT NULL,
    calibrator_cert VARCHAR(100),
    
    -- 校准标准
    calibration_standard VARCHAR(100), -- 校准标准
    reference_block VARCHAR(100), -- 参考试块
    
    -- 校准参数
    magnetic_field_strength DECIMAL(10,4), -- 磁场强度(T)
    sensitivity_test_result VARCHAR(50), -- 灵敏度测试结果
    linearity_test_result VARCHAR(50), -- 线性度测试结果
    
    -- 校准结果
    calibration_certificate VARCHAR(100), -- 校准证书编号
    certificate_url TEXT, -- 证书文件URL
    
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 校准记录表索引
CREATE INDEX idx_calibration_records_date ON public.calibration_records(calibration_date DESC);
CREATE INDEX idx_calibration_records_status ON public.calibration_records(calibration_status);

-- 校准记录表注释
COMMENT ON TABLE public.calibration_records IS '设备校准记录表';

-- ============================================================================
-- 8. 文件管理表 (files)
-- ============================================================================
-- 说明: 管理实验相关的文件
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID REFERENCES public.experiments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    
    -- 文件信息
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 文件类型（pdf/excel/image/video/data）
    file_category VARCHAR(50), -- 文件类别（report/waveform/photo/video/raw_data）
    file_size BIGINT, -- 文件大小(bytes)
    mime_type VARCHAR(100), -- MIME类型
    
    -- 存储信息
    storage_path TEXT NOT NULL, -- Supabase Storage路径
    storage_bucket VARCHAR(100) DEFAULT 'experiments', -- 存储桶
    file_url TEXT NOT NULL, -- 文件URL
    
    -- 文件元数据
    description TEXT,
    tags TEXT[], -- 标签数组
    
    -- 访问控制
    is_public BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 文件表索引
CREATE INDEX idx_files_experiment_id ON public.files(experiment_id);
CREATE INDEX idx_files_file_type ON public.files(file_type);
CREATE INDEX idx_files_created_at ON public.files(created_at DESC);

-- 文件表注释
COMMENT ON TABLE public.files IS '文件管理表';

-- ============================================================================
-- 9. 数据统计表 (statistics)
-- ============================================================================
-- 说明: 存储统计分析数据
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID REFERENCES public.experiments(id) ON DELETE CASCADE,
    
    -- 统计时间
    stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- 检测统计
    total_scan_time DECIMAL(10,2), -- 总扫描时间(分钟)
    total_scan_length DECIMAL(10,2), -- 总扫描长度(m)
    average_scan_speed DECIMAL(10,2), -- 平均扫描速度(mm/s)
    
    -- 缺陷统计
    total_defects INTEGER DEFAULT 0,
    defect_density DECIMAL(10,4), -- 缺陷密度(个/m)
    critical_defects INTEGER DEFAULT 0, -- 严重缺陷数
    major_defects INTEGER DEFAULT 0, -- 主要缺陷数
    minor_defects INTEGER DEFAULT 0, -- 次要缺陷数
    
    -- 缺陷类型统计（JSON格式）
    defect_type_distribution JSONB, -- {"裂纹": 5, "气孔": 3, ...}
    
    -- 合格率
    pass_rate DECIMAL(5,2), -- 合格率(%)
    
    -- 信号统计
    average_amplitude DECIMAL(10,4), -- 平均幅值(mV)
    max_amplitude DECIMAL(10,4), -- 最大幅值(mV)
    min_amplitude DECIMAL(10,4), -- 最小幅值(mV)
    std_deviation DECIMAL(10,4), -- 标准差
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 统计表索引
CREATE INDEX idx_statistics_experiment_id ON public.statistics(experiment_id);
CREATE INDEX idx_statistics_stat_date ON public.statistics(stat_date DESC);

-- 统计表注释
COMMENT ON TABLE public.statistics IS '数据统计分析表';

-- ============================================================================
-- 10. 创建触发器函数 - 自动更新updated_at字段
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表创建触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON public.experiments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_defects_updated_at BEFORE UPDATE ON public.defects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configurations_updated_at BEFORE UPDATE ON public.configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON public.files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 11. 创建触发器 - 实验缺陷计数自动更新
-- ============================================================================

CREATE OR REPLACE FUNCTION update_experiment_defect_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.experiments
    SET defect_count = (
        SELECT COUNT(*) FROM public.defects WHERE experiment_id = NEW.experiment_id
    )
    WHERE id = NEW.experiment_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_defect_count_on_insert AFTER INSERT ON public.defects
    FOR EACH ROW EXECUTE FUNCTION update_experiment_defect_count();

CREATE TRIGGER update_defect_count_on_delete AFTER DELETE ON public.defects
    FOR EACH ROW EXECUTE FUNCTION update_experiment_defect_count();

-- ============================================================================
-- 12. 行级安全策略 (Row Level Security)
-- ============================================================================

-- 启用RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calibration_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;

-- 用户表策略
CREATE POLICY "用户可以查看自己的信息" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "管理员可以查看所有用户" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 实验表策略
CREATE POLICY "所有认证用户可以查看实验" ON public.experiments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "操作员和管理员可以创建实验" ON public.experiments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('operator', 'admin')
        )
    );

CREATE POLICY "实验创建者和管理员可以更新" ON public.experiments
    FOR UPDATE USING (
        operator_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 信号数据表策略
CREATE POLICY "所有认证用户可以查看信号数据" ON public.signal_data
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "操作员和管理员可以插入信号数据" ON public.signal_data
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('operator', 'admin')
        )
    );

-- 缺陷表策略
CREATE POLICY "所有认证用户可以查看缺陷" ON public.defects
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "操作员和管理员可以创建缺陷记录" ON public.defects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('operator', 'admin')
        )
    );

-- 配置表策略
CREATE POLICY "用户可以查看自己的配置" ON public.configurations
    FOR SELECT USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "用户可以创建自己的配置" ON public.configurations
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "用户可以更新自己的配置" ON public.configurations
    FOR UPDATE USING (user_id = auth.uid());

-- 系统日志策略
CREATE POLICY "用户可以查看自己的日志" ON public.system_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "管理员可以查看所有日志" ON public.system_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 文件表策略
CREATE POLICY "所有认证用户可以查看公开文件" ON public.files
    FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "用户可以上传文件" ON public.files
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 13. 创建视图 - 实验概览
-- ============================================================================

CREATE OR REPLACE VIEW public.experiment_overview AS
SELECT 
    e.id,
    e.project_name,
    e.project_code,
    e.workpiece_name,
    e.test_date,
    e.operator_name,
    e.test_result,
    e.defect_count,
    u.full_name as operator_full_name,
    COUNT(DISTINCT d.id) as confirmed_defect_count,
    COUNT(DISTINCT f.id) as file_count
FROM public.experiments e
LEFT JOIN public.users u ON e.operator_id = u.id
LEFT JOIN public.defects d ON e.id = d.experiment_id AND d.is_confirmed = true
LEFT JOIN public.files f ON e.id = f.experiment_id
GROUP BY e.id, u.full_name;

COMMENT ON VIEW public.experiment_overview IS '实验概览视图';

-- ============================================================================
-- 14. 创建视图 - 缺陷统计
-- ============================================================================

CREATE OR REPLACE VIEW public.defect_statistics AS
SELECT 
    e.id as experiment_id,
    e.project_name,
    COUNT(d.id) as total_defects,
    COUNT(CASE WHEN d.severity = 5 THEN 1 END) as critical_defects,
    COUNT(CASE WHEN d.severity >= 3 THEN 1 END) as major_defects,
    COUNT(CASE WHEN d.severity < 3 THEN 1 END) as minor_defects,
    AVG(d.severity) as average_severity,
    MAX(d.signal_amplitude) as max_amplitude,
    AVG(d.signal_amplitude) as avg_amplitude
FROM public.experiments e
LEFT JOIN public.defects d ON e.id = d.experiment_id
GROUP BY e.id, e.project_name;

COMMENT ON VIEW public.defect_statistics IS '缺陷统计视图';

-- ============================================================================
-- 数据库Schema创建完成
-- ============================================================================
