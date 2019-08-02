<template>
	<div id="register-poster-container">
		<img :src="canvasLink" alt id="img" />
		<div class="text-alert">长按图片保存到手机，然后发送至微信群</div>
		<!-- invite qrcode html -->
		<div ref="invite" id="invite">
			<!-- 背景图一定要使用 img标签 -->
			<img src alt />
			<p class="invite-title">
				<span class="school-name">{{ name }}</span>追随者们:
			</p>
			<div class="qr-container">
				<div class="qr-left">
					<p class="text-one">现在加入</p>
					<p class="text-two">长按识别二维码</p>
				</div>
				<div class="qr-right">
					<qrcode :value="inviteRegisterLink" :options="{ width: 106 }" v-if="inviteRegisterLink !== ''"></qrcode>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import VueQrcode from "@chenfengyuan/vue-qrcode";
import html2canvas from "html2canvas";

export default {
	name: "Poster",
	data() {
		return {
			// 邀请加入
			name: "BlackCyan",
			inviteFlag: false,
			inviteRegisterLink: "inviteRegisterLink",
			canvasLink: ""
		};
	},
	components: {
		[VueQrcode.name]: VueQrcode
	},
	methods: {
		// base64转 file
		dataURLtoFile(dataurl, filename = "file") {
			let arr = dataurl.split(",");
			let mime = arr[0].match(/:(.*?);/)[1];
			let suffix = mime.split("/")[1];
			let bstr = atob(arr[1]);
			let n = bstr.length;
			let u8arr = new Uint8Array(n);
			while (n--) {
				u8arr[n] = bstr.charCodeAt(n);
			}
			return new File([u8arr], `${filename}.${suffix}`, { type: mime });
		},
		buildCanvasLink() {
			this.$nextTick(() => {
				var cntElem = document.getElementById("invite");
				var shareContent = cntElem; //需要截图的包裹的（原生的）DOM 对象
				var width = shareContent.offsetWidth; //获取dom 宽度
				var height = shareContent.offsetHeight; //获取dom 高度
				var canvas = document.createElement("canvas"); //创建一个canvas节点
				var scale = 3; //定义任意放大倍数 支持小数
				canvas.width = width * scale; //定义canvas 宽度 * 缩放
				canvas.height = height * scale; //定义canvas高度 *缩放
				canvas.getContext("2d").scale(scale, scale); //获取context,设置scale
				var opts = {
					scale: scale, // 添加的scale 参数
					canvas: canvas, // 自定义 canvas
					width: width, // dom 原始宽度
					height: height,
					useCORS: true // 【重要】开启跨域配置
				};

				html2canvas(shareContent, opts).then(canvas => {
					var context = canvas.getContext("2d");
					// 【重要】关闭抗锯齿
					context.mozImageSmoothingEnabled = false;
					context.webkitImageSmoothingEnabled = false;
					context.msImageSmoothingEnabled = false;
					context.imageSmoothingEnabled = false;
					// 【重要】默认转化的格式为 png,也可设置为其他格式

					this.canvasLink = this.dataURLtoFile(
						canvas.toDataURL("image/jpeg", 0.7),
						`invite/${this.inviteId}`
					);
					// 必须上传至 服务器
					fileUploade(
						this.canvasLink,
						url => {
							console.log(url);
							this.canvasLink = url;
						},
						true
					);
				});
				// html2canvas(this.$refs.invite).then((canvas) => {
				//   this.canvasLink = URL.createObjectURL(this.dataURLtoFile(canvas.toDataURL("image/jpeg", 0.7)))
				// })
			});
		}
	},
	created() {
		if (this.$route.query.link && this.$route.query.name) {
			this.inviteRegisterLink = this.$route.query.link;
			this.name = this.$route.query.name;
		}
		this.buildCanvasLink();
	}
};
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