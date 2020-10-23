import * as d3 from 'd3'
import * as topojson from 'topojson'
import counties from 'us-atlas/counties-10m.json'
import labels from 'assets/json/new_labels-1.json'
import ScrollyTeller from 'shared/js/scrollyteller'
import data from 'shared/js/data-parser.js'
import cities from 'assets/json/city_labels.json'

console.log(cities)

//====================STRUCTURE===================

const dpr = window.devicePixelRatio || 1;

const countiesFeature = topojson.feature(counties, counties.objects.counties);
const statesFeature = topojson.feature(counties, counties.objects.states);

const atomEl = d3.select('.interactive-wrapper');

let isMobile = window.matchMedia('(max-width: 700px)').matches;

let divAll;

divAll = atomEl.append('div')
.attr('class', 'map-container all')

const width = atomEl.node().getBoundingClientRect().width;
const height = isMobile ? window.innerHeight / 2 : window.innerHeight;

const margin = {top:isMobile ? 10 : 20, right:isMobile ? 10 : 20, bottom:isMobile ? 5 : 20, left:isMobile ? 0 : 0}

let extent = {
        type: "LineString",
         coordinates: [
            [-119,47],//[minLon, maxLat]
            [-73,47],//[maxLon, maxLat
            [-73,24],//[maxLon, minLat]
            [-119,24]//[minLon, minLat]
        ]
    }

let projection = d3.geoAlbersUsa()
.fitExtent([[0, 0],[width, height]], extent)

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

const makeStates = (svg) => {
	return svg
	.append('g')
	.attr('class', 'swing-map')
	.selectAll('path')
	.data(statesFeature.features)
	.enter()
	.append('path')
	.attr('d', path)
	.attr('class', d => `elex-state ${d.id} ${d.properties.name}`)
}

const svg = makeSVG(divAll, 'svg-swing');
const stateShapes = makeStates(svg);

const countiesmap = svg.append('g')
.attr('class', 'counties-map')

//=====================CANVAS===================

const makeCanvas = (div) => {

	let canvas = div
	.append('canvas')
	.attr('id', 'canvas')
	.attr('class', 'canvas-swing')
	.attr('height', height)
	.attr('width', width)

	canvas.width = width * 2;
	canvas.height = height * 2;

	canvas.style.width = width + "px";
	canvas.style.height = height + "px";

	return canvas
}

let canvas = makeCanvas(divAll);
let context = canvas.node().getContext('2d');

context.scale(dpr,dpr)

let annotationsRaw;
let annotations;

const labeling = makeSVG(divAll, 'svg-labels')
.append('g')
.attr('class', 'labels')

d3.json('https://interactive.guim.co.uk/docsdata-test/149AqDXTpDiMSZcKVgWXurGwW8cgAbQNC2wNiIOpZ4JI.json')
.then(response => {

	annotationsRaw = response;
	annotations = annotationsRaw.sheets.annotations.filter(a => a.annotation != '')


	annotations.map(a => {

		if(a.swing == 'swing')
		{
			let feature = statesFeature.features.find(f => f.properties.name === a.area);

			d3.select('.swing-map')
			.datum(feature)
			.append('path')
			.attr('d', path)
			.attr('class', d => `elex-state ${d.id} ${d.properties.name} swing`)
		}

	})
	
	makeScroll()
})

