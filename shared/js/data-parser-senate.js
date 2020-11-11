import dataPresRaw from 'assets/json/latestraw.json'
import dataSenateRaw from 'assets/json/senate.json'

/*1. STEP ONE: WORK OUT PRESIDENTIAL MARGIN

Rep.pres.margin = Trump.votes / (Trump.votes + Biden.votes) * 100

2. STEP TWO: WORK OUT SENATE MARGIN

Rep.sen.margin = Rep.votes / (Rep.votes + Dem.votes) * 100

3. STEP THREE: WORK OUT DIFFERENCE

Difference = Rep.pres.margin - Rep.sen.share.margin

(Positive number = Trump outperformed senate candidate)*/

const dataPres = Object.entries(dataPresRaw);
const dataSenate = Object.entries(dataSenateRaw);

let data = [];

dataPres.map(d => {
	console.log(d.candidates)
})

export default data