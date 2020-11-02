import * as d3 from 'd3'
import * as topojson from 'topojson'
import counties from 'assets/json/counties.json'
import labels from 'assets/json/new_labels-1.json'
import ScrollyTeller from 'shared/js/scrollyteller'
import annotations from 'assets/json/annotations.json'
import cities from 'assets/json/city_labels.json'

console.log('v4')

const countiesFeature = topojson.feature(counties, counties.objects.counties);
const statesFeature = topojson.feature(counties, counties.objects.states);

//====================set swing states at the bototm of the topojson file=============

annotations.sheets.annotations.map((state,i) => {

	if(state.annotation && state.swing === '')
	{

		let obj = statesFeature.features.find(object => object.properties.name === state.area);

		if(obj)obj.properties.name += ' selected';

	}

	if(state.annotation && state.swing === 'swing')
	{
		let obj = statesFeature.features.find(object => object.properties.name === state.area);

		let index = statesFeature.features.findIndex((object,i) => object.properties.name === state.area);

		obj.properties.name += ' swing';

		statesFeature.features.splice(index,1)

		statesFeature.features.push(obj)
	}
})

//====================STRUCTURE===================

let stateLabels = Object.entries(labels).map(d => d[1]);

let stateLabelsMobile = stateLabels.filter((d,i) => {if(i%3 == 0)return d})

const dpr = window.devicePixelRatio || 1;

const atomEl = d3.select('.interactive-wrapper');

let isMobile = window.matchMedia('(max-width: 700px)').matches;

const width = atomEl.node().getBoundingClientRect().width;
const height = width * 0.6;

const divAll = d3.select('.div-all')
.style('height' , height + "px");

const divChoroplethMap = divAll.append('div')
.attr('class', 'div-choropleth-map')

const divSvgMap = divAll.append('div')
.attr('class', 'div-svg-map')

const divCanvasMaps = divAll.append('div')
.attr('class', 'div-canvas-arrows')

const divLabels = divAll.append('div')
.attr('class', 'div-labels')

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
{type: "LineString",id:"04",name:"Arizona",coordinates:[[-114.81835846,31.33221343],[-109.04520153,31.33221343],[-109.04520153,37.00425996],[-114.81835846,37.00425996]]},
{type: "LineString",id:"08",name:"Colorado",coordinates:[[-109.06018796,36.99242597],[-102.04158507,36.99242597],[-102.04158507,41.00340016],[-109.06018796,41.00340016]]}
];

let projection = d3.geoAlbersUsa()
.fitExtent([[0, 0],[width , height]], extents[0])

const path = d3.geoPath().projection(projection)

let scaleArrow = d3.scaleLinear()
.range([0.1,1])

let lengthPoints = [];

let svgMap = divSvgMap
.append('svg')
.attr('width', width)
.attr('height', height)
.attr('class', 'svg-map')

const countiesmap = svgMap.append('g')
.attr('class','counties-selected')

annotations.sheets.annotations.map(annotation => {
	if(annotation.annotation && !isNaN(annotation.id))
	{
		let counties = countiesFeature.features.filter(d => d.id.substr(0,2) === annotation.id);

		countiesmap.append('g')
		.attr('class', 'state-counties-selected ' + annotation.area.replace(/[_()-\s%$,]/g, ""))
		.selectAll('path')
		.data(counties)
		.enter()
		.append('path')
		.attr('d', path)
		.attr('class', `elex-county`)
	}
})

svgMap
.selectAll('foo')
.data(statesFeature.features)
.enter()
.append('path')
.attr('d', path)
.attr('class', d => 'elex-state ' + d.properties.name)

//================SVG LABELS & ANNOTATIONS======================================

const makeLabels = (group, labels, offSetY) => {

	group.selectAll('label')
	.data(labels)
	.enter()
	.append('text')
	.text(d => d.name)
	.attr('class', 'city-label-white')
	.style('text-anchor', 'middle')
	.attr('transform', d => `translate(${projection(d.coords)})`)
	.attr("dx", "0.5em")
	.attr("dy", offSetY)

	group.selectAll('label')
	.data(labels)
	.enter()
	.append('text')
	.text(d => d.name)
	.attr('class', 'city-label')
	.style('text-anchor', 'middle')
	.attr('transform', d => `translate(${projection(d.coords)})`)
	.attr("dx", "0.5em")
	.attr("dy", offSetY)

	group.selectAll('foo')
	.data(labels.filter(f => f.capital != undefined))
	.enter()
	.append('circle')
	.attr('class', 'city-label-circle')
	.attr('r', 3)
	.attr('cx', d => projection(d.coords)[0])
	.attr('cy', d => projection(d.coords)[1])
}

const svgLabels = divLabels
.append('svg')
.attr('class', 'svg-labels')
.attr('width', width)
.attr('height', height)

let stateLabelsGroup = svgLabels
.append('g')
.attr('class', 'state-labels')

makeLabels(stateLabelsGroup, isMobile ? stateLabelsMobile : stateLabels, '0')

