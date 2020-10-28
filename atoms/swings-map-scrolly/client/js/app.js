import * as d3 from 'd3'
import * as topojson from 'topojson'
import counties from 'us-atlas/counties-10m.json'
import labels from 'assets/json/new_labels-1.json'
import ScrollyTeller from 'shared/js/scrollyteller'
import data from 'shared/js/data-parser.js'
import annotations from 'assets/json/annotations.json'
import cities from 'assets/json/city_labels.json'

//===================join data and geo===========

const countiesFeature = topojson.feature(counties, counties.objects.counties);
const statesFeature = topojson.feature(counties, counties.objects.states);

data.map(d => {

	let match = countiesFeature.features.find(f => f.id === d.id);

	if(match)
	{
		match.RVotes = d.RVotes;
		match.DVotes = d.DVotes;
		match.RShare = d.RShare;
		match.DShare = d.DShare;
	}

	
})

//import data2016Raw from 'assets/json/president_county_details.json'

//====================STRUCTURE===================

let stateLabels = Object.entries(labels).map(d => d[1]);

let stateLabelsMobile = stateLabels.filter((d,i) => {if(i%3 == 0)return d})

const dpr = window.devicePixelRatio || 1;

const atomEl = d3.select('.interactive-wrapper');

let isMobile = window.matchMedia('(max-width: 700px)').matches;

const divAll = atomEl.append('div')
.attr('class', 'div-all')

const divSvgMap = divAll.append('div')
.attr('class', 'div-svg-map')

const divCanvasMaps = divAll.append('div')
.attr('class', 'div-canvas-arrows')

const divAnnotations = divAll.append('div')
.attr('class', 'div-annotations')

const width = atomEl.node().getBoundingClientRect().width;
const height = isMobile ? window.innerHeight / 2 : window.innerHeight;

const margin = {top:0, right:0, bottom:50, left:isMobile?-40:-100}

let extents = [
{
        type: "LineString",
        id:'US',
         coordinates: [
            [-120,50],//[minLon, maxLat]
            [-73,50],//[maxLon, maxLat
            [-73,24],//[maxLon, minLat]
            [-120,24]//[minLon, minLat]
        ]
},
{type: "LineString",id:"42",name:"Pennsylvania",coordinates:[[-81,38.1],[-73,38.1],[-73,42.51468907],[-81,42.51468907]]},
{type: "LineString",id:"55",name:"Wisconsin",coordinates:[[-92.88931493,42.4919436],[-86.24954808,42.4919436],[-86.24954808,47.30249997],[-92.88931493,47.30249997]]},
{type: "LineString",id:"26",name:"Michigan",coordinates:[[-90.41862022,41.69604543],[-82.12280564,41.69604543],[-82.12280564,48.30606297],[-90.41862022,48.30606297]]},
{type: "LineString",id:"39",name:"Ohio",coordinates:[[-84.82033611,38.40314185],[-80.518991,38.40314185],[-80.518991,42.32323642],[-84.82033611,42.32323642]]},
{type: "LineString",id:"37",name:"North Carolina",coordinates:[[-84.32186902,33.75287798],[-75.40011906,33.75287798],[-75.40011906,36.58803627],[-84.32186902,36.58803627]]},
{type: "LineString",id:"12",name:"Florida",coordinates:[[-87.63489605,24.39630799],[-79.97430602,24.39630799],[-79.97430602,31.00096799],[-87.63489605,31.00096799]]},
{type: "LineString",id:"04",name:"Arizona",coordinates:[[-114.81835846,31.33221343],[-109.04520153,31.33221343],[-109.04520153,37.00425996],[-114.81835846,37.00425996]]}
];

let projection = d3.geoAlbersUsa()
.fitExtent([[0, 0],[width , height-margin.bottom]], extents[0])

const path = d3.geoPath().projection(projection)

let scaleArrow = d3.scaleLinear()
.range([0.1,1])

let lengthPoints = [];

