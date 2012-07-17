var test = require("tap").test
    , methods = require("..")()
    , testServer = require("test-server")
    , partial = require("ap").partial

testServer(handleRequest, startTests)

function handleRequest(req, res) {
    var get = partial(endValue, "get")
        , post = partial(endValue, "post")
        , put = partial(endValue, "put")
        , del = partial(endValue, "del")

    if (req.url === "/form") {
        return methods({
            "GET": get
            , "POST": post
            , "PUT": put
            , "DELETE": del
        }, true).apply(this, arguments)
    }

    methods({
        "PUT": put
        , "GET": get
        , "POST": post
    }).apply(this, arguments)
}

function endValue(value, req, res) {
    res.end(value)
}

function startTests(request, done) {
    test("get", function (t) {
        request("/", partial(testMethod, "get", t))
    })

    test("post", function (t) {
        request({
            uri: "/"
            , method: "POST"
        }, partial(testMethod, "post", t))
    })

    test("put", function (t) {
        request({
            uri: "/"
            , method: "PUT"
        }, partial(testMethod, "put", t))
    })

    test("form get", function (t) {
        request("/form", partial(testMethod, "get", t))
    })

    test("form post", function (t) {
        request({
            uri: "/form"
            , method: "POST"
        }, partial(testMethod, "post", t))
    })

    test("form put", function (t) {
        request({
            uri: "/form"
            , method: "POST"
            , form: {
                _method: "PUT"
            }
        }, partial(testMethod, "put", t))
    })

    test("form delete", function (t) {
        request({
            uri: "/form"
            , method: "POST"
            , form: {
                _method: "DELETE"
            }
        }, partial(testMethod, "del", t))
    })

    test("error", function (t) {
        request({
            uri: "/"
            , method: "DELETE"
        }, function (err, res, body) {
            t.equal(res.statusCode, 405)
            t.equal(body, "405 Method Not Allowed /\n")

            t.end()
        })
    })

    .on("end", done)
}

function testMethod(value, t, err, res, body) {
    t.equal(body, value)

    t.end()
}