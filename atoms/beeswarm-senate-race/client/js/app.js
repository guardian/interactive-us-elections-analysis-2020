import * as d3 from 'd3'
import data from 'shared/js/data-parser.js'
import demographics from 'assets/json/demographics.json'
import Dodge from 'shared/js/Dodge.js'

data.map(d => {

	let match = demographics.find(f => f.county_fip_id === +d.id)

	if(match){
		d.race_bucket = match.race_bucket;
		d.population = match.population;
	}
})

const countyIds = ['26009', '54047', '13135'];

let keyWrapper = d3.select('.interactive-wrapper-bees-senate-race')
.append("div")
.attr('class', 'key-bees-wrapper')

let key = keyWrapper
.append("div")
.attr('class', 'key-bees')

const kcandidate = key
.append('div')
.attr('class','key-wrapper can')

kcandidate.append('span')
.attr('class', 'key-text-rep')
.html('House candidate outperformed')

kcandidate
.append('svg')
.html(`<polygon points="0,2.5 4.3,5 4.3,3 24.9,3 24.9,2 4.3,2 4.3,0 "></polygon>`)

const krep = key
.append('div')
.attr('class','key-wrapper trump')

krep.append('span')
.attr('class', 'key-text-candidate')
.html('Trump outperformed')

krep
.append('svg')
.html(`<polygon points="24.9,2.5 20.6,0 20.6,2 0,2 0,3 20.6,3 20.6,5 "></polygon>`)

let racesVariables = [
'Over 90% white',
'80-90% white',
'50-80% white',
'50% white and under'
]

let isMobile = window.matchMedia('(max-width: 700px)').matches;

const atomEl = d3.select('.interactive-wrapper-bees-senate-race').node();

let width = atomEl.getBoundingClientRect().width;

const margin = {top:15,right:5,bottom:0,left:5};

const padding = isMobile ? 0 : 0.5;

let xScale = d3.scaleLinear()
.range([margin.left, width - margin.right])
.domain([-10,10])

let radius = d3.scaleSqrt()
.range([0,.5,1,2,4,8])
.domain([0,1000, 10000, 100000, 1000000, d3.max(demographics, d => d.population)])

let legend = d3.select('.interactive-wrapper-bees-senate-race')
.append("div")
.attr('class', 'legend-bees')

legend.append('p')
.html('County population')

const lsvg = legend.append('svg')
.attr('width', 110)
.attr('height', 20)

let iniText = lsvg.append('text')
.attr('x', 0)
.attr('y',15)
.attr('class', 'legend-tick')
.text('10,000')

let rAcumm = 0;

lsvg.selectAll('circle')
.data([100000, 1000000,10000000])
.enter()
.append('circle')
.attr('cx', (d,i) =>{
	rAcumm += radius(d)

	return radius(d) + rAcumm + iniText.node().getBoundingClientRect().width + 2
})
.attr('class', 'legend-circle')
.attr('cy', 10)
.attr('r', d => radius(d))

lsvg.append('text')
.attr('x', 82)
.attr('y',15)
.attr('class', 'legend-tick')
.text('10m')

let dist = 0;

const makeChart = (svg, dodge, max, className) => {

	svg.append("g")
	.attr('class', className)
	.selectAll("circle")
	.data(dodge)
	.enter()
	.append("circle")
	.attr('class', d => 'id' + d.data.id + ' p' + d.data.population + ' s' + d.data.swing )
	.attr("cx", d => d.x)
	.attr("cy", d => (max.y + max.r - margin.bottom - d.y) + margin.top)
	.attr("r", d => d.r)
	.style('fill', d => d.data.swing < 0 ? '#c70000' : "#F3C100")
	.style('stroke', d => countyIds.indexOf(d.id) > -1 ? '#333' : 'none')
	.style('stroke-width', 2)

	svg.attr('height', max.y + max.r)

	dist = d3.select('.' + className).node().getBoundingClientRect().height + margin.top;

	svg.attr('height', dist)


	countyIds.map(countyId => {

		let node = dodge.find(f =>f.id === countyId);

		if(node)
		{
			svg.append("text")
			.attr('x', node.x)
			.attr('y', dist - node.y)
			.attr('dy', dist - node.y > dist / 2 ? '-1em' : '2em')
			.attr('class', 'bees-county-annotation-white')
			.style('text-anchor', node.x > width / 2 ? 'end' : 'start')
			.text(node.data.name)

			svg.append("text")
			.attr('x', node.x)
			.attr('y', dist - node.y)
			.attr('dy', dist - node.y > dist / 2 ? '-1em' : '2em')
			.attr('class', 'bees-county-annotation')
			.style('text-anchor', node.x > width / 2 ? 'end' : 'start')
			.text(node.data.name)

			svg.append("path")
			.attr('d',  dist - node.y > dist / 2 ? `M${node.x}, ${dist - node.y} ${node.x},${dist - node.y -10}` : `M${node.x}, ${dist - node.y} ${node.x},${dist - node.y +10}`)
			.attr('stroke', '#333')
			.attr('stroke-width', 1.5)
		}

	})

	
}


racesVariables.map(v => {

	let datum = data.filter(d => d.race_bucket === v && d.swing != null);

	let dodge = new Dodge(datum, xScale, radius, padding);

	let max = dodge.find(f => f.y == d3.max(dodge, d => d.y))

	let header = d3.select('.interactive-wrapper-bees-senate-race')
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

	/*let winner = Object.entries(winnerObj).find(f => f[1] === maxPP)

	let subheader = d3.select('.interactive-wrapper-bees-senate-race')
	.append("div")
	.attr("class", 'bees-subheader')

	subheader
	.append('span')
	.attr('class', 'bees-subheader-pp ' + winner[0])
	.html(parseInt(winner[1]) + '%')

	subheader
	.append('span')
	.attr('class', 'bees-subheader-text')
	.html(' swung to ' + winner[0])*/

	let svg = d3.select('.interactive-wrapper-bees-senate-race')
	.append("svg")
	.attr('id', 'svg-beeswarm-' + v.replace(/[_()-\s%$,]/g, ""))
	.attr('class', 'svg-beeswarm-race')
	.attr("width", width)
	.attr('height', 0)

	const xAxis = svg.append("g")
	.call(
	    d3.axisBottom(xScale)
	    .tickFormat(d => parseInt(Math.abs(d)))
	    .ticks(isMobile ? 2 : 4)
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

	texts.nodes().map((n,i) => {
		if(i == 0)
		{
			n.innerHTML = n.innerHTML + 'pp and over';
			n.setAttribute('dx' , '35px')
		}
		if(i == texts.nodes().length-1)
		{
			n.innerHTML = n.innerHTML + 'pp and over';
			n.setAttribute('dx' , '-35px')
		}
		
	})

	if(zeroText)
	{
		zeroText.innerHTML = 'No difference';
		zeroText.setAttribute("style", "fill:#333;");
	}

	svg.selectAll(".domain").remove();

	if(dodge.length > 0)
	{
		makeChart(svg, dodge, max, 'c' + v.replace(/[_()-\s%$,]/g, ""))

		xAxis.selectAll('.tick line')
		.attr('y1', 10)
		.attr('y2', dist)
	}

})

let paddingKeywrapper = isMobile ? 90 : 75;
keyWrapper.style('top',  paddingKeywrapper + 'px')

if(window.resize)window.resize()	





