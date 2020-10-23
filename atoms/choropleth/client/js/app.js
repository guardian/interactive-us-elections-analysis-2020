import * as d3 from 'd3'
import * as topojson from 'topojson'
import counties from 'us-atlas/counties-10m.json'
import labels from 'assets/json/new_labels-1.json'
import data from 'shared/js/data-parser.js'

//====================STRUCTURE===================

const ps = topojson.presimplify(counties);
const sp = topojson.simplify(ps, 0.001);

const countiesFeature = topojson.feature(sp, counties.objects.counties);
const statesFeature = topojson.feature(sp, counties.objects.states);

const atomEl = d3.select('.interactive-wrapper-choropleth');

let isMobile = window.matchMedia('(max-width: 700px)').matches;

let divAll;

divAll = atomEl.append('div')
.attr('class', 'map-container all')

const width = atomEl.node().getBoundingClientRect().width;
const height = isMobile ? window.innerHeight / 2 : width * 0.66;

const margin = {top:0, right:0	, bottom:0, left:0}

let projection = d3.geoAlbersUsa()
.fitExtent([[margin.left, margin.top],[width - margin.right, height-margin.bottom]], countiesFeature)

const path = d3.geoPath().projection(projection)

let scaleArrow = d3.scaleLinear().range([0,0.5])


//================SVG MAP======================================

const makeSVG = (container, className) => {

	return container
	.append('svg')
	.attr('width', width)
	.attr('height', height)
	.attr('class', className)

}

const makeCounties = (svg) => {
	return svg
	.append('g')
	.attr('class', 'map')
	.selectAll('path')
	.data(countiesFeature.features)
	.enter()
	.append('path')
	.attr('d', path)
	.attr('class', d => `elex-state ${d.id} ${d.properties.name}`)
}

const svg = makeSVG(divAll, 'svg-swing');
const stateShapes = makeStates(svg);
let arrowsGroup = svg.append('g');

