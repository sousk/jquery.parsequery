var getLogger = function() {
  if (typeof(window) != "undefined" && window.console 
    && window.console.log) {
      // Safari and FireBug 0.4
      // Percent replacement is a workaround for cute Safari crashing bug
      // window.console.log(msg.replace(/%/g, '\uFF05'));
      return window.console.log;
  }
  else if (typeof(opera) != "undefined" && opera.postError) {
	  // Opera
    return opera.postError;
  } 
  else if (typeof(Debug) != "undefined" && Debug.writeln) {
    // IE Web Development Helper (?)
    // http://www.nikhilk.net/Entry.aspx?id=93
    return Debug.writeln;
  } 
  else if (typeof(debug) != "undefined" && debug.trace) {
    // Atlas framework (?)
    // http://www.nikhilk.net/Entry.aspx?id=93
    return debug.trace;
  }
  else {
    return function() {};
  }
};