let countyLabelsGroup = svgLabels
.append('g')
.attr('class', 'county-labels')

annotations.sheets.annotations.map(annotation => {

	if(annotation.annotation && !isNaN(annotation.id))
	{
		const cityLabels = isMobile ? [cities[annotation.abbr].find(f => f.capital == true )] : cities[annotation.abbr];

		let stateGroup = countyLabelsGroup.append('g')
		.attr('class', 'state-county-labels ' + annotation.abbr)

		makeLabels(stateGroup, cityLabels, '-0.7em')
	}

})


const svgAnnotations = divLabels
.append('svg')
.attr('class', 'svg-annotations')
.attr('width', width)
.attr('height', height)

let annotationCoords = [-83.3187797,45.1407638]

let flipAnnotation = svgAnnotations.append('g')

let annotaionText = flipAnnotation.append('text')
.attr('class', 'flip-states-annotation')
.style('text-anchor', 'start')
.attr("dx", "0.3em")
.attr("dy", "-2em")
.text('Flip states')


let arrowshaft = flipAnnotation
.append('path')
.attr('d', "M16.9-18C16.9-8.4,9.5-0.6,0,0")
.style('stroke', '#333')
.style('stroke-width', '2px')
.style('fill', 'none')

let arrowhead = flipAnnotation
.append('polyline')
.attr('points', "4.8,3.6 0,0 4,-4.5")
.style('stroke', '#333')
.style('stroke-width', '2px')
.style('fill', 'none')


