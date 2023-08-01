/*
 * @Author: 姚恒锋 1921934563@qq.com
 * @Date: 2023-07-31 18:41:54
 * @LastEditors: 姚恒锋 1921934563@qq.com
 * @LastEditTime: 2023-08-01 12:20:12
 * @FilePath: \electron-serialport\renderer.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { SerialPort, ReadlineParser } = require('serialport')
const { ipcRenderer } = require("electron");
const fs = require('fs');

let fileName = "";

async function listSerialPorts() {
  await SerialPort.list().then((ports, err) => {
    if (err) {
      document.getElementById('error').textContent = err.message
      return
    } else {
      document.getElementById('error').textContent = ''
    }
    console.log('ports', JSON.stringify(ports));

    if (ports.length === 0) {
      document.getElementById('error').textContent = 'No ports discovered'
    }
    let port = document.getElementById('port');
    port.innerHTML = null;
    ports = ports.reverse();
    ports.forEach(item => {
      let option = document.createElement('option');
      option.value = item.path;
      option.label = item.path;
      port.appendChild(option);
    })
    // tableHTML = tableify(ports)
    // document.getElementById('ports').innerHTML = tableHTML

  })
}

function listPorts() {
  listSerialPorts();
  setTimeout(listPorts, 6000);
}

// Set a timeout that will check for new serialPorts every 2 seconds.
// This timeout reschedules itself.
// setTimeout(listPorts, 6000);

listSerialPorts()

let receiptData = Buffer.from(' ');


const btn = document.getElementById('write')
document.getElementById('baudRate').value = 115200

btn.addEventListener('click', () => {
  console.info("开始烧录:");

  // const filePath = 'H:/electron-serialport/test.txt';
  let port = document.getElementById('port').value;
  let baudRate = document.getElementById('baudRate').value;
  

  console.info(`端口：${port}--波特率：${baudRate}--烧录二进制文件：${fileName}`);

  fs.readFile(fileName, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const fileBuffer = Buffer.from(data);
    console.log(fileBuffer);

    const serialport = new SerialPort({ path: port, baudRate: parseInt(baudRate) })
    console.log("写入文件：", serialport.write(fileBuffer))
    let log = document.getElementById("log")
    serialport.on('data', (data) => {
      receiptData = Buffer.concat([receiptData, data])
      console.info("接收到的数据:", receiptData.toString());
      log.innerText = receiptData.toString() + "\n";
    })

    
    // const port = new SerialPort({ path: 'COM6', baudRate: 115200, portName: '' })
    // const parser = new ReadlineParser()
    // port.pipe(parser)
    // parser.on('data', console.log)
    // port.write('ROBOT PLEASE RESPOND\n')
  });

})

document.getElementById('openFile').addEventListener('click', (event) => {
   fileName = ipcRenderer.sendSync('openFile');
   console.log("文件路径：", fileName);
   document.getElementById('file').value = fileName;
});

document.getElementById('freshData').addEventListener('click', (event) => {
  listSerialPorts()
});


