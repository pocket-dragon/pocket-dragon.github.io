/*! Built with http://stenciljs.com */
const { h } = window.App;

import { c as MDCTopAppBar, d as MDCTopAppBarFoundation, e as MDCTopAppBarFoundation$1, f as MDCFixedTopAppBarFoundation, g as MDCShortTopAppBarFoundation } from './chunk-d3ec1289.js';

class AppRoot {
    componentDidLoad() {
        const topAppBarElement = document.querySelector(".mdc-top-app-bar");
        new MDCTopAppBar(topAppBarElement); // tslint:disable-line:no-unused-expression
    }
    render() {
        return (h("div", null,
            h("header", { class: "mdc-top-app-bar" },
                h("div", { class: "mdc-top-app-bar__row" },
                    h("section", { class: "mdc-top-app-bar__section mdc-top-app-bar__section--align-start" },
                        h("span", { class: "mdc-top-app-bar__title" }, "Pocket Dragon")))),
            h("main", null,
                h("stencil-router", null,
                    h("stencil-route-switch", { scrollTopOffset: 0 },
                        h("stencil-route", { url: "/", component: "app-home", exact: true }),
                        h("stencil-route", { url: "/profile/:name", component: "app-profile" }))))));
    }
    static get is() { return "app-root"; }
    static get style() { return ".mdc-top-app-bar {\n  background-color: #6200ee;\n  /* \@alternate */\n  background-color: var(--mdc-theme-primary, #6200ee);\n  color: white;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  position: fixed;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  -webkit-box-pack: justify;\n  -ms-flex-pack: justify;\n  justify-content: space-between;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  width: 100%;\n  z-index: 4; }\n  .mdc-top-app-bar .mdc-top-app-bar__action-item,\n  .mdc-top-app-bar .mdc-top-app-bar__navigation-icon {\n    color: #fff;\n    /* \@alternate */\n    color: var(--mdc-theme-on-primary, #fff); }\n    .mdc-top-app-bar .mdc-top-app-bar__action-item::before, .mdc-top-app-bar .mdc-top-app-bar__action-item::after,\n    .mdc-top-app-bar .mdc-top-app-bar__navigation-icon::before,\n    .mdc-top-app-bar .mdc-top-app-bar__navigation-icon::after {\n      background-color: #fff; }\n      \@supports not (-ms-ime-align: auto) {\n        .mdc-top-app-bar .mdc-top-app-bar__action-item::before, .mdc-top-app-bar .mdc-top-app-bar__action-item::after,\n        .mdc-top-app-bar .mdc-top-app-bar__navigation-icon::before,\n        .mdc-top-app-bar .mdc-top-app-bar__navigation-icon::after {\n          /* \@alternate */\n          background-color: var(--mdc-theme-on-primary, #fff); } }\n    .mdc-top-app-bar .mdc-top-app-bar__action-item:hover::before,\n    .mdc-top-app-bar .mdc-top-app-bar__navigation-icon:hover::before {\n      opacity: 0.08; }\n    .mdc-top-app-bar .mdc-top-app-bar__action-item:not(.mdc-ripple-upgraded):focus::before, .mdc-top-app-bar .mdc-top-app-bar__action-item.mdc-ripple-upgraded--background-focused::before,\n    .mdc-top-app-bar .mdc-top-app-bar__navigation-icon:not(.mdc-ripple-upgraded):focus::before,\n    .mdc-top-app-bar .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded--background-focused::before {\n      -webkit-transition-duration: 75ms;\n      transition-duration: 75ms;\n      opacity: 0.24; }\n    .mdc-top-app-bar .mdc-top-app-bar__action-item:not(.mdc-ripple-upgraded)::after,\n    .mdc-top-app-bar .mdc-top-app-bar__navigation-icon:not(.mdc-ripple-upgraded)::after {\n      -webkit-transition: opacity 150ms linear;\n      transition: opacity 150ms linear; }\n    .mdc-top-app-bar .mdc-top-app-bar__action-item:not(.mdc-ripple-upgraded):active::after,\n    .mdc-top-app-bar .mdc-top-app-bar__navigation-icon:not(.mdc-ripple-upgraded):active::after {\n      -webkit-transition-duration: 75ms;\n      transition-duration: 75ms;\n      opacity: 0.32; }\n    .mdc-top-app-bar .mdc-top-app-bar__action-item.mdc-ripple-upgraded,\n    .mdc-top-app-bar .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded {\n      --mdc-ripple-fg-opacity: 0.32; }\n  .mdc-top-app-bar__row {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    position: relative;\n    -webkit-box-sizing: border-box;\n    box-sizing: border-box;\n    width: 100%;\n    height: 64px; }\n  .mdc-top-app-bar__section {\n    display: -webkit-inline-box;\n    display: -ms-inline-flexbox;\n    display: inline-flex;\n    -webkit-box-flex: 1;\n    -ms-flex: 1 1 auto;\n    flex: 1 1 auto;\n    -webkit-box-align: center;\n    -ms-flex-align: center;\n    align-items: center;\n    min-width: 0;\n    padding: 8px 12px;\n    z-index: 1; }\n    .mdc-top-app-bar__section--align-start {\n      -webkit-box-pack: start;\n      -ms-flex-pack: start;\n      justify-content: flex-start;\n      -webkit-box-ordinal-group: 0;\n      -ms-flex-order: -1;\n      order: -1; }\n    .mdc-top-app-bar__section--align-end {\n      -webkit-box-pack: end;\n      -ms-flex-pack: end;\n      justify-content: flex-end;\n      -webkit-box-ordinal-group: 2;\n      -ms-flex-order: 1;\n      order: 1; }\n  .mdc-top-app-bar__title {\n    font-family: Roboto, sans-serif;\n    -moz-osx-font-smoothing: grayscale;\n    -webkit-font-smoothing: antialiased;\n    font-size: 1.25rem;\n    line-height: 2rem;\n    font-weight: 500;\n    letter-spacing: 0.0125em;\n    text-decoration: inherit;\n    text-transform: inherit;\n    /* \@noflip */\n    padding-left: 20px;\n    /* \@noflip */\n    padding-right: 0;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n    overflow: hidden;\n    z-index: 1; }\n    [dir=\"rtl\"] .mdc-top-app-bar__title, .mdc-top-app-bar__title[dir=\"rtl\"] {\n      /* \@noflip */\n      padding-left: 0;\n      /* \@noflip */\n      padding-right: 20px; }\n  .mdc-top-app-bar__action-item, .mdc-top-app-bar__navigation-icon {\n    --mdc-ripple-fg-size: 0;\n    --mdc-ripple-left: 0;\n    --mdc-ripple-top: 0;\n    --mdc-ripple-fg-scale: 1;\n    --mdc-ripple-fg-translate-end: 0;\n    --mdc-ripple-fg-translate-start: 0;\n    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\n    will-change: transform, opacity;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    position: relative;\n    -ms-flex-negative: 0;\n    flex-shrink: 0;\n    -webkit-box-align: center;\n    -ms-flex-align: center;\n    align-items: center;\n    -webkit-box-pack: center;\n    -ms-flex-pack: center;\n    justify-content: center;\n    -webkit-box-sizing: border-box;\n    box-sizing: border-box;\n    width: 48px;\n    height: 48px;\n    padding: 12px;\n    border: none;\n    outline: none;\n    background-color: transparent;\n    fill: currentColor;\n    color: inherit;\n    text-decoration: none;\n    cursor: pointer; }\n    .mdc-top-app-bar__action-item::before, .mdc-top-app-bar__action-item::after, .mdc-top-app-bar__navigation-icon::before, .mdc-top-app-bar__navigation-icon::after {\n      position: absolute;\n      border-radius: 50%;\n      opacity: 0;\n      pointer-events: none;\n      content: \"\"; }\n    .mdc-top-app-bar__action-item::before, .mdc-top-app-bar__navigation-icon::before {\n      -webkit-transition: opacity 15ms linear;\n      transition: opacity 15ms linear;\n      z-index: 1; }\n    .mdc-top-app-bar__action-item.mdc-ripple-upgraded::before, .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded::before {\n      -webkit-transform: scale(var(--mdc-ripple-fg-scale, 1));\n      transform: scale(var(--mdc-ripple-fg-scale, 1)); }\n    .mdc-top-app-bar__action-item.mdc-ripple-upgraded::after, .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded::after {\n      top: 0;\n      /* \@noflip */\n      left: 0;\n      -webkit-transform: scale(0);\n      transform: scale(0);\n      -webkit-transform-origin: center center;\n      transform-origin: center center; }\n    .mdc-top-app-bar__action-item.mdc-ripple-upgraded--unbounded::after, .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded--unbounded::after {\n      top: var(--mdc-ripple-top, 0);\n      /* \@noflip */\n      left: var(--mdc-ripple-left, 0); }\n    .mdc-top-app-bar__action-item.mdc-ripple-upgraded--foreground-activation::after, .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded--foreground-activation::after {\n      -webkit-animation: 225ms mdc-ripple-fg-radius-in forwards, 75ms mdc-ripple-fg-opacity-in forwards;\n      animation: 225ms mdc-ripple-fg-radius-in forwards, 75ms mdc-ripple-fg-opacity-in forwards; }\n    .mdc-top-app-bar__action-item.mdc-ripple-upgraded--foreground-deactivation::after, .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded--foreground-deactivation::after {\n      -webkit-animation: 150ms mdc-ripple-fg-opacity-out;\n      animation: 150ms mdc-ripple-fg-opacity-out;\n      -webkit-transform: translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1));\n      transform: translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1)); }\n    .mdc-top-app-bar__action-item::before, .mdc-top-app-bar__action-item::after, .mdc-top-app-bar__navigation-icon::before, .mdc-top-app-bar__navigation-icon::after {\n      top: calc(50% - 50%);\n      /* \@noflip */\n      left: calc(50% - 50%);\n      width: 100%;\n      height: 100%; }\n    .mdc-top-app-bar__action-item.mdc-ripple-upgraded::before, .mdc-top-app-bar__action-item.mdc-ripple-upgraded::after, .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded::before, .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded::after {\n      top: var(--mdc-ripple-top, calc(50% - 50%));\n      /* \@noflip */\n      left: var(--mdc-ripple-left, calc(50% - 50%));\n      width: var(--mdc-ripple-fg-size, 100%);\n      height: var(--mdc-ripple-fg-size, 100%); }\n    .mdc-top-app-bar__action-item.mdc-ripple-upgraded::after, .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded::after {\n      width: var(--mdc-ripple-fg-size, 100%);\n      height: var(--mdc-ripple-fg-size, 100%); }\n\n.mdc-top-app-bar--short {\n  top: 0;\n  right: auto;\n  left: 0;\n  width: 100%;\n  -webkit-transition: width 250ms cubic-bezier(0.4, 0, 0.2, 1);\n  transition: width 250ms cubic-bezier(0.4, 0, 0.2, 1); }\n  [dir=\"rtl\"] .mdc-top-app-bar--short, .mdc-top-app-bar--short[dir=\"rtl\"] {\n    right: 0;\n    left: auto; }\n  .mdc-top-app-bar--short .mdc-top-app-bar__row {\n    height: 56px; }\n  .mdc-top-app-bar--short .mdc-top-app-bar__section {\n    padding: 4px; }\n  .mdc-top-app-bar--short .mdc-top-app-bar__title {\n    -webkit-transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);\n    transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);\n    opacity: 1; }\n\n.mdc-top-app-bar--short-collapsed {\n  /* \@noflip */\n  border-bottom-left-radius: 0;\n  /* \@noflip */\n  border-bottom-right-radius: 4px;\n  -webkit-box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);\n  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);\n  width: 56px;\n  -webkit-transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);\n  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1); }\n  [dir=\"rtl\"] .mdc-top-app-bar--short-collapsed, .mdc-top-app-bar--short-collapsed[dir=\"rtl\"] {\n    /* \@noflip */\n    border-bottom-left-radius: 4px;\n    /* \@noflip */\n    border-bottom-right-radius: 0; }\n  .mdc-top-app-bar--short-collapsed .mdc-top-app-bar__title {\n    display: none; }\n  .mdc-top-app-bar--short-collapsed .mdc-top-app-bar__action-item {\n    -webkit-transition: padding 150ms cubic-bezier(0.4, 0, 0.2, 1);\n    transition: padding 150ms cubic-bezier(0.4, 0, 0.2, 1); }\n\n.mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item {\n  width: 112px; }\n  .mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item .mdc-top-app-bar__section--align-end {\n    /* \@noflip */\n    padding-left: 0;\n    /* \@noflip */\n    padding-right: 12px; }\n    [dir=\"rtl\"] .mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item .mdc-top-app-bar__section--align-end, .mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item .mdc-top-app-bar__section--align-end[dir=\"rtl\"] {\n      /* \@noflip */\n      padding-left: 12px;\n      /* \@noflip */\n      padding-right: 0; }\n\n.mdc-top-app-bar--dense .mdc-top-app-bar__row {\n  height: 48px; }\n\n.mdc-top-app-bar--dense .mdc-top-app-bar__section {\n  padding: 0 4px; }\n\n.mdc-top-app-bar--dense .mdc-top-app-bar__title {\n  /* \@noflip */\n  padding-left: 12px;\n  /* \@noflip */\n  padding-right: 0; }\n  [dir=\"rtl\"] .mdc-top-app-bar--dense .mdc-top-app-bar__title, .mdc-top-app-bar--dense .mdc-top-app-bar__title[dir=\"rtl\"] {\n    /* \@noflip */\n    padding-left: 0;\n    /* \@noflip */\n    padding-right: 12px; }\n\n.mdc-top-app-bar--prominent .mdc-top-app-bar__row {\n  height: 128px; }\n\n.mdc-top-app-bar--prominent .mdc-top-app-bar__title {\n  -ms-flex-item-align: end;\n  align-self: flex-end;\n  padding-bottom: 2px; }\n\n.mdc-top-app-bar--prominent .mdc-top-app-bar__action-item,\n.mdc-top-app-bar--prominent .mdc-top-app-bar__navigation-icon {\n  -ms-flex-item-align: start;\n  align-self: flex-start; }\n\n.mdc-top-app-bar--fixed {\n  -webkit-transition: -webkit-box-shadow 200ms linear;\n  transition: -webkit-box-shadow 200ms linear;\n  transition: box-shadow 200ms linear;\n  transition: box-shadow 200ms linear, -webkit-box-shadow 200ms linear; }\n\n.mdc-top-app-bar--fixed-scrolled {\n  -webkit-box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);\n  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);\n  -webkit-transition: -webkit-box-shadow 200ms linear;\n  transition: -webkit-box-shadow 200ms linear;\n  transition: box-shadow 200ms linear;\n  transition: box-shadow 200ms linear, -webkit-box-shadow 200ms linear; }\n\n.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__row {\n  height: 96px; }\n\n.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__section {\n  padding: 0 12px; }\n\n.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__title {\n  /* \@noflip */\n  padding-left: 20px;\n  /* \@noflip */\n  padding-right: 0;\n  padding-bottom: 9px; }\n  [dir=\"rtl\"] .mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__title, .mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__title[dir=\"rtl\"] {\n    /* \@noflip */\n    padding-left: 0;\n    /* \@noflip */\n    padding-right: 20px; }\n\n.mdc-top-app-bar--fixed-adjust {\n  padding-top: 64px; }\n\n.mdc-top-app-bar--dense-fixed-adjust {\n  padding-top: 48px; }\n\n.mdc-top-app-bar--short-fixed-adjust {\n  padding-top: 56px; }\n\n.mdc-top-app-bar--prominent-fixed-adjust {\n  padding-top: 128px; }\n\n.mdc-top-app-bar--dense-prominent-fixed-adjust {\n  padding-top: 96px; }\n\n\@media (max-width: 599px) {\n  .mdc-top-app-bar__row {\n    height: 56px; }\n  .mdc-top-app-bar__section {\n    padding: 4px; }\n  .mdc-top-app-bar--short {\n    -webkit-transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1);\n    transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1); }\n  .mdc-top-app-bar--short-collapsed {\n    -webkit-transition: width 250ms cubic-bezier(0.4, 0, 0.2, 1);\n    transition: width 250ms cubic-bezier(0.4, 0, 0.2, 1); }\n    .mdc-top-app-bar--short-collapsed .mdc-top-app-bar__section--align-end {\n      /* \@noflip */\n      padding-left: 0;\n      /* \@noflip */\n      padding-right: 12px; }\n      [dir=\"rtl\"] .mdc-top-app-bar--short-collapsed .mdc-top-app-bar__section--align-end, .mdc-top-app-bar--short-collapsed .mdc-top-app-bar__section--align-end[dir=\"rtl\"] {\n        /* \@noflip */\n        padding-left: 12px;\n        /* \@noflip */\n        padding-right: 0; }\n  .mdc-top-app-bar--prominent .mdc-top-app-bar__title {\n    padding-bottom: 6px; }\n  .mdc-top-app-bar--fixed-adjust {\n    padding-top: 56px; } }"; }
}

