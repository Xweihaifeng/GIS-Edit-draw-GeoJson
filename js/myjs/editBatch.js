/*
 * 批量处理部分
 * Batch processing part
 */

function batchFeature() {
    markerTips.setPosition(popupSaveData.cp);
    $('#fun5, #fun7').hide();
    if(currLayerType == 'point') {
        var template = "<li><input type='text' value='name' class='attr-label'><input type='text' value='newPoint' class='attr-value'></li>";
        template += "<li><input type='text' value='height' class='attr-label'><input type='text' value='0' class='attr-value'></li>";
        template += "<li><input type='text' value='icon' class='attr-label'><input type='text' value='' class='attr-value new-point-icon'></li>";
        template += "<li><input type='text' value='currOperateFeatures' class='attr-label' readonly><input type='text' value='" + currLayerId + "' class='attr-value' readonly></li>"
        document.getElementById('longitude').innerHTML = template;
    } else if(currLayerType == 'line') {
        var template = "<li><input type='text' value='name' class='attr-label'><input type='text' value='newLine' class='attr-value'></li>";
        template += "<li><input type='text' value='height' class='attr-label'><input type='text' value='0' class='attr-value'></li>";
        template += "<li><input type='text' value='currOperateFeatures' class='attr-label' readonly><input type='text' value='" + currLayerId + "' class='attr-value' readonly></li>"
        document.getElementById('longitude').innerHTML = template;
    } else if(currLayerType == 'polygon') {
        var template = "<li><input type='text' value='name' class='attr-label'><input type='text' value='newPolygon' class='attr-value'></li>";
        template += "<li><input type='text' value='height' class='attr-label'><input type='text' value='0' class='attr-value'></li>";
        template += "<li><input type='text' value='currOperateFeatures' class='attr-label' readonly><input type='text' value='" + currLayerId + "' class='attr-value' readonly></li>"
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
            palette: [
                ["red", "rgba(0, 0, 0, 0)", "rgb(255, 255, 255)"]
            ]
        });
    }
}

function startDrawFeature(name) {
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
            batchCenter = coord = e;
            template.properties.cp = e;
            template.properties.icon = '';
        } else if(name == 'LineString') {
            batchCenter = coord = e[0];
            template.properties.cp = e[0];
            template.properties.igis_id = template.id;
            template.properties.fclass = 'unclassified';
        } else if(name == 'Polygon' || name == 'Square') {
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

$(function() {
    var batchState = false;
    $('#batchAddFeature').on('click', function() {
        markerTips.setPosition(undefined);
        $('#fun4, #fun6, #fun8').show();
        if(popup()) return false;
        if(batchState) {
            batchFeature();
        } else {
            batchAddFeature = [];
            $('.igis_btn_list').addClass('cover_layer');
            $(this).html('<img src="img/igis_fea_batch.png" title="批量添加">停止添加');

            isClick = false;
            if(currLayerType == 'point') {
                startDrawFeature('Point');
            } else if(currLayerType == 'line') {
                startDrawFeature('LineString');
            } else if(currLayerType == 'polygon') {
                startDrawFeature('Polygon');
            }
        }
        batchState = !batchState;
    })

    $('#fun8').on('click', function() {
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
            attrObj.property = iconSaveData;
            attrObj.property.label = attrObj.name;
            attrObj.property.src = pathUrl + attrObj.icon;
            attrObj.display = zoomRange;
        }

        var submitBatchFeature = [];
        batchAddFeature.forEach(function(value, key) {
            value.properties = $.extend(true, value.properties, attrObj);
        })

        $('.igis_btn_list').removeClass('cover_layer');
        $('#batchAddFeature').html('<img src="img/igis_fea_batch.png" title="批量添加">批量添加');

        isClick = true;
        layerJsonData[currLayerId].features = layerJsonData[currLayerId].features.concat(batchAddFeature);
        mymap.removeLayer(layerObj[currLayerId]);
        newFeatures(currLayerId);
        drawObj.removeDrawFeature();
        if(editObj) {
            editObj.removeEdit();
            switchStatus('telescopic');
            switchStatus('modify');
            switchStatus('berth');
        }

        markerTips.setPosition(undefined);
        $('#fun8').hide();
    })
})