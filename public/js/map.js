//const { delimiter } = require("ejs");

var map,map_visiere, geojson, featureOverlay, overlays,overlays_visiere, style;
var selected, features, layer_name, layerControl;
var content;
var selectedFeature;
var declencheur=0;
let id;
let dn;

var view = new ol.View({
    projection: 'EPSG:4326',
    center: [-5.9394, 6.1310],
    zoom: 9,

});
var view_visiere = new ol.View({
    projection: 'EPSG:4326',
    center: [-5.8394, 6.0310],
    zoom: 7,

});
var view_ov = new ol.View({
    projection: 'EPSG:4326',
    center: [-5.9394, 6.1310],
    zoom: 9,
});


var base_maps = new ol.layer.Group({
    'title': 'Cartes de fond',
    layers: [
        new ol.layer.Tile({
            title: 'Satellite',
            type: 'base',
            visible: true,
            source: new ol.source.XYZ({
                attributions: ['Powered by Esri',
                    'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
                ],
                attributionsCollapsible: false,
                url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                maxZoom: 23
            })
        })
    ]
});

var base_maps_visiere = new ol.layer.Group({
    'title': 'Cartes de fond',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM(),
            type: 'base',
            title: 'OSM',
        })
    ]
});

overlays = new ol.layer.Group({
    'title': 'Donnees',
    layers: [] 
});

overlays_visiere = new ol.layer.Group({
    'title': 'Donnees',
    layers: [] 
});

var OSM = new ol.layer.Tile({
    source: new ol.source.OSM(),
    type: 'base',
    title: 'OSM',
});
let iterateur = [];
/*$(document).ready(()=>{
    document.getElementById("stats_stats").style.display='none';
    document.getElementById("map").style.display='none';
    document.getElementById("particles-js").style.display='inline-block';
})*/

//Visiere
$(document).ready(()=>{

    //Fonction d'envoie de formulaire

    

    style_contour_tene = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'green'
        }),
        
        stroke: new ol.style.Stroke({
            color: 'red',
            width: 2
        }),

        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: 'cyan'
            })
        }),
        text: new ol.style.Text({
            font: 'bold 15px nunito',
            text:'Tene',
            fill: new ol.style.Fill({
                color: 'black'
            })
        })
    });
    geojson1 = new ol.layer.Vector({
        title:`Contour Foret classee Tene`,
        //title: '<h5>' + value_crop+' '+ value_param +' '+ value_seas+' '+value_level+'</h5>',
        source: new ol.source.Vector({
            url: `/json/gagnoa_limite.geojson`,
            format: new ol.format.GeoJSON()
        }),
        style: style_contour_tene
    });
    //console.log(forets_cl[i]);
    //overlays_visiere.getLayers().push(geojson1);
    map_visiere.addLayer(geojson1);
    style_contour_s = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'green'
        }),
        
        stroke: new ol.style.Stroke({
            color: 'black',
            width: 0.5
        }),

        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: 'cyan'
            })
        }),
        text: new ol.style.Text({
            font: 'bold 20px nunito',
            //text:'Sangoue',
            fill: new ol.style.Fill({
                color: 'white'
            })
        })
    });
    geojson2 = new ol.layer.Vector({
        //title:`Contour Foret classee Sangoue`,
        //title: '<h5>' + value_crop+' '+ value_param +' '+ value_seas+' '+value_level+'</h5>',
        source: new ol.source.Vector({
            url: `/json/forets_gag.geojson`,
            format: new ol.format.GeoJSON()
        }),
        style: function (feature){
            style_contour_s.getText().setText(feature.get('FORET'));
            style_contour_s.getFill().setColor('green');
            return style_contour_s;
        }
    });
    //console.log(forets_cl[i]);
    //overlays_visiere.getLayers().push(geojson2);
    map_visiere.addLayer(geojson2);
    
    map_visiere.on('singleclick',expo);
});
function post(path,method='post',params,key) {

    const form = document.createElement('form');
    form.method = method;
    form.action = path;
  
    //for (const key in params) {
      //if (params.hasOwnProperty(key)) {
        const hiddenField = document.createElement('input');
        hiddenField.type = 'checkbox';
        hiddenField.name = key+params;
        hiddenField.value = params;
        hiddenField.checked=true;
        form.appendChild(hiddenField);
     // }
    //}
    document.body.appendChild(form);
    form.submit();
  }

function expo(evt){
    map_visiere.removeLayer(geojson2);
    style_contour_s = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'green'
        }),
        
        stroke: new ol.style.Stroke({
            color: 'black',
            width: 0.5
        }),

        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: 'cyan'
            })
        }),
        text: new ol.style.Text({
            font: 'bold 15px nunito',
            //text:'Sangoue',
            fill: new ol.style.Fill({
                color: 'black'
            })
        })
    });
    geojson2 = new ol.layer.Vector({
        //title:`Contour Foret classee Sangoue`,
        //title: '<h5>' + value_crop+' '+ value_param +' '+ value_seas+' '+value_level+'</h5>',
        source: new ol.source.Vector({
            url: `/json/forets_gag.geojson`,
            format: new ol.format.GeoJSON()
        }),
        style: function (feature){
            style_contour_s.getText().setText(feature.get('FORET'));
            style_contour_s.getFill().setColor('green');
            return style_contour_s;
        }
    });
    //console.log(forets_cl[i]);
    //overlays_visiere.getLayers().push(geojson2);
    map_visiere.addLayer(geojson2);
    setTimeout(()=>choix(evt),100)
    
    
    
    
}

function choix(evt){
    
    var feature = map_visiere.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
            return feature;
            
        });
        
        style_foret = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'purple'
            }),
            
            stroke: new ol.style.Stroke({
                color: 'black',
                width: 0.5
            }),
    
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: 'cyan'
                })
            }),
            text: new ol.style.Text({
                font: 'bold 10px nunito',
                text:feature.get('FORET'),
                fill: new ol.style.Fill({
                    color: 'black'
                })
            })
        });
    post('/dashboard/00000',method='post',params=feature.get('FORET'),key='ugf_');
    //feature.setStyle(style_foret)
    
    console.log(feature.get('FORET'));
}


$(document).ready(()=>{
    style_contour_tene = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(236, 230, 217, 0.2)'
        }),
        
        stroke: new ol.style.Stroke({
            color: 'black',
            width: 0.5
        }),

        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: 'cyan'
            })
        }),
        text: new ol.style.Text({
            font: 'bold 15px nunito',
            text:'Tene',
            fill: new ol.style.Fill({
                color: 'black'
            })
        })
    });
    geojson3 = new ol.layer.Vector({
        title:`Contour Foret classee Tene`,
        //title: '<h5>' + value_crop+' '+ value_param +' '+ value_seas+' '+value_level+'</h5>',
        source: new ol.source.Vector({
            url: `/json/fc_gagnoa_tene.geojson`,
            format: new ol.format.GeoJSON()
        }),
        style: style_contour_tene
    });
    //console.log(forets_cl[i]);
    overlays.getLayers().push(geojson3);
    style_contour_sangoue = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(236, 230, 217, 0.2)'
        }),
        
        stroke: new ol.style.Stroke({
            color: 'black',
            width: 0.5
        }),

        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: 'cyan'
            })
        }),
        text: new ol.style.Text({
            font: 'bold 15px nunito',
            text:'Sangoue',
            fill: new ol.style.Fill({
                color: 'black'
            })
        })
    });
    geojson4 = new ol.layer.Vector({
        title:`Contour Foret classee Sangoue`,
        //title: '<h5>' + value_crop+' '+ value_param +' '+ value_seas+' '+value_level+'</h5>',
        source: new ol.source.Vector({
            url: `/json/fc_gagnoa_sangoue.geojson`,
            format: new ol.format.GeoJSON()
        }),
        style: style_contour_sangoue
    });
    //console.log(forets_cl[i]);
    overlays.getLayers().push(geojson4);
})

//---------------------------Choix et Expo V2----------------------------------------


/*function expo2(evt){
    map_visiere.removeLayer(geojson2);
    style_contour_s = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'green'
        }),
        
        stroke: new ol.style.Stroke({
            color: 'black',
            width: 0.5
        }),

        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: 'cyan'
            })
        }),
        text: new ol.style.Text({
            font: 'bold 15px nunito',
            //text:'Sangoue',
            fill: new ol.style.Fill({
                color: 'black'
            })
        })
    });
    geojson2 = new ol.layer.Vector({
        //title:`Contour Foret classee Sangoue`,
        //title: '<h5>' + value_crop+' '+ value_param +' '+ value_seas+' '+value_level+'</h5>',
        source: new ol.source.Vector({
            url: `/json/forets_gag.geojson`,
            format: new ol.format.GeoJSON()
        }),
        style: function (feature){
            style_contour_s.getText().setText(feature.get('FORET'));
            style_contour_s.getFill().setColor('green');
            return style_contour_s;
        }
    });
    //console.log(forets_cl[i]);
    //overlays_visiere.getLayers().push(geojson2);
    map_visiere.addLayer(geojson2);
    setTimeout(()=>choix2(),100)
    
    
    
    
}

function choix2(){
        let style_foret = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'purple'
            }),
            
            stroke: new ol.style.Stroke({
                color: 'black',
                width: 0.5
            }),
    
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: 'cyan'
                })
            }),
            text: new ol.style.Text({
                font: 'bold 10px nunito',
                text:feature.get('FORET'),
                fill: new ol.style.Fill({
                    color: 'black'
                })
            })
        });
    $.ajax({
        url : 'forets_gag.geojson',
        success :(data)=>{
            for (var el = 0; el<data.features.length;el++){
                if(data.features[el].properties['FORET']==nom_donnees[0]){
                    data.features[el].setStyle(style_foret);
                }
            }
        }
    })
    //feature.setStyle(style_foret)
    
    //console.log(feature.get('FORET'));
}*/

