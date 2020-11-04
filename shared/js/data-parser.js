import data2016Raw from 'assets/json/president_county_details.json'
import data2020Raw from 'assets/json/latestraw.json'
//console.log('data-parser', data2020Raw)

//FOR TESTING ONLY
//import data2020Raw from 'assets/json/mid_way.json'

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

Swing = 2020.margin - 2016.margin / 2
(Positive number = red arrow going right)
*/

const data2016 = Object.entries(data2016Raw);
const data2020 = Object.entries(data2020Raw);

let data = [];

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
		//console.log('2016 data missing candidates => ', d)
	}
});


let partiesRaw = data2020.map(d => {
	if(d[1].candidates)
	{
		return Object.values(d[1].candidates).map(d => d.party)
	}
})
console.log('reporting at 98%')
data2020.map(d => {

	if(d[1].reporting && d[1].reporting >= 100)
	{
		if(d[1].candidates)
		{
			if(d[1].candidates.find(party => party.party === 'R') && d[1].candidates.find(party => party.party === 'D'))
			{
				let RVotes = d[1].candidates.find(party => party.party === 'R').votes;
				let DVotes = d[1].candidates.find(party => party.party === 'D').votes;
				let OVotes = d[1].candidates.find(party => party.party === 'O');
				let IVotes = d[1].candidates.find(party => party.party === 'I');

				if(OVotes)
				{
					OVotes = d[1].candidates.find(party => party.party === 'O').votes;
				}

				if(IVotes)
				{
					IVotes = d[1].candidates.find(party => party.party === 'I').votes;
				}
				
				let RShare = RVotes / (RVotes + DVotes) * 100 || 0;
				let DShare = DVotes / (RVotes + DVotes) * 100 || 0;
				let margin2016 = data2016.find(id => id[0] === d[0]).margin2016;
				let margin = RShare - DShare;
				let swing = (margin - margin2016) / 2;

				if(RShare > 0 && DShare > 0 )
				{
					data.push({
					id:d[0],
					name:d[1].name,
					swing:swing,
					RVotes:RVotes || null,
					DVotes:DVotes || null,
					RShare:RShare || null,
					DShare:DShare || null,
					OVotes:OVotes || null,
					IVotes:IVotes || null,
					})
				}
				else
				{
					data.push({
					id:d[0],
					name:d[1].name,
					swing:null,
					RVotes:null,
					DVotes:null,
					RShare:null,
					DShare:null,
					OVotes:null,
					IVotes:null
					})
				}
				
			}
		}
		else
		{
			//console.log('2020 data missing candidates => ', d)
		}

	}
})

data.sort((a,b) => Math.abs(b.swing) - Math.abs(a.swing))

export default data
