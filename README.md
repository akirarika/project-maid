# Project Maid

Project Maid 是一款 Visual Studio Code 扩展，为开发与组织中大型工程，提供了一系列实用工具集，All in One！

> 我们正在开发中，想与我们一起开发、或提出功能建议的，欢迎通过 `issue` 联系，或者在[知乎](https://www.zhihu.com/people/akirarika)私信我，我们加 QQ / 微信好友

### 概述

Project Maid 主要关注中大型工程的组织、开发与协作方面，并提供了一系列实用工具集。

只要在工程的根目录，创建一个 `.pm` 文件夹，并进行简单的配置，即可启用 Project Maid。

你可以将 `.pm` 文件夹一同提交到版本控制工具中，这样整个工程成员，都将共享相关配置。

具体用法，敬请阅读你感兴趣的功能章节。

### 安装

在 Visual Studio Code 扩展商店中，搜索 `project-maid` 并安装即可。或者[点击此处](https://marketplace.visualstudio.com/items?itemName=akirarika.project-maid)

## 功能列表 (Todo)

- [x] 模板功能：通过模板创建文件夹

- [x] 模板功能：通过模板创建文件

- [x] 模板功能：创建模板后，自动修改某些文件，如添加路由等

- [x] Git 功能：一键提交至所选分支，**并切换回原分支**

- [x] Git 功能：Commit 模板功能，并约束 Commit 格式

- [x] Git 功能：在 Commit 前，运行指定 Shell 脚本

- [ ] 文档功能：根据注释生成 .md 文档

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

### 单文件模板

前文中，我们的模板是以文件夹为单位的，有时我们不需要新建一个文件夹，只需要新建一个文件。

我们只需要将前文中的模板文件夹，更换为一个以 .tpl 为结尾的文件即可。

```sh
> /.pm/templates/vue/{{YourName}}.vue.tpl
```

我们总结一下：

我们可以通过模板功能，来**新建文件**和**新建文件夹**。其中：

- `/.pm/templates/模板名称` 下，有且只有一个文件夹，那么此模板，将新建此文件夹

- `/.pm/templates/模板名称` 下，有且只有一个 `.tpl` 结尾的模板文件，那么此模板，将新建此文件

### 模板变量

变量是以 `{{}}` 所包含的内容，它会根据创建时的输入，动态替换为相应的内容。这就是我们前文中创建了一个名为 `{{your-name}}-view` 的模板，最终生成了名为 `welcome-view` 的文件的原因。

目前，我们可以使用的变量，可以在 [模板变量](https://github.com/akirarika/project-maid/tree/master/docs/template-vars.md) 中查阅。

Project Maid 会在两种情况下，尝试使用模板变量，分别是：

- `/.pm/templates/你的模板名称/*` 中所有文件夹，会尝试在其名称中使用模板变量。最终生成的文件夹的实际名称，是被模板变量替换过的。

- `/.pm/templates/你的模板名称/*` 中所有以 `.tpl` 结尾的文件，会尝试在其文件名称、和其内容中，使用模板变量。最终生成的文件名，会删去 `.tpl`。

- `/.pm/templates/你的模板名称/*` 中，不以 `.tpl` 结尾的文件，将被**原封不动的复制**。

#### 反转义

我们可能在使用一些框架，它们同样在使用 `{{}}` 来处理变量，例如 `Vue`、`Blade` 等。我们只需要在前面添加 `\` 进行反转义，这些变量即可不经过 Project Maid 处理。

```php
<!-- PHP Blade Template -->
<h1>\{{ $group->title }}</h1>
```

将输出以下内容，可以看到，变量未被处理，同时转义符被删去：

```php
<!-- PHP Blade Template -->
<h1>{{ $group->title }}</h1>
```

#### 注释

除了变量，你还可以书写注释，注释的内容不会真的生成到实际代码中。

```
{{!-- 我是一行注释 --}}
```

### 修改其他文件

在创建模板后，我们可能还需要更新一些其他文件，例如添加路由。目前有三种方式完成此步骤的自动化，分别是更新 JSON 文件、生成代码文件 (可根据 JSON 生成) 和执行指定命令。

#### 更新 JSON 文件

通过配置此功能，我们可以实现当我们新建模板时，自动在此 JSON 文件中追加内容。

修改 `config.yaml` 文件，例如 `/.pm/template/FooTemplate/config.yaml`（如果不存在，创建即可）

```yaml
appendConfigs:
  - filePath: app.json # 文件路径，可填写绝对路径，相对路径以当前工程根目录为起始
    append: | # 追加的 JSON 内容，其中可使用模板变量
      {
        "navigationBarBackgroundColor": "#ffffff",
        "navigationBarTextStyle": "black",
        "navigationBarTitleText": "{{ YourName }}",
        "backgroundColor": "#eeeeee",
        "backgroundTextStyle": "light"
      }
    space: 2 # 可选，最终 JSON 中缩进的空格数，默认为 2
    appendPath: ["foo", "bar"] # 可选，向哪个层级中追加，被添加的层级必须是数组，默认认为 JSON 根层是一个数组，在根层追加
  # ...
```

#### 生成文件 (基于 JSON 文件)

通过配置此功能，我们可以实现，在新建模板之后，自动在指定位置生成文件。

假设，我们拥有一个 `/configs/views.json` 文件，内容如下：

```json
[
  {
    "name": "foo",
    "file": "/src/views/Foo.vue"
  },
  {
    "name": "bar",
    "file": "/src/views/Bar.vue"
  },
  {
    "name": "baz",
    "file": "/src/views/Baz.vue"
  }
]
```

接下来，我们尝试实现以下功能：

- 使用模板新建文件，自动向 `/configs/views.json` 内追加内容。

- 根据 `/configs/views.json` 中的内容，生成 `router/index.js` 文件的代码。

修改 `config.yaml` 文件，例如 `/.pm/template/FooTemplate/config.yaml`（如果不存在，创建即可）

```yaml
# 我们先设置，每次新建模板后更新此 JSON 文件
appendConfigs:
  - filePath: configs/views.json
    append: |
      {
        "name": "{{your-name}}",
        "file": "/{{path}}/{{YourName}}.vue"
      }
# 接着，我们配置如何生成文件
rewritedFiles:
  - filePath: router/index.js # 文件生成位置。若此位置的文件存在，将覆盖。可填写绝对路径，相对路径以当前工程根目录为起始
    jsons: # 可选，将这些 json 文件注入到模板变量中。我们这里使用 appendConfigs 中刚刚更新的 JSON 文件
      - name: yourJsonVarViews # 名称，可在模板中直接使用此名称，来使用变量
        path: configs/views.json # 文件路径，可填写绝对路径，相对路径以当前工程根目录为起始
    rewrite: | # 文件模板内容
      /* ======== WARNING ======== */
      /* The contents of this file are generated according to /configs/views.json. Please do not modify this file directly */

      import { createRouter, createWebHistory } from 'vue-router';
      {{#each views}}
      import {{this.name}} from '{{this.file}}';
      {{/each}}

      const routes = [
      {{#each yourJsonVarViews}}
        {
          name: '{{this.name}}',
          path: '/{{this.name}}',
          component: {{this.name}},
        },
      {{/each}}
      ];

      const router = createRouter({
        history: createWebHistory(),
        routes: routes,
      });

      export default router;
  # ...
```

你可能注意到了，我们在 `rewrite` 中不但可以使用 [模板变量](https://github.com/akirarika/project-maid/tree/master/docs/template-vars.md)，还将 JSON 文件内容转为了变量，在其中使用。另外，我们还还通过 `#each` 来遍历 JSON，最终生成出我们所期望的文件。

#### 执行指定命令

尽管，前文所述的两种方法已经可以满足大部分场景，但有时，我们还需要更加可自定义的方式完成我们想要的操作。例如，当我们创建一个模型文件后，我们需要运行框架的命令，从数据库中自动读取并配置此模型对应的列。

我们可以配置一个挂钩，在模板创建阶段结束后，挂钩中的所有命令都将被按顺序执行。

配置命令时，我们同样可以使用 [模板变量](https://github.com/akirarika/project-maid/tree/master/docs/template-vars.md)。

修改 `config.yaml` 文件，例如 `/.pm/template/FooTemplate/config.yaml`（如果不存在，创建即可）

```yaml
createdHooks:
  - echo hello-{{YourName}}-1 # 要执行的命令，我们同样可以使用模板变量
  # ...
```

## Git 功能

在 `/.pm/templates/git` 中，创建一个 `config.yaml` 文件，即可启用 Git 功能。

其中，只要声明工程中，拥有的分支即可（这些分支甚至不需要你事先创建）。

```yaml
branches:
  - master
  - developer
  - producer
```

### 一键提交

Project Maid 可以帮你，将你工程中所有的更改，一键提交。

它会帮你将当前工程中所有的更改提交到暂存区、并提交、并推送到远程仓库的指定分支。

如果你选择的分支不是当前分支，它还会同时帮你推送到当前分支的远程分支。

只需要点击右上角的 Git 图标即可。

### Commit 模板

你可以为使用者提供模板，并指定 Commit 的格式。

Commit 时分为两部分，`scopes` 和 `subject`。

`scopes` 用来描述本次提交的更改范畴，`subject` 用来描述其具体事务。

默认的 `scopes` 如下：

```js
["✨ feat", "🔧 fix", "📝 docs", "🎨 style", "⚡️ perf", "✅ test", "🐳 chore", "🚀 build", "🔨 refactor", "🎉 init"];
```

默认的 `subject` 是空字符串，须使用者手动填写。

你可以在 `config.yaml` 中自定义它们：

```yaml
scopes:
  - 新增功能
  - 修复问题
  - 补充文档
subject: 更新内容
```

默认的消息组成格式是 `{{scope}}: {{subject}}`，你同样可以在 `config.yaml` 中自定义，例如：

```yaml
message: 【{{scope}}】{{subject}}
```

### 前置钩子

你可以在提交前执行任意命令，只要在 `config.yaml` 中自定义，例如：

```yaml
prehooks: echo {{branch}}
```

其中命令所执行的目录为，当前工程的根目录。

### 变量

在 `config.yaml` 中的 `message` 字段和 `prehooks` 字段中，我们同样可以使用变量。

目前，我们可以使用的变量可以在 [Git 变量](https://github.com/akirarika/project-maid/tree/master/docs/git-vars.md) 中查阅。

## 待续

<!--

## 贡献

- Clone 此仓库

- `npm i` 安装依赖

- 使用 `Visual Studio Code` 打开， 按下 `F5` 或在菜单中选择 `Run > Start Debugging` 开始调试开发

- `npm run package` 打包

- 访问 [扩展商店](https://marketplace.visualstudio.com/)，点击右上角 `Publish extensions` 发布扩展

-->
