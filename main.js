const path = require('path')
const {app, BrowserWindow, ipcMain, Menu, Tray, remote} = require('electron')

var FastApp = {
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
        // 判断是否开启debug模式
        _this.debug = /--debug/.test(process.argv[2]);
        app.on('ready', () => {
          _this.createWindow()
        })
        // 二次启动是监听
        app.on('second-instance', (event, commandLine, workingDirectory) => {
            // 当运行第二个实例时,将会聚焦到这个窗口
            if (_this.mainWindow) {
              if (_this.mainWindow.isMinimized()) _this.mainWindow.restore()
              _this.mainWindow.focus()
            }
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
        // 创建Ipc通讯
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
              _this.hideWindow()
          }
        });
    },
    initTray: function() {
        let _this = this;
        var iconPath = path.join(__dirname, '/assets/images/logo.png')
        this.appIcon = new Tray(iconPath)
        var contextMenu = Menu.buildFromTemplate([{
            label: '打开界面',
            icon: path.join(__dirname, '/assets/images/icon-tray-back.png'),
            click: () => {
                if(!_this.mainWindow.isVisible()) {
                    _this.mainWindow.show();
                } else {
                    if (_this.mainWindow.isMinimized()) _this.mainWindow.restore()
                    _this.mainWindow.focus()
                }
            }
        },{
            label: '返回主页',
            icon: path.join(__dirname, '/assets/images/icon-tray-home.png'),
            click: () => {
				// 向页面发送访问主页命令
                this.mainWindow.webContents.send('jumpHomeUrl');
            }
        },{
            label: '退出系统',
            icon: path.join(__dirname, '/assets/images/icon-tray-signout.png'),
            click: () => {
                if (process.platform !== 'darwin') {
                  app.quit()
                }
            }
        }])
        _this.appIcon.setToolTip(this.appName)
        _this.appIcon.setContextMenu(contextMenu)
        _this.appIcon.on('click', ()=>{
            _this.mainWindow.isVisible()?_this.mainWindow.hide():_this.mainWindow.show();
            _this.mainWindow.isVisible()?_this.mainWindow.setSkipTaskbar(false):_this.mainWindow.setSkipTaskbar(true);
        })
    },
    createWindow: function() {
        //隐藏菜单栏
        Menu.setApplicationMenu(null)
        // 创建窗口
        this.windowOptions.icon = path.join(__dirname, '/assets/images/logo.png')
        this.mainWindow = new BrowserWindow(this.windowOptions)
        this.mainWindow.loadURL(path.join(__dirname, '/index.html'))
        this.mainWindow.on('closed', () => {
            this.mainWindow = null
        })
		this.mainWindow.on('maximize', () => {
		    this.mainWindow.webContents.send('maximize');
		})
		this.mainWindow.on('unmaximize', () => {
		    this.mainWindow.webContents.send('unmaximize');
		})
        // 初始化托盘
        this.initTray()
		// 开发模式打开调试工具
		if(this.debug) {
		    this.mainWindow.webContents.openDevTools()
		    this.mainWindow.maximize()
		}
    },
    minimizeWindow: function() {
        if (this.mainWindow) {
            this.mainWindow.minimize();
        }
    },
    maximizeWindow: function() {
        if (this.mainWindow) {
			this.mainWindow.isMaximized()?this.mainWindow.unmaximize():this.mainWindow.maximize();
        }
    },
    hideWindow: function() {
        if (this.mainWindow) {
            this.mainWindow.hide();
        }
    }
}
// 判断是否单例
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    // 创建新Window
    FastApp.init()
}







