<!-- Author: qht -->
<!-- Date: 2025-05-15 -->
<script setup>
import { ref, onMounted } from 'vue'
import { User, TrendCharts, Star } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getUserCountApi, getUserAvgExerciseTimeApi, getUserAvgHealthScoreApi,
  getTodayHealthCheckInCountApi, getUserCountTrendApi, getNutritionAnalysisApi,
  getThisWeekUserActivityApi, getUserAvgBmiApi } from  '@/api/analysis/analysis'
// 统计数据
const userCount = ref(0)
const avgExerciseTime = ref(0)
const avgHealthScore = ref(0)
const todayCheckInCount = ref(0)
const userTrentChartData = ref(null)
const nutritionData = ref(null)
const activityData = ref(null)
const bmiData = ref(null)
// 变化百分比
const userCountChange = ref('+0%')
const exerciseTimeChange = ref('+0%')
const healthScoreChange = ref('+0%')
const checkInCountChange = ref('+0%')

// 图表配置
const userTrendChart = ref(null)
const nutritionDistChart = ref(null)
const activityChart = ref(null)
const bmiChart = ref(null)

// 数字动画效果
const animateNumber = (target, finalValue) => {
  let current = 0
  const increment = finalValue / 60
  const timer = setInterval(() => {
    current += increment
    if (current >= finalValue) { 
      current = finalValue
      clearInterval(timer)
    }
    target.value = Math.floor(current)
  }, 30)
}

// 获取统计数据
const fetchStatsData = async () => {
    // 获取用户数量
    const userCountRes = await getUserCountApi()
    const userTotal = userCountRes.data.total
    const lastMonthUserTotal = userCountRes.data.lastMonthTotal
    
    // 获取用户日均运动时长
    const exerciseRes = await getUserAvgExerciseTimeApi()
    const exerciseTime = exerciseRes.data.dayAdvExerciseMinute
    const lastMonthExerciseTime = exerciseRes.data.lastMonthDayAdvExerciseMinute
    
    // 获取本周平均健康分数
    const healthScoreRes = await getUserAvgHealthScoreApi()
    const healthScore = healthScoreRes.data.value
    const lastWeekHealthScore = healthScoreRes.data.lastValue
    
    // 获取今日健康打卡人数
    const checkInRes = await getTodayHealthCheckInCountApi()
    const checkInCount = checkInRes.data.value
    const yesterdayCheckInCount = checkInRes.data.lastValue    // 获取用户增长趋势图表数据
    const res = await getUserCountTrendApi()
    userTrentChartData.value = res.data    // 获取营养分析数据
    const nutritionResponse = await getNutritionAnalysisApi()
    nutritionData.value = nutritionResponse.data
      // 获取本周用户活动数据
    const activityResponse = await getThisWeekUserActivityApi()
    activityData.value = activityResponse.data
    
    // 获取BMI趋势数据
    const bmiResponse = await getUserAvgBmiApi()
    bmiData.value = bmiResponse.data
    // 计算变化百分比
    const calculateChange = (current, previous) => {
      if (previous === 0) return '+0%'
      const change = ((current - previous) / previous * 100).toFixed(1)
      return change >= 0 ? `+${change}%` : `${change}%`
    }
    
    // 更新变化百分比
    userCountChange.value = calculateChange(userTotal, lastMonthUserTotal)
    exerciseTimeChange.value = calculateChange(exerciseTime, lastMonthExerciseTime)
    healthScoreChange.value = calculateChange(healthScore, lastWeekHealthScore)
    checkInCountChange.value = calculateChange(checkInCount, yesterdayCheckInCount)
    
    // 使用动画效果更新数值
    setTimeout(() => {
      animateNumber(userCount, userTotal)
      animateNumber(avgExerciseTime, Math.floor(exerciseTime))
      animateNumber(avgHealthScore, Math.floor(healthScore))
      animateNumber(todayCheckInCount, checkInCount)
    }, 500)
}

// 初始化用户趋势图表
const initUserTrendChart = () => {
  const chartDom = userTrendChart.value
  const myChart = echarts.init(chartDom)
  
  const option = {
    title: {
      text: '用户增长趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      bottom: 10,
      data: ['新增用户']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: userTrentChartData.value.xaxis
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增用户',
        type: 'line',
        smooth: true,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ])
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
            { offset: 1, color: 'rgba(118, 75, 162, 0.1)' }
          ])
        },
        data: userTrentChartData.value.yaxis
      }
    ]
  }
  
  myChart.setOption(option)
  window.addEventListener('resize', () => myChart.resize())
}