//-----------------------------------------------------------------------------------
//var url_x = `/elements/element`;
//url_x.onchange
var resultat_recent = ''
nom_donnees=[];
setInterval(()=>{
    
    $.ajax({
        url: `/elements/token`,
        //dataType: "json",
        success: function(data) {
            var forets_cl = data;
            console.log("donnee = "+forets_cl);
            style_base = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(37, 150, 190, 0.5)'
                }),
                
                stroke: new ol.style.Stroke({
                    color: 'black',
                    width: 1
                }),
        
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: 'cyan'
                    })
                }),
                text: new ol.style.Text({
                    font: 'bold 15px serif',
                    fill: new ol.style.Fill({
                        color: 'yellow'
                    })
                })
            });
            
            if (forets_cl !== resultat_recent) {
                //nom_donnees.length=0;
                /*$.ajax({
                    url : '/elements/element',
                    success :(data)=>{
                        nom_donnees.push(data);
                    }
                });
                expo2();*/
                map.removeLayer(geojson);
                document.getElementById('stats_stats').style.display='none';
                geojson = new ol.layer.Vector({
                    //title:`Parcelles de reboisement`,
                    //title: '<h5>' + value_crop+' '+ value_param +' '+ value_seas+' '+value_level+'</h5>',
                    source: new ol.source.Vector({
                        url: `/elements/elem`,
                        format: new ol.format.GeoJSON()
                    }),
                    style: function (feature) {
                        style_base.getText().setText(feature.get('numero'));
                        return style_base;
                      }
                });
                
                map.addLayer(geojson);
                //overlays.getLayers().push(geojson);
                geojson.getSource().on('addfeature', function() {
                    //alert(geojson.getSource().getExtent());
                    map.getView().fit(
                        geojson.getSource().getExtent(), {
                            duration: 1590,
                            size: map.getSize()
                        }
                    );
                });
                resultat_recent=forets_cl;
                fen_requete_fermer();
                clear_all();                    
                attrs();
                fen_requete();
                
            }
            
        }
    })
    
},1000)



// Send a request




map = new ol.Map({
    target: 'map',
    view: view,
    // overlays: [overlay]
});

map_visiere = new ol.Map({
    target: 'map_visiere',
    view: view_visiere,
    // overlays: [overlay]
});


map.addLayer(base_maps);
map.addLayer(overlays);

map_visiere.addLayer(base_maps_visiere);
map_visiere.addLayer(overlays_visiere);
//overlays.getLayers().push(cGGagnoa);
//overlays.getLayers().push(foretGagnoa);
var popup = new Popup();
map.addOverlay(popup);

var mouse_position = new ol.control.MousePosition();
map.addControl(mouse_position);
var slider = new ol.control.ZoomSlider();
map.addControl(slider);



var zoom_ex = new ol.control.ZoomToExtent({
    extent: [
        65.90, 7.48,
        98.96, 40.30
    ]
});
map.addControl(zoom_ex);

var scale_line = new ol.control.ScaleLine({
    units: 'metric',
    bar: true,
    steps: 6,
    text: true,
    minWidth: 140,
    target: 'scale_bar'
});
map.addControl(scale_line);

layerSwitcher = new ol.control.LayerSwitcher({
    activationMode: 'click',
    startActive: true,
    tipLabel: 'Layers', // Optional label for button
    groupSelectStyle: 'children', // Can be 'children' [default], 'group' or 'none'
    collapseTipLabel: 'Collapse layers',
});
map.addControl(layerSwitcher);

layerSwitcher.renderPanel();

