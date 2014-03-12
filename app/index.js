/*global __dirname */

var util = require("util");
var path = require("path");
var yeoman = require("yeoman-generator");
var chalk = require("chalk");
var cheerio = require("cheerio");


var TeslarGenerator = yeoman.generators.Base.extend({
  
  constructor: function(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);
    // setup the test-framework property, Gruntfile template will need this
    this.testFramework = options["test-framework"] || "mocha";
    options["test-framework"] = this.testFramework;
    
    this.options = options;
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
    
    this.pkg = require("../package.json");
  },
  
  init: function() {
    
    this.teslar = this.readFileAsString(path.join(__dirname, "./TESLAR"));
  },
  
  askFor: function () {
      var done = this.async();

      this.log(this.teslar);

      // replace it with a short and sweet description of your generator
      this.log(chalk.magenta("You are using Teslar generator. This is an opnionated generator using jQuery, handlebars, mocha and Grunt.js to build your app."));

      var prompts = [{
        type: "checkbox",
        name: "features",
        message: "What more would you like? (Mutiple choices)",
        choices: [{
          name: "Sass with Compass",
          value: "includeCompass",
          checked: true
        }, {
          name: "Modernizr",
          value: "includeModernizr",
          checked: true
        }, {
          name: "RequreJS",
          value: "includeRequireJS",
          checked: false
        }]
      }, {
        name: "css",
        type: "list",
        message: "What CSS framework would like? (Single Choice)",
        choices: [{
          name: "None",
          value: "includeNoCSS",
          checked: true
        }, {
          name: "Foundation5 (IE9+ Compatible)",
          value: "includeFoundation",
          checked: false 
        }, {
          name: "YUI Pure (IE7+ Compatible)",
          value: "includePure",
          checked: false
        }]
      }, {
        name: "handlebar",
        type: "checkbox",
        message: "Handlebar related options (Multiple choices)",
        choices: [{
          name: "Precompile handlebars template for browser scripts",
          value: "renderHandlebarinBrowser",
          checked: false
        }, {
          name: "Render view with Handlebar in Grunt server and production server",
          value: "renderWithHandlebarInGrunt",
          checked: false
        }]
      }, {
        name: "deploy",
        type: "checkbox",
        message: "Deployment related options (Mutiple choices)",
        choices: [{
          name: "Prefix assets path with CDN url in HTML and CSS",
          checked: false,
          value: "deployWithCDN"
        }, {
          name: "Deploy with Build Control",
          checked: false,
          value: "deployWithBuildControl"
        }, {
          name: "Deploy with SFTP",
          checked: false,
          value: "deployWithSFTP"
        }]
        
      }];

      this.prompt(prompts, function (answers) {
        function hasFeature(feat) { 
          var key;
          for(key in answers) {
            if(answers.hasOwnProperty(key) && answers[key].indexOf(feat) !== -1) {
              return true;
            }
          }
          return false;
        }
        
        
        // frameworks
        this.includeCompass = hasFeature("includeCompass");
        this.includeModernizr = hasFeature("includeModernizr");
        this.includeFoundation = hasFeature("includeFoundation");
        this.includePure = hasFeature("includePure");
        this.includeRequireJS = hasFeature("includeRequireJS");
        
        
        // handlebars
        this.renderWithoutHandlebars = hasFeature("renderWithoutHandlebars");
        this.renderHandlebarinBrowser = hasFeature("renderHandlebarinBrowser");
        this.renderWithHandlebarInGrunt = hasFeature("renderWithHandlebarInGrunt");
        
        // deployment
        this.deployWithCDN = hasFeature("deployWithCDN");
        this.deployWithBuildControl = hasFeature("deployWithBuildControl");
        this.deployWithSFTP = hasFeature("deployWithSFTP");
        this.noActualDeployment = !(this.deployWithBuildControl || this.deployWithSFTP);
        done();
      }.bind(this));
  },
  
  gruntfile: function() {
    this.template("Gruntfile.js");
  },
  
  packageJSON: function() {
    this.template("_package.json", "package.json");
  },
  
  git: function() {
    this.copy("gitignore", ".gitignore");
    this.copy("gitattributes", ".gitattributes");
  },
  
  bower: function() {
    this.copy("bowerrc", ".bowerrc");
    this.copy("_bower.json", "bower.json");
  },
  
  
  jshint: function() {
    this.copy("jshintrc", ".jshintrc");
  },
  
  editorConfig: function() {
    this.copy("editorconfig", ".editorconfig");
  },
  
  h5: function() {
    this.copy("favicon.ico", "app/favicon.ico");
    this.copy("robots.txt", "app/robots.txt");
  },
  
  mainStylesheet: function() {
    if(this.includeCompass) {
      if(this.includeFoundation) {
        this.copy("_settings.scss", "app/styles/_settings.scss");
      }
      this.template("main.scss", "app/styles/main.scss");
    } else {
      this.copy("main.css", "app/styles/main.css");
    }
  },
  
  writeIndex: function() {
    if(this.renderWithHandlebarInGrunt) {
      this.mkdir("app/hbs_helpers");
      // this.bulkDirectory("hbs", "app/hbs");
      
      //TODO better way to insert script block into HBS files
      this.scriptHbs = this.engine(this.readFileAsString(path.join(this.sourceRoot(), "hbs/shared/script.hbs")), this);
      var $ = cheerio.load(this.scriptHbs);
        
      $("script:last-child").after(this.generateBlock("js", "scripts/main.js", "<script src='scripts/main'></script>", "{app,.tmp}"));
      this.scriptHbs = $.html();
      
      this.write("app/hbs/shared/script.hbs", this.scriptHbs);
      // update index file
      this.template("hbs/index.hbs", "app/hbs/index.hbs");
      this.template("hbs/shared/style.hbs", "app/hbs/shared/style.hbs");
      // this.template("hbs/shared/script.hbs", "app/hbs/shared/script.hbs");
      this.template("hbs/shared/meta.hbs", "app/hbs/shared/meta.hbs");
      
      
    } else {
      this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), "index.html"));
      this.indexFile = this.engine(this.indexFile, this);

      this.indexFile = this.appendFiles({
        html: this.indexFile,
        fileType: "js",
        optimizedPath: "scripts/main.js",
        sourceFileList: ["scripts/main.js"],
        searchPath: "{app,.tmp}"
      });
      this.write("app/index.html", this.indexFile);
    }
  },
  
  app: function() {
    this.mkdir("app");
    this.mkdir("app/scripts");
    this.mkdir("app/styles");
    this.mkdir("app/images");
    // this.write("app/scripts/main.js", "console.log(\"Hello from Teslar!\");");
    this.template("main.js", "app/scripts/main.js");
  },
  
  hbs: function() {
    if(this.renderHandlebarinBrowser) {
      this.mkdir("app/scripts/hbs");
      this.write("app/scripts/hbs/teslar.hbs", "I'm {{name}}!");
    }
    if(!this.renderWithoutHandlebars) {
      this.mkdir("app/fixtures");
      this.write("app/fixtures/index.json", JSON.stringify({"name":"Teslar"}));
    }
  },
  
  install: function () {
    if (this.options["skip-install"]) {
      return;
    }

    var done = this.async();
    this.installDependencies({
      skipMessage: this.options["skip-install-message"],
      skipInstall: this.options["skip-install"],
      callback: done
    });
  },
  
  gitrevision: function() {
    this.on("end", function() {
      this.log(chalk.magenta("Hint"), "You can refer to git revision in Gruntfile using template string as '<%= meta.revision %>'!");
    }.bind(this));
  },
  
  sftp: function() {
    this.on("end", function() {
      this.copy("ssh.json", ".sshconfig");
      this.log(chalk.magenta("Hint"), "SFTP deployment is checked. You should setup your deployment path!");
      this.log(chalk.magenta("Hint"), "SFTP deployment is checked. You should setup your credential in .sshconfig!");
    }.bind(this));
  },
  
  cdn: function() {
    this.on("end", function() {
      this.log(chalk.magenta("Hint"), "CDN Prefixing is checked. You should setup your CDN prefix in Gruntfile!");
    }.bind(this));
  }
  
});


module.exports = TeslarGenerator;