/**
 * TS adaption of https://github.com/pillarjs/path-to-regexp/blob/master/index.js
 */
/**
 * Default configs.
 */
var DEFAULT_DELIMITER = '/';
var DEFAULT_DELIMITERS = './';
/**
 * The main path matching regexp utility.
 */
var PATH_REGEXP = new RegExp([
    // Match escaped characters that would otherwise appear in future matches.
    // This allows the user to escape special characters that won't transform.
    '(\\\\.)',
    // Match Express-style parameters and un-named parameters with a prefix
    // and optional suffixes. Matches appear as:
    //
    // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
    // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined]
    '(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?'
].join('|'), 'g');
/**
 * Parse a string for the raw tokens.
 */
function parse(str, options) {
    var tokens = [];
    var key = 0;
    var index = 0;
    var path = '';
    var defaultDelimiter = (options && options.delimiter) || DEFAULT_DELIMITER;
    var delimiters = (options && options.delimiters) || DEFAULT_DELIMITERS;
    var pathEscaped = false;
    var res;
    while ((res = PATH_REGEXP.exec(str)) !== null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;
        // Ignore already escaped sequences.
        if (escaped) {
            path += escaped[1];
            pathEscaped = true;
            continue;
        }
        var prev = '';
        var next = str[index];
        var name = res[2];
        var capture = res[3];
        var group = res[4];
        var modifier = res[5];
        if (!pathEscaped && path.length) {
            var k = path.length - 1;
            if (delimiters.indexOf(path[k]) > -1) {
                prev = path[k];
                path = path.slice(0, k);
            }
        }
        // Push the current path onto the tokens.
        if (path) {
            tokens.push(path);
            path = '';
            pathEscaped = false;
        }
        var partial = prev !== '' && next !== undefined && next !== prev;
        var repeat = modifier === '+' || modifier === '*';
        var optional = modifier === '?' || modifier === '*';
        var delimiter = prev || defaultDelimiter;
        var pattern = capture || group;
        tokens.push({
            name: name || key++,
            prefix: prev,
            delimiter: delimiter,
            optional: optional,
            repeat: repeat,
            partial: partial,
            pattern: pattern ? escapeGroup(pattern) : '[^' + escapeString(delimiter) + ']+?'
        });
    }
    // Push any remaining characters.
    if (path || index < str.length) {
        tokens.push(path + str.substr(index));
    }
    return tokens;
}
/**
 * Escape a regular expression string.
 */
