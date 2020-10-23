import * as d3 from 'd3'
import * as topojson from 'topojson'
import data2016Raw from 'assets/json/president_county_details.json'
import states from 'us-atlas/counties-10m.json'


console.log(states)


const data2016 = Object.entries(data2016Raw);

const countiesFeature = topojson.feature(states, states.objects.counties);
const statesFeature = topojson.feature(states, states.objects.states);

const atomEl = d3.select('.interactive-wrapper').node()

const width = atomEl.getBoundingClientRect().width;
const height = width * 0.66;

const margin = {top:0, right:50, bottom:0, left:50}

const sizes = [300, 380, 620, 1300]

const canvas = d3.select('.interactive-wrapper')
.append('canvas')
.attr('height', height)
.attr('width', width)

const context = canvas.node().getContext('2d')

const projection = d3.geoAlbersUsa()
.fitExtent([[-55, 0],[width - margin.right - margin.left, height]], countiesFeature)

const path = d3.geoPath()
.projection(projection)
.context(context)

const scaleArrowLength = d3.scaleLinear()
.range([0.6*(width/1300), 0.03*(width/1300)])

//context.canvas.style.maxWidth = "100%";

context.lineJoin = "round";
context.lineCap = "round";
context.beginPath();

path(countiesFeature);

context.lineWidth = 0.5;
context.strokeStyle = "#aaa";
context.stroke();

/*const stateShapes = svg
.selectAll('path')
.data(countiesFeature.features)
.enter()
.append('path')
.attr('d', path)
.attr('class', d => `elex-county ${d}`)*/


/*1. STEP ONE: WORK OUT SHARES
2016:
Rep.share = Trump.votes / (Trump.votes + Clinton.votes) * 100
Dem.share = Clinton.votes / (Trump.votes + Clinton.votes) * 100

2020:
Rep.share = Trump.votes / (Trump.votes + Biden.votes) * 100
Dem.share = Biden.votes / (Trump.votes + Biden.votes) * 100

2. STEP TWO: WORK OUT MARGINS
2016.margin = Rep.share - Dem.share
2020.margin = Rep.share - Dem.share

3. STEP THREE: WORK OUT SWING
Swing = (2020.margin - 2016.margin) / 2

(Positive number = swing to Reps = red arrow going right)*/


data2016.map(d => {

	let RVotes = d[1].candidates.find(party => party.party === 'R').votes
	let DVotes = d[1].candidates.find(party => party.party === 'D').votes

	let RShare = RVotes / (RVotes + DVotes) * 100;
	let DShare = DVotes / (RVotes + DVotes) * 100;

	d.RShare2016 = RShare;
	d.DShare2016 = DShare;
	d.margin2016 = RShare - DShare;
});


d3.json('https://gdn-cdn.s3.amazonaws.com/2020/11/us-general-election-data/niko/data-out/2020-10-02%3A12%3A44%3A03.000/president_county_details.json')
.then(data2020Raw => {

	const data2020 = Object.entries(data2020Raw);

	data2020.map(d => {

		let RVotes = d[1].candidates.find(party => party.party === 'R').votes
		let DVotes = d[1].candidates.find(party => party.party === 'D').votes

		let RShare = RVotes / (RVotes + DVotes) * 100;
		let DShare = DVotes / (RVotes + DVotes) * 100;

		d.RShare2020 = RShare;
		d.DShare2020 = DShare;
		d.margin2020 = RShare - DShare;


		let match = data2016.find(id => id[0] === d[0]);

		d.swing = (d.margin2020 - match.margin2016) / 2;	
	})

	let maxSwing = d3.max(data2020, d => d.swing )

	scaleArrowLength.domain([0, maxSwing])

	context.save();

	data2020.map(d => {

		let leader = d.swing > 0 ? 'R' : 'D';

		let geo = countiesFeature.features.find(id => id.id === d[0]);

		if(geo)
		{

			let centroid = path.centroid(geo);

			let scale = scaleArrowLength(Math.abs(d.swing));

			if(leader == 'R')
			{
				context.beginPath();
				context.setTransform(scale, 0, 0, scale, centroid[0], centroid[1]);

				context.translate(0, -8.643);

				context.moveTo(0, 8.643);
				context.lineTo(12.862, 1.723);
				context.lineTo(13.419, 2.687);
				context.lineTo(14.97, 0);
				context.lineTo(11.867,0);
				context.lineTo(12.424, 0.964 );
				context.closePath();

				context.setTransform(1, 0, 0, 1, centroid[0], centroid[1]);

				context.fillStyle = '#c70000';
				context.fill();
			}
			else
			{
				context.beginPath();
				context.setTransform(scale, 0, 0, scale, centroid[0], centroid[1]);

				context.rotate(-120 * Math.PI / 180);
				context.translate(0, -8.643);

				context.moveTo(0 ,  8.643);
				context.lineTo(12.862, 1.723);
				context.lineTo(13.419, 2.687);
				context.lineTo(14.97, 0);
				context.lineTo(11.867,0);
				context.lineTo(12.424, 0.964 );
				context.closePath();

				context.setTransform(1, 0, 0, 1, centroid[0], centroid[1]);

				context.fillStyle = '#25428F';
				context.fill();
			}
			
		}
	})
	
})
