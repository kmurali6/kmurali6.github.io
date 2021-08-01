const yearStart = 2000;
const yearEnd = 2017;
const totalNoOfCountriesToLoad = 400;

const margin = {top: 20, right: 120, bottom: 50, left: 50},
    svgWidth = 900,
    svgHeight = 600,
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom;

var parseTime = d3.timeParse("%Y");
var formatValue = d3.format(",");
var floatFormatValue = d3.format(".3n");

// WDI call type 
const type = {
    TOTAL: 0,
    MAILE: 1,
    FEMAILE: 2
}

const colors = ["blue","red","yellow","green","black","blue","gray", "lightgray", "orange"];

const chart = d3.select('#chart')
    .attr("width", svgWidth)
    .attr("height", svgHeight)

const innerChart = chart.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// x,y values
var xScale = d3.scaleLinear().range([0,width]);
var yScale = d3.scaleLinear().range([height, 0]);    

// x,y axis
var xAxis = d3.axisBottom().scale(xScale);
var yAxis = d3.axisLeft().scale(yScale);

// line chart related
var valueline = d3.line()
    .x(function(d){ return xScale(d.date);})
    .y(function(d){ return yScale(d.value);})
    .curve(d3.curveLinear);


// Adds the svg canvas
var g = innerChart
    // .call(zoom)
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);    

$('.close').click(function() {
    $('.alert').hide();
})

$('.alert').hide();

$("#to_step2").click(function() {
    //d3.selectAll("path").remove();
    innerChart.selectAll("g").remove();
    hide('#step1');
    show('#step2');    
    draw("USA", false, 0);
    draw("USA", false, 1);
    draw("USA", false, 2);
})

$("#to_step3").click(function() {
    //d3.selectAll("path").remove();
    innerChart.selectAll("g").remove();
    hide('#step2');
    show('#step3');
    draw("CHN", false, 0);
    draw("CHN", false, 1);
    draw("CHN", false, 2);
})

$("#to_step4").click(function() {
    //d3.selectAll("path").remove();
    innerChart.selectAll("g").remove();
    hide('#step3');
    show('#step4');
    draw("RUS", false, 0);
    draw("RUS", false, 1);
    draw("RUS", false, 2);
})

$("#to_step5").click(function() {
    //d3.selectAll("path").remove();
    innerChart.selectAll("g").remove();
    hide('#step4');
    loadCountries(addCountriesList);
    show('#step5');
    draw("WLD", true, 0);
    draw("USA", true, 0);
    draw("CHN", true, 0);
    draw("RUS", true, 0);
    
})

$("#startover").click(function() {
    innerChart.selectAll("g").remove();
    hide("#step5");
    hide("#country");
    //d3.selectAll("path").remove();
    show("#step1");
    draw("WLD", false, 0);
    draw("WLD", false, 1);
    draw("WLD", false, 2);
})

$("input[name='type']").click(function() {
    draw('WLD', $('input:radio[name=type]:checked').val());
})


function load(){
    d3.json("https://api.worldbank.org/v2/country/all/indicator/SL.EMP.WORK.ZS?format=json&per_page=60&date=" + yearStart + ":" + yearEnd).then(function(d){
        console.log(d);
    });
}

// get all countries ( total 304 countries so far so setting it to 400 items per page to get all the countries information. #TODO fix it so get page meta first to get "total" and send 2nd query to dynamically change the per_pages number to have "total" values)
// provide a callback function to execute with loaded data.
function loadCountries(callback){
    if (typeof callback !== "function") throw new Error("Wrong callback in loadCountries");

    d3.json("https://api.worldbank.org/v2/country?format=json&per_page=" + totalNoOfCountriesToLoad).then(callback);
}

// get a given country's data
// provide a callback function to execute with loaded data. World total.
function loadTotalEmploymentByCountryCode(countryCode, callback){
    d3.json("https://api.worldbank.org/v2/country/" + countryCode + "/indicator/SL.EMP.WORK.ZS?format=json&per_page=60&date=" + yearStart + ":" + yearEnd)
        .then(callback);
}
function loadFemaleEmploymentByCountryCode(countryCode, callback){
    d3.json("https://api.worldbank.org/v2/country/" + countryCode + "/indicator/SL.EMP.WORK.FE.ZS?format=json&per_page=60&date=" + yearStart + ":" + yearEnd)
        .then(callback);
}
function loadMaleEmploymentByCountryCode(countryCode, callback){
    d3.json("https://api.worldbank.org/v2/country/" + countryCode + "/indicator/SL.EMP.WORK.MA.ZS?format=json&per_page=60&date=" + yearStart + ":" + yearEnd)
        .then(callback);
}

/**
 * 
 * @param {*} countryCode 3-digit country code
 * @param {*} type "male", "female", "total" (male+female)
 * @param {*} callback callback function 
 */
