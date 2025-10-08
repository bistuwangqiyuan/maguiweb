/**
 * Report Generator Module - 检测报告生成模块
 * Task: T054-T058 - US7
 */

class ReportGenerator {
    constructor(supabaseClient, dataManager) {
        this.client = supabaseClient;
        this.dataManager = dataManager;
    }
    
    /**
     * 生成PDF报告
     * Task: T055
     * @param {string} experimentId - 实验ID
     */
    async generateReport(experimentId) {
        try {
            Utils.showNotification('正在生成报告...', 'info');
            
            // 加载实验数据
            const experiment = await this.dataManager.loadExperiment(experimentId);
            
            // 加载缺陷数据
            const { data: defects } = await this.client.supabase
                .from('defects')
                .select('*')
                .eq('experiment_id', experimentId)
                .order('detection_time');
            
            // 创建PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            
            let y = 20; // 当前Y坐标
            
            // ===== 封面 =====
            doc.setFontSize(24);
            doc.setTextColor(255, 107, 0);
            doc.text('磁粉检测报告', 105, y, { align: 'center' });
            
            y += 15;
            doc.setFontSize(14);
            doc.setTextColor(100);
            doc.text('MAGNETIC PARTICLE TESTING REPORT', 105, y, { align: 'center' });
            
            y += 20;
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(`报告编号: MPT-${experiment.id.substring(0, 8).toUpperCase()}`, 20, y);
            
            y += 10;
            doc.text(`生成时间: ${Utils.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')}`, 20, y);
            
            // ===== 第1页：基本信息 =====
            y += 20;
            doc.setFontSize(16);
            doc.setTextColor(255, 107, 0);
            doc.text('1. 基本信息', 20, y);
            
            y += 10;
            doc.setFontSize(11);
            doc.setTextColor(0);
            
            const basicInfo = [
                ['项目名称', experiment.project_name],
                ['工件名称', experiment.workpiece_name],
                ['工件材料', experiment.workpiece_material || '-'],
                ['批次号', experiment.batch_number || '-'],
                ['检测标准', experiment.standard_reference],
                ['检测日期', Utils.formatDate(experiment.start_time, 'YYYY-MM-DD HH:mm')],
                ['操作员', experiment.operator_name],
                ['操作员资质', experiment.operator_cert || '-']
            ];
            
            basicInfo.forEach(([label, value]) => {
                doc.text(`${label}:`, 25, y);
                doc.text(value, 70, y);
                y += 7;
            });
            
            // ===== 第2页：检测参数 =====
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            y += 10;
            doc.setFontSize(16);
            doc.setTextColor(255, 107, 0);
            doc.text('2. 检测参数', 20, y);
            
            y += 10;
            doc.setFontSize(11);
            doc.setTextColor(0);
            
            const params = [
                ['磁化方式', experiment.magnetization_method],
                ['磁化电流', `${experiment.magnetization_current || 0} mA`],
                ['磁化频率', `${experiment.magnetization_frequency || 0} Hz`],
                ['磁化时间', `${experiment.magnetization_duration || 0} s`]
            ];
            
            params.forEach(([label, value]) => {
                doc.text(`${label}:`, 25, y);
                doc.text(value, 70, y);
                y += 7;
            });
            
            // ===== 第3页：检测结果 =====
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            y += 10;
            doc.setFontSize(16);
            doc.setTextColor(255, 107, 0);
            doc.text('3. 检测结果', 20, y);
            
            y += 10;
            doc.setFontSize(11);
            doc.setTextColor(0);
            
            doc.text(`缺陷总数: ${defects?.length || 0}`, 25, y);
            y += 7;
            doc.text(`检测状态: ${this.getStatusText(experiment.status)}`, 25, y);
            y += 7;
            doc.text(`检测结论: ${experiment.is_qualified === null ? '待评定' : experiment.is_qualified ? '合格' : '不合格'}`, 25, y);
            
            // ===== 第4页：缺陷列表 =====
            if (defects && defects.length > 0) {
                y += 15;
                
                if (y > 240) {
                    doc.addPage();
                    y = 20;
                }
                
                doc.setFontSize(16);
                doc.setTextColor(255, 107, 0);
                doc.text('4. 缺陷记录', 20, y);
                
                y += 10;
                doc.setFontSize(10);
                doc.setTextColor(0);
                
                // 表头
                doc.setFillColor(255, 107, 0);
                doc.rect(20, y - 5, 170, 7, 'F');
                doc.setTextColor(255);
                doc.text('编号', 22, y);
                doc.text('类型', 40, y);
                doc.text('位置(mm)', 70, y);
                doc.text('严重程度', 110, y);
                doc.text('描述', 140, y);
                
                y += 7;
                doc.setTextColor(0);
                
                defects.forEach((defect, index) => {
                    if (y > 270) {
                        doc.addPage();
                        y = 20;
                    }
                    
                    doc.text(`${index + 1}`, 22, y);
                    doc.text(defect.defect_type, 40, y);
                    doc.text(`(${defect.position_x.toFixed(1)}, ${defect.position_y.toFixed(1)})`, 70, y);
                    doc.text('⭐'.repeat(defect.severity), 110, y);
                    doc.text((defect.description || '-').substring(0, 20), 140, y);
                    
                    y += 7;
                });
            }
            
            // ===== 最后一页：结论和签名 =====
            doc.addPage();
            y = 20;
            
            doc.setFontSize(16);
            doc.setTextColor(255, 107, 0);
            doc.text('5. 检测结论', 20, y);
            
            y += 10;
            doc.setFontSize(11);
            doc.setTextColor(0);
            
            const conclusion = this.generateConclusion(experiment, defects || []);
            doc.text(conclusion, 25, y, { maxWidth: 160 });
            
            y += 40;
            doc.setFontSize(10);
            doc.text('操作员签名: _________________', 25, y);
            doc.text('日期: _________________', 120, y);
            
            y += 15;
            doc.text('审核员签名: _________________', 25, y);
            doc.text('日期: _________________', 120, y);
            
            // ===== 页脚 =====
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`第 ${i} 页，共 ${pageCount} 页`, 105, 290, { align: 'center' });
                doc.text('DOPPLER 磁检测系统 | 符合 ISO 9934-1:2016', 105, 285, { align: 'center' });
            }
            