// 初始化营养分布图表
const initNutritionChart = () => {
  const chartDom = nutritionDistChart.value
  const myChart = echarts.init(chartDom)
  
  // 转换营养数据格式
  let chartData = []
  if (nutritionData.value && nutritionData.value.name && nutritionData.value.value) {
    const colors = [
      { start: '#667eea', end: '#764ba2' },
      { start: '#f093fb', end: '#f5576c' },
      { start: '#4facfe', end: '#00f2fe' },
      { start: '#43e97b', end: '#38f9d7' }
    ]
    
    chartData = nutritionData.value.name.map((name, index) => ({
      value: nutritionData.value.value[index] || 0,
      name: name,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colors[index % colors.length].start },
          { offset: 1, color: colors[index % colors.length].end }
        ])
      }
    }))
  }
  
  const option = {
    title: {
      text: '营养成分分布',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      bottom: 10,
      left: 'center'
    },
    series: [
      {
        name: '营养成分',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
      }
    ]
  }
  
  myChart.setOption(option)
  window.addEventListener('resize', () => myChart.resize())
}

// 初始化活动图表
const initActivityChart = () => {
  const chartDom = activityChart.value
  const myChart = echarts.init(chartDom)
  
  // 准备图表配置的默认值
  let seriesData = []
  let xAxisData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  
  if (activityData.value && activityData.value.series && activityData.value.xaxis) {
    xAxisData = activityData.value.xaxis
    // 创建名称映射
    const nameMapping = {
      '运动记录': '添加运动记录',
      '膳食记录': '添加食品记录',
      '健康测试': '健康测评'
    }
    
    // 定义颜色
    const colors = [
      { start: '#667eea', end: '#764ba2' },  // 添加运动记录
      { start: '#f093fb', end: '#f5576c' },  // 添加食品记录
      { start: '#43e97b', end: '#38f9d7' }   // 健康测评
    ]
    
    seriesData = activityData.value.series.map((item, index) => ({
      name: nameMapping[item.name] || item.name,
      type: 'bar',
      stack: 'total',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colors[index % colors.length].start },
          { offset: 1, color: colors[index % colors.length].end }
        ])
      },
      data: item.data
    }))
  }
  
  const option = {
    title: {
      text: '用户活动统计',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      bottom: 10,
      data: ['添加运动记录', '添加食品记录', '健康测评']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData
    },
    yAxis: {
      type: 'value'
    },
    series: seriesData
  }
  
  myChart.setOption(option)
  window.addEventListener('resize', () => myChart.resize())
}

// 初始化BMI统计图表
const initBmiChart = () => {
  const chartDom = bmiChart.value
  const myChart = echarts.init(chartDom)
  
  // 使用后端数据或默认数据
  let xAxisData = ['1月', '2月', '3月', '4月', '5月', '6月']
  let seriesData = [22.8, 23.2, 22.9, 23.5, 23.1, 22.7]
  let yAxisMin = 20
  let yAxisMax = 26
  
  if (bmiData.value && bmiData.value.xaxis && bmiData.value.yaxis) {
    xAxisData = bmiData.value.xaxis
    seriesData = bmiData.value.yaxis
    
    // 动态计算Y轴范围，确保显示所有数据
    const validData = seriesData.filter(val => val > 0)
    if (validData.length > 0) {
      const minValue = Math.min(...validData)
      const maxValue = Math.max(...validData)
      yAxisMin = Math.max(0, minValue - 2)
      yAxisMax = maxValue + 2
    }
  }
  
  const option = {
    title: {
      text: 'BMI平均值趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const value = params[0].value
        if (value === 0) {
          return `${params[0].name}<br/>BMI平均值: 暂无数据`
        }
        return `${params[0].name}<br/>BMI平均值: ${value}`
      }
    },
    legend: {
      bottom: 10,
      data: ['BMI平均值']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData
    },
    yAxis: {
      type: 'value',
      min: yAxisMin,
      max: yAxisMax,
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: 'BMI平均值',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#ff9a9e' },
            { offset: 1, color: '#fecfef' }
          ])
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 154, 158, 0.3)' },
            { offset: 1, color: 'rgba(254, 207, 239, 0.1)' }
          ])
        },
        markLine: {
          data: [
            { 
              yAxis: 18.5, 
              name: '偏瘦',
              lineStyle: { color: '#74b9ff', type: 'dashed' }
            },
            { 
              yAxis: 24, 
              name: '正常',
              lineStyle: { color: '#00b894', type: 'dashed' }
            },
            { 
              yAxis: 25, 
              name: '超重',
              lineStyle: { color: '#fdcb6e', type: 'dashed' }
            }
          ],
          label: {
            position: 'end',
            formatter: '{b}'
          }
        },
        data: seriesData
      }
    ]
  }
  
  myChart.setOption(option)
  window.addEventListener('resize', () => myChart.resize())
}

onMounted(async () => {
  // 先获取统计数据
  await fetchStatsData()
  
  // 数据获取完成后再初始化图表
  setTimeout(() => {
    initUserTrendChart()
    initNutritionChart()
    initBmiChart()
    initActivityChart()
  }, 100)
})
</script>

