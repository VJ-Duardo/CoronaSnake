var locations = [];

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



function getData(){
    let url = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
    return fetch(url)
        .then(function(response) {
            return response.text()
                .then(function(text) {
                    return createObjectsAndDates(text);
            });
        })
        .catch(function(err) {
            console.error(err);
        });
}


function createObjectsAndDates(csvText){
    csvText = csvText.replace(/\".*\"/, "");
    let lines = csvText.split("\n");
    let headLine = lines[0].split(",");
    
    for (let line of lines.slice(1)){
        if (typeof line === 'undefined' || line === "")
            continue;
        lineElems = line.split(",");
        let state = typeof lineElems[0] === 'undefined' ? "" : lineElems[0];
        let newLocation = new Location(state, lineElems[1], parseInt(lineElems[2]), parseInt(lineElems[3]));
        for (let i = 4; i < lineElems.length; i++){
            newLocation.addDay(headLine[i], parseInt(lineElems[i]));
        }
        locations.push(newLocation);
    }
    return headLine.slice(4);
}


function getLocationsFromDay(date){
    console.log(locations);
    let currentLocations = [];
    for (const loc of locations){
        if (loc.cases[date] !== 0){
            currentLocations.push(loc);
        }
    }
    return currentLocations;
}