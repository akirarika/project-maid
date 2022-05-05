# Project Maid

Project Maid 是一款 Visual Studio Code 扩展，为开发与组织中大型项目，提供了一系列实用工具集，All in One！

> 我们正在开发中，想与我们一起开发、或提出功能建议的，欢迎通过 `issue` 联系，或者在[知乎](https://www.zhihu.com/people/akirarika)私信我，我们加 QQ / 微信好友

### 概述

Project Maid 主要关注中大型项目的组织、开发与协作方面，并提供了一系列实用工具集。

只要在项目的根目录，创建一个 `.pm` 文件夹，并进行简单的配置，即可启用 Project Maid。

你可以将 `.pm` 文件夹一同提交到版本控制工具中，这样整个项目成员，都将共享相关配置。

具体用法，敬请阅读你感兴趣的功能章节。

### 安装

在 Visual Studio Code 扩展商店中，搜索 `project-maid` 并安装即可。或者[点击此处](https://marketplace.visualstudio.com/items?itemName=akirarika.project-maid)

## 功能列表 (Todo)

[x] 模板功能：通过模板创建文件夹

[x] 模板功能：通过模板创建文件

[ ] 模板功能：创建模板后，自动修改某些文件，如添加路由等

[ ] Git 功能：一键提交至所选分支，并切换回原分支

[ ] Git 功能：Commit 模板功能，和约束 Commit 格式

[ ] Git 功能：在 Commit 前，运行指定 Shell 脚本

[ ] 文档功能：根据注释生成 .md 文档

## 模板功能

我们在开发过程中，尤其是前端开发，经常会遇到重复性复制的场景。

例如小程序开发，我们每次新建页面，都需要创建 `index.json`、`index.wxml`、`index.wxss`、`index.js` 这些文件。模板功能就可以让我们化繁为简。

### 入门

我们在 `.pm` 目录下新建一个 `templates` 目录，在这里存放我们的模板。

接着，我们建立一个以模板名为名的文件夹。例如，我想创建一个用于新建页面的模板，那么我将它取名为 `view`。

此时，我们的目录结构，应当如下：

```sh
> /.pm/templates/view
```

在此目录中，我们再新建一个文件夹，名为 `{{your-name}}-view`。是的，**这是一个包含大括号的文件名！**大括号和其内容，未来会由扩展，自动替换为我们想要的名称~

此时，我们的目录结构，应当如下：

```sh
> /.pm/templates/view/{{your-name}}-view
```

我们在此文件夹内，新建一个 `{{your-name}}.ts.tpl` 文件，内容为：

```ts
export function {{yourName}}() {
    console.log('Say {{YourName}}!');
}
```

完成以上操作后，我们选择任意目录，在其上单机鼠标右键，我们可以就看到 `Create from template..` 的选项菜单。

我们输入任意想要的名称，比如 `welcome`，再选择名为 `view` 的模板，我们就会发现目录中，根据模板，创建了一个新的文件夹，名称为：`welcome-view`

其内部，有一个名为 `welcome.ts` 的文件，内容为：

```ts
export function welcome() {
  console.log("Say Welcome!");
}
```

到此为止，我们的第一个模板就完成啦！这不是什么魔法，在接下来的文章，我们将详细讨论他是如何实现的。

### 模板

在 `/.pm/templates` 内的文件夹，都被视为是模板。

在此文件夹中的唯一一个文件夹，或唯一一个 `.tpl` 文件，将被视为模板内容。

文件夹内，不可以存在多个文件夹，或多个 `.tpl` 文件。

Project Maid 会根据此文件(夹)及其内容，来生成最终的文件。

### 变量

变量是以 `{{}}` 所包含的内容，它会根据创建时的输入，动态替换为相应的内容。这就是我们前文中创建了一个名为 `{{your-name}}-view` 的模板，最终生成了名为 `welcome-view` 的文件的原因。

目前，我们可以使用以下变量：

| 变量名称    | 说明                                     |
| ----------- | ---------------------------------------- |
| yourNameRaw | 用户所输入的名称，原封不动的写入         |
| yourName    | 用户所输入的名称，将被格式化为小驼峰形式 |
| YourName    | 用户所输入的名称，将被格式化为大驼峰形式 |
| your_name   | 用户所输入的名称，将被格式化为下划线形式 |
| your-name   | 用户所输入的名称，将被格式化为中划线形式 |

以上变量，均可以在 `/.pm/templates/你的模板名称` 内部的所有文件夹名称、和 `.tpl` 文件的文件名及内容中使用。

我们可能在使用一些框架，它们同样在使用 `{{}}` 来处理变量，例如 `Vue`、`Blade` 等。我们只需要在前面添加 `\` 进行反转义，这些变量即可不经过 Project Maid 处理。

```php
<!-- PHP Blade Template -->
<h1>\{{ $group->title }}</h1>
```

将输出：

```php
<!-- PHP Blade Template -->
<h1>{{ $group->title }}</h1>
```

### tpl

`tpl` 文件即模板文件，表明此文件将可能使用变量，而并非原封不动的复制。

它的文件名和内容中，均可自由的使用变量，当它被从模板中复制时，会自动删掉文件名中的 `.tpl` 扩展名。

除了变量，你还可以书写注释，注释的内容不会真的生成到实际代码中。

```
{{!-- 我是一行注释 --}}
```

## 待续

## 贡献

- Clone 此仓库

- `npm i` 安装依赖

- 使用 `Visual Studio Code` 打开， 按下 `F5` 或在菜单中选择 `Run > Start Debugging` 开始调试开发

- `npm run package` 打包

- 访问 [扩展商店](https://marketplace.visualstudio.com/)，点击右上角 `Publish extensions` 发布扩展
