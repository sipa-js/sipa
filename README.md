![SIMPARTIC Particularly simple web framework](doc/_assets/_raw/logo_doc.svg)<br>
[![NPM version](https://img.shields.io/npm/v/simpartic?color=63a618&style=plastic&logo=npm)](https://www.npmjs.com/package/simpartic)
![NPM downloads](https://img.shields.io/npm/dt/simpartic?color=dce2df&style=plastic)
[![License: LGPLv3](https://img.shields.io/badge/License-LGPLv3-fabd09.svg?style=plastic)](LICENSE)

> Particularly simple old school single page lightweight web framework for clever javascript developers.

You need to be clever to understand why this framework is that party(cular) you want to have.

But I allow you to use it anyway!

```diff
------------------------------------------
- in development, beta state. 
------------------------------------------
```

**TALBE OF CONTENTS**
* [Why Simpartic?](#why-simpartic)
    * [Main features](#main-features)
    * [Shipped libraries](#shipped-libraries)
* [Installation](#installation)
* [Setup a new project](#setup-a-new-project)
* [Documentation](#documentation)
  * [Contributors](doc/contributors.md)
  * [Developers](doc/developers.md) ![State](https://img.shields.io/badge/-progress-yellow)
* [Contributing](#contributing)




<!-- -------------------------- SECTION -------------------------- -->
<a name="why-simpartic"></a>
## Why Simpartic?
I just want to develop with Javascript: The code i write IS the code i run in the browser. 

Writing Javascript and HTML the old way! So I can directly run and debug my code in the browser. Instant!

Intensive transpiling (minifying) will (can!) finally happen when creating a production build. I even can create a single file production build out of the box! (Feature not yet implemented)

I don't want to learn a new framework world.
I can JavaScript, I want to do JavaScript. I want it simple, I want it stupid easy. So i can add whatever I want if I need to.

A framework that gives me a frame, but doesnt force me into it.

... and at the end I want to be happy! :-)




<!-- -------------------------- SECTION -------------------------- -->
<a name="main-features"></a>
### Main features
* Solid basic project structure
* Simple but powerful page pattern structure with loader / router
* Live development web server for JavaScript and SCSS
* Life cycle with hook feature
* Internationalization out of the box ![State](https://img.shields.io/badge/-todo-blue)
* Global state storage to keep state on three different persistence levels 
* Builder to create compressed and minified .js and .css for production 
* Optionally:
  * EJS template engine (optional) ![State](https://img.shields.io/badge/-prepared-blue)
  * Good old jQuery


To get an overview and idea about the framework, have a look at the [introduction]().


<!-- -------------------------- SECTION -------------------------- -->
<a name="installation"></a>
## Installation
### Prerequisites
[NodeJS](https://nodejs.org/en/download/) >= **13.x** and [Yarn](https://classic.yarnpkg.com/en/docs/install/) **1.x** are installed.
You may use npm instead of yarn.

### Install the framework with yarn
```bash
yarn global add simpartic
```

#### Add to PATH environment variable

You have to ensure, that the path of yarns bin directory is added to PATH.

#### Linux/Unix/MacOS

If the command `sipa` is not available after installation, add the following line to your shell config if you are using linux/macOS/unix (`~/.bashrc`, `~/.zshrc`/...):
```shell
export PATH="$(yarn global bin):$PATH"
```

#### Windows
Run `yarn global bin` and add the returned PATH to your global PATH environment variable.


### Install the framework with npm
```bash
npm install -g simpartic
```

Depending on your global npm directory, you may need to run this command with sudo or as root:
```bash
sudo npm install -g simpartic
```

### After installing with yarn or npm

That's it!

The command `sipa` (and its long version `simpartic`) is now available on the command line.

Run `sipa help` for more information.

Or get started with our tutorial in the [developer documentation](doc/developers.md).




<!-- -------------------------- SECTION -------------------------- -->
<a name="setup-a-new-project"></a>
## Setup a new project
On the commandline run
```bash
sipa new
```
to create a new project as subfolder of the current directory.

A interactive setup assists you and generates the project depending on your input.




<!-- -------------------------- SECTION -------------------------- -->
<a name="documentation"></a>
## Documentation
* [Contributors](doc/contributors.md)
* [Developers](doc/developers.md) ![State](https://img.shields.io/badge/-progress-yellow)



<!-- -------------------------- SECTION -------------------------- -->
<a name="contributing"></a>
## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/magynhard/simpartic. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

More technical information to setup, you can find in the [contributors dcoumentation](doc/contributors.md).




