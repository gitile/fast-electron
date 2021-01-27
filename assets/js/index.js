const { remote, ipcRenderer } = require('electron');
const path = require("path");
const fs = require("fs");
var $ = require('jquery');

var FastWebView = {
	initUrl: '',
	lastUrl: '',
	isMax: false,
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
		webview[0].addEventListener('new-window', (e) => {
			let url = e.url;
			if(url&&url.length>0) {
				if(url.startsWith("http://")||url.startsWith("https://")) {
					webview.attr("src", url)
				}
			}
		});
		$("#minWindowNav").click(function(){
			_this.min()
		});
		$("#maxWindowNav").click(function(){
			_this.isMax = true
			_this.max()
			$("#maxWindowNav").hide();
			$("#resetWindowNav").show();
		});
		$("#resetWindowNav").click(function(){
			_this.isMax = false
			_this.reset()
			$("#maxWindowNav").show();
			$("#resetWindowNav").hide();
		});
		$("#closeWindowNav").click(function(){
			_this.close()
		});
		$("#refreshWindowNav").click(function(){
			if(_this.lastUrl&&_this.lastUrl.length>0) {
				_this.setUrl(_this.lastUrl)
			} else {
				_this.setUrl(_this.initUrl)
			}
		});
		$("#homeWindowNav").click(function(){
			_this.homeUrl()
		});
		_this.readConfigFile(function(){
			_this.homeUrl();
		});
		
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
	homeUrl: function() {
		this.setUrl(this.initUrl);
	},
	setUrl: function(url) {
		$('#browser').attr("src", url)
	},
	max: function() {
		ipcRenderer.send('window-action', 'max')
	},
	min: function() {
		ipcRenderer.send('window-action', 'min')
	},
	reset: function() {
		ipcRenderer.send('window-action', 'reset')
	},
	close: function() {
		ipcRenderer.send('window-action', 'close')
	}
}

$(document).ready(function(){ 
	FastWebView.init()
});
