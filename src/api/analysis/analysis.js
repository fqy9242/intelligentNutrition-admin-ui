import request from '@/utils/request'
// 获取注册用户数量
export const getUserCountApi = () => {
    return request({
      url: "/admin/analysis/countUser",
    });
}
// 统计用户日均运动时长(分钟)
export const getUserAvgExerciseTimeApi = () => {
    return request({
      url: "/admin/analysis/advantageExerciseForDay"
    })
}
// 用户本周平均健康分数
export const getUserAvgHealthScoreApi = () => {
  return request({
    url: "/admin/analysis/thisWeekAdvHealthScore"
  });
}
// 统计今日健康打卡人数
export const getTodayHealthCheckInCountApi = () => {
  return request({
    url: "/admin/analysis/countTodayHealthCheckIn"
  })
}