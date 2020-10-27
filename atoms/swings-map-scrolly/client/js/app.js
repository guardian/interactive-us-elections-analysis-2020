import * as d3 from 'd3'
import * as topojson from 'topojson'
import counties from 'us-atlas/counties-10m.json'
import labels from 'assets/json/new_labels-1.json'
import ScrollyTeller from 'shared/js/scrollyteller'
import data from 'shared/js/data-parser.js'
import annotations from 'assets/json/annotations.json'
import cities from 'assets/json/city_labels.json'

//====================STRUCTURE===================

const dpr = window.devicePixelRatio || 1;

const countiesFeature = topojson.feature(counties, counties.objects.counties);
const statesFeature = topojson.feature(counties, counties.objects.states);

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

const margin = {top:0, right:0, bottom:0, left:isMobile?-40:-100}

let extents = [
{
        type: "LineString",
        id:'US',
         coordinates: [
            [-119,50],//[minLon, maxLat]
            [-73,50],//[maxLon, maxLat
            [-73,24],//[maxLon, minLat]
            [-119,24]//[minLon, minLat]
        ]
},
{type: "LineString",id:"42",name:"Pennsylvania",coordinates:[[-81,38.1],[-73,38.1],[-73,42.51468907],[-81,42.51468907]]},
{type: "LineString",id:"26",name:"Michigan",coordinates:[[-90.41862022,41.69604543],[-82.12280564,41.69604543],[-82.12280564,48.30606297],[-90.41862022,48.30606297]]},
{type: "LineString",id:"39",name:"Ohio",coordinates:[[-84.82033611,38.40314185],[-80.518991,38.40314185],[-80.518991,42.32323642],[-84.82033611,42.32323642]]},
{type: "LineString",id:"37",name:"North Carolina",coordinates:[[-84.32186902,33.75287798],[-75.40011906,33.75287798],[-75.40011906,36.58803627],[-84.32186902,36.58803627]]},
{type: "LineString",id:"12",name:"Florida",coordinates:[[-87.63489605,24.39630799],[-79.97430602,24.39630799],[-79.97430602,31.00096799],[-87.63489605,31.00096799]]},
{type: "LineString",id:"04",name:"Arizona",coordinates:[[-114.81835846,31.33221343],[-109.04520153,31.33221343],[-109.04520153,37.00425996],[-114.81835846,37.00425996]]}
];

let projection = d3.geoAlbersUsa()
.fitExtent([[0, 0],[width , height]], extents[0])

const path = d3.geoPath().projection(projection)

let scaleArrow = d3.scaleLinear()
.range([0.1,1])

let lengthPoints = [];

//================KEY==========================================
divAll
.append('div')
.attr('class', 'arrows-key')
.html(
`	<svg viewBox="0 0 120px 34.9px">
		<g>
			<polygon class="arrow-poly D" points="4.2,12.2 6.3,8.6 60,34.9 9.1,3.6 11.2,0 0,1.6"/>
			<polygon class="arrow-poly R" points="130,1.6 118.8,0 120.9,3.6 70,34.9 123.7,8.6 125.8,12.2"/>
		</g>
	</svg>

	<div class="arrows-key-wrapper">
		<span>Democrat swing</span>
		<span>Republican swing</span>
	</div>

`
)

//================SVG MAP======================================

let svgMap = divSvgMap
.append('svg')
.attr('width', width)
.attr('height', height)
.attr('class', 'svg-map')

svgMap
.selectAll('foo')
.data(statesFeature.features)
.enter()
.append('path')
.attr('d', path)
.attr('class', d => `elex-state ${d.id} ${d.properties.name}`)

const countiesmap = svgMap.append('g')

//================SVG ANNOTATIONS======================================

let svgAnnotations = divAnnotations
.append('svg')
.attr('width', width)
.attr('height', height)
.attr('class', 'svg-annotations')
.append('g')
.selectAll('label')
.data(Object.entries(labels))
.enter()
.append('text')
.text(d => d[1].abbr)
.attr('transform', d => `translate(${projection(d[1].coords)})`)
.attr('class', 'map-label')


//================DRAW ARROWS======================================

const makeArrow = (context, centroid, scale, rotation, color) => {

	let orientation = rotation > 5 ? 330 * Math.PI / 180 : 210 * Math.PI / 180;

	let arrowLength = isMobile ? 150 : 300;

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

	isMobile
	? context.setTransform(1, 0, 0, 1, centroid[0], centroid[1])
	: context.setTransform(scale, 0, 0, scale, centroid[0], centroid[1]);

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

	if(annotation.annotation)
	{

		projection
		.fitExtent([[-10, -10],[width * 2 + 10, height *2 + 10]], extents[i])

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

		//make cards
		let container = d3.select('.scroll-text')
		.append('div')
		.attr('class', 'scroll-text__inner')

		container
		.html(
			`<div class="scroll-text__div">
				<span class='blob-headline'>${annotation.header}</span>
				<p>${annotation.annotation}</p>
			</div>`
		)

	}

})

const scrolly = new ScrollyTeller({
parent: document.querySelector("#scrolly"),
triggerTop:.8, // percentage from the top of the screen that the trigger should fire
triggerTopMobile: 1,
transparentUntilActive: false
});

annotations.sheets.annotations.map((annotation,i) => { 

	if(annotation.annotation != '')
	{
		scrolly.addTrigger({num: i+1, do: () => {

			d3.selectAll('.canvas-arrows')
			.classed('canvas-visible', false)

			svgAnnotations.attr('opacity', 0)

			let counties = countiesFeature.features.filter(d => d.id.substr(0,2) === annotation.id);

			projection
			.fitExtent([[0, 0],[width, height]], extents[i])

			let transition = svgMap.selectAll("path")
			.transition()
			.duration(750)
			.attr("d", path)
			.on("end", (d,i) => {
				if(i == svgMap.selectAll("path").nodes().length-1)callback()
			});

			const callback = () => {

				d3.selectAll('.canvas-arrows')
				.classed('canvas-visible', false)

				d3.select('#canvas-' + annotation.area.replace(/[_()-\s%$,]/g, ""))
				.classed('canvas-visible', true)

				i == 0 ? svgAnnotations.attr('opacity', 1) : svgAnnotations.attr('opacity', 0)

				countiesmap
				.selectAll('path')
				.remove()

				countiesmap
				.selectAll('path')
				.data(counties)
				.enter()
				.append('path')
				.attr('d', path)
				.attr('class', `elex-county`)

			}
		}})
	}

})

scrolly.watchScroll();


svgMap.on('click', d => {
	console.log(projection.invert([d.clientX, d.clientY]))
})



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