function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
}
/**
 * Escape the capturing group by escaping special characters and meaning.
 */
function escapeGroup(group) {
    return group.replace(/([=!:$/()])/g, '\\$1');
}
/**
 * Get the flags for a regexp from the options.
 */
function flags(options) {
    return options && options.sensitive ? '' : 'i';
}
/**
 * Pull out keys from a regexp.
 */
function regexpToRegexp(path, keys) {
    if (!keys)
        return path;
    // Use a negative lookahead to match only capturing groups.
    var groups = path.source.match(/\((?!\?)/g);
    if (groups) {
        for (var i = 0; i < groups.length; i++) {
            keys.push({
                name: i,
                prefix: null,
                delimiter: null,
                optional: false,
                repeat: false,
                partial: false,
                pattern: null
            });
        }
    }
    return path;
}
/**
 * Transform an array into a regexp.
 */
function arrayToRegexp(path, keys, options) {
    var parts = [];
    for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
    }
    return new RegExp('(?:' + parts.join('|') + ')', flags(options));
}
/**
 * Create a path regexp from string input.
 */
function stringToRegexp(path, keys, options) {
    return tokensToRegExp(parse(path, options), keys, options);
}
/**
 * Expose a function for taking tokens and returning a RegExp.
 */
function tokensToRegExp(tokens, keys, options) {
    options = options || {};
    var strict = options.strict;
    var end = options.end !== false;
    var delimiter = escapeString(options.delimiter || DEFAULT_DELIMITER);
    var delimiters = options.delimiters || DEFAULT_DELIMITERS;
    var endsWith = [].concat(options.endsWith || []).map(escapeString).concat('$').join('|');
    var route = '';
    var isEndDelimited = false;
    // Iterate over the tokens and create our regexp string.
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if (typeof token === 'string') {
            route += escapeString(token);
            isEndDelimited = i === tokens.length - 1 && delimiters.indexOf(token[token.length - 1]) > -1;
        }
        else {
            var prefix = escapeString(token.prefix);
            var capture = token.repeat
                ? '(?:' + token.pattern + ')(?:' + prefix + '(?:' + token.pattern + '))*'
                : token.pattern;
            if (keys)
                keys.push(token);
            if (token.optional) {
                if (token.partial) {
                    route += prefix + '(' + capture + ')?';
                }
                else {
                    route += '(?:' + prefix + '(' + capture + '))?';
                }
            }
            else {
                route += prefix + '(' + capture + ')';
            }
        }
    }
    if (end) {
        if (!strict)
            route += '(?:' + delimiter + ')?';
        route += endsWith === '$' ? '$' : '(?=' + endsWith + ')';
    }
    else {
        if (!strict)
            route += '(?:' + delimiter + '(?=' + endsWith + '))?';
        if (!isEndDelimited)
            route += '(?=' + delimiter + '|' + endsWith + ')';
    }
    return new RegExp('^' + route, flags(options));
}
/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 */
function pathToRegexp(path, keys, options) {
    if (path instanceof RegExp) {
        return regexpToRegexp(path, keys);
    }
    if (Array.isArray(path)) {
        return arrayToRegexp(path, keys, options);
    }
    return stringToRegexp(path, keys, options);
}

