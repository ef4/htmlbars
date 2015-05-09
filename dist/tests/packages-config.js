var packagesConfig = {
  "version": "0.13.15",
  "revision": "7721a97cb696f4d0fbc42f4de51a74cb9632b909",
  "vendored": {},
  "dependencies": {
    "htmlbars": {
      "node": true,
      "lib": [
        "syntax-handlebars-inliner",
        "htmlbars-util",
        "htmlbars-syntax",
        "htmlbars-compiler",
        "htmlbars-runtime",
        "simple-html-tokenizer",
        "morph-range",
        "morph-attr",
        "dom-helper"
      ]
    },
    "htmlbars-syntax": {
      "node": true,
      "lib": [
        "syntax-handlebars-inliner",
        "htmlbars-util",
        "simple-html-tokenizer"
      ]
    },
    "htmlbars-compiler": {
      "node": true,
      "lib": [
        "syntax-handlebars-inliner",
        "util-handlebars-inliner",
        "htmlbars-util",
        "htmlbars-syntax",
        "simple-html-tokenizer"
      ],
      "test": [
        "htmlbars-test-helpers",
        "htmlbars-runtime",
        "morph-range",
        "morph-attr",
        "dom-helper"
      ]
    },
    "htmlbars-runtime": {
      "lib": [
        "htmlbars-util",
        "morph-range",
        "morph-attr",
        "dom-helper"
      ]
    },
    "htmlbars-util": {
      "lib": [
        "util-handlebars-inliner"
      ]
    },
    "htmlbars-test-helpers": {},
    "morph-attr": {
      "node": true,
      "lib": [
        "dom-helper"
      ],
      "test": [
        "util-handlebars-inliner",
        "htmlbars-test-helpers",
        "htmlbars-util"
      ]
    },
    "dom-helper": {
      "node": true,
      "lib": [
        "morph-range",
        "morph-attr"
      ],
      "test": [
        "util-handlebars-inliner",
        "htmlbars-test-helpers",
        "htmlbars-util"
      ]
    }
  }
};