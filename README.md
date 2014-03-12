# generator-teslar [![Build Status](https://secure.travis-ci.org/RobinQu/generator-teslar.png?branch=master)](https://travis-ci.org/RobinQu/generator-teslar)

> An opinonated [Yeoman](http://yeoman.io) generator that boosts your devlopment and deployment


## Getting Started

To install generator-teslar from npm, run:

```
$ npm install -g generator-teslar
```

Finally, initiate the generator:

```
$ yo teslar
```

## Features

Lots of features are copied from [generator-webapp](https://github.com/yeoman/generator-webapp):

* CSS Autoprefixing
* Preview with livereload
* Compass Compile
* JSHint
* Wireup your bower components
* Image optmization
* Mocha unit testing
* Modernizr builds

Unique features:

* Hanldebar rendering
* Deployment support
  * Build-control over Git
  * SFTP
* Assets path replacement with CDN prefix

## Frameworks

Optional CSS Frameworks

* YUI Pure
* Foundation 5

## Deployment

* [grunt-buildcontrol](https://github.com/robwierzbowski/grunt-build-control/) helps you transfer your build to a specific Git remote/branch
* [grunt-cdn](https://github.com/tactivos/grunt-cdn) helps you to prefix your CSS/Javascript paths with your CDN location
* [grunt-ssh](https://github.com/andrewrjones/grunt-ssh) helps you to deploy your build to SFTP server

## License

MIT