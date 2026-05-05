#!/usr/bin/env node
const fs = require('fs');

function assertContains(text, needle, label){
  if(!text.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const fac = fs.readFileSync('facilitator.html','utf8');
const idx = fs.readFileSync('index.html','utf8');

// Facilitator scatter essentials
assertContains(fac, 'id="page-dashboard"', 'dashboard page');
assertContains(fac, 'id="scatter-canvas"', 'scatter canvas');
assertContains(fac, "function drawScatter()", 'drawScatter function');
assertContains(fac, "function loadData(fb)", 'loadData function');
assertContains(fac, "page-dashboard').classList.contains('active')) drawScatter()", 'loadData draw call');
assertContains(fac, "(1 - 0.50) * CH", '50% excitement threshold');
assertContains(fac, "fillText('E=50%'", 'E=50 axis label');

// Survey axis-based quadrant essentials
assertContains(idx, 'function getAxisScores()', 'getAxisScores function');
assertContains(idx, 'function calcQuad()', 'calcQuad function');
assertContains(idx, "return eScore>=0.5?(aScore>=0.5?'TR':'TL'):(aScore>=0.5?'BR':'BL');", '50% quadrant split logic');

console.log('Dashboard validation passed');
