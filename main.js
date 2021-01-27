const path = require('path')
const {app, BrowserWindow, ipcMain, Menu, Tray, remote} = require('electron')

var FastOA = {
	appName: '火速应用',
	mainWindow: null,
	appIcon: null,
	debug: false,
	windowOptions: {
		width: 1200,
		height: 760,
		minHeight: 700,
		minWidth: 1000,
		frame: false,
		webPreferences: {
			nodeIntegration: true,
			webviewTag: true
		}
	},
	init: function() {
		let _this = this;
		_this.makeSingleInstance()
		// 判断是否开启debug模式
		_this.debug = /--debug/.test(process.argv[2]);
		
		app.on('ready', () => {
		  _this.createWindow()
		})
		app.on('window-all-closed', () => {
		  if (process.platform !== 'darwin') {
		    app.quit()
		  }
		})
		app.on('activate', () => {
		  if (_this.mainWindow === null) {
		    _this.createWindow()
		  }
		})
		 _this.initIpc()
	},
	initIpc: function() {
		//主进程渲染器操作
		let _this = this;
		ipcMain.on('window-action', function(event, arg) {
		  if(arg=='max') {
		  	_this.maximizeWindow()
		  } else if(arg=='min') {
		  	_this.minimizeWindow()
		  } else if(arg=='close') {
		  	_this.closeWindow()
		  } else if(arg=='reset') {
		  	_this.resetWindow()
		  }
		});
	},
	initTray: function() {
		var iconPath = path.join(__dirname, '/assets/images/logo.png')
		this.appIcon = new Tray(iconPath)
		var contextMenu = Menu.buildFromTemplate([{
		    label: '退出系统',
		    click: () => {
				if (process.platform !== 'darwin') {
				  app.quit()
				}
		    }
		}])
		this.appIcon.setToolTip(this.appName)
		this.appIcon.setContextMenu(contextMenu)
		let _this = this;
		_this.appIcon.on('click', ()=>{
			//我们这里模拟桌面程序点击通知区图标实现打开关闭应用的功能
		    _this.mainWindow.isVisible()?_this.mainWindow.hide():_this.mainWindow.show();
			_this.mainWindow.isVisible()?_this.mainWindow.setSkipTaskbar(false):_this.mainWindow.setSkipTaskbar(true);
		})
	},
	createWindow: function() {
		// 创建窗口
		if (process.platform === 'linux') {
		  this.windowOptions.icon = path.join(__dirname, '/assets/images/logo.png')
		}
		this.mainWindow = new BrowserWindow(this.windowOptions)
		this.mainWindow.loadURL(path.join(__dirname, '/index.html'))
		if (this.debug) {
		  this.mainWindow.webContents.openDevTools()
		  this.mainWindow.maximize()
		}
		this.mainWindow.on('closed', () => {
		  this.mainWindow = null
		})
		 this.initTray()
	},
	minimizeWindow: function() {
		if (this.mainWindow) {
			this.mainWindow.minimize();
		}
	},
	maximizeWindow: function() {
		if (this.mainWindow) {
			if(!this.mainWindow.isMaximized()) this.mainWindow.maximize();
		}
	},
	resetWindow: function() {
		if (this.mainWindow) {
			if(this.mainWindow.isMaximized()) this.mainWindow.unmaximize()
		}
	},
	closeWindow: function() {
		if (this.mainWindow) {
			this.mainWindow.hide();
		}
	},
	makeSingleInstance: function() {
		if (process.mas) return
		app.requestSingleInstanceLock()
		let _this = this;
		app.on('second-instance', () => {
		    if (_this.mainWindow) {
		      if (_this.mainWindow.isMinimized()) _this.mainWindow.restore()
		      _this.mainWindow.focus()
		    }
		})
	}
}

FastOA.init()