const patternCache = {};
const cacheLimit = 10000;
let cacheCount = 0;
// Memoized function for creating the path match regex
function compilePath(pattern, options) {
    const cacheKey = `${options.end}${options.strict}`;
    const cache = patternCache[cacheKey] || (patternCache[cacheKey] = {});
    const cachePattern = JSON.stringify(pattern);
    if (cache[cachePattern]) {
        return cache[cachePattern];
    }
    const keys = [];
    const re = pathToRegexp(pattern, keys, options);
    const compiledPattern = { re, keys };
    if (cacheCount < cacheLimit) {
        cache[cachePattern] = compiledPattern;
        cacheCount += 1;
    }
    return compiledPattern;
}
/**
 * Public API for matching a URL pathname to a path pattern.
 */
function matchPath(pathname, options = {}) {
    if (typeof options === 'string') {
        options = { path: options };
    }
    const { path = '/', exact = false, strict = false } = options;
    const { re, keys } = compilePath(path, { end: exact, strict });
    const match = re.exec(pathname);
    if (!match) {
        return null;
    }
    const [url, ...values] = match;
    const isExact = pathname === url;
    if (exact && !isExact) {
        return null;
    }
    return {
        path,
        url: path === '/' && url === '' ? '/' : url,
        isExact,
        params: keys.reduce((memo, key, index) => {
            memo[key.name] = values[index];
            return memo;
        }, {})
    };
}

var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
function defaultConsumerRender(subscribe, child) {
    return h("context-consumer", { subscribe: subscribe, renderer: child });
}
function createProviderConsumer(defaultState, consumerRender = defaultConsumerRender) {
    let listeners = new Map();
    let currentState = defaultState;
    function notifyConsumers() {
        listeners.forEach(updateListener);
    }
    function updateListener(fields, listener) {
        if (Array.isArray(fields)) {
            [...fields].forEach(fieldName => {
                listener[fieldName] = currentState[fieldName];
            });
        }
        else {
            listener[fields] = Object.assign({}, currentState);
        }
        listener.forceUpdate();
    }
    function attachListener(propList) {
        return (el) => {
            if (listeners.has(el)) {
                return;
            }
            listeners.set(el, propList);
            updateListener(propList, el);
        };
    }
    function subscribe(el, propList) {
        attachListener(propList)(el);
        return function () {
            listeners.delete(el);
        };
    }
    function Provider({ state, children }) {
        currentState = state;
        notifyConsumers();
        return children;
    }
    function Consumer({ children }) {
        return consumerRender(subscribe, children[0]);
    }
    function wrapConsumer(childComponent, fieldList) {
        const Child = childComponent.is;
        return (_a) => {
            var { children } = _a, props = __rest(_a, ["children"]);
            return (h(Child, Object.assign({ ref: attachListener(fieldList) }, props), children));
        };
    }
    function injectProps(childComponent, fieldList) {
        let unsubscribe = null;
        const elementRefName = Object.keys(childComponent.properties).find(propName => {
            return childComponent.properties[propName].elementRef == true;
        });
        if (elementRefName == undefined) {
            throw new Error(`Please ensure that your Component ${childComponent.is} has an attribtue with "@Element" decorator. ` +
                `This is required to be able to inject properties.`);
        }
        const prevComponentWillLoad = childComponent.prototype.componentWillLoad;
        childComponent.prototype.componentWillLoad = function () {
            unsubscribe = subscribe(this[elementRefName], fieldList);
            if (prevComponentWillLoad) {
                return prevComponentWillLoad.bind(this)();
            }
        };
        const prevComponentDidUnload = childComponent.prototype.componentDidUnload;
        childComponent.prototype.componentDidUnload = function () {
            unsubscribe();
            if (prevComponentDidUnload) {
                return prevComponentDidUnload.bind(this)();
            }
        };
    }
    return {
        Provider,
        Consumer,
        wrapConsumer,
        injectProps
    };
}

var ActiveRouter = createProviderConsumer({
    location: null,
    titleSuffix: '',
    root: '/',
    history: null
});

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
  * @name Route
  * @module ionic
  * @description
 */
class Route {
    constructor() {
        this.group = null;
        this.groupMatch = null;
        this.componentUpdated = null;
        this.match = null;
        this.unsubscribe = () => { return; };
        this.componentProps = {};
        this.exact = false;
        this.routeRender = null;
        this.scrollTopOffset = null;
        this.scrollOnNextRender = false;
    }
    componentWillLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.groupMatch) {
                this.groupMatchChanged(this.groupMatch);
            }
        });
    }
    groupMatchChanged(groupMatchValue) {
        this.match = groupMatchValue;
    }
    // Identify if the current route is a match.
    computeMatch() {
        // If you are in a group then your switch handles this.
        if (this.group) {
            return;
        }
        this.match = matchPath(this.location.pathname, {
            path: this.url,
            exact: this.exact,
            strict: true
        });
    }
    componentDidUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof this.componentUpdated === 'function') {
                // Wait for all children to complete rendering before calling componentUpdated
                yield Promise.all(Array.from(this.el.children).map((element) => {
                    if (element.componentOnReady) {
                        return element.componentOnReady();
                    }
                    return Promise.resolve(element);
                }));
                // After all children have completed then tell switch
                // the provided callback will get executed after this route is in view
                if (typeof this.componentUpdated === 'function') {
                    this.componentUpdated(this.scrollTo.bind(this));
                }
            }
        });
    }
    scrollTo() {
        if (this.scrollTopOffset == null || !this.history || this.isServer) {
            return;
        }
        if (this.history.action === 'POP' && this.history.location.scrollPosition != null) {
            return this.queue.write(() => {
                window.scrollTo(this.history.location.scrollPosition[0], this.history.location.scrollPosition[1]);
            });
        }
        // okay, the frame has passed. Go ahead and render now
        return this.queue.write(() => {
            window.scrollTo(0, this.scrollTopOffset);
        });
    }
    render() {
        // If there is no activeRouter then do not render
        // Check if this route is in the matching URL (for example, a parent route)
        if (!this.match) {
            return null;
        }
        // component props defined in route
        // the history api
        // current match data including params
        const childProps = Object.assign({}, this.componentProps, { history: this.history, match: this.match });
        // If there is a routerRender defined then use
        // that and pass the component and component props with it.
        if (this.routeRender) {
            return this.routeRender(Object.assign({}, childProps, { component: this.component }));
        }
        if (this.component) {
            const ChildComponent = this.component;
            return (h(ChildComponent, Object.assign({}, childProps)));
        }
    }
    static get is() { return "stencil-route"; }
    static get properties() { return {
        "component": {
            "type": String,
            "attr": "component"
        },
        "componentProps": {
            "type": "Any",
            "attr": "component-props"
        },
        "componentUpdated": {
            "type": "Any",
            "attr": "component-updated"
        },
        "el": {
            "elementRef": true
        },
        "exact": {
            "type": Boolean,
            "attr": "exact"
        },
        "group": {
            "type": String,
            "attr": "group"
        },
        "groupMatch": {
            "type": "Any",
            "attr": "group-match",
            "watchCallbacks": ["groupMatchChanged"]
        },
        "history": {
            "type": "Any",
            "attr": "history"
        },
        "isServer": {
            "context": "isServer"
        },
        "location": {
            "type": "Any",
            "attr": "location",
            "watchCallbacks": ["computeMatch"]
        },
        "match": {
            "state": true
        },
        "queue": {
            "context": "queue"
        },
        "routeRender": {
            "type": "Any",
            "attr": "route-render"
        },
        "scrollTopOffset": {
            "type": Number,
            "attr": "scroll-top-offset"
        },
        "url": {
            "type": String,
            "attr": "url"
        }
    }; }
    static get style() { return "stencil-route.inactive {\n  display: none;\n}"; }
}
ActiveRouter.injectProps(Route, [
    'location',
    'history'
]);

