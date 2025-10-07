# Data Model: 磁检测仪器Web界面系统

**Feature**: 001-web | **Date**: 2025-10-07 | **Phase**: 1 - Data Model

---

## Overview

本文档定义了磁检测仪器系统的完整数据模型，包括所有实体、属性、关系和验证规则。数据模型完全符合ISO 9934-1:2016国际标准要求。

**数据库**: Supabase PostgreSQL  
**Schema**: public  
**行级安全**: 启用（RLS Policies）

---

## Entity Relationship Diagram

```
┌─────────────┐
│   users     │
└─────┬───────┘
      │ 1
      │ owns
      │ n
┌─────▼───────────────┐        ┌──────────────────┐
│   experiments       │◄──────┤  configurations  │
└─────┬───────────────┘  n:1   └──────────────────┘
      │ 1                       (参数预设)
      │ has
      │ n
      ├──────────────────┐
      │                  │
      ▼                  ▼
┌─────────────┐    ┌──────────┐    ┌────────────────┐
│signal_data  │    │ defects  │    │     files      │
└─────────────┘    └──────────┘    └────────────────┘
(信号数据)          (缺陷记录)        (文件附件)

┌────────────────────┐
│   system_logs      │  (独立表，记录所有操作)
└────────────────────┘

┌────────────────────────┐
│ calibration_records    │  (独立表，设备校准)
└────────────────────────┘
```

---

## Core Entities

### 1. users (用户表)

**用途**: 存储系统用户信息，集成Supabase Auth

**字段定义**:

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK, FK→auth.users | 用户ID（来自Supabase Auth） |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 邮箱地址 |
| full_name | VARCHAR(100) | NULL | 全名 |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'operator' | 角色（admin/operator/viewer） |
| certification | VARCHAR(100) | NULL | NDT资质证书编号 |
| certification_date | DATE | NULL | 资质获取日期 |
| phone | VARCHAR(20) | NULL | 电话号码 |
| department | VARCHAR(50) | NULL | 所属部门 |
| is_active | BOOLEAN | DEFAULT true | 是否激活 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |

**验证规则**:
- email: 必须符合邮箱格式
- role: 只能是'admin', 'operator', 'viewer'之一
- username: 只能包含字母、数字、下划线

**索引**:
- PRIMARY KEY (id)
- UNIQUE INDEX (username)
- UNIQUE INDEX (email)

**RLS策略**:
```sql
-- 用户可以查看自己的信息
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- 管理员可以查看所有用户
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
```

---

### 2. experiments (实验项目表)

**用途**: 存储磁检测实验的完整信息

**字段定义**:

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | 实验ID |
| project_name | VARCHAR(200) | NOT NULL | 项目名称 |
| project_code | VARCHAR(50) | UNIQUE | 项目编号（如EXP-20251007-001） |
| workpiece_name | VARCHAR(100) | NOT NULL | 工件名称 |
| workpiece_material | VARCHAR(50) | NULL | 工件材料（如Q345、16Mn） |
| workpiece_spec | VARCHAR(100) | NULL | 工件规格尺寸 |
| batch_number | VARCHAR(50) | NULL | 批次号 |
| standard_reference | VARCHAR(100) | DEFAULT 'ISO 9934-1:2016' | 检测标准 |
| operator_id | UUID | FK→users.id | 操作员ID |
| operator_name | VARCHAR(100) | NOT NULL | 操作员姓名 |
| operator_cert | VARCHAR(100) | NULL | 操作员资质证书 |
| test_date | DATE | NOT NULL, DEFAULT CURRENT_DATE | 检测日期 |
| magnetization_method | VARCHAR(50) | NOT NULL | 磁化方式（直流/交流/脉冲/剩磁） |
| magnetization_current | INTEGER | NULL | 磁化电流(mA) |
| magnetization_frequency | DECIMAL(10,2) | NULL | 磁化频率(Hz) |
| magnetization_time | DECIMAL(5,2) | NULL | 磁化时间(秒) |
| magnetic_powder_type | VARCHAR(50) | NULL | 磁粉类型（湿法/干法） |
| sensitivity_level | VARCHAR(20) | NULL | 灵敏度等级 |
| scan_speed | DECIMAL(10,2) | NULL | 扫描速度(mm/s) |
| gain_level | INTEGER | NULL | 增益等级(dB) |
| gate_position | DECIMAL(10,2) | NULL | 门控位置(mm) |
| gate_width | DECIMAL(10,2) | NULL | 门控宽度(mm) |
| gate_threshold | DECIMAL(5,2) | NULL | 门控阈值(%) |
| test_result | VARCHAR(20) | DEFAULT '检测中' | 检测结果（合格/不合格/检测中） |
| defect_count | INTEGER | DEFAULT 0 | 缺陷数量 |
| remarks | TEXT | NULL | 备注 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |

**验证规则**:
- test_result: 只能是'合格', '不合格', '检测中', '待复检'之一
- magnetization_current: 0-2000 mA
- magnetization_frequency: 0-1000 Hz
- magnetization_time: 0.5-10 秒
- gain_level: 0-100 dB
- gate_position: 0-100 mm
- gate_width: 1-50 mm
- gate_threshold: 0-100 %

**索引**:
- PRIMARY KEY (id)
- UNIQUE INDEX (project_code)
- INDEX (operator_id)
- INDEX (test_date DESC)
- INDEX (test_result)

**触发器**:
```sql
-- 自动更新updated_at
CREATE TRIGGER update_experiments_updated_at
  BEFORE UPDATE ON experiments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 自动更新缺陷计数
CREATE TRIGGER update_experiment_defect_count
  AFTER INSERT OR DELETE ON defects
  FOR EACH ROW EXECUTE FUNCTION update_experiment_defect_count();
```

---

### 3. signal_data (磁信号数据表)

**用途**: 存储实时采集的磁信号波形数据

**字段定义**:

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | 信号数据ID |
| experiment_id | UUID | NOT NULL, FK→experiments.id | 实验ID |
| channel | INTEGER | NOT NULL, CHECK (channel IN (1,2)) | 通道号（1-横向，2-纵向） |
| timestamp | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 时间戳 |
| position | DECIMAL(10,3) | NULL | 扫描位置(mm) |
| amplitude | DECIMAL(10,4) | NOT NULL | 信号幅值(mV) |
| frequency | DECIMAL(10,2) | NULL | 频率(Hz) |
| phase | DECIMAL(10,2) | NULL | 相位(度) |
| is_anomaly | BOOLEAN | DEFAULT false | 是否异常信号 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |

**验证规则**:
- channel: 只能是1或2
- amplitude: -1000 到 1000 mV
- frequency: 0-10000 Hz
- phase: 0-360 度

**索引**:
- PRIMARY KEY (id)
- INDEX (experiment_id)
- INDEX (timestamp)
- INDEX (position)
- INDEX (channel)
- INDEX (is_anomaly)

**分区策略** (可选，大数据量时):
```sql
-- 按实验ID分区
CREATE TABLE signal_data_partition_001
  PARTITION OF signal_data
  FOR VALUES IN ('experiment_id_1', 'experiment_id_2', ...);
```

---

### 4. defects (缺陷记录表)

**用途**: 存储检测到的缺陷信息

**字段定义**:

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | 缺陷ID |
| experiment_id | UUID | NOT NULL, FK→experiments.id | 实验ID |
| defect_number | VARCHAR(50) | NULL | 缺陷编号（如D-001） |
| defect_type | VARCHAR(50) | NOT NULL | 缺陷类型（裂纹/气孔/夹杂等） |
| position_x | DECIMAL(10,3) | NOT NULL | X坐标(mm) |
| position_y | DECIMAL(10,3) | NULL | Y坐标(mm) |
| depth_estimate | DECIMAL(10,3) | NULL | 深度估算(mm) |
| length | DECIMAL(10,3) | NULL | 长度(mm) |
| width | DECIMAL(10,3) | NULL | 宽度(mm) |
| severity | INTEGER | CHECK (severity BETWEEN 1 AND 5) | 严重程度(1-5级) |
| signal_amplitude | DECIMAL(10,4) | NOT NULL | 信号幅值(mV) |
| image_url | TEXT | NULL | 缺陷图像URL |
| is_confirmed | BOOLEAN | DEFAULT false | 是否已确认 |
| confirmed_by | VARCHAR(100) | NULL | 确认人 |
| confirmed_at | TIMESTAMPTZ | NULL | 确认时间 |
| description | TEXT | NULL | 缺陷描述 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |

**验证规则**:
- defect_type: 裂纹、气孔、夹杂、未熔合、未焊透、咬边、错边之一
- severity: 1-5整数
- position_x: ≥ 0

**索引**:
- PRIMARY KEY (id)
- INDEX (experiment_id)
- INDEX (defect_type)
- INDEX (severity)
- INDEX (is_confirmed)

---

### 5. configurations (参数配置表)

**用途**: 存储用户的参数预设配置

**字段定义**:

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | 配置ID |
| user_id | UUID | FK→users.id | 用户ID |
| config_name | VARCHAR(100) | NOT NULL | 配置名称 |
| config_description | TEXT | NULL | 配置描述 |
| magnetization_current | INTEGER | NULL | 磁化电流(mA) |
| magnetization_frequency | DECIMAL(10,2) | NULL | 磁化频率(Hz) |
| gain | INTEGER | NULL | 增益(dB) |
| gate_position | DECIMAL(10,2) | NULL | 门控位置(mm) |
| gate_width | DECIMAL(10,2) | NULL | 门控宽度(mm) |
| gate_threshold | DECIMAL(5,2) | NULL | 门控阈值(%) |
| filter_type | VARCHAR(50) | NULL | 滤波器类型 |
| is_default | BOOLEAN | DEFAULT false | 是否默认配置 |
| is_public | BOOLEAN | DEFAULT false | 是否公开配置 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |

**验证规则**:
- 与experiments表的参数验证规则一致
- 每个用户最多一个默认配置

**索引**:
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (is_default)
- INDEX (is_public)

---

### 6. files (文件管理表)

**用途**: 管理实验相关的文件（报告、图像等）

**字段定义**:

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | 文件ID |
| experiment_id | UUID | FK→experiments.id | 实验ID |
| user_id | UUID | FK→users.id | 上传用户ID |
| file_name | VARCHAR(255) | NOT NULL | 文件名 |
| file_type | VARCHAR(50) | NOT NULL | 文件类型（pdf/excel/image等） |
| file_category | VARCHAR(50) | NULL | 文件类别（report/waveform/photo） |
| file_size | BIGINT | NULL | 文件大小(bytes) |
| storage_path | TEXT | NOT NULL | Supabase Storage路径 |
| file_url | TEXT | NOT NULL | 文件URL |
| is_public | BOOLEAN | DEFAULT false | 是否公开 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |

**验证规则**:
- file_type: pdf, excel, csv, image, video, data
- file_size: < 100MB

**索引**:
- PRIMARY KEY (id)
- INDEX (experiment_id)
- INDEX (user_id)
- INDEX (file_type)
- INDEX (created_at DESC)

---

### 7. system_logs (系统日志表)

**用途**: 记录所有用户操作，用于审计和故障排查

**字段定义**:

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | 日志ID |
| user_id | UUID | FK→users.id | 用户ID |
| action | VARCHAR(100) | NOT NULL | 操作类型（login/create/update/delete等） |
| description | TEXT | NOT NULL | 操作描述 |
| resource_type | VARCHAR(50) | NULL | 资源类型（experiment/defect/config等） |
| resource_id | UUID | NULL | 资源ID |
| ip_address | VARCHAR(45) | NULL | IP地址 |
| status | VARCHAR(20) | DEFAULT 'success' | 操作结果（success/failure/warning） |
| error_message | TEXT | NULL | 错误信息 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |

**验证规则**:
- status: success, failure, warning之一

**索引**:
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (action)
- INDEX (created_at DESC)
- INDEX (resource_type, resource_id)

---

### 8. calibration_records (设备校准记录表)

**用途**: 记录设备校准历史

