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
var pathService = '/WMSServices/loadStdout?serviceName=gisserver_wms_shape_xietongchuangxin_1'

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
var changeMapService = function(url, center) {
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

var popup = function(contents) {
    var stat = false;
    if(!contents) {
        contents = '请正确步骤后操作：<br />（1）、先选择显示图层；<br />（2）、再选择当前操作图层！';
    }
    $('#popupBox').html('<div>' + contents + '</div>');
    for(var i = 0; i < $('#getGeojson > div').length; i++) {
        var stat1 = $($($('#getGeojson > div')[i]).children('input')[0]).prop('checked');
        var stat2 = $($($('#getGeojson > div')[i]).children('input')[1]).prop('checked');
        if(stat1 && stat2) {
            $('#popupBox').html('');
            stat = false;
            break;
        } else {
            stat = true;
        }
    }
    if(stat) {
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

mymap.addCustomClickEvent(function(e) {
    // markerTips.setPosition(undefined);
});