function loadEmploymentByCountryCode(countryCode, type, callback){
    if (type == "male"){
        loadMaleEmploymentByCountryCode(countryCode, callback);
    }
    else if (type == "female"){
        loadFemaleEmploymentByCountryCode(countryCode, callback);
    }
    else if (type == "total"){
        loadTotalEmploymentByCountryCode(countryCode, callback);
    }
    else {
        console.error("no proper type", type);
    }
}

// Only for debugging purpose, provide this function as callback for those API calls to see the loaded data
function debug(d){
    console.log("DEBUG) data loaded:", d);
}

/**
 * callback function
 * @param {*} countryCode 3-digit country code to query, "WLD" is for the world.
 * @param {*} countrylabel true of false for drawing line tooltip 
 * @param {*} type type constant, 0: total, 1: male, 2: female
 */
function draw(countryCode, countrylabel, type) {
    console.log("country in draw():", countryCode);

    if (type == 0){
        loadEmploymentByCountryCode(countryCode, "total", drawChart(countryCode, countrylabel, "orange"));
    }
    else if (type == 1){
        loadEmploymentByCountryCode(countryCode, "male", drawChart(countryCode, countrylabel, "blue"));
    }
    else if (type == 2){
        loadEmploymentByCountryCode(countryCode, "female", drawChart(countryCode, countrylabel, "red"));
    }
    else {
        console.log("error in draw(), type:", type);
    }
}


/**
 * callback function for d3.json()
 * @param {*} countryCode 3-digit country code to draw a linechart and also for label.
 * @param {*} countrylabel true of false for drawing line tooltip 
 * @param {*} color color string to to draw line chart. e.g, "red", "black", etc.
 */
function drawChart(countryCode, countrylabel, color){

    console.log("Color parameter received in drawChart", color);

    // done this way to take extra parameter and pass it to the callback.
    return function(data){

        //console.log("data[0] in draw():", data[0]);
        console.log("data[1] in draw():", data[1]);
        if (data == null || data[1] == null){
            $('.alert').show();
            return;
        }

        //  clean up everything before drawing a new chart
        // d3.select("body").selectAll("svg > *").remove();

        xScale.domain(d3.extent(data[1], function(d) { return d.date; }));
        yScale.domain([0, 100]);

        // Add the X Axis
        console.log("add x axis");
        innerChart
            .append('g')
            .attr('transform', "translate(0," + height + ")")
            .call(xAxis);

        innerChart
            .append("text")             
            .attr("transform",
                "translate(" + (width/2) + " ," + 
                                (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text("year");

        console.log("add y axis");
        // Add the Y Axis
        innerChart
            .append('g')
            .call(yAxis)
            .attr("y", 6);

        innerChart
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("percentage");


        console.log("draw data");

        /* Initialize tooltip for datapoint */
        tip = d3.tip().attr('class', 'd3-tip').offset([-5, 5]).html(function(d) {
            return "<strong style='color:" + color + "'>" + countryCode + " " + floatFormatValue(d.value)  + "</strong>"; 
        });   

        var path = innerChart.append("g").append("path")
        .attr("width", width).attr("height",height)
        .datum(data[1].map( (d, i) => {
            console.log("path : date", d.date, "value", d.value);
            return {
                date : d.date,
                value : d.value
            };
        }
        ))
        .attr("class", "line")
        .attr("d", valueline)
        .style("stroke", color);        

        // datapoint tooltip
        innerChart.append("g").selectAll(".dot")
            .attr("width", width).attr("height",height)
            .data(data[1])
            .enter()
            .append("circle") // Uses the enter().append() method
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d) { return xScale(d.date) })
            .attr("cy", function(d) { return yScale(d.value) })
            .attr("r", 3)
            .call(tip)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        if (countrylabel == true){
            innerChart.selectAll().data(data[1]).enter().append("g").append("text")
            .attr("transform", "translate(" + (width - 20) + "," + yScale(data[1][data[1].length - 1].value) + ")")
            .attr("dy", ".15em")
            .attr("text-anchor", "start")
            .style("fill", color)
            .text(countryCode);
        }
    }
}

// callback function
function addCountriesList(data, i){

    d3.select("body")
        .select("#country_select_container")
        .append("select")
        .attr("id", "country")
        .selectAll("options")
        .data(data[1])
        .enter()
        .append("option")
        .attr("value", function(d){ return d.id; })
        .text(function (d, i){return d.name;});

    d3.select("body").select("#country_select_container").select("select").on("change", function(){
        console.log(d3.select(this).property('value'));
        draw(
            d3.select(this).property('value'), 
            true,
            d3.select('input[name=type]:checked').node().value
        );
    });
}

// utility functions
function show(step){
    $(step).show();
}

function hide(step){
    $(step).hide();
}
