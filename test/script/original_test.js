function original_test(has_fixed) {
  
  var log = getLogger();
  var q;
  function setup(query) {
    up();
    q = $.query.load(query ? query : default_query);
  };
  
  var default_query = "?action=view&section=info&id=123&debug&testy[]=true&testy[]=false&testy[]";
  
  //----------------------------------------------------------
  module("bugs on 2.1.5");
  //----------------------------------------------------------
  if (has_fixed) {
    test("load qunit url strings", function() {
      setup();
      // got error: Failed to load source for: http://localhost:3000/vendor/jquery.query.js
      var query = "?examples%20module%3A";
      ok($.query.load(query)); // got TypeError
    });
    test("got true with no-value parameter", function() {
      // var debug = $.query.get('debug');
      // > true
      // equals(q.get('debug'), "undefined"); // it got "undefined"
      equals(q.get('debug'), true); // it got "undefined"
    });
  }
  
  //----------------------------------------------------------
  module("examples");
  //----------------------------------------------------------
  test("examples", function() {
    setup();
    
    // var section = $.query.get('section');
    // > "info"
    equals(q.get('section'), 'info');
    
    // var id = $.query.get('id');
    // > 123
    equals(q.get('id'), '123');
    
    // var arr = $.query.get('testy');
    // > ["true", "false", true]
    // equals(q.get('testy'), ['true', 'false', true]); has bug
    
    // var arrayElement = $.query.get('testy[1]');
    // > "false"
    equals(q.get('testy[1]'), 'false');
    
    // var newUrl = $.query.set("section", 5).set("action", "do").toString(); 
    // > "?action=do&section=5&id=123"
    setup("?action=hoge&section=&id=123");
    equals(q.set('section', 5).set('action', 'do').toString(), "?action=do&section=5&id=123");
    
    // var newQuery = "" + $.query.set('type', 'string');
    // > "?action=view&section=info&id=123&type=string"
    // var oldQuery = $.query.toString();
    // > "?action=view&section=info&id=123"
    var oldq = "?action=view&section=info&id=123";
    setup(oldq);
    equals('' + q.set('type', 'string'), "?action=view&section=info&id=123&type=string");
    equals(q.toString(), oldq);
    
    // var oldQuery2 = $.query;
    // > ?action=view&section=info&id=123
    // var newerQuery = $.query.SET('type', 'string');
    // > ?action=view&section=info&id=123&type=string
    // var notOldQuery = $.query.toString();
    // > "?action=view&section=info&id=123&type=string"
    // var oldQueryAgain = $.query.REMOVE("type");
    // > ?action=view&section=info&id=123
    // var emptyQuery = $.query.empty();
    // > ""
    // var stillTheSame = $.query.copy();
    // > ?action=view&section=info&id=123
  });
}
