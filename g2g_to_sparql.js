exports.g2gmlToSparql = g2gmlToSparql

var g2gmlPath = process.argv[2];
var dstPath = process.argv[3];

const REQUIRED = "match";
const SRC = "SN";
const DST = "DN";
const SUBJECT = "S";
const OBJECT = "O";

var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');

function g2gmlToSparql(g2gmlPath, dstLocation) {
  var prefixPart = "";
  var g2g = yaml.safeLoad(fs.readFileSync(g2gmlPath, 'utf8'));
  const NODES = 'nodes';
  const EDGES = 'edges';
  for(let key in g2g) {
    var value = g2g[key];
    if(key != NODES && key != EDGES) {
      if(key.startsWith('PREFIX')){
        prefixPart += key+': ' + value + '\n';
      } else {
        throw 'invalid entry: ' + key;
      }
    }
  }
  node2Sparql = createNodeSparqlMap(g2g[NODES]);
  edge2Sparql = createEdgeSparqlMap(g2g[EDGES], g2g[NODES]);
  var nodeFiles = writeSparqlFiles(node2Sparql, dstLocation, prefixPart, 'nodes');
  var edgeFiles = writeSparqlFiles(edge2Sparql, dstLocation, prefixPart, 'edges');
  return [nodeFiles, edgeFiles];
}

function writeSparqlFiles(name2SparqlMap, dstLocation, header, suffix) {
  return Object.keys(name2SparqlMap).map(
    (name) =>
      {
        var fileName = dstLocation + name + '_' + suffix + '.sql';
        fs.writeFileSync(fileName,  header + name2SparqlMap[name], 'utf8');
        return fileName;
      }
  );
}

function createNodeSparqlMap(nodes) {
  var map = {};
  Object.keys(nodes).forEach(
    (node) => {
      map[node] = 'SELECT\n' +
        '  ?S AS ?nid \n' +
        '  "' + node + '" AS ?type \n' + 
        Object.keys(nodes[node]).map(
          (prop, index) =>
            (prop == REQUIRED ? '' : 
            '  "' + prop + '" AS ?P' + index + '\n' +
            '  ?O' + index + '\n')
        ).join('') + 
      createWherePhrase(nodes[node]);
    });
  return map;
}

function createWherePhrase(nodeObject) {
  conditionList = 
    Object.keys(nodeObject).map(
      (node, index) => '  ' +  
        (node == REQUIRED ?
          toVariable(nodeObject[node], index) :
          'OPTIONAL {' + toVariable(nodeObject[node], index) + '}'));
return 'WHERE { \n' +
    conditionList.join(' .\n') +
   '\n}';
}


function toVariable(srcString, index) {
  return srcString.split(' ').map((token) =>
    (token == SUBJECT ? '?' + SUBJECT :
    (token == OBJECT ? '?' + OBJECT + index : token))).join(' ');
}


function createEdgeSparqlMap(edges, nodes) {
  var map = {};
  Object.keys(edges).forEach(
    (edge) => {
      var edgeDcl = parseEdgeDeclaration(edge);
      map[edgeDcl.name] = 'SELECT\n' +
        '  ?SN\n' +
        '  ?DN\n' +
        '  "' + edgeDcl.name + '" AS ?type \n' + 
        Object.keys(edges[edge]).map(
          (prop, index) =>
            (prop == REQUIRED ? '' : 
            '  "' + prop + '" AS ?P' + index + '\n' +
            '  ?O' + index + '\n')
        ).join('') + 
      createEdgeWherePhrase(edges[edge], edgeDcl, nodes);
    });
  return map;
}

function createEdgeWherePhrase(edgeObject, edgeDcl, nodes) {
  conditionList = 
    Object.keys(edgeObject).map(
      (prop, index) => '  ' +  
        (prop == REQUIRED ?
          toVariable(edgeObject[prop], index) :
          'OPTIONAL {' + toVariable(edgeObject[prop], index, true) + '}'));
return 'WHERE { \n  ' +
    nodes[edgeDcl.src][REQUIRED].replace(SUBJECT, '?' + SRC) + ('.\n  ') +
    nodes[edgeDcl.dst][REQUIRED].replace(SUBJECT, '?' + DST) + ('.\n') +
    conditionList.join(' .\n') +
   '\n}';
}


function toVariable(srcString, index, toSrc) {
  if(toSrc) srcString = srcString.replace(/(\W|^)S(\W|$)/g, '$1SN$2');
  return srcString.replace(/(\W|^)(S|SN|DN)(\W|$)/g, '$1?$2$3')
           .replace(/(\W|^)O(\W|$)/g, '$1?O'+index+'$2')
}

function parseEdgeDeclaration(declaration) {
  var arguments;
  var name;
  var argStart = declaration.indexOf('(');
  if(argStart == -1) {
    throw '"' + declaration + '" has no arguments';
  } else {
    arguments = declaration.substring(argStart + 1, declaration.length - 1).split(',');
    name = declaration.substring(0, argStart);
    if(arguments.length != 2) {
      throw '"' + declaration + '" has wrong number of arguments';
    }
  }
  return {name: name,
      src: arguments[0].trim(),
      dst: arguments[1].trim()};
}
