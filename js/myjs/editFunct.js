/*
 * 所有公用函数
 * All public functions
 */

/***********************
 * 查看数组维数
 ***********************/
function num(arr) {
    if(arr instanceof Array) {
        return Math.max(...arr.map(e => {
            return 1 + parseInt(num(e))
        }))
    } else {
        return 0
    }
}

/***********************
 * 图层
 ***********************/
function newFeatures(typeId) {
    // mymap.removeLayer(layerObj[typeId]);'#2b2b3577'
    let options = {
        gisMapObj: mymap,
        serverType: 'GEOSERVER',
        url: layerJsonData[typeId],
        layerOptions: {
            fillColor: `rgb(${Math.floor(Math.random()*256)},${Math.floor(Math.random()*256)},${Math.floor(Math.random()*256)},0.6)`,
            strokeColor: `rgb(${Math.floor(Math.random()*256)},${Math.floor(Math.random()*256)},${Math.floor(Math.random()*256)},1)`,
            selStrokeWidth: 1,
            selFillColor: '#90742b',
            selStrokeColor: '#008cff',
            labFillColor: '#00588c',
            lalFontSize: '11px'
        },
        dataProjection: 'EPSG:4326'
    }

    var geoNameObj = new iGis.layers.DataServerLayer(options);
    layerObj[typeId] = geoNameObj;
    currLayerObj = geoNameObj;
    geoNameObj.addClickEvent((res) => {
        if(isClick) {
            selectPop(res.feature, res.clickCoord);
        }
    })
}

/***********************
 * 添加新的图层
 ***********************/
function saveLayerType(body) {
    currLayerType = body.type;
    layerJsonData[body.name] = {
        type: 'FeatureCollection',
        fieldsInfo: [],
        srid: '4326',
        geoType: body.type,
        features: []
    };

    $('#getGeojson').append("<div><input type='checkbox' id=" + body.name + " refs='" + body.type + "' name='layerObj'><input type='radio' value = " + body.name + " layerType = " + body.type + " name='layer'><span class='layer-name'>" + body.name + "</span><img src='./img/igis_opt_stop.png' class='deleteFeature' name=" + body.name + " type=" + body.type + "></div>");
    $('#glassLayer,.popup-layer').fadeOut();
    $('#' + body.name).prop('checked', true);
    newFeatures(body.name);
    $('input[type = "radio"][name = "layer"][value = ' + body.name + ']').click();
}

function importNewLayerType(body) {
    $('#getGeojson').append("<div><input type='checkbox' id=" + body.name + " refs='" + body.type + "' name='layerObj'><input type='radio' value = " + body.name + " layerType = " + body.type + " name='layer'><span class='layer-name'>" + body.name + "</span><img src='./img/igis_opt_stop.png' class='deleteFeature' name=" + body.name + " type=" + body.type + "></div>");
    $('#glassLayer,.popup-layer').fadeOut();
    $('#' + body.name).prop('checked', true);
    $('input[type = "radio"][name = "layer"][value = ' + body.name + ']').click();
}

/***********************
 * 开启选择图层
 ***********************/
function feature_select(type) {
    markerTips.setPosition(undefined);
    switchStatus('modify');
    switchStatus('berth');
    if(modifyObj)  modifyObj.removeInteraction();
    editObj.removeEdit();
    var options2 = {
        isScale: true,
        isRotate: true,
        isStretch: true,
        isTranslate: true,
        isTranslateFeature: false,
        layerObj: currLayerObj
    };
    editObj.addEdit(options2, dataConversion);
}

/***********************
 * 关闭图层缩放
 ***********************/
function stop_select() {
    editObj.removeEdit();
}

/***********************
 * 开始图层修改
 ***********************/
function modify_select() {
    markerTips.setPosition(undefined);
    switchStatus('telescopic');
    if(editObj) editObj.removeEdit();
    modifyObj.addTranslateAndModify({
        interactionType: 'modify',
        layerObj: currLayerObj
    }, dataConversion);
}

/***********************
 * 关闭图层修改
 ***********************/
function stop_modify() {
    modifyObj.removeInteraction();
}

/***********************
 * 弹出框处理
 ***********************/