function uuidv4 () {
    return ([1e7].toString() + -1e3.toString() + -4e3.toString() + -8e3.toString() + -1e11.toString()).replace(/[018]/g, function (c) {
        const random = window.crypto.getRandomValues(new Uint8Array(1));
        return (c ^ random[0] & 15 >> c / 4).toString(16);
    });
}

var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function getUniqueId() {
    if (window.crypto) {
        return uuidv4();
    }
    return (Math.random() * 10e16).toString().match(/.{4}/g).join('-');
}
function getMatch(pathname, url, exact) {
    return matchPath(pathname, {
        path: url,
        exact: exact,
        strict: true
    });
}
class RouteSwitch {
    constructor() {
        this.group = getUniqueId();
        this.scrollTopOffset = null;
        this.activeIndex = null;
    }
    componentWillLoad() {
        this.regenerateSubscribers(this.location);
    }
    regenerateSubscribers(newLocation) {
        return __awaiter$1(this, void 0, void 0, function* () {
            let newActiveIndex = null;
            this.subscribers = Array.from(this.el.children)
                .map((childElement, index) => {
                const match = getMatch(newLocation.pathname, childElement.url, childElement.exact);
                if (match && newActiveIndex === null) {
                    newActiveIndex = index;
                }
                return {
                    el: childElement,
                    match: match
                };
            });
            // Check if this actually changes which child is active
            // then just pass the new match down if the active route isn't changing.
            if (this.activeIndex === newActiveIndex) {
                this.subscribers[this.activeIndex].el.groupMatch = this.subscribers[this.activeIndex].match;
                return;
            }
            this.activeIndex = newActiveIndex;
            // Set all props on the new active route then wait until it says that it
            // is completed
            const afterViewUpdates = yield new Promise((resolve) => {
                const activeChild = this.subscribers[this.activeIndex];
                activeChild.el.scrollTopOffset = this.scrollTopOffset;
                activeChild.el.group = this.group;
                activeChild.el.groupMatch = activeChild.match;
                activeChild.el.componentUpdated = resolve;
            });
            // After the new active route has completed then update visibility of routes
            this.queue.write(() => {
                this.subscribers.forEach((child, index) => {
                    child.el.componentUpdated = null;
                    if (index === this.activeIndex) {
                        return child.el.style.display = null;
                    }
                    child.el.scrollTopOffset = this.scrollTopOffset;
                    child.el.group = this.group;
                    child.el.groupMatch = null;
                    child.el.style.display = 'none';
                });
            });
            afterViewUpdates();
        });
    }
    render() {
        return (h("slot", null));
    }
    static get is() { return "stencil-route-switch"; }
    static get properties() { return {
        "el": {
            "elementRef": true
        },
        "group": {
            "type": String,
            "attr": "group",
            "reflectToAttr": true
        },
        "location": {
            "type": "Any",
            "attr": "location",
            "watchCallbacks": ["regenerateSubscribers"]
        },
        "queue": {
            "context": "queue"
        },
        "scrollTopOffset": {
            "type": Number,
            "attr": "scroll-top-offset"
        }
    }; }
}
ActiveRouter.injectProps(RouteSwitch, [
    'location'
]);

