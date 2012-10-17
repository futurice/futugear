(function(){


_.mixin({
	// Adapted from http://stackoverflow.com/questions/1267283/how-can-i-create-a-zerofilled-value-using-javascript
	padZeros : function(number, width, where) {
		width -= number.toString().length;
		if ( width > 0 ) {
			var filling = (new Array( width + (/\./.test( number ) ? 2 : 1) )).join( '0' );
			if (where === 'end') {
				return number + filling;
			} else {
				return filling + number;
			}
		} else {
			return number + ""; // always return a string
		}
	}
});




var app = {

	DATA_CALLBACK_FUNCTION_NAME: 'dataCallback',

	AUTO_UPDATE: true,
	UPDATE_INTERVAL_IN_SEC: 15,
	SHOW_NEXT_INTERVAL_IN_SEC: 6,

	_views: [],

	_nowShowing: 0,

	start: function () {

		_.bindAll(this);

		this._getData();
		if (this.AUTO_UPDATE === true) {
			setInterval(this._getData, this.UPDATE_INTERVAL_IN_SEC*1000);
		}

		setInterval(this._showNext, this.SHOW_NEXT_INTERVAL_IN_SEC*1000);

	},

	_getData: function () {
		var self = this;

		var dataFilename = this._getDataFileName();
		console.log("Downloading data from " + dataFilename);


		window[this.DATA_CALLBACK_FUNCTION_NAME] = function(data) {

			data = self._processData(data);

			console.log("Download finished")
			if (JSON.stringify(data) !== JSON.stringify(self._views)) {
				console.log("Change in the data noticed")
				self._views = data;
				self.render();
			}

		}

		$.ajax(this._getDataFileName(), {
			dataType: 'jsonp'
		});
	},

	_getDataFileName: function () {
		var scripts = document.getElementsByTagName( 'script' );
		var thisScript = _.find(scripts, function (script) { return (script.src.indexOf('index.js') != -1) })
		var url = (thisScript && thisScript.getAttribute('data-src')) ? thisScript.getAttribute('data-src') : '';
		return url;
	},

	_processData: function (data) {
		data = this._removeHidden(data);
		data = this._sortLaptimes(data);
		return data;
	},

	_removeHidden: function (boards) {
		return _.filter(boards, function (board) {
			return (board.show === true);
		})
	},

	_sortLaptimes: function (boards) {
		_.each(boards, function (board) {
			board.laptimes = _.sortBy(board.laptimes, function (entity) {
				if (entity.time === 'DNF') {
				return entity.time;
				} else {
					var time = entity.time.split(/[\s,:\.]+/);
					var minutes = _.padZeros(time[0] || 0, 10, 'start');
					var seconds = _.padZeros(time[1] || 0, 2, 'start');
					var millis  = _.padZeros(time[2] || 0, 3, 'end');
					entity.time = time[0] + ':' + seconds + '.' + millis;
					return minutes + seconds + millis;
				}
			})
		})
		return boards;
	},

	render: function () {
		console.log("Rendering the view");

		$('.views').render(this._views, this._directives);

		$('.views').css('width', 100 * this._views.length * 2 + '%');
		$('.views .view').css('width', (100 / this._views.length / 2) + '%');
		$('.views .view').css('margin-right', (100 / this._views.length / 2) + '%');
		$('.laptime').css('transform', function () { return "rotate(" + ((Math.random()*1.8)-0.9) + "deg)" });
		$('.laptime').each(function (index, laptime) {
			var amount = ((Math.random()*3)-1.5);
			$(laptime).css('margin-left', amount + '%');
			$(laptime).css('margin-right', (-1*amount) + '%');
		})
		$('.laptime .name').css('padding-left', function () { return (Math.random()*5) + '%' });

		this._showNext(0);
	},

	_directives: {
	},

	_showNext: function (index) {
		if (_.isNumber(index)) {
			this._nowShowing = index;
		} else {
			this._nowShowing++;
			this._nowShowing = this._nowShowing % this._views.length;
		}
		$('.views').css('left', (-2 * this._nowShowing * 100) + '%');
	}

}

app.start();
})();