function selectPop(body, coord) {
    selPopupType = null;
    markerTips.setPosition(coord);
    if(body.getProperties().currOperateFeatures != currLayerId || sel_type == 'all') {
        $('#fun4, #fun5, #fun6, #fun7').hide();
    } else {
        $('#fun4, #fun5, #fun6, #fun7').show();
    }
    var coo = body.getProperties();
    coo.cp = coord;
    coo.height ? coo.height = coo.height : coo.height = '';
    var template = '<input type="hidden" value="' + body.getId() + '" />';
    for(var v in coo) {
        var list = null;
        if(v == 'geometry' || v == 'cp' || v == 'display' || v == 'property') {
            continue;
        } else {
            if(body.getGeometry().getType() == 'Polygon' || body.getGeometry().getType() == 'MultiPolygon') {
                if(v == 'bgType') {
                    list = "<li><input type='text' value='" + v + "' class='attr-label'><select class='attr-value'><option value='color' selected>color</option><option value='img'>img</option></select></li>";
                    template += list;
                } else if(v == 'fillColor') {
                    list = "<li class='poly-fillColor'><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' name='showAlpha' id='showAlpha' class='attr-value'></li>";
                    template += list;
                } else if(v == 'src') {
                    list = "<li class='poly-src'><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' class='attr-value new-show-img'></li>";
                    template += list;
                } else if(v == 'currOperateFeatures') {
                    list = "<li><input type='text' value='" + v + "' class='attr-label' readonly><input type='text' value='" + coo[v] + "' class='attr-value' readonly></li>";
                    template += list;
                } else {
                    list = "<li><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' class='attr-value'></li>";
                    template += list;
                }
            } else if(body.getGeometry().getType() == 'LineString' || body.getGeometry().getType() == 'MultiLineString') {
                if(v == 'currOperateFeatures') {
                    list = "<li class='poly-fillColor'><input type='text' value='" + v + "' class='attr-label' readonly><input type='text' value='" + coo[v] + "' class='attr-value' readonly></li>";
                    template += list;
                } else if(v == 'igis_id' || v == 'fclass') {
                    list = "<li><input type='text' value='" + v + "' class='attr-label' readonly><input type='text' value='" + coo[v] + "' class='attr-value' readonly></li>";
                    template += list;
                } else {
                    list = "<li><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' class='attr-value'></li>";
                    template += list;
                }
            } else if(body.getGeometry().getType() == 'Point' || body.getGeometry().getType() == 'MultiPoint') {
                if(v == 'icon') {
                    list = "<li><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' class='attr-value new-point-icon'></li>";
                    template += list;
                } else if(v == 'currOperateFeatures') {
                    list = "<li><input type='text' value='" + v + "' class='attr-label' readonly><input type='text' value='" + coo[v] + "' class='attr-value' readonly></li>";
                    template += list;
                } else {
                    list = "<li><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' class='attr-value'></li>";
                    template += list;
                }
            }
        }
    }
    document.getElementById('longitude').innerHTML = template;
    if(!coo.src) {
        $('#longitude select.attr-value').val('color');
        $('.poly-fillColor').show().siblings('.poly-src').hide();
    } else {
        $('#longitude select.attr-value').val('img');
        $('.poly-src').show().siblings('.poly-fillColor').hide();
    }

    $("#showAlpha").spectrum({
        preferredFormat: "rgb",
        showInput: true,
        showAlpha: true,
        showPalette: true,
        palette: [
            ["red", "rgba(0, 0, 0, 0)", "rgb(255, 255, 255)"]
        ]
    });
}

