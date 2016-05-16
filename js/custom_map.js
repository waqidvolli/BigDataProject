var mapSrc = 'https://plambert.cartodb.com/api/v2/viz/01fe8cb8-1928-11e6-b4cf-0e8c56e2ffdb/viz.json';

var ntaLayerIndex = 3,
    permitsLayerIndex = 2,
    dropoffsLayerIndex = 1,
    pickupsLayerIndex = 0;

var map = {
    properties: function() {
        var layer = $('[name=layer-selector]:checked').val();

        return {
            showPickups: layer == pickupsLayerIndex,
            showDropoffs: layer == dropoffsLayerIndex,
            timeRange: moment(config.selected_date).format('YYYY-MM-DD')
        }
    },

    updateTimeRange: function() {
        var fullDate = this.properties().timeRange;

        this.pickupsLayer.setSQL("select * from tt where year_month = '" + fullDate + "'");
        this.dropoffsLayer.setSQL("select * from tt where year_month = '" + fullDate + "'");
        this.permitsLayer.setSQL("select * from permits where year_month = '" + fullDate + "'");
    },

    hideAll: function() {
        this.pickupsLayer.hide();
        this.dropoffsLayer.hide();
    },

    adjustLayersVisibility: function() {
        if (this.pickupsLayer.isVisible() !== this.properties().showPickups) {
            this.pickupsLayer.toggle();
        }

        if (this.dropoffsLayer.isVisible() !== this.properties().showDropoffs) {
            this.dropoffsLayer.toggle();
        }
    },

    onClick: function(callback) {
        this.clickCallback = callback;
    },

    init: function(id) {
        var that = this;

        cartodb.createVis('map', id, {
            tiles_loader: true,
            center_lat: 40.734614,
            center_lon: -73.9512387,
            scrollWheelZoom: false,
            zoom: 11
        })
            .done(function(vis, layers) {
                var layer = layers[1];

                that.ntaLayer = layer.getSubLayer(ntaLayerIndex);
                that.pickupsLayer = layer.getSubLayer(pickupsLayerIndex);
                that.dropoffsLayer = layer.getSubLayer(dropoffsLayerIndex);
                that.permitsLayer = layer.getSubLayer(permitsLayerIndex);

                that.ntaLayer.setInteraction(true);
                that.ntaLayer.setInteractivity('ntacode');
                that.ntaLayer.on('featureClick', function(e, latlng, pos, data, subLayerIndex) {
                    if (that.clickCallback) {
                        that.clickCallback(data.ntacode);
                    }
                });

                that.hideAll();
                that.updateTimeRange();
                that.adjustLayersVisibility();
            })
            .error(function(err) {
                console.log(err);
            });
    }
};
