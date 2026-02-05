Safari在执行到beforeUpload方法

有两种情况

1. 不继续执行 也无法上传(没有调用上传)
2. 报错

Unhandled Promise Rejection: TypeError: ReadableStreamBYOBReader needs a ReadableByteStreamController

https://github.com/oven-sh/bun/issues/12908#issuecomment-2490151231

刚开始以为是异步的问题 由于`file-type`调用了异步方法 调试也是在这里没有后续打印了

使用别的异步代码测试结果是正常上传的

```js
return new Promise<FileType>((resolve) =>
  setTimeout(() => resolve(file), 2000),
);
```

根本原因在于`file-typ`库的`fileTypeFromBlob`方法不支持Safari 去掉可以正常上传

safari不支持`ReadableStreamBYOBReader`api

详见: https://github.com/sindresorhus/file-type/issues/690
