import * as d3 from 'd3'
import * as topojson from 'topojson'
import counties from 'us-atlas/counties-10m.json'
import data from 'shared/js/data-parser.js'
import labels from 'assets/json/new_labels-1.json'


//====================STRUCTURE===================

const countiesFeature = topojson.feature(counties, counties.objects.counties);
const statesFeature = topojson.feature(counties, counties.objects.states);

const atomEl = d3.select('.interactive-wrapper');

let isMobile = window.matchMedia('(max-width: 700px)').matches;

let divAll = atomEl.append('div');

const width = atomEl.node().getBoundingClientRect().width;
const height = width * 0.66;

const margin = {top:isMobile ? 5 : 5, right:isMobile ? 5 : 5	, bottom:isMobile ? 5 : 5, left:0}

const projection = d3.geoAlbersUsa()
.fitExtent([[margin.left, margin.top],[width - margin.right, height-margin.bottom]], countiesFeature)

const path = d3.geoPath().projection(projection)

const scaleArrow = d3.scaleLinear()
.range([0.1,1])
.domain([0, d3.max(data, d => Math.abs(d.swing))])


//================SVG MAP======================================

const makeSVG = (container, className) => {

	return container
	.append('svg')
	.attr('width', width)
	.attr('height', height)
	.attr('class', className)

}

const makeStates = (svg) => {
	return svg
	.append('g')
	.attr('class', 'map')
	.selectAll('path')
	.data(statesFeature.features)
	.enter()
	.append('path')
	.attr('d', path)
	.attr('class', d => `elex-state ${d.id} ${d.properties.name}`)
}

const svg =  makeSVG(divAll, 'svg-swing');
const stateShapes = makeStates(svg);
const arrowsGroup = svg.append('g');



//================SVG ANNOTATIONS======================================

let svgAnnotations = makeSVG(divAll, 'svg-annotations');
let labelsGroup = svgAnnotations.append('g').attr('class', 'labels');

const makeLabels = (group) => {

	group.selectAll('label')
	.data(Object.entries(labels))
	.enter()
	.append('text')
	.text(d => d[1].abbr)
	.attr('transform', d => `translate(${projection(d[1].coords)})`)
	.attr('class', 'map-label')
}


const makeArrows = (group, data) =>{

	data.map(d => {

		let leader = d.swing > 0 ? 'R' : 'D';

		let arrowLength = 300;

		let geo = d.id == '02000' ? statesFeature.features.find(id => id.properties.name === 'Alaska') : countiesFeature.features.find(id => id.id === d.id);

		if(geo)
		{

			let centroid = path.centroid(geo);
			let scale = scaleArrow(Math.abs(d.swing));

			let arrow = `${arrowLength * scale},${21.5 * scale} ${(arrowLength * scale) - 20},0 ${(arrowLength * scale) - 20},${16.5*scale} 0,${21.5*scale} ${(arrowLength 	* scale) - 20},${26.5*scale} ${(arrowLength * scale) - 20},${43*scale}`

			group
			.append('polygon')
			.attr('class', `arrow-poly ${leader}` )
			.attr('points', arrow)
			.attr('transform', `translate(${centroid[0]}, ${centroid[1]}) scale(${scale / 2}) rotate(${leader == 'R' ? 330 : 210})`)

		}
	})

}

makeLabels(labelsGroup)
makeArrows(arrowsGroup, data)



