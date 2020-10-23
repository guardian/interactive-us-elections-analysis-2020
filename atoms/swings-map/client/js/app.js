import * as d3 from 'd3'
import * as topojson from 'topojson'
import counties from 'us-atlas/counties-10m.json'
import data2016Raw from 'assets/json/president_county_details.json'
import labels from 'assets/json/new_labels-1.json'

//=====================DATA PARSING=====================

/*
1. STEP ONE: WORK OUT SHARES
2016:
Rep.share:
Trump.votes / (Trump.votes + Clinton.votes)
Dem.share:
Clinton.votes / (Trump.votes + Clinton.votes)

2020:
Rep.share:
Trump.votes / (Trump.votes + Biden.votes)
Dem.share:
Biden.votes / (Trump.votes + Biden.votes)

2. STEP TWO: WORK OUT MARGINS
2016.margin:
Rep.share - Dem.share

2020.margin:
Rep.share - Dem.share

3. STEP THREE: WORK OUT SWING

Swing = 2020.margin - 2016.margin - 2020.margin
(Positive number = red arrow going right)
*/

const data2016 = Object.entries(data2016Raw);
let data2020;

data2016.map(d => {

	if(d[1].candidates)
	{
		let RVotes = d[1].candidates.find(party => party.party === 'R').votes
		let DVotes = d[1].candidates.find(party => party.party === 'D').votes

		let RShare = RVotes / (RVotes + DVotes) * 100;
		let DShare = DVotes / (RVotes + DVotes) * 100;

		d.RShare2016 = RShare;
		d.DShare2016 = DShare;
		d.margin2016 = RShare - DShare;
	}
	else
	{
		//console.log('2016 data missing canddidates => ', d)
	}
});

//STATES
//https://gdn-cdn.s3.amazonaws.com/2020/11/us-general-election-data/antonio/data-out/14%3A47%3A51.257/president_winners.json

//d3.json('https://gdn-cdn.s3.amazonaws.com/2020/11/us-general-election-data/niko/data-out/2020-10-02%3A12%3A44%3A03.000/president_county_details.json')
d3.json('https://gdn-cdn.s3.amazonaws.com/2020/11/analysis_test_files/special.json')
.then(data2020Raw => {

	let data = [];

	data2020 = Object.entries(data2020Raw);

	data2020.map(d => {

		if(d[1].candidates)
		{
			if(d[1].candidates.find(party => party.party === 'R') && d[1].candidates.find(party => party.party === 'D'))
			{
				let RVotes = d[1].candidates.find(party => party.party === 'R').votes
				let DVotes = d[1].candidates.find(party => party.party === 'D').votes

				let RShare = RVotes / (RVotes + DVotes) * 100;
				let DShare = DVotes / (RVotes + DVotes) * 100;
				let match = data2016.find(id => id[0] === d[0]);
				let margin = RShare - DShare;
				let swing = (margin - match.margin2016) / 2;

				data.push({
					id:d[0],
					swing: swing
				})
			}
		}
		else
		{
			//console.log('2020 data missing candidates => ', d)
		}
	})

	let maxSwing = d3.max(data, d => d.swing )
	let minSwing = d3.min(data, d => d.swing )

	let max = d3.max([maxSwing, Math.abs(minSwing)])

	scaleArrow.domain([0.005, max])

	data.sort((a,b) => Math.abs(b.swing) - Math.abs(a.swing))

	if(!isMobile)
	{
		makeArrows(arrowsGroup, context, data)
	}
	else
	{
		makeArrows(arrowsGroupR, contextR, data.filter(d => d.swing >= 0));
		makeArrows(arrowsGroupD, contextD, data.filter(d => d.swing < 0));
	}

	
	


})

//====================STRUCTURE===================

const countiesFeature = topojson.feature(counties, counties.objects.counties);
const statesFeature = topojson.feature(counties, counties.objects.states);

const atomEl = d3.select('.interactive-wrapper');

let isMobile = window.matchMedia('(max-width: 700px)').matches;

let divAll;
let divR;
let divD;
if(!isMobile)
{
	 divAll = atomEl.append('div')
	.attr('class', 'map-container all')
}
else
{

	divR = atomEl.append('div')
	.attr('class', 'map-container R')

	divD = atomEl.append('div')
	.attr('class', 'map-container D')
}

const width = atomEl.node().getBoundingClientRect().width;
const height = width * 0.66;

const margin = {top:isMobile ? 5 : 5, right:isMobile ? 5 : 5	, bottom:isMobile ? 5 : 5, left:0}

const projection = d3.geoAlbersUsa()
.fitExtent([[margin.left, margin.top],[width - margin.right, height-margin.bottom]], countiesFeature)

const path = d3.geoPath().projection(projection)

const scaleArrow = d3.scaleLinear().range([0,0.5])


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

let svg;
let arrowsGroup;
let arrowsGroupR;
let arrowsGroupD;

if(!isMobile)
{
	svg = makeSVG(divAll, 'svg-swing');

	const stateShapes = makeStates(svg);

	arrowsGroup = svg.append('g')
}
else
{
	const svgR = makeSVG(divR, 'svg-swing');
	const svgD = makeSVG(divD, 'svg-swing');

	const stateShapesR = makeStates(svgR);
	const stateShapesD = makeStates(svgD);

	arrowsGroupR = svgR.append('g')
	arrowsGroupD = svgD.append('g')
}


