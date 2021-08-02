// Declaring all constants

const margin = {top: 10, right: 120, bottom: 50, left: 50},
    svgWidth = 900,
    svgHeight = 700,
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom;

const chart = d3.select('#chart')
    .attr("width", svgWidth)
    .attr("height", svgHeight)

const innerChart = chart.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


const colors = ["blue","red","yellow","green","black","blue","gray", "lightgray", "orange","lightblue","deeppink"];

const type = {
    BOTH: 0,
    MALE: 1,
    FEMALE: 2
}

const StartingYear = 2000;
const EndingYear = 2019;
const LoadCapacity = 400;

// Declaring all variables
//var TimeParse = d3.timeParse("%Y");
var formatValue = d3.format(",");
var floatFormatValue = d3.format(".3n");

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

// Declaring all functions
function loadCountries(callback){
    if (typeof callback !== "function") throw new Error("Wrong callback in loadCountries");

    d3.json("https://api.worldbank.org/v2/country?format=json&per_page=" + LoadCapacity).then(callback);
}

function loadBOTHEmploymentByCountryCode(countryCode, callback){
    d3.json("https://api.worldbank.org/v2/country/" + countryCode + "/indicator/SL.EMP.WORK.ZS?format=json&per_page=60&date=" + StartingYear + ":" + EndingYear)
        .then(callback);
}
function loadFemaleEmploymentByCountryCode(countryCode, callback){
    d3.json("https://api.worldbank.org/v2/country/" + countryCode + "/indicator/SL.EMP.WORK.FE.ZS?format=json&per_page=60&date=" + StartingYear + ":" + EndingYear)
        .then(callback);
}
function loadMaleEmploymentByCountryCode(countryCode, callback){
    d3.json("https://api.worldbank.org/v2/country/" + countryCode + "/indicator/SL.EMP.WORK.MA.ZS?format=json&per_page=60&date=" + StartingYear + ":" + EndingYear)
        .then(callback);
}	

function load(){
    d3.json("https://api.worldbank.org/v2/country/all/indicator/SL.EMP.WORK.ZS?format=json&per_page=60&date=" + StartingYear + ":" + EndingYear).then(function(d){
        console.log(d);
    });
}

function loadEmploymentByCountryCode(countryCode, type, callback){
    if (type == "male"){
        loadMaleEmploymentByCountryCode(countryCode, callback);
    }
    else if (type == "female"){
        loadFemaleEmploymentByCountryCode(countryCode, callback);
    }
    else if (type == "BOTH"){
        loadBOTHEmploymentByCountryCode(countryCode, callback);
    }
    else {
        console.error("no proper type", type);
    }
}

function debug(d){
    console.log("DEBUG) data loaded:", d);
}

function drawChart(countryCode, countrylabel, type) {
    console.log("country in drawChart():", countryCode);

    if (type == 0){
        loadEmploymentByCountryCode(countryCode, "BOTH", drawCountryChart(countryCode, countrylabel, "lightblue"));
    }
    else if (type == 1){
        loadEmploymentByCountryCode(countryCode, "male", drawCountryChart(countryCode, countrylabel, "green"));
    }
    else if (type == 2){
        loadEmploymentByCountryCode(countryCode, "female", drawCountryChart(countryCode, countrylabel, "deeppink"));
    }
    else {
        console.log("error in drawChart(), type:", type);
    }
}

function drawCountryChart(countryCode, countrylabel, color){

    console.log("Color parameter received in drawCountryChart", color);

    // done this way to take extra parameter and pass it to the callback.
    return function(data){

        //console.log("data[0] in drawChart():", data[0]);
        console.log("data[1] in drawChart():", data[1]);
        if (data == null || data[1] == null){
            $('.alert').show();
            return;
        }

        //  clean up everything before drawCharting a new chart
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


        console.log("drawChart data");

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
        drawChart(
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

$('.close').click(function() {
    $('.alert').hide();
})

$('.alert').hide();

$("#to_step2").click(function() {
    //d3.selectAll("path").remove();
    innerChart.selectAll("g").remove();
    hide('#step1');
    show('#step2');    
    drawChart("USA", false, 2);
	drawChart("CAN", false, 2);
	drawChart("AUS", true, 2);
	drawChart("DEU", false, 2);
	drawChart("NOR", true, 2);
	drawChart("SWE", false, 2);
	drawChart("GBR", false, 2);
	drawChart("WLD", true, 2);
})

$("#to_step3").click(function() {
    //d3.selectAll("path").remove();
    innerChart.selectAll("g").remove();
    hide('#step2');
    show('#step3');
    drawChart("CHN", false, 2);
	drawChart("IND", false, 2);
	drawChart("BRA", true, 2);
	drawChart("IDN", false, 2);
	drawChart("NGA", true, 2);
	drawChart("WLD", false, 2);
})

$("#to_step4").click(function() {
    //d3.selectAll("path").remove();
    innerChart.selectAll("g").remove();
    hide('#step3');
    show('#step4');
    drawChart("USA", false, 2);
	drawChart("CAN", false, 2);
	drawChart("AUS", false, 2);
	drawChart("DEU", false, 2);
	drawChart("NOR", false, 2);
	drawChart("SWE", false, 2);
	drawChart("GBR", false, 2);
	drawChart("WLD", false, 2);
	drawChart("USA", false, 1);
	drawChart("CAN", false, 1);
	drawChart("AUS", false, 1);
	drawChart("DEU", false, 1);
	drawChart("NOR", false, 1);
	drawChart("SWE", false, 1);
	drawChart("GBR", false, 1);
	drawChart("WLD", false, 1);
})

$("#to_step5").click(function() {
    //d3.selectAll("path").remove();
    innerChart.selectAll("g").remove();
    hide('#step4');
    loadCountries(addCountriesList);
    show('#step5');
    drawChart("WLD", true, 0);
    
})

$("#startover").click(function() {
    innerChart.selectAll("g").remove();
    hide("#step5");
    hide("#country");
    //d3.selectAll("path").remove();
    show("#step1");
	drawChart('WLD', true, 2);
})

$("input[name='type']").click(function() {
    drawChart('WLD', $('input:radio[name=type]:checked').val());
})



