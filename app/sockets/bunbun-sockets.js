
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
	
	for(var i=0;i<socketsNum;i++){
		var j = i * distributeNum;
		var p = data.slice(j,(j + distributeNum) > dataNum ? dataNum : (j+distributeNum) );
		result.push(p);
	}

	return result;

};


var distributeSockets = function(sockets,calcId,job){

	console.log('socketsNum ' + sockets.length);

	var distributedSockets = [];

	_.each(sockets,function(socketData,index,sockets){
		// console.log('Step in distributeSockets : sockets'
		// 			+ JSON.stringify({
		// 				id : socketData.id,
		// 				calcId :socketData.calcId,
		// 				charge :socketData.charge
		// 			}));
		if(!isCalculating(socketData)){
			socketData.calcId = calcId;
			socketData.charge = job;
			distributedSockets.push(socketData);
		}
	});

	console.log('distributedNum ' + JSON.stringify(distributedSockets.length));


	if(distributeSockets.length === 0 || !job || !job.data){
		_.each(sockets,function(socketData){
			if(socketData.id === socketData.calcId){
				socketData.calcId = 0;
			}
		});
		return;
	}

	var distributedData = calcDistributedData(distributedSockets.length,job.data);

	console.log('distributedData ' + JSON.stringify(distributedData));

	_.each(distributedSockets,function(socketData,index,sockets){
		socketData.charge.data = distributedData[index];

		console.log('data ' + JSON.stringify(socketData.charge.data));
		console.log('id ' + socketData.calcId + ' : emit id' + socketData.id);

		console.log('charge ' + JSON.stringify(socketData.charge,function(key, val){
			return typeof val == 'function' ? val.toString().replace(/\s/g,' ') : val;
		}));

		socketData.socket.emit('charge',socketData.charge,function(data){

			if(isExistSocket(calcId)){

				socketData.calcId = 0;

				if(isFinishedCalc(calcId)){

					console.log('data' + JSON.stringify(data));
					
					socketData.socket.emit('finish',data);
					
					_.each(sockets,function(socketData,index,sockets){
						if(socketData.id === socketData.calcId){
							socketData.calcId = 0;
						}
					});
				}else if(isMissedCalc(calcId)){

					socketData.socket.emit('continue',data);

					_.each(missCalculations,function(missCalc,index,missCalculations){
						if(calcId === missCalc.calcId){
							distributeSockets(sockets,calcId,missCalculations.splice(index,1).job);
						}
					});
				}else{
					socketData.socket.emit('continue',data);
					
					_.each(sockets,function(socketData,index,sockets){
						distributeSockets(sockets,calcId,job);
					});
					
				}
			}else{
				socketData.charge = {};
				socketData.calcId = 0;
			}

		});
	});



};

var onConnection = function(socket){

	var id = new Number(generateID());
	
	socket.set('id',id,function(){
		
		var socketData = {

			id:id,
		
			calcId:0,
			
			job:{},

			charge:{},
			
			socket:socket

		};

		sockets.push(socketData);


	});

	
	socket.on('start',function(job){
		
		socket.get('id',function(err,id){

			_.each(sockets,function(value,index,list){

				console.log('socketData.id ' + value.id );
				console.log('id ' + id );
				console.log('job ' + JSON.stringify(job));
				console.log('calcId ' + value.calcId);

				console.log('job ' + JSON.stringify(job,function(key, val){
					return typeof val == 'function' ? val.toString().replace(/\s/g,' ') : val;
				}));

				if(value.id === id){
					if(isCalculating(value)){
					}else{
						value.job = job;
						value.calcId = id;

						console.log('id ' + id + ' : start.');
						console.log('job ' + job);
						console.log('calcId ' + value.calcId);

						debugger;

						distributeSockets(sockets,id,job);
					}
				}
			});

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
							_.each(missCalculations,function(missCalc,index,missCalculations){									if(socketData.calcId === missCalc.calcId){
									missCalculations.splice(index,1);
								}
							});
						}
					}else if(isCalculating(socketData)){

						if(!isMissedCalc(socketData.calcId)){
							missCalculations.push({
								calcId:socketData.calcId,
								job:socketData.charge
							});
						}else{
							_.each(missCalculations,function(missCalc,index,missCalculations){
								if(socketData.calcId === missCalc.calcId){

									if(missCalc.job.data && socketData.charge){
										missCalc.job.data.concat(socketData.charge.data);
									}
								}
							});
						}
					}
				}

				console.log('id ' + socketData.id + ' : calcId ' + socketData.calcId);
			});

			console.log('missCalculations ' + missCalculations);

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
