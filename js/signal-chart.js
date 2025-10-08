/**
 * Signal Chart Module - 磁信号波形图表组件
 * 使用ECharts实现实时波形显示
 * Task: T015 - US1
 */

class SignalChart {
    constructor(containerId) {
        this.containerId = containerId;
        this.chart = null;
        this.currentChannel = 1;
        this.maxDataPoints = 500; // 最多显示500个数据点
        this.channel1Data = [];
        this.channel2Data = [];
        this.defectMarkers = [];
        this.threshold = 80; // 缺陷检测阈值
        
        this.initChart();
    }
    
    /**
     * 初始化ECharts图表
     * Task: T015
     */
    initChart() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`容器 ${this.containerId} 不存在`);
            return;
        }
        
        // 初始化ECharts实例
        this.chart = echarts.init(container, 'dark');
        
        // 配置图表选项
        const option = {
            title: {
                text: '磁信号波形实时监测',
                left: 'center',
                textStyle: {
                    color: '#FF6B00',
                    fontSize: 18,
                    fontWeight: 'bold'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                formatter: function(params) {
                    let result = `时间: ${params[0].axisValue.toFixed(3)}s<br/>`;
                    params.forEach(param => {
                        result += `${param.seriesName}: ${param.data[1].toFixed(2)} mV<br/>`;
                    });
                    return result;
                }
            },
            legend: {
                data: ['通道1', '通道2', '缺陷标记'],
                top: 30,
                textStyle: {
                    color: '#E0E0E0'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: 80,
                containLabel: true
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    restore: {},
                    saveAsImage: {
                        name: '磁信号波形_' + new Date().getTime()
                    }
                },
                top: 30,
                right: 20
            },
            xAxis: {
                type: 'value',
                name: '时间 (s)',
                nameTextStyle: {
                    color: '#E0E0E0'
                },
                axisLabel: {
                    color: '#999',
                    formatter: '{value}s'
                },
                axisLine: {
                    lineStyle: {
                        color: '#444'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#333'
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: '幅值 (mV)',
                nameTextStyle: {
                    color: '#E0E0E0'
                },
                axisLabel: {
                    color: '#999',
                    formatter: '{value} mV'
                },
                axisLine: {
                    lineStyle: {
                        color: '#444'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#333'
                    }
                }
            },
            dataZoom: [{
                type: 'inside',
                start: 0,
                end: 100
            }, {
                start: 0,
                end: 100,
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '80%',
                handleStyle: {
                    color: '#FF6B00',
                    shadowBlur: 3,
                    shadowColor: 'rgba(255, 107, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
            }],
            series: [
                {
                    name: '通道1',
                    type: 'line',
                    data: [],
                    smooth: true,
                    symbol: 'none',
                    lineStyle: {
                        color: '#00FF88',
                        width: 2
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(0, 255, 136, 0.3)'
                        }, {
                            offset: 1,
                            color: 'rgba(0, 255, 136, 0.05)'
                        }])
                    }
                },
                {
                    name: '通道2',
                    type: 'line',
                    data: [],
                    smooth: true,
                    symbol: 'none',
                    lineStyle: {
                        color: '#00BFFF',
                        width: 2
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(0, 191, 255, 0.3)'
                        }, {
                            offset: 1,
                            color: 'rgba(0, 191, 255, 0.05)'
                        }])
                    }
                },
                {
                    name: '缺陷标记',
                    type: 'scatter',
                    data: [],
                    symbolSize: 15,
                    itemStyle: {
                        color: '#FF3333',
                        shadowBlur: 10,
                        shadowColor: 'rgba(255, 51, 51, 0.8)'
                    }
                }
            ]
        };
        
        this.chart.setOption(option);
        
        // 点击事件 - 标记缺陷
        this.chart.on('click', (params) => {
            if (params.componentType === 'series' && params.seriesType === 'line') {
                const timestamp = params.data[0];
                const amplitude = params.data[1];
                this.onDefectMark(timestamp, amplitude, params.seriesIndex + 1);
            }
        });
        
        // 响应式
        window.addEventListener('resize', () => {
            this.chart.resize();
        });
    }
    
    /**
     * 更新波形数据
     * Task: T019
     * @param {number} channel - 通道号（1或2）
     * @param {Array} newData - 新数据点 [{timestamp, amplitude}, ...]
     */
    updateData(channel, newData) {
        if (!this.chart) return;
        
        const dataArray = channel === 1 ? this.channel1Data : this.channel2Data;
        
        // 添加新数据
        newData.forEach(point => {
            dataArray.push([point.timestamp, point.amplitude]);
            
            // 检测缺陷
            if (point.amplitude > this.threshold) {
                this.markDefect(point.timestamp, point.amplitude);
            }
        });
        
        // 保持最大数据点数量
        if (dataArray.length > this.maxDataPoints) {
            dataArray.splice(0, dataArray.length - this.maxDataPoints);
        }
        
        // 更新图表
        this.chart.setOption({
            series: [
                { data: this.channel1Data },
                { data: this.channel2Data },
                { data: this.defectMarkers }
            ]
        });
    }
    
    /**
     * 标记缺陷位置
     * Task: T021
     * @param {number} timestamp - 时间戳
     * @param {number} amplitude - 幅值
     */
    markDefect(timestamp, amplitude) {
        // 避免重复标记
        const exists = this.defectMarkers.some(marker => 
            Math.abs(marker[0] - timestamp) < 0.01
        );
        
        if (!exists) {
            this.defectMarkers.push([timestamp, amplitude]);
            
            // 触发缺陷检测事件
            if (this.onDefectDetected) {
                this.onDefectDetected(timestamp, amplitude);
            }
        }
    }
    
    /**
     * 切换显示通道
     * Task: T020
     * @param {number} channel - 通道号（1或2）
     */
    toggleChannel(channel) {
        if (!this.chart) return;
        
        this.currentChannel = channel || (this.currentChannel === 1 ? 2 : 1);
        
        // 更新图表可见性
        this.chart.setOption({
            series: [
                { 
                    name: '通道1',
                    lineStyle: { 
                        opacity: this.currentChannel === 1 ? 1 : 0.2 
                    }
                },
                { 
                    name: '通道2',
                    lineStyle: { 
                        opacity: this.currentChannel === 2 ? 1 : 0.2 
                    }
                }
            ]
        });
        
        return this.currentChannel;
    }
    
    /**
     * 重置缩放
     */
    resetZoom() {
        if (!this.chart) return;
        
        this.chart.dispatchAction({
            type: 'dataZoom',
            start: 0,
            end: 100
        });
    }
    
    /**
     * 清空数据
     */
    clearData() {
        this.channel1Data = [];
        this.channel2Data = [];
        this.defectMarkers = [];
        
        if (this.chart) {
            this.chart.setOption({
                series: [
                    { data: [] },
                    { data: [] },
                    { data: [] }
                ]
            });
        }
    }
    
    /**
     * 获取当前波形截图
     * @returns {string} Base64图片数据
     */
    getSnapshot() {
        if (!this.chart) return null;
        return this.chart.getDataURL({
            type: 'png',
            pixelRatio: 2,
            backgroundColor: '#1a1a1a'
        });
    }
    
    /**
     * 缺陷检测回调（由外部设置）
     */
    onDefectDetected = null;
    onDefectMark = null;
    
    /**
     * 销毁图表
     */
    destroy() {
        if (this.chart) {
            this.chart.dispose();
            this.chart = null;
        }
    }
}

// 导出
window.SignalChart = SignalChart;
