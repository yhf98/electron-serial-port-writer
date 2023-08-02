/*
 * @Author: 姚恒锋 1921934563@qq.com
 * @Date: 2023-07-31 18:41:54
 * @LastEditors: 姚恒锋 1921934563@qq.com
 * @LastEditTime: 2023-08-02 11:19:50
 * @FilePath: \electron-serialport\renderer.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { SerialPort, ReadlineParser } = require('serialport')
const { ipcRenderer } = require("electron");
const fs = require('fs');
const intelHex = require('intel-hex');
const Readline = require('@serialport/parser-readline');

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

let port;

let log;

let logTxt = [];


const btn = document.getElementById('write')
document.getElementById('baudRate').value = 115200

btn.addEventListener('click', () => {
  console.info("开始烧录:");

  // // 读取 *.hex 文件内容
  // const hexContent = fs.readFileSync(fileName, 'utf8');

  // console.info(hexContent);

  // // 解析 *.hex 文件
  // const parsedHex = intelHex.parse(hexContent);


  let portName = document.getElementById('port').value;
  let baudRate = document.getElementById('baudRate').value;
  log = document.getElementById("log");

  // 创建串口实例
  port = new SerialPort({ path: portName, baudRate: parseInt(baudRate) });

  // 创建 ReadlineParser 实例，用于解析串口数据
  const parser = port.pipe(new Readline.ReadlineParser ({ delimiter: '\n' }));

  parser.on('data', console.log)

  // 监听串口打开事件
  port.on('open', () => {
    console.log('串口已打开');

    // 读取固件文件内容
    const firmwareData = readFirmwareFile();

    // 监听串口接收到的数据
    parser.on('data', (data) => {
      console.log('接收到串口数据:', data);
      // 根据接收到的数据进行烧录状态判断
      // 在此处可以根据协议规定的格式解析串口返回的数据
      // 并进行相应的处理（例如判断烧录进度、检测烧录结果等）
    });

    // 开始向串口发送固件数据
    sendFirmwareData(firmwareData);
  });

  // 监听串口错误事件
  port.on('error', (err) => {
    console.error('串口发生错误:', err);
  });

  port.on("data", (data) => {
    console.info("接收到的数据：", data);
  })

  // // 创建串口实例
  // const port = new SerialPort({ path: portName, baudRate: parseInt(baudRate) });

  // // const port = new SerialPort(portName, {
  // //   baudRate: parseInt(baudRate)
  // // });

  // port.on('open', () => {
  //   console.log('串口已打开');
  // });


  // 监听串口数据接收事件
  // port.on('data', (data) => {
  //   console.log('接收到串口数据:', data, data.toString());
  //   console.log(data.toString());
  //   if (data != null && data != 'null' && data != 'undefined' && data != ''){
  //     console.log('Data:', data.toString())
  //     receiptData = Buffer.concat([receiptData, data])
  //     console.info("接收到的数据:", receiptData.toString());
  //     log.innerText = receiptData.toString() + "\n";
  //   }
  // });

  // 监听串口关闭事件
  // port.on('close', () => {
  //   console.log('串口已关闭');
  // });

  // port.on('data', data => {
  //   console.log('接受的数据:', Buffer.from(data), Buffer.from(data).toString());
  // });

  // // 监听串口错误事件
  // port.on('error', (err) => {
  //   console.error('串口发生错误:', err);
  // });
  // // Read data that is available but keep the stream in "paused mode"

  // port.on('readable', function () {
  //   // console.log('接受的数据:', Buffer.from(port.read()));
  //   if (port.read() != null && port.read() != 'null' && port.read() != 'undefined' && port.read() != '') {
  //     console.log('Data:', port.read().toString())
  //     receiptData = Buffer.concat([receiptData, port.read()])
  //     console.info("接收到的数据:", receiptData.toString());
  //     log.innerText = receiptData.toString() + "\n";
  //   }
  // })

  // console.info(`端口：${port}--波特率：${baudRate}--烧录二进制文件：${fileName}`);

  // // 烧录数据到串口
  // port.write(parsedHex.data, err => {
  //   if (err) {
  //     console.error('Error:', err);
  //   }
  //   console.info("写入成功！");
  // });

  // fs.readFile(fileName, (err, data) => {
  //   // 读取固件文件内容
  //   const firmwareData = Buffer.from(data);
  //   // 向串口发送固件数据
  //   port.write(firmwareData, (err) => {
  //     if (err) {
  //       console.error('写入串口失败:', err);
  //     } else {
  //       console.log('固件已发送到串口');
  //     }
  //   });
  // })


  // 读取固件文件内容的函数，你需要根据实际情况进行实现
  // function readFirmwareFile() {
  //   // Read firmware file and return data
  // }

  // fs.readFile(fileName, (err, data) => {
  //   if (err) {
  //     console.error(err);
  //     return;
  //   }

  //   const fileBuffer = Buffer.from(data);
  //   console.log(fileBuffer);

  //   const serialport = new SerialPort({ path: port, baudRate: parseInt(baudRate) })
  //   console.log("写入文件：", serialport.write(fileBuffer))
  //   let log = document.getElementById("log")


  //   serialport.on('data', (data) => {
  //     receiptData = Buffer.concat([receiptData, data])
  //     console.info("接收到的数据:", receiptData.toString());
  //     log.innerText = receiptData.toString() + "\n";
  //   })


  //   // const port = new SerialPort({ path: 'COM6', baudRate: 115200, portName: '' })
  //   // const parser = new ReadlineParser()
  //   // port.pipe(parser)
  //   // parser.on('data', console.log)
  //   // port.write('ROBOT PLEASE RESPOND\n')
  // });

})

document.getElementById('openFile').addEventListener('click', (event) => {
  fileName = ipcRenderer.sendSync('openFile');
  console.log("文件路径：", fileName);
  document.getElementById('file').value = fileName;
});

document.getElementById('freshData').addEventListener('click', (event) => {
  listSerialPorts()
});


// 读取固件文件内容的函数
function readFirmwareFile() {
  try {
    const firmwareData = fs.readFileSync(fileName, 'utf8');
    return firmwareData;
  } catch (err) {
    console.error('读取固件文件失败:', err);
    return '';
  }
}

// 向串口发送固件数据的函数
function sendFirmwareData(firmwareData) {
  console.info("接收到的数据：", firmwareData);
  // 按行分割固件数据
  const lines = firmwareData.split('\n');

  // 逐行发送固件数据
  lines.forEach((line, index) => {
    // 在此处可以根据协议要求对每行数据进行处理，例如添加校验和等

    // 发送数据到串口
    port.write(line + '\n', (err) => {
      if (err) {
        console.error('写入串口失败:', err);
      } else {
        // console.log(`第 ${index + 1} 行固件数据已发送到串口`);
        logTxt.push(`第 ${index + 1} 行固件数据已发送到串口\t\t\n\n`);
        log.innerText = logTxt.join('\t\t\n\n');
      }
    });
  });
}