flipAnnotation
.attr('transform', d => `translate(${projection(annotationCoords)})`)


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
	context.lineWidth = 1;
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
		.fitExtent([[0, 0],[width * 2, height * 2]], extent)	

		let stateData = annotation.id === 'US' ? countiesFeature.features : countiesFeature.features.filter(d => d.id.substr(0,2) === annotation.id);

		let name = annotation.area.replace(/[_()-\s%$,]/g, "");

		//make canvas
		let canvas = divCanvasMaps
		.append('canvas')
		.attr('class', 'canvas-arrows')
		.attr('id', `canvas-${name}`)
		.attr('width',width*2)
		.attr('height',height*2)

		let context = canvas.node().getContext('2d');

		let  max = d3.max(stateData, d => {
			if(d.properties.parties)
			{
				return Math.abs(d.properties.parties.swing)
			}
			
		})

		scaleArrow.domain([0, max])

		stateData.map((d,i) => {

			if(d.properties.parties)
			{
				let leader = d.properties.parties.winner;

				let geo = d.properties.parties.id == '02000' ? statesFeature.features.find(id => id.properties.name === 'Alaska') : d;

				if(geo){

					let centroid = path.centroid(geo);

					let scale = scaleArrow(Math.abs(d.properties.parties.swing));

					let rotation = leader == 'R' ? 330 * Math.PI / 180 : 210 * Math.PI / 180;

					let color = leader == 'R' ? '#c70000' : '#25428F';

					makeArrow(context, centroid, scale,  rotation, color)

				}
			}

			
		})

		canvas
		.style("width", width + "px")
		.style("height", height + "px")
	}
	if(annotation.annotation && annotation.id == 'choropleth')
	{
		projection
		.fitExtent([[0, 0],[width * 2, height * 2]], extents[0])	

		let canvas = divChoroplethMap
		.append('canvas')
		.attr('class', 'canvas-arrows')
		.attr('id', `canvas-choropleth`)
		.attr('width',width*2)
		.attr('height',height*2)
		.style('left', '0px')

		let context = canvas.node().getContext('2d');
		const newpath = d3.geoPath().projection(projection)
		newpath.context(context);

		countiesFeature.features.map(d => {
			if(d.properties.parties)
			{
				context.fillStyle = d.properties.parties.winner === 'R' ? '#c70000' : '#25428F';
				context.strokeStyle = d.properties.parties.winner === 'R' ? '#c70000' : '#25428F';
				context.lineWidth = 1;
				context.beginPath();
				newpath(d);
				context.fill();
				context.stroke();
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
				${beforeBlue} ${arrowD} <span>${afterBlue}</span> ${arrowR} <span>${afterRed}</span>`
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

	projection
	.fitExtent([[0, 0],[width, height]], extents[0])

	d3.selectAll('.canvas-arrows')
	.style('left', -2500 + 'px')

	d3.select('#canvas-choropleth')
	.style('left', '0px')

	d3.select('.choropleth-key').style('display', 'flex')
	d3.select('.arrows-key').style('display', 'none')
	d3.select('.arrows-key-mobile').style('display', 'none')

	svgMap.selectAll("path")
	.attr("d", path)

	svgLabels.selectAll("text")
	.attr('transform', d => `translate(${projection(d.coords)})`)

	svgLabels.selectAll("circle")
	.attr('cx', d => projection(d.coords)[0])
	.attr('cy', d => projection(d.coords)[1])

	countyLabelsGroup
	.style('display', 'none')

	stateLabelsGroup
	.style('display', 'block')

	d3.selectAll('.state-counties-selected')
	.style('display', 'none')

	d3.selectAll('.state-county-labels')
	.style('display', 'none')

	svgMap.selectAll("path").transition();

	svgMap.selectAll("path")
	.attr("d", path)

	svgAnnotations
	.style('display', 'block')

}})

scrolly.addTrigger({num: 2, do: () => {

	projection
	.fitExtent([[0, 0],[width, height]], extents[0])

	d3.select('#canvas-choropleth')
	.style('left', -2500 + 'px')

	d3.selectAll('.canvas-arrows')
	.style('left', -2500 + 'px')

	d3.select('#canvas-US')
	.style('left', '0px')

	isMobile ? d3.select('.arrows-key-mobile').style('display', 'block') : d3.select('.arrows-key').style('display', 'block')

	svgMap.selectAll("path")
	.attr("d", path)

	svgLabels.selectAll("text")
	.attr('transform', d => `translate(${projection(d.coords)})`)

	svgLabels.selectAll("circle")
	.attr('cx', d => projection(d.coords)[0])
	.attr('cy', d => projection(d.coords)[1])

	countyLabelsGroup
	.style('display', 'none')

	stateLabelsGroup
	.style('display', 'block')

	d3.selectAll('.state-counties-selected')
	.style('display', 'none')

	d3.selectAll('.state-county-labels')
	.style('display', 'none')

	svgMap.selectAll("path").transition();

	svgMap.selectAll("path")
	.attr("d", path)

	svgAnnotations
	.style('display', 'block')


}})


scrolly.addTrigger({num: 3, do: () => {

	if(d3.select('#canvas-US').style('left') != '0px')
	{
		projection
		.fitExtent([[0, 0],[width, height]], extents[0])

		isMobile ? d3.select('.arrows-key-mobile').style('display', 'block') : d3.select('.arrows-key').style('display', 'block')

		d3.select('#canvas-choropleth')
		.style('left', -2500 + 'px')

		d3.selectAll('.canvas-arrows')
		.style('left', -2500 + 'px')

		d3.selectAll('.state-counties-selected')
		.style('display', 'none')

		countyLabelsGroup
		.style('display', 'none')

		d3.selectAll('.state-county-labels')
		.style('display', 'none')


		function callback(){

			d3.select('#canvas-US')
			.style('left', '0px')

			svgLabels.selectAll("text")
			.attr('transform', d => `translate(${projection(d.coords)})`)

			stateLabelsGroup
			.style('display', 'block')

			svgLabels.selectAll("circle")
			.attr('cx', d => projection(d.coords)[0])
			.attr('cy', d => projection(d.coords)[1])

			svgAnnotations
			.style('display', 'block')
		}

		svgMap.selectAll("path").transition();
		
		svgMap.selectAll("path")
		.transition()
		.duration(750)
		.attr("d", path)
		.on("end", (d,i) => {
			if(i == svgMap.selectAll("path").nodes().length-1)callback()
		});
	}
}})


let annotationsArray = annotations.sheets.annotations.filter(annotation => annotation.annotation != '' && !isNaN(annotation.id))

console.log(annotationsArray)


annotationsArray.map((annotation,i) => {

	scrolly.addTrigger({num: i+4, do: () => {

		let extent = extents.find(f => f.id === annotation.id)

		console.log(extent, annotation.id)

		projection
		.fitExtent([[0, 0],[width, height]], extent)

		d3.select('#canvas-choropleth')
		.style('left', -2500 + 'px')

		d3.selectAll('.canvas-arrows')
		.style('left', -2500 + 'px')

		stateLabelsGroup
		.style('display', 'none')

		countyLabelsGroup
		.style('display', 'none')

		d3.selectAll('.state-counties-selected')
		.style('display', 'none')

		d3.selectAll('.state-county-labels')
		.style('display', 'none')

		svgAnnotations
		.style('display', 'none')

		const callback = () => {

			d3.select('.state-counties-selected.' + annotation.area.replace(/[_()-\s%$,]/g, ""))
			.style('display', 'block')

			d3.select('.state-county-labels.' + annotation.abbr)
			.style('display', 'block')

			d3.select('#canvas-' + annotation.area.replace(/[_()-\s%$,]/g, ""))
			.style('left', '0px')

			svgLabels.selectAll("text")
			.attr('transform', d => `translate(${projection(d.coords)})`)

			countyLabelsGroup
			.style('display', 'block')

			svgLabels.selectAll("circle")
			.attr('cx', d => projection(d.coords)[0])
			.attr('cy', d => projection(d.coords)[1])
		}

		svgMap.selectAll("path").transition();

		svgMap.selectAll("path")
		.transition()
		.duration(750)
		.attr("d", path)
		.on("end", (d,i) => {
			if(i == svgMap.selectAll("path").nodes().length-1)callback()
		});

	}})

})

scrolly.watchScroll();

svgMap.on('click', d => {
	console.log(projection.invert([d.clientX, d.clientY]))
})