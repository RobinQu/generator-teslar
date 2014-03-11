// Generated on <%= (new Date).toISOString().split("T")[0] %> using <%= pkg.name %> <%= pkg.version %>


// # Globbing
// for performance reasons we"re only matching one level down:
// "test/spec/{,*/}*.js"
// use this if you want to recursively match all subfolders:
// "test/spec/**/*.js"

module.exports = function (grunt) {
    "use strict";
    
    <% if (renderWithHandlebarInGrunt) { %>
    var mwFactory = function(opt) {
      return function(connect, options) {
        var mws = [],
          directory = options.directory || options.base[options.base.length - 1];
  
        options.base.forEach(function(base) {
          mws.push(connect.static(base));
        });
        mws.push(hw(opt));
        mws.push(connect.directory(directory));
        return mws;
      };
    };
    <% } %>

    // Load grunt tasks automatically
    require("load-grunt-tasks")(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require("time-grunt")(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({
        
      // Project settings
      config: {
          // Configurable paths
          app: "app",
          dist: "dist"
      },
      
      revision: {
        options: {
          property: "meta.revision",
          ref: "HEAD",
          short: true
        }
      },
      
      <% if (renderHandlebarinBrowser) { %>
      handlebars: {
        compile: {
          options: {
            namespace: "templates",
            processName: function(fp) {
              var s = fp.substr("app/scripts/hbs/".length).split(".");
              s.pop();
              return s.join("/");
            }
          },
          files: {
            ".tmp/scripts/templates.js": ["<%%= config.app %>/scripts/hbs/*.hbs"]
          }
        }
      },
      <% } %>
      
      <% if (deployWithBuildControl) { %>
        buildcontrol: {
          options: {
            dir: "dist",
            commit: true,
            push: true,
            message: "Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%"
          },
          dist: {
            options: {
              // Setup your remote for git repo here
              remote: "",
              branch: "dist"
            }
          }
        },
      <% } %>
      
      <% if (deployWithCDN) { %>
      cdn: {
        options: {
          flatten: true
        },
        dist: {
          options: {
            // Replace the address with correct CDN path
            cdn: "http://your-cdn-prefix/<%%= meta.revision %>",
            ignorePath: [
              // empty hash
              /\#/
            ]
          },
          src: [
            "<%%= config.dist %>/hbs/**/*.hbs",
            "<%%= config.dist %>/{,*/}*.html",
            "<%%= config.dist %>/styles/{,*/}*.css"
          ]
        }
      },
      <% } %>
      
      <% if (deployWithSFTP) { %>
      //See complete docs at https://github.com/andrewrjones/grunt-ssh
      
      sshsecrets: grunt.file.readJSON(".sshconfig"),
      sftp: {
        deploy: {
          files: {
            "./": "<%%= config.dist %>/<%= meta.revision %>/**"
          },
          options: {
            // Deploy path is what you should setup
            path: "",
            host: "<%%= sshsecrets.host %>",
            username: "<%%= sshsecrets.username %>",
            password: "<%%= sshsecrets.password %>",
            createDirectories: true,
            showProgress: true,
            srcBasePath: "<%%= config.dist %>/"
          }
        }
      },<% } %>
      
      // Watches files for changes and runs tasks based on the changed files
      watch: {
          js: {
              files: ["<%%= config.app %>/scripts/{,*/}*.js"],
              tasks: ["jshint"],
              options: {
                  livereload: true
              }
          },
          jstest: {
              files: ["test/spec/{,*/}*.js"],
              tasks: ["test:watch"]
          },
          gruntfile: {
              files: ["Gruntfile.js"]
          },<% if (includeCompass) { %>
          compass: {
              files: ["<%%= config.app %>/styles/{,*/}*.{scss,sass}"],
              tasks: ["compass:server", "autoprefixer"]
          },<% } %>
          styles: {
              files: ["<%%= config.app %>/styles/{,*/}*.css"],
              tasks: ["newer:copy:styles", "autoprefixer"]
          },
          livereload: {
              options: {
                  livereload: "<%%= connect.options.livereload %>"
              },
              files: [
                  "<%%= config.app %>/{,*/}*.html",
                  ".tmp/styles/{,*/}*.css",
                  "<%%= config.app %>/images/{,*/}*"
              ]
          }
      },

      // The actual grunt server settings
      connect: {
          options: {
              port: 9000,
              livereload: 35729,
              // Change this to "localhost" to restrict access from outside
              hostname: "0.0.0.0"
          },
          livereload: {
              options: {
                  open: false,
                  base: [
                      ".tmp",
                      "<%%= config.app %>"
                  ]<% if (renderWithHandlebarInGrunt) { %>,
                  middleware: mwFactory({
                    source: "./app/hbs",
                    fixtures: "./test/fixtures",
                    helpers: "./app/hbs_helpers/*.js"
                  })
                  <% } %>
              }
          },
          test: {
              options: {
                  port: 9001,
                  base: [
                      ".tmp",
                      "test",
                      "<%%= config.app %>"
                  ]
              }
          },
          dist: {
              options: {
                  open: true,
                  base: "<%%= config.dist %>",
                  livereload: false<% if (renderWithHandlebarInGrunt) { %>,
                  middleware: mwFactory({
                    source: "./dist/hbs",
                    fixtures: "./test/fixtures",
                    helpers: "./app/hbs_helpers/*.js"
                  })<% } %>
              }
          }
      },

      // Empties folders to start fresh
      clean: {
          dist: {
              files: [{
                  dot: true,
                  src: [
                      ".tmp",
                      "<%%= config.dist %>/*",
                      "!<%%= config.dist %>/.git*"
                  ]
              }]
          },
          server: ".tmp",
          revision: {
            files: [{
              dot: true,
              expand: true,
              cwd: "<%%= config.dist %>",
              dest: "<%%= config.dist %>",
              src: [
                "*",
                "!<%= meta.revision %>",
                "!hbs",
                "<%= meta.revision %>/hbs",
              ]
            }]
          }
      },

      // Make sure code styles are up to par and there are no obvious mistakes
      jshint: {
          options: {
              jshintrc: ".jshintrc",
              reporter: require("jshint-stylish")
          },
          all: [
              "Gruntfile.js",
              "<%%= config.app %>/scripts/{,*/}*.js",
              "!<%%= config.app %>/scripts/vendor/*",
              "test/spec/{,*/}*.js"
          ]
      },<% if (testFramework === "mocha") { %>

      // Mocha testing framework configuration options
      mocha: {
          all: {
              options: {
                  run: true,
                  urls: ["http://<%%= connect.test.options.hostname %>:<%%= connect.test.options.port %>/index.html"]
              }
          }
      },<% } else if (testFramework === "jasmine") { %>

      // Jasmine testing framework configuration options
      jasmine: {
          all: {
              options: {
                  specs: "test/spec/{,*/}*.js"
              }
          }
      },<% } %><% if (includeCompass) { %>

      // Compiles Sass to CSS and generates necessary files if requested
      compass: {
          options: {
              sassDir: "<%%= config.app %>/styles",
              cssDir: ".tmp/styles",
              generatedImagesDir: ".tmp/images/generated",
              imagesDir: "<%%= config.app %>/images",
              javascriptsDir: "<%%= config.app %>/scripts",
              fontsDir: "<%%= config.app %>/styles/fonts",
              importPath: "<%%= config.app %>/bower_components",
              httpImagesPath: "/images",
              httpGeneratedImagesPath: "/images/generated",
              httpFontsPath: "/styles/fonts",
              relativeAssets: false,
              assetCacheBuster: false
          },
          dist: {
              options: {
                  generatedImagesDir: "<%%= config.dist %>/images/generated"
              }
          },
          server: {
              options: {
                  debugInfo: true
              }
          }
      },<% } %>

      // Add vendor prefixed styles
      autoprefixer: {
          options: {
              browsers: ["last 1 version"]
          },
          dist: {
              files: [{
                  expand: true,
                  cwd: ".tmp/styles/",
                  src: "{,*/}*.css",
                  dest: ".tmp/styles/"
              }]
          }
      },

      // Renames files for browser caching purposes
      rev: {
          dist: {
              files: {
                  src: [
                      "<%%= config.dist %>/scripts/{,*/}*.js",
                      "<%%= config.dist %>/styles/{,*/}*.css",
                      "<%%= config.dist %>/images/{,*/}*.*",
                      "<%%= config.dist %>/styles/fonts/{,*/}*.*",
                      "<%%= config.dist %>/*.{ico,png}"
                  ]
              }
          }
      },

      // Reads HTML for usemin blocks to enable smart builds that automatically
      // concat, minify and revision files. Creates configurations in memory so
      // additional tasks can operate on them
      useminPrepare: {
          options: {
              dest: "<%%= config.dist %>"
          },
          html: "<%%= config.app %>/index.html"
      },

      // Performs rewrites based on rev and the useminPrepare configuration
      usemin: {
          options: {
              assetsDirs: ["<%%= config.dist %>", "<%%= config.dist %>/images"]
          },
          html: ["<%%= config.dist %>/{,*/}*.html"],
          css: ["<%%= config.dist %>/styles/{,*/}*.css"]
      },

      // The following *-min tasks produce minified files in the dist folder
      imagemin: {
          dist: {
              files: [{
                  expand: true,
                  cwd: "<%%= config.app %>/images",
                  src: "{,*/}*.{gif,jpeg,jpg,png}",
                  dest: "<%%= config.dist %>/images"
              }]
          }
      },

      svgmin: {
          dist: {
              files: [{
                  expand: true,
                  cwd: "<%%= config.app %>/images",
                  src: "{,*/}*.svg",
                  dest: "<%%= config.dist %>/images"
              }]
          }
      },

      htmlmin: {
          dist: {
              options: {
                  collapseBooleanAttributes: true,
                  collapseWhitespace: true,
                  removeAttributeQuotes: true,
                  removeCommentsFromCDATA: true,
                  removeEmptyAttributes: true,
                  removeOptionalTags: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true
              },
              files: [{
                  expand: true,
                  cwd: "<%%= config.dist %>",
                  src: "{,*/}*.html",
                  dest: "<%%= config.dist %>"
              }]
          }
      },

      // Copies remaining files to places other tasks can use
      copy: {
          dist: {
              files: [{
                  expand: true,
                  dot: true,
                  cwd: "<%%= config.app %>",
                  dest: "<%%= config.dist %>",
                  src: [
                      "*.{ico,png,txt}",
                      ".htaccess",
                      "images/{,*/}*.webp",
                      "{,*/}*.html",
                      "styles/fonts/{,*/}*.*"
                  ]
              }]
          },
          styles: {
              expand: true,
              dot: true,
              cwd: "<%%= config.app %>/styles",
              dest: ".tmp/styles/",
              src: "{,*/}*.css"
          },
          revision: {
            files: [{
              expand: true,
              dot: true,
              cwd: "<%%= config.dist %>",
              dest: "<%%= config.dist %>/<%= meta.revision %>",
              src: ["**/*", "!hbs/**/*"]
            }]
          }
      },<% if (includeModernizr) { %>

      // Generates a custom Modernizr build that includes only the tests you
      // reference in your app
      modernizr: {
          devFile: "<%%= config.app %>/bower_components/modernizr/modernizr.js",
          outputFile: "<%%= config.dist %>/scripts/vendor/modernizr.js",
          files: [
              "<%%= config.dist %>/scripts/{,*/}*.js",
              "<%%= config.dist %>/styles/{,*/}*.css",
              "!<%%= config.dist %>/scripts/vendor/*"
          ],
          uglify: true
      },<% } %>

      // Run some tasks in parallel to speed up build process
      concurrent: {
          server: [<% if (includeCompass) { %>
              "compass:server",<% } %>
              "copy:styles"
          ],
          test: [
              "copy:styles"
          ],
          dist: [<% if (includeCompass) { %>
              "compass",<% } %>
              "copy:styles",
              "imagemin",
              "svgmin"
          ]
      }
        
    });


    grunt.registerTask("serve", function (target) {
        if (target === "dist") {
            return grunt.task.run(["build", "connect:dist:keepalive"]);
        }

        grunt.task.run([
            "clean:server",
            "concurrent:server",
            "autoprefixer",
            "connect:livereload",
            "watch"
        ]);
    });

    grunt.registerTask("server", function (target) {
        grunt.log.warn("The `server` task has been deprecated. Use `grunt serve` to start a server.");
        grunt.task.run([target ? ("serve:" + target) : "serve"]);
    });

    grunt.registerTask("test", function (target) {
        if (target !== "watch") {
            grunt.task.run([
                "clean:server",
                "concurrent:test",
                "autoprefixer"
            ]);
        }

        grunt.task.run([
            "connect:test",<% if (testFramework === "mocha") { %>
            "mocha"<% } else if (testFramework === "jasmine") { %>
            "jasmine"<% } %>
        ]);
    });

    grunt.registerTask("build", [
        "clean:dist",
        "useminPrepare",
        "concurrent:dist",
        "autoprefixer",
        "concat",
        "cssmin",
        "uglify",
        "copy:dist",<% if (includeModernizr) { %>
        "modernizr",<% } %>
        "rev",
        "usemin",
        "htmlmin",<% if (deployWithCDN) { %>
        "cdn:dist",<% } %>
        "copy:revision",
        "clean:revision"
    ]);

    grunt.registerTask("default", [
        "newer:jshint",
        "test",
        "build"
    ]);
    
    <% if (!deployWithNothingSpecial) { %>
    grunt.registerTask("deploy", [
      "build", <% if (deployWithBuildControl) { %> 
      "buildcontrol:dist"<% } %> <% if(deployWithSFTP) { %>,
      "sftp:deploy"<% } %>
      ]);
    <% } %>
    
};