function hasBasename(path, prefix) {
    return (new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i')).test(path);
}
function stripBasename(path, prefix) {
    return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
}
function stripTrailingSlash(path) {
    return path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path;
}
function addLeadingSlash(path) {
    return path.charAt(0) === '/' ? path : '/' + path;
}
function stripLeadingSlash(path) {
    return path.charAt(0) === '/' ? path.substr(1) : path;
}
function parsePath(path) {
    let pathname = path || '/';
    let search = '';
    let hash = '';
    const hashIndex = pathname.indexOf('#');
    if (hashIndex !== -1) {
        hash = pathname.substr(hashIndex);
        pathname = pathname.substr(0, hashIndex);
    }
    const searchIndex = pathname.indexOf('?');
    if (searchIndex !== -1) {
        search = pathname.substr(searchIndex);
        pathname = pathname.substr(0, searchIndex);
    }
    return {
        pathname,
        search: search === '?' ? '' : search,
        hash: hash === '#' ? '' : hash
    };
}
function createPath(location) {
    const { pathname, search, hash } = location;
    let path = pathname || '/';
    if (search && search !== '?') {
        path += (search.charAt(0) === '?' ? search : `?${search}`);
    }
    if (hash && hash !== '#') {
        path += (hash.charAt(0) === '#' ? hash : `#${hash}`);
    }
    return path;
}
function parseQueryString(query) {
    if (!query) {
        return {};
    }
    return (/^[?#]/.test(query) ? query.slice(1) : query)
        .split('&')
        .reduce((params, param) => {
        let [key, value] = param.split('=');
        params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
        return params;
    }, {});
}

function isAbsolute(pathname) {
    return pathname.charAt(0) === '/';
}
// About 1.5x faster than the two-arg version of Array#splice()
function spliceOne(list, index) {
    for (let i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
        list[i] = list[k];
    }
    list.pop();
}
// This implementation is based heavily on node's url.parse
function resolvePathname(to, from = '') {
    const toParts = to && to.split('/') || [];
    let fromParts = from && from.split('/') || [];
    const isToAbs = to && isAbsolute(to);
    const isFromAbs = from && isAbsolute(from);
    const mustEndAbs = isToAbs || isFromAbs;
    if (to && isAbsolute(to)) {
        // to is absolute
        fromParts = toParts;
    }
    else if (toParts.length) {
        // to is relative, drop the filename
        fromParts.pop();
        fromParts = fromParts.concat(toParts);
    }
    if (!fromParts.length) {
        return '/';
    }
    let hasTrailingSlash;
    if (fromParts.length) {
        const last = fromParts[fromParts.length - 1];
        hasTrailingSlash = (last === '.' || last === '..' || last === '');
    }
    else {
        hasTrailingSlash = false;
    }
    let up = 0;
    for (let i = fromParts.length; i >= 0; i--) {
        const part = fromParts[i];
        if (part === '.') {
            spliceOne(fromParts, i);
        }
        else if (part === '..') {
            spliceOne(fromParts, i);
            up++;
        }
        else if (up) {
            spliceOne(fromParts, i);
            up--;
        }
    }
    if (!mustEndAbs) {
        for (; up--; up) {
            fromParts.unshift('..');
        }
    }
    if (mustEndAbs && fromParts[0] !== '' && (!fromParts[0] || !isAbsolute(fromParts[0]))) {
        fromParts.unshift('');
    }
    let result = fromParts.join('/');
    if (hasTrailingSlash && result.substr(-1) !== '/') {
        result += '/';
    }
    return result;
}
function valueEqual(a, b) {
    if (a === b) {
        return true;
    }
    if (a == null || b == null) {
        return false;
    }
    if (Array.isArray(a)) {
        return Array.isArray(b) && a.length === b.length && a.every(function (item, index) {
            return valueEqual(item, b[index]);
        });
    }
    const aType = typeof a;
    const bType = typeof b;
    if (aType !== bType) {
        return false;
    }
    if (aType === 'object') {
        const aValue = a.valueOf();
        const bValue = b.valueOf();
        if (aValue !== a || bValue !== b) {
            return valueEqual(aValue, bValue);
        }
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) {
            return false;
        }
        return aKeys.every(function (key) {
            return valueEqual(a[key], b[key]);
        });
    }
    return false;
}
function locationsAreEqual(a, b) {
    return a.pathname === b.pathname &&
        a.search === b.search &&
        a.hash === b.hash &&
        a.key === b.key &&
        valueEqual(a.state, b.state);
}
function createLocation(path, state, key, currentLocation) {
    let location;
    if (typeof path === 'string') {
        // Two-arg form: push(path, state)
        location = parsePath(path);
        location.state = state;
    }
    else {
        // One-arg form: push(location)
        location = Object.assign({}, path);
        if (location.pathname === undefined) {
            location.pathname = '';
        }
        if (location.search) {
            if (location.search.charAt(0) !== '?') {
                location.search = '?' + location.search;
            }
        }
        else {
            location.search = '';
        }
        if (location.hash) {
            if (location.hash.charAt(0) !== '#') {
                location.hash = '#' + location.hash;
            }
        }
        else {
            location.hash = '';
        }
        if (state !== undefined && location.state === undefined) {
            location.state = state;
        }
    }
    try {
        location.pathname = decodeURI(location.pathname);
    }
    catch (e) {
        if (e instanceof URIError) {
            throw new URIError('Pathname "' + location.pathname + '" could not be decoded. ' +
                'This is likely caused by an invalid percent-encoding.');
        }
        else {
            throw e;
        }
    }
    if (key) {
        location.key = key;
    }
    if (currentLocation) {
        // Resolve incomplete/relative pathname relative to current location.
        if (!location.pathname) {
            location.pathname = currentLocation.pathname;
        }
        else if (location.pathname.charAt(0) !== '/') {
            location.pathname = resolvePathname(location.pathname, currentLocation.pathname);
        }
    }
    else {
        // When there is no prior location and pathname is empty, set it to /
        if (!location.pathname) {
            location.pathname = '/';
        }
    }
    location.query = parseQueryString(location.search);
    return location;
}

function invariant(value, ...args) {
    if (!value) {
        console.error(...args);
    }
}
function warning(value, ...args) {
    if (!value) {
        console.warn(...args);
    }
}

// Adapted from the https://github.com/ReactTraining/history and converted to TypeScript
const createTransitionManager = () => {
    let prompt;
    const setPrompt = (nextPrompt) => {
        warning(prompt == null, 'A history supports only one prompt at a time');
        prompt = nextPrompt;
        return () => {
            if (prompt === nextPrompt) {
                prompt = null;
            }
        };
    };
    const confirmTransitionTo = (location, action, getUserConfirmation, callback) => {
        // TODO: If another transition starts while we're still confirming
        // the previous one, we may end up in a weird state. Figure out the
        // best way to handle this.
        if (prompt != null) {
            const result = typeof prompt === 'function' ? prompt(location, action) : prompt;
            if (typeof result === 'string') {
                if (typeof getUserConfirmation === 'function') {
                    getUserConfirmation(result, callback);
                }
                else {
                    warning(false, 'A history needs a getUserConfirmation function in order to use a prompt message');
                    callback(true);
                }
            }
            else {
                // Return false from a transition hook to cancel the transition.
                callback(result !== false);
            }
        }
        else {
            callback(true);
        }
    };
    let listeners = [];
    const appendListener = (fn) => {
        let isActive = true;
        const listener = (...args) => {
            if (isActive) {
                fn(...args);
            }
        };
        listeners.push(listener);
        return () => {
            isActive = false;
            listeners = listeners.filter(item => item !== listener);
        };
    };
    const notifyListeners = (...args) => {
        listeners.forEach(listener => listener(...args));
    };
    return {
        setPrompt,
        confirmTransitionTo,
        appendListener,
        notifyListeners
    };
};

const canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
const addEventListener = (node, event, listener) => (node.addEventListener
    ? node.addEventListener(event, listener, false)
    : node.attachEvent('on' + event, listener));
const removeEventListener = (node, event, listener) => (node.removeEventListener
    ? node.removeEventListener(event, listener, false)
    : node.detachEvent('on' + event, listener));
const getConfirmation = (message, callback) => (callback(window.confirm(message)));
/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
 */
const supportsHistory = () => {
    const ua = window.navigator.userAgent;
    if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
        ua.indexOf('Mobile Safari') !== -1 &&
        ua.indexOf('Chrome') === -1 &&
        ua.indexOf('Windows Phone') === -1) {
        return false;
    }
    return window.history && 'pushState' in window.history;
};
/**
 * Returns true if browser fires popstate on hash change.
 * IE10 and IE11 do not.
 */
const supportsPopStateOnHashChange = () => (window.navigator.userAgent.indexOf('Trident') === -1);
/**
 * Returns false if using go(n) with hash history causes a full page reload.
 */
const supportsGoWithoutReloadUsingHash = () => (window.navigator.userAgent.indexOf('Firefox') === -1);
const isExtraneousPopstateEvent = (event) => (event.state === undefined &&
    navigator.userAgent.indexOf('CriOS') === -1);
const storageAvailable = (type) => {
    try {
        var storage = window[type], x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return e instanceof DOMException && (
        // everything except Firefox
        e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
};

const createScrollHistory = (applicationScrollKey = 'scrollPositions') => {
    let scrollPositions = new Map();
    if (storageAvailable('sessionStorage')) {
        scrollPositions = window.sessionStorage.getItem(applicationScrollKey) ?
            new Map(JSON.parse(window.sessionStorage.getItem(applicationScrollKey))) :
            scrollPositions;
    }
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    function set(key, value) {
        scrollPositions.set(key, value);
        if (storageAvailable('sessionStorage')) {
            const arrayData = [];
            scrollPositions.forEach((value, key) => {
                arrayData.push([key, value]);
            });
            window.sessionStorage.setItem('scrollPositions', JSON.stringify(arrayData));
        }
    }
    function get(key) {
        return scrollPositions.get(key);
    }
    function has(key) {
        return scrollPositions.has(key);
    }
    function capture(key) {
        set(key, [window.scrollX, window.scrollY]);
    }
    return {
        set,
        get,
        has,
        capture
    };
};

// Adapted from the https://github.com/ReactTraining/history and converted to TypeScript
const PopStateEvent = 'popstate';
const HashChangeEvent = 'hashchange';
const getHistoryState = () => {
    try {
        return window.history.state || {};
    }
    catch (e) {
        // IE 11 sometimes throws when accessing window.history.state
        // See https://github.com/ReactTraining/history/pull/289
        return {};
    }
};
/**
 * Creates a history object that uses the HTML5 history API including
 * pushState, replaceState, and the popstate event.
 */
const createBrowserHistory = (props = {}) => {
    invariant(canUseDOM, 'Browser history needs a DOM');
    const globalHistory = window.history;
    const canUseHistory = supportsHistory();
    const needsHashChangeListener = !supportsPopStateOnHashChange();
    const scrollHistory = createScrollHistory();
    const { forceRefresh = false, getUserConfirmation = getConfirmation, keyLength = 6 } = props;
    const basename = props.basename ? stripTrailingSlash(addLeadingSlash(props.basename)) : '';
    const getDOMLocation = (historyState) => {
        historyState = historyState || {};
        const { key, state } = historyState;
        const { pathname, search, hash } = window.location;
        let path = pathname + search + hash;
        warning((!basename || hasBasename(path, basename)), 'You are attempting to use a basename on a page whose URL path does not begin ' +
            'with the basename. Expected path "' + path + '" to begin with "' + basename + '".');
        if (basename) {
            path = stripBasename(path, basename);
        }
        return createLocation(path, state, key);
    };
    const createKey = () => (Math.random().toString(36).substr(2, keyLength));
    const transitionManager = createTransitionManager();
    const setState = (nextState) => {
        // Capture location for the view before changing history.
        scrollHistory.capture(history.location.key);
        Object.assign(history, nextState);
        // Set scroll position based on its previous storage value
        history.location.scrollPosition = scrollHistory.get(history.location.key);
        history.length = globalHistory.length;
        transitionManager.notifyListeners(history.location, history.action);
    };
    const handlePopState = (event) => {
        // Ignore extraneous popstate events in WebKit.
        if (isExtraneousPopstateEvent(event)) {
            return;
        }
        handlePop(getDOMLocation(event.state));
    };
    const handleHashChange = () => {
        handlePop(getDOMLocation(getHistoryState()));
    };
    let forceNextPop = false;
    const handlePop = (location) => {
        if (forceNextPop) {
            forceNextPop = false;
            setState();
        }
        else {
            const action = 'POP';
            transitionManager.confirmTransitionTo(location, action, getUserConfirmation, (ok) => {
                if (ok) {
                    setState({ action, location });
                }
                else {
                    revertPop(location);
                }
            });
        }
    };
    const revertPop = (fromLocation) => {
        const toLocation = history.location;
        // TODO: We could probably make this more reliable by
        // keeping a list of keys we've seen in sessionStorage.
        // Instead, we just default to 0 for keys we don't know.
        let toIndex = allKeys.indexOf(toLocation.key);
        if (toIndex === -1) {
            toIndex = 0;
        }
        let fromIndex = allKeys.indexOf(fromLocation.key);
        if (fromIndex === -1) {
            fromIndex = 0;
        }
        const delta = toIndex - fromIndex;
        if (delta) {
            forceNextPop = true;
            go(delta);
        }
    };
    const initialLocation = getDOMLocation(getHistoryState());
    let allKeys = [initialLocation.key];
    // Public interface
    const createHref = (location) => {
        return basename + createPath(location);
    };
    const push = (path, state) => {
        warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' +
            'argument is a location-like object that already has state; it is ignored');
        const action = 'PUSH';
        const location = createLocation(path, state, createKey(), history.location);
        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, (ok) => {
            if (!ok) {
                return;
            }
            const href = createHref(location);
            const { key, state } = location;
            if (canUseHistory) {
                globalHistory.pushState({ key, state }, null, href);
                if (forceRefresh) {
                    window.location.href = href;
                }
                else {
                    const prevIndex = allKeys.indexOf(history.location.key);
                    const nextKeys = allKeys.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);
                    nextKeys.push(location.key);
                    allKeys = nextKeys;
                    setState({ action, location });
                }
            }
            else {
                warning(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history');
                window.location.href = href;
            }
        });
    };
    const replace = (path, state) => {
        warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' +
            'argument is a location-like object that already has state; it is ignored');
        const action = 'REPLACE';
        const location = createLocation(path, state, createKey(), history.location);
        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, (ok) => {
            if (!ok) {
                return;
            }
            const href = createHref(location);
            const { key, state } = location;
            if (canUseHistory) {
                globalHistory.replaceState({ key, state }, null, href);
                if (forceRefresh) {
                    window.location.replace(href);
                }
                else {
                    const prevIndex = allKeys.indexOf(history.location.key);
                    if (prevIndex !== -1) {
                        allKeys[prevIndex] = location.key;
                    }
                    setState({ action, location });
                }
            }
            else {
                warning(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history');
                window.location.replace(href);
            }
        });
    };
    const go = (n) => {
        globalHistory.go(n);
    };
    const goBack = () => go(-1);
    const goForward = () => go(1);
    let listenerCount = 0;
    const checkDOMListeners = (delta) => {
        listenerCount += delta;
        if (listenerCount === 1) {
            addEventListener(window, PopStateEvent, handlePopState);
            if (needsHashChangeListener) {
                addEventListener(window, HashChangeEvent, handleHashChange);
            }
        }
        else if (listenerCount === 0) {
            removeEventListener(window, PopStateEvent, handlePopState);
            if (needsHashChangeListener) {
                removeEventListener(window, HashChangeEvent, handleHashChange);
            }
        }
    };
    let isBlocked = false;
    const block = (prompt = '') => {
        const unblock = transitionManager.setPrompt(prompt);
        if (!isBlocked) {
            checkDOMListeners(1);
            isBlocked = true;
        }
        return () => {
            if (isBlocked) {
                isBlocked = false;
                checkDOMListeners(-1);
            }
            return unblock();
        };
    };
    const listen = (listener) => {
        const unlisten = transitionManager.appendListener(listener);
        checkDOMListeners(1);
        return () => {
            checkDOMListeners(-1);
            unlisten();
        };
    };
    const history = {
        length: globalHistory.length,
        action: 'POP',
        location: initialLocation,
        createHref,
        push,
        replace,
        go,
        goBack,
        goForward,
        block,
        listen
    };
    return history;
};

