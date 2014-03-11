var util = require("util");
var path = require("path");
var yeoman = require("yeoman-generator");
var chalk = require("chalk");


var TeslarGenerator = function(args, options, config) {
  "use strict";
  yeoman.generators.Base.apply(this, arguments);

  // setup the test-framework property, Gruntfile template will need this
  this.testFramework = options["test-framework"] || "mocha";
  this.coffee = options.coffee;

  // for hooks to resolve on mocha by default
  options["test-framework"] = this.testFramework;

  // resolved to mocha by default (could be switched to jasmine for instance)
  this.hookFor("test-framework", {
    as: "app",
    options: {
      options: {
        "skip-install": options["skip-install-message"],
        "skip-message": options["skip-install"]
      }
    }
  });

  this.options = options;
  
  this.pkg = require("../package.json");
};

TeslarGenerator.prototype.askFor = function () {
  var done = this.async();

  // have Yeoman greet the user
  this.log(this.yeoman);

  // replace it with a short and sweet description of your generator
  this.log(chalk.magenta("You are using Teslar generator. This is an opnionated generator using jQuery, handlebars, mocha and Grunt.js to build your app."));

  var prompts = [{
    type: "confirm",
    name: "features",
    message: "What more would you like?",
    choices: [{
      name: "Sass with Compass",
      value: "includeCompass",
      checked: false
    }, {
      name: "Modernizr",
      value: "includeModernizr",
      checked: false
    }]
  }];

  this.prompt(prompts, function (answers) {
    var features = answers.features;

    function hasFeature(feat) { return features.indexOf(feat) !== -1; }

    this.includeCompass = hasFeature("includeCompass");
    this.includeModernizr = hasFeature("includeModernizr");
    
    done();
  }.bind(this));
};

TeslarGenerator.prototype.gruntfile = function gruntfile() {
  this.template("Gruntfile.js");
};

TeslarGenerator.prototype.packageJSON = function packageJSON() {
  this.template("_package.json", "package.json");
};


TeslarGenerator.prototype.git = function git() {
  this.copy("gitignore", ".gitignore");
  this.copy("gitattributes", ".gitattributes");
};

TeslarGenerator.prototype.bower = function bower() {
  this.copy("bowerrc", ".bowerrc");
  this.copy("_bower.json", "bower.json");
};

TeslarGenerator.prototype.jshint = function jshint() {
  this.copy("jshintrc", ".jshintrc");
};

TeslarGenerator.prototype.editorConfig = function editorConfig() {
  this.copy("editorconfig", ".editorconfig");
};

TeslarGenerator.prototype.h5 = function() {
  this.copy("favicon.ico", "app/favicon.ico");
  this.copy("robots.txt", "app/robots.txt");
};

TeslarGenerator.prototype.mainStylesheet = function mainStylesheet() {
  var css = "main." + (this.includeCompass ? "s" : "") + "css";
  this.copy(css, "app/styles/" + css);
};

TeslarGenerator.prototype.writeIndex = function writeIndex() {

  this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), "index.html"));
  this.indexFile = this.engine(this.indexFile, this);

  this.indexFile = this.appendFiles({
    html: this.indexFile,
    fileType: "js",
    optimizedPath: "scripts/main.js",
    sourceFileList: ["scripts/main.js"],
    searchPath: "{app,.tmp}"
  });
};

TeslarGenerator.prototype.app = function app() {
  this.mkdir("app");
  this.mkdir("app/scripts");
  this.mkdir("app/styles");
  this.mkdir("app/images");
  this.write("app/index.html", this.indexFile);
  
  this.write("app/scripts/main.js", "console.log(\"Hello from Teslar!\");");
  
};

TeslarGenerator.prototype.install = function () {
  if (this.options["skip-install"]) {
    return;
  }

  var done = this.async();
  this.installDependencies({
    skipMessage: this.options["skip-install-message"],
    skipInstall: this.options["skip-install"],
    callback: done
  });
};



module.exports = TeslarGenerator;