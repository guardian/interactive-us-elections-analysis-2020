import mainHTML from "./atoms/senate/server/templates/main.html!text"
/*import fs from "fs";

import dataPresRaw from 'assets/json/latestraw.json'
import dataSenateRaw from 'assets/json/latestSenateRaw.json'*/



/*1. STEP ONE: WORK OUT PRESIDENTIAL MARGIN

Rep.pres.margin = Trump.votes / (Trump.votes + Biden.votes) * 100

2. STEP TWO: WORK OUT SENATE MARGIN

Rep.sen.margin = Rep.votes / (Rep.votes + Dem.votes) * 100

3. STEP THREE: WORK OUT DIFFERENCE

Difference = Rep.pres.margin - Rep.sen.share.margin

(Positive number = Trump outperformed senate candidate)*/

/*const dataPres = Object.entries(dataPresRaw);


let presidentRMargins = []
let presidentRVotes = []
let presidentDVotes = []
let data = []

dataPres.map(d => {

	if(d[1].candidates)
	{

		let RVotes = d[1].candidates.find(party => party.party === 'R').votes
		let DVotes = d[1].candidates.find(party => party.party === 'D').votes

		let presidentRmargin = RVotes / (RVotes + DVotes) * 100;

		presidentDVotes[d[0]] = DVotes;
		presidentRVotes[d[0]] = RVotes;
		presidentRMargins[d[0]] = presidentRmargin;
	}

})


dataSenateRaw.map(d => {

	let GOPvotes = 0;
	let DEMvotes = 0;

	d.candidates.map((e,i)=> {

		if(e.party === 'GOP')GOPvotes = e.voteCount;
		if(e.party === 'Dem')DEMvotes = e.voteCount;

	})

	let senateRmargin = GOPvotes / (GOPvotes + DEMvotes) * 100;

	data.push({
		id:d.fipsCode,
		statePostal:d.statePostal,
		swing:presidentRMargins[d.fipsCode] - senateRmargin,
		senateRmargin:senateRmargin,
		RVotes:GOPvotes,
		DVotes:DEMvotes,
		RShare:senateRmargin,
		presidentDvotes:presidentDVotes[d.fipsCode],
		presidentRvotes:presidentRVotes[d.fipsCode],
		presidentMargin:presidentRMargins[d.fipsCode]
	})
})


fs.writeFileSync(`assets/json/republican-swing.json`, JSON.stringify(data));
*/



export async function render() {

    return mainHTML;
} 