**字段定义**:

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | 校准记录ID |
| calibration_date | DATE | NOT NULL | 校准日期 |
| next_calibration_date | DATE | NOT NULL | 下次校准日期 |
| calibration_status | VARCHAR(20) | DEFAULT '合格' | 校准状态（合格/不合格） |
| calibrator_name | VARCHAR(100) | NOT NULL | 校准人姓名 |
| calibrator_cert | VARCHAR(100) | NULL | 校准人资质 |
| calibration_standard | VARCHAR(100) | NULL | 校准标准 |
| calibration_certificate | VARCHAR(100) | NULL | 校准证书编号 |
| remarks | TEXT | NULL | 备注 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |

**验证规则**:
- next_calibration_date > calibration_date
- calibration_status: 合格, 不合格之一

**索引**:
- PRIMARY KEY (id)
- INDEX (calibration_date DESC)
- INDEX (calibration_status)

---

## Data Validation Rules

### 前端验证（JavaScript）

```javascript
// 实验数据验证
function validateExperimentData(data) {
  const errors = [];
  
  // 必填字段
  if (!data.project_name) errors.push('项目名称不能为空');
  if (!data.workpiece_name) errors.push('工件名称不能为空');
  if (!data.operator_name) errors.push('操作员姓名不能为空');
  if (!data.magnetization_method) errors.push('磁化方式不能为空');
  
  // 数值范围
  if (data.magnetization_current < 0 || data.magnetization_current > 2000) {
    errors.push('磁化电流应在0-2000mA之间');
  }
  
  if (data.magnetization_frequency < 0 || data.magnetization_frequency > 1000) {
    errors.push('磁化频率应在0-1000Hz之间');
  }
  
  // 枚举值
  const validMethods = ['直流磁化', '交流磁化', '脉冲磁化', '剩磁法'];
  if (!validMethods.includes(data.magnetization_method)) {
    errors.push('磁化方式无效');
  }
  
  return { isValid: errors.length === 0, errors };
}
```

### 后端验证（Supabase Database Constraints）

```sql
-- CHECK约束
ALTER TABLE experiments ADD CONSTRAINT valid_test_result
  CHECK (test_result IN ('合格', '不合格', '检测中', '待复检'));

ALTER TABLE experiments ADD CONSTRAINT valid_magnetization_current
  CHECK (magnetization_current >= 0 AND magnetization_current <= 2000);

ALTER TABLE signal_data ADD CONSTRAINT valid_channel
  CHECK (channel IN (1, 2));

ALTER TABLE defects ADD CONSTRAINT valid_severity
  CHECK (severity BETWEEN 1 AND 5);
```

---

## Sample Data

### 示例实验数据

```sql
INSERT INTO experiments (
  project_name,
  project_code,
  workpiece_name,
  workpiece_material,
  standard_reference,
  operator_name,
  operator_cert,
  magnetization_method,
  magnetization_current,
  magnetization_frequency,
  test_result
) VALUES (
  '钢板焊缝检测-2025-10-07',
  'EXP-20251007-001',
  'Q345钢板焊缝',
  'Q345',
  'ISO 9934-1:2016',
  '张工',
  'NDT-II-12345',
  '直流磁化',
  1000,
  0,
  '检测中'
);
```

### 示例信号数据

```sql
INSERT INTO signal_data (
  experiment_id,
  channel,
  position,
  amplitude,
  frequency,
  is_anomaly
) VALUES 
  ('实验ID', 1, 0.001, 45.2, 5.0, false),
  ('实验ID', 1, 0.002, 46.8, 5.0, false),
  ('实验ID', 1, 0.003, 78.5, 5.0, true);  -- 异常信号
```

---

## Database Migration Script

详见 `database/schema.sql` 文件（已创建）

---

## Conclusion

数据模型设计完成，符合以下标准：
- ✅ ISO 9934-1:2016国际标准要求
- ✅ 数据完整性约束（主键、外键、CHECK约束）
- ✅ 行级安全策略（RLS）
- ✅ 索引优化（查询性能）
- ✅ 触发器自动化（更新时间戳、缺陷计数）

**准备就绪**: ✅ 可以开始实现（tasks.md）

---

**文档创建人**: AI开发助手  
**创建时间**: 2025-10-07  
**文档版本**: v1.0