// Adapted from the https://github.com/ReactTraining/history and converted to TypeScript
const HashChangeEvent$1 = 'hashchange';
const HashPathCoders = {
    hashbang: {
        encodePath: (path) => path.charAt(0) === '!' ? path : '!/' + stripLeadingSlash(path),
        decodePath: (path) => path.charAt(0) === '!' ? path.substr(1) : path
    },
    noslash: {
        encodePath: stripLeadingSlash,
        decodePath: addLeadingSlash
    },
    slash: {
        encodePath: addLeadingSlash,
        decodePath: addLeadingSlash
    }
};
const getHashPath = () => {
    // We can't use window.location.hash here because it's not
    // consistent across browsers - Firefox will pre-decode it!
    const href = window.location.href;
    const hashIndex = href.indexOf('#');
    return hashIndex === -1 ? '' : href.substring(hashIndex + 1);
};
const pushHashPath = (path) => (window.location.hash = path);
const replaceHashPath = (path) => {
    const hashIndex = window.location.href.indexOf('#');
    window.location.replace(window.location.href.slice(0, hashIndex >= 0 ? hashIndex : 0) + '#' + path);
};
const createHashHistory = (props = {}) => {
    invariant(canUseDOM, 'Hash history needs a DOM');
    const globalHistory = window.history;
    const canGoWithoutReload = supportsGoWithoutReloadUsingHash();
    const { getUserConfirmation = getConfirmation, hashType = 'slash' } = props;
    const basename = props.basename ? stripTrailingSlash(addLeadingSlash(props.basename)) : '';
    const { encodePath, decodePath } = HashPathCoders[hashType];
    const getDOMLocation = () => {
        let path = decodePath(getHashPath());
        warning((!basename || hasBasename(path, basename)), 'You are attempting to use a basename on a page whose URL path does not begin ' +
            'with the basename. Expected path "' + path + '" to begin with "' + basename + '".');
        if (basename) {
            path = stripBasename(path, basename);
        }
        return createLocation(path);
    };
    const transitionManager = createTransitionManager();
    const setState = (nextState) => {
        Object.assign(history, nextState);
        history.length = globalHistory.length;
        transitionManager.notifyListeners(history.location, history.action);
    };
    let forceNextPop = false;
    let ignorePath = null;
    const handleHashChange = () => {
        const path = getHashPath();
        const encodedPath = encodePath(path);
        if (path !== encodedPath) {
            // Ensure we always have a properly-encoded hash.
            replaceHashPath(encodedPath);
        }
        else {
            const location = getDOMLocation();
            const prevLocation = history.location;
            if (!forceNextPop && locationsAreEqual(prevLocation, location)) {
                return; // A hashchange doesn't always == location change.
            }
            if (ignorePath === createPath(location)) {
                return; // Ignore this change; we already setState in push/replace.
            }
            ignorePath = null;
            handlePop(location);
        }
    };
    const handlePop = (location) => {
        if (forceNextPop) {
            forceNextPop = false;
            setState();
        }
        else {
            const action = 'POP';
            transitionManager.confirmTransitionTo(location, action, getUserConfirmation, (ok) => {
                if (ok) {
                    setState({ action, location });
                }
                else {
                    revertPop(location);
                }
            });
        }
    };
    const revertPop = (fromLocation) => {
        const toLocation = history.location;
        // TODO: We could probably make this more reliable by
        // keeping a list of paths we've seen in sessionStorage.
        // Instead, we just default to 0 for paths we don't know.
        let toIndex = allPaths.lastIndexOf(createPath(toLocation));
        if (toIndex === -1) {
            toIndex = 0;
        }
        let fromIndex = allPaths.lastIndexOf(createPath(fromLocation));
        if (fromIndex === -1) {
            fromIndex = 0;
        }
        const delta = toIndex - fromIndex;
        if (delta) {
            forceNextPop = true;
            go(delta);
        }
    };
    // Ensure the hash is encoded properly before doing anything else.
    const path = getHashPath();
    const encodedPath = encodePath(path);
    if (path !== encodedPath) {
        replaceHashPath(encodedPath);
    }
    const initialLocation = getDOMLocation();
    let allPaths = [createPath(initialLocation)];
    // Public interface
    const createHref = (location) => ('#' + encodePath(basename + createPath(location)));
    const push = (path, state) => {
        warning(state === undefined, 'Hash history cannot push state; it is ignored');
        const action = 'PUSH';
        const location = createLocation(path, undefined, undefined, history.location);
        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, (ok) => {
            if (!ok) {
                return;
            }
            const path = createPath(location);
            const encodedPath = encodePath(basename + path);
            const hashChanged = getHashPath() !== encodedPath;
            if (hashChanged) {
                // We cannot tell if a hashchange was caused by a PUSH, so we'd
                // rather setState here and ignore the hashchange. The caveat here
                // is that other hash histories in the page will consider it a POP.
                ignorePath = path;
                pushHashPath(encodedPath);
                const prevIndex = allPaths.lastIndexOf(createPath(history.location));
                const nextPaths = allPaths.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);
                nextPaths.push(path);
                allPaths = nextPaths;
                setState({ action, location });
            }
            else {
                warning(false, 'Hash history cannot PUSH the same path; a new entry will not be added to the history stack');
                setState();
            }
        });
    };
    const replace = (path, state) => {
        warning(state === undefined, 'Hash history cannot replace state; it is ignored');
        const action = 'REPLACE';
        const location = createLocation(path, undefined, undefined, history.location);
        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, (ok) => {
            if (!ok) {
                return;
            }
            const path = createPath(location);
            const encodedPath = encodePath(basename + path);
            const hashChanged = getHashPath() !== encodedPath;
            if (hashChanged) {
                // We cannot tell if a hashchange was caused by a REPLACE, so we'd
                // rather setState here and ignore the hashchange. The caveat here
                // is that other hash histories in the page will consider it a POP.
                ignorePath = path;
                replaceHashPath(encodedPath);
            }
            const prevIndex = allPaths.indexOf(createPath(history.location));
            if (prevIndex !== -1) {
                allPaths[prevIndex] = path;
            }
            setState({ action, location });
        });
    };
    const go = (n) => {
        warning(canGoWithoutReload, 'Hash history go(n) causes a full page reload in this browser');
        globalHistory.go(n);
    };
    const goBack = () => go(-1);
    const goForward = () => go(1);
    let listenerCount = 0;
    const checkDOMListeners = (delta) => {
        listenerCount += delta;
        if (listenerCount === 1) {
            addEventListener(window, HashChangeEvent$1, handleHashChange);
        }
        else if (listenerCount === 0) {
            removeEventListener(window, HashChangeEvent$1, handleHashChange);
        }
    };
    let isBlocked = false;
    const block = (prompt = '') => {
        const unblock = transitionManager.setPrompt(prompt);
        if (!isBlocked) {
            checkDOMListeners(1);
            isBlocked = true;
        }
        return () => {
            if (isBlocked) {
                isBlocked = false;
                checkDOMListeners(-1);
            }
            return unblock();
        };
    };
    const listen = (listener) => {
        const unlisten = transitionManager.appendListener(listener);
        checkDOMListeners(1);
        return () => {
            checkDOMListeners(-1);
            unlisten();
        };
    };
    const history = {
        length: globalHistory.length,
        action: 'POP',
        location: initialLocation,
        createHref,
        push,
        replace,
        go,
        goBack,
        goForward,
        block,
        listen
    };
    return history;
};

