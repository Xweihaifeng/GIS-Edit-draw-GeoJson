/***********************
 * 所有事件处理  // 功能操作栏
 * All event handling
 ***********************/

$(function() {
    var stateUp = false;
    $('.igis_takeup').click(function() {
        if(!stateUp) {
            $('.igis_btn_list').slideUp();
            $(this).addClass('trans');
            stateUp = true;
        } else {
            $('.igis_btn_list').slideDown();
            $(this).removeClass('trans');
            stateUp = false;
        }
    });

    $('#openNewLayer').on('change', function() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function() {
            var oName = file.name.split('.')[0];
            var oType = JSON.parse(this.result).geoType;

            if(!oType) {
                oType = JSON.parse(this.result).features[0].geometry.type;
                oType == 'MultiPolygon' ? oType = 'polygon' : oType == 'MultiLineString' ? oType = 'line' : oType == 'MultiPoint' ? oType = 'point' : oType == 'Polygon' ? oType = 'polygon' : oType == 'LineString' ? oType = 'line' : oType == 'Point' ? oType = 'point' : oType;
            } else {
                oType == 'Polygon' ? oType = 'polygon' : oType == 'LineString' ? oType = 'line' : oType == 'Point' ? oType = 'point' : oType;
            }

            var importGeojsonData = JSON.parse(this.result);
            importGeojsonData.features = multiFeature(importGeojsonData.features, oType, oName);

            currLayerId = oName;
            mymap.setMapCenter(setCenter);
            currLayerType = oType;
            importGeojsonData.srid = '4326';
            importGeojsonData.geoType = oType;
            importGeojsonData.fieldsInfo ? importGeojsonData.fieldsInfo : importGeojsonData.fieldsInfo = [];
            layerJsonData[oName] = importGeojsonData;
            newFeatures(oName);
            importNewLayerType({
                name: oName,
                type: oType
            });
        }
    });

    $('#saveLayerType').on('click', function() {
        let name = $('#layerName').val();
        let type = $('#layerType').val();
        if(!name) return false;
        saveLayerType({
            name: name,
            type: type
        });
    });

    $('#saveService').on('click', function() {
        let url = $('#serviceUrl').val();
        if(!url) return false;
        let inputContent = $('#mapCenter').val() ? $('#mapCenter').val() : setCenter;
        let center = JSON.parse($('#mapCenter').val());
        var isArray = Object.prototype.toString.call(center) == '[object Array]';
        if(!center || !isArray) center = setCenter;
        $('#closeService').click();
        changeMapService(url, center);
    })

    $('#getGeojson').on('click', 'input[type="checkbox"]', function() {
        let geoName = $(this).attr('id');
        for(var i = 0; i < $('#getGeojson > div').length; i++) {
            var stat1 = $($($('#getGeojson > div')[i]).children('input')[0]).prop('checked');
            var stat2 = $($($('#getGeojson > div')[i]).children('input')[1]).prop('checked');
            if(stat1 && stat2) {
                $('#select_type_box2').fadeIn();
                break;
            } else {
                $('#select_type_box2').fadeOut();
            }
        }
        if($(this).prop('checked') == true) {
            newFeatures(geoName);
        } else {
            mymap.removeLayer(layerObj[geoName]);
        }
    });

    $('#getGeojson').on('click', 'input[type = "radio"][name="layer"]', function() {
        currLayerObj = layerObj[$(this).val()];
        currLayerId = $(this).val();
        currLayerType = $(this).attr('layerType');
        $('#addFea > img').hide();
        if($(this).attr('layerType') == 'polygon') {
            $('#addFea > img.plane').show();
        } else if($(this).attr('layerType') == 'line') {
            $('#addFea > img.lines').show();
        } else {
            $('#addFea > img.dot').show();
        }
        if(!$('#' + currLayerId).prop('checked')) {
            $('#' + currLayerId).prop('checked', true);
            newFeatures(currLayerId);
        }
        $('#select_type_box2').fadeIn();
        switchStatus('telescopic');
        switchStatus('modify');
        switchStatus('berth');
        berthState = false;
        if(drawObj) drawObj.removeDrawFeature();
            isClick = true;
        if(shapeObj) shapeObj.removeCreate();
            isClick = true;
        drawObj = new iGis.maptools.DrawFeature({
            gisMapObj: mymap,
            isSnap: berthState,
            snapLayer: currLayerObj
        });
    });

    $('#getGeojson').on('click', '.deleteFeature', function() {
        var name = $(this).attr('name');
        var type = $(this).attr('type');
        if(Object.keys(layerObj).length) {
            mymap.removeLayer(layerObj[name]);
        }
        delete layerJsonData[name];
        $(this).parent().remove();
    })

    $('input[type = "radio"][name="layerSel"]').on('click', function() {
        changeLayer($(this).val());
    });

    $('#pop-close, #fun4').on('click', function() {
        offAttr();
    });

    $('#fun5').on('click', function() {
        mymap.removeLayer(layerObj[currLayerId]);
        var currId = $(this).parent().find('input[type="hidden"]').val();
        var attrObj = {};

        for(var i = 0; i < $('#longitude li').length; i++) {
            var key = $($('#longitude li')[i]).children('.attr-label').val();
            var value = $($('#longitude li')[i]).children('.attr-value').val();
            if((!key && !value) || !key) {
                continue;
            } else {
                attrObj[key] = value;
            }
        }

        if(attrObj.hasOwnProperty("icon") && currLayerType == 'point' && attrObj.icon) {
            attrObj.property = {
                isBox: true,
                label: attrObj.name,
                src: pathUrl + attrObj.icon,
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
            };
            attrObj.display = zoomRange;
        }

        if(sel_type == 'part' && !selPopupType) {
            layerJsonData[currLayerId].features.forEach(function(v) {
                if(v.id == currId) {
                    v.properties = attrObj;
                }
            })
            console.info('保存零件属性：', layerJsonData[currLayerId]);

        } else if(sel_type == 'all' && !selPopupType) {
            geojsonObject.features[0].properties = attrObj;
            console.info('保存整体属性：', layerJsonData[currLayerId]);

        } else if(selPopupType) {
            $.each(attrObj, function(i, objs) {
                var fieldStat = false;
                var fieldName = '';
                var fieldType = '';
                if(!layerJsonData[currLayerId].fieldsInfo) {
                    layerJsonData[currLayerId].fieldsInfo = [];
                    layerJsonData[currLayerId].srid = '4326';
                    layerJsonData[currLayerId].geoType = currLayerType
                }
                if(!layerJsonData[currLayerId].fieldsInfo.length) {
                    layerJsonData[currLayerId].fieldsInfo.push({
                        fieldName: i,
                        fieldType: !objs ? 'String' : isNaN(objs) ? 'String' : 'double'
                    });
                } else {
                    for(var j = 0; j < layerJsonData[currLayerId].fieldsInfo.length; j++) {
                        if(layerJsonData[currLayerId].fieldsInfo[j].fieldName == i) {
                            fieldStat = false;
                            break;
                        } else {
                            fieldStat = true;
                        }
                    }
                    if(fieldStat) {
                        layerJsonData[currLayerId].fieldsInfo.push({
                            fieldName: i,
                            fieldType: !objs ? 'String' : isNaN(objs) ? 'String' : 'double'
                        });
                    }
                }
            })
            layerJsonData[currLayerId].features.push(selPopupType);
            layerJsonData[currLayerId].features.forEach(function(v) {
                if(v.id == currId) {
                    v.properties = attrObj;
                }
            })
            console.info('新添零件属性：', layerJsonData[currLayerId]);
        }
        newFeatures(currLayerId);
        if(editObj) {
            editObj.removeEdit();
            switchStatus('telescopic');
            switchStatus('modify');
        }
        offAttr();
    });

    $('#fun6').on('click', function() {
        addAttr();
    });

    $('#fun7').on('click', function() {
        var currId = $(this).parent().find('input[type="hidden"]').val();
        offAttr();
        currLayerObj.removeFeatureById(currId);
        layerJsonData[currLayerId].features.splice(layerJsonData[currLayerId].features.findIndex(item => item.id == currId), 1);
    });

    $('#addFea img').on('click', function() {
        markerTips.setPosition(undefined);
        if($(this).attr('id') == 'addpoint') {
            let type = 'Point';
            add_newIcon(type);
        } else if($(this).attr('id') == 'addline') {
            let type = 'LineString';
            startDraw(type);
        } else if($(this).attr('id') == 'addpolygon') {
            let type = 'Square';
            startDraw(type);
        } else if($(this).attr('id') == 'addCircle') {
            let type = {
                sides: 0
            };
            add_shape(type);
        } else if($(this).attr('id') == 'addThree') {
            let type = {
                sides: 3
            };
            add_shape(type);
        } else if($(this).attr('id') == 'addFive') {
            let type = {
                sides: 5
            };
            add_shape(type);
        } else if($(this).attr('id') == 'addSix') {
            let type = {
                sides: 6
            };
            add_shape(type);
        } else if($(this).attr('id') == 'addSeven') {
            let type = {
                sides: 7
            };
            add_shape(type);
        } else if($(this).attr('id') == 'addsquare') {
            let type = 'Polygon';
            startDraw(type);
        }
    });

    $('#saveFea').on('click', function() {
        if(popup()) return false;
        var featureDataSave = JSON.stringify(layerJsonData[currLayerId]);
        var blob = new Blob([featureDataSave], {
            type: ""
        });
        saveAs(blob, currLayerId + '.geojson');
    });

    $('#changeMap').on('click', function() {
        $('#changeService,.popup-layer').fadeIn();
    })

    $('#addNewLayer').on('click', function() {
        $('#glassLayer,.popup-layer').fadeIn();
    })

    $('#closeLayerType,#markerImg-close,#closeService').on('click', function() {
        $('#glassLayer,#markerImg,#changeService,.popup-layer').fadeOut();
    });

    $('#longitude').on('click', '.new-show-img, .new-point-icon', function() {
        $('.markerImg-center').html('');
        var name = $(this)[0].classList[1];
        var jsonName = '';

        if(name == 'new-point-icon') {
            jsonName = 'iconImage';
        } else if(name == 'new-show-img') {
            jsonName = 'polygonImage';
        }

        $.getJSON('json/' + jsonName + '.json', function(data) {
            data.forEach(function(val, key) {
                $('.markerImg-center').append('<img src="' + pathUrl + val.img + '">');
            });
        });

        $('#markerImg,.popup-layer').fadeIn();
    })

    $('#longitude').on('change', 'li select.attr-value', function() {
        if($('#longitude select.attr-value').val() == 'color') {
            $('.poly-src').hide();
            $('.poly-fillColor').show();
        } else {
            $('.poly-fillColor').hide();
            $('.poly-src').show();
        }
    })

    $('#markerImg').on('click', '.markerImg-center > img', function() {
        var src = $(this).attr('src');
        $('#longitude .new-show-img').val(src.substr(src.indexOf('/image/safePark/bgImg/')));
        $('#longitude .new-point-icon').val(src.substr(src.indexOf('/image/safePark/icon/')));
        $('#markerImg,.popup-layer').fadeOut();
    })

    $('#editSubmit').on('click', function() {
        var coor = [];
        var lon = $('#editLongitude').val();
        var lat = $('#editLatitude').val();
        if(!lon || !lat) {
            if(popup('请输入经纬度后重新确定！')) return false;
        } else {
            coor[0] = JSON.parse(lon);
            coor[1] = JSON.parse(lat);
        }
        console.log(coor);
        mymap.setMapCenter(coor);
    })

    switchEvent("#telescopic", function() {
        if(popup()) {
            switchStatus('telescopic');
            return false;
        }
        feature_select($('input[type = "radio"][name="layerSel"]:checked').val())
    }, function() {
        if(popup()) return false;
        stop_select();
    });

    switchEvent("#modify", function() {
        if(popup()) {
            switchStatus('modify');
            return false;
        }
        isClick = false;
        modify_select();
    }, function() {
        if(popup()) return false;
        isClick = true;
        stop_modify();
    });

    switchEvent("#berth", function() {
        offAttr();
        if(popup()) {
            switchStatus('berth');
            return false;
        }
        // drawObj.setSnapObjLayer(currLayerObj);
        berthState = true;
        drawObj = new iGis.maptools.DrawFeature({
            gisMapObj: mymap,
            isSnap: berthState,
            snapLayer: currLayerObj
        });
    }, function() {
        offAttr();
        if(popup()) return false;
        berthState = false;
        drawObj = new iGis.maptools.DrawFeature({
            gisMapObj: mymap,
            isSnap: berthState,
            snapLayer: currLayerObj
        });
    });

});