/*var geocoder = new Geocoder('nominatim', {
    provider: 'osm',
    lang: 'en',
    placeholder: 'Search for ...',
    limit: 5,
    debug: false,
    autoComplete: true,
    keepOpen: true
});
map.addControl(geocoder);

geocoder.on('addresschosen', function(evt) {
    //console.info(evt);
    if (popup) {
        popup.hide();
    }
    window.setTimeout(function() {
        popup.show(evt.coordinate, evt.address.formatted);
    }, 3000);
});*/
//custom Scale
function stats_ouvrir(){
    document.getElementById('cadre_stats').style.display='inline-block';
    document.getElementById('cadre_frame').style.display = 'none';
    document.getElementById('map').style.width='43.33%';
    document.getElementById('map').style.left='56.66%';
    document.getElementById('clear_btn').setAttribute('class','flex items-center mr-8  text-black rounded-lg  bg-zinc-200 hover:bg-zinc-500  group');
    document.getElementById('query_panel_btn').setAttribute('class','flex items-center mr-8 text-black rounded-lg  bg-zinc-200 hover:bg-zinc-500  group');
    document.getElementById('info_btn').setAttribute('class','flex items-center mr-8  text-black rounded-lg  bg-zinc-200 hover:bg-zinc-500  group');
    document.getElementById('wms_layers_btn').setAttribute('class','flex items-center  text-black rounded-lg  bg-zinc-200 hover:bg-zinc-500  group');
    document.getElementById('stats').setAttribute('class','hidden');
}      
function stats_fermer(){
    document.getElementById('cadre_stats').style.display='none';
    document.getElementById('map').style.width='83.35%';
    document.getElementById('map').style.left='16.66%';
    document.getElementById('clear_btn').setAttribute('class','flex items-center mr-16 p-2  font-bold text-black rounded-lg  bg-zinc-200 hover:bg-zinc-500  group');
    document.getElementById('query_panel_btn').setAttribute('class','flex items-center mr-16 p-2 font-bold text-black rounded-lg  bg-zinc-200 hover:bg-zinc-500  group');
    document.getElementById('info_btn').setAttribute('class','flex items-center mr-16 p-2 font-bold text-black rounded-lg  bg-zinc-200 hover:bg-zinc-500  group');
    document.getElementById('wms_layers_btn').setAttribute('class','flex items-center mr-16 p-2 font-bold text-black rounded-lg  bg-zinc-200 hover:bg-zinc-500  group');
    document.getElementById('stats').setAttribute('class','"flex items-center mr-16 p-2 font-bold text-black rounded-lg bg-white hover:bg-zinc-500  group"');
}
function fen_requete(){
    $( "#fenetre_requete" ).dialog({
        height: 500,
        width: 900,
        modal:true
    });
    //$( "#fenetre_requete" ).show();
    $("#form2").css({display:"inline-block"});
    $("#form2").css({left:"3%",width:"18%"});
    $("#form3").css({display:"inline-block"});
    $("#form3").css({left:"3%",width:"18%"});
    $("#form4").css({display:"inline-block"});
    $("#form4").css({left:"3%",width:"18%"});
    $("#form5").css({display:"inline-block"});
    $("#form5").css({left:"3%",width:"18%"});
    $("#form6").css({display:"inline-block"});
    $("#form6").css({left:"3%",width:"18%"});
    $("#bouton_lancer_rqt").css({display: "inline-block",left:"78%",top:"5%"});
    $("#bouton_fermer_rqt").css({display: "inline-block",left:"3%",top:"5%"});

    function attrs(){
    $(document).ready(function() {

        //-----------------Attribut du premier critère
        var attributes = document.getElementById("attributes");
        var length = attributes.options.length;
        for (i = length-1; i >= 0; i--) {
            attributes.options[i] = null;
        }
        var value_layer = $(this).val();
        attributes.options[0] = new Option('Select attributes', "");

        //-----------------Attribut du deuxième critère
        var attributes2 = document.getElementById("attributes2");
        var length2 = attributes2.options.length;
        for (i = length2-1; i >= 0; i--) {
            attributes2.options[i] = null;
        }
        var value_layer = $(this).val();
        attributes2.options[0] = new Option('Select attributes', "");

        //-----------------Attribut du troisieme critère
        var attributes3 = document.getElementById("attributes3");
        var length3 = attributes3.options.length;
        for (i = length3-1; i >= 0; i--) {
            attributes3.options[i] = null;
        }
        var value_layer = $(this).val();
        attributes3.options[0] = new Option('Select attributes', "");

        //-----------------Attribut du quatrieme critère
        var attributes4 = document.getElementById("attributes4");
        var length4 = attributes4.options.length;
        for (i = length4-1; i >= 0; i--) {
            attributes4.options[i] = null;
        }
        var value_layer = $(this).val();
        attributes4.options[0] = new Option('Select attributes', "");

        //-----------------Attribut du cinquieme critère
        var attributes5 = document.getElementById("attributes5");
        var length5 = attributes5.options.length;
        for (i = length5-1; i >= 0; i--) {
            attributes5.options[i] = null;
        }
        var value_layer = $(this).val();
        attributes5.options[0] = new Option('Select attributes', "");
    let dert=[];
    $(document).ready(function(){
        $.ajax({
            url: `/json/fichier.geojson`,
            success: function(data) {
                dert.push(data.features[0].properties);
                var select = $('#attributes');
                for (data_single in data.features[0].properties){
                    dert.push(data);
                    if (data_single=='superficie'){
                        select.append(`<option class='ddindent' value='${data_single}'>${data_single}</option>`);
                    }else{
                        select.append(`<option class='ddindent' value='${data_single}'>${data_single}</option>`);
                    }                 
                }
            }
        });
    }); 
    console.log(dert);

    //-----------------------------------------------------------------------------

    $(document).ready(function(){
        $.ajax({
            url: `/json/fichier.geojson`,
            success: function(data) {
                //dert.push(data.features[0].properties);
                var select = $('#attributes2');
                for (data_single in data.features[0].properties){
                    //dert.push(data);
                    if (data_single=='superficie'){
                        select.append(`<option class='ddindent' value='${data_single}'>${data_single}</option>`);
                    }else{
                        select.append(`<option class='ddindent' value='${data_single}'>${data_single}</option>`);
                    }                 
                }
            }
        });
    }); 

      //---------------------------------------------------------------------------

      $(document).ready(function(){
        $.ajax({
            url: `/json/fichier.geojson`,
            success: function(data) {
                //dert.push(data.features[0].properties);
                var select = $('#attributes3');
                for (data_single in data.features[0].properties){
                    //dert.push(data);
                    select.append(`<option class='ddindent' value='${data_single}'>${data_single}</option>`);              
                }
            }
        });
    }); 
      //---------------------------------------------------------------------------

      $(document).ready(function(){
        $.ajax({
            url: `/json/fichier.geojson`,
            success: function(data) {
                //dert.push(data.features[0].properties);
                var select = $('#attributes4');
                for (data_single in data.features[0].properties){
                    //dert.push(data);
                    if (data_single=='superficie'){
                        select.append(`<option class='ddindent' value='${data_single}'>${data_single}</option>`);
                    }else{
                        select.append(`<option class='ddindent' value='${data_single}'>${data_single}</option>`);
                    }                   
                }
            }
        });
    }); 
      //------------------------------------------------------------------------------

      $(document).ready(function(){
        $.ajax({
            url: `/json/fichier.geojson`,
            success: function(data) {
                //dert.push(data.features[0].properties);
                var select = $('#attributes5');
                for (data_single in data.features[0].properties){
                    //dert.push(data);
                    if (data_single=='superficie'){
                        select.append(`<option class='ddindent' value='${data_single}'>${data_single}</option>`);
                    }else{
                        select.append(`<option class='ddindent' value='${data_single}'>${data_single}</option>`);
                    }                
                }
            }
        });
    }); 
})
// operator combo
$(function () {
    $("#attributes" ).change(function () {
        var operator = document.getElementById("operator");
        var length = operator.options.length;
        for (i = length-1; i >= 0; i--) {
            operator.options[i] = null;
        }
        var value_type = $(this).val();
        var value_attribute = $('#attributes option:selected').text();
        operator.options[0] = new Option('Select operateur', "");
        if (value_type == 'superficie' || value_type == 'longitude' || value_type == 'latitude'){
            var operator1 = document.getElementById("operator");
            operator1.options[1] = new Option('Superieur', '>');
            operator1.options[2] = new Option('Inferieur', '<');
            operator1.options[3] = new Option('Egale.', '=');
        }
        else
        {
            var operator1 = document.getElementById("operator");
            operator1.options[1] = new Option('Egale', 'ilike');
            operator1.options[2] = new Option('Different', 'not ilike');
        }
    });
});

//-----------------------------------------------------------------------------------------------------

$(function () {
    $("#attributes2" ).change(function () {
        var operator2 = document.getElementById("operator2");
        var length2 = operator2.options.length2;
        for (i = length2-1; i >= 0; i--) {
            operator2.options[i] = null;
        }
        var value_type2 = $(this).val();
        var value_attribute2 = $('#attributes2 option:selected').text();
        operator2.options[0] = new Option('Select operateur', "");
        if (value_type2 == 'superficie' || value_type2 == 'longitude' || value_type2 == 'latitude'){
            var operator2 = document.getElementById("operator2");
            operator2.options[1] = new Option('Superieur', '>');
            operator2.options[2] = new Option('Inferieur', '<');
            operator2.options[3] = new Option('Egale.', '=');
        }
        else{
            var operator2 = document.getElementById("operator2");
            operator2.options[1] = new Option('Egale', 'ilike');
            operator2.options[2] = new Option('Different', 'not ilike');
        }

    });
});

//-----------------------------------------------------------------------------------------------------

$(function () {
    $("#attributes3" ).change(function () {
        var operator3 = document.getElementById("operator3");
        var length3 = operator3.options.length3;
        for (i = length3-1; i >= 0; i--) {
            operator3.options[i] = null;
        }
        var value_type3 = $(this).val();
        var value_attribute3 = $('#attributes3 option:selected').text();
        operator3.options[0] = new Option('Select operator', "");
        if (value_type3 == 'superficie' || value_type3 == 'longitude' || value_type3 == 'latitude'){
            var operator3 = document.getElementById("operator3");
            operator3.options[1] = new Option('Superieur', '>');
            operator3.options[2] = new Option('Inferieur', '<');
            operator3.options[3] = new Option('Egale.', '=');
        }
        else{
            var operator3 = document.getElementById("operator3");
            operator3.options[1] = new Option('Egale', 'ilike');
            operator3.options[2] = new Option('Different', 'not ilike');
        }
    });
});

//-----------------------------------------------------------------------------------------------------

$(function () {
    $("#attributes4").change(function () {

        var operator4 = document.getElementById("operator4");
        var length4 = operator4.options.length4;
        for (i = length4-1; i >= 0; i--) {
            operator4.options[i] = null;
        }
        var value_type4 = $(this).val();
        var value_attribute4 = $('#attributes4 option:selected').text();
        operator4.options[0] = new Option('Select operator', "");
        if (value_type4 == 'superficie' || value_type4 == 'longitude' || value_type4 == 'latitude'){
            var operator4 = document.getElementById("operator4");
            operator4.options[1] = new Option('Superieur', '>');
            operator4.options[2] = new Option('Inferieur', '<');
            operator4.options[3] = new Option('Egale.', '=');
        }
        else{
            var operator4 = document.getElementById("operator4");
            operator4.options[1] = new Option('Egale', 'ilike');
            operator4.options[2] = new Option('Different', 'not ilike');
        }
    });
});

//-----------------------------------------------------------------------------------------------------

$(function () {
    $("#attributes5" ).change(function () {
        var operator5 = document.getElementById("operator5");
        var length5 = operator5.options.length5;
        for (i = length5-1; i >= 0; i--) {
            operator5.options[i] = null;
        }
        var value_type5 = $(this).val();
        var value_attribute5 = $('#attributes5 option:selected').text();
        operator5.options[0] = new Option('Select operator', "");
        if (value_type5 == 'superficie' || value_type5 == 'longitude' || value_type5 == 'latitude'){
            var operator5 = document.getElementById("operator5");
            operator5.options[1] = new Option('Superieur', '>');
            operator5.options[2] = new Option('Inferieur', '<');
            operator5.options[3] = new Option('Egale.', '=');
        }
        else{
            var operator5 = document.getElementById("operator5");
            operator5.options[1] = new Option('Egale', 'ilike');
            operator5.options[2] = new Option('Different', 'not ilike');
        }
    });
});
$(function(){

    
    // Valeurs d'attributs
   var attribute = document.getElementById("attributes");
   var value_attribute = attribute.options[attribute.selectedIndex].text;
   var attribute2 = document.getElementById("attributes2");
   var value_attribute2 = attribute2.options[attribute2.selectedIndex].text;
   var attribute3 = document.getElementById("attributes3");
   var value_attribute3 = attribute3.options[attribute3.selectedIndex].text;
   var attribute4 = document.getElementById("attributes4");
   var value_attribute4 = attribute4.options[attribute4.selectedIndex].text;
   var attribute5 = document.getElementById("attributes5");
   var value_attribute5 = attribute5.options[attribute5.selectedIndex].text;

   //Valeurs des opérateurs
   var operator = document.getElementById("operator");
   var value_operator = operator.options[operator.selectedIndex].value;
   var operator2 = document.getElementById("operator2");
   var value_operator2 = operator2.options[operator2.selectedIndex].value;
   var operator3 = document.getElementById("operator3");
   var value_operator3 = operator3.options[operator3.selectedIndex].value;
   var operator4 = document.getElementById("operator4");
   var value_operator4 = operator4.options[operator4.selectedIndex].value;
   var operator5 = document.getElementById("operator5");
   var value_operator5 = operator5.options[operator5.selectedIndex].value;

   //Valeurs
   var txt = document.getElementById("value");
   var value_txt = txt.value;
   var txt2 = document.getElementById("value2");
   var value_txt2 = txt2.value;
   var txt3 = document.getElementById("value3");
   var value_txt3 = txt3.value;
   var txt4 = document.getElementById("value4");
   var value_txt4 = txt4.value;
   var txt5 = document.getElementById("value5");
   var value_txt5 = txt5.value;
    console.log(txt);
    console.log(txt.value);

});
}
attrs();



    };
    function fen_requete_fermer(){
        
        $( "#fenetre_requete" ).dialog('close');
        };

function scale() {
    var resolution = map.getView().get('resolution');

    var units = map.getView().getProjection().getUnits();

    var dpi = 25.4 / 0.28;
    var mpu = ol.proj.Units.METERS_PER_UNIT[units];
    //alert(resolution);
    var scale = resolution * mpu * 39.37 * dpi;
    //alert(scale);
    if (scale >= 9500 && scale <= 950000) {
        scale = Math.round(scale / 1000) + "K";
    } else if (scale >= 950000) {
        scale = Math.round(scale / 1000000) + "M";
    } else {
        scale = Math.round(scale);
    }
    //document.getElementById('scale_bar1').innerHTML = "Echelle = 1 : " + scale;
}
scale();

map.getView().on('change:resolution', scale);



var highlightStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'cyan',
    }),
    stroke: new ol.style.Stroke({
        color: 'white',
        width: 4,
    }),
    image: new ol.style.Circle({
        radius: 10,
        fill: new ol.style.Fill({
            color: 'black'
        })
    })
});

// function for finding row in the table when feature selected on map
function findRowNumber(cn1, v1) {

    var table = document.querySelector('#table');
    var rows = table.querySelectorAll("tr");
    var msg = "No such row exist"
    for (i = 1; i < rows.length; i++) {
        var tableData = rows[i].querySelectorAll("td");
        if (tableData[cn1 - 1].textContent == v1) {
            msg = i;
            break;
        }
    }
    return msg;
}



// function for loading query