            // 保存PDF
            const filename = `MPT_Report_${experiment.project_name}_${Utils.formatDate(new Date(), 'YYYYMMDD_HHmmss')}.pdf`;
            doc.save(filename);
            
            Utils.showNotification('报告生成成功！', 'success');
            
        } catch (error) {
            console.error('生成报告失败:', error);
            Utils.showNotification(`生成报告失败: ${error.message}`, 'error');
        }
    }
    
    /**
     * 生成检测结论文本
     */
    generateConclusion(experiment, defects) {
        const criticalDefects = defects.filter(d => d.severity >= 4).length;
        const totalDefects = defects.length;
        
        if (totalDefects === 0) {
            return '经磁粉检测，未发现明显缺陷。工件符合相关技术标准要求。';
        } else if (criticalDefects === 0) {
            return `经磁粉检测，共发现${totalDefects}处轻微缺陷，均在可接受范围内。工件基本符合技术标准要求，建议继续监测。`;
        } else {
            return `经磁粉检测，共发现${totalDefects}处缺陷，其中${criticalDefects}处为严重或危险级别缺陷。工件存在安全隐患，建议进行修复或报废处理。`;
        }
    }
    
    /**
     * 获取状态文本
     */
    getStatusText(status) {
        const statusMap = {
            'pending': '待检测',
            'in_progress': '检测中',
            'completed': '已完成',
            'cancelled': '已取消'
        };
        return statusMap[status] || status;
    }
    
    /**
     * 批量生成报告
     * Task: T058
     * @param {Array} experimentIds - 实验ID数组
     */
    async generateBatchReports(experimentIds) {
        Utils.showNotification(`开始批量生成${experimentIds.length}份报告...`, 'info');
        
        let success = 0;
        let failed = 0;
        
        for (const id of experimentIds) {
            try {
                await this.generateReport(id);
                success++;
                await new Promise(resolve => setTimeout(resolve, 1000)); // 延迟1秒
            } catch (error) {
                failed++;
                console.error(`生成报告失败 (${id}):`, error);
            }
        }
        
        Utils.showNotification(`批量生成完成！成功: ${success}, 失败: ${failed}`, 'success');
    }
}

// 导出
window.ReportGenerator = ReportGenerator;
