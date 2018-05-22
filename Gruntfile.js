/* jshint esversion: 6 */
/*global module:false*/

const _ = require("lodash");
const fs = require("fs");
const util = require("util");
const pug = require("pug");
const path = require("path");

module.exports = function(grunt) {
  require("load-grunt-tasks")(grunt);
  
  grunt.registerMultiTask("compile-client-templates", "Compiles client pug templates", function () {
    const clientTemplates = fs.readdirSync(this.data.sourceFolder);
    const compiledClientTemplates = [];
    
    for (let i = 0; i < clientTemplates.length; i++) {
      let baseName = clientTemplates[i].replace(".pug", "");
      baseName = `${baseName[0].toUpperCase()}${baseName.substring(1)}`;
      const templateName = _.camelCase(`${this.data.templatePrefix}${baseName}`);
      compiledClientTemplates.push(pug.compileFileClient(this.data.sourceFolder + clientTemplates[i], { name: templateName, compileDebug: false }));
    }
    
    const destDir = path.dirname(this.data.destFile);
    
    if (!fs.existsSync(destDir)){
      fs.mkdirSync(destDir);
    }
    
    fs.writeFileSync(this.data.destFile, compiledClientTemplates.join(""));
  });
  
  grunt.registerMultiTask("generate-config", "Generates config.js", function() {
    const config = this.data.options.config;
    
    const values = {
      server: config.server,
      wnsPusher: config.wnsPusher
    };
    
    fs.writeFileSync(this.data.options.output, util.format("function getConfig() { return %s; };", JSON.stringify(values)));
    
    return true;
  });
  
  grunt.initConfig({
    "shell": {
      "install-api-client": {
        "command": "npm install",
        "options": {
          "execOptions": {
            "cwd": `${__dirname}/src/api-client`
          }
        }
      }
    },
    "sass": {
      dist: {
        options: {
          style: "compressed"
        },
        files: [{
          expand: true,
          cwd: "src/scss",
          src: ["*.scss"],
          dest: "www/css",
          ext: ".min.css"
        }]
      }
    },
    "postcss": {
      options: {
        map: true,
        processors: [ require("autoprefixer") ]
      },
      dist: {
        src: "www/css/*.css"
      }
	  },
    "pug": {
      compile: {
        options: {
          data: function(dest, src) {
            return require("./config.json");
          }
        },
        files: [{
          expand: true,
          cwd: "src/templates",
          src: ["*.pug"],
          dest: "www",
          ext: ".html"
        }]
      }
    },
    "compile-client-templates": {
      "compile": {
        "sourceFolder": __dirname + "/src/client-templates/",
        "destFile": __dirname + "/www/js/pug-templates.js",
        "templatePrefix": "pug"
      }
    },
    "generate-config": {
      "generate": {
        "options": {
          "config": require("./config.json"),
          "output": "www/js/config.js"
        }
      }
    },
    "babel": {
      options: {
        sourceMap: true,
        minified: false
      },
      dist: {
        files: [{
          expand: true,
          cwd: "src/js",
          src: ["*.js"],
          dest: "www/js/",
          ext: ".js"
        }]
      }
    },
    "bower": {
      install: { }
    },
    "wiredep": {
      target: {
        src: "www/index.html"
      }
    },
    browserify: {
      apiclient: {
        files: {
          "www/js/soteapi-client.js": ["src/api-client/main.js"]
        }
      }
    }
  });
  
  grunt.registerTask("default", [ "shell:install-api-client", "sass", "postcss", "pug", "compile-client-templates", "generate-config", "babel", "bower", "wiredep", "browserify:apiclient" ]);
};