//================KEY==========================================
let keyDesktop = divAll
.append('div')
.attr('class', 'arrows-key')
.html(
`	<div class="arrow-text-intro">Swing from 2016. Larger arrows indicate larger swings</div>
	<svg viewBox="0 0 120px 34.9px">
		<g>
			<polygon class="arrow-poly D" points="4.2,12.2 6.3,8.6 60,34.9 9.1,3.6 11.2,0 0,1.6"/>
			<polygon class="arrow-poly R" points="130,1.6 118.8,0 120.9,3.6 70,34.9 123.7,8.6 125.8,12.2"/>
		</g>
	</svg>

	<div class="arrows-key-wrapper">
		<span class="arrow-text D">Swing to Democrats</span>
		<span class="arrow-text R">Swing to Republicans</span>
	</div>

`
)

let keyMobile = divAll
.append('div')
.attr('class', 'arrows-key-mobile')
.html(
`
	<svg viewBox="0 0 120px 24px">
		<g>
			<polygon class="arrow-poly D" points="110,1.6 105.9,0.4 107.1,2.6 70.3,23.1 70.7,23.9 107.6,3.5 108.8,5.7 "/>
			<polygon class="arrow-poly R" points="59.7,23.1 22.9,2.6 24.1,0.4 20,1.6 21.2,5.7 22.4,3.5 59.3,23.9 	"/>
		</g>

	</svg>

	<div class="arrows-key-wrapper">
		<span class="arrow-text D">Swing to Democrats</span>
		<span class="arrow-text R">Swing to Republicans</span>
	</div>
	<div class="arrow-text-intro">Swing from 2016. Larger arrows indicate larger swings</div>
`
)

//================SVG MAPS======================================

let svgChoropleth = divSvgMap
.append('svg')
.attr('width', width)
.attr('height', height)
.attr('class', 'svg-map-choropleth')

svgChoropleth
.selectAll('foo')
.data(countiesFeature.features)
.enter()
.append('path')
.attr('d', path)
.attr('class', d => `county-elex-${d.RVotes > d.DVotes ? 'R' : 'D'}`)

let svgMap = divSvgMap
.append('svg')
.attr('width', width)
.attr('height', height)
.attr('class', 'svg-map')


let blackStateAnnottion = svgMap
.append('text')
.attr('class','black-state-annotation')
.text('Swing state')
.attr('transform', `translate(${projection([-89.50358950060128, 49.95769044991915])})`)


svgMap
.selectAll('foo')
.data(statesFeature.features)
.enter()
.append('path')
.attr('d', path)
.attr('class', (d,i) => {

	let swing = annotations.sheets.annotations.find(f => f.area === d.properties.name);

	let className = `elex-state ${d.id} ${d.properties.name}`;

	if(swing)
	{
		if(swing.swing == 'swing')
		{	
			className = `elex-state ${d.id} ${d.properties.name} swing`;
		}
	}
	
	return className
})

const countiesmap = svgMap.append('g')

//================SVG LABELS======================================

let svgLabels = divAnnotations
.append('svg')
.attr('width', width)
.attr('height', height)
.attr('class', 'svg-annotations')

//================DRAW ARROWS======================================

const makeArrow = (context, centroid, scale, rotation, color) => {

	let orientation = rotation > 5 ? 330 * Math.PI / 180 : 210 * Math.PI / 180;

	let arrowLength = isMobile ? 90 : 300;

	const arrow = 
	isMobile
	?
	`0,0 ${Math.cos(orientation) * arrowLength * scale},${Math.sin(orientation) * arrowLength * scale}`// 30º rotation
	:
	`${arrowLength * scale},${21.5 * scale} ${(arrowLength * scale) - 20},0 ${(arrowLength * scale) - 20},${16.5*scale} 0,${21.5*scale} ${(arrowLength 	* scale) - 20},${26.5*scale} ${(arrowLength * scale) - 20},${43*scale}`;

	const arrowHead = rotation > 5
	?
	`${(Math.cos(orientation) * arrowLength * scale) - 9.3},${(Math.sin(orientation) * arrowLength * scale) - 2.5} ${Math.cos(orientation) * arrowLength * scale},${Math.sin(orientation) * arrowLength * scale} ${(Math.cos(orientation) * arrowLength * scale) -2.5},${(Math.sin(orientation) * arrowLength * scale) + 9.3}`
	:
	`${(Math.cos(orientation) * arrowLength * scale) + 9.3},${(Math.sin(orientation) * arrowLength * scale) - 2.5} ${Math.cos(orientation) * arrowLength * scale},${Math.sin(orientation) * arrowLength * scale} ${(Math.cos(orientation) * arrowLength * scale) + 2.5},${(Math.sin(orientation) * arrowLength * scale) + 9.3}`

	let points = arrow.split(' ')
	let pointsHead = arrowHead.split(' ')

	context.setTransform(scale, 0, 0, scale, centroid[0], centroid[1]);

	context.rotate(`${isMobile ? 0 : rotation}`)

	context.beginPath();
	//stroke
	points.map( (p,i) => {
		let point = p.split(',')

		if(i==0)context.moveTo(point[0], point[1])
		else context.lineTo(point[0], point[1])
		
	})
	context.closePath();

	context.strokeStyle = isMobile ? color : '#FFFFFF';
	context.lineWidth   = isMobile ? 2 : 2;
	context.stroke();

	if(isMobile)
	{
		context.beginPath();

		pointsHead.map( (p,i) => {
			let point = p.split(',')

			if(i == 0)context.moveTo(point[0], point[1])
			else context.lineTo(point[0], point[1])

		})

		context.closePath();
		
	}
	context.strokeStyle = '#FFFFFF';
	context.lineWidth   = 1;
	context.fillStyle = color;
	context.stroke();
	context.fill();

}

