<template>
  <div id="import-excel-container">
    <main v-if="importFlag" :class="{'mbatch-main': true, 'import-finsh': importFlag}">
      <el-table
          :data="excelList"
          style="width: 100%"
          class="excel-table">
        <el-table-column
            label="姓名"
            width="200">
          <template v-slot:default="{ row: info }">
            <el-input
                v-model="editInfo.name"
                class="table-input"
                v-if="info.editFlag"
                maxlength="11"
                size="mini"></el-input>
            <span style="margin-left: 10px" v-else>{{ info.name }}</span>
          </template>
        </el-table-column>

        <el-table-column
            label="手机号码"
            width="320">
          <template v-slot:default="{ row: info }">
            <el-input
                v-model="editInfo.phone"
                class="table-input"
                v-if="info.editFlag"
                size="mini"
                maxlength="11"
                style="width: 50%"></el-input>
            <span style="margin-left: 10px" v-else>{{ info.phone }}</span>
            <span v-show="!/^1[3|4|5|7|8][0-9]\d{8}$/.test(info.phone) && !info.editFlag"
                  style="float: right;color: #F56C6C;"><i
                class="el-icon-warning" style="margin-right: 10px"></i>手机号格式有误，请修改</span>
          </template>
        </el-table-column>


        <el-table-column
            label="操作">
          <template v-slot:default="{ row: info, $index: index }" class="table-edit">
            <i class="el-icon-edit-outline table-btn-edit" @click="editOne(index)" v-if="!info.editFlag"></i>
            <el-button type="primary" v-else class="import-edit-btn" @click="editConfirm(index)">确定</el-button>
            <i class="el-icon-delete table-btn-edit" @click="deleteOne(index)" v-if="!info.editFlag"></i>
            <el-button v-else class="import-edit-btn" style="background-color: rgba(204,204,204,1);color: #fff;"
                       @click="editCancel(index)">取消
            </el-button>

          </template>
        </el-table-column>
      </el-table>

      <div class="import-btn">
        <el-button plain class="btn-back" @click.stop="handleBack">上一步</el-button>
        <el-button type="primary" class="btn-confirm" @click.stop="handleConfirm">开始添加</el-button>
      </div>
    </main>

    <main v-else class="mbatch-main" v-loading.fullscreen="loadingFlag">
      <section class="mbatch-download">
        <p class="download-text">初次导入请先下载模板，然后将信息填入模板中</p>
        <el-button type="primary" plain class="download-btn"><a
            href="/template.xlsx"
            download="批量添加账号模板.xlsx">下载模板</a></el-button>
      </section>

      <section class="mbatch-import-undone">
        <el-button type="primary" class="undone-btn" @click="importInfo">导入信息</el-button>
        <input type="file" @change="fileChange" style="display: none;" ref="file">
      </section>

    </main>

    <!-- 添加成功 -->
    <el-dialog
        :visible.sync="finishFlag"
        width="480px"
        center
        class="dialog-success">
      <div class="success-content">
        <i class="el-icon-success success-icon" style="color: green;border: none"></i>
        <p class="success-text text-first">添加完成</p>
        <p class="success-text text-second">成功添加{{ successNum }}条, 失败{{ rejectNum }}条</p>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="" class="success-btn" plain>返回列表</el-button>
  </span>
    </el-dialog>
    <!-- 上传 loading-->
    <div class="my-loading" v-if="addFlag">
      <div class="loading-content">
        <p class="loading-top"><i class="el-icon-loading"></i></p>
        <p class="loading-bottom"><span>正在添加&nbsp{{ addNum }}/{{ this.excelList.length }}</span></p>
      </div>
    </div>

    <!-- 删除提示 -->
    <el-dialog
        :visible.sync="deleteFlag"
        width="480px"
        center
        class="dialog-delete">
      <div class="success-content">
        <i class="el-icon-warning success-icon"></i>
        <p class="success-text text-first">确定要删除吗?</p>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="deleteConfirm" class="success-btn" style="width: 120px"
               size="small">删除</el-button>
    <el-button type="primary" @click="deleteFlag = false" class="success-btn" plain style="width: 120px;color: #409EFF;"
               size="small">取消</el-button>
  </span>
    </el-dialog>

  </div>