const makeScroll = () => {

	annotations.map((annotation,i) => {

		if(annotation.annotation)
		{
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

	annotations.map((annotation,i) => {

		if(annotation.annotation)
		{
			scrolly.addTrigger({num: i+1, do: () => {

			context.clearRect(0, 0, width, height)

			if(annotation.id != 'US')
			{
				countiesmap
				.selectAll('path')
				.remove()

				labeling
				.selectAll('circle')
				.remove()

				labeling
				.selectAll('text')
				.remove()

				let feature = statesFeature.features.find(f => f.id === annotation.id);

				let count = countiesFeature.features.filter(d => d.id.substr(0,2) === annotation.id);

				projection
				.fitExtent([[margin.left, 0],[width, height]], feature)

				let stateData = data.filter(d => d.id.substr(0,2) === annotation.id);

				let maxSwing = d3.max(stateData, d => Math.abs(d.swing) )

				scaleArrow.domain([0.005, maxSwing])

				let bbox = path.bounds(feature)

				let outX = 0;
				let outY = 0;
				let outW = 0;

				stateData.map( d => {

					const centroid = path.centroid(count.find(c => c.id === d.id))

					const scale = scaleArrow(Math.abs(d.swing));

					const rotation = d.swing < 0 ? 210 * Math.PI / 180 : 330 * Math.PI / 180;

					const r = scale * (411 * scale);

					const point = [centroid[0] + Math.cos(rotation) * r, centroid[1] + Math.sin(rotation) * r];

					if(point[0] < outX)
					{
						outX = point[0];
					}

					if(point[1] < outY)
					{
						outY = point[1];
					}

					if(point[0] > width)
					{
						outW = point[0] - width;
					}
						
				})

				projection
				.fitExtent([[Math.abs(outX), Math.abs(outY) + margin.top],[width - outW - margin.right, height - margin.bottom]], feature)

				svg.selectAll("path")
			    .transition()
			    .duration(750)
			    .attr("d", path)
			   	.on("end", (d,i) => {if(i == svg.selectAll("path").nodes().length-1)callback()});

			    const callback = () => {

			    	let maxSwing = d3.max(stateData, d => Math.abs(d.swing) )

					scaleArrow.domain([0.005, maxSwing])

			    	stateData.map(d => {

						let leader = d.swing > 0 ? 'R' : 'D';

						let geo = d.id == '02000' ? statesFeature.features.find(id => id.properties.name === 'Alaska') : countiesFeature.features.find(id => id.id === d.id);

						if(geo)
						{

							let centroid = path.centroid(geo);

							let scale = scaleArrow(Math.abs(d.swing));

							let rotation = leader == 'R' ? 330 * Math.PI / 180 : 210 * Math.PI / 180;

							let color = leader == 'R' ? '#c70000' : '#25428F';

							makeArrow(centroid, scale, rotation, color)
					
						}
					})

					let counties = countiesmap
					.selectAll('path')
					.data(count)
					.enter()
					.append('path')
					.attr('d', path)
					.attr('class', d => `elex-county ${d.id}`)

					let state = countiesmap
					.append('path')
					.datum(feature)
					.attr('d', path)
					.attr('class', `elex-state-zoom`)
			
					labeling.selectAll('foo')
					.data(cities[annotation.abbr].filter(d => isMobile ? d.capital == true : d))
					.enter()
					.append('text')
					.text(d => d.name)
					.attr('class', d => `city-label-white ${d.capital ? 'capital' : 'city'}`)
					.style('text-anchor', d => projection([d.lng,d.lat])[0] > width / 2 ? 'end' : 'start')
					.attr('transform', d => `translate(${projection([d.lng,d.lat])})`)
					.attr("dx", d => projection([d.lng,d.lat])[0] > width / 2 ? "-0.5em" :  "0.5em")


					labeling.selectAll('foo')
					.data(cities[annotation.abbr].filter(d => isMobile ? d.capital == true : d))
					.enter()
					.append('text')
					.text(d => d.name)
					.attr('class', d => `city-label ${d.capital ? 'capital' : 'city'}`)
					.style('text-anchor', d => projection([d.lng,d.lat])[0] > width / 2 ? 'end' : 'start')
					.attr('transform', d => `translate(${projection([d.lng,d.lat])})`)
					.attr("dx", d => projection([d.lng,d.lat])[0] > width / 2 ? "-0.5em" :  "0.5em")


					labeling.selectAll('foo')
					.data(cities[annotation.abbr].filter(d => isMobile ? d.capital == true : d))
					.enter()
					.append('circle')
					.attr('class', 'city-label-circle')
					.attr('r', 3)
					.attr('cx', d => projection([d.lng,d.lat])[0])
					.attr('cy', d => projection([d.lng,d.lat])[1])
				   	
			    }
			}
			else
			{

				countiesmap
				.selectAll('path')
				.remove()

				labeling
				.selectAll('text')
				.remove()

				labeling
				.selectAll('circle')
				.remove()

				projection
				.fitExtent([[0, 0],[width, height]], extent)

				svg.selectAll("path")
			    .transition()
			    .duration(750)
			    .attr("d", path)
			   	.on("end", (d,i) => {if(i == svg.selectAll("path").nodes().length-1)callback()});

			    const callback = () => {

			    	labeling
					.selectAll('text')
					.remove()

			    	let maxSwing = d3.max(data, d => d.swing )
					let minSwing = d3.min(data, d => d.swing )

					let max = d3.max([maxSwing, Math.abs(minSwing)])

					scaleArrow.domain([0.005, max])

			    	data.map(d => {

						let leader = d.swing > 0 ? 'R' : 'D';

						let geo = d.id == '02000' ? statesFeature.features.find(id => id.properties.name === 'Alaska') : countiesFeature.features.find(id => id.id === d.id);

						if(geo)
						{

							let centroid = path.centroid(geo);

							let scale = scaleArrow(Math.abs(d.swing));

							let rotation = leader == 'R' ? 330 * Math.PI / 180 : 210 * Math.PI / 180;

							let color = leader == 'R' ? '#c70000' : '#25428F';

							makeArrow(centroid, scale, rotation, color)
					
						}
					})

					labeling
					.selectAll('label')
					.data(Object.entries(labels))
					.enter()
					.append('text')
					.text(d => d[1].abbr)
					.attr('transform', d => `translate(${projection(d[1].coords)})`)
					.attr('class', 'map-label')
	    		}
			}
			}});
		}

		
	})

	scrolly.watchScroll();
}

const makeArrow = (centroid, scale, rotation, color) => {

	const arrow = `${411 * scale},21.5 ${(411 * scale) - 20},0 ${(411 * scale) - 20},16.5 0,21.5 ${(411 * scale) - 20},26.5 ${(411 * scale) - 20},43`;

	let points = arrow.split(' ')

	context.setTransform(scale, 0, 0, scale, centroid[0], centroid[1]);

	context.rotate(rotation)

	context.beginPath();
	//stroke
	points.map( (p,i) => {
		let point = p.split(',')
		if(i==0)context.moveTo(point[0], point[1])
			else context.lineTo(point[0], point[1])
		})
	context.closePath();

	context.strokeStyle = '#FFFFFF';
	context.fillStyle = color;
	context.lineWidth = 4;
	context.stroke();
	context.fill();

	//restore
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.restore();
}

