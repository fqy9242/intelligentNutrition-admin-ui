import request from '@/utils/request'
// 获取注册用户数量
export const getUserCountApi = () => {
    return request({
      url: "/admin/analysis/countUser",
    });
}