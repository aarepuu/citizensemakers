# citizensemakers

Sensemaking of shared personal informatics - [LIVE DEMO](https://citizensemakers.co.uk)

This project was generated with the [Angular Full-Stack Generator](https://github.com/DaftMonk/generator-angular-fullstack) version 3.7.6.

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node ^4.2.3, npm ^2.14.7
- [Bower](bower.io) (`npm install --global bower`)
- [Gulp](http://gulpjs.com/) (`npm install --global gulp`)
- [MongoDB](https://www.mongodb.org/) - Keep a running daemon with `mongod`

Deployment
- [PM2](http://pm2.keymetrics.io/) - use ecosystem.json to run node in production


### Developing

1. Run `npm install` to install server dependencies.

2. Run `bower install` to install front-end dependencies.

3. Run `mongod` in a separate shell to keep an instance of the MongoDB Daemon running

4. Modify local.env.sample.js config with your settings

5. Run `gulp serve` to start the development server. It should automatically open the client in your browser when ready.

## Build and development

Run `gulp build --env [development|production]` for building and `gulp serve` for preview.

## Testing

Running `npm test` will run the unit tests with karma.

## Deploying

1. Modify ecosystem.sample.json for your settings
2. Run deploy to get the code from git
3. pm2 startOrRestart ecosystem.json --env production

## How to reference

Aare Puussaar, Adrian K. Clear, and Peter Wright. 2017. Enhancing Personal Informatics Through Social Sensemaking. In Proceedings of the 2017 CHI Conference on Human Factors in Computing Systems (CHI '17). ACM, New York, NY, USA, 6936-6942. DOI: https://doi.org/10.1145/3025453.3025804

## License

This project is funded by [EPSRC](https://www.epsrc.ac.uk/) and licensed under the [MIT License](https://github.com/aarepuu/citizensemakers/blob/master/LICENSE).