var __awaiter$2 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const HISTORIES = {
    'browser': createBrowserHistory,
    'hash': createHashHistory
};
/**
  * @name Router
  * @module ionic
  * @description
 */
class Router {
    constructor() {
        this.root = '/';
        this.historyType = 'browser';
        // A suffix to append to the page title whenever
        // it's updated through RouteTitle
        this.titleSuffix = '';
        this.asyncListeners = [];
        this.asyncGroups = {};
    }
    componentWillLoad() {
        this.history = HISTORIES[this.historyType]();
        this.history.listen((location) => __awaiter$2(this, void 0, void 0, function* () {
            location = this.getLocation(location);
            this.location = location;
        }));
        this.location = this.getLocation(this.history.location);
    }
    getLocation(location) {
        // Remove the root URL if found at beginning of string
        const pathname = location.pathname.indexOf(this.root) == 0 ?
            '/' + location.pathname.slice(this.root.length) :
            location.pathname;
        return Object.assign({}, location, { pathname });
    }
    render() {
        const state = {
            location: this.location,
            titleSuffix: this.titleSuffix,
            root: this.root,
            history: this.history
        };
        return (h(ActiveRouter.Provider, { state: state },
            h("slot", null)));
    }
    static get is() { return "stencil-router"; }
    static get properties() { return {
        "history": {
            "state": true
        },
        "historyType": {
            "type": String,
            "attr": "history-type"
        },
        "location": {
            "state": true
        },
        "root": {
            "type": String,
            "attr": "root"
        },
        "titleSuffix": {
            "type": String,
            "attr": "title-suffix"
        }
    }; }
}

export { AppRoot, Route as StencilRoute, RouteSwitch as StencilRouteSwitch, Router as StencilRouter };
