var packagesConfig = {
  "version": "0.13.12",
  "revision": "99e31774402b83868cc3a8d4a8e144e2cae536fd",
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