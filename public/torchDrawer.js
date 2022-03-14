// for remember current state
let counter_line = 0;
let counter_st = 0;
let counter_rect = 0;

let line_label = [];
let line_polygons = [];
let rect_label = [];
let rect_polygons = [];

// baidu map drawing options
let pathStyle = {
    strokeColor: "white",
    strokeWeight: 3,             // width of the stroke
    strokeOpacity: 0.8,
    strokeStyle: "white"        // solid or dashed
};

let rectStyle = {
    strokeColor: "white",
    fillColor: "white",
    strokeOpacity: 0.1,
    fillOpacity: 0.6,
    strokeStyle: "solid"
};

export function toSimLine(poly){
    let tr = '<tr>' +
        '<td width="105px" style="padding-bottom: 1ex">' +
        '<span style="color:blue;font-weight:bold; font-size: small">path: '+ counter_line+ '</span>' +
        '</td>' +
        '<td width = "135px" style="padding-bottom: 1ex">' +
        '<button  class="btn btn-success btn-xs path_checkable" style="font-size: x-small" value="'+  counter_line +'">on display</button>' +
        '</td>'+
        '<td width = "50px" style="padding-bottom: 1ex">' +
        '<input type="radio" name="sim" value="'+ counter_line + '" checked>' +
        '</td>' +
        '</tr>';
    return tr;
}

export function toComline(poly){
    let tr = '<tr>' +
        '<td width="100px" style="padding-bottom: 0.5ex">' +
        '<span style="color:blue;font-weight:bold; font-size: small">path: '+ counter_line+ '</span>' +
        '</td>' +
        '<td width="80px" style="padding-bottom: 0.5ex">' +
        '<button  class="btn btn-success btn-xs path_checkable" style="font-size: x-small" value="'+ counter_line +'">on display</button>' +
        '</td>'+
        '<td width="80px" style="padding-bottom: 0.5ex">' +
        '<button  class="btn btn-primary btn-xs state_strict" style="font-size: x-small" value="'+ counter_line+'">loose</button>' +
        '</td>'+
        '<td width="50px" style="padding-bottom: 0.5ex">' +
        '<input name="com_line" type="checkbox" value="'+ counter_line + '" checked>' +
        '</td>' +
        '</tr>';
    return tr;
}

export {
    pathStyle, rectStyle
}