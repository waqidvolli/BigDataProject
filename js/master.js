var config = {
    selected_ntaCode: "BX08",
    selected_permit: "all",
    selected_date: moment("2011-01-01")
}


$('#selectpermit').on('change', function() {
    var selected_permit = $(this).find("option:selected").val();
    config.selected_permit = selected_permit;
    updateChart();
});

$("#monthSlider").dateRangeSlider({
    defaultValues: {
        min: new Date(2011, 00, 01),
        max: new Date(2011, 05, 01)
    },
    bounds: {
        min: new Date(2010, 00, 01),
        max: new Date(2013, 11, 01)
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
        var display =  moment(val).format('MMM YYYY');   
        return display;
    }

});

$("#monthSlider").bind("valuesChanging", function(e, data) {
    current_month = moment(data.values.min).month();
    current_year = moment(data.values.min).year();
    config.selected_date = data.values.min;
    updateChart();
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
            if (month == "2012-01") {
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
                        click: function(e) {
                            console.log(e.point.NTACode);
                            config.selected_ntaCode = e.point.NTACode;
                            updateChart();
                        }
                    }
                }
            }
        },
    });

    updateChart();
}




function updateChart() {
    var permit = config.selected_permit;
    var ntaCode = config.selected_ntaCode;

    var chart = $('#chart').highcharts();
    var taxiChart = $('#taxiChart').highcharts();
    var dpuChart = $('#dpuChart').highcharts();
    var permitChart = $('#permitChart').highcharts();



    var dpu = [null, null, null, null, null, null];
    var permits = [null, null, null, null, null, null];
    var taxitrips = [null, null, null, null, null, null];
    var nyu_dpu = [null, null, null, null, null, null];
    var nyu_permits = [null, null, null, null, null, null];
    var nyu_taxitrips = [null, null, null, null, null, null];
    var title = "Data not avaliable";

    for (var i = 0; i < 6; i++) {
        //NTA data
        var period = moment(config.selected_date).add(i,'M');
        var mm = period.format('MM');
        var yyyy = period.format('YYYY');
        // console.log(yyyy + "-" + mm);
        var obj = merged_data[ntaCode][yyyy + "-" + mm];
        //console.log(obj)
        if (obj) {
            dpu[i] = Math.round(obj.dollar_per_unit);
            taxitrips[i] = Math.round(obj.dropoff + obj.pickup);
            if (permit == "all") {
                permits[i] = Math.round(obj["retail_food_process"] + obj["physician"] + obj["mobile_food_unit"] + obj["plumbing"] +
                    obj["full_term_mfv_permit"] + obj["foundation"] + obj["alteration"] + obj["equipment_work"] + obj["sign"] +
                    obj["equipment"] + obj["new_building"] + obj["food_service_est"] + obj["seasonal_mfv_permit"] +
                    obj["child_care_application_tracking_system"]);
            } else {
                permits[i] = Math.round(obj[permit]);
            }
            chart.setTitle({
                text: obj.nta_string
            })

        } else {
            chart.setTitle({
                text: title
            })
        }


        // NYC data
        var NYU_obj = merged_data["NYC_avg"][yyyy + "-" + mm];

        if (NYU_obj) {
            nyu_dpu[i] = Math.round(NYU_obj.dollar_per_unit);
            nyu_taxitrips[i] = Math.round(NYU_obj.dropoff + NYU_obj.pickup);
            if (permit == "all") {
                nyu_permits[i] = parseFloat((NYU_obj["retail_food_process"] + NYU_obj["physician"] + NYU_obj["mobile_food_unit"] + NYU_obj["plumbing"] +
                    NYU_obj["full_term_mfv_permit"] + NYU_obj["foundation"] + NYU_obj["alteration"] + NYU_obj["equipment_work"] + NYU_obj["sign"] +
                    NYU_obj["equipment"] + NYU_obj["new_building"] + NYU_obj["food_service_est"] + NYU_obj["seasonal_mfv_permit"] +
                    NYU_obj["child_care_application_tracking_system"]).toFixed(2));
            } else {
                nyu_permits[i] = parseFloat((NYU_obj[permit]).toFixed(2));
            }


        } else {

        }
    }


    var mm1 = moment(config.selected_date).format('MMM YY');
    var mm2 = moment(config.selected_date).add(1,'M').format('MMM YY');
    var mm3 = moment(config.selected_date).add(2,'M').format('MMM YY');
    var mm4 = moment(config.selected_date).add(3,'M').format('MMM YY');
    var mm5 = moment(config.selected_date).add(4,'M').format('MMM YY');
    var mm6 = moment(config.selected_date).add(5,'M').format('MMM YY');


    //UPDATE X-AXIS MONTH
    chart.xAxis[0].setCategories([mm1,mm2,mm3,mm4,mm5,mm6], true);
    chart.series[0].update({
        data: [permits[0], permits[1], permits[2], permits[3], permits[4], permits[5]]
    });
    chart.series[2].update({
        data: [taxitrips[0], taxitrips[1], taxitrips[2], taxitrips[3], taxitrips[4], taxitrips[5]]
    });
    chart.series[1].update({
        data: [dpu[0], dpu[1], dpu[2], dpu[3], dpu[4], dpu[5]]
    });


    //UPDATE Dollar per unit chart
    dpuChart.xAxis[0].setCategories([mm1,mm2,mm3,mm4,mm5,mm6], true);
    dpuChart.series[0].update({
        data: [dpu[0], dpu[1], dpu[2], dpu[3], dpu[4], dpu[5]]
    });
    dpuChart.series[1].update({
        data: [nyu_dpu[0], nyu_dpu[1], nyu_dpu[2], nyu_dpu[3], nyu_dpu[4], nyu_dpu[5]]
    });



    //UPDATE taxi chart
    taxiChart.xAxis[0].setCategories([mm1,mm2,mm3,mm4,mm5,mm6], true);
    taxiChart.series[0].update({
        data: [taxitrips[0], taxitrips[1], taxitrips[2], taxitrips[3], taxitrips[4], taxitrips[5]]
    });
    taxiChart.series[1].update({
        data: [nyu_taxitrips[0], nyu_taxitrips[1], nyu_taxitrips[2], nyu_taxitrips[3], nyu_taxitrips[4], nyu_taxitrips[5]]
    });


    //UPDATE permit chart
    permitChart.xAxis[0].setCategories([mm1,mm2,mm3,mm4,mm5,mm6], true);
    permitChart.series[0].update({
        data: [permits[0], permits[1], permits[2], permits[3], permits[4], permits[5]]
    });
    permitChart.series[1].update({
        data: [nyu_permits[0], nyu_permits[1], nyu_permits[2], nyu_permits[3], nyu_permits[4], nyu_permits[5]]
    });

}


