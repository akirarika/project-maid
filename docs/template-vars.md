# 模板变量

这些变量可以在模板功能中使用。

| 变量名称        | 说明                                             |
| --------------- | ------------------------------------------------ |
| yourNameRaw     | 用户所输入的名称，原封不动的写入                 |
| yourName        | 用户所输入的名称，将被格式化为小驼峰形式         |
| YourName        | 用户所输入的名称，将被格式化为大驼峰形式         |
| your_name       | 用户所输入的名称，将被格式化为下划线形式         |
| your-name       | 用户所输入的名称，将被格式化为中划线形式         |
| templateNameRaw | 用户所选模板的名称，原封不动的写入               |
| templateName    | 用户所选模板的名称，将被格式化为小驼峰形式       |
| TemplateName    | 用户所选模板的名称，将被格式化为大驼峰形式       |
| template_name   | 用户所选模板的名称，将被格式化为下划线形式       |
| template-name   | 用户所选模板的名称，将被格式化为中划线形式       |
| path            | 用户右键创建时，此文件夹的路径，以工程根目录起始 |
| workspacePath   | 工作区所在的绝对路径                             |
| username        | 用户名称，通过获取操作系统中用户名取得           |
| yyyy            | 当前年份                                         |
| mm              | 当前月份                                         |
| dd              | 当前日                                           |
| h               | 当前小时                                         |
| m               | 当前分钟                                         |
| s               | 当前秒                                           |
| timestamp       | 时间戳 (秒级)                                    |
| timestampMs     | 时间戳 (毫秒级)                                  |
