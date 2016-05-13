var current_NTACode = "BX08";
var current_month = "2012";
var current_year = "2";
var month_arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];


$("#monthSlider").dateRangeSlider({
    defaultValues: {
        min: new Date(2011, 00, 01),
        max: new Date(2011, 05, 01)
    },
    bounds: {
        min: new Date(2010, 0, 1),
        max: new Date(2013, 0, 1)
    },
    range: {
        min: {
            months: 5
        },
        max: {
            months: 5
        }
    },
    step: {
        months: 1
    },
    formatter: function(val) {
        var days = val.getDate(),
            month = val.getMonth(),
            year = val.getFullYear();
        return month_arr[month] + " " + year;
    }

});

$("#monthSlider").bind("valuesChanged", function(e, data) {
    console.log("Values just changed. min: " + data.values.min + " max: " + data.values.max);
    current_month = moment(data.values.min).month();
    current_year = moment(data.values.min).year();
    updateChart(current_month,current_year);
});



var nta_geojson = null;
function getNTAGeoJSON() { 
    $.getJSON("data/nta.json", function(geojson) {
        nta_geojson = geojson[0];
        getMergedData();
    });
}

var merged_data = null;
function getMergedData() {
    $.getJSON("data/data.json", function(data) {
        merged_data = data[0];
        renderMap();
    });
}
// Initiate the chart
function renderMap() {
    var d = [];
    for (var ntacode in merged_data) {
        for (var month in merged_data[ntacode]) {
            if (month == "2012-1") {
                var item = {
                    "code": ntacode,
                    "value": merged_data[ntacode][month]["taxi_dropoff_count"]
                };
                d.push(item);
            }
        }
    }

    $('#map').slideDown().highcharts('Map', {
        series: [{
            mapData: nta_geojson,
            data: d,
            joinBy: ['NTACode', 'code']
        }],
                plotOptions: {
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function (e) {
                            console.log(e.point.NTACode);
                            current_NTACode = e.point.NTACode;
                            updateChart(current_month,current_year);
                        }
                    }
                }
            }
        },
    });
}

getNTAGeoJSON();


function updateChart(mm,yyyy){

    var s1=s2=s3=s4=s5=s6=t1=t2=t3=t4=t5=t6 =null;
    var ntacode = current_NTACode;


    var m1 = merged_data[ntacode][yyyy+"-"+(mm+1)];
    if(m1){
        s1 =  m1.dollar_per_unit;
        t1 = m1.taxi_dropoff_count+m1.taxi_pickup_count;
    }
    console.log(s1+" "+t1);

    var m2 = merged_data[ntacode][yyyy+"-"+(mm+2)];
    if(m2){
        s2 =  m2.dollar_per_unit;
        t2 = m2.taxi_dropoff_count+m2.taxi_pickup_count;
    }   
    console.log(s2+" "+t2);

    var m3 = merged_data[ntacode][yyyy+"-"+(mm+3)];
    if(m3){
        s3 =  m3.dollar_per_unit;
        t3 = m3.taxi_dropoff_count+m3.taxi_pickup_count;
    }
    console.log(s3+" "+t3);

    var m4 = merged_data[ntacode][yyyy+"-"+(mm+4)];
    if(m4){
        s4 =  m4.dollar_per_unit;
        t4 = m4.taxi_dropoff_count+m4.taxi_pickup_count;
    }
    console.log(s4+" "+t4);

    var m5 = merged_data[ntacode][yyyy+"-"+(mm+5)];
    if(m5){
        s5 =  m5.dollar_per_unit;
        t5 = m5.taxi_dropoff_count+m5.taxi_pickup_count;
    }
    console.log(s5+" "+t5);

    var m6 = merged_data[ntacode][yyyy+"-"+(mm+6)];
    if(m6){
        s6 =  m6.dollar_per_unit;
        t6 = m6.taxi_dropoff_count+m6.taxi_pickup_count;
    }
    console.log(s6+" "+t6);

    var chart = $('#chart').highcharts();
    chart.xAxis[0].setCategories([month_arr[mm], month_arr[mm + 1], month_arr[mm + 2],
        month_arr[mm + 3], month_arr[mm + 4], month_arr[mm + 5]
    ], true);
    chart.series[0].update({
        data: [s1, s2, s3, s4, s5, s6]
    });
    chart.series[1].update({
        data: [t1, t2, t3, t4, t5, t6]
    })
    
    m1?chart.setTitle( { text: m1.nta_string }):chart.setTitle( { text: "Data not available" });

}

$('#chart').highcharts({
    chart: {
        zoomType: 'xy'
    },
    title: {
        text: 'Brooklyn'
    },
    subtitle: {
        // text: 'Source: WorldClimate.com'
    },
    xAxis: [{
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        crosshair: true
    }],
    yAxis: [{ // Primary yAxis
            labels: {
                // format: '{value}°C',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            title: {
                text: 'Taxi Trips',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            opposite: true

        },
        { // Secondary yAxis
            gridLineWidth: 0,
            title: {
                text: 'Permits',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            labels: {
                // format: '{value} mm',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            }

        }, 
        { // Tertiary yAxis
            gridLineWidth: 0,
            title: {
                text: 'Sales',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            labels: {
                // format: '{value} mb',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            // opposite: true
        }
    ],
    tooltip: {
        shared: true
    },
    legend: {
        layout: 'vertical',
        align: 'left',
        x: 80,
        verticalAlign: 'top',
        y: 55,
        floating: true,
        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
    },
    series: [
        {
            name: 'Permits',
            type: 'column',
            yAxis: 1,
            data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
            tooltip: {
                // valueSuffix: ' mm'
            }

        }, 
        {
            name: 'Dollar Per Unit',
            type: 'spline',
            yAxis: 1,
            data: [100, 140, 160, 90, 55, 120],
            // marker: {
            //     enabled: false
            // },
            dashStyle: 'shortdot',
            tooltip: {
                valueSuffix: ' $'
            }

        }, {
            name: 'Taxi Trips',
            type: 'spline',
            // marker: {
            //     enabled: false
            // },
            data: [7010, 6900, 9525, 1450, 1820, 2155],
            tooltip: {
                // valueSuffix: ' °C'
            }
        }
    ]
});