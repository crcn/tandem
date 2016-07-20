"use strict";
const bounding_rect_1 = require('saffron-common/src/geom/bounding-rect');
const translate_style_1 = require('saffron-common/src/utils/css/translate-style');
const index_1 = require('saffron-common/src/utils/css/index');
const index_2 = require('saffron-common/src/utils/html/index');
function getElementOffset(entity, element) {
    var p = element.parentNode;
    var left = 0;
    var top = 0;
    var zoom = index_2.calculateZoom(element);
    while (p) {
        left += p.offsetLeft || 0;
        top += p.offsetTop || 0;
        left -= (p.scrollLeft || 0) / zoom;
        top -= (p.scrollTop || 0) / zoom;
        p = p.parentNode || p.host;
    }
    const frameOffset = getFrameOffset(entity);
    left += frameOffset.left;
    top += frameOffset.top;
    return { left, top };
}
function getFrameOffset(entity) {
    entity = entity.parentNode;
    while (entity) {
        if (entity.isolated && entity.preview) {
            var rect = entity.preview.getBoundingRect();
            return rect;
        }
        entity = entity.parentNode;
    }
    return { left: 0, top: 0 };
}
function getComputedStyle(node) {
    var cs = window.getComputedStyle(node);
    // normalize computed styles to pixels
    return Object.assign({}, cs.position, translate_style_1.translateStyleToIntegers({
        marginLeft: cs.marginLeft,
        marginTop: cs.marginTop,
        marginRight: cs.marginRight,
        marginBottom: cs.marginBottom,
        paddingLeft: cs.paddingLeft,
        paddingTop: cs.paddingTop,
        paddingRight: cs.paddingRight,
        paddingBottom: cs.paddingBottom
    }, node));
}
function getCapabilities(node) {
    var style = window.getComputedStyle(node);
    var movable = style.position !== 'static';
    var resizable = /fixed|absolute/.test(style.position) || !/^inline$/.test(style.display);
    return {
        movable,
        resizable,
    };
}
exports.getCapabilities = getCapabilities;
function calculateBoundingRect(entity, node, zoomProperties) {
    var rect = node.getBoundingClientRect();
    var cs = getComputedStyle(node);
    var offset = getFrameOffset(entity);
    // margins are also considered bounds - add them here. Fixes a few issues
    // when selecting multiple items with different items & dragging them around.
    var left = rect.left - cs.marginLeft + offset.left;
    var top = rect.top - cs.marginTop + offset.top;
    var right = rect.right + cs.marginRight + offset.left;
    var bottom = rect.bottom + cs.marginBottom + offset.top;
    var width = right - left;
    var height = bottom - top;
    if (zoomProperties) {
        ({ left, top, width, height } = (index_2.multiplyStyle({ left, top, width, height }, index_2.calculateZoom(node))));
    }
    right = left + width;
    bottom = top + height;
    return new bounding_rect_1.default({
        left: left,
        top: top,
        right: right,
        bottom: bottom
    });
}
exports.calculateBoundingRect = calculateBoundingRect;
function setBoundingRect(bounds, entity, node) {
    // NO zoom here - point is NOT fixed, but relative
    var absStyle = getStyle(entity, node, false);
    var props = Object.assign({}, bounds);
    var paddingWidth = absStyle.paddingLeft + absStyle.paddingRight;
    var paddingHeight = absStyle.paddingTop + absStyle.paddingBottom;
    props.width = Math.max(props.width - paddingWidth, 0);
    props.height = Math.max(props.height - paddingHeight, 0);
    // convert px to whatever unit is set on the style
    Object.assign(props, index_1.translateStyle({
        width: props.width,
        height: props.height,
    }, entity.style, node));
    // FIXME: wrong place here - this is just a quick
    // check to see if this *actually* works
    setPositionFromAbsolutePoint({
        left: bounds.left,
        top: bounds.top,
    }, entity, node);
    delete props.left;
    delete props.top;
    entity.setProperties({ style: props });
}
exports.setBoundingRect = setBoundingRect;
function getStyle(entity, node, zoomProperties) {
    var style = entity.style;
    var { left, top } = translate_style_1.translateStyleToIntegers({
        left: style.left || 0,
        top: style.top || 0,
    }, node);
    // normalize computed styles to pixels
    var cStyle = getComputedStyle(node);
    // zooming happens a bit further down
    var rect = calculateBoundingRect(entity, node, false);
    var w = rect.right - rect.left;
    var h = rect.bottom - rect.top;
    style = Object.assign({}, cStyle, {
        left: left,
        top: top,
        width: w,
        height: h,
        // for rect consistency
        right: left + w,
        bottom: top + h,
    });
    // this normalizes the properties so that the calculated values
    // are also based on the zoom level. Important for overlay data such as
    // tools and information describing the target entity
    if (zoomProperties) {
        style = index_2.multiplyStyle(style, index_2.calculateZoom(node));
    }
    return style;
}
exports.getStyle = getStyle;
function setPositionFromAbsolutePoint(point, entity, node) {
    // absolute positions are always in pixels - always round
    // to the nearest one
    var element = node;
    var offset = getElementOffset(entity, node);
    var bounds = calculateBoundingRect(entity, node, false);
    var style = getStyle(entity, node, false);
    var originLeft = bounds.left - style.left;
    var originTop = bounds.top - style.top;
    var left = point.left;
    var top = point.top;
    left -= offset.left;
    top -= offset.top;
    // offset relative position (based on children)
    if (/relative|static/.test(style.position)) {
        left -= originLeft - offset.left;
        top -= originTop - offset.top;
    }
    const newStyle = index_1.translateStyle({
        left: left,
        top: top,
    }, entity.style, element);
    entity.setProperties({ style: newStyle });
}
exports.setPositionFromAbsolutePoint = setPositionFromAbsolutePoint;
//# sourceMappingURL=utils.js.map