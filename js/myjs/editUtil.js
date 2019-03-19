/*
 * 所有公用算法
 * All common algorithms
 */

function multiFeature(res, oType, oName) {
    var cachaNewFeature = [];
    res.map(function(value, key) {
        if(!value.id) {
            value.id = key;
        }
        if(oType == 'polygon') {
            if(value.geometry.type == 'Polygon') {
                setCenter = value.geometry.coordinates[0][0];
            } else if(value.geometry.type == 'MultiPolygon') {
                setCenter = value.geometry.coordinates[0][0][0];
                if(value.geometry.coordinates.length == 1) {
                    value.geometry.coordinates = value.geometry.coordinates[0];
                } else if(value.geometry.coordinates.length > 1) {
                    var cachaChangeGeometryCoord = JSON.parse(JSON.stringify(value.geometry.coordinates));
                    res.splice(key, 1);
                    cachaChangeGeometryCoord.map(function(item, inde) {
                        var cachaChangeObjData = JSON.parse(JSON.stringify(value));
                        cachaChangeObjData.id = cachaChangeObjData.id + '' + inde;
                        cachaChangeObjData.geometry.coordinates = item;
                        cachaChangeObjData.properties.currOperateFeatures = oName;
                        cachaChangeObjData.geometry.type = 'Polygon';
                        if(inde > 0) {
                            cachaNewFeature.push(cachaChangeObjData);
                        } else {
                            res.splice(key + inde, 0, cachaChangeObjData);
                        }
                    })
                }
            }
            value.properties.currOperateFeatures = oName;
            value.geometry.type = 'Polygon';
        } else if(oType == 'line') {
            if(value.geometry.type == 'LineString') {
                setCenter = value.geometry.coordinates[0];
            } else if(value.geometry.type == 'MultiLineString') {
                setCenter = value.geometry.coordinates[0][0];
                if(value.geometry.coordinates.length == 1) {
                    value.geometry.coordinates = value.geometry.coordinates[0];
                } else if(value.geometry.coordinates.length > 1) {
                    var cachaChangeGeometryCoord = JSON.parse(JSON.stringify(value.geometry.coordinates));
                    res.splice(key, 1);
                    cachaChangeGeometryCoord.map(function(item, inde) {
                        var cachaChangeObjData = JSON.parse(JSON.stringify(value));
                        cachaChangeObjData.id = cachaChangeObjData.id + '' + inde;
                        cachaChangeObjData.geometry.coordinates = item;
                        cachaChangeObjData.properties.currOperateFeatures = oName;
                        cachaChangeObjData.geometry.type = 'LineString';
                        cachaChangeObjData.properties.igis_id = cachaChangeObjData.id;
                        if(inde > 0) {
                            cachaNewFeature.push(cachaChangeObjData);
                        } else {
                            res.splice(key + inde, 0, cachaChangeObjData);
                        }
                    })
                }
            }
            value.properties.currOperateFeatures = oName;
            value.geometry.type = 'LineString';
        } else if(oType == 'point') {
            setCenter = value.geometry.coordinates;
            if(value.properties.icon) {
                value.properties.property = {
                    isBox: true,
                    label: value.properties.name,
                    src: pathUrl + value.properties.icon,
                    scale: 0.4,
                    anchor: [31, 31],
                    labOffsetY: 18,
                    labFillColor: '#D9F0FF',
                    labStrokeColor: '#243142',
                    labStrokeWidth: 2,
                    selFillColor: '#ACD1F3',
                    selLabFillColor: '#D9F0FF',
                    selLabStrokeColor: '#243142',
                    selLabStrokeWidth: 2
                }
            }
            if(Object.prototype.toString.call(value.properties.display) != '[object Array]' && value.properties.display) {
                var displays = [];
                value.properties.display.split(',').forEach(function(k) { displays.push(Number(i)) });
                value.properties.display = displays;
            }
            value.properties.currOperateFeatures = oName;
            value.geometry.type = 'Point';
        }
    })
    return res.concat(cachaNewFeature);
}