//================CANVAS======================================

annotations.sheets.annotations.map((annotation,i) => {

	if(annotation.annotation && annotation.id != 'choropleth')
	{
		let extent = extents.find(f => f.id === annotation.id)

		projection
		.fitExtent([[-10, -10],[width * 2, (height-margin.bottom) * 2]], extent)	

		let stateData = annotation.id === 'US' ? data : data.filter(d => d.id.substr(0,2) === annotation.id);

		let name = annotation.area.replace(/[_()-\s%$,]/g, "");

		//make canvas
		let canvas = divCanvasMaps
		.append('canvas')
		.attr('class', 'canvas-arrows')
		.attr('id', `canvas-${name}`)
		.attr('width',width*2)
		.attr('height',height*2)

		let context = canvas.node().getContext('2d');

		scaleArrow 
		.domain([0, d3.max(stateData, d => Math.abs(d.swing))])

		stateData.map((d,i) => {

			let leader = d.swing > 0 ? 'R' : 'D';

			let geo = d.id == '02000' ? statesFeature.features.find(id => id.properties.name === 'Alaska') : countiesFeature.features.find(id => id.id === d.id);

			if(geo){

				let centroid = path.centroid(geo);

				let scale = scaleArrow(Math.abs(d.swing));

				let rotation = leader == 'R' ? 330 * Math.PI / 180 : 210 * Math.PI / 180;

				let color = leader == 'R' ? '#c70000' : '#25428F';

				makeArrow(context, centroid, scale,  rotation, color)

			}
		})

		canvas
		.style("width", width + "px")
		.style("height", height + "px")
	}
})

//========================MAKE CARDS===============================

annotations.sheets.annotations.map((annotation,i) => {

	if(annotation.annotation)
	{
		let container = d3.select('.scroll-text')
		.append('div')
		.attr('class', 'scroll-text__inner')

		let arrowR = `<svg class="blob-arrow-svg" viewBox="0 0 30px 15px">
					<polygon class="arrow-poly R" points="0,15 22.4,2.5 19.7,0.8 30,0 23.2,7.8 23.4,4.6 "/>
					</svg>`

		let arrowD = `<svg class="blob-arrow-svg" viewBox="0 0 30px 15px">
					<polygon class="arrow-poly D" points="30,15 7.6,2.5 10.3,0.8 0,0 6.8,7.8 6.6,4.6 "/>
					</svg>`

		let text;

		if(annotation.annotation.indexOf('[BLUE-ARROW-IMAGE]') > -1)
		{
			let beforeBlue = annotation.annotation.split('[BLUE-ARROW-IMAGE]')[0];
			let afterBlue = annotation.annotation.split('[BLUE-ARROW-IMAGE]')[1].split('[RED-ARROW-IMAGE]')[0];
			let afterRed = annotation.annotation.split('[RED-ARROW-IMAGE]')[1];

			

			if(afterBlue){
				text = `<div class="scroll-text__div">
				<span class='blob-headline'>${annotation.header}</span>
				${arrowD} <span>${afterBlue}</span> ${arrowR} <span>${afterRed}</span>`
			}
		}
		else{
			text = `<div class="scroll-text__div">
			<span class='blob-headline'>${annotation.header}</span>
			<span>${annotation.annotation}</span>
			</div>`
		}


		container.html(text)
	}

})