function query() {

    var url = "/elements/elem";
    setTimeout(()=>{
        $(document).ready(()=>{
            $.ajax({
                url:url,
                success : (data)=>{
                    if(data["features"]==null){
                        fen_requete_fermer();
                        alert("Aucune information trouvée !");
                        clear_all();                    
                        attrs();
                        fen_requete();
                    }else{
                        style_init = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: 'rgba(37, 150, 190, 0.5)'
                            }),
                            
                            stroke: new ol.style.Stroke({
                                color: 'black',
                                width: 0.5
                            }),
                    
                            image: new ol.style.Circle({
                                radius: 7,
                                fill: new ol.style.Fill({
                                    color: 'cyan'
                                })
                            }),
                            text: new ol.style.Text({
                                font: 'bold 15px nunito',
                                fill: new ol.style.Fill({
                                    color: 'black'
                                })
                            })
                        });
                        geojson.setStyle(style_init);
                        
                        $(document).ready(()=>{
                            fen_requete_fermer();
                            document.getElementById("stats_stats").style.display='none';
                            document.getElementById("fenetre_requete").style.display='none';
                            document.getElementById("table_data").style.display='none';
                            //document.getElementById("particles-js").style.display='inline-block';
                            //document.getElementById("fermer_stats").style.display='none';       
                           // document.getElementById('cadre_frame').style.height='68%'; 
                        })
                        setTimeout(function(){
                            //document.getElementById("particles-js").style.display='none';
                            document.getElementById("table_data").style.display='inline-block';
                            //document.getElementById('cadre_stats').style.height='68%';
                            
                        
                    
                        $('#table').empty();
                        /*if (geojson) {
                            map.removeLayer(geojson);
                    
                        }*/
                        if (selectedFeature) {
                            selectedFeature.setStyle();
                            selectedFeature = undefined;
                        }
                        if (vector1) {
                            vector1.getSource().clear();
                            // $('#table').empty();
                        }
                    
                        
                        
                        let labelStyle = new ol.style.Style({
                            text: new ol.style.Text({
                                font: 'bold 20px serif',
                                text: 'here',
                                fill: new ol.style.Fill({
                                    color: 'rgba(255, 0, 0, 1)'
                                })
                            })
                        });
                    
                        style = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: 'blue'           
                            }),
                            
                            stroke: new ol.style.Stroke({
                                color: 'white',
                                width: 2
                            }),
                    
                            image: new ol.style.Circle({
                                radius: 7,
                                fill: new ol.style.Fill({
                                    color: 'cyan'
                                })
                            }),
                            text: new ol.style.Text({
                                font: 'bold 15px serif',
                                fill: new ol.style.Fill({
                                    color: 'white'
                                })
                            })
                        });
                        geojson_select = new ol.layer.Vector({
                            //title:'dfdfd',
                            //title: '<h5>' + value_crop+' '+ value_param +' '+ value_seas+' '+value_level+'</h5>',
                            source: new ol.source.Vector({
                                url: url,
                                format: new ol.format.GeoJSON()
                            }),
                            style: function (feature) {
                                style.getText().setText(feature.get('numero'));
                                return style;
                              }
                        });
                        //geojson.setStyle(style);
                    
                        geojson_select.getSource().on('addfeature', function() {
                            //alert(geojson.getSource().getExtent());
                            map.getView().fit(
                                geojson_select.getSource().getExtent(), {
                                    duration: 1590,
                                    size: map.getSize()
                                }
                            );
                        });
                    
                        //overlays.getLayers().push(geojson_select);
                        map.addLayer(geojson_select);
                    
                        $.getJSON(url, function(data) {
                    
                            var col = [];
                            col.push('id');
                            for (var i = 0; i < data.features.length; i++) {
                                for (var key in data.features[i].properties) {
                    
                    
                                    if (col.indexOf(key) === -1) {
                                        col.push(key);
                                    }
                                }
                            }
                            
                            let donnee_unitaire=[];
                            for (let dnu=0;dnu<data.features.length;dnu++){
                                donnee_unitaire.push(data.features[dnu].properties);
                            }
                            let donnees_csv=json2csv.parse(donnee_unitaire);
                            console.log(donnees_csv);

                            function enreg_csv(nom_fichier,nom_donnee){
                                let element_csv = document.createElement('a');
                                element_csv.setAttribute('href',`data:text/csv;charset:utf-8,${nom_donnee}`);
                                element_csv.setAttribute('download',nom_fichier);
                                element_csv.style.display='none';
                                document.body.appendChild(element_csv);
                                element_csv.click();
                                document.body.removeChild(element_csv);
                            }
                            function exportJsonToExcel() {
                                const workbook = XLSX.utils.book_new();
                                const worksheet = XLSX.utils.json_to_sheet(donnee_unitaire);
                                XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
                                XLSX.writeFile(workbook, "resultat.xlsx");
                            }
                    
                            var table = document.createElement("table");
                            if (table){declencheur=1};
                            table.setAttribute("class", "table table-hover table-striped");
                            table.setAttribute("id", "table");
                    
                            var caption = document.createElement("button");
                            caption.setAttribute("id", "button_enregistrer");
                            caption.style.captionSide = 'top';
                            caption.style.color = 'green';
                            caption.innerHTML = " Télécharcher Excel";
                            table.appendChild(caption);

                            var caption2 = document.createElement("button");
                            caption2.setAttribute("id", "exportExcel");
                            caption2.style.position='absolute';
                            caption2.style.right = '1%';
                            caption2.style.color = 'green';
                            caption2.innerHTML = " Télécharcher Csv";
                            table.appendChild(caption2);

                            caption2.addEventListener('click',()=>{
                                enreg_csv(donnees_csv.csv,donnees_csv);
                            });
                            //const excelHeader = ["id","numero","essence","superficie","partenaire","nom","latitude","longitude","densite"];                              
                            
                    
                            // Event listener for the export button
                            caption.addEventListener("click", exportJsonToExcel);
                            // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.
                    
                            var tr = table.insertRow(-1); // TABLE ROW.
                    
                            for (var i = 0; i < col.length; i++) {
                                var th = document.createElement("th"); // TABLE HEADER.
                                th.innerHTML = col[i];
                                tr.appendChild(th);
                            }
                    
                            // ADD JSON DATA TO THE TABLE AS ROWS.
                            for (var i = 0; i < data.features.length; i++) {
                    
                                tr = table.insertRow(-1);
                    
                                for (var j = 0; j < col.length; j++) {
                                    var tabCell = tr.insertCell(-1);
                                    //if (j == 0) {
                                      //  tabCell.innerHTML = data.features[i]['id'];
                                    //} else {
                                        //alert(data.features[i]['id']);
                                        tabCell.innerHTML = data.features[i].properties[col[j]];
                                        //alert(tabCell.innerHTML);
                                   // }
                                }
                            }
                    
                    
                            // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
                            var divContainer = document.getElementById("table_data");
                            divContainer.innerHTML = "";
                            divContainer.appendChild(table);
                            document.getElementById('map').style.height='68%';
                            //document.getElementById('map').style.width='83.33%';
                            document.getElementById('table_data').style.height = '32%';
                            //document.getElementById('barre_menu').style.height = '8%';
                            //document.getElementById('logo').style.height = '7%';
                            map.updateSize();
                            addRowHandlers();
                    
                        });
                        map.on('singleclick', highlight);
                    },1500)
                    }
                }
            })
        })
    },1000);
    

    
}
// highlight the feature on map and table on map click
function highlight(evt) {
    if (geojson_select){
        if (selectedFeature) {
            selectedFeature.setStyle();
            selectedFeature = undefined;
        }
    
        var feature = map.forEachFeatureAtPixel(evt.pixel,
            function(feature, layer) {
                return feature;
            });
    
        if (feature && feature.getProperties()["id"] != undefined) {
    
    
            var geometry = feature.getGeometry();
            var coord = evt.coordinate;
    
            $(function() {
                $("#table td").each(function() {
                    $(this).parent("tr").css("background-color", "white");
                });
            });
            feature.setStyle(highlightStyle);
            selectedFeature = feature;
            var table = document.getElementById('table');
            var cells = table.getElementsByTagName('td');
            var rows = document.getElementById("table").rows;
            var heads = table.getElementsByTagName('th');
            var col_no;
            for (var i = 0; i < heads.length; i++) {
                // Take each cell
                var head = heads[i];
                //alert(head.innerHTML);
                if (head.innerHTML == 'id') {
                    col_no = i + 1;
                    //alert(col_no);
                }
            }
            var row_no = findRowNumber(col_no, feature.getProperties()["id"]);
            //alert(row_no);
    
            var rows = document.querySelectorAll('#table tr');
    
            rows[row_no].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
    
            $(document).ready(function() {
                $("#table td:nth-child(" + col_no + ")").each(function() {
    
                    if ($(this).text() == feature.getProperties()["id"]) {
                        $(this).parent("tr").css("background-color", "#2157a2");
    
                    }
                });
            });
        } else {
            $(function() {
                $("#table td").each(function() {
                    $(this).parent("tr").css("background-color", "white");
                });
            });
    
        }
    }
    
};

// highlight the feature on map and table on row select in table
function addRowHandlers() {
    var rows = document.getElementById("table").rows;
    var heads = table.getElementsByTagName('th');
    var col_no;
    for (var i = 0; i < heads.length; i++) {
        // Take each cell
        var head = heads[i];
        //alert(head.innerHTML);
        if (head.innerHTML == 'id') {
            col_no = i + 1;
            //alert(col_no);
        }

    }
    for (i = 0; i < rows.length; i++) {



        rows[i].onclick = function() {
            return function() {
                if (selectedFeature) {
                    selectedFeature.setStyle();
                    selectedFeature = undefined;
                }
                $(function() {
                    $("#table td").each(function() {
                        $(this).parent("tr").css("background-color", "white");
                    });
                });
                var cell = this.cells[col_no - 1];
                var id = cell.innerHTML;


                $(document).ready(function() {
                    $("#table td:nth-child(" + col_no + ")").each(function() {
                        if ($(this).text() == id) {
                            $(this).parent("tr").css("background-color", "#2157a2");
                        }
                    });
                })

                var features = geojson.getSource().getFeatures();
                console.log(features[0]);
                for (i = 0; i < features.length; i++) {
                    if (features[i].getProperties()["id"]==id) {
                        
                        //alert(features[i].feature.id);
                        features[i].setStyle(highlightStyle);
                        selectedFeature = features[i];
                        var featureExtent = features[i].getGeometry().getExtent();
                        if (featureExtent) {
                            map.getView().fit(featureExtent, {
                                duration: 1590,
                                size: map.getSize()
                            });
                        }

                    }
                }

                //alert("id:" + id);
            };
        }(rows[i]);
    }
}

