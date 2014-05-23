
//var manage = require('../models/manage.js');

var _ = require('underscore-contrib');

var sockets = [];

var generateID = (function(){

	var count = 1;

	return function(){
		return count++;
	};

})();

var isCalculating = function(socketData){
	return socketData.calcId !== 0; 
};

var missCalculations = [];

var isMissedCalc = function(calcId){
	return _.some(missCalculations,function(missCalc,index,missCalculations){
		return missCalc.calcId === calcId;
	});
};

var isFinishedCalc = function(calcId){
	return !(isMissedCalc(calcId) || _.some(sockets,function(socketData,index,sockets){
		return socketData.calcId === calcId && socketData.id !== calcId;
	}));
};

var isExistSocket = function(id){
	return _.some(sockets,function(socketData,index,sockets){
		return socketData.id === id;
	});
};

var calcDistributedData = function(socketsNum,data){
	var dataNum = data.length;

	var distributeNum = Math.ceil(dataNum/socketsNum);

	var result = [];
	
	for(var i=0;i<distributeNum;i++){
		var j = i * socketsNum;
		var p = data.slice(j,j + socketsNum);
		result.push(p);
	}

	return result;

};


// var distributeSockets = function(sockets,calcId,job){

var distributeSockets = function(calcId,job){

	console.log('socketsNum ' + sockets.length);

	var distributedNum = [];

	_.each(sockets,function(socketData,index,sockets){
		console.log('Step in distributeSockets : sockets'
					+ JSON.stringify({
						id : socketData.id,
						calcId :socketData.calcId,
						charge :socketData.charge
					}));
		if(!isCalculating(socketData)){
			socketData.calcId = calcId;
			socketData.charge = job;
		}
	});

	console.log('distributedData ' + JSON.stringify(distributedNum));

	var distributedData = calcDistributedData(distributedNum,job.data);

	console.log('distributedData ' + JSON.stringify(distributedData));

	_.each(sockets,function(socketData,index,sockets){
		socketData.charge.data = distributedData[index];
		socketData.socket.emit('charge',socketData.charge,function(charge){

			console.log('id ' + socketData.calcId + ' : emit id' + socketData.id);

			socketData.calcId = 0;
			socketData.charge = {};

			if(isExistSocket(calcId)){

				if(isFinishedCalc(calcId)){
					
					socketData.socket.emit('finish',charge.data);
					
					_.each(sockets,function(socketData,index,sockets){
						if(socketData.id === socketData.calcId){
							socketData.calcId = 0;
						}
					});
				}else if(isMissedCalc(calcId)){

					socketData.socket.emit('continue',charge.data);

					_.each(missCalculations,function(missCalc,index,missCalculations){
						if(calcId === missCalc.calcId){
							distributeSockets(sockets,calcId,missCalculations.splice(index,1).job);
						}
					});
				}
			}

		});
	});



};

var onConnection = function(socket){

	var id = generateID();

	var socketData = {

		id:id,
		
		calcId:0,

		job:{},

		charge:{},

		socket:socket

	};

	sockets.push(socketData);
	
	socket.set('id',id,function(){
		
	});

	
	socket.on('start',function(job){
		
		socket.get('id',function(err,id){

			_.each(sockets,function(value,index,list){
				if(value.id === id){
					if(isCalculating(id)){
						return;
					}else{
						value.job = job;
					}
				}
			});

			console.log('id ' + id + ' : start.');

			debugger;

			// distributeSockets(sockets,id,job);
			distributeSockets(id,job);
		});			
		
	});

	socket.on('disconnect',function(){

			

		socket.get('id',function(err,id){
			if(!id) return;

			console.log('id ' + id + ' : disconnect.');

			_.each(sockets,function(socketData,index,sockets){
				if(socketData.id===id){
					sockets.splice(index,1);
					if(socketData.id === socketData.calcId){							
						if(isMissedCalc(id)){
							_.each(missCalculations,function(missCalc,index,missCalculations){									if(calcId === missCalc.calcId){
									missCalculations.splice(index,1);
								}
							});
						}
					}else if(isCalculating(id)){

						if(!isMissedCalc(socketData.calcId)){
							missCalculations.push({
								calcId:socketData.calcId,
								job:socketData.charge
							});
						}else{
							_.each(missCalculations,function(missCalc,index,missCalculations){
								if(calcId === missCalc.calcId){
									missCalc.job.data.concat(socketData.charge.data);
								}
							});
						}
					}
				}
			});
		});
	});


	console.log('id ' + id + ' : connected.');
	

	if(missCalculations.length !== 0){
		if(isExistSocket(missCalculations[0].calcId)){
			distributeSockets(sockets,missCalculations[0].calcId,missCalculations[0].job);
		}
	}
	

};


module.exports.onConnection = onConnection;
