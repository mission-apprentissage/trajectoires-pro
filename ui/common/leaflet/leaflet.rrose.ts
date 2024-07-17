/*
  Copyright (c) 2012 Eric S. Theise
  
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
  documentation files (the "Software"), to deal in the Software without restriction, including without limitation the 
  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit 
  persons to whom the Software is furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the 
  Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE 
  WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import * as L from "leaflet";

// @ts-ignore
L.Rrose = L.Popup.extend({
  _initLayout: function () {
    var prefix = "leaflet-rrose",
      container = (this._container = L.DomUtil.create(
        "div",
        prefix + " " + this.options.className + " leaflet-zoom-animated"
      )),
      closeButton;
    this.prefix = prefix;
    this.container = container;

    if (this.options.closeButton) {
      closeButton = this._closeButton = L.DomUtil.create("a", prefix + "-close-button", container);
      closeButton.href = "#close";
      closeButton.innerHTML = "&#215;";

      L.DomEvent.on(closeButton, "click", this._onCloseButtonClick, this);
    }

    this._computePosition();
    this._createWrapper();
  },

  _handleDrag: function () {
    this._updatePosition();
  },

  onAdd: function (map: L.Map) {
    L.Popup.prototype.onAdd.call(this, map);
    map.on("drag", this._handleDrag, this);
  },

  onRemove: function (map: L.Map) {
    map.off("drag", this._handleDrag, this);
    L.Popup.prototype.onRemove.call(this, map);
  },

  _updateWrapper: function () {
    if (/s/.test(this.options.position)) {
      if (this.options.position === "s") {
        L.DomUtil.setClass(this._tipContainer, this.prefix + "-tip-container");
        L.DomUtil.setClass(this._wrapper, this.prefix + "-content-wrapper");
        L.DomUtil.toFront(this._wrapper);
      } else {
        L.DomUtil.setClass(
          this._tipContainer,
          this.prefix + "-tip-container" + " " + this.prefix + "-tip-container-" + this.options.position
        );
        L.DomUtil.setClass(
          this._wrapper,
          this.prefix + "-content-wrapper" + " " + this.prefix + "-content-wrapper-" + this.options.position
        );
        L.DomUtil.toFront(this._wrapper);
      }
    } else {
      if (this.options.position === "n") {
        L.DomUtil.setClass(this._wrapper, this.prefix + "-content-wrapper");
        L.DomUtil.setClass(this._tipContainer, this.prefix + "-tip-container");
        L.DomUtil.toFront(this._tipContainer);
      } else {
        L.DomUtil.setClass(
          this._wrapper,
          this.prefix + "-content-wrapper" + " " + this.prefix + "-content-wrapper-" + this.options.position
        );
        L.DomUtil.setClass(
          this._tipContainer,
          this.prefix + "-tip-container" + " " + this.prefix + "-tip-container-" + this.options.position
        );
        L.DomUtil.toFront(this._tipContainer);
      }
    }

    L.DomUtil.setClass(this._tip, this.prefix + "-tip" + " " + this.prefix + "-tip-" + this.options.position);
  },

  _createWrapper: function () {
    var wrapper;

    if (this.oldPosition === this.options.position) {
      return;
    }

    // Clean old if necessary
    L.DomUtil.empty(this.container);

    // Create the necessary DOM elements in the correct order. Pure 'n' and 's' conditions need only one class for styling, others need two.
    this._tipContainer = L.DomUtil.create("div", "", this.container);
    wrapper = this._wrapper = L.DomUtil.create("div", "", this.container);

    this._tip = L.DomUtil.create("div", "", this._tipContainer);

    this._updateWrapper();

    L.DomEvent.disableClickPropagation(wrapper);
    this._contentNode = L.DomUtil.create("div", this.prefix + "-content", wrapper);
    L.DomEvent.on(this._contentNode, "mousewheel", L.DomEvent.stopPropagation);
  },

  _computePosition: function () {
    // Set the pixel distances from the map edges at which popups are too close and need to be re-oriented.
    var x_bound = this.container.offsetWidth / 2 + (this.options?.bounds?.x ?? 0),
      y_bound = this.container.offsetHeight + (this.options?.bounds?.y ?? 0);
    this.oldPosition = this.options.position;

    // Determine the alternate direction to pop up; north mimics Leaflet's default behavior, so we initialize to that.
    this.options.position = "n";
    // Then see if the point is too far north...
    var y_diff = y_bound - this._map.latLngToContainerPoint(this._latlng).y;
    if (y_diff > 0) {
      this.options.position = "s";
    }
    // or too far east...
    var x_diff = this._map.latLngToContainerPoint(this._latlng).x - (this._map.getSize().x - x_bound);
    if (x_diff > 0) {
      this.options.position += "w";
    } else {
      // or too far west.
      x_diff = x_bound - this._map.latLngToContainerPoint(this._latlng).x;
      if (x_diff > 0) {
        this.options.position += "e";
      }
    }
  },

  _updatePosition: function () {
    var pos = this._map.latLngToLayerPoint(this._latlng),
      is3d = L.Browser.any3d;
    this._computePosition();
    this._updateWrapper();

    const offset =
      this.options.offsets && this.options.offsets[this.options.position]
        ? this.options.offsets[this.options.position]
        : this.options.offset;
    if (is3d) {
      L.DomUtil.setPosition(this._container, pos);
    }

    if (/s/.test(this.options.position)) {
      this._containerBottom = -this._container.offsetHeight + offset.y - (is3d ? 0 : pos.y);
    } else {
      this._containerBottom = -offset.y - (is3d ? 0 : pos.y);
    }

    if (/e/.test(this.options.position)) {
      this._containerLeft = offset.x + (is3d ? 0 : pos.x);
    } else if (/w/.test(this.options.position)) {
      this._containerLeft = -Math.round(this._containerWidth) + offset.x + (is3d ? 0 : pos.x);
    } else {
      this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x + (is3d ? 0 : pos.x);
    }

    this._container.style.bottom = this._containerBottom + "px";
    this._container.style.left = this._containerLeft + "px";
  },
});
