'use strict';

/*
 * 全局 Gis 对象
 * Global GIS object
 */

var layerJsonData = {}; // 所有图层缓存数据
var tmpPartJsonData = {}; // 整体图层、局部图层数据交换所需
var popupSaveData = {}; // 图层信息（添加图标时数据交换所需）
var iconSaveData = {}; // 图标数据
var selPopupType = null; // 图层信息（信息弹框区分新建图层、已有图层）
var currLayerObj = null; // 当前图层信息
var layerObj = {}; // 当前图层信息（数据交换）
var currLayerId = ''; // 当前图层名称
var currLayerType = ''; // 当前图层类型
var isClick = true; // 是否显示图层
var sel_type = 'part'; // 操作局部图层
var drawObj = null; // 绘制图层
var batchAddFeature = []; // 批量添加数据转换
var batchCenter = []; // 批量添加中心点
var berthState = false; // 停靠状态
var zoomRange = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]; // 级别显示图层（添加图标时数据交换所需）
var setCenter = [108.763156, 34.258986]; // 设置中心点
var pathUrl = 'http://114.115.183.47:8000/com.cloud.isoft.wxs.service';
var pathService = '/WMSServices/loadStdout?serviceName=gisserver_wms_shape_xietongchuangxin_1';

/***********************
 * 创建地图对象
 ***********************/
var mymap = new iGis.GisMap();
mymap.createMap({
    mapType: iGis.MapType.OPENSTREET_MAP,
    divId: "iGis",
    center: setCenter,
    zoom: 15,
    maxZoom: 22,
    projection: "EPSG:3857",
    isScaleLine: true,
    isMousePosition: true,
    isZoomLevel: true,
    units: "metric",
    wrapX: false
});
var mymapParam = {
    mapType: iGis.MapType.WMS_MAP,
    url: pathUrl + pathService,
    layerParams: {
        VERSION: '1.3.0',
        LAYERS: 'gisserver'
    },
    divId: "iGis",
    center: setCenter,
    zoom: 15,
    minZoom: 1,
    maxZoom: 22,
    projection: "EPSG:4326",
    isScaleLine: true,
    isMousePosition: true,
    isZoomLevel: true,
    units: "metric",
    wrapX: false
};
var changeMapService = function changeMapService(url, center) {
    mymapParam.url = pathUrl + url;
    mymapParam.center = center;
    mymap.createMap(mymapParam);
    mymap.setMapCenter(center);
};
//changeMapService(pathService, setCenter);
setCenter = mymap.getMapCenter();

/***********************
 * 初始化ajax同步请求
 ***********************/
$.ajaxSettings.async = false;

/***********************
 * 初始化整体图层数据
 ***********************/
var geojsonObject = {
    'type': 'FeatureCollection',
    'crs': {
        'type': 'name',
        'properties': {
            'name': 'EPSG:4326'
        }
    },
    "srid": "4326",
    "geoType": "polygon",
    "fieldsInfo": [],
    'features': [{
        'type': "Feature",
        'properties': {
            'id': "publish_all_features"
        },
        'geometry': {
            'type': "MultiPolygon",
            'name': 'all_features',
            'coordinates': []
        }
    }]
};

/***********************
 * 对象初始化
 ***********************/
var shapeObj = new iGis.maptools.DrawShapeFeature({
    gisMapObj: mymap
});
var modifyObj = new iGis.maptools.TranslateAndModify({
    gisMapObj: mymap
});
var editObj = new iGis.maptools.EditLayer({
    gisMapObj: mymap
});
var markerTips = new iGis.maptools.MapTips({
    gisMapObj: mymap,
    offset: [-130, -10],
    element: document.getElementById('marker'),
    positioning: 'bottom-left'
});

var popup = function popup(contents) {
    var stat = false;
    if (!contents) {
        contents = '请正确步骤后操作：<br />（1）、先选择显示图层；<br />（2）、再选择当前操作图层！';
    }
    $('#popupBox').html('<div>' + contents + '</div>');
    for (var i = 0; i < $('#getGeojson > div').length; i++) {
        var stat1 = $($($('#getGeojson > div')[i]).children('input')[0]).prop('checked');
        var stat2 = $($($('#getGeojson > div')[i]).children('input')[1]).prop('checked');
        if (stat1 && stat2) {
            $('#popupBox').html('');
            stat = false;
            break;
        } else {
            stat = true;
        }
    }
    if (stat) {
        $('#popupBox div').fadeIn('slow').delay(1500).fadeOut('slow');
    }
    return stat;
};