// CHART  - shows combination of Permits, DPU, Taxi trips
$('#chart').highcharts({
    chart: {
        zoomType: 'xy'
    },
    title: {
        text: 'Brooklyn'
    },
    subtitle: {
        // text: 'text'
    },
    xAxis: [{
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        crosshair: true
    }],
    yAxis: [{ // Primary yAxis
        labels: {
            // format: '{value}°C',
            style: {
                color: Highcharts.getOptions().colors[2]
            }
        },
        title: {
            text: 'Taxi Trips',
            style: {
                color: Highcharts.getOptions().colors[2]
            }
        },
        opposite: true

    }, { // Secondary yAxis
        gridLineWidth: 0,
        title: {
            text: 'Permits',
            style: {
                color: Highcharts.getOptions().colors[0]
            }
        },
        labels: {
            // format: '{value} mm',
            style: {
                color: Highcharts.getOptions().colors[0]
            }
        }

    }, { // Tertiary yAxis
        gridLineWidth: 0,
        title: {
            text: 'Dollar Per Unit',
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
    }],
    tooltip: {
        shared: true
    },
    legend: {
        enabled: false,
        layout: 'vertical',
        align: 'left',
        x: 80,
        verticalAlign: 'top',
        y: 55,
        floating: true,
        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
    },
    series: [{
        name: 'Permits',
        type: 'spline',
        yAxis: 1,
        // data: [10,20,15,14,18,22],
        tooltip: {
            // valueSuffix: ' mm'
        }

    }, {
        name: 'Dollar Per Unit',
        type: 'spline',
        yAxis: 2,
        // data: [100, 140, 160, 90, 55, 120],
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
        // data: [7010, 6900, 9525, 1450, 1820, 2155],
        tooltip: {
            // valueSuffix: ' °C'
        }
    }]
});




//******* TAXI TRIPS CHART  *******



$('#taxiChart').highcharts({
    chart: {
        zoomType: 'xy'
    },
    title: {
        text: 'Taxi Trips'
    },
    subtitle: {
    },
    xAxis: [{
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        crosshair: true
    }],
    yAxis: [{ // Primary yAxis
        labels: {
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

    }, { // Secondary yAxis
        gridLineWidth: 0,
        title: {
            text: 'NYC Taxi Trips',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        labels: {
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        }

    }],
    tooltip: {
        shared: true
    },
    legend: {
        enabled: false,
        layout: 'vertical',
        align: 'left',
        x: 80,
        verticalAlign: 'top',
        y: 55,
        floating: true,
        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
    },
    series: [{
        name: 'Taxi Trips',
        type: 'spline',
        tooltip: {
        }
    }, {
        name: 'NYC Taxi Trips',
        type: 'spline',
        tooltip: {
        }
    }, ]
});

//******* Dollar Per Unit CHART  *******



$('#dpuChart').highcharts({
    chart: {
        zoomType: 'xy'
    },
    title: {
        text: 'Sale Prices'
    },
    subtitle: {
    },
    xAxis: [{
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        crosshair: true
    }],
    yAxis: [{ // Primary yAxis
        labels: {
            style: {
                color: Highcharts.getOptions().colors[3]
            }
        },
        title: {
            text: 'Dollar Per Unit',
            style: {
                color: Highcharts.getOptions().colors[3]
            }
        },
        opposite: true

    }, { // Secondary yAxis
        gridLineWidth: 0,
        title: {
            text: 'NYC Dollar Per Unit',
            style: {
                color: Highcharts.getOptions().colors[4]
            }
        },
        labels: {
            style: {
                color: Highcharts.getOptions().colors[4]
            }
        }

    }],
    tooltip: {
        shared: true
    },
    legend: {
        enabled: false,
        layout: 'vertical',
        align: 'left',
        x: 80,
        verticalAlign: 'top',
        y: 55,
        floating: true,
        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
    },
    series: [{
        name: 'Dollar Per Unit',
        type: 'spline',
        color: Highcharts.getOptions().colors[3],
        tooltip: {
        }
    }, {
        name: 'NYC Dollar Per Unit',
        type: 'spline',

        color: Highcharts.getOptions().colors[4],
        tooltip: {
            valueSuffix: ' $'
        }

    }, ]
});

//******* PERMIT CHART  *******



$('#permitChart').highcharts({
    chart: {
        zoomType: 'xy'
    },
    title: {
        text: 'Permits'
    },
    subtitle: {
    },
    xAxis: [{
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        crosshair: true
    }],
    yAxis: [{ // Primary yAxis
        labels: {
            style: {
                color: Highcharts.getOptions().colors[5]
            }
        },
        title: {
            text: 'Permits',
            style: {
                color: Highcharts.getOptions().colors[5]
            }
        },
        opposite: true

    }, { // Secondary yAxis
        gridLineWidth: 0,
        title: {
            text: 'NYC Permits',
            style: {
                color: Highcharts.getOptions().colors[6]
            }
        },
        labels: {
            style: {
                color: Highcharts.getOptions().colors[6]
            }
        }

    }],
    tooltip: {
        shared: true
    },
    legend: {
        enabled: false,
        layout: 'vertical',
        align: 'left',
        x: 80,
        verticalAlign: 'top',
        y: 55,
        floating: true,
        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
    },
    series: [{
        name: 'Permits',
        type: 'spline',
        color: Highcharts.getOptions().colors[5],
        tooltip: {
        }
    }, {
        name: 'NYC Permits',
        type: 'spline',

        color: Highcharts.getOptions().colors[6],
        tooltip: {
        }

    }, ]
});

/* INITIALIZE the dashboard */
getNTAGeoJSON();