const express = require("express");
const fs = require('fs');
var ejs=require('ejs');
const path = require('path');
const app = express();
const multer  = require('multer');

app.listen(3000, () => {
  console.log("Application started and Listening on port 3000");
  console.log("请打开浏览器，访问 http://localhost:3000 ");
});


// 设置存储引擎和文件上传路径
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/') // 将上传的文件存储在 uploads 文件夹中
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // 获取文件原始扩展名
    cb(null, file.fieldname + ext) // 使用原始扩展名生成文件名
  }
});


// serve your css as static
app.use(express.static(__dirname));

//设置html模板渲染引擎
app.engine('html',ejs.__express);
//设置渲染引擎为html
app.set('view engine','html');


// 创建 multer 实例
const upload = multer({ storage: storage });


// 上传文件

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '未上传文件' });
  }
  res.json({ message: '文件上传成功', filename: req.file.filename });
});


// 修改json接口

app.get("/edit_config", (req, res) => {
    

    var model_path = req.query.model_path;

    var filePath = "./config.json"

    // 读取文件内容
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file');
        } else {
            
            var data = '{"model_path":"' + model_path + '"}';

            console.log(data);

            // 写入修改后的内容到文件
            fs.writeFile(filePath, data, 'utf8', (err) => {
                if (err) {
                    res.status(500).send('Error writing file');
                } else {
                    
                    res.status(200).send('File updated successfully');
                }
            });
        }
    });
  



});


// 文字转语音 页面操作
app.get("/tts", (req, res) => {

    var filePath = "./config.json"


    // 同步地遍历目录并返回目录名
    function getSubdirectories(dirPath) {
        return new Promise((resolve, reject) => {
          fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
            if (err) {
              return reject(err);
            }
      
            // 过滤出目录项
            const directories = files
              .filter(file => file.isDirectory())
              .map(file => file.name);
      
            resolve(directories);
          });
        });
      }

        // 指定目标目录路径
        const targetDir = './models/';

        var dis;

        // 获取目标目录下的所有目录名
        getSubdirectories(targetDir).then((directories) => {
            
            dis = directories;
          })
          .catch((err) => {
            console.error(err);
          });

    // 读取文件内容
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file,配置文件不存在');
        } else {

            console.log(data);

            const jsonData = JSON.parse(data);
            const modelPath = jsonData.model_path;

            dis = JSON.stringify(dis);
            
            res.render(__dirname + "/live2d_test",{model_path: modelPath,model_list:dis});
        }
    });

    

  
});



// 大模型 页面操作
app.get("/llm", (req, res) => {

    var filePath = "./config.json"


    // 同步地遍历目录并返回目录名
    function getSubdirectories(dirPath) {
        return new Promise((resolve, reject) => {
          fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
            if (err) {
              return reject(err);
            }
      
            // 过滤出目录项
            const directories = files
              .filter(file => file.isDirectory())
              .map(file => file.name);
      
            resolve(directories);
          });
        });
      }

        // 指定目标目录路径
        const targetDir = './models/';

        var dis;

        // 获取目标目录下的所有目录名
        getSubdirectories(targetDir).then((directories) => {
            
            dis = directories;
          })
          .catch((err) => {
            console.error(err);
          });

    // 读取文件内容
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file,配置文件不存在');
        } else {

            console.log(data);

            const jsonData = JSON.parse(data);
            const modelPath = jsonData.model_path;

            dis = JSON.stringify(dis);
            
            res.render(__dirname + "/live2d_llm",{model_path: modelPath,model_list:dis});
        }
    });

    

  
});


// 大模型 页面操作
app.get("/coze", (req, res) => {

    var filePath = "./config.json"


    // 同步地遍历目录并返回目录名
    function getSubdirectories(dirPath) {
        return new Promise((resolve, reject) => {
          fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
            if (err) {
              return reject(err);
            }
      
            // 过滤出目录项
            const directories = files
              .filter(file => file.isDirectory())
              .map(file => file.name);
      
            resolve(directories);
          });
        });
      }

        // 指定目标目录路径
        const targetDir = './models/';

        var dis;

        // 获取目标目录下的所有目录名
        getSubdirectories(targetDir).then((directories) => {
            
            dis = directories;
          })
          .catch((err) => {
            console.error(err);
          });

    // 读取文件内容
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file,配置文件不存在');
        } else {

            console.log(data);

            const jsonData = JSON.parse(data);
            const modelPath = jsonData.model_path;

            dis = JSON.stringify(dis);
            
            res.render(__dirname + "/live2d_coze",{model_path: modelPath,model_list:dis});
        }
    });

    

  
});

// 大模型 页面操作
app.get("/shop", (req, res) => {

    var filePath = "./config.json"


    // 同步地遍历目录并返回目录名
    function getSubdirectories(dirPath) {
        return new Promise((resolve, reject) => {
          fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
            if (err) {
              return reject(err);
            }
      
            // 过滤出目录项
            const directories = files
              .filter(file => file.isDirectory())
              .map(file => file.name);
      
            resolve(directories);
          });
        });
      }

        // 指定目标目录路径
        const targetDir = './models/';

        var dis;

        // 获取目标目录下的所有目录名
        getSubdirectories(targetDir).then((directories) => {
            
            dis = directories;
          })
          .catch((err) => {
            console.error(err);
          });

    // 读取文件内容
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file,配置文件不存在');
        } else {

            console.log(data);

            const jsonData = JSON.parse(data);
            const modelPath = jsonData.model_path;

            dis = JSON.stringify(dis);
            
            res.render(__dirname + "/live2d_shop",{model_path: modelPath,model_list:dis});
        }
    });

});

app.get("/ioc", (req, res) => {
    res.render(__dirname + "/ioc");
});

app.get("/", (req, res) => {
    res.render(__dirname + "/index");
});
