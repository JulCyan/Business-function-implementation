// FileReader共有4种读取方法：
// 1.readAsArrayBuffer(file)：将文件读取为ArrayBuffer。
// 2.readAsBinaryString(file)：将文件读取为二进制字符串
// 3.readAsDataURL(file)：将文件读取为Data URL
// 4.readAsText(file, [encoding])：将文件读取为文本，encoding缺省值为'UTF-8'

var wb;//读取完成的数据
var aa = [];
var text = [];
var rABS = false; //是否将文件读取为二进制字符串

function importExcel(obj) {//导入
    if (!obj.files) {
        return;
    }
    const IMPORTFILE_MAXSIZE = 1 * 2048;//这里可以自定义控制导入文件大小
    var suffix = obj.files[0].name.split(".")[1];
    if (suffix != 'xls' && suffix != 'xlsx') {
        alert('导入的文件格式不正确!');
        return
    }
    if (obj.files[0].size / 1024 > IMPORTFILE_MAXSIZE) {
        alert('导入的表格文件不能大于2M');
        return
    }
    var f = obj.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        var data = e.target.result;
        if (rABS) {
            wb = XLSX.read(btoa(fixdata(data)), {//手动转化
                type: 'base64'
            });
        } else {
            wb = XLSX.read(data, {
                type: 'binary'
            });
        }
        //wb.SheetNames[0]是获取Sheets中第一个Sheet的名字
        //wb.Sheets[Sheet名]获取第一个Sheet的数据
        aa = JSON.stringify(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]));
        // console.log(aa);
        //  这里的aa就是我想要的json数组
        var u = eval('(' + aa + ')');
        //  将json数组显示到div的innerHTML中
        document.getElementById("output").innerHTML = JSON.stringify(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]));

        //获取表格中为address的那列存入text中
        for (var i = 0; i < u.length; i++) {
            text.push(u[i].address);
        }
    };
    if (rABS) {
        reader.readAsArrayBuffer(f);
    } else {
        reader.readAsBinaryString(f);
        // reader.readAsText(f, "UTF-8")
    }
}