iconSaveData = {
    isBox: true,
    label: 'label',
    src: '',
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

mymap.addCustomClickEvent(function (e) {
    // markerTips.setPosition(undefined);
});
'use strict';

/*
 * 批量处理部分
 * Batch processing part
 */

function batchFeature() {
    markerTips.setPosition(popupSaveData.cp);
    $('#fun5, #fun7').hide();
    if (currLayerType == 'point') {
        var template = "<li><input type='text' value='name' class='attr-label'><input type='text' value='newPoint' class='attr-value'></li>";
        template += "<li><input type='text' value='height' class='attr-label'><input type='text' value='0' class='attr-value'></li>";
        template += "<li><input type='text' value='icon' class='attr-label'><input type='text' value='' class='attr-value new-point-icon'></li>";
        template += "<li><input type='text' value='currOperateFeatures' class='attr-label' readonly><input type='text' value='" + currLayerId + "' class='attr-value' readonly></li>";
        document.getElementById('longitude').innerHTML = template;
    } else if (currLayerType == 'line') {
        var template = "<li><input type='text' value='name' class='attr-label'><input type='text' value='newLine' class='attr-value'></li>";
        template += "<li><input type='text' value='height' class='attr-label'><input type='text' value='0' class='attr-value'></li>";
        template += "<li><input type='text' value='currOperateFeatures' class='attr-label' readonly><input type='text' value='" + currLayerId + "' class='attr-value' readonly></li>";
        document.getElementById('longitude').innerHTML = template;
    } else if (currLayerType == 'polygon') {
        var template = "<li><input type='text' value='name' class='attr-label'><input type='text' value='newPolygon' class='attr-value'></li>";
        template += "<li><input type='text' value='height' class='attr-label'><input type='text' value='0' class='attr-value'></li>";
        template += "<li><input type='text' value='currOperateFeatures' class='attr-label' readonly><input type='text' value='" + currLayerId + "' class='attr-value' readonly></li>";
        template += "<li><input type='text' value='bgType' class='attr-label'><select class='attr-value'><option value='color' selected>color</option><option value='img'>img</option></select></li>";
        template += "<li class='poly-fillColor'><input type='text' value='fillColor' class='attr-label'><input type='text' value='rgba(122,112,112,.5)' name='showAlpha' id='showAlpha' class='attr-value'></li>";
        template += "<li class='poly-src'><input type='text' value='src' class='attr-label'><input type='text' value='' class='attr-value new-show-img'></li>";
        document.getElementById('longitude').innerHTML = template;
        $('.poly-src').hide();
        $("#showAlpha").spectrum({
            preferredFormat: "rgb",
            showInput: true,
            showAlpha: true,
            showPalette: true,
            palette: [["red", "rgba(0, 0, 0, 0)", "rgb(255, 255, 255)"]]
        });
    }
}

function startDrawFeature(name) {
    drawObj.removeDrawFeature();
    shapeObj.removeCreate();
    isClick = false;
    drawObj.addDrawFeature(name, function (e) {
        var coord = [0, 0];
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

        if (name == 'Point') {
            batchCenter = coord = e;
            template.properties.cp = e;
            template.properties.icon = '';
        } else if (name == 'LineString') {
            batchCenter = coord = e[0];
            template.properties.cp = e[0];
            template.properties.igis_id = template.id;
            template.properties.fclass = 'unclassified';
        } else if (name == 'Polygon' || name == 'Square') {
            batchCenter = coord = e[0][0];
            template.properties.cp = e[0][0];
            template.properties.bgType = 'color';
            template.properties.fillColor = 'rgba(0,102,255,0.5)';
            template.properties.src = '';
        }
        popupSaveData = template.properties;
        batchAddFeature.push(template);
    });
    drawObj.setSnapObjLayer(currLayerObj);
}

$(function () {
    var batchState = false;
    $('#batchAddFeature').on('click', function () {
        markerTips.setPosition(undefined);
        $('#fun4, #fun6, #fun8').show();
        if (popup()) return false;
        if (batchState) {
            batchFeature();
        } else {
            batchAddFeature = [];
            $('.igis_btn_list').addClass('cover_layer');
            $(this).html('<img src="img/igis_fea_batch.png" title="批量添加">停止添加');

            isClick = false;
            if (currLayerType == 'point') {
                startDrawFeature('Point');
            } else if (currLayerType == 'line') {
                startDrawFeature('LineString');
            } else if (currLayerType == 'polygon') {
                startDrawFeature('Polygon');
            }
        }
        batchState = !batchState;
    });

    $('#fun8').on('click', function () {
        var attrObj = {};
        for (var i = 0; i < $('#longitude li').length; i++) {
            var key = $($('#longitude li')[i]).children('.attr-label').val();
            var value = $($('#longitude li')[i]).children('.attr-value').val();
            if (!key && !value || !key) {
                continue;
            } else {
                attrObj[key] = value;
            }
        }

        if (attrObj.hasOwnProperty("icon") && currLayerType == 'point' && attrObj.icon) {
            attrObj.property = iconSaveData;
            attrObj.property.label = attrObj.name;
            attrObj.property.src = pathUrl + attrObj.icon;
            attrObj.display = zoomRange;
        }

        var submitBatchFeature = [];
        batchAddFeature.forEach(function (value, key) {
            value.properties = $.extend(true, value.properties, attrObj);
        });

        $('.igis_btn_list').removeClass('cover_layer');
        $('#batchAddFeature').html('<img src="img/igis_fea_batch.png" title="批量添加">批量添加');

        isClick = true;
        layerJsonData[currLayerId].features = layerJsonData[currLayerId].features.concat(batchAddFeature);
        mymap.removeLayer(layerObj[currLayerId]);
        newFeatures(currLayerId);
        drawObj.removeDrawFeature();
        if (editObj) {
            editObj.removeEdit();
            switchStatus('telescopic');
            switchStatus('modify');
            switchStatus('berth');
        }

        markerTips.setPosition(undefined);
        $('#fun8').hide();
    });
});
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/*
 * 所有公用函数
 * All public functions
 */

/***********************
 * 查看数组维数
 ***********************/
function num(arr) {
    if (arr instanceof Array) {
        return Math.max.apply(Math, _toConsumableArray(arr.map(function (e) {
            return 1 + parseInt(num(e));
        })));
    } else {
        return 0;
    }
}

/***********************
 * 图层
 ***********************/
function newFeatures(typeId) {
    // mymap.removeLayer(layerObj[typeId]);'#2b2b3577'
    var options = {
        gisMapObj: mymap,
        serverType: 'GEOSERVER',
        url: layerJsonData[typeId],
        layerOptions: {
            fillColor: 'rgb(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',0.6)',
            strokeColor: 'rgb(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',1)',
            selStrokeWidth: 1,
            selFillColor: '#90742b',
            selStrokeColor: '#008cff',
            labFillColor: '#00588c',
            lalFontSize: '11px'
        },
        dataProjection: 'EPSG:4326'
    };

    var geoNameObj = new iGis.layers.DataServerLayer(options);
    layerObj[typeId] = geoNameObj;
    currLayerObj = geoNameObj;
    geoNameObj.addClickEvent(function (res) {
        if (isClick) {
            selectPop(res.feature, res.clickCoord);
        }
    });
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
    if (modifyObj) modifyObj.removeInteraction();
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
    if (editObj) editObj.removeEdit();
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
    if (body.getProperties().currOperateFeatures != currLayerId || sel_type == 'all') {
        $('#fun4, #fun5, #fun6, #fun7').hide();
    } else {
        $('#fun4, #fun5, #fun6, #fun7').show();
    }
    var coo = body.getProperties();
    coo.cp = coord;
    coo.height ? coo.height = coo.height : coo.height = '';
    var template = '<input type="hidden" value="' + body.getId() + '" />';
    for (var v in coo) {
        var list = null;
        if (v == 'geometry' || v == 'cp' || v == 'display' || v == 'property') {
            continue;
        } else {
            if (body.getGeometry().getType() == 'Polygon' || body.getGeometry().getType() == 'MultiPolygon') {
                if (v == 'bgType') {
                    list = "<li><input type='text' value='" + v + "' class='attr-label'><select class='attr-value'><option value='color' selected>color</option><option value='img'>img</option></select></li>";
                    template += list;
                } else if (v == 'fillColor') {
                    list = "<li class='poly-fillColor'><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' name='showAlpha' id='showAlpha' class='attr-value'></li>";
                    template += list;
                } else if (v == 'src') {
                    list = "<li class='poly-src'><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' class='attr-value new-show-img'></li>";
                    template += list;
                } else if (v == 'currOperateFeatures') {
                    list = "<li><input type='text' value='" + v + "' class='attr-label' readonly><input type='text' value='" + coo[v] + "' class='attr-value' readonly></li>";
                    template += list;
                } else {
                    list = "<li><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' class='attr-value'></li>";
                    template += list;
                }
            } else if (body.getGeometry().getType() == 'LineString' || body.getGeometry().getType() == 'MultiLineString') {
                if (v == 'currOperateFeatures') {
                    list = "<li class='poly-fillColor'><input type='text' value='" + v + "' class='attr-label' readonly><input type='text' value='" + coo[v] + "' class='attr-value' readonly></li>";
                    template += list;
                } else if (v == 'igis_id' || v == 'fclass') {
                    list = "<li><input type='text' value='" + v + "' class='attr-label' readonly><input type='text' value='" + coo[v] + "' class='attr-value' readonly></li>";
                    template += list;
                } else {
                    list = "<li><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' class='attr-value'></li>";
                    template += list;
                }
            } else if (body.getGeometry().getType() == 'Point' || body.getGeometry().getType() == 'MultiPoint') {
                if (v == 'icon') {
                    list = "<li><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' class='attr-value new-point-icon'></li>";
                    template += list;
                } else if (v == 'currOperateFeatures') {
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
    if (!coo.src) {
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
        palette: [["red", "rgba(0, 0, 0, 0)", "rgb(255, 255, 255)"]]
    });
}

function selectPopNewAdd(body, coord) {
    selPopupType = body;
    markerTips.setPosition(coord);
    if (sel_type == 'all') {
        $('#fun4,#fun5,#fun6,#fun7').hide();
    } else {
        $('#fun4,#fun5,#fun6,#fun7').show();
    }
    var coo = body.properties;
    coo.cp = coord;
    coo.height ? coo.height = coo.height : coo.height = '';
    var template = '<input type="hidden" value="' + body.id + '" />';
    for (var v in coo) {
        var list = null;
        if (v == 'geometry' || v == 'cp' || v == 'display' || v == 'property') {
            continue;
        } else {
            if (body.geometry.type == 'Polygon') {
                if (v == 'bgType') {
                    list = "<li><input type='text' value='" + v + "' class='attr-label'><select class='attr-value'><option value='color' selected>color</option><option value='img'>img</option></select></li>";
                    template += list;
                } else if (v == 'currOperateFeatures') {
                    list = "<li class='poly-fillColor'><input type='text' value='" + v + "' class='attr-label' readonly><input type='text' value='" + coo[v] + "' class='attr-value' readonly></li>";
                    template += list;
                } else if (v == 'fillColor') {
                    list = "<li class='poly-fillColor'><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' name='showAlpha' id='showAlpha' class='attr-value'></li>";
                    template += list;
                } else if (v == 'src') {
                    list = "<li class='poly-src'><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' class='attr-value new-show-img'></li>";
                    template += list;
                } else {
                    list = "<li><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' class='attr-value'></li>";
                    template += list;
                }
            } else if (body.geometry.type == 'LineString') {
                if (v == 'currOperateFeatures') {
                    list = "<li class='poly-fillColor'><input type='text' value='" + v + "' class='attr-label' readonly><input type='text' value='" + coo[v] + "' class='attr-value' readonly></li>";
                    template += list;
                } else if (v == 'igis_id' || v == 'fclass') {
                    list = "<li><input type='text' value='" + v + "' class='attr-label' readonly><input type='text' value='" + coo[v] + "' class='attr-value' readonly></li>";
                    template += list;
                } else {
                    list = "<li><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' class='attr-value'></li>";
                    template += list;
                }
            } else if (body.geometry.type == 'Point') {
                if (v == 'icon') {
                    list = "<li><input type='text' value='" + v + "' class='attr-label'><input type='text' value='" + coo[v] + "' class='attr-value new-point-icon'></li>";
                    template += list;
                } else if (v == 'currOperateFeatures') {
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
    if (!coo.src) {
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
        palette: [["red", "rgba(0, 0, 0, 0)", "rgb(255, 255, 255)"]]
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
    coor.features.map(function (val) {
        var arr = [],
            v = val.geometry.coordinates;
        if (v.length > 1 && num(v) >= 3) {
            v = v.reduce(function (a, b) {
                return a.concat(b);
            }, []);
            if (num(v) > 2) {
                v = v.reduce(function (a, b) {
                    return a.concat(b);
                }, []);
            }
        } else {
            v = v.reduce(function (a, b) {
                return a.concat(b);
            }, []);
        }
        arr.push(v);
        val.geometry.coordinates.splice.apply(val.geometry.coordinates, [0, val.geometry.coordinates.length].concat(arr));
    });
    console.info('geojson封装：', coor);
    return coor;
}

/***********************
 * 整体单个点线面数据整理
 ***********************/
function dataConversion(res) {
    var e = res.getGeometry().getCoordinates();
    if (sel_type == 'all') {
        if (res.getGeometry().getType() == 'MultiPoint') {
            var coorbox = [];
            e.map(function (v) {
                coorbox.push(mymap.reTransform(v, false));
            });
            layerJsonData[currLayerId].features[0].geometry.coordinates = coorbox;
        } else if (res.getGeometry().getType() == 'MultiLineString') {
            e.map(function (values, i) {
                var coorbox = [];
                values.map(function (v) {
                    coorbox.push(mymap.reTransform(v, false));
                });
                layerJsonData[currLayerId].features[0].geometry.coordinates[i] = [coorbox];
            });
        } else if (res.getGeometry().getType() == 'MultiPolygon') {
            e.map(function (values, i) {
                if (layerJsonData[currLayerId].features[0].geometry) {
                    var coorbox = [];
                    values[0].map(function (v) {
                        coorbox.push(mymap.reTransform(v, false));
                    });
                    layerJsonData[currLayerId].features[0].geometry.coordinates[i] = [coorbox];
                } else {
                    layerJsonData[currLayerId].features[0] = values;
                    var coorlist = layerJsonData[currLayerId].features[0][0];
                    var coorbox = [];
                    coorlist.map(function (v) {
                        coorbox.push(mymap.reTransform(v, false));
                    });
                    layerJsonData[currLayerId].features[0] = coorbox;
                }
            });
        }
        console.info('整体组装：', layerJsonData[currLayerId]);
    } else {
        if (res.getGeometry().getType() == 'Point') {
            var id = res.id_;
            layerJsonData[currLayerId].features.map(function (v) {
                if (v.id == id) {
                    v.geometry.coordinates = mymap.reTransform(e, false);
                }
            });
        } else if (res.getGeometry().getType() == 'LineString') {
            var id = res.id_;
            var coorbox = [];
            e.map(function (v) {
                coorbox.push(mymap.reTransform(v, false));
            });
            layerJsonData[currLayerId].features.map(function (v) {
                if (v.id == id) {
                    v.geometry.coordinates = coorbox;
                }
            });
        } else {
            var id = res.id_;
            var coorbox = [];
            e[0].map(function (v) {
                coorbox.push(mymap.reTransform(v, false));
            });
            layerJsonData[currLayerId].features.map(function (v) {
                if (v.id == id) {
                    v.geometry.coordinates = [coorbox];
                }
            });
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
    layerJsonData[currLayerId].features.map(function (res) {
        if (res.geometry) {
            coor.push(res.geometry.coordinates);
        } else {
            coor.push(res);
        }
    });

    var featType = '';
    if ($('#' + currLayerId + '').attr('refs') == 'point') {
        featType = 'MultiPoint';
    } else if ($('#' + currLayerId + '').attr('refs') == 'line') {
        featType = 'MultiLineString';
    } else if ($('#' + currLayerId + '').attr('refs') == 'polygon') {
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
    tmpPartJsonData.features.map(function (v, i) {
        if (v.geometry.type == 'LineString') {
            if (num(layerJsonData[currLayerId].features[0].geometry.coordinates[i]) == 2) {
                v.geometry.coordinates = layerJsonData[currLayerId].features[0].geometry.coordinates[i];
            } else if (num(layerJsonData[currLayerId].features[0].geometry.coordinates[i]) == 3) {
                v.geometry.coordinates = layerJsonData[currLayerId].features[0].geometry.coordinates[i][0];
            }
        } else if (v.geometry.type == 'Point') {
            v.geometry.coordinates = layerJsonData[currLayerId].features[0].geometry.coordinates[i];
        } else if (v.geometry.type == 'Polygon') {
            v.geometry.coordinates = layerJsonData[currLayerId].features[0].geometry.coordinates[i];
        }
    });

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
    if (editObj) editObj.removeEdit();
    if (modifyObj) modifyObj.removeInteraction();
    if (drawObj || shapeObj) {
        offAttr();
    }
    if (sel_type == 'all') {
        all_layer();
        $('.modify,#addFea,#fun9>p').slideUp('fast');
    } else if (sel_type == 'part') {
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
    if (res == 'telescopic') {
        if (editObj) editObj.removeEdit();
    } else if (res == 'modify') {
        if (modifyObj) modifyObj.removeInteraction();
    } else if (res == 'berth') {
        berthState = false;
    }
}

/***********************
 * 新增图层、属性
 ***********************/
function addAttr() {
    var status = false;
    for (var i = 0; i < $('#longitude li').length; i++) {
        var key = $($('#longitude li')[i]).children('.attr-label').val();
        var value = $($('#longitude li')[i]).children('.attr-value').val();
        if (!key && !value) {
            console.log('填写完整属性后再添加……');
            status = true;
            break;
        } else {
            status = false;
        }
    }
    if (!status) {
        $('#longitude').append("<li><input type='text' value='' class='attr-label'><input type='text' value='' class='attr-value'></li>");
    }
}

/***********************
 * 关闭图层、属性
 ***********************/
function offAttr() {
    markerTips.setPosition(undefined);
    isClick = true;
    if (drawObj) drawObj.removeDrawFeature();
    if (shapeObj) shapeObj.removeCreate();

    $('#fun8').hide();
    $('.igis_btn_list').removeClass('cover_layer');
    $('#batchAddFeature').html('<img src="img/igis_fea_batch.png" title="批量添加">批量添加');
}

/***********************
 * 添加多边形
 ***********************/
function startDraw(name) {
    if (popup()) return false;
    drawObj.removeDrawFeature();
    shapeObj.removeCreate();
    isClick = false;
    drawObj.addDrawFeature(name, function (e) {
        var coord = [0, 0];
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

        if (name == 'Point') {
            coord = e;
        } else if (name == 'LineString') {
            coord = e[0];
            template.properties.igis_id = template.id;
            template.properties.fclass = 'unclassified';
        } else if (name == 'Polygon' || name == 'Square') {
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
    if (popup()) return false;
    drawObj.removeDrawFeature();
    shapeObj.removeCreate();
    isClick = false;
    shapeObj.addCreate(name, function (e) {
        e = e.getGeometry().getCoordinates()[0].map(function (res) {
            return mymap.reTransform(res, false);
        });
        var coord = e[0];
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
    if (popup()) return false;
    drawObj.removeDrawFeature();
    shapeObj.removeCreate();
    isClick = false;
    drawObj.addDrawFeature(name, function (e) {
        var coord = e;
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
'use strict';

/***********************
 * 所有事件处理  // 功能操作栏
 * All event handling
 ***********************/

$(function () {
    var stateUp = false;
    $('.igis_takeup').click(function () {
        if (!stateUp) {
            $('.igis_btn_list').slideUp();
            $(this).addClass('trans');
            stateUp = true;
        } else {
            $('.igis_btn_list').slideDown();
            $(this).removeClass('trans');
            stateUp = false;
        }
    });

    $('#openNewLayer').on('change', function () {
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function () {
            var oName = file.name.split('.')[0];
            var oType = JSON.parse(this.result).geoType;

            if (!oType) {
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
        };
    });

    $('#saveLayerType').on('click', function () {
        var name = $('#layerName').val();
        var type = $('#layerType').val();
        if (!name) return false;
        saveLayerType({
            name: name,
            type: type
        });
    });

    $('#saveService').on('click', function () {
        var url = $('#serviceUrl').val();
        if (!url) return false;
        var inputContent = $('#mapCenter').val() ? $('#mapCenter').val() : setCenter;
        var center = JSON.parse($('#mapCenter').val());
        var isArray = Object.prototype.toString.call(center) == '[object Array]';
        if (!center || !isArray) center = setCenter;
        $('#closeService').click();
        changeMapService(url, center);
    });

    $('#getGeojson').on('click', 'input[type="checkbox"]', function () {
        var geoName = $(this).attr('id');
        for (var i = 0; i < $('#getGeojson > div').length; i++) {
            var stat1 = $($($('#getGeojson > div')[i]).children('input')[0]).prop('checked');
            var stat2 = $($($('#getGeojson > div')[i]).children('input')[1]).prop('checked');
            if (stat1 && stat2) {
                $('#select_type_box2').fadeIn();
                break;
            } else {
                $('#select_type_box2').fadeOut();
            }
        }
        if ($(this).prop('checked') == true) {
            newFeatures(geoName);
        } else {
            mymap.removeLayer(layerObj[geoName]);
        }
    });

    $('#getGeojson').on('click', 'input[type = "radio"][name="layer"]', function () {
        currLayerObj = layerObj[$(this).val()];
        currLayerId = $(this).val();
        currLayerType = $(this).attr('layerType');
        $('#addFea > img').hide();
        if ($(this).attr('layerType') == 'polygon') {
            $('#addFea > img.plane').show();
        } else if ($(this).attr('layerType') == 'line') {
            $('#addFea > img.lines').show();
        } else {
            $('#addFea > img.dot').show();
        }
        if (!$('#' + currLayerId).prop('checked')) {
            $('#' + currLayerId).prop('checked', true);
            newFeatures(currLayerId);
        }
        $('#select_type_box2').fadeIn();
        switchStatus('telescopic');
        switchStatus('modify');
        switchStatus('berth');
        berthState = false;
        if (drawObj) drawObj.removeDrawFeature();
        isClick = true;
        if (shapeObj) shapeObj.removeCreate();
        isClick = true;
        drawObj = new iGis.maptools.DrawFeature({
            gisMapObj: mymap,
            isSnap: berthState,
            snapLayer: currLayerObj
        });
    });

    $('#getGeojson').on('click', '.deleteFeature', function () {
        var name = $(this).attr('name');
        var type = $(this).attr('type');
        if (Object.keys(layerObj).length) {
            mymap.removeLayer(layerObj[name]);
        }
        delete layerJsonData[name];
        $(this).parent().remove();
    });

    $('input[type = "radio"][name="layerSel"]').on('click', function () {
        changeLayer($(this).val());
    });

    $('#pop-close, #fun4').on('click', function () {
        offAttr();
    });

    $('#fun5').on('click', function () {
        mymap.removeLayer(layerObj[currLayerId]);
        var currId = $(this).parent().find('input[type="hidden"]').val();
        var attrObj = {};

        for (var i = 0; i < $('#longitude li').length; i++) {
            var key = $($('#longitude li')[i]).children('.attr-label').val();
            var value = $($('#longitude li')[i]).children('.attr-value').val();
            if (!key && !value || !key) {
                continue;
            } else {
                attrObj[key] = value;
            }
        }

        if (attrObj.hasOwnProperty("icon") && currLayerType == 'point' && attrObj.icon) {
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

        if (sel_type == 'part' && !selPopupType) {
            layerJsonData[currLayerId].features.forEach(function (v) {
                if (v.id == currId) {
                    v.properties = attrObj;
                }
            });
            console.info('保存零件属性：', layerJsonData[currLayerId]);
        } else if (sel_type == 'all' && !selPopupType) {
            geojsonObject.features[0].properties = attrObj;
            console.info('保存整体属性：', layerJsonData[currLayerId]);
        } else if (selPopupType) {
            $.each(attrObj, function (i, objs) {
                var fieldStat = false;
                var fieldName = '';
                var fieldType = '';
                if (!layerJsonData[currLayerId].fieldsInfo) {
                    layerJsonData[currLayerId].fieldsInfo = [];
                    layerJsonData[currLayerId].srid = '4326';
                    layerJsonData[currLayerId].geoType = currLayerType;
                }
                if (!layerJsonData[currLayerId].fieldsInfo.length) {
                    layerJsonData[currLayerId].fieldsInfo.push({
                        fieldName: i,
                        fieldType: !objs ? 'String' : isNaN(objs) ? 'String' : 'double'
                    });
                } else {
                    for (var j = 0; j < layerJsonData[currLayerId].fieldsInfo.length; j++) {
                        if (layerJsonData[currLayerId].fieldsInfo[j].fieldName == i) {
                            fieldStat = false;
                            break;
                        } else {
                            fieldStat = true;
                        }
                    }
                    if (fieldStat) {
                        layerJsonData[currLayerId].fieldsInfo.push({
                            fieldName: i,
                            fieldType: !objs ? 'String' : isNaN(objs) ? 'String' : 'double'
                        });
                    }
                }
            });
            layerJsonData[currLayerId].features.push(selPopupType);
            layerJsonData[currLayerId].features.forEach(function (v) {
                if (v.id == currId) {
                    v.properties = attrObj;
                }
            });
            console.info('新添零件属性：', layerJsonData[currLayerId]);
        }
        newFeatures(currLayerId);
        if (editObj) {
            editObj.removeEdit();
            switchStatus('telescopic');
            switchStatus('modify');
        }
        offAttr();
    });

    $('#fun6').on('click', function () {
        addAttr();
    });

    $('#fun7').on('click', function () {
        var currId = $(this).parent().find('input[type="hidden"]').val();
        offAttr();
        currLayerObj.removeFeatureById(currId);
        layerJsonData[currLayerId].features.splice(layerJsonData[currLayerId].features.findIndex(function (item) {
            return item.id == currId;
        }), 1);
    });

    $('#addFea img').on('click', function () {
        markerTips.setPosition(undefined);
        if ($(this).attr('id') == 'addpoint') {
            var type = 'Point';
            add_newIcon(type);
        } else if ($(this).attr('id') == 'addline') {
            var _type = 'LineString';
            startDraw(_type);
        } else if ($(this).attr('id') == 'addpolygon') {
            var _type2 = 'Square';
            startDraw(_type2);
        } else if ($(this).attr('id') == 'addCircle') {
            var _type3 = {
                sides: 0
            };
            add_shape(_type3);
        } else if ($(this).attr('id') == 'addThree') {
            var _type4 = {
                sides: 3
            };
            add_shape(_type4);
        } else if ($(this).attr('id') == 'addFive') {
            var _type5 = {
                sides: 5
            };
            add_shape(_type5);
        } else if ($(this).attr('id') == 'addSix') {
            var _type6 = {
                sides: 6
            };
            add_shape(_type6);
        } else if ($(this).attr('id') == 'addSeven') {
            var _type7 = {
                sides: 7
            };
            add_shape(_type7);
        } else if ($(this).attr('id') == 'addsquare') {
            var _type8 = 'Polygon';
            startDraw(_type8);
        }
    });

    $('#saveFea').on('click', function () {
        if (popup()) return false;
        var featureDataSave = JSON.stringify(layerJsonData[currLayerId]);
        var blob = new Blob([featureDataSave], {
            type: ""
        });
        saveAs(blob, currLayerId + '.geojson');
    });

    $('#changeMap').on('click', function () {
        $('#changeService,.popup-layer').fadeIn();
    });

    $('#addNewLayer').on('click', function () {
        $('#glassLayer,.popup-layer').fadeIn();
    });

    $('#closeLayerType,#markerImg-close,#closeService').on('click', function () {
        $('#glassLayer,#markerImg,#changeService,.popup-layer').fadeOut();
    });

    $('#longitude').on('click', '.new-show-img, .new-point-icon', function () {
        $('.markerImg-center').html('');
        var name = $(this)[0].classList[1];
        var jsonName = '';

        if (name == 'new-point-icon') {
            jsonName = 'iconImage';
        } else if (name == 'new-show-img') {
            jsonName = 'polygonImage';
        }

        $.getJSON('json/' + jsonName + '.json', function (data) {
            data.forEach(function (val, key) {
                $('.markerImg-center').append('<img src="' + pathUrl + val.img + '">');
            });
        });

        $('#markerImg,.popup-layer').fadeIn();
    });

    $('#longitude').on('change', 'li select.attr-value', function () {
        if ($('#longitude select.attr-value').val() == 'color') {
            $('.poly-src').hide();
            $('.poly-fillColor').show();
        } else {
            $('.poly-fillColor').hide();
            $('.poly-src').show();
        }
    });

    $('#markerImg').on('click', '.markerImg-center > img', function () {
        var src = $(this).attr('src');
        $('#longitude .new-show-img').val(src.substr(src.indexOf('/image/safePark/bgImg/')));
        $('#longitude .new-point-icon').val(src.substr(src.indexOf('/image/safePark/icon/')));
        $('#markerImg,.popup-layer').fadeOut();
    });

    $('#editSubmit').on('click', function () {
        var coor = [];
        var lon = $('#editLongitude').val();
        var lat = $('#editLatitude').val();
        if (!lon || !lat) {
            if (popup('请输入经纬度后重新确定！')) return false;
        } else {
            coor[0] = JSON.parse(lon);
            coor[1] = JSON.parse(lat);
        }
        console.log(coor);
        mymap.setMapCenter(coor);
    });

    switchEvent("#telescopic", function () {
        if (popup()) {
            switchStatus('telescopic');
            return false;
        }
        feature_select($('input[type = "radio"][name="layerSel"]:checked').val());
    }, function () {
        if (popup()) return false;
        stop_select();
    });

    switchEvent("#modify", function () {
        if (popup()) {
            switchStatus('modify');
            return false;
        }
        isClick = false;
        modify_select();
    }, function () {
        if (popup()) return false;
        isClick = true;
        stop_modify();
    });

    switchEvent("#berth", function () {
        offAttr();
        if (popup()) {
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
    }, function () {
        offAttr();
        if (popup()) return false;
        berthState = false;
        drawObj = new iGis.maptools.DrawFeature({
            gisMapObj: mymap,
            isSnap: berthState,
            snapLayer: currLayerObj
        });
    });
});
'use strict';

/*
 * 所有公用算法
 * All common algorithms
 */

function multiFeature(res, oType, oName) {
    var cachaNewFeature = [];
    res.map(function (value, key) {
        if (!value.id) {
            value.id = key;
        }
        if (oType == 'polygon') {
            if (value.geometry.type == 'Polygon') {
                setCenter = value.geometry.coordinates[0][0];
            } else if (value.geometry.type == 'MultiPolygon') {
                setCenter = value.geometry.coordinates[0][0][0];
                if (value.geometry.coordinates.length == 1) {
                    value.geometry.coordinates = value.geometry.coordinates[0];
                } else if (value.geometry.coordinates.length > 1) {
                    var cachaChangeGeometryCoord = JSON.parse(JSON.stringify(value.geometry.coordinates));
                    res.splice(key, 1);
                    cachaChangeGeometryCoord.map(function (item, inde) {
                        var cachaChangeObjData = JSON.parse(JSON.stringify(value));
                        cachaChangeObjData.id = cachaChangeObjData.id + '' + inde;
                        cachaChangeObjData.geometry.coordinates = item;
                        cachaChangeObjData.properties.currOperateFeatures = oName;
                        cachaChangeObjData.geometry.type = 'Polygon';
                        if (inde > 0) {
                            cachaNewFeature.push(cachaChangeObjData);
                        } else {
                            res.splice(key + inde, 0, cachaChangeObjData);
                        }
                    });
                }
            }
            value.properties.currOperateFeatures = oName;
            value.geometry.type = 'Polygon';
        } else if (oType == 'line') {
            if (value.geometry.type == 'LineString') {
                setCenter = value.geometry.coordinates[0];
            } else if (value.geometry.type == 'MultiLineString') {
                setCenter = value.geometry.coordinates[0][0];
                if (value.geometry.coordinates.length == 1) {
                    value.geometry.coordinates = value.geometry.coordinates[0];
                } else if (value.geometry.coordinates.length > 1) {
                    var cachaChangeGeometryCoord = JSON.parse(JSON.stringify(value.geometry.coordinates));
                    res.splice(key, 1);
                    cachaChangeGeometryCoord.map(function (item, inde) {
                        var cachaChangeObjData = JSON.parse(JSON.stringify(value));
                        cachaChangeObjData.id = cachaChangeObjData.id + '' + inde;
                        cachaChangeObjData.geometry.coordinates = item;
                        cachaChangeObjData.properties.currOperateFeatures = oName;
                        cachaChangeObjData.geometry.type = 'LineString';
                        cachaChangeObjData.properties.igis_id = cachaChangeObjData.id;
                        if (inde > 0) {
                            cachaNewFeature.push(cachaChangeObjData);
                        } else {
                            res.splice(key + inde, 0, cachaChangeObjData);
                        }
                    });
                }
            }
            value.properties.currOperateFeatures = oName;
            value.geometry.type = 'LineString';
        } else if (oType == 'point') {
            setCenter = value.geometry.coordinates;
            if (value.properties.icon) {
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
                };
            }
            if (Object.prototype.toString.call(value.properties.display) != '[object Array]' && value.properties.display) {
                var displays = [];
                value.properties.display.split(',').forEach(function (k) {
                    displays.push(Number(i));
                });
                value.properties.display = displays;
            }
            value.properties.currOperateFeatures = oName;
            value.geometry.type = 'Point';
        }
    });
    return res.concat(cachaNewFeature);
}
