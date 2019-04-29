<template>
  <div id="register-poster-container">
    <img :src="canvasLink" alt="" id="img">
    <div class="text-alert">长按图片保存到手机，然后发送至微信群</div>
    <!-- invite qrcode html -->
    <div ref="invite" id="invite">
      <p class="invite-title"><span class="school-name">{{ name }}</span>追随者们:</p>
      <div class="qr-container">
        <div class="qr-left">
          <p class="text-one">现在加入</p>
          <p class="text-two">长按识别二维码</p>
        </div>
        <div class="qr-right">
          <qrcode
              :value="inviteRegisterLink"
              :options="{ width: 106 }"
              v-if="inviteRegisterLink !== ''"
          ></qrcode>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import VueQrcode from "@chenfengyuan/vue-qrcode";
  import html2canvas from 'html2canvas';

  export default {
    name: "Poster",
    data() {
      return {
        // 邀请加入
        name: 'BlackCyan',
        inviteFlag: false,
        inviteRegisterLink: 'inviteRegisterLink',
        canvasLink: ''
      }
    },
    components: {
      [VueQrcode.name]: VueQrcode
    },
    methods: {
      // base64转 file
      dataURLtoFile(dataurl, filename = 'file') {
        let arr = dataurl.split(',')
        let mime = arr[0].match(/:(.*?);/)[1]
        let suffix = mime.split('/')[1]
        let bstr = atob(arr[1])
        let n = bstr.length
        let u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        return new File([u8arr], `${filename}.${suffix}`, {type: mime})
      },
      buildCanvasLink() {
        this.$nextTick(() => {
          html2canvas(this.$refs.invite).then((canvas) => {
            this.canvasLink = URL.createObjectURL(this.dataURLtoFile(canvas.toDataURL()))
          })
        })
      }
    },
    created() {
      if (this.$route.query.link && this.$route.query.name) {
        this.inviteRegisterLink = this.$route.query.link
        this.name = this.$route.query.name
      }
      this.buildCanvasLink()
    }
  }
</script>

<style scoped lang="less">
  #register-poster-container {
    width: 100vw;
    height: 100vh;
    background-color: #fff;

    #img {
      width: 100vw;
      height: 99vh;
    }

    #invite {
      position: absolute;
      width: 375px;
      height: 667px;
      top: -9999px;
      background: url(../assets/img/invite.png);
      background-size: 375px 525px;
      background-repeat: no-repeat;

      .invite-title {
        color: #fff;
        margin: 80px 0 0 26px;
        font-size: 14px;
        line-height: 24px;
        height: 24px;

        .school-name {
          display: inline-block;
          margin-right: 3px;
          padding: 0 6px;
          height: 24px;
          background: rgba(81, 174, 229);
          border-radius: 2px;
        }
      }

      .qr-container {
        position: absolute;
        bottom: 0;
        padding-left: 26px;
        height: 142px;
        width: 100%;
        background-color: #fff;

        .qr-left {
          float: left;
          margin-top: 40px;
          width: 180px;
          font-size: 24px;
          line-height: 36px;
          letter-spacing: 1px;

          .text-one {
            color: rgba(0, 0, 0, 1);
          }

          .text-two {
            color: #999;
          }
        }

        .qr-right {
          margin-top: 20px;
          margin-right: 10px;
          float: right;
          width: 106px;
          height: 106px;
        }
      }
    }

    .text-alert {
      position: fixed;
      left: 50%;
      transform: translateX(-50%);
      bottom: 10px;
      width: 90vw;
      height: 40px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 2px;
      font-size: 14px;
      font-weight: 500;
      text-align: center;
      color: rgba(255, 255, 255, 1);
      line-height: 40px;
    }
  }
</style>