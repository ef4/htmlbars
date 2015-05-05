define('htmlbars-runtime-tests/htmlbars-runtime.jshint', function () {

  'use strict';

  module('JSHint - htmlbars-runtime-tests');
  test('htmlbars-runtime-tests/htmlbars-runtime.js should pass jshint', function () {
    ok(true, 'htmlbars-runtime-tests/htmlbars-runtime.js should pass jshint.');
  });

});
define('htmlbars-runtime-tests/htmlbars-runtime/expression-visitor.jshint', function () {

  'use strict';

  module('JSHint - htmlbars-runtime-tests/htmlbars-runtime');
  test('htmlbars-runtime-tests/htmlbars-runtime/expression-visitor.js should pass jshint', function () {
    ok(true, 'htmlbars-runtime-tests/htmlbars-runtime/expression-visitor.js should pass jshint.');
  });

});
define('htmlbars-runtime-tests/htmlbars-runtime/hooks.jshint', function () {

  'use strict';

  module('JSHint - htmlbars-runtime-tests/htmlbars-runtime');
  test('htmlbars-runtime-tests/htmlbars-runtime/hooks.js should pass jshint', function () {
    ok(true, 'htmlbars-runtime-tests/htmlbars-runtime/hooks.js should pass jshint.');
  });

});
define('htmlbars-runtime-tests/htmlbars-runtime/morph.jshint', function () {

  'use strict';

  module('JSHint - htmlbars-runtime-tests/htmlbars-runtime');
  test('htmlbars-runtime-tests/htmlbars-runtime/morph.js should pass jshint', function () {
    ok(true, 'htmlbars-runtime-tests/htmlbars-runtime/morph.js should pass jshint.');
  });

});
define('htmlbars-runtime-tests/htmlbars-runtime/render.jshint', function () {

  'use strict';

  module('JSHint - htmlbars-runtime-tests/htmlbars-runtime');
  test('htmlbars-runtime-tests/htmlbars-runtime/render.js should pass jshint', function () {
    ok(true, 'htmlbars-runtime-tests/htmlbars-runtime/render.js should pass jshint.');
  });

});
define('htmlbars-runtime-tests/main-test', ['../htmlbars-runtime'], function (htmlbars_runtime) {

  'use strict';

  QUnit.module("htmlbars-runtime");

  function keys(obj) {
    var ownKeys = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        ownKeys.push(key);
      }
    }
    return ownKeys;
  }

  test("hooks are present", function () {
    var hookNames = ["keywords", "linkRenderNode", "createScope", "classify", "createFreshScope", "createChildScope", "bindShadowScope", "bindScope", "bindSelf", "bindLocal", "bindBlock", "updateScope", "updateSelf", "updateLocal", "lookupHelper", "hasHelper", "invokeHelper", "range", "block", "inline", "keyword", "partial", "component", "element", "attribute", "subexpr", "concat", "get", "getRoot", "getChild", "getValue", "cleanupRenderNode", "destroyRenderNode", "willCleanupTree", "didCleanupTree", "getCellOrValue"];

    for (var i = 0; i < hookNames.length; i++) {
      var hook = htmlbars_runtime.hooks[hookNames[i]];
      ok(hook !== undefined, "hook " + hookNames[i] + " is present");
    }

    equal(keys(htmlbars_runtime.hooks).length, hookNames.length, "Hooks length match");
  });

});
define('htmlbars-runtime-tests/main-test.jshint', function () {

  'use strict';

  module('JSHint - htmlbars-runtime-tests');
  test('htmlbars-runtime-tests/main-test.js should pass jshint', function () {
    ok(true, 'htmlbars-runtime-tests/main-test.js should pass jshint.');
  });

});