//========================SCROLLY==================================

const scrolly = new ScrollyTeller({
parent: document.querySelector("#scrolly"),
triggerTop:.8, // percentage from the top of the screen that the trigger should fire
triggerTopMobile: 1,
transparentUntilActive: false
});

scrolly.addTrigger({num: 1, do: () => {

	keyDesktop.style('display', 'none')
	keyMobile.style('display', 'none')

	d3.selectAll('.canvas-arrows')
	.classed('canvas-visible', false)

	countiesmap
	.selectAll('path')
	.remove()

	svgLabels.selectAll('text')
	.remove()

	svgLabels.selectAll('circle')
	.remove()

	projection
	.fitExtent([[0, 0],[width, height-margin.bottom]], extents[0])

	svgMap.selectAll("path")
	.attr("d", path)

	svgChoropleth
	.transition()
	.duration(350)
	.style('opacity', 1)
	.on('end', d => {
		d3.selectAll('.canvas-arrows')
		.classed('canvas-visible', false)
	})

	makeLabels(isMobile ? stateLabelsMobile : stateLabels, 'map-label', 'middle')

}})

scrolly.addTrigger({num: 2, do: () => {

	isMobile ? keyMobile.style('display', 'block') : keyDesktop.style('display', 'block')

	projection
	.fitExtent([[0, 0],[width, height-margin.bottom]], extents[0])

	d3.selectAll('.canvas-arrows')
	.classed('canvas-visible', false)

	d3.select('#canvas-US')
	.classed('canvas-visible', true)
	
	countiesmap
	.selectAll('path')
	.remove()

	svgLabels.selectAll('text')
	.remove()

	svgLabels.selectAll('circle')
	.remove()

	svgMap.selectAll("path")
	.attr("d", path)

	svgChoropleth
	.transition()
	.duration(350)
	.style('opacity', 0)

	makeLabels(isMobile ? stateLabelsMobile : stateLabels, 'map-label', 'middle')

}})


scrolly.addTrigger({num: 3, do: () => {


	if(d3.select('#canvas-US').attr('class').indexOf('canvas-visible') == -1)
	{
		isMobile ? keyMobile.style('display', 'block') : keyDesktop.style('display', 'block')

		d3.selectAll('.canvas-arrows')
		.classed('canvas-visible', false)
		
		countiesmap
		.selectAll('path')
		.remove()

		svgLabels.selectAll('text')
		.remove()

		svgLabels.selectAll('circle')
		.remove()

		projection
		.fitExtent([[0, 0],[width, height-margin.bottom]], extents[0])

		svgMap.selectAll("path")
		.transition()
		.duration(350)
		.attr("d", path)
		.on("end", (d,i) => {
			if(i == svgMap.selectAll("path").nodes().length-1)callback()
		});

		function callback(){

			d3.select('#canvas-US')
			.classed('canvas-visible', true)

			makeLabels(isMobile ? stateLabelsMobile : stateLabels, 'map-label', 'middle')
		}

		svgChoropleth
		.style('opacity', 0)
	}
}})


