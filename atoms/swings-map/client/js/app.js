import * as d3 from 'd3'
import * as topojson from 'topojson'
import states from 'us-atlas/states-10m.json'
import counties from 'us-atlas/counties-10m.json'

console.log(d3, topojson, states, counties)

const countiesFeature = topojson.feature(counties, counties.objects.counties);

const atomEl = d3.select('.interactive-wrapper').node()

const width = atomEl.getBoundingClientRect().width
const height = width * 0.66

const projection = d3.geoAlbersUsa()
.fitExtent([[-55, 0],[width, height]], countiesFeature)

const path = d3.geoPath().projection(projection)

const svg =  d3.select('.interactive-wrapper')
.append('svg')
.attr('width', width)
.attr('height', height)
.attr('class', 'svg-counties')


const stateShapes = svg
.selectAll('path')
.data(countiesFeature.features)
.enter()
.append('path')
.attr('d', path)
.attr('class', 'elex-state')
