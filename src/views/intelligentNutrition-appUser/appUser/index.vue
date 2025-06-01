<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="学号" prop="studentNumber">
        <el-input v-model="queryParams.studentNumber" placeholder="请输入学号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入姓名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="身高" prop="height">
        <el-input v-model="queryParams.height" placeholder="请输入身高" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="体重" prop="weight">
        <el-input v-model="queryParams.weight" placeholder="请输入体重" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['intelligentNutrition-appUser:appUser:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['intelligentNutrition-appUser:appUser:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['intelligentNutrition-appUser:appUser:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['intelligentNutrition-appUser:appUser:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Upload" @click="handleImport">导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Download" @click="handleDownloadTemplate">下载导入模板</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="appUserList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="${comment}" align="center" prop="id" /> -->
      <el-table-column label="学号" align="center" prop="studentNumber" />
      <el-table-column label="姓名" align="center" prop="name" />
      <el-table-column label="头像" align="center" prop="avatar" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.avatar" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="身高(cm)" align="center" prop="height" />
      <el-table-column label="体重(kg)" align="center" prop="weight" />
      <el-table-column label="过敏原" align="center" prop="allergenList">
        <template #default="scope">
          <span v-if="scope.row.allergenList && scope.row.allergenList.length">
            {{scope.row.allergenList.map(item => item.allergen).join(',')}}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['intelligentNutrition-appUser:appUser:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['intelligentNutrition-appUser:appUser:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改app注册用户对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="appUserRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="学号" prop="studentNumber">
          <el-input v-model="form.studentNumber" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入登录密码" />
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <image-upload v-model="form.avatar" />
        </el-form-item>
        <el-form-item label="身高" prop="height">
          <el-input v-model="form.height" placeholder="请输入身高" />
        </el-form-item>
        <el-form-item label="体重" prop="weight">
          <el-input v-model="form.weight" placeholder="请输入体重" />
        </el-form-item>
        <el-divider content-position="center">过敏原信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddAllergen">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteAllergen">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="allergenList" :row-class-name="rowAllergenIndex"
          @selection-change="handleAllergenSelectionChange" ref="allergen">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50" />
          <el-table-column label="过敏源" prop="allergen" width="350">
            <template #default="scope">
              <el-input v-model="scope.row.allergen" placeholder="请输入过敏源" />
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="AppUser">
import { listAppUser, getAppUser, delAppUser, addAppUser, updateAppUser, downloadInputTemplate } from "@/api/intelligentNutrition-appUser/appUser"

const { proxy } = getCurrentInstance()

const appUserList = ref([])
const allergenList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const checkedAllergen = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
// 导入按钮被单击
const handleImport = () => {
  // TODO 能够选择文件并导入
}
const handleDownloadTemplate = () => {
  downloadInputTemplate().then(response => {
    // 创建下载链接，response 直接就是 blob 数据
    const blob = new Blob([response], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `app_user_template_${new Date().getTime()}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    proxy.$modal.msgSuccess("模板下载成功")
  })
}


const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    studentNumber: null,
    name: null,
    avatar: null,
    height: null,
    weight: null,
  },
  rules: {
    studentNumber: [
      { required: true, message: "学号不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "姓名不能为空", trigger: "blur" }
    ],
    avatar: [
      { required: true, message: "头像不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询app注册用户列表 */
function getList() {
  loading.value = true
  listAppUser(queryParams.value).then(response => {
    appUserList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    studentNumber: null,
    name: null,
    password: null,
    avatar: null,
    height: null,
    weight: null,
    createTime: null,
    updateTime: null
  }
  allergenList.value = []
  proxy.resetForm("appUserRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加app注册用户"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getAppUser(_id).then(response => {
    form.value = response.data
    allergenList.value = response.data.allergenList
    open.value = true
    title.value = "修改app注册用户"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["appUserRef"].validate(valid => {
    if (valid) {
      form.value.allergenList = allergenList.value.map(item => {
        return { allergen: item.allergen }
      })
      if (form.value.id != null) {
        updateAppUser(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addAppUser(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除app注册用户编号为"' + _ids + '"的数据项？').then(function() {
    return delAppUser(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 过敏原序号 */
function rowAllergenIndex({ row, rowIndex }) {
  row.index = rowIndex + 1
}

/** 过敏原添加按钮操作 */
function handleAddAllergen() {
  let obj = {}
  obj.allergen = ""
  allergenList.value.push(obj)
}

/** 过敏原删除按钮操作 */
function handleDeleteAllergen() {
  if (checkedAllergen.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的过敏原数据")
  } else {
    const allergens = allergenList.value
    const checkedAllergens = checkedAllergen.value
    allergenList.value = allergens.filter(function(item) {
      return checkedAllergens.indexOf(item.index) == -1
    })
  }
}

/** 复选框选中数据 */
function handleAllergenSelectionChange(selection) {
  checkedAllergen.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('intelligentNutrition-appUser/appUser/export', {
    ...queryParams.value
  }, `appUser_${new Date().getTime()}.xlsx`)
}

getList()
</script>