annotations.sheets.annotations.map((annotation,i) => {


	if(annotation.annotation != '' && i > 2)
	{

		scrolly.addTrigger({num: i+1	, do: () => {

			const cityLabels = isMobile ? [cities[annotation.abbr].find(f => f.capital == true )] : cities[annotation.abbr];

			d3.selectAll('.canvas-arrows')
			.classed('canvas-visible', false)

			svgLabels.selectAll('text')
			.remove()

			svgLabels.selectAll('circle')
			.remove()

			countiesmap
			.selectAll('path')
			.remove()

			let extent = extents.find(f => f.id === annotation.id)

			projection
			.fitExtent([[0, 0],[width, height-margin.bottom]], extent)

			svgChoropleth
			.transition()
			.duration(350)
			.style('opacity', 0)

			let transition = svgMap.selectAll("path")
			.transition()
			.duration(350)
			.attr("d", path)
			.on("end", (d,i) => {
				if(i == svgMap.selectAll("path").nodes().length-1)callback()
			});

			const callback = () => {

				d3.select('#canvas-' + annotation.area.replace(/[_()-\s%$,]/g, ""))
				.classed('canvas-visible', true)

				let counties = countiesFeature.features.filter(d => d.id.substr(0,2) === annotation.id);
		
				let feature = statesFeature.features.find(f => f.properties.name === annotation.area);

				countiesmap
				.selectAll('path')
				.data(counties)
				.enter()
				.append('path')
				.attr('d', path)
				.attr('class', `elex-county`)

				if(annotation.swing == 'swing'){
					countiesmap
					.datum(feature)
					.append('path')
					.attr('d', path)
					.attr('class', `elex-state swing`)
				}

				makeLabels(i == 2 ? isMobile ? stateLabelsMobile : stateLabels : cityLabels, 'map-label', 'middle')

			}
		}})
	}

})

scrolly.watchScroll();


svgMap.on('click', d => {
	console.log(projection.invert([d.clientX, d.clientY]))
})

const makeLabels = (labels, className, textAnchor) => {

	svgLabels.selectAll('text')
	.remove()

	svgLabels.selectAll('label')
	.data(labels)
	.enter()
	.append('text')
	.text(d => d.name)
	.attr('class', 'city-label-white')
	.style('text-anchor', textAnchor)
	.attr('transform', d => `translate(${projection(d.coords)})`)
	.attr("dx", "0.5em")
	.attr("dy", "-0.7em")

	svgLabels.selectAll('label')
	.data(labels)
	.enter()
	.append('text')
	.text(d => d.name)
	.attr('class', 'city-label')
	.style('text-anchor', textAnchor)
	.attr('transform', d => `translate(${projection(d.coords)})`)
	.attr("dx", "0.5em")
	.attr("dy", "-0.7em")

	svgLabels.selectAll('foo')
	.data(labels.filter(f => f.capital != undefined))
	.enter()
	.append('circle')
	.attr('class', 'city-label-circle')
	.attr('r', 3)
	.attr('cx', d => projection(d.coords)[0])
	.attr('cy', d => projection(d.coords)[1])


}


/*lengthPoints.push({state:annotation.id, points:[]})

		stateData.map((d,i) => {
			let geo = d.id == '02000' ? statesFeature.features.find(id => id.properties.name === 'Alaska') : countiesFeature.features.find(id => id.id === d.id);
			let leader = d.swing > 0 ? 'R' : 'D';
			if(geo){

				let centroid = path.centroid(geo);

				let scale = scaleArrow(Math.abs(d.swing));

				let rotation = leader == 'R' ? 330 * Math.PI / 180 : 210 * Math.PI / 180;

				const r = (scale * (300 * scale)) / 2;

				const point = [centroid[0] + Math.cos(rotation) * r, centroid[1] + Math.sin(rotation) * r];

				if(point[0] > width || point[0] < 0 || point[1] < 0 || point[1] > height)
				{

					lengthPoints[lengthPoints.length-1].points.push(point)

				}
	
			}
		})

		let bbox = path.bounds(fitArea);

		let minX = d3.min(lengthPoints[i].points, d => d[0])
		let minY = d3.min(lengthPoints[i].points, d => d[1])
		let maxX = d3.max(lengthPoints[i].points, d => d[0])

		bbox.map(b => {
			if(b[0][0] > minX) b[0][0] = minX;
			if(b[0][1] > minY) b[0][1] = minY;
			if(b[1][0] > maxX) b[1][0] = maxX;
		})


		let bBoxProj = [
		projection.invert([bbox[0][0],bbox[0][1]]),
		projection.invert([bbox[1][0],bbox[1][1]])
		]

		let newExtent = {
			        type: "LineString",
			         coordinates: [
			            [bBoxProj[0][0], bBoxProj[1][1]],//[minLon, maxLat]
			            bBoxProj[1],//[maxLon, maxLat
			           	[bBoxProj[1][0],bBoxProj[0][1]],//[maxLon, minLat]
			            bBoxProj[0]//[minLon, minLat]
			        ]
		}

		projection
		.fitExtent([[0, 0],[width * 2, height *2]], newExtent)
		extents.push(newExtent)	*/