function valider1(){
    let gagnoa = document.getElementById("cg_gagnoa");
    /*let nbCg = 10;
    let centresDeGestion = ["Gagnoa","Daloa","Agboville"];
    let jsons = [{"Gagnoa":["Tene","Sangoue","Laouda"]},"Daloa","Agboville"];
    let unitesGestion = ["u1","u2","u3"];
    for (leti=0;i<centresDeGestion.length;i++){
        if(document.getElementById(`${centresDeGestion[i]}`).checked==true){
            for (let j=0;j<jsons[0][centresDeGestion[i]].length;j++){
                document.getElementById(unitesGestion[j]).innerHTML=jsons[0][centresDeGestion[j]];
                document.getElementById(unitesGestion[j]).style.display="inline-bloc";
                document.getElementById(unitesGestion[j]).setAttribute('class',jsons[0][centresDeGestion[j]]);
            }
        }
    }*/
    if (gagnoa.checked===true){
        let ugfs=document.getElementById("frame_c_g2");
        //let ugfs=document.getElementById("ugf_tene");
        //ugfs.innerHTML="UGF KOUA";
    }
};

//list of wms_layers_ in window on click of button

function wms_layers() {
        
    $(function() {

        $("#wms_layers_window").modal({
            backdrop: false
        });
        $("#wms_layers_window").draggable();
        $("#wms_layers_window").modal('show');
        
        
        //$("#frame_c_g").appendTo("#wms_layers_window");
        //$('<tr></tr>').html('<th>Centre de gestion</th><th>U.G.F</th><th>Forêt</th>').appendTo('#table_wms_layers');


    });
}
// function on click of getinfo
function info() {
    if (document.getElementById("info_btn").innerHTML == "☰ ACTIVER INFOS") {
        document.getElementById("info_btn").innerHTML = "☰ DESACTIVER INFOS";
        map.on('singleclick', getinfo);
        }
        else {

        map.un('singleclick', getinfo);
        document.getElementById("info_btn").innerHTML = "☰ ACTIVER INFOS";
        document.getElementById("info_btn").setAttribute("class","flex items-center mr-16 p-2 font-bold text-black rounded-lg  bg-zinc-200 hover:bg-zinc-500  group");
        //document.getElementById('fiche_parcellaire').style.display='none';
        //document.getElementById('fiche_sylvicole').style.display='none';
        //document.getElementById('stats').style.display='none';
        if (popup) {
            popup.hide();
        }
    }
}


var
    container = document.getElementById('popup'),
    //content_element = document.getElementById('popup-content'),
    closer = document.getElementById('popup-closer');

/*closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};*/
var overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    offset: [0, -10]
});
map.addOverlay(overlay);

var fullscreen = new ol.control.FullScreen();
map.addControl(fullscreen);

/*function getinfo(evt){

    
    let container = document.getElementById('popup');
    let content_element = document.getElementById('popup-content');
    let closer = document.getElementById('popup-closer');
    var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
        return feature;
      });
    if (feature) {
        var geometry = feature.getGeometry();
        var coord = geometry.getCoordinates();
        
        var content = '<h3>Bonjour</h3>';
        //content += '<h5>' + feature.get('description') + '</h5>';
        
        //content_element.innerHTML = content;
        //overlay.setPosition(coord);
        popup.show(coord,content);
        
        console.log(feature.getProperties());
    }
};

function getinfos (evt) {

    // Hide existing popup and reset it's offset
    //popup.hide();
    //popup.setOffset([0, 0]);

    // Attempt to find a feature in one of the visible vector layers
    var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        return feature;
    });

    if (feature) {

        var coord = feature.getGeometry().getCoordinates();
        var props = feature.getProperties();
        var info = "<h2><a href='" + props["NUMERO"] + "'>"+ "</a></h2>";
            //info += "<p>" + props.ESSENCE + "</p>";
            //info += "<p>Status: " + props.NUMERO + " " + props.NUMERO + "</p>";
        // Offset the popup so it points at the middle of the marker not the tip
       //popup.setOffset([0, -22]);
       overlay.setPosition(coordinates);
        popup.show(coord, info);

    }

};*/

