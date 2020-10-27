import * as d3 from 'd3'
import data from 'shared/js/data-parser.js'
import demographics from 'assets/json/demographics.json'
import Dodge from 'shared/js/Dodge.js'


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

let key = d3.select('.interactive-wrapper-bees')
.append("div")
.attr('class', 'key-bees')

const kdem = key
.append('div')
.attr('class','key-wrapper dem')

kdem.append('span')
.attr('class', 'key-text-dem')
.html('Swing to Democrats')

kdem
.append('svg')
.html(`<polygon points="0,2.5 4.3,5 4.3,3 24.9,3 24.9,2 4.3,2 4.3,0 "></polygon>`)

const krep = key
.append('div')
.attr('class','key-wrapper rep')

krep.append('span')
.attr('class', 'key-text-rep')
.html('Swing to Republicans')

krep
.append('svg')
.html(`<polygon points="24.9,2.5 20.6,0 20.6,2 0,2 0,3 20.6,3 20.6,5 "></polygon>`)


let raceVariables = [
'Over 90% white',
'80-90% white',
'50-80% white',
'50% white and under'
]
let incomeVariables = [
'Average $40,000 and under',
'Average $40,001-50,000',
'Average $50,001-60,000',
'Average over $60,001'
]
let ageVariables = [
'35 years old and under',
'35-40 years old',
'40-45 years old',
'Over 45 years old'
]
let educationVariables = [
'Less than 15% with degree',
'15-20% with degree',
'20-30% with degree',
'Over 30% with degree'
]
let urbanRuralVariables = [
'Medium and small metro areas',
'Rural areas',
'Large metro areas'
]
	
let isMobile = window.matchMedia('(max-width: 700px)').matches;

const atomEl = d3.select('.interactive-wrapper-bees').node();

let width = atomEl.getBoundingClientRect().width;

const margin = {top:0,right:5,bottom:0,left:5};

const padding = isMobile ? 0 : 0.5;

let xScale = d3.scaleLinear()
.range([margin.left, width - margin.right])
.domain(d3.extent(data, d => d.swing))

let radius = d3.scaleSqrt()
.range([isMobile ? 1 : 1.8, isMobile ? 2 : 6])
.domain([0,d3.max(demographics, d => d.population)])

let dist = 0;

const makeChart = (svg, dodge, max, className) => {

	svg.append("g")
	.attr('class', className)
	.selectAll("circle")
	.data(dodge)
	.enter()
	.append("circle")
	.attr('class', d => d.data.id + ' p' + d.data.population + ' s' + d.data.swing )
	.attr("cx", d => d.x)
	.attr("cy", d => max.y + max.r - margin.bottom - d.y)
	.attr("r", d => d.r)
	.style('fill', d => d.data.swing < 0 ? "#25428F" : '#c70000')

	svg.attr('height', max.y + max.r)

	dist = d3.select('.' + className).node().getBoundingClientRect().height;

	svg.attr('height', dist)
}


raceVariables.map(v => {

	let datum = data.filter(d => d.race_bucket === v);

	let dodge = new Dodge(datum, xScale, radius, padding);

	console.log(dodge)

	let max = dodge.find(f => f.y == d3.max(dodge, d => d.y))

	let header = d3.select('.interactive-wrapper-bees')
	.append("div")
	.attr("class", 'bees-header')
	.html(v)


	let repPP = datum.filter(f => f.swing > 0).length * 100 / datum.length;
	let demPP = 100 - repPP;

	let maxPP = d3.max([repPP, demPP])

	let winnerObj = {
		Republicans:repPP,
		Democrats:demPP
	}

	let winner = Object.entries(winnerObj).find(f => f[1] === maxPP)

	let subheader = d3.select('.interactive-wrapper-bees')
	.append("div")
	.attr("class", 'bees-subheader')

	subheader
	.append('span')
	.attr('class', 'bees-subheader-pp ' + winner[0])
	.html(parseInt(winner[1]) + '%')

	subheader
	.append('span')
	.attr('class', 'bees-subheader-text')
	.html(' swinging to ' + winner[0])

	let svg = d3.select('.interactive-wrapper-bees')
	.append("svg")
	.attr('id', 'svg-beeswarm-' + v.replace(/[_()-\s%]/g, ""))
	.attr('class', 'svg-beeswarm')
	.attr("width", width)

	const xAxis = svg.append("g")
	.call(
	    d3.axisBottom(xScale)
	    .tickFormat(d => Math.abs(d))
	    .ticks(3)
	)
	.attr('transform', 'translate(0,0)')

	let ticks = xAxis.selectAll('.tick')

	let texts = ticks.selectAll('text')
	let lines = ticks.selectAll('line')

	lines.attr('class', d => 'l' + d)

	xAxis.select('.l0').style('stroke', '#333')
	
	texts
	.attr('y', 0)

	let zeroText = texts.nodes().find(t => t.innerHTML == '0');

	texts.nodes().map(n => n.innerHTML ='50pp')

	zeroText.innerHTML = 'No swing';
	zeroText.setAttribute("style", "fill:#333;");

	svg.selectAll(".domain").remove();

	makeChart(svg, dodge, max, 'c' + v.replace(/[_()-\s%]/g, ""))

	xAxis.selectAll('.tick line')
	.attr('y1', 10)
	.attr('y2', dist)

})

incomeVariables.map(v => {

	let datum = data.filter(d => d.income_bucket === v);

	let dodge = new Dodge(datum, xScale, radius, padding);

	let max = dodge.find(f => f.y == d3.max(dodge, d => d.y))

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

	xAxis.selectAll('.tick text')
	.attr('y', 0)

	svg.selectAll(".domain").remove();

	makeChart(svg, datum, max, 'c' + v.replace(/[_()-\s$,%]/g, ""))

	xAxis.selectAll('.tick line')
	.attr('y1', 10)
	.attr('y2', dist)

})

ageVariables.map(v => {

	let datum = data.filter(d => d.age_bucket === v);

	let dodge = new Dodge(datum, xScale, radius, padding);

	let max = dodge.find(f => f.y == d3.max(dodge, d => d.y))

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

	xAxis.selectAll('.tick text')
	.attr('y', 0)

	svg.selectAll(".domain").remove();

	makeChart(svg, datum, max, 'c' + v.replace(/[_()-\s$,%]/g, ""))

	xAxis.selectAll('.tick line')
	.attr('y1', 10)
	.attr('y2', dist)

})

educationVariables.map(v => {

	let datum = data.filter(d => d.education_bucket === v);

	let dodge = new Dodge(datum, xScale, radius, padding);

	let max = dodge.find(f => f.y == d3.max(dodge, d => d.y))

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

	xAxis.selectAll('.tick text')
	.attr('y', 0)

	svg.selectAll(".domain").remove();

	makeChart(svg, datum, max, 'c' + v.replace(/[_()-\s$,%]/g, ""))

	xAxis.selectAll('.tick line')
	.attr('y1', 10)
	.attr('y2', dist)

})

urbanRuralVariables.map(v => {

	let datum = data.filter(d => d.urban_category === v);

	let dodge = new Dodge(datum, xScale, radius, padding);

	let max = dodge.find(f => f.y == d3.max(dodge, d => d.y))

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

	xAxis.selectAll('.tick text')
	.attr('y', 0)

	svg.selectAll(".domain").remove();

	makeChart(svg, datum, max, 'c' + v.replace(/[_()-\s$,%]/g, ""))

	xAxis.selectAll('.tick line')
	.attr('y1', 10)
	.attr('y2', dist)

})