function selectPopNewAdd(body, coord) {
    selPopupType = body;
    markerTips.setPosition(coord);
    if(sel_type == 'all') {
        $('#fun4,#fun5,#fun6,#fun7').hide();
    } else {
        $('#fun4,#fun5,#fun6,#fun7').show();
    }
    var coo = body.properties;
    coo.cp = coord;
    coo.height ? coo.height = coo.height : coo.height = '';
    var template = '<input type="hidden" value="' + body.id + '" />';
    for(var v in coo) {
        var list = null;
        if(v == 'geometry' || v == 'cp' || v == 'display' || v == 'property') {
            continue;
        } else {
            if(body.geometry.type == 'Polygon') {
                if(v == 'bgType') {
                    list = "<li><input type='text' value='" + v + "' class='attr-label'><select class='attr-value'><option value='color' selected>color</option><option value='img'>img</option></select></li>";
                    template += list;
                } else if(v == 'currOperateFeatures') {
                    list = "<li class='poly-fillColor'><input type='text' value='" + v + "' class='attr-label' readonly><input type='text' value='" + coo[v] + "' class='attr-value' readonly></li>";
                    template += list;
                } else if(v == 'fillColor') {
                    list = "<li class='poly-fillColor'><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' name='showAlpha' id='showAlpha' class='attr-value'></li>";
                    template += list;
                } else if(v == 'src') {
                    list = "<li class='poly-src'><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' class='attr-value new-show-img'></li>";
                    template += list;
                } else {
                    list = "<li><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' class='attr-value'></li>";
                    template += list;
                }
            } else if(body.geometry.type == 'LineString') {
                if(v == 'currOperateFeatures') {
                    list = "<li class='poly-fillColor'><input type='text' value='" + v + "' class='attr-label' readonly><input type='text' value='" + coo[v] + "' class='attr-value' readonly></li>";
                    template += list;
                } else if(v == 'igis_id' || v == 'fclass') {
                    list = "<li><input type='text' value='" + v + "' class='attr-label' readonly><input type='text' value='" + coo[v] + "' class='attr-value' readonly></li>";
                    template += list;
                } else {
                    list = "<li><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' class='attr-value'></li>";
                    template += list;
                }
            } else if(body.geometry.type == 'Point') {
                if(v == 'icon') {
                    list = "<li><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' class='attr-value new-point-icon'></li>";
                    template += list;
                } else if(v == 'currOperateFeatures') {
                    list = "<li class='poly-fillColor'><input type='text' value='" + v + "' class='attr-label' readonly><input type='text' value='" + coo[v] + "' class='attr-value' readonly></li>";
                    template += list;
                } else {
                    list = "<li><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' class='attr-value'></li>";
                    template += list;
                }
            }
        }
    }
    document.getElementById('longitude').innerHTML = template;
    if(!coo.src) {
        $('#longitude select.attr-value').val('color');
        $('.poly-fillColor').show().siblings('.poly-src').hide();
    } else {
        $('#longitude select.attr-value').val('img');
        $('.poly-src').show().siblings('.poly-fillColor').hide();
    }

    $("#showAlpha").spectrum({
        preferredFormat: "rgb",
        showInput: true,
        showAlpha: true,
        showPalette: true,
        palette: [
            ["red", "rgba(0, 0, 0, 0)", "rgb(255, 255, 255)"]
        ]
    });
}

/***********************
 * 关闭信息弹窗
 ***********************/
function pop_close() {
    document.getElementById('marker').style.display = 'none';
}

/***********************
 * 封装goeJson数据
 ***********************/
function assemble(coor) {
    var arr = [];
    coor.features.map(val => {
        var arr = [],
            v = val.geometry.coordinates;
        if(v.length > 1 && num(v) >= 3) {
            v = v.reduce((a, b) => a.concat(b), []);
            if(num(v) > 2) {
                v = v.reduce((a, b) => a.concat(b), []);
            }
        } else {
            v = v.reduce((a, b) => a.concat(b), []);
        }
        arr.push(v);
        val.geometry.coordinates.splice.apply(val.geometry.coordinates, [0, val.geometry.coordinates.length, ...arr]);
    })
    console.info('geojson封装：', coor);
    return coor;
}

/***********************
 * 整体单个点线面数据整理
 ***********************/
