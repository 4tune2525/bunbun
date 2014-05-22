
//var manage = require('../models/manage.js');

var _ = require('underscore-contrib');

var sockets = [];

var generateID = (function(){

	var count = 1;

	return function(){
		return count++;
	};

})();

var isCalculating = function(data){
	return data.calcId !== 0; 
};

var calcDistributionFactor = function(distributedSockets,data){
	var dataNum = data.job.data.length;
	var socketsNum = distributedSockets.length;

	

};

var distributeSockets = function(sockets,data){

	var distributedSockets = [];

	_.each(sockets,function(value,index,list){
		if(!isCalculating(value)){
			value.calcId = data.id;
			distributedSockets.push({
				id:value.id,
				data:[]
			});
		}
	});

	calcDistributionFactor(distributedSockets,data);
};

var onConnection = function(socket){

	var id = generateID();

	var data = {

		id:id,
		
		calcId:id,

		job:{}

	};

	sockets.push(data);
	
	socket.set('id',id,function(){
		socket.emit('connected',{id:id});

		socket.on('start',function(data){
		
			socket.get('id',function(err,id){

				_.each(sockets,function(value,index,list){
					if(value.id === id){
						if(isCalculating(id)){
							return;
						}else{
							value.job = data.job;
						}
					}
				});

				distributeSockets(socket,data);
			});			
		
		});

		socket.on('resultMapCombine',function(){

		});

		
	});
	

};


module.exports.onConnection = onConnection;