function fermer_cadre(){
    document.getElementById("cadre_frame").style.display="none";
    document.getElementById("map").style.display="none";
    document.getElementById("map").style.display="inline-block";
    document.getElementById("map").style.left="16.66%";
    document.getElementById("map").style.width="83.33%";
    document.getElementById('clear_btn').setAttribute('class','flex items-center mr-16 p-2  font-bold text-black rounded-lg  bg-zinc-200 hover:bg-zinc-500  group');
    document.getElementById('query_panel_btn').setAttribute('class','flex items-center mr-16 p-2 font-bold text-black rounded-lg  bg-zinc-200 hover:bg-zinc-500  group');
    document.getElementById('info_btn').setAttribute('class','flex items-center mr-16 p-2 font-bold text-black rounded-lg  bg-zinc-200 hover:bg-zinc-500  group');
    document.getElementById('wms_layers_btn').setAttribute('class','flex items-center mr-16 p-2 font-bold text-black rounded-lg  bg-zinc-200 hover:bg-zinc-500  group');
    document.getElementById('stats').setAttribute('class','"flex items-center mr-16 p-2 font-bold text-black rounded-lg bg-white hover:bg-zinc-500  group"');

}
function imprimer_fiche_pr(){
    let wspFrame = document.getElementById('framedis').contentWindow;
    wspFrame.focus();
    wspFrame.print();
}
// getinfo function
function getinfo(evt) {

    //var coordinate = evt.coordinate;
    //var viewResolution = /** @type {number}  (view.getResolution());
/*

    if (popup) {
        popup.hide();
    }
    if (content) {
        content = '';
    }
    if (document.getElementById('map').style.height == '68%'){
        overlays.getLayers().getArray().slice().forEach(layer => {
            var visibility = layer.getVisible();
            console.log(visibility);



           // if (visibility == true) {*/

    var feature = map.forEachFeatureAtPixel(evt.pixel,
    function(feature, layer) {
        return feature;
    });
    if (feature) {

        var geometry = feature.getGeometry();
        var coord = geometry.getCoordinates();
        
        //var content = '<h3>Bonjour</h3>';
        //content += '<h5>' + feature.get('description') + '</h5>';
        
        //content_element.innerHTML = content;
        //overlay.setPosition(coord);
        //popup.show(coord,content);
        
        console.log(feature.getProperties());

                if (document.getElementById("framedis")){
                    function effacer () {
                        //var d = window.parent.document;
                        var frame = document.getElementById('framedis');
                        frame.style.display="none";
                        var frame2 = document.getElementById('cadre_frame');
                        frame2.style.display="none";
                        //frame.parentNode.removeChild(frame);
                        //e.preventDefault();
                    }
                    effacer()
                }

                //document.getElementById("framedis").style.top="8%";
                //document.getElementById("framedis").style.height="92%";
                //var layer_title = layer.get('title');
                
                //if (layer_title!=='gagnoa:Forets Gagnoa'&&layer_title!=='gagnoa:Centre de Gestion Gagnoa'){
                
                /*var wmsSource = new ol.source.ImageWMS({
                    url: 'http://localhost:8080/geoserver/wms',
                    params: {
                        'LAYERS': layer_title
                    },
                    serverType: 'geoserver',
                    crossOrigin: 'anonymous'
                });
                var url = wmsSource.getFeatureInfoUrl(
                    evt.coordinate, viewResolution, 'EPSG:4326', {
                        'INFO_FORMAT': 'text/html'
                    });
                var url1 = wmsSource.getFeatureInfoUrl(
                    evt.coordinate, viewResolution, 'EPSG:4326', {
                        'INFO_FORMAT': 'application/json'
                    });*/
    
                //assuming you use jquery
                /*$.get(url, function(data) {
    
                    // $("#popup-content").append(data);
                    //document.getElementById('popup-content').innerHTML = '<p>Feature Info</p><code>' + data + '</code>';
                    content += data;
                    // overlay.setPosition(coordinate);
                    popup.show(evt.coordinate, content);
                    //console.log(data.features[0].properties);
                    //document.getElementById('fiche_parcellaire').style.display='inline-block';
                    //document.getElementById('fiche_sylvicole').style.display='inline-block';
    
    
                });*/
                /*$.get('js/fichier.geojson', function(data) {
                    
                    document.cookie = `ide =${data.features[0].properties.numero};expires = Fri, 11 oct 2024 12:30 UTC; path=/`;
                    let mot = "ide=";
                    let tab = document.cookie.split(";");
                    let id_id;
                    for (let i=0;i<tab.length;i++){
                        let c = tab[i];
                        while (c.charAt("0")==' '){
                            c = c.substring(1,c.length);
                        }
                        if (c.indexOf(mot)==0){
                            id_id = c.substring(mot.length,c.length);
                        }
                    }
                    document.querySelector('#fiche_parcellaire').addEventListener('click', function () {
                        let cadre = document.getElementById('cadre_frame');
                        cadre.style.display='inline-block';
                        cadre.style.top="8%";
                        cadre.style.height="89%";
                        let cadre2 = document.getElementById('framedis');
                        cadre2.style.display='inline-block';
                        cadre2.style.top='1.5%';
                        let printit = document.getElementById('imprimer');
                        printit.style.display= "inline-block";
                        let close = document.getElementById('fermer');
                        close.style.display= "inline-block";
                    });
                
                    // $("#popup-content").append(data);*/
                    //document.getElementById('popup-content').innerHTML = '<p>Feature Info</p><code>' + data + '</code>';
                    //data = document.getElementById('table11');
                    /*content+= `<table id='table_popup' style=""><tr><th>Numero</th><th>Densite</th><th>Longitude</th><th>Latitude</th></tr><tr><td>${feature.get('NUMERO')}</td><td>${feature.get('DENSITE')}</td>\n
                    <td>${feature.get('LONGITUDE')}</td><td>${feature.get('LATITUDE')}</td></tr></table>`;*/
                    /*content = '<h5>' + feature.get('NUMERO') + '</h5>';
                    content += '<h5>' + feature.get('NUMERO') + '</h5>';
                    content += '<h5>' + feature.get('NUMERO') + '</h5>';
                    content += '<h5>' + feature.get('NUMERO') + '</h5>';
                    content += '<h5>' + feature.get('NUMERO') + '</h5>';*/
                    // overlay.setPosition(coordinate);
                    content=`<table style="width:100%;"><tr><th><div></div></th><th><div></div></th></tr></table><br>`;
                    content+=`<table style="width:100%;"><tr><th><div></div></th><th><div></div></th></tr></table>`;
                    content+=`<table style="border-radius:2px;width:100%;background-color:#2157a2;color:white;"><tr><th ><div>Parcelle ${feature.get('numero')}</div></th></tr></table>`;
                    content+=`<table style="width:100%;"><tr><th><div></div></th><th><div></div></th></tr></table>`;
                    content+=`<table style="width:100%;"><tr><th style="color:green;">Forêt</th><td style="text-align: left;color=black;">${feature.get('nom')}</td></tr>
                    
                    <tr display:table-row;><th style="color:green;">Longitude</th><td style="text-align: left;display:table-cell; color=black;">${feature.get('longitude')}</td></tr>
                    
                    <tr><th><div></div></th><th><div></div></th></tr>
                    
                    <tr display:table-row;><th style="color:green;">Latitude</th><td style="text-align: left;display:table-cell;color=black;">${feature.get('latitude')}</td></tr>
                    <tr><th><div></div></th><th><div></div></th></tr>
                    
                    <tr display:table-row;><th style="color:green;">Essence</th><td style="text-align: left;display:table-cell;color=black;">${feature.get('essence')}</td></tr>
                    <tr><th><div></div></th><th><div></div></th></tr>
                    
                    <tr display:table-row;><th style="color:green;">Densite</th><td style="text-align: left;display:table-cell;color=black;">${feature.get('densite')} Pied/ha</td></tr>
                    <tr><th><div></div></th><th><div></div></th></tr>
                    
                    <tr display:table-row;><th style="color:green;">Superficie</th><td style="text-align: left;display:table-cell;color=black;">${feature.get('superficie')} ha</td></tr>
                    <tr><th><div></div></th><th><div></div></th></tr>
                    
                    <tr display:table-row;><th style="color:green;">Partenaire</th><td style="text-align: left;display:table-cell;color=black;">${feature.get('partenaire')}</td></tr>
                    
                    </table>`;
                    console.log(coord);
                    console.log(content);
                    popup.show(evt.coordinate, content);

                    document.cookie = `ide =${feature.get('numero')};expires = Fri, 10 oct 2025 12:30 UTC; path=/`;
                    let mot = "ide=";
                    let tab = document.cookie.split(";");
                    let id_id;
                    for (let i=0;i<tab.length;i++){
                        let c = tab[i];
                        while (c.charAt("0")==' '){
                            c = c.substring(1,c.length);
                        }
                        if (c.indexOf(mot)==0){
                            id_id = c.substring(mot.length,c.length);
                        }
                    }
                    console.log(id_id);
                    
                }}

                    /*console.log(data.features[0].properties);
                    console.log(data.features[0].properties.num);
                    console.log(data.features[0].properties.numéro);
                    console.log(id);
                    let dn = donnees_fictives.json;
                    console.log(dn);
                    dn = JSON.stringify(dn);
                    let informations=[];
                    for (let i = 0; i<dn.length;i++){
                        let element = dn[i];
                        if (element["Parcelle"]==id){
                            informations.push(element);
                        }
                        console.log(element);
                        console.log(informations);
                    }
                    let notreTable = document.getElementById("table1");

                    for (let j=0;j<informations.length;j++){
                        notreTable.innerHTML+=`<tr id="ligne${j}"></tr>`
                        let notreLigne = document.getElementById(`ligne${j}`);
                        for(let i=4;i<informations[0].length;i++){
                            notreLigne.innerHTML += `<td>${i}</td>`;
                        }
                    }*/

                 /*   document.getElementById('fiche_parcellaire').style.display='inline-block';
                    document.getElementById('fiche_sylvicole').style.display='inline-block';
                    //document.getElementById('stats').style.display='inline-block';

                
    
    
                });
            }
                
            }
    
        }
    );
    
    }else{
        overlays.getLayers().getArray().slice().forEach(layer => {
            var visibility = layer.getVisible();
            console.log(visibility);
            if (visibility == true) {
                if (document.getElementById("framedis")){
                    function effacer () {
                        //var d = window.parent.document;
                        var frame = document.getElementById('framedis');
                        frame.style.display="none";
                        var frame2 = document.getElementById('cadre_frame');
                        frame2.style.display="none";
                        //frame.parentNode.removeChild(frame);
                        //e.preventDefault();
                    }
                    console.log(layer_title);
                    effacer()
                }
                var layer_title = layer.get('title');

                if (layer_title!=='gagnoa:Forets Gagnoa'&&layer_title!=='gagnoa:Centre de Gestion Gagnoa'){

                    var wmsSource = new ol.source.Vector({
                    url: 'js/fichier.geojson',

                });
                var url = wmsSource.getFeatureInfoUrl(
                    evt.coordinate, viewResolution, 'EPSG:4326', {
                        'INFO_FORMAT': 'text/html'
                    });
                var url1 = wmsSource.getFeatureInfoUrl(
                    evt.coordinate, viewResolution, 'EPSG:4326', {
                        'INFO_FORMAT': 'application/json'
                    });
    
                //assuming you use jquery
                $.get('js/fichier.geojson', function(data) {

                    
                    //$("#popup-content").append(data);
                    // $("#popup-content").append(data);
                    //document.getElementById('popup-content').innerHTML = '<p>Feature Info</p><code>' + data + '</code>';
                    content += data;
                    // overlay.setPosition(coordinate);
                    popup.show(evt.coordinate, data);
                
                    //console.log(data.features[0].properties);
                    //document.getElementById('fiche_parcellaire').style.display='inline-block';
                    //document.getElementById('fiche_sylvicole').style.display='inline-block';
    
    
                });
                $.get('js/fichier.geojson', function(data) {
                        
                    $("#popup-content").append(data);
                    //document.getElementById('popup-content').innerHTML = '<p>Feature Info</p><code>' + data + '</code>';
                    content += JSON.stringify(data.features[0].properties);

                    //overlays.setPosition(coordinate);
                    popup.show(evt.coordinate, content);
                    console.log(data.features[0].properties);
                    console.log(data);
                    console.log(data.features[0].properties.X+data.features[0].properties.Y)

                    id = data.features[0].properties.numéro;
                    console.log(id);

                    //console.log(dn);
                    //dn = JSON.stringify(dn);
                    
                    document.cookie = `ide =${data.features[0].properties.numéro};expires = Fri, 11 oct 2024 12:30 UTC; path=/`;
                    let mot = "ide=";
                    let tab = document.cookie.split(";");
                    let id_id;
                    for (let i=0;i<tab.length;i++){
                        let c = tab[i];
                        while (c.charAt("0")==' '){
                            c = c.substring(1,c.length);
                        }
                        if (c.indexOf(mot)==0){
                            id_id = c.substring(mot.length,c.length);
                        }
                    }
                    console.log(id_id);


                    //console.log(document.cookie);
                    //document.getElementById('fiche_parcellaire').style.display='inline-block';
                    //document.getElementById('fiche_sylvicole').style.display='inline-block';
                    //document.getElementById('stats').style.display='inline-block';
                });
                }

                
            }else{document.getElementsByClassName('fiche_parcelle').style.display='none';}
        });
    }
}*/

/*document.querySelector("#fiche_parcellaire").addEventListener('click',function(){
    
    let informations=[];
                    
    for (let i = 0; i<dn.length;i++){
        let element = dn[i];
        if (element["Parcelle"]==id){
            informations.push(element);
        }
    }
    console.log(informations);
    
    let notreTable = document.getElementById("table1");
    let parce = document.querySelector("#parcelle"); 
    
    for (let j=0;j<2;j++){
        parce.innerHTML=id;
        let notreLigne = document.getElementById(`ligne${j}`);
        for(let i=4;i<2;i++){
            notreLigne.innerHTML += `<td>${i}</td>`;
        }
    }
});*/

