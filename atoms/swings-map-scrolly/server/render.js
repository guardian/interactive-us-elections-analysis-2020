import mainHTML from "./atoms/swings-map-scrolly/server/templates/main.html!text"
import counties from 'us-atlas/counties-10m.json'
import data from 'shared/js/data-parser.js'
import fs from "fs";
import * as d3 from 'd3'


export async function render() {

	//===================join data and geo===========

	data.map(d => {

		let match = counties.objects.counties.geometries.find(f => f.id === d.id)

		if(match)
		{
			let max = Math.max(...[d.RVotes, d.DVotes, d.OVotes, d.IVotes]);

			let winner = Object.entries(d).find(f => f[1] === max)[0].substr(0,1);

			match.properties.parties = {

				dataId:d.id,
				dadtaName:d.name,
				swing:d.swing,
				RVotes:d.RVotes || null,
				DVotes:d.DVotes || null,
				RShare:d.RShare || null,
				DShare:d.DShare || null,
				OVotes:d.OVotes || null,
				IVotes:d.IVotes || null,
				winner:winner

			}
		}
	})

	fs.writeFileSync(`assets/json/counties.json`, JSON.stringify(counties));

    return mainHTML;
} 