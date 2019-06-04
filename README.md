# [Instagram Direct Message Bot]() [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social&logo=twitter)]()

![version](https://img.shields.io/badge/version-1.0.0-blue.svg)  ![license](https://img.shields.io/badge/license-MIT-blue.svg) [![GitHub issues open](https://img.shields.io/github/issues/creativetimofficial/argon-dashboard-nodejs.svg?maxAge=2592000)](https://github.com/creativetimofficial/argon-dashboard-nodejs/issues?q=is%3Aopen+is%3Aissue) [![GitHub issues closed](https://img.shields.io/github/issues-closed-raw/creativetimofficial/argon-dashboard-nodejs.svg?maxAge=2592000)](https://github.com/creativetimofficial/argon-dashboard-nodejs/issues?q=is%3Aissue+is%3Aclosed)

![Product Image](https://s3.amazonaws.com/creativetim_bucket/products/148/original/opt_ad_node_thumbnail.jpg)


## Introduction.

This is Instagram Direct message bot for IG marketing with real user account. Main functions had been built by Node.js. Codebase look like :

1. **`Node.js`** (Back-end platform to integrate the npm modules)
1. **`Express.js`** (Back-end framework to host the http server with `http` module.)
1. **`Postgres `** (Main database to store all data and history from project.)
1. **`Sequelize`** (Database management tools to excute the sql with `NoSQL` type of application)
1. **`EJS`** (Front-end to disply the initialize data and validate all of event by using javascript.)

## Core modules and functions.

### Core modules:
* Used npm modules like this:
    * "bcrypt-nodejs": "0.0.3",
    * "bluebird": "^3.5.4",
    * "body-parser": "^1.19.0",
    * "child_process": "^1.0.2",
    * "cookie-parser": "~1.4.4",
    * "debug": "~2.6.9",
    * "ejs": "^2.6.1",
    * "express": "~4.16.1",
    * "express-ejs-layouts": "^2.5.0",
    * "express-session": "^1.16.1",
    * "http-errors": "~1.6.3",
    * "instagram-private-api": "^0.10.1",
    * "jsonwebtoken": "^8.5.1",
    * "lodash": "^4.17.11",
    * "morgan": "~1.9.1",
    * "passport": "^0.4.0",
    * "passport-jwt": "^4.0.0",
    * "path": "^0.12.7",
    * "pg": "^7.11.0",
    * "pg-hstore": "^2.3.2",
    * "sequelize": "^5.8.6"
### Main techniques:
* Used thread function and related function based core functions:
    * Threading: child process fork function.

        Create bot by fork function:
        ```javascript
        arrBotProcess.push(fork(path.join(__dirname, '[process].js')));
        arrBotProcessName.push(id);

        arrBotProcess[botNum].on('message', function(data) {
            if(data == 1) {
                // Validation part.
            }
        });

        arrBotProcess[botNum].send(sendData);
        ```
        Destroy bot by .kill() function:
        ```javascript
        for(var i = 0; i < arrBotProcessName.length; i++) {    
            
            if(arrBotProcessName[i] == id) {
                arrBotProcess[i].kill(); // destroy bot by id
                arrBotProcessName[i] = "###";
            }
        }

        // loop for bot list and pop empty bot

        arrBotProcessBackup = [];
        arrBotProcessNameBackup = [];

        for(var kk = 0; kk < arrBotProcessName.length; kk++)
        {
            if(arrBotProcessName[kk] != "###")
            {
                arrBotProcessBackup.push(arrBotProcess[kk]);
                arrBotProcessNameBackup.push(arrBotProcessName[kk]);
            }                            
        }
        
        
        // initialize and copy original thread array for bots with backup arraylist
        
        arrBotProcess = [];
        arrBotProcessName = [];

        arrBotProcess = arrBotProcessBackup.slice(0);
        arrBotProcessName = arrBotProcessNameBackup.slice(0);

        ```

    * Promising: get data from instagram using `instagram-private-api`.

        Example for promise
        ```javascript
        var feed = new Client.Feed.Inbox(session);

        var pFeed = new Promise(function(resolve) {
            return resolve(feed.get());
        });

        pFeed.then(function(results) {
            // manufactoring about results.
        });
        ```
    * Recursive function for sysncronization.

        Example for recursive fucntion.
        ```javascript
        async function getNewInbox() {
            countResult--;

            // manufactoring for recursive.

            if(countResult > 0) {
                getNewInbox();
            }
        }
        getNewInbox();
        ```

## Project structure.
### Building express application.
```bash
    express my-new-express-app
```
### Sequelize model structuring
Example of create model and migrate database.
```bash
    sequelize init

    sequelize model:create --name Bots --attributes name:string,filters:string,status:integer

    sequelize db:migrate
```
### Project file structure.
```
.
├── bin
│   └── www
├── config
│   ├── config.json
│   └── env.js
├── controllers
│   ├── apiController.js
│   ├── boardController.js
│   ├── botController.js
│   ├── newBotProcess.js
│   └── userController.js
├── cookies
│   ├── gamer.wraps.json
│   └── super-sean.json
├── migrations
├── models
│   └── 20190530173910-create-user.js
├── node_modules
├── public
│   ├── app
│   │   ├── css
│   │   └── js
│   └── assets
│   │   ├── fonts
│   │   ├── images
│   │   ├── javascripts
│   │   └── stylesheets
├── routes
│   ├── api.js
│   ├── board.js
│   ├── bots.js
│   ├── index.js
│   └── users.js
├── seeders
├── services
│   ├── botService.js
│   ├── dashBoardService.js
│   └── passport.js
├── views
│   ├── pages
│   │   ├── allbots.ejs
│   │   ├── connect.ejs
│   │   ├── dashboard.ejs
│   │   ├── signup.ejs
│   │   └── login.ejs
│   ├── partials
│   │   ├── footer.ejs
│   │   ├── header.ejs
│   │   ├── scripts.ejs
│   │   └── sidebar.ejs
│   └── layout.ejs
├── .sequelizerc
├── package.json
└── README.md
```

### Environment requirements.

* Use:
    * Install npm-installer (https://nodejs.org/en/download/current/).
    * postgres installer (https://www.apachefriends.org/download.html).

### Install global npm modules for migrate database.
* Install nodemon
```bash
    npm install -g nodemon
```
* Install sequelize
```bash
    npm install -g sequelize-cli
```


### How to excute this application?
Follow this steps:
```bash
    # install node modules.
    npm install
    # database migrate.
    sequelize db:migrate
    # application start.
    npm start
```

### UI desing assets..
#### bootstrap 4 material
https://fezvrasta.github.io/bootstrap-material-design/
https://fezvrasta.github.io/bootstrap-material-design/docs/4.0/getting-started/introduction/

#### Font-Awesome url
https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons
https://use.fontawesome.com/releases/v5.0.6/css/all.css
https://material.io/tools/icons/?icon=insert_comment&style=outline
https://www.woolha.com/tutorials/node-js-express-persistent-session-store-with-postgresql-sequelize

### core modules
    - child_process
    - instagram-privat-api ^0.10.1
    - sequelize
    - pg, pg-hstore

### issues

## Change log

Please see the [changelog](CHANGELOG.md) for more information on what has changed recently.

## Credits

- [Creative Tim](https://creative-tim.com/)
- [Under Development Office](https://udevoffice.com/)

## License

[MIT License](https://github.com/laravel-frontend-presets/argon/blob/master/license.md).

## Reporting Issues

We use GitHub Issues as the official bug tracker for the Material Kit. Here are some advices for our users that want to report an issue:

1. Make sure that you are using the latest version of the Material Kit. Check the CHANGELOG from your dashboard on our [website](https://www.creative-tim.com/).
2. Providing us reproducible steps for the issue will shorten the time it takes for it to be fixed.
3. Some issues may be browser specific, so specifying in what browser you encountered the issue might help.

## Licensing

- Copyright 2019 Creative Tim (https://www.creative-tim.com/?ref=adn-readme)

- Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-nodejs/blob/master/LICENSE.md)

## Useful Links

- [Tutorials](https://www.youtube.com/channel/UCVyTG4sCw-rOvB9oHkzZD1w)
- [Affiliate Program](https://www.creative-tim.com/affiliates/new) (earn money)
- [Blog Creative Tim](http://blog.creative-tim.com/)
- [Free Products](https://www.creative-tim.com/bootstrap-themes/free) from Creative Tim
- [Premium Products](https://www.creative-tim.com/bootstrap-themes/premium?ref=adn-readme) from Creative Tim
- [React Products](https://www.creative-tim.com/bootstrap-themes/react-themes?ref=adn-readme) from Creative Tim
- [Angular Products](https://www.creative-tim.com/bootstrap-themes/angular-themes?ref=adn-readme) from Creative Tim
- [VueJS Products](https://www.creative-tim.com/bootstrap-themes/vuejs-themes?ref=adn-readme) from Creative Tim
- [More products](https://www.creative-tim.com/bootstrap-themes?ref=adn-readme) from Creative Tim
- Check our Bundles [here](https://www.creative-tim.com/bundles??ref=adn-readme)

### Social Media

Twitter: <https://twitter.com/CreativeTim?ref=adn-readme>

Facebook: <https://www.facebook.com/CreativeTim?ref=adn-readme>

Dribbble: <https://dribbble.com/creativetim?ref=adn-readme>

Instagram: <https://www.instagram.com/CreativeTimOfficial?ref=adn-readme>

## Credits

- [Creative Tim](https://creative-tim.com/?ref=adn-readme)
- [Under Development Office](https://udevoffice.com/ref=creativetim)
   