function dataConversion(res) {
    var e = res.getGeometry().getCoordinates();
    if(sel_type == 'all') {
        if(res.getGeometry().getType() == 'MultiPoint') {
            var coorbox = [];
            e.map(v => {
                coorbox.push(mymap.reTransform(v, false));
            })
            layerJsonData[currLayerId].features[0].geometry.coordinates = coorbox;
        } else if(res.getGeometry().getType() == 'MultiLineString') {
            e.map((values, i) => {
                var coorbox = [];
                values.map(v => {
                    coorbox.push(mymap.reTransform(v, false));
                })
                layerJsonData[currLayerId].features[0].geometry.coordinates[i] = [coorbox];
            });
        } else if(res.getGeometry().getType() == 'MultiPolygon') {
            e.map((values, i) => {
                if(layerJsonData[currLayerId].features[0].geometry) {
                    var coorbox = [];
                    values[0].map(v => {
                        coorbox.push(mymap.reTransform(v, false));
                    })
                    layerJsonData[currLayerId].features[0].geometry.coordinates[i] = [coorbox];
                } else {
                    layerJsonData[currLayerId].features[0] = values;
                    var coorlist = layerJsonData[currLayerId].features[0][0];
                    var coorbox = [];
                    coorlist.map(v => {
                        coorbox.push(mymap.reTransform(v, false));
                    })
                    layerJsonData[currLayerId].features[0] = coorbox;
                }
            });
        }
        console.info('整体组装：', layerJsonData[currLayerId]);
    } else {
        if(res.getGeometry().getType() == 'Point') {
            var id = res.id_;
            layerJsonData[currLayerId].features.map(v => {
                if(v.id == id) {
                    v.geometry.coordinates = mymap.reTransform(e, false);
                }
            })
        } else if(res.getGeometry().getType() == 'LineString') {
            var id = res.id_;
            var coorbox = [];
            e.map(v => {
                coorbox.push(mymap.reTransform(v, false));
            })
            layerJsonData[currLayerId].features.map(v => {
                if(v.id == id) {
                    v.geometry.coordinates = coorbox;
                }
            })
        } else {
            var id = res.id_;
            var coorbox = [];
            e[0].map(v => {
                coorbox.push(mymap.reTransform(v, false));
            })
            layerJsonData[currLayerId].features.map(v => {
                if(v.id == id) {
                    v.geometry.coordinates = [coorbox];
                }
            })
        }
        console.info('零件组装：', layerJsonData[currLayerId]);
    }
}

/***********************
 * 整体图层
 ***********************/
function all_layer() {
    var coor = [];
    tmpPartJsonData = layerJsonData[currLayerId];
    layerJsonData[currLayerId].features.map(res => {
        if(res.geometry) {
            coor.push(res.geometry.coordinates);
        } else {
            coor.push(res);
        }
    });

    let featType = '';
    if($('#' + currLayerId + '').attr('refs') == 'point') {
        featType = 'MultiPoint';
    } else if($('#' + currLayerId + '').attr('refs') == 'line') {
        featType = 'MultiLineString';
    } else if($('#' + currLayerId + '').attr('refs') == 'polygon') {
        featType = 'MultiPolygon';
    }

    geojsonObject.features[0].geometry.type = featType;
    geojsonObject.features[0].geometry.coordinates = coor;
    geojsonObject.geoType = featType == 'MultiPolygon' ? 'polygon' : featType == 'MultiLineString' ? 'line' : featType == 'MultiPoint' ? 'point' : 'polygon';
    layerJsonData[currLayerId] = geojsonObject;
}

/***********************
 * 单个图层
 ***********************/
function part_layer() {
    tmpPartJsonData.features.map((v, i) => {
        if(v.geometry.type == 'LineString') {
            if(num(layerJsonData[currLayerId].features[0].geometry.coordinates[i]) == 2) {
                v.geometry.coordinates = layerJsonData[currLayerId].features[0].geometry.coordinates[i];
            } else if(num(layerJsonData[currLayerId].features[0].geometry.coordinates[i]) == 3) {
                v.geometry.coordinates = layerJsonData[currLayerId].features[0].geometry.coordinates[i][0];
            }
        } else if(v.geometry.type == 'Point') {
            v.geometry.coordinates = layerJsonData[currLayerId].features[0].geometry.coordinates[i];
        } else if(v.geometry.type == 'Polygon') {
            v.geometry.coordinates = layerJsonData[currLayerId].features[0].geometry.coordinates[i];
        }
    })

    layerJsonData[currLayerId] = tmpPartJsonData;
    tmpPartJsonData = {};
}

/***********************
 * 图层切换
 ***********************/
function changeLayer(type) {
    sel_type = type;
    markerTips.setPosition(undefined);
    switchStatus('telescopic');
    switchStatus('modify');
    switchStatus('berth');
    if(editObj) editObj.removeEdit();
    if(modifyObj)  modifyObj.removeInteraction();
    if(drawObj || shapeObj) {
        offAttr();
    }
    if(sel_type == 'all') {
        all_layer();
        $('.modify,#addFea,#fun9>p').slideUp('fast');
    } else if(sel_type == 'part') {
        part_layer();
        $('.modify,#addFea,#fun9>p').slideDown('fast');
    }
    mymap.removeLayer(layerObj[currLayerId]);
    newFeatures(currLayerId);
}

