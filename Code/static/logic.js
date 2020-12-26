// Create food_desert chart using d3
var svgWidth = 1000;
var svgHeight = 650;

var margin = {
    top: 50,
    right: 0,
    bottom: 70,
    left: 20
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3.select("#foodChart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Import data and create function to build chart
d3.json("/food_deserts").then(function(data) {

    // Scale the data to size of chart
    var xLinearScale = d3.scaleLinear()
        .domain([9, d3.max(data, d => d.desert_rate) + 2])
        .range([0, width]);

    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.pov_rate) - 1, d3.max(data, d => d.pov_rate)])
        .range([height, 0]);

    //Add axes to the chart
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .call(leftAxis);

    // Create axes labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 30 - margin.left)
        .attr("x", 0 - (height / 1.8))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Poverty Rate");

    chartGroup.append("text")
        .attr("transform", `translate(${width / 2.6}, ${height + margin.top })`)
        .attr("class", "axisText")
        .text("Percent Population Living in Food Deserts");

    chartGroup.append("text")
        .attr("transform", `translate(${width / 2.9}, ${-30})`)
        .attr("class", "title")
        .attr("font-size", "19px")
        .text("Food Availability v. Poverty")


    // Draw the markers and plot them by their x and y coordinates
    circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "stateCircle")
        .attr("cx", d => xLinearScale(d.desert_rate))
        .attr("cy", d => yLinearScale(d.pov_rate))
        .attr("r", "22")
        .attr("fill", "#1f77b4")
        .attr("color", "#1f77b4")
        .attr("opacity", ".5")

    // Insert abbreviated state names into markers
    chartGroup.append("g").selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "stateText")
        .attr("x", d => xLinearScale(d.desert_rate))
        .attr("y", d => yLinearScale(d.pov_rate))
        .text(function(d) {
            return d.abbr;
        })


    // Add tooltips with poverty and food desert data
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>Poverty Rate: ${d.pov_rate}<br>Food Desert Rate: ${d.desert_rate},<br>Poverty Rank: ${d.pov_rank}<br>Food Desert Rank: ${d.desert_rank}`);
        });

    // // Set up event handler to trigger the tooltip on hover

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data, index) {
            toolTip.hide(data);

        })

}).catch(function(error) {
    console.log(error);
})

// Creating map object
var myMap = L.map("map", {
    center: [46, -115],
    zoom: 4
});

// Adding tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: "pk.eyJ1IjoibWZpbmVtYW4iLCJhIjoiY2tpc3pxM29vMHk3dzJ6b3o1OGl2c3N0aSJ9.c48ksBNPsYVcz9wX9eWZ0A"
}).addTo(myMap);

d3.json("/map_data").then(function(d1) {
    d3.json("/combined_data").then(function(d2) {

        for (var i = 0; i < d1.length; i++) {
            var lon = d1[i].lon
            var lat = d1[i].lat
            var state = d1[i].state
            var rank = d2[i]["Health Rank"]
            var pov_rank = d2[i]["Poverty Rank"]

            L.marker([lat, lon]).bindPopup(`<h5>${state}</h5>Rankings</5> <hr>Health: ${rank}<br>Poverty: ${pov_rank}`).addTo(myMap);
        }
    })
})

// Create crime rate chart
d3.json("/combined_data").then(function(d) {

    var stateArray = []
    var pov_data = []
    var crime_data = []

    for (var i = 0; i < d.length; i++) {
        var state = d[i].State
        var pov_rate = d[i]["Poverty Rate"]
        var vio_rate = d[i]["Violent Crime Rate"]

        stateArray.push(state)
        pov_data.push(pov_rate)
        crime_data.push(vio_rate * 10)

    }

    // Plotly crime rate chart:

    var trace1 = {
        x: stateArray,
        y: crime_data,
        name: 'Violent Crime',
        type: 'line'
    }
    var trace2 = {
        x: stateArray,
        y: pov_data,
        name: 'Poverty',
        yaxis: 'y2',
        type: 'line',
    }
    var data = [trace1, trace2];

    var layout = {
        title: "Violent Crime v. Poverty",
        yaxis: { title: "Violent Crime Rate" },
        yaxis2: {
            title: "Poverty Rate",
            titlefont: { color: 'rgb(148, 103, 189)' },
            tickfont: { color: 'rgb(148, 103, 189)' },
            overlaying: 'y',
            side: 'right'
        },
        legend: {
            x: 1,
            xanchor: 'right',
            y: 1
        }
    }
    Plotly.newPlot("crimeChart", data, layout);


    //Dropdown selection for more data
    // Append all the states into the html selection element
    d3.select("#selectState").selectAll()
        .data(stateArray)
        .enter()
        .append("option")
        .html(function(data) {
            return `<option>${data}</option>`
        });

    // Event handler to respond to user input
    d3.selectAll("#selectState").on("change", handleSubmit)

    // Functions to be used by the event handler to feed data for each state into panel based on user's selection:
    function handleSubmit() {
        d3.event.preventDefault();
        populatePanel();
    }

    function populatePanel() {

        var stateInput = d3.select("#selectState").node().value;
        var dataIndex = stateArray.indexOf(stateInput)
        var dropDown = d[dataIndex]

        var selection = d3.select(".panel-body").html("")
        Object.entries(dropDown).forEach(([key, value]) => {
            selection.append("p").text(`${key}: ${value}`)
        })
    }
})

// Create college graduation rate chart using nested d3.json statements

d3.json("/education").then(function(edu_data) {

    d3.json("/poverty").then(function(pov_data) {

        d3.json("/states").then(function(states) {

            data_array = []
            for (var i = 0; i < edu_data.length; i++) {
                new_array = []
                new_array[0] = pov_data[i]
                new_array[1] = edu_data[i]
                new_array[2] = states[i]

                data_array.push(new_array)

            }
            var sortedArray = data_array.sort(function(a, b) { return a[0] - b[0]; });

            console.log(sortedArray)


            orderedPov_array = []
            orderedEdu_array = []
            orderedStates_array = []
            for (var i = 0; i < sortedArray.length; i++) {
                orderedPov_array.push(sortedArray[i][0])
                orderedEdu_array.push(sortedArray[i][1])
                orderedStates_array.push(sortedArray[i][2])
            }
            console.log(orderedPov_array)
            data = [orderedEdu_array, orderedPov_array, orderedStates_array]

            var trace1 = {
                x: data[2],
                y: data[0],
                name: 'College Grad Rate',
                type: 'bar',
            };

            var trace2 = {
                x: data[2],
                y: data[1],
                name: 'Poverty Rate',
                type: 'bar'
            };

            var chart_data = [trace1, trace2];
            var layout = { barmode: 'group', title: 'College Graduation v. Poverty' };

            Plotly.newPlot("educationChart", chart_data, layout);

        })
    })
})