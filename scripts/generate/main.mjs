#!/usr/bin/env node

// 引入依赖模块
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import axios from 'axios';
import art from 'art-template';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 定义命令行参数
 */
const argv = yargs(hideBin(process.argv))
  .option('tableName', {
    alias: 't',
    describe: '表名称',
    demandOption: true,
    type: 'string',
  })
  .option('cover', {
    alias: 'c',
    describe: '是否覆盖 (0: 不覆盖, 1: 覆盖)',
    default: 0,
    type: 'number',
  })
  .option('data', {
    alias: 'd',
    describe: '是否仅生成元数据',
    default: 0,
    type: 'number',
  })
  .help()
  .alias('help', 'h')
  .argv;

// 获取参数
const { tableName, cover } = argv;
console.log(`tableName: ${tableName}, cover: ${cover}`);

// 读取配置文件
const configPath = path.join(__dirname, 'config', 'default.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const { apiUrl, theme, appId, appSecret, templates } = config;
console.log(`apiUrl: ${apiUrl}`);
console.log(`theme: ${theme}`);
console.log(`appId: ${appId}`);
console.log(`templates: ${JSON.stringify(templates, null, 2)}`);

const genDir = __dirname;
const rootDir = path.resolve(genDir, '../../');

/**
 * 请求接口获取元数据
 * @param {string} tableName 表名
 * @returns {Promise} 元数据
 */
const getMetaData = async (tableName) => {
  try {
    const response = await axios.get(apiUrl, {
      params: { tableName },
      headers: {
        appId,
        appSecret,
      },
    });

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.msg);
    }
  } catch (error) {
    console.warn(`⚠️ 无法从API获取元数据: ${error.message}`);
    console.log('🔄 尝试使用本地测试数据...');

    // 尝试使用本地测试数据
    try {
      const testDataPath = path.join(__dirname, 'test-data.json');
      const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
      console.log('✅ 使用本地测试数据');
      return testData[tableName];
    } catch (testError) {
      throw new Error(`获取元数据失败: ${error.message}，且无法加载测试数据: ${testError.message}`);
    }
  }
};

/**
 * 获取选中的模板
 * @param {object} data 元数据
 * @returns {array} 选中的模板数组
 */
const getSelectedTemplates = (data) => {
  const selectedTemplates = [];

  // 确保ext字段存在
  if (!data.ext) {
    data.ext = {};
  }

  templates
    .filter((template) => {
      if (typeof template.selected === 'string') {
        // 模板语法判断
        try {
          return art.render(template.selected, data) === 'true';
        } catch (error) {
          console.warn(`模板选择条件评估失败: ${template.name}, 错误: ${error.message}`);
          return false;
        }
      }
      return template.selected;
    })
    .forEach((template) => {
      if ((argv.data !== 1 && template.selected) || (argv.data === 1 && template.data)) {
        const templateFile = template.templateFile;
        let mTheme = theme;

        // 如果元数据配置有模板主题，则使用元数据的配置
        if (data?.ext?.theme && fs.existsSync(path.join(genDir, 'templates', data?.ext?.theme))) {
          mTheme = data?.ext?.theme;
        }

        // 读取模板内容
        const templatePath = path.join(genDir, 'templates', mTheme, templateFile);
        if (fs.existsSync(templatePath)) {
          template.templateContent = fs.readFileSync(templatePath, 'utf-8');
          selectedTemplates.push(template);
        }
      }
    });

  return selectedTemplates;
};

/**
 * 创建目录
 * @param {string} dir 目录路径
 */
