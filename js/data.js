
var locations = [];
var dates;

class Location{
    constructor(state, country, lat, long){
        this.state = state;
        this.country = country;
        this.lat = lat;
        this.long = long;
        this.cases = {};
    }
    
    
    addDay(date, caseNumber){
        this.cases[date] = caseNumber;
    }
}



function setData(){
    let url = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
    fetch(url)
        .then(function(response) {
            response.text().then(function(text) {
                createObjects(text);
                return;
            });
        })
        .catch(function(err) {
            console.error(err);
        });
}


function createObjects(csvText){
    let lines = csvText.split("\n");
    let headLine = lines[0].split(",");
    dates = headLine.slice(3, headLine);
    
    for (let line of lines.slice(1)){
        lineElems = line.split(",");
        let state = typeof lineElems[0] === 'undefined' ? "" : lineElems[0];
        let newLocation = new Location(state, lineElems[1], lineElems[2], lineElems[3]);
        for (let i = 4; i < lineElems.length; i++){
            newLocation.addDay(headLine[i], lineElems[i]);
        }
        locations.push(newLocation);
    }
}