//=====================CANVAS===================


const makeCanvas = (div) => {

	let canvas = div
	.append('canvas')
	.attr('class', 'canvas-swing')
	.attr('height', height)
	.attr('width', width)

	canvas.width = width * 2;
	canvas.height = height * 2;

	canvas.style.width = width + "px";
	canvas.style.height = height + "px";

	return canvas
}

let canvas;
let context;
let canvasR;
let canvasD;
let contextR;
let contextD;

if(!isMobile)
{
	canvas = makeCanvas(divAll)
	context = canvas.node().getContext('2d')
}
else
{
	canvasR = makeCanvas(divR)
	canvasD = makeCanvas(divD)

	contextR = canvasR.node().getContext('2d')
	contextD = canvasD.node().getContext('2d')
}


//================SVG ANNOTATIONS======================================

let svgAnnotations;
let labelsGroup;
let svgAnnotationsR;
let svgAnnotationsD;
let labelsGroupR;
let labelsGroupD;

if(!isMobile)
{
	svgAnnotations =  makeSVG(divAll, 'svg-annotations')
	labelsGroup = svgAnnotations.append('g').attr('class', 'labels')
}
else
{
	svgAnnotationsR =  makeSVG(divR, 'svg-annotations')
	svgAnnotationsD =  makeSVG(divD, 'svg-annotations')
	labelsGroupR = svgAnnotationsR.append('g').attr('class', 'labels')
	labelsGroupD = svgAnnotationsD.append('g').attr('class', 'labels')
}

const makeLabels = (group) => {

	group.selectAll('label')
	.data(Object.entries(labels))
	.enter()
	.append('text')
	.text(d => d[1].abbr)
	.attr('transform', d => `translate(${projection(d[1].coords)})`)
	.attr('class', 'map-label')
}

if(!isMobile)
{
	makeLabels(labelsGroup)
}
else
{
	makeLabels(labelsGroupR)
	makeLabels(labelsGroupD)
}


const makeArrows = (group, context, data) =>{

	data.map(d => {

		let leader = d.swing > 0 ? 'R' : 'D';

		let geo = d.id == '02000' ? statesFeature.features.find(id => id.properties.name === 'Alaska') : countiesFeature.features.find(id => id.id === d.id);

		if(geo)
		{

			let centroid = path.centroid(geo);
			let scale = scaleArrow(Math.abs(d.swing));


			let arrow = isMobile ? `0,15 ${411 * scale},15 ${(411 * scale) - 10},33 ${411 * scale},15 ${(411 * scale) - 10},0` : `${411 * scale},21.5 ${(411 * scale) - 20},0 ${(411 * scale) - 20},16.5 0,21.5 ${(411 * scale) - 20},26.5 ${(411 * scale) - 20},43` 

			//======SVG========


			isMobile ? 

			group
			.append('path')
			.attr('class', `arrow-stroke ${leader} ${d[0]} ${geo.properties.name} ${d.swing} ${scale}` )
			.attr('d', 'M' + arrow)
			.attr('transform', `translate(${centroid[0]}, ${centroid[1]}) scale(${scaleArrow(Math.abs(d.swing))}) rotate(${leader == 'R' ? 330 : 210})`)

			:

			group
			.append('polygon')
			.attr('class', `arrow-poly ${leader} ${d[0]} ${geo.properties.name} ${d.swing} ${scale}` )
			.attr('points', arrow)
			.attr('transform', `translate(${centroid[0]}, ${centroid[1]}) scale(${scaleArrow(Math.abs(d.swing))}) rotate(${leader == 'R' ? 330 : 210})`)



			//======CANVAS======

			/*context.beginPath();
			context.setTransform(scaleArrow(Math.abs(d.swing)), 0, 0, scaleArrow(Math.abs(d.swing)), centroid[0], centroid[1]);
			leader == 'R' ? context.rotate(330 * Math.PI / 180) : context.rotate(210 * Math.PI / 180);

			let points = arrow.split(' ')

			//stroke
			points.map( (p,i) => {
				let point = p.split(',')
				if(i==0)context.moveTo(point[0], point[1])
				else context.lineTo(point[0], point[1])
			})
			if(!isMobile)
			{
				context.closePath();
			}

			context.strokeStyle = isMobile ? leader == 'R' ? '#c70000' : '#25428F' : '#FFFFFF';
			context.lineWidth   = isMobile ? 4 : 4;
			context.stroke();

			if(!isMobile)
			{
				//fill
				points.map( (p,i) => {
					let point = p.split(',')
					if(i==0)context.moveTo(point[0], point[1])
					else context.lineTo(point[0], point[1])
				})
				context.closePath();


				context.globalAlpha = 1;
				context.fillStyle = leader == 'R' ? '#c70000' : '#25428F';
				context.fill();
			}
			
			//restore
			context.globalAlpha = 1;
			context.setTransform(1, 0, 0, 1, width, height);*/
	}
	})

}




