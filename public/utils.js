export const mapVOptions = {
    mapv_bus_line_light_green: {
        strokeStyle: 'rgb(30,200,81,0.7)',
            shadowColor: 'rgb(32,57,31)',
            shadowBlur: 3,
            lineWidth: 3,
            draw: 'simple',
    },
    mapv_option_stop: {
        fillStyle: 'rgba(255, 250, 250, 1)',
            size: 3,
            label: {
            show: true
        },
        strokeStyle: 'rgba(0,0,0,1)',
        lineWidth: 1,
        draw: 'simple',
        methods: {
            mousemove: {}
        }
    },
    mapv_option_dot_animation: {
        zIndex: 3,
            fillStyle: 'rgba(255, 250, 250, 1)',
            //coordType: 'bd09mc',
            globalCompositeOperation: "lighter",
            size: 1.5,
            animation: {
            type: 'time',
                stepsRange: {
                start: 0,
                    end: 400
            },
            trails: 3,
                duration: 25,  //update every 8 seconds
        },
        draw: 'simple'
    }
}
export const CANVAS_ZINDEX_VEHICLE = 7
export const CANVAS_ZINDEX_LINE = 4
export const DRAW_ZINDEX = 12
export const LEGEND_DATA1 = [
        {
            label: ">=45",
            color: 'rgb(23,128,31)'
        },
        {
            label: "30-45",
            color: 'rgb(52,186,7)'
        },
        {
            label: "20-30",
            color: 'rgb(114,233,23)'
        },
        {
            label: "10-20",
            color: 'rgb(255,179,22)'
        },
        {
            label: "5-10",
            color: 'rgb(238,75,48)'
        },
        {
            label: "<=5km/h",
            color: 'rgb(201,28,28)'
        }
    ]
export const LEGEND_DATA2 = [
    {
        label: "None",
        color: "#606060"
    },
    {
        label: "10",
        color: "#e0670b"
    },
    {
        label: "20",
        color: "#f68d4c"
    },
    {
        label: "30",
        color: "#ffb655"
    },
    {
        label: ">=30km/h",
        color: "#ffe779"
    }
]
export function MP(ak) {
    return new Promise(function (resolve, reject) {
        window.onload = function () {
            resolve(BMap)
        }
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "http://api.map.baidu.com/api?v=2.0&ak="+ak+"&callback=init";
        script.onerror = reject;
        document.head.appendChild(script);
    })
}

export function  calSpeed(curTime, curPoint, lastTime, lastPoint) {
    if(curTime === lastTime)  return 0;
    else {
        let dist = this.calDistance(curPoint, lastPoint);
        let date1 = new Date(lastTime);
        let date2 = new Date(curTime);
        let speed = dist / (date2.getTime() - date1.getTime()) * 1000; // m/s
        return Math.round(speed * 3.6); //km/h
    }
}
export function calDistance(curPoint, lastPoint) {
    /** 计算两经纬度之间的距离，单位是m
     * approx distance between two points on earth ellipsoid
     */
    function getGreatCircleDistance(lat1,lng1,lat2,lng2){
        const PI = Math.PI;
        const EARTH_RADIUS = 6378.137; //km
        function getRad (d) {
            return d * PI / 180.0;
        }
        let radLat1 = getRad(lat1);
        let radLat2 = getRad(lat2);
        let a = radLat1 - radLat2;
        let b = getRad(lng1) - getRad(lng2);
        let s = 2*Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) + Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
        s = s*EARTH_RADIUS;
        s = Math.round(s*10000)/10000.0;
        return s*1000; //m
    }
    return getGreatCircleDistance(curPoint.lat, curPoint.lng, lastPoint.lat, lastPoint.lng);
}

/**
 * @description set the arrowPoint
 * @param pointerLong
 * @param midPixel
 * @param distance
 * @param nextPixel
 * @param pixel
 * @returns {{bPixel: {}, aPixel: {}}}
 */