function switchStatus(res, body) {
    $('#' + res + '').attr('class', 'switch-off');
    $('.switch-off').css({
        'border-color': '#dfdfdf',
        'box-shadow': 'rgb(223, 223, 223) 0px 0px 0px 0px inset',
        'background-color': 'rgb(255, 255, 255)'
    });
    if(res == 'telescopic') {
        if(editObj) editObj.removeEdit();
    } else if(res == 'modify') {
        if(modifyObj) modifyObj.removeInteraction();
    } else if(res == 'berth') {
        berthState = false;
    }
}

/***********************
 * 新增图层、属性
 ***********************/
function addAttr() {
    var status = false;
    for(var i = 0; i < $('#longitude li').length; i++) {
        var key = $($('#longitude li')[i]).children('.attr-label').val();
        var value = $($('#longitude li')[i]).children('.attr-value').val();
        if(!key && !value) {
            console.log('填写完整属性后再添加……');
            status = true;
            break;
        } else {
            status = false;
        }
    }
    if(!status) {
        $('#longitude').append("<li><input type='text' value='' class='attr-label'><input type='text' value='' class='attr-value'></li>");
    }
}

/***********************
 * 关闭图层、属性
 ***********************/
function offAttr() {
    markerTips.setPosition(undefined);
    isClick = true;
    if(drawObj) drawObj.removeDrawFeature();
    if(shapeObj) shapeObj.removeCreate();

    $('#fun8').hide();
    $('.igis_btn_list').removeClass('cover_layer');
    $('#batchAddFeature').html('<img src="img/igis_fea_batch.png" title="批量添加">批量添加');
}

/***********************
 * 添加多边形
 ***********************/
function startDraw(name) {
    if(popup()) return false;
    drawObj.removeDrawFeature();
    shapeObj.removeCreate();
    isClick = false;
    drawObj.addDrawFeature(name, function(e) {
        let coord = [0, 0];
        var template = {
            'type': 'Feature',
            'id': new Date().getTime().toString(),
            'properties': {
                'name': 'new',
                'height': '',
                'currOperateFeatures': currLayerId
            },
            'geometry': {
                'type': name == 'Square' ? 'Polygon' : name,
                'coordinates': e
            }
        };

        if(name == 'Point') {
            coord = e;
        } else if(name == 'LineString') {
            coord = e[0];
            template.properties.igis_id = template.id;
            template.properties.fclass = 'unclassified';
        } else if(name == 'Polygon' || name == 'Square') {
            coord = e[0][0];
            template.properties.cp = e[0][0];
            template.properties.bgType = '';
            template.properties.fillColor = 'rgba(0,102,255,0.5)';
            template.properties.src = '';
        }
        popupSaveData = template.properties;
        selectPopNewAdd(template, coord);
    });
    drawObj.setSnapObjLayer(currLayerObj);
}

/***********************
 * 添加三、五、六、七边形
 ***********************/
function add_shape(name) {
    if(popup()) return false;
    drawObj.removeDrawFeature();
    shapeObj.removeCreate();
    isClick = false;
    shapeObj.addCreate(name, function(e) {
        e = e.getGeometry().getCoordinates()[0].map(res => {
            return mymap.reTransform(res, false)
        });
        let coord = e[0];
        var template = {
            'type': 'Feature',
            'id': new Date().getTime().toString(),
            'properties': {
                'name': 'new',
                'height': '',
                'currOperateFeatures': currLayerId
            },
            'geometry': {
                'type': 'Polygon',
                'coordinates': [e]
            }
        };
        template.properties.cp = coord;
        template.properties.bgType = '';
        template.properties.fillColor = 'rgba(0,102,255,0.5)';
        template.properties.src = '';
        popupSaveData = template.properties;
        selectPopNewAdd(template, coord);
    });
}

/***********************
 * 添加图标
 ***********************/
function add_newIcon(name) {
    if(popup()) return false;
    drawObj.removeDrawFeature();
    shapeObj.removeCreate();
    isClick = false;
    drawObj.addDrawFeature(name, function(e) {
        let coord = e;
        var template = {
            'type': 'Feature',
            'id': new Date().getTime().toString(),
            'properties': {
                'name': 'newIcom',
                'height': '',
                'icon': '',
                'display': zoomRange,
                'currOperateFeatures': currLayerId
            },
            'geometry': {
                'type': 'Point',
                'coordinates': e
            }
        };
        template.properties.property = iconSaveData;
        template.properties.property.label = template.properties.property.name = template.properties.name;
        template.properties.property.src = template.properties.icon;
        popupSaveData = template.properties;
        selectPopNewAdd(template, coord);
    });
}