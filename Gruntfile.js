// Grunt tasks

module.exports = function (grunt) {
	"use strict";

	// Project configuration.
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),
		banner: '/*!\n' +
		'* <%= pkg.name %> - v<%= pkg.version %> - MIT LICENSE <%= grunt.template.today("yyyy-mm-dd") %>. \n' +
		'* @author <%= pkg.author %>\n' +
		'*/\n',

		clean: {
		  dist: ['<%= appPath %>/assets/js', 'dest'],
          js: ['<%= appPath %>/assets/js/*.js']
		},
        copy: {
            target: {
                files: [
                    { expand: true, cwd: 'src/', src: ['**'], dest: 'dest/src/' },
                    { expand: true, cwd: 'app/assets/', src: ['**'], dest: 'dest/app/assets/' },
                    { expand: true, src: ['index.html'], dest: 'dest/' },
                    { expand: true, src: ['login.php'], dest: 'dest/' },
                    { expand: true, src: ['bower.json'], dest: 'dest/' }
                ],
            }
        },

		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			gruntfile: {
				src: 'Gruntfile.js'
			},
			app: {
				src: ['app/modules/**/*.js']
			},
            all: {
                src: [
                    'Gruntfile.js',
                    '!<%= appPath %>/modules/shared/commonFilter.js',
                    '<%= appPath %>/**/*.js',
                    '!<%= appPath %>/assets/**/*.js',
                    'package.json'
                ]
            }
		},

		exec: {
			bowerInstaller: 'bower-installer'
		},

		concat: {
			options: {
				banner: '<%= banner %>',
				stripBanners: false
			},
			base: {
				src: [
					// Angular Project Dependencies,
					'app/app.js',
					'app/app.config.js',
					'app/modules/**/*Module.js',
					'app/modules/**/*Route.js',
					'app/modules/**/*Ctrl.js',
					'app/modules/**/*Service.js',
                    'app/modules/**/*Filter.js',
					'app/modules/**/*Directive.js'
				],
				dest: 'app/assets/js/<%= pkg.name %>-appbundle.js'
			},
			build: {
				src: [
					// Angular Project Dependencies,
					'app/assets/libs/angular/angular.js',
					'app/assets/libs/**/*.js'

				],
				dest: 'app/assets/js/<%= pkg.name %>-angularbundle.js'
			}
		},

		uglify: {
			options: {
				banner: '<%= banner %>',
				report: 'min'
			},
			base: {
				src: ['<%= concat.base.dest %>'],
				dest: 'app/assets/js/<%= pkg.name %>-angscript.min.js'
			},
			basePlugin: {
				src: [ 'src/plugins/**/*.js' ],
				dest: 'app/assets/js/plugins/',
				expand: true,
				flatten: true,
				ext: '.min.js'
			}
		},

		connect: {
			server: {
				options: {
					keepalive: true,
					port: 4000,
					base: '.',
					hostname: 'localhost',
					debug: true,
					livereload: true,
					open: true
				}
			}
		},
		concurrent: {
			tasks: ['connect', 'watch'],
			options: {
				logConcurrentOutput: true
			}
		},

		watch: {
			app: {
				 files: ['Gruntfile.js', '<%= jshint.app.src %>', '<%= appPath %>/**/**/*.html'],
				tasks: ['jshint:app', 'concat', 'uglify', 'ngtemplates'],
				options: {
					livereload: true
				}
			},
            js: {
                files: ['<%= appPath %>/**/*.js'],
                tasks: ['newer:jshint:all'],
                options: {
                    livereload: true
                }
            },
		},

		injector: {
			options: {},
			local: {
				files: {
					'index.html': [
						'bower.json',
                        'app/assets/lib/*.js',
                        'app/assets/customjs/*.js',
						'app/app.js',
						'app/app.config.js',
						'app/**/*Module.js',
						'app/**/*Route.js',
						'app/**/*Ctrl.js',
						'app/**/*Service.js',
                        'app/**/*Filter.js',
						'app/**/*Directive.js'
					]
				}
			},

            dev: {
                files: {
                    'index.html': [
                        'app/assets/css/**/*.css',
                        'bower.json',
                        'app/assets/lib/*.js',
                        'app/assets/customjs/*.js',
                        'app/assets/js/*.js',

                    ]

                }
            },
			production: {
				  files: {
                    'index.html': [
                        'app/assets/css/**/*.css',
                        'bower.json',
                        'app/assets/lib/*.js',
                        'app/assets/customjs/*.js',
                        'app/assets/js/*.js',

                    ]

                }
			}
		},

		ngtemplates: {
			app: {
				src: 'app/modules/**/*.html',
				dest: 'app/assets/js/templates.js',
				options: {
					module: '<%= pkg.name %>',
					root: 'app/',
					standAlone: false
				}
			}
		},
        jsbeautifier: {
            files: ["app/modules/**/*.js", "app/modules/**/*.html"],
            options: {
                js: {
                    fileTypes: [".js"]
                },
                html: {
                    fileTypes: [".html"]
                }
            }
        }



	});

	require('time-grunt')(grunt);
	require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-contrib-copy');

	// Making grunt default to force in order not to break the project if something fail.
	grunt.option('force', true);

// Register grunt tasks
    grunt.registerTask("build", [
        "clean",
       // "jsbeautifier",
       // "jshint",
        "exec",
        "concat",
        "uglify",
        "ngtemplates",
        "injector:dev",
        'concurrent'
        //	"clean"
    ]);

    // deployment task
    grunt.registerTask("deploy", [
        "clean",
        "jsbeautifier",
        "jshint",
        "exec",
        "concat",
        "uglify",
        "ngtemplates",
        "injector:production",
        'copy'
        //	"clean"
    ]);

	// Development task(s).
	grunt.registerTask('dev', ['injector:local', 'concurrent']);

};
