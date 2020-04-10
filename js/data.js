var locations = [];

class Location{
    constructor(state, country, lat, long){
        this.state = state;
        this.country = country;
        this.lat = lat;
        this.long = long;
        this.cases = {};
    }
    
    
    addDay(date, difference, caseNumber){
        this.cases[date] = {
            difference: difference,
            caseNumber: caseNumber
        };
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
    csvText = removeDisruptingCommas(csvText);
    let lines = csvText.split("\n");
    let headLine = lines[0].split(",");
    
    for (let line of lines.slice(1)){
        if (typeof line === 'undefined' || line === "")
            continue;
        lineElems = line.split(",");
        let state = typeof lineElems[0] === 'undefined' ? "" : lineElems[0];
        let newLocation = new Location(state, lineElems[1], Math.round(lineElems[2]), Math.round(lineElems[3]));
        
        newLocation.addDay(headLine[4], parseInt(lineElems[4]), parseInt(lineElems[4]));
        for (let i = 4+1; i < lineElems.length; i++){
            difference = parseInt(lineElems[i])-parseInt(lineElems[i-1]);
            newLocation.addDay(headLine[i], difference, parseInt(lineElems[i]));
        }
        locations.push(newLocation);
    }
    return headLine.slice(4);
}


function removeDisruptingCommas(string){
    let regex = /"([^",]+),([^"]+)"/;
    let match;
    while ((match = regex.exec(string)) !== null){
        string = string.replace(match[0], match[1]+" "+match[2]);
    }
    return string;
}


function getCaseNumberAtDate(date){
    let cases = 0;
    for (const loc of locations){
        cases+= loc.cases[date].caseNumber;
    }
    return cases;
}


function getLocationsFromDay(date){
    let currentLocations = [];
    for (const loc of locations){
        if (loc.cases[date].difference > 0){
            currentLocations.push(loc);
        }
    }
    return currentLocations;
}