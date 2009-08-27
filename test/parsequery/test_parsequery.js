window.log = getLogger();
function test_parsequery() {
  var q;
  var default_query =         "http://localhost:3000/foo_bar/?action=view&section=info&id=123&debug&testy[]=true&testy[]=false&testy[]";
  var default_query_encoded = "http://localhost:3000/foo_bar/?action=view&section=info&id=123&debug&testy%5B0%5D=true&testy%5B1%5D=false&testy%5B2%5D";
  var setup = function(query) {
    up();
    q = $.parsequery(query ? query : default_query);
  };
  
  //----------------------------------------------------------
  module("bugs on original-2.1.5");
  //----------------------------------------------------------
  if (true) {
    test("load qunit url strings", function() {
      setup();
      // got error: Failed to load source for: http://localhost:3000/vendor/jquery.parsequery.js
      var query = "?examples%20module%3A";
      ok($.parsequery(query)); // got TypeError
    });
    test("got true with no-value parameter", function() {
      // var debug = $.parsequery.get('debug');
      // > true
      // equals(q.get('debug'), "undefined"); // it got "undefined"
      equals(q.get('debug'), true); // it got "undefined"
    });
  }

  //----------------------------------------------------------
  module("basement");
  //----------------------------------------------------------
  test("init with empty param", function() {
    ok(q = $.parsequery(undefined));
    equals(q.set('foo', 'bar').toString(), "?foo=bar");
  });
  test("parameters", function() {
    ok($.parsequery('', {hash: ''}));
    equals(q.set('foo', 'bar').toString(), "foo=bar");
  });
  
  //----------------------------------------------------------
  module("url + parameter");
  //----------------------------------------------------------
  test("handle with base component", function() {
    setup();
    equals(q.toString(), default_query_encoded);
    
    var newq = "http://example.com/hoge/";
    setup(newq);
    equals(q.toString(), newq);
    equals(q.set('foo', 123).toString(), newq+'?foo=123');
  });
  
  //----------------------------------------------------------
  module("examples");
  //----------------------------------------------------------
  test("examples", function() {
    setup();
    
    // var section = $.parsequery.get('section');
    // > "info"
    equals(q.get('section'), 'info');

    // var id = $.parsequery.get('id');
    // > 123
    equals(q.get('id'), '123');
    
    // var arr = $.parsequery.get('testy');
    // > ["true", "false", true]
    same(q.get('testy'), ['true', 'false', true]);
    
    // var arrayElement = $.parsequery.get('testy[1]');
    // > "false"
    equals(q.get('testy[1]'), 'false');
    
    // var newUrl = $.parsequery.set("section", 5).set("action", "do").toString(); 
    // > "?action=do&section=5&id=123"
    setup("?action=hoge&section=&id=123");
    equals(q.set('section', 5).set('action', 'do').toString(), "?action=do&section=5&id=123");
    
    // var newQuery = "" + $.parsequery.set('type', 'string');
    // > "?action=view&section=info&id=123&type=string"
    // var oldQuery = $.parsequery.toString();
    // > "?action=view&section=info&id=123"
    var oldq = "?action=view&section=info&id=123";
    setup(oldq);
    equals('' + q.set('type', 'string'), "?action=view&section=info&id=123&type=string");
    equals(q.toString(), oldq);
    
    // var oldQuery2 = $.parsequery;
    // > ?action=view&section=info&id=123
    // var newerQuery = $.parsequery.SET('type', 'string');
    // > ?action=view&section=info&id=123&type=string
    // var notOldQuery = $.parsequery.toString();
    // > "?action=view&section=info&id=123&type=string"
    // var oldQueryAgain = $.parsequery.REMOVE("type");
    // > ?action=view&section=info&id=123
    // var emptyQuery = $.parsequery.empty();
    // > ""
    // var stillTheSame = $.parsequery.copy();
    // > ?action=view&section=info&id=123
  });
  
};
