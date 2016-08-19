import React  from 'react'
import {ListViewBody} from './TinyListView'

var ListDetail = React.createClass({
	_ajaxRequest: null,

	getInitialState: function() {
		return {id: null, doc: null};
	},

	componentWillReceiveProps: function(nextProps) {
		if(nextProps.params.id != this.props.params.id) {
			this.setState({id: nextProps.params.id, doc: null});
		}
	},

	shouldComponentUpdate: function(nextProps, nextState) {
		if(nextState.id != this.state.id || nextState.doc != this.state.doc) {
			return true;
		}
		return false;
	},

	componentWillMount: function() {
		$(window).scrollTop(0);
		this.setState({id: this.props.params.id, doc: null});
	},

	_fetchContent: function() {
		if(this._ajaxRequest != null) {
			this._ajaxRequest.abort();
			this._ajaxRequest = null;
		}

		var _this = this;
		_this._ajaxRequest = this.props.getDetailAjax(this.state.id);
		if(_this._ajaxRequest == null) return;

		_this._ajaxRequest.always(function(data) {
			var ajaxRequest = _this._ajaxRequest;
			_this._ajaxRequest = null;
			if(ajaxRequest !== data) {
				_this.setState({doc: data || {}});
			}
		});
		
	},

	render: function() {
		if(this.state.doc == null) setTimeout(this._fetchContent, 0);
		return this.props.renderDetail(this);
	}

});

var ListMaster = React.createClass({
	masterScrollTop: 0,
	direction: 0,

	_onScroll: function() {
		if(!this._isMaster()) return;
		this.refs['listViewBody']._onScroll();
	},

	_onResize: function() {
		if(!this._isMaster()) return;
		this.refs['listViewBody']._onResize();
	},

	_isMaster: function() {
		return this.props.params.id == null;
	},

	componentWillReceiveProps: function(nextProps) {
		var isMasterNext = nextProps.params.id == null;
		var isMasterCur = this._isMaster();

		this.direction = 0;
		if(isMasterCur && !isMasterNext) {
			this.direction = 1;
			this.masterScrollTop = $(window).scrollTop();
		} else if(!isMasterCur && isMasterNext) {
			this.direction = -1;
		}
	},

	componentWillMount: function() {
		$(window).scrollTop(0);
	},

	render: function() {
		var isMaster = this._isMaster();

		return (
		<div className="miniHeightProtected">
			<div key="master" style={{display: isMaster ? 'block' : 'none'}}>
				{this.props.header}
				<ListViewBody
					className="container"
					ref="listViewBody"
					adapter={this.props.adapter}
					shouldNotRender={!isMaster}
					/>
			</div>
			<div key="detail">{this.props.children}</div>
		</div>
		);
	},

	componentDidUpdate() {
		if(this.direction == -1) {
			$(window).scrollTop(this.masterScrollTop);

		} else if(this.direction == 1) {
			//$(window).scrollTop(0);

		} else {
			this._onScroll();
		}

		this.direction = 0;
	},

	componentDidMount: function() {
		$(window).on('scroll', this._onScroll).on('resize', this._onResize);
		this.refs['listViewBody'].parentDidMount(window);
	},

	componentWillUnmount: function() {
		$(window).off('scroll', this._onScroll).off('resize', this._onResize);
		this.refs['listViewBody'].parentWillUnmount();
	}

});


module.exports = {
	ListDetail: ListDetail,
	ListMaster: ListMaster
};