</template>

<script>
  import XLSX from 'xlsx'

  export default {
    name: 'ImportExcel',
    data() {
      return {
        // Flag
        // 是否上传 Excel
        importFlag: false,
        // loadingFlag
        loadingFlag: false,
        // 是否进入编辑状态
        editFlag: false,
        // 添加完成
        finishFlag: false,
        // 删除提示
        deleteFlag: false,
        // 当前删除索引
        deleteIndex: null,
        // 添加进度
        addNum: 0,
        successNum: 0,
        rejectNum: 0,
        // 添加中 flag
        addFlag: false,
        // 读取完成的数据
        wb: null,
        aa: [],
        text: [],
        // 是否将文件读取为二进制字符串
        rABS: false,
        // 保存解析Excel完成的 JSON数据
        excelJSON: [],
        // 表格数据
        excelList: [],
        // 学科列表
        subjectList: [
          {
            value: '0',
            label: '语文'
          },
          {
            value: '1',
            label: '数学'
          }],
        // 年级列表
        gradeList: [
          {
            value: '0',
            label: '高中'
          },
          {
            value: '1',
            label: '初中'
          }],
        // 当前学科
        currentSubject: '',
        // 当前年级
        currentGrade: '',
        // 当前修改数据
        editInfo: {}
      }
    },
    methods: {
      // 导入 Excel
      importInfo() {
        this.$refs.file.click()
      },
      fileChange(event) {
        console.log(FileReader.prototype.readAsBinaryString);
        if (!FileReader.prototype.readAsBinaryString) {
          this.parseExcelIE(event.target)
        } else {
          this.parseExcel(event.target)
        }
      },
      // 解析 Excel
      parseExcel(obj) {//导入
        if (!obj.files) {
          return;
        }
        const IMPORTFILE_MAXSIZE = 1 * 2048;//这里可以自定义控制导入文件大小
        let suffix = obj.files[0].name.split(".")[1];
        if (suffix != 'xls' && suffix != 'xlsx') {
          this.$message({
            type: 'error',
            message: '导入文件格式错误'
          })
          return
        }
        if (obj.files[0].size / 1024 > IMPORTFILE_MAXSIZE) {
          this.$message({
            type: 'warning',
            message: '导入的表格文件不能大于2M'
          })
          return
        }
        let that = this
        that.loadingFlag = true
        let f = obj.files[0];

        let reader = new FileReader()
        reader.onload = function (e) {
          let data = e.target.result;
          if (this.rABS) {
            this.wb = XLSX.read(btoa(fixdata(data)), {//手动转化
              type: 'base64'
            });
          } else {
            this.wb = XLSX.read(data, {
              type: 'binary'
            })
          }
          //wb.SheetNames[0]是获取Sheets中第一个Sheet的名字
          //wb.Sheets[Sheet名]获取第一个Sheet的数据
          this.aa = JSON.stringify(XLSX.utils.sheet_to_json(this.wb.Sheets[this.wb.SheetNames[0]]));
          // console.log(this.aa);
          //  这里的this.aa就是我想要的json数组
          var u = eval('(' + this.aa + ')')
          that.excelJSON = XLSX.utils.sheet_to_json(this.wb.Sheets[this.wb.SheetNames[0]])
          console.log(that.excelJSON)
          setTimeout(() => {
            that.loadingFlag = false
          }, 0)
          //获取表格中为address的那列存入this.text中
          // for (var i = 0; i < u.length; i++) {
          // this.text.push(u[i].address);
          // }
        };
        if (this.rABS) {
          reader.readAsArrayBuffer(f)
        } else {
          reader.readAsBinaryString(f)
          // reader.readAstext(f, "UTF-8")
        }
      },
      // ie 11解析 excel
      parseExcelIE(obj) {
        if (!obj.files) {
          return;
        }
        const IMPORTFILE_MAXSIZE = 1 * 2048;//这里可以自定义控制导入文件大小
        let suffix = obj.files[0].name.split(".")[1];
        if (suffix != 'xls' && suffix != 'xlsx') {
          this.$message({
            type: 'error',
            message: '导入文件格式错误'
          })
          return
        }
        if (obj.files[0].size / 1024 > IMPORTFILE_MAXSIZE) {
          this.$message({
            type: 'warning',
            message: '导入的表格文件不能大于2M'
          })
          return
        }
        let that = this
        that.loadingFlag = true
        FileReader.prototype.readAsBinaryString = function (fileData) {
          var binary = "";
          var pt = this;
          var reader = new FileReader();
          reader.onload = function (e) {
            var bytes = new Uint8Array(reader.result);
            var length = bytes.byteLength;
            for (var i = 0; i < length; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            pt.content = binary;
            pt.onload(pt); //页面内data取pt.content文件内容
          }
          reader.readAsArrayBuffer(fileData);
        }
        var file = obj.files[0];
        var reader = new FileReader();
        var strArr = [];
        var wb;
        var rABS = false;
        reader.onload = function (data) {
          var data = data.content;
          if (rABS) {
            wb = XLSX.read(btoa(this.fixdata(data)), { //手动转化
              type: 'base64'
            });
          } else {
            wb = XLSX.read(data, {
              type: 'binary'
            });
          }
          //wb.SheetNames[0]是获取Sheets中第一个Sheet的名字
          //wb.Sheets[Sheet名]获取第一个Sheet的数据
          var tempArr = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
          console.log(tempArr);
          that.excelJSON = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
          console.log(that.excelJSON)
          setTimeout(() => {
            that.loadingFlag = false
            setTimeout(() => {
              FileReader.prototype.readAsBinaryString = undefined
            }, 3000)
          }, 0)
        };
        if (rABS) {
          reader.readAsArrayBuffer(file);
        } else {
          reader.readAsBinaryString(file);
        }
      },
      // 删除一行
      deleteOne(index) {
        this.deleteIndex = index
        this.deleteFlag = true
      },
      // 确认删除
      deleteConfirm() {
        this.excelList.splice(this.deleteIndex, 1)
        this.deleteFlag = false
      },
      // 编辑一行
      editOne(index) {
        console.log(1);
        this.excelList.forEach(i => {
          i.editFlag = false
        })
        this.excelList[index].editFlag = true
        this.editInfo = JSON.parse(JSON.stringify(this.excelList[index]))
      },
      // 返回上一步
      handleBack() {
        this.excelJSON = this.excelList = []
        this.addNum = this.rejectNum = this.successNum = 0
        setTimeout(() => {
          this.importFlag = false
        }, 0)
        FileReader.prototype.readAsBinaryString = undefined
      },
      // 确定
      handleConfirm() {
        if (this.excelList.length === 0) {
          return false
        }
        let newList = this.excelList.map(item => {
          return {
            name: item.name,
            phone: item.phone
          }
        })
        console.dir(newList)
        let group_id = this.$tools.getSto('group_id')
        let token = this.$tools.getSto('token')
        this.addFlag = true

        newList.forEach((item, index) => {

          let xhr = new XMLHttpRequest();        //创建xhr对象--隶属XML
          xhr.onreadystatechange = () => {  //事件监听请求执行到哪一步
            // console.log(xhr.status)
            //响应成功
            if (xhr.readyState === 4 && xhr.status === 200) {
              this.addNum += 1
              this.successNum += 1
              //响应失败
            } else if (xhr.readyState === 4 && xhr.status === 409 || xhr.readyState === 4 && xhr.status === 400) {
              this.rejectNum += 1
              this.addNum += 1
            } else if (xhr.readyState === 4) {
              this.addNum += 1
            }
            console.log(this.addNum);
            console.log(this.excelList.length);
            if (this.addNum === this.excelList.length) {
              this.addFlag = false
              setTimeout(() => {
                this.finishFlag = true
                this.excelList = this.excelList = []
              }, 500)
            }
          }
          // 添加至接口地址
          xhr.open("post", ``)
          xhr.setRequestHeader("Content-Type", "application/json")
          xhr.send(JSON.stringify(item))
        })
      },
      // 取消点击事件
      editCancel(index) {
        this.excelList[index].editFlag = false
      },
      // 确定点击事件
      editConfirm(index) {
        this.excelList[index] = this.editInfo
        this.excelList[index].editFlag = false
      }
    },
    watch: {
      loadingFlag: {
        handler: function (val) {
        }
      },
      excelJSON: {
        deep: true,
        handler: function () {
          this.importFlag = true
          let tempList = []
          this.excelJSON.forEach(i => {
            console.log(Boolean(i['手机号']));
            // 有效数据的依据
            if (Boolean(i['手机号'])) {
              let item = {}
              item.editFlag = false
              // 从 excelList 中提取有效数据
              item.name = i['姓名']
              item.phone = i['手机号']
              tempList.push(item)
            } else {
            }
          })
          console.log(tempList)
          this.excelList = [...new Set(tempList)]
        }
      }
    }
  }

</script>

<style scoped lang="less">

  #import-excel-container {
    width: 1200px;
    font: 400 14px/14px PingFangSC-Regular;

    .excel-table {

      .table-btn-edit {
        padding: 12px 10px;
        font-size: 18px;
        line-height: 23px;
      }

      .el-table .cell {
        text-align: center !important;
      }

    }

    .mbatch-main {
      padding: 40px 200px 30px;
      background: rgba(255, 255, 255, 1);

      .mbatch-download {
        padding: 0 20px 0 15px;
        margin-bottom: 20px;
        height: 60px;
        background: rgba(242, 242, 242, 1);
        border-radius: 4px;

        .download-text {
          float: left;
          color: rgba(76, 76, 76, 1);
          line-height: 60px;
        }

        .download-btn {
          float: right;
          margin-top: 10px;
          color: #409EFF;
          background-color: #fff;
        }
      }

      .import-btn {
        display: flex;
        padding-top: 20px;
        justify-content: center;

        .btn-back {
          width: 140px;
          height: 40px;
          border-radius: 4px;
          border: 1px solid rgba(204, 204, 204, 1);
        }

        .btn-confirm {
          width: 140px;
          height: 40px;
          border-radius: 4px;
          border: 1px solid rgba(204, 204, 204, 1);
        }
      }

      .import-edit-btn {
        padding: 0;
        width: 50px;
        height: 40px;
        background: rgba(35, 184, 255, 1);
        border-radius: 2px;
        text-align: center;
      }
    }

    .import-finsh {
      padding: 20px 100px;
    }

    .mbatch-import-undone {
      padding: 66px 290px;
      margin-bottom: 20px;
      width: 799px;
      border: 1px solid rgba(242, 242, 242, 1);

      .undone-btn {
        display: block;
        margin: 0 auto;
        margin-bottom: 18px;
        width: 160px;
        height: 52px;
        background: rgba(35, 184, 255, 1);
        border-radius: 4px;
      }

      .undone-text {
        text-align: center;
        color: rgba(128, 128, 128, 1);
        line-height: 20px;
      }
    }


    // 添加成功
    .dialog-success {

      .success-content {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;

        .success-icon {
          display: block;
          font-size: 40px;
          text-align: center;
          color: #23B8FF;
          border: 2px solid #23B8FF;
          border-radius: 50%;
        }

        .success-text {
          width: 100%;
          text-align: center;

        }

        .text-first {
          margin: 20px 0;
          font-size: 18px;
          text-align: center;
          color: #000000;
        }
      }

      .success-btn {
        color: #409EFF;
      }
    }

    .my-loading {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, .5);
      z-index: 99;

      .loading-content {
        position: absolute;
        width: 200px;
        height: 100px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        .loading-top {
          width: 100%;
          text-align: center;
          color: white !important;
          font-size: 30px;
        }

        .loading-bottom {
          width: 100%;
          text-align: center;
          margin-top: 10px;

          span {
            margin: 0 auto;
            display: block;
            color: #fff;
            font-size: 18px;
            line-height: 20px;
          }
        }
      }
    }
  }

  .el-button--primary.is-plain {
    background: #fff;
  }

  // 删除
  .dialog-delete {

    .success-content {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;

      .success-icon {
        display: block;
        font-size: 40px;
        text-align: center;
        color: #f99c3b;
        border: 2px solid #f99c3b;
        border-radius: 50%;
      }

      .success-text {
        width: 100%;
        text-align: center;

      }

      .text-first {
        margin: 20px 0;
        font-size: 18px;
        text-align: center;
        color: #000000;
      }
    }

    .success-btn {

    }
  }
</style>