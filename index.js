var contentTypes = require("routil-contenttypes")
    , ErrorPage = require("error-page")
    , partial = require("ap").partial
    , extend = require("xtend")
    , body = require("routil-body")()
    , defaults = {
        errorPage: ErrorPage
        , jsonBody: body.jsonBody
        , formBody: body.formBody
    }
    , slice = Array.prototype.slice

module.exports = Methods

function Methods(options) {
    return partial(methods, extend({}, defaults, options || {}))
}

function methods(options, routes, handleHttpForms) {
    if (handleHttpForms) {
        return partial(httpFormsRequestHandler, options, routes)
    }

    return partial(requestHandler, options, routes)
}

function requestHandler(options, routes, req, res) {
    var method = req.method
        , f = routes[method]

    if (f) {
        return f.apply(this, slice.call(arguments, 2))
    }
    options.errorPage(req, res)(405)
}

function httpFormsRequestHandler(options, routes, req, res) {
    if (req.method !== "POST") {
        return requestHandler.apply(this, arguments)
    }

    var args = slice.call(arguments, 2)
        , self = this

    contentTypes(req, {
        "applications/json": options.jsonBody
        , "application/x-www-form-urlencoded": options.formBody
        , "default": partial(requestHandler, options, routes)
    })(req, res, extractMethod)


    function extractMethod(body) {
        var method = body._method
            , f = routes[method]

        if (f) {
            return f.apply(self, args)
        }
        options.errorPage(req, res)(405)
    }
}