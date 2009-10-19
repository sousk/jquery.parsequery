/**
 * edit by sousk.net
 */

/**
 * jQuery.query - Query String Modification and Creation for jQuery
 * Written by Blair Mitchelmore (blair DOT mitchelmore AT gmail DOT com)
 * Licensed under the WTFPL (http://sam.zoy.org/wtfpl/).
 * Date: 2009/06/14
 *
 * @author Blair Mitchelmore
 * @version 2.1.5
 *
 **/
new function(settings) {

  var $separator;
  var $spaces;
  var $suffix;
  var $prefix;
  var $hash;
  var $numbers;
  var $preserve_numeric_index;
  assign_settings(settings);

  function assign_settings(settings) {
    $hash = (typeof settings.hash == 'undefined') ? '?' : settings.hash;
    $prefix = settings.prefix || null;
    $preserve_numeric_index = settings.preserve_numeric_index || false;
    
    $separator = settings.separator || '&';
    $spaces = settings.spaces === false ? false : true;
    $suffix = settings.suffix === false ? '' : '[]';
    $numbers = settings.numbers === false ? false : true;
  };
  
  jQuery.parsequery = new function() {
    var is = function(o, t) {
      return o != undefined && o !== null && (!!t ? o.constructor == t : true);
    };
    // when path is 'testy[1]',
    // then returns ["testy", ["1"]]
    var parse = function(path) {
      // var m, rx = /\[([^[]*)\]/g, match = /^(\S+?)(\[\S*\])?$/.exec(path), base = match[1], tokens = [];
      var m, rx = /\[([^[]*)\]/g, match = /^(\S+?)(\[\S*\])?$/.exec(path), tokens = [];
      if (match && match[1]) {
        base = match[1];
        while (m = rx.exec(match[2])) tokens.push(m[1]);
      }
      else {
        base = path;
      }
      return [base, tokens];
    };
    var set = function(target, tokens, value) {
      var o, token = tokens.shift();
      if (typeof target != 'object') target = null;
      if (token === "") {
        if (!target) target = [];
        if (is(target, Array)) {
          target.push(tokens.length == 0 ? value : set(null, tokens.slice(0), value));
        } else if (is(target, Object)) {
          var i = 0;
          while (target[i++] != null);
          target[--i] = tokens.length == 0 ? value : set(target[i], tokens.slice(0), value);
        } else {
          target = [];
          target.push(tokens.length == 0 ? value : set(null, tokens.slice(0), value));
        }
      } else if (token && token.match(/^\s*[0-9]+\s*$/)) {
        var index = parseInt(token, 10);
        if (!target) target = [];
        target[index] = tokens.length == 0 ? value : set(target[index], tokens.slice(0), value);
      } else if (token) {
        var index = token.replace(/^\s*|\s*$/g, "");
        if (!target) target = {};
        if (is(target, Array)) {
          var temp = {};
          for (var i = 0; i < target.length; ++i) {
            temp[i] = target[i];
          }
          target = temp;
        }
        target[index] = tokens.length == 0 ? value : set(target[index], tokens.slice(0), value);
      } else {
        return value;
      }
      return target;
    };
    
    var queryObject = function(a, settings) {
      if (settings) assign_settings(settings);
      
      var self = this;
      self.keys = {};
      
      if (a.queryObject) {
        jQuery.each(a.get(), function(key, val) {
          self.SET(key, val);
        });
      } 
      else {
        var q = "" + a;
        q = q.replace(/^[?#]/,''); // remove any leading ? || #
        q = q.replace(/[;&]$/,''); // remove any trailing & || ;
        if ($spaces) q = q.replace(/[+]/g,' '); // replace +'s with spaces
        
        jQuery.each(q.split(/[&;]/), function(){
          var key = decodeURIComponent(this.split('=')[0]);
          var val = (function(keyval, key) {
            if (key) {
              var val = keyval.split('=')[1];
              return val ? decodeURIComponent(val) : true;
            }
            else {
              return null;
            }
          })(this, key);
          
          if (!key) return;
          
          if ($numbers) {
            if (/^[+-]?[0-9]+\.[0-9]*$/.test(val)) // simple float regex
              val = parseFloat(val);
            else if (/^[+-]?[0-9]+$/.test(val)) // simple int regex
              val = parseInt(val, 10);
          }
          
          val = (!val && val !== 0) ? true : val;
          
          if (val !== false && val !== true && typeof val != 'number')
            val = val;
          
          self.SET(key, val);
        });
      }
      return self;
    };
    
    queryObject.prototype = {
      queryObject: true,
      has: function(key, type) {
        var value = this.get(key);
        return is(value, type);
      },
      GET: function(key) {
        if (!is(key)) return this.keys;
        var parsed = parse(key), base = parsed[0], tokens = parsed[1];
        var target = this.keys[base];
        while (target != null && tokens.length != 0) {
          target = target[tokens.shift()];
        }
        return typeof target == 'number' ? target : target || "";
      },
      get: function(key) {
        var target = this.GET(key);
        if (is(target, Object))
          return jQuery.extend(true, {}, target);
        else if (is(target, Array))
          return target.slice(0);
        return target;
      },
      SET: function(key, val) {
        var value = !is(val) ? null : val;
        var parsed = parse(key), base = parsed[0], tokens = parsed[1];
        var target = this.keys[base];
        this.keys[base] = set(target, tokens.slice(0), value);
        return this;
      },
      set: function(key, val) {
        return this.copy().SET(key, val);
      },
      REMOVE: function(key) {
        return this.SET(key, null).COMPACT();
      },
      remove: function(key) {
        return this.copy().REMOVE(key);
      },
      EMPTY: function() {
        var self = this;
        jQuery.each(self.keys, function(key, value) {
          delete self.keys[key];
        });
        return self;
      },
      load: function(url) {
        var hash = url.replace(/^.*?[#](.+?)(?:\?.+)?$/, "$1");
        var search = url.replace(/^.*?[?](.+?)(?:#.+)?$/, "$1");
        return new queryObject(url.length == search.length ? '' : search, url.length == hash.length ? '' : hash);
      },
      empty: function() {
        return this.copy().EMPTY();
      },
      copy: function() {
        return new queryObject(this);
      },
      COMPACT: function() {
        function build(orig) {
          var obj = typeof orig == "object" ? is(orig, Array) ? [] : {} : orig;
          if (typeof orig == 'object') {
            function add(o, key, value) {
              if (is(o, Array))
                o.push(value);
              else
                o[key] = value;
            }
            jQuery.each(orig, function(key, value) {
              if (!is(value)) return true;
              add(obj, key, build(value));
            });
          }
          return obj;
        }
        this.keys = build(this.keys);
        return this;
      },
      compact: function() {
        return this.copy().COMPACT();
      },
      toString: function() {
        var i = 0, queryString = [], chunks = [], self = this;
        var addFields = function(arr, key, value) {
          if (!is(value) || value === false) return;
          var o = [encodeURIComponent(key)];
          if (value !== true) {
            o.push("=");
            o.push(encodeURIComponent(value));
          }
          arr.push(o.join(""));
        };
        var build = function(obj, base) {
          var newKey = function(key) {
            // return !base || base == "" ? [key].join("") : [base, "[", key, "]"].join("");
            // add hock implementation for php
            return !base || base == "" ? [key].join("") : [
              base, "[", 
              $preserve_numeric_index || typeof(key) != 'number' ? key : "",
              "]"
            ].join("");
          };
          jQuery.each(obj, function(key, value) {
            
            // rebuild or assign
            if (Object.prototype.isPrototypeOf(value)) {
              build(value, newKey(key));
            }
            else {
              addFields(chunks, newKey(key), value);
            }
          });
        };
        build(this.keys);
        
        if (chunks.length > 0) queryString.push($hash);
        queryString.push(chunks.join($separator));
        return ($prefix || '') + queryString.join("");
      }
    };
    
    function parse_url(url) {
      var m = url && url.match(/^(.*?)[?](.+?)(?:#.+)?$/);
      return m ? {
        base: m[1],
        search: m[2]
      } : {
        base: url,
        search: ""
      };
    };
    
    return function(url, settings) {
      if (!settings) settings = {};
      
      var u = parse_url(url);
      if (u.base) settings.prefix = u.base;
      
      assign_settings(settings);
      return  new queryObject(u.search);
    };
  };
}(jQuery.parsequery || {}); // Pass in jQuery.query as settings object