<template>
  <div class="dashboard-container">

    <!-- 统计卡片区域 -->
    <div class="stats-grid">
      <el-card class="stat-card user-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon :size="32"><User /></el-icon>
          </div>
          <div class="stat-info">
            <h3 class="stat-title">注册用户</h3>
            <div class="stat-number">{{ userCount.toLocaleString() }}</div>            <div class="stat-change positive">
              <el-icon><TrendCharts /></el-icon>
              <span>{{ userCountChange }} 较上月</span>
            </div>
          </div>
        </div>
      </el-card>      <el-card class="stat-card order-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon :size="32"><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <h3 class="stat-title">用户日均运动时间(分钟)</h3>
            <div class="stat-number">{{ avgExerciseTime.toLocaleString() }}</div>            <div class="stat-change positive">
              <el-icon><TrendCharts /></el-icon>
              <span>{{ exerciseTimeChange }} 较上月</span>
            </div>
          </div>
        </div>
      </el-card>      <el-card class="stat-card product-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon :size="32"><Star /></el-icon>
          </div>
          <div class="stat-info">
            <h3 class="stat-title">本周平均健康分数</h3>
            <div class="stat-number">{{ avgHealthScore.toLocaleString() }}</div>            <div class="stat-change positive">
              <el-icon><TrendCharts /></el-icon>
              <span>{{ healthScoreChange }} 较上周</span>
            </div>
          </div>
        </div>
      </el-card>      <el-card class="stat-card review-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon :size="32"><Star /></el-icon>
          </div>
          <div class="stat-info">
            <h3 class="stat-title">今日健康打卡人数</h3>
            <div class="stat-number">{{ todayCheckInCount.toLocaleString() }}</div>            <div class="stat-change positive">
              <el-icon><TrendCharts /></el-icon>
              <span>{{ checkInCountChange }} 较昨日</span>
            </div>
          </div>
        </div>
      </el-card></div>

    <!-- 图表分析区域 -->
    <div class="charts-section">
      <h2 class="section-title">数据分析</h2>
      <div class="charts-grid">
        <!-- 用户趋势图 -->
        <el-card class="chart-card" shadow="hover">
          <div ref="userTrendChart" class="chart-container"></div>
        </el-card>        <!-- 营养分布图 -->
        <el-card class="chart-card" shadow="hover">
          <div ref="nutritionDistChart" class="chart-container"></div>
        </el-card>

        <!-- BMI统计图表 -->
        <el-card class="chart-card" shadow="hover">
          <div ref="bmiChart" class="chart-container"></div>
        </el-card>

        <!-- 用户活动统计 -->
        <el-card class="chart-card full-width" shadow="hover">
          <div ref="activityChart" class="chart-container"></div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 120px);
}

/* 欢迎区域 */
.welcome-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 30px;
  color: white;
  position: relative;
  overflow: hidden;
}

.welcome-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

.welcome-content {
  flex: 1;
  z-index: 2;
}

.welcome-title {
  font-size: 2.5em;
  font-weight: 700;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.welcome-subtitle {
  font-size: 1.2em;
  opacity: 0.9;
  margin: 0;
}

.welcome-decoration {
  z-index: 2;
}

.nutrition-icon {
  width: 120px;
  height: 120px;
  animation: float 3s ease-in-out infinite;
}

.nutrition-icon .icon {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* 统计卡片区域 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: none;
  overflow: hidden;
  position: relative;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--card-color-start), var(--card-color-end));
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.user-card {
  --card-color-start: #667eea;
  --card-color-end: #764ba2;
}

.order-card {
  --card-color-start: #f093fb;
  --card-color-end: #f5576c;
}

.product-card {
  --card-color-start: #4facfe;
  --card-color-end: #00f2fe;
}

.review-card {
  --card-color-start: #43e97b;
  --card-color-end: #38f9d7;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  background: linear-gradient(135deg, var(--card-color-start), var(--card-color-end));
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.stat-number {
  font-size: 2.2em;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.stat-change {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
}

.stat-change.positive {
  color: #67c23a;
}

.stat-change .el-icon {
  margin-right: 4px;
}

/* 图表分析区域 */
.charts-section {
  margin-top: 30px;
}

.section-title {
  font-size: 1.8em;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  text-align: center;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

/* 当屏幕较小时，调整为单列布局 */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

/* 中等屏幕时显示两列 */
@media (min-width: 768px) and (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.chart-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: none;
  overflow: hidden;
}

.chart-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-container {
  width: 100%;
  height: 350px;
  padding: 10px;
}

/* 快速操作区域 */
.quick-actions {
  margin-top: 30px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 15px;
  }
  
  .welcome-section {
    flex-direction: column;
    text-align: center;
    padding: 30px 20px;
  }
  
  .welcome-title {
    font-size: 2em;
  }
  
  .nutrition-icon {
    width: 80px;
    height: 80px;
    margin-top: 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .stat-content {
    padding: 15px;
  }
  
  .stat-number {
    font-size: 1.8em;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .chart-container {
    height: 300px;
  }
}
</style>