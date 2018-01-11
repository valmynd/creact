// JSDOM seems to not have document.createElement
// keep an eye on https://github.com/kentcdodds/react-ava-workshop
//import {JSDOM} from "jsdom"
//const {JSDOM} = require("jsdom")
//global.document = new JSDOM("<!doctype html><html><body></body></html>")
//global.window = document.defaultView
//if(!document.createElementNS) document.createElementNS = (ns, tag) => document.createElement(tag)
//console.log(global.document)
// see https://github.com/avajs/ava/blob/master/docs/recipes/browser-testing.md

global.print = console.log

require("browser-env")()