export function arrowPoint(pointerLong, midPixel, distance, nextPixel, pixel) {
    const aPixel = {}; //the coordinates of arrow endpoint 1
    const bPixel = {}; //the coordinates of arrow endpoint 2
    // calculation rules of coordinates
    // When The next x-coordinate is equal to the last coordinate
    if (nextPixel.x - pixel.x === 0) {
        //The next y-coordinate is greater than the last coordinate
        if (nextPixel.y - pixel.y > 0) {
            aPixel.x = midPixel.x - pointerLong * 0.5 ** 0.5;
            aPixel.y = midPixel.y - pointerLong * 0.5 ** 0.5;
            bPixel.x = midPixel.x + pointerLong * 0.5 ** 0.5;
            bPixel.y = midPixel.y - pointerLong * 0.5 ** 0.5;
        }
        // The next y-coordinate is less than the previous one
        else if (nextPixel.y - pixel.y < 0) {
            aPixel.x = midPixel.x - pointerLong * 0.5 ** 0.5;
            aPixel.y = midPixel.y + pointerLong * 0.5 ** 0.5;
            bPixel.x = midPixel.x + pointerLong * 0.5 ** 0.5;
            bPixel.y = midPixel.y + pointerLong * 0.5 ** 0.5;
        }
    }
    // The next X coordinate is not the same as the previous coordinate
    else {
        const k0 = (-(2 ** 0.5) * distance * pointerLong + 2 * (nextPixel.y - pixel.y) * midPixel.y) / (2 * (nextPixel.x - pixel.x)) + midPixel.x;
        const k1 = -((nextPixel.y - pixel.y) / (nextPixel.x - pixel.x));
        const a = k1 ** 2 + 1;
        const b = 2 * k1 * (k0 - midPixel.x) - 2 * midPixel.y;
        const c = (k0 - midPixel.x) ** 2 + midPixel.y ** 2 - pointerLong ** 2;
        aPixel.y = (-b + (b * b - 4 * a * c) ** 0.5) / (2 * a);
        bPixel.y = (-b - (b * b - 4 * a * c) ** 0.5) / (2 * a);
        aPixel.x = k1 * aPixel.y + k0;
        bPixel.x = k1 * bPixel.y + k0;
    }
    return {aPixel, bPixel}
}
export function generateBusVehiclePointer_TwoPixel(lineLong, pixel, lastPixel, theta) {
    const aPixel = {};
    const bPixel = {};
    const midPixel = {};
    let angle = Math.atan2(lastPixel.y - pixel.y, lastPixel.x -pixel.x)*180 / Math.PI;
    let angle1 = (angle + theta) * Math.PI / 180;
    let angle2 = (angle - theta) * Math.PI / 180
    midPixel.x = pixel.x - Math.cos(angle * Math.PI / 180)*lineLong/2;
    midPixel.y = pixel.y - Math.sin(angle * Math.PI / 180)*lineLong/2;
    aPixel.x = Math.cos(angle1)*lineLong + midPixel.x;
    aPixel.y = Math.sin(angle1)*lineLong + midPixel.y;
    bPixel.x = Math.cos(angle2)*lineLong + midPixel.x;
    bPixel.y = Math.sin(angle2)*lineLong + midPixel.y;
    return {aPixel, bPixel, midPixel};
}
export function getVehicleColor(weight) {
    if(weight > 45) return 'rgb(23,128,31)'
    else if(weight > 30) return  'rgb(52,186,7)';
    else if(weight > 20) return 'rgb(114,233,23)';
    else if(weight > 10) return 'rgb(255,179,22)';
    // else if (weight > 10) return 'rgb(247,112,42)';
    else if (weight > 5) return 'rgb(238,75,48)';
    else return 'rgb(201,28,28)';
}

/**
 * @description set canvas color value
 * @param value
 * @returns {string}
 */
export function getTrajColorByValue(value) {
    // if(value > 67) return '#bca8eb';
    // else if(value > 33) return '#61099b';//'#8c18da';
    // else return '#61099b';
    // if(value > 67) return '#a8d9eb';
    // else if(value > 33) return '#18a6da';
    // else return '#093f9b';
    if(value == 0) return "#606060";
    else if(value < 10) return "#e0670b";
    else if(value < 20) return "#f68d4c";
    else if(value < 30) return "#ffb655"
    else {
        return "#ffe779";
    }
    // if (value > 50) return "#DC143C";
    // else return "#1abd15";
}

export function generateBusVehiclePointer(lineLong, pixel, bearing, theta) {
    const aPixel = {};
    const bPixel = {};
    const midPixel = {};
    let angle = bearing + 90;
    let angle1 = (angle + theta) * Math.PI / 180;
    let angle2 = (angle - theta) * Math.PI / 180
    midPixel.x = pixel.x - Math.cos(angle * Math.PI / 180)*lineLong/2;
    midPixel.y = pixel.y - Math.sin(angle * Math.PI / 180)*lineLong/2;
    aPixel.x = Math.cos(angle1)*lineLong + midPixel.x;
    aPixel.x = Math.cos(angle1)*lineLong + midPixel.x;
    aPixel.y = Math.sin(angle1)*lineLong + midPixel.y;
    bPixel.x = Math.cos(angle2)*lineLong + midPixel.x;
    bPixel.y = Math.sin(angle2)*lineLong + midPixel.y;
    return {aPixel, bPixel, midPixel};
}

// for remember current state
let counter_line = 0;
let counter_st = 0;
let counter_rect = 0;

let line_label = [];
let line_polygons = [];
let rect_label = [];
let rect_polygons = [];

// baidu map drawing options
let draw_color ="rgb(60,60,60)";
export const pathStyle = {
    strokeColor: draw_color,
    strokeWeight: 3,             // width of the stroke
    strokeOpacity: 0.8,
    strokeStyle: "white",        // solid or dashed
    zIndex: DRAW_ZINDEX
};

export const rectStyle = {
    strokeColor: draw_color,
    fillColor: draw_color,
    strokeOpacity: 0.1,
    fillOpacity: 0.3,
    strokeStyle: "solid",
    zIndex: DRAW_ZINDEX
};

export  function getPixelRatio(context) {
    var backingStore = context.backingStorePixelRatio ||
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;
    return (window.devicePixelRatio || 1) / backingStore;
}