// clear function
function clear_all() {
   
    document.getElementById('map').style.height = '100%';
    document.getElementById('map').style.width = '83.33%';
    document.getElementById('map').style.left = '16.66%';
    document.getElementById('table_data').style.height = '0%';
    document.getElementById('table').style.height = '0%';
    style_base = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(37, 150, 190, 0.5)'
        }),
        
        stroke: new ol.style.Stroke({
            color: 'black',
            width: 1
        }),

        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: 'cyan'
            })
        }),
        text: new ol.style.Text({
            font: 'bold 15px serif',
            fill: new ol.style.Fill({
                color: 'yellow'
            })
        })
    });
    
    map.updateSize();
    $('#table').empty();
    $('#legend').empty();
    if (geojson) {
        geojson_select.getSource().clear();
        map.removeLayer(geojson_select);
        geojson.getSource().clear();
        map.removeLayer(geojson);
        geojson = new ol.layer.Vector({
            title:`Parcelles de reboisement`,
            //title: '<h5>' + value_crop+' '+ value_param +' '+ value_seas+' '+value_level+'</h5>',
            source: new ol.source.Vector({
                url: `/json/fichier.geojson`,
                format: new ol.format.GeoJSON()
            }),
            style: function (feature) {
                style_base.getText().setText(feature.get('numero'));
                return style_base;
              }
        });
        
        map.addLayer(geojson);
        //overlays.getLayers().push(geojson);
        geojson.getSource().on('addfeature', function() {
            //alert(geojson.getSource().getExtent());
            map.getView().fit(
                geojson.getSource().getExtent(), {
                    duration: 1590,
                    size: map.getSize()
                }
            );
        });
    }
    

    if (selectedFeature) {
        selectedFeature.setStyle(style_b());
        selectedFeature = undefined;
    }
    if (popup) {
        popup.hide();
    }
    /*map.getView().fit([-5.9428, 6.1288, -5.9363, 6.1336], {
        duration: 1590,
        size: map.getSize()
    });*/


    //document.getElementById("query_panel_btn").innerHTML = "☰ REQUETES";
   // document.getElementById("query_panel_btn").setAttribute("class", "btn btn-success btn-sm");

    document.getElementById("query_tab").style.width = "0%";
    document.getElementById("map").style.width = "100%";
    document.getElementById("map").style.left = "0%";
    //document.getElementById("query_tab").style.visibility = "hidden";
    document.getElementById('table_data').style.left = '0%';

    //document.getElementById("legend_btn").innerHTML = "☰ VOIR LEGENDE";
    document.getElementById("legend").style.width = "0%";
    document.getElementById("legend").style.visibility = "hidden";
    document.getElementById('legend').style.height = '0%';

    map.un('singleclick', getinfo);
    map.un('singleclick', highlight);
    //document.getElementById("info_btn").innerHTML = "☰ ACTIVER INFOS";
    //document.getElementById("info_btn").setAttribute("class", "btn btn-success btn-sm");
    map.updateSize();



    /*overlays.getLayers().getArray().slice().forEach(layer => {

        overlays.getLayers().remove(layer);

    });

    layerSwitcher.renderPanel();

    if (draw) {
        map.removeInteraction(draw)
    };
    if (vectorLayer) {
        vectorLayer.getSource().clear();
    }
    map.removeOverlay(helpTooltip);

    if (measureTooltipElement) {
        var elem = document.getElementsByClassName("tooltip tooltip-static");
        //$('#measure_tool').empty(); 

        //alert(elem.length);
        for (var i = elem.length - 1; i >= 0; i--) {

            elem[i].remove();
            //alert(elem[i].innerHTML);
        }
    }*/


}

function effacer_tout() {
    if (vector1) {
        vector1.getSource().clear();
        map.removeLayer(geojson);
    }
    if (draw1) {
        map.removeInteraction(draw1);
    }
    document.getElementById('map').style.height = '100%';
    document.getElementById('table_data').style.height = '0%';
    document.getElementById('table_data').style.display = 'none';
    document.getElementById('table').style.display = 'none';
    document.getElementById('barre_menu').style.height = '6%';
    document.getElementById('logo').style.height = '5%';
    document.getElementById('fenetre_requete').style.display = 'none';
    map.updateSize();
    $('#table').empty();
    $('#legend').empty();
    if (geojson) {
        geojson.getSource().clear();
        map.removeLayer(geojson);
    }
    if (selectedFeature) {
        selectedFeature.setStyle();
        selectedFeature = undefined;
    }
    if (popup) {
        popup.hide();
    }
    map.getView().fit([-5.9428, 6.1288, -5.9363, 6.1336], {
        duration: 1590,
        size: map.getSize()
    });
    document.getElementById("query_panel_btn").innerHTML = "☰ REQUETES";
    document.getElementById("query_panel_btn").setAttribute("class", "btn btn-success btn-sm");
    document.getElementById("query_tab").style.width = "0%";
    document.getElementById("map").style.width = "100%";
    document.getElementById("map").style.left = "0%";
    document.getElementById("query_tab").style.visibility = "hidden";
    document.getElementById('table_data').style.left = '0%';
    document.getElementById("legend_btn").innerHTML = "☰ VOIR LEGENDE";
    document.getElementById("legend").style.width = "0%";
    document.getElementById("legend").style.visibility = "hidden";
    document.getElementById('legend').style.height = '0%';
    map.un('singleclick', getinfo);
    map.un('singleclick', highlight);
    document.getElementById("info_btn").innerHTML = "☰ ACTIVER INFOS";
    document.getElementById("info_btn").setAttribute("class", "btn btn-success btn-sm");
    map.updateSize();
    overlays.getLayers().getArray().slice().forEach(layer => {
        overlays.getLayers().remove(layer);
    });
    layerSwitcher.renderPanel();
    if (draw) {
        map.removeInteraction(draw)
    };
    if (vectorLayer) {
        vectorLayer.getSource().clear();
    }
    map.removeOverlay(helpTooltip);
    if (measureTooltipElement) {
        var elem = document.getElementsByClassName("tooltip tooltip-static");
        //$('#measure_tool').empty(); 

        //alert(elem.length);
        for (var i = elem.length - 1; i >= 0; i--) {
            elem[i].remove();
            //alert(elem[i].innerHTML);
        }
    }
}

function show_hide_querypanel() {
    fen_requete()

    /*if (document.getElementById("fenetre_requete").style.visibility == "hidden") {

        document.getElementById("query_panel_btn").innerHTML = "☰ FERMER PANNEAU";
        document.getElementById("query_panel_btn").setAttribute("class", "btn btn-primary btn-sm");
        document.getElementById("fenetre_requete").style.visibility = "visible";
        //document.getElementById("query_tab").style.width = "21%";
        document.getElementById("map").style.width = "79%";
        document.getElementById("map").style.left = "21%";

        document.getElementById('table_data').style.left = '21%';
        map.updateSize();
    } else {
        document.getElementById("query_panel_btn").innerHTML = "☰ REQUETES";
        document.getElementById("query_panel_btn").setAttribute("class", "btn btn-success btn-sm");
        document.getElementById("query_tab").style.width = "0%";
        document.getElementById("map").style.width = "100%";
        document.getElementById("map").style.left = "0%";
        document.getElementById("query_tab").style.visibility = "hidden";
        document.getElementById('table_data').style.left = '0%';

        map.updateSize();
    }*/
}

function show_hide_legend() {

    if (document.getElementById("legend").style.visibility == "hidden") {

        document.getElementById("legend_btn").innerHTML = "☰ FERMER LEGENDE";
		document.getElementById("legend_btn").setAttribute("class", "btn btn-primary btn-sm");

        document.getElementById("legend").style.visibility = "visible";
        document.getElementById("legend").style.width = "15%";

        document.getElementById('legend').style.height = '38%';
        map.updateSize();
    } else {
	    document.getElementById("legend_btn").setAttribute("class", "btn btn-success btn-sm");
        document.getElementById("legend_btn").innerHTML = "☰ LEGENDE";
        document.getElementById("legend").style.width = "0%";
        document.getElementById("legend").style.visibility = "hidden";
        document.getElementById('legend').style.height = '0%';

        map.updateSize();
    }
}



draw_type.onchange = function() {

    map.removeInteraction(draw1);

    if (draw) {
        map.removeInteraction(draw);
        map.removeOverlay(helpTooltip);
        map.removeOverlay(measureTooltip);
    }
    if (vectorLayer) {
        vectorLayer.getSource().clear();
    }
    if (vector1) {
        vector1.getSource().clear();
		// $('#table').empty();
    }
	

    if (measureTooltipElement) {
        var elem = document.getElementsByClassName("tooltip tooltip-static");
        //$('#measure_tool').empty(); 

        //alert(elem.length);
        for (var i = elem.length - 1; i >= 0; i--) {

            elem[i].remove();
            //alert(elem[i].innerHTML);
        }
    }

    add_draw_Interaction();
};


var source1 = new ol.source.Vector({
    wrapX: false
});

var vector1 = new ol.layer.Vector({
    source: source1
});
map.addLayer(vector1);

var draw1;