const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 配置art-template
// 原始语法的界定符规则
art.defaults.rules[0].test = /<%(#?)((?:==|=#|[=-])?)[ \t]*([\w\W]*?)[ \t]*(-?)%>/;
// 标准语法的界定符规则
art.defaults.rules[1].test = /<{([@#]?)[ \t]*(\/?)([\ \w\W]*?)[ \t]*}>/;
// 禁止转义
art.defaults.escape = false;
// 禁止压缩
art.defaults.minimize = false;

// 导入模板变量
art.defaults.imports.stringify = JSON.stringify;

// 处理默认值
art.defaults.imports.handleDefault = function (v, column) {
  if (v) {
    if (column?.componentProps?.dataType === 'number') {
      return Number(v);
    }
  }
  return v;
};

// URL转小驼峰命名
art.defaults.imports.urlToCamelCase = (url) => {
  const str = url.substring(1).replace(/\//g, '_');
  return str.replace(/_(\w)/g, (all, letter) => letter.toUpperCase());
};

// 首字母大写
art.defaults.imports.capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// 转换为PascalCase
art.defaults.imports.toPascalCase = (str) => {
  return str.replace(/[-_](\w)/g, (all, letter) => letter.toUpperCase())
            .replace(/^\w/, (letter) => letter.toUpperCase());
};

/**
 * 处理组件属性
 * @param {object} data 元数据
 */
const appendComponentProps = (data) => {
  data?.columns?.forEach((column) => {
    // 确保column的ext字段存在
    if (!column.ext) {
      column.ext = {};
    }

    const componentProps = {};

    // 组件配置以组件配置+下划线开头
    Object.keys(column.ext || {})
      .filter((key) => key.startsWith(column.component + '_'))
      .forEach((key) => {
        componentProps[key.replace(column.component + '_', '')] = column.ext[key];
      });

    column.componentProps = componentProps;
    column.componentProps.placeholder = column.ext?.placeholder || '请输入' + column.remark;

    if ([
      'ApiDict',
      'ApiSelect',
      'Select',
      'AutoComplete',
      'ApiCascader',
      'ApiTreeSelect',
      'Upload',
    ].includes(column.component)) {
      column.componentProps.placeholder = column.ext?.placeholder || '请选择' + column.remark;
    }

    if (column.component === 'RangePicker') {
      if (column.placeholder) {
        column.componentProps.placeholder = column.ext.placeholder.split(',');
      } else {
        column.componentProps.placeholder = ['开始日期', '结束日期'];
      }
    } else if (column.component === 'CustomComponent') {
      // 自定义组件需要特殊处理
      column.component = column.componentProps.componentName;
      delete column.componentProps.componentName;
    } else if (column.component === 'Switch') {
      if (column.componentProps.dataType === 'number') {
        column.componentProps.unCheckedValue = Number(column.componentProps.unCheckedValue || 0);
        column.componentProps.checkedValue = Number(column.componentProps.checkedValue || 1);
      }
    }

    column.searchComponentProps = column.componentProps;
  });
};

/**
 * 根据模板文件名获取模板配置
 * @param {string} templateFile 模板文件名
 * @returns {object} 模板配置
 */
const getTemplateByFileName = (templateFile) => {
  const template = templates.find((item) => item.templateFile === templateFile);
  if (template) {
    const templatePath = path.join(genDir, 'templates', theme, templateFile);
    if (fs.existsSync(templatePath)) {
      template.templateContent = fs.readFileSync(templatePath, 'utf-8');
    }
    return template;
  }
};

/**
 * 创建自定义组件
 * @param {object} template 模板配置
 * @param {object} column 列配置
 * @param {object} data 元数据
 */
const _createCustomComponent = (template, column, data) => {
  const templateContent = template.templateContent;
  const renderContent = art.render(templateContent, data);
  const targetPath = art.render(template.targetPath, data);
  const targetFileName = column.component + '.vue';
  const targetFile = path.join(rootDir, targetPath, targetFileName);

  createDir(path.join(rootDir, targetPath));

  if (cover === 2) {
    fs.writeFileSync(targetFile, renderContent);
  } else {
    if (!fs.existsSync(targetFile)) {
      fs.writeFileSync(targetFile, renderContent);
    }
  }
};

/**
 * 创建自定义表单/列表组件
 * @param {object} data 元数据
 */
const createCustomComponent = (data) => {
  // 确保ext字段存在
  if (!data.ext) {
    data.ext = {};
  }

  // 获取所有自定义组件列
  const customColumns = data?.columns?.filter(
    (column) => column.ext && column.component === column.ext?.CustomComponent_componentName
  ) || [];

  const customFormComponent = getTemplateByFileName('customFormComponent.art');
  const customViewComponent = getTemplateByFileName('customViewComponent.art');

  customColumns.forEach((column) => {
    // 确保column的ext字段存在
    if (!column.ext) {
      column.ext = {};
    }

    const isCreateForm =
      (column.ext.addHide !== true && column.ext.addHide !== 1) ||
      (column.ext.editHide !== true && column.ext.editHide !== 1);
    const isCreateView =
      (column.ext.listHide !== true && column.ext.listHide !== 1) ||
      (column.ext.viewHide !== true && column.ext.viewHide !== 1);

    if (isCreateForm && customFormComponent) {
      _createCustomComponent(customFormComponent, column, data);
    }
    if (isCreateView && customViewComponent) {
      _createCustomComponent(customViewComponent, column, data);
    }
  });
};

/**
 * 主函数
 */
const main = async () => {
  try {
    const tableNames = tableName.split(',');

    for (const name of tableNames) {
      console.log(`正在处理表: ${name}`);

      const data = await getMetaData(name);

      // 确保ext字段存在，提供默认值
      if (!data.ext) {
        data.ext = {
          generateRoute: false,
        };
      }

      const selectedTemplates = getSelectedTemplates(data);
      appendComponentProps(data);

      // 遍历选中的模板
      selectedTemplates.forEach((template) => {
        const templateContent = template.templateContent;
        const renderContent = art.render(templateContent, data);
        const targetPath = art.render(template.targetPath, data);
        const targetFileName = art.render(template.targetFileName, data);
        const targetFile = path.join(rootDir, targetPath, targetFileName);

        // 创建目标路径
        createDir(path.join(rootDir, targetPath));

        // 根据覆盖参数决定是否写入文件
        if (cover === 1) {
          fs.writeFileSync(targetFile, renderContent);
          console.log(`✅ 已生成: ${targetFile}`);
        } else {
          if (!fs.existsSync(targetFile)) {
            fs.writeFileSync(targetFile, renderContent);
            console.log(`✅ 已生成: ${targetFile}`);
          } else {
            if (argv.data === 1) {
              fs.writeFileSync(targetFile, renderContent);
              console.log(`✅ 已更新元数据: ${targetFile}`);
            } else {
              console.log(`⚠️  文件已存在，跳过: ${targetFile}`);
            }
          }
        }
      });

      // 创建自定义表单/列表组件
      createCustomComponent(data);
    }

    console.log('🎉 代码生成完成!');
  } catch (error) {
    console.error('❌ 代码生成失败:', error.message);
    process.exit(1);
  }
};

// 执行主函数
main();
