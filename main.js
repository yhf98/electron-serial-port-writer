/*
 * @Author: 姚恒锋 1921934563@qq.com
 * @Date: 2023-07-31 18:41:54
 * @LastEditors: 姚恒锋 1921934563@qq.com
 * @LastEditTime: 2023-08-01 11:23:37
 * @FilePath: \electron-serialport\main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const url = require('url')

app.allowRendererProcessReuse = false
app.disableHardwareAcceleration()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 780,
        webPreferences: {
            nodeIntegration: true, // to allow require
            contextIsolation: false, // allow use with Electron 12+
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

    ipcMain.on('openFile', async (e, arg) => {
        try {
            const result = await dialog.showOpenDialog(mainWindow, {
                properties: ['openFile']
            });
            if (!result.canceled) {
                console.log(result.filePaths);
                e.returnValue = result.filePaths[0];
            } else {
                console.log('取消选择文件');
                e.returnValue = null;
            }
        } catch (error) {
            console.error(error);
            e.returnValue = null;
        }
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    app.quit()
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