// measure Tool
function add_draw_Interaction() {
    var value = draw_type.value;
    //alert(value);
    if (value !== 'None') {
        var geometryFunction;
        if (value === 'Square') {
            value = 'Circle';
            geometryFunction = new ol.interaction.Draw.createRegularPolygon(4);

        } else if (value === 'Box') {
            value = 'Circle';

            geometryFunction = new ol.interaction.Draw.createBox();

        } else if (value === 'Star') {
            value = 'Circle';
            geometryFunction = function(coordinates, geometry) {
                //alert(value);
                var center = coordinates[0];
                var last = coordinates[1];
                var dx = center[0] - last[0];
                var dy = center[1] - last[1];
                var radius = Math.sqrt(dx * dx + dy * dy);
                var rotation = Math.atan2(dy, dx);
                var newCoordinates = [];
                var numPoints = 12;
                for (var i = 0; i < numPoints; ++i) {
                    var angle = rotation + i * 2 * Math.PI / numPoints;
                    var fraction = i % 2 === 0 ? 1 : 0.5;
                    var offsetX = radius * fraction * Math.cos(angle);
                    var offsetY = radius * fraction * Math.sin(angle);
                    newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
                }
                newCoordinates.push(newCoordinates[0].slice());
                if (!geometry) {
                    geometry = new ol.geom.Polygon([newCoordinates]);
                } else {
                    geometry.setCoordinates([newCoordinates]);
                }
                return geometry;
            };
        }
        
        // map.addInteraction(draw1);

        if (draw_type.value == 'select' || draw_type.value == 'clear') {

            if(draw1){map.removeInteraction(draw1);}
            vector1.getSource().clear();
            if (geojson) {
                geojson.getSource().clear();
                map.removeLayer(geojson);
            }

        } else if (draw_type.value == 'Square' || draw_type.value == 'Polygon' || draw_type.value == 'Circle' || draw_type.value == 'Star' || draw_type.value == 'Box')

        {
		draw1 = new ol.interaction.Draw({
            source: source1,
            type: value,
            geometryFunction: geometryFunction
        });

            map.addInteraction(draw1);

            draw1.on('drawstart', function(evt) {
                if (vector1) {
                    vector1.getSource().clear();
                }
                if (geojson) {
                    geojson.getSource().clear();
                    map.removeLayer(geojson);
                }

                //alert('bc');

            });

            draw1.on('drawend', function(evt) {
                var feature = evt.feature;

                var coords = feature.getGeometry();
                //console.log(coords);
                var format = new ol.format.WKT();
                var wkt = format.writeGeometry(coords);

                var layer_name = document.getElementById("layer1");
                var value_layer = layer_name.options[layer_name.selectedIndex].value;

                var url = "http://localhost:8080/geoserver/wfs?request=GetFeature&version=1.0.0&typeName=" + value_layer + "&outputFormat=json&cql_filter=INTERSECTS(the_geom," + wkt + ")";
                //alert(url);


                style = new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#ffcc33',
                        width: 3
                    }),

                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: '#ffcc33'
                        })
                    })
                });

                geojson = new ol.layer.Vector({
                    //title:'dfdfd',
                    //title: '<h5>' + value_crop+' '+ value_param +' '+ value_seas+' '+value_level+'</h5>',
                    source: new ol.source.Vector({
                        url: url,
                        format: new ol.format.GeoJSON()
                    }),
                    style: style,

                });

                geojson.getSource().on('addfeature', function() {
                    //alert(geojson.getSource().getExtent());
                    map.getView().fit(
                        geojson.getSource().getExtent(), {
                            duration: 1590,
                            size: map.getSize()
                        }
                    );
                });

                //overlays.getLayers().push(geojson);
                map.addLayer(geojson);
                map.removeInteraction(draw1);
                $.getJSON(url, function(data) {


                    var col = [];
                    col.push('id');
                    for (var i = 0; i < data.features.length; i++) {

                        for (var key in data.features[i].properties) {

                            if (col.indexOf(key) === -1) {
                                col.push(key);
                            }
                        }
                    }



                    var table = document.createElement("table");
                    table.setAttribute("class", "table table-hover table-striped");
                    table.setAttribute("id", "table");

                    var caption = document.createElement("caption");
                    caption.setAttribute("id", "caption");
                    caption.style.captionSide = 'top';
                    caption.innerHTML = value_layer + " (Number of Features : " + data.features.length + " )";
                    table.appendChild(caption);



                    // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

                    var tr = table.insertRow(-1); // TABLE ROW.

                    for (var i = 0; i < col.length; i++) {
                        var th = document.createElement("th"); // TABLE HEADER.
                        th.innerHTML = col[i];
                        tr.appendChild(th);
                    }

                    // ADD JSON DATA TO THE TABLE AS ROWS.
                    for (var i = 0; i < data.features.length; i++) {

                        tr = table.insertRow(-1);

                        for (var j = 0; j < col.length; j++) {
                            var tabCell = tr.insertCell(-1);
                            if (j == 0) {
                                tabCell.innerHTML = data.features[i]['id'];
                            } else {
                                //alert(data.features[i]['id']);
                                tabCell.innerHTML = data.features[i].properties[col[j]];
                                //alert(tabCell.innerHTML);
                            }
                        }
                    }


                    // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
                    var divContainer = document.getElementById("table_data");
                    divContainer.innerHTML = "";
                    divContainer.appendChild(table);



                    document.getElementById('map').style.height = '71%';
                    document.getElementById('table_data').style.height = '29%';
                    map.updateSize();
                    addRowHandlers();

                });
                map.on('singleclick', highlight);

            });


        }


    }
}


//measuretype change
/**
 * Let user change the geometry type.
 */
measuretype.onchange = function() {



    map.un('singleclick', getinfo);
    document.getElementById("info_btn").innerHTML = "☰ ACTIVER INFOS";
    document.getElementById("info_btn").setAttribute("class", "btn btn-success btn-sm");
    if (popup) {
        popup.hide();
    }
    
    map.removeInteraction(draw);
    addInteraction();
};


var source = new ol.source.Vector();
var vectorLayer = new ol.layer.Vector({
    //title: 'layer',
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(37, 150, 190, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#2157a2',
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#2157a2'
            })
        })
    })
});

map.addLayer(vectorLayer);




/**
 * Currently drawn feature.
 * @type {module:ol/Feature~Feature}
 */
var sketch;


/**
 * The help tooltip element.
 * @type {Element}
 */
var helpTooltipElement;


/**
 * Overlay to show the help messages.
 * @type {module:ol/Overlay}
 */
var helpTooltip;


/**
 * The measure tooltip element.
 * @type {Element}
 */
var measureTooltipElement;


/**
 * Overlay to show the measurement.
 * @type {module:ol/Overlay}
 */
var measureTooltip;


/**
 * Message to show when the user is drawing a polygon.
 * @type {string}
 */
var continuePolygonMsg = 'Click to continue drawing the polygon';


/**
 * Message to show when the user is drawing a line.
 * @type {string}
 */
var continueLineMsg = 'Click to continue drawing the line';




//var measuretype = document.getElementById('measuretype');

var draw; // global so we can remove it later


/**
 * Format length output.
 * @param {module:ol/geom/LineString~LineString} line The line.
 * @return {string} The formatted length.
 */
var formatLength = function(line) {
    var length = ol.sphere.getLength(line, {
        projection: 'EPSG:4326'
    });
    //var length = getLength(line);
    //var length = line.getLength({projection:'EPSG:4326'});

    var output;
    if (length > 100) {
        output = (Math.round(length / 1000 * 100) / 100) +
            ' ' + 'km';

    } else {
        output = (Math.round(length * 100) / 100) +
            ' ' + 'm';

    }
    return output;

};


/**
 * Format area output.
 * @param {module:ol/geom/Polygon~Polygon} polygon The polygon.
 * @return {string}// Formatted area.
 */
var formatArea = function(polygon) {
    // var area = getArea(polygon);
    var area = ol.sphere.getArea(polygon, {
        projection: 'EPSG:4326'
    });
    // var area = polygon.getArea();
    //alert(area);
    var output;
    if (area > 10000) {
        output = (Math.round(area / 1000000 * 100) / 100) +
            ' ' + 'km<sup>2</sup>';
    } else {
        output = (Math.round(area * 100) / 100) +
            ' ' + 'm<sup>2</sup>';
    }
    return output;
};

function addInteraction() {




    if (measuretype.value == 'select' || measuretype.value == 'clear') {

        if (draw) {
            map.removeInteraction(draw)
        };
        if (vectorLayer) {
            vectorLayer.getSource().clear();
        }
        if (helpTooltip) {
            map.removeOverlay(helpTooltip);
        }

        if (measureTooltipElement) {
            var elem = document.getElementsByClassName("tooltip tooltip-static");
            //$('#measure_tool').empty(); 

            //alert(elem.length);
            for (var i = elem.length - 1; i >= 0; i--) {

                elem[i].remove();
                //alert(elem[i].innerHTML);
            }
        }

        //var elem1 = elem[0].innerHTML;
        //alert(elem1);

    } else if (measuretype.value == 'area' || measuretype.value == 'length') {
        var type;
        if (measuretype.value == 'area') {
            type = 'Polygon';
        } else if (measuretype.value == 'length') {
            type = 'LineString';
        }
        //alert(type);

        //var type = (measuretype.value == 'area' ? 'Polygon' : 'LineString');
        draw = new ol.interaction.Draw({
            source: source,
            type: type,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.5)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineDash: [10, 10],
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.7)'
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.5)'
                    })
                })
            })
        });
        map.addInteraction(draw);
        createMeasureTooltip();
        createHelpTooltip();
        /**
         * Handle pointer move.
         * @param {module:ol/MapBrowserEvent~MapBrowserEvent} evt The event.
         */
        var pointerMoveHandler = function(evt) {
            if (evt.dragging) {
                return;
            }
            /** @type {string} */
            var helpMsg = 'Click to start drawing';

            if (sketch) {
                var geom = (sketch.getGeometry());
                if (geom instanceof ol.geom.Polygon) {

                    helpMsg = continuePolygonMsg;
                } else if (geom instanceof ol.geom.LineString) {
                    helpMsg = continueLineMsg;
                }
            }

            helpTooltipElement.innerHTML = helpMsg;
            helpTooltip.setPosition(evt.coordinate);

            helpTooltipElement.classList.remove('hidden');
        };

        map.on('pointermove', pointerMoveHandler);

        map.getViewport().addEventListener('mouseout', function() {
            helpTooltipElement.classList.add('hidden');
        });


        var listener;
        draw.on('drawstart',
            function(evt) {
                // set sketch


                //vectorLayer.getSource().clear();

                sketch = evt.feature;

                /** @type {module:ol/coordinate~Coordinate|undefined} */
                var tooltipCoord = evt.coordinate;

                listener = sketch.getGeometry().on('change', function(evt) {
                    var geom = evt.target;

                    var output;
                    if (geom instanceof ol.geom.Polygon) {

                        output = formatArea(geom);
                        tooltipCoord = geom.getInteriorPoint().getCoordinates();

                    } else if (geom instanceof ol.geom.LineString) {

                        output = formatLength(geom);
                        tooltipCoord = geom.getLastCoordinate();
                    }
                    measureTooltipElement.innerHTML = output;
                    measureTooltip.setPosition(tooltipCoord);
                });
            }, this);

        draw.on('drawend',
            function() {
                measureTooltipElement.className = 'tooltip tooltip-static';
                measureTooltip.setOffset([0, -7]);
                // unset sketch
                sketch = null;
                // unset tooltip so that a new one can be created
                measureTooltipElement = null;
                createMeasureTooltip();
                ol.Observable.unByKey(listener);
            }, this);

    }
}


/**
 * Creates a new help tooltip
 */
function createHelpTooltip() {
    if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'tooltip hidden';
    helpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left'
    });
    map.addOverlay(helpTooltip);
}


/**
 * Creates a new measure tooltip
 */
function createMeasureTooltip() {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'tooltip tooltip-measure';

    measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
    });
    map.addOverlay(measureTooltip);

}

