Vellum
======

[![Build Status](https://travis-ci.org/mwhite/Vellum.svg?branch=master)](https://travis-ci.org/mwhite/Vellum)
[![Build Status](https://drone.io/github.com/mwhite/Vellum/status.png)](https://drone.io/github.com/mwhite/Vellum/latest)

Vellum is a JavaRosa [XForm](http://en.wikipedia.org/wiki/XForms) designer used
in [CommCare HQ](http://github.com/dimagi/commcare-hq).

![](http://i.imgur.com/Eoi3XE3.png)

Image courtesy of the [ReMIND
project](https://www.commcarehq.org/exchange/325775003aa58cfcefbc75cfdf132e4d/info/).

Usage
-----

Download and extract the latest optimized build from
[here](https://drone.io/github.com/mwhite/Vellum/files).

```
$ cd path/to/vellum
$ wget https://drone.io/github.com/mwhite/Vellum/files/vellum.tar.gz
$ tar -xzf vellum.tar.gz
```

Then load it on a page using [RequireJS](http://requirejs.org), optionally with
an existing jQuery instance:

```html
<link rel="stylesheet" href="path/to/bootstrap.css"></link>

<!-- 
Optionally reuse existing jQuery instance with jQuery UI and Bootstrap.  
If not present, bundled versions will be loaded.  
If Bootstrap is already loaded but not jQuery UI, you'll get conflicts between
multiple Bootstrap versions due to the way the bundled version is loaded. -->
<script src="jquery.js"></script>
<script src="jquery-ui.js"></script>
<script src="bootstrap.js"></script>

<script src="require.js"></script>
<script>
    require.config({
        packages: [
            {
                name: 'jquery.vellum',
                location: "/path/to/vellum/src",
                main: 'main.js'
            }
        ]
    });

    require(["jquery.vellum/require-config"], function () {
        require(["jquery", "jquery.vellum"], function ($) {
            $(function () {
                $('#some_div').vellum(VELLUM_OPTIONS);
            });
        });
    });
</script>
```

See
[here](https://github.com/dimagi/commcare-hq/blob/master/corehq/apps/app_manager/templates/app_manager/form_designer.html)
and `tests/main.js` for example options usage.

Vellum targets modern browsers.  IE8 and earlier are not supported.

Contributing
------------

Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).

Install dependencies:
```
$ npm install
```

Build optimized version (test locally by changing `useBuilt` in `tests/main.js`):
```
$ make
```

Test in a browser:
```
$ python server.py
$ chromium-browser http://localhost:8000
```

By default, the test page will load the non-built version on 'localhost' and the
built version otherwise.  Append `?built` or `?async` to the URL to override this
behavior.

Commands to run tests headlessly:
```
$ npm test
$ ./test
$ ./test --help # for advanced usage
```

Make dependency graph image:
```
$ make madge
```

![](deps.png)

### Testing on Heroku

This repo can be deployed to Heroku using
[heroku-buildpack-vellum](http://github.com/mwhite/heroku-buildpack-vellum),
which is just a fork of
[heroku-buildpack-static](https://github.com/pearkes/heroku-buildpack-static)
with the build script from the standard Node.js buildpack added in order to
install dependencies.

Until [prune.io](http://prune.io/) is available, we use
Rainforest's [fourchette](https://github.com/jipiboily/fourchette) along with a
[slightly modified version](https://github.com/mwhite/fourchette-vellum) of
their example fourchette app in order to create an isolated test environment for
each Pull Request on Heroku.

The latest master is also deployed to
[vellum-master.herokuapp.com](http://vellum-master.herokuapp.com) using
[drone.io](http://drone.io).  See
[here](https://drone.io/github.com/mwhite/Vellum) for a list of builds.

