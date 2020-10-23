import * as d3B from 'd3'
import data from 'shared/js/data-parser.js'
import demographics from 'assets/json/demographics.json'
import * as beeswarm from 'd3-beeswarm'

let d3 = Object.assign({}, d3B, beeswarm);

let isMobile = window.matchMedia('(max-width: 700px)').matches;

const atomEl = d3.select('.interactive-wrapper-bees').node();

let width = atomEl.getBoundingClientRect().width;
let height = width * 0.66;

const radius = isMobile ? 1.5 : 2;

const margin = {top:0,right:radius,bottom:radius,left:radius}

let xScale = d3.scaleLinear()
.range([margin.left, width - margin.right])
.domain(d3.extent(data, d => d.swing))

let scalePopulation = d3.scaleLinear()
.range([2,10])
.domain([0,d3.max(demographics, d => d.population)])

let yScale = d3.scaleLinear()

let key = d3.select('.interactive-wrapper-bees')
.append("div")
.attr('class', 'key-bees')

const kdem = key
.append('div')
.attr('class','key-wrapper dem')

kdem.append('span')
.attr('class', 'key-text-dem')
.html('Swing to democrats')

kdem
.append('div')
.html(`<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24.9px 5px" width="25px" height="5px" style="enable-background:new 0 0 24.9 5;" xml:space="preserve">
			<polygon points="0,2.5 4.3,5 4.3,3 24.9,3 24.9,2 4.3,2 4.3,0 "></polygon>
			</svg>`)

const krep = key
.append('div')
.attr('class','key-wrapper')

krep.append('span')
.attr('class', 'key-text-rep')
.html('Swing to Republicans')

krep
.append('div')
.html(`<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24.9px 5px" width="24.9px" height="5px" style="enable-background:new 0 0 24.9 5;" xml:space="preserve">
			<polygon points="24.9,2.5 20.6,0 20.6,2 0,2 0,3 20.6,3 20.6,5 "></polygon>
			</svg>`)

let ageVariables = [
'Over 90% white',
'80-90% white',
'50-80% white',
'50% white and under'
]

data.map(d => {

	let match = demographics.find(f => f.county_fip_id === +d.id)

	if(match){

		d.age_bucket = match.age_bucket;
		d.education_bucket = match.education_bucket;
		d.urban_category = match.urban_category;
		d.race_bucket = match.race_bucket;
		d.income_bucket = match.income_bucket;
		d.county_name = match.county_name;
		d.population = match.population
	}
})

console.log(data)

d3.sort(data, (a,b) => b.population - a.population)

d3.shuffle(data);

let dist = 0;

const makeChart = (svg, data, className) => {

	let swarm = d3.beeswarm()
	.data(data)
	.distributeOn(d => xScale(+d.swing))
	.radius(2)
	//.radius(scalePopulation(d3.max(demographics, d => d.population)))
	.orientation('horizontal')
	.side('negative')
	.arrange();

	//let sw = d3.sort(swarm, (a,b) => b.datum.population - a.datum.population)

	svg.append('g')
	.attr('class',className)
	.selectAll('circle')
	.data(swarm)
	.enter()
	.append('circle')
	.attr('class', d => d.datum.county_name + '-' + d.datum.population)
	.attr('cx', d => d.x)
	.attr('cy', d => d.y)
	.attr('r', 2)
	.style('fill', d => +d.datum.swing < 0 ? "#25428F" : '#c70000')
	.style('opacity', .5)
	.style('stroke','#fff');

	dist = d3.select('.' + className).node().getBoundingClientRect().height;

	d3.select('.' + className)
	.style('transform', 'translate(0,'+ (dist - margin.bottom) +'px)')
}

ageVariables.map(v => {

	let datum = data.filter(d => d.race_bucket === v);

	let header = d3.select('.interactive-wrapper-bees')
	.append("div")
	.attr("class", 'bees-header')
	.html(v)

	let svg = d3.select('.interactive-wrapper-bees')
	.append("svg")
	.attr('id', 'svg-beeswarm-' + v.replace(/[_()-\s%]/g, ""))
	.attr('class', 'svg-beeswarm')
	.attr("width", width)

	const xAxis = svg.append("g")
	.call(
	    d3.axisBottom(xScale)
	    .tickFormat(d => Math.abs(d))
	)
	.attr('transform', 'translate(0,0)')

	d3.select()

	xAxis.selectAll('.tick text')
	.attr('y', 0)

	svg.selectAll(".domain").remove();

	makeChart(svg, datum, 'c' + v.replace(/[_()-\s%]/g, ""))

	xAxis.selectAll('.tick line')
	.attr('y1', 10)
	.attr('y2', dist)

	svg
	.attr('height', dist)
})





