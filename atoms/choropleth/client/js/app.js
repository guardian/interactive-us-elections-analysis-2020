import * as d3 from 'd3'
import * as topojson from 'topojson'
import counties from 'assets/json/counties.json'

//====================STRUCTURE===================

const countiesFeature = topojson.feature(counties, counties.objects.counties);
const statesFeature = topojson.feature(counties, counties.objects.states);

const atomEl = d3.select('.interactive-wrapper-choropleth');

let isMobile = window.matchMedia('(max-width: 700px)').matches;

let divAll = atomEl.append('div');

const width = atomEl.node().getBoundingClientRect().width;
const height = width * 0.66;

const margin = {top:isMobile ? 5 : 5, right:isMobile ? 5 : 5	, bottom:isMobile ? 5 : 5, left:0}

const projection = d3.geoAlbersUsa()
.fitExtent([[margin.left, margin.top],[width - margin.right, height-margin.bottom]], countiesFeature)

const path = d3.geoPath().projection(projection)


//================SVG MAP======================================

const makeSVG = (container, className) => {

	return container
	.append('svg')
	.attr('width', width)
	.attr('height', height)
	.attr('class', className)

}

const svg =  makeSVG(divAll, 'svg-choropleth');

let cont = 0;
let cont2 = 0;

svg
.selectAll('path')
.data(countiesFeature.features)
.enter()
.append('path')
.attr('d', path)
.attr('class', d => {

	let winner = 'AR';

	if(d.properties.parties)
	{
		winner = d.properties.parties.winner

		cont++
	}

	else{

		cont2++
	}
	return `elex-state ${d.id} ${d.properties.name} ${winner}`
})

console.log(cont, cont2)




