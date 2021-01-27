const { remote, ipcRenderer } = require('electron');
const path = require("path");
const fs = require("fs");
var $ = require('jquery');

var FastWebView = {
    initUrl: '',
    lastUrl: '',
    init: function() {
        let _this = this;
        // 获取到对应的webview 
        var webview = $('#browser');
        webview.on('dom-ready', function () {
            // 当页面载入完成，更新toolbar
            webview.show();
        });
        webview.on('did-start-loading', function () {
            // 更新进度条以及刷新按钮变为loading的图示，表示载入中
            _this.startLoading();
        });
        webview.on('did-stop-loading', function () {
            // 停止加载显示
            _this.stopLoading();
        });
        webview.on('did-stop-loading', function () {
            // 停止加载显示
            _this.stopLoading();
        });
        webview[0].addEventListener('did-navigate', (res) => {
            _this.lastUrl = webview.attr("src")
        });
		// 网页打开新窗口操作
        webview[0].addEventListener('new-window', (e) => {
            let url = e.url;
            if(url&&url.length>0) {
                if(url.startsWith("http://")||url.startsWith("https://")) {
                    webview.attr("src", url)
                }
            }
        });
		// 右上角关闭、最大化、最小化操作
        $("#minWindowNav").click(function(){
            ipcRenderer.send('window-action', 'min')
        });
        $("#maxWindowNav").click(function(){
            ipcRenderer.send('window-action', 'max')
        });
        $("#resetWindowNav").click(function(){
            ipcRenderer.send('window-action', 'max')
        });
        $("#closeWindowNav").click(function(){
           ipcRenderer.send('window-action', 'close')
        });
        $("#refreshWindowNav").click(function(){
            if(_this.lastUrl&&_this.lastUrl.length>0) {
                _this.jumpUrl(_this.lastUrl)
            } else {
                _this.jumpUrl(_this.initUrl)
            }
        });
		// 监听主界面发送指令
		ipcRenderer.on('jumpHomeUrl', (event, message) => {
		    _this.jumpHomeUrl();
		});
		ipcRenderer.on('maximize', (event, message) => {
			$("#maxWindowNav").hide();
			$("#resetWindowNav").show();
		});
		ipcRenderer.on('unmaximize', (event, message) => {
		    $("#maxWindowNav").show();
		    $("#resetWindowNav").hide();
		});
        _this.jumpHomeUrl();
    },
    readConfigFile: function(callback) {
        let _this = this;
        let configFilePath = path.join(__dirname, '../config.json')
        fs.exists(configFilePath, function (exists) {
            if (exists) {
              //读取本地的json文件
              let result = $.parseJSON(fs.readFileSync(configFilePath));
              if(result) {
                  _this.initUrl = result.initUrl;
                  (callback && typeof(callback) === "function") && callback();
              }
            }
        })
    },
    startLoading: function() {
        $("#refreshImage").addClass("refresh-loading");
    },
    stopLoading: function() {
        $("#refreshImage").removeClass("refresh-loading");
    },
    jumpHomeUrl: function() {
        this.jumpUrl(this.initUrl);
    },
    jumpUrl: function(url) {
        $('#browser').attr("src", url)
    }
}
// 加载配置文件
FastWebView.readConfigFile(function(){
    FastWebView.init()
});