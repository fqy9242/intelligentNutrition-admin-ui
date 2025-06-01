import request from '@/utils/request'

// 查询app注册用户列表
export function listAppUser(query) {
  return request({
    url: '/intelligentNutrition-appUser/appUser/list',
    method: 'get',
    params: query
  })
}

// 查询app注册用户详细
export function getAppUser(id) {
  return request({
    url: '/intelligentNutrition-appUser/appUser/' + id,
    method: 'get'
  })
}

// 新增app注册用户
export function addAppUser(data) {
  return request({
    url: '/intelligentNutrition-appUser/appUser',
    method: 'post',
    data: data
  })
}

// 修改app注册用户
export function updateAppUser(data) {
  return request({
    url: '/intelligentNutrition-appUser/appUser',
    method: 'put',
    data: data
  })
}

// 删除app注册用户
export function delAppUser(id) {
  return request({
    url: '/intelligentNutrition-appUser/appUser/' + id,
    method: 'delete'
  })
}
// 下载批量导入用户模板
export const downloadInputTemplate = () => {
  return request({
    url: "/intelligentNutrition-appUser/appUser/exportInputUserTemplate",
    method: "get",
    responseType: "blob",
  });
}
// 解析批量导入用户
export const parseInputUser = (excelFile) => {
  const formData = new FormData();
  formData.append("excelFile", excelFile);
  return request({
    url: "/intelligentNutrition-appUser/appUser/parseExcelToAppUserList",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
// 批量导入用户
export const addBatch = (data) => {
  return request({
    url: "/intelligentNutrition-appUser/appUser/addBatch",
    method: "post",
    data: data,
  });
}