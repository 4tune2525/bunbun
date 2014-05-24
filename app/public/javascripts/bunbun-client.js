

(function(){

	var socket;

	var job = {};

	var result = [];

	var mLog ;

	var makeData;

	var makeTask;

	var calcCharge;

	var workerNum = 8;

	var calcDistributedData;

	var workerPath = '/javascripts/bunbun-worker.js';

	var startTime;

	var endTime;

	var charge;

	$(function(){

		mLog = function(title){
			return function(state){
				if(_.exists(title)){
					$('#result').append('</br>'+title + " : " + JSON.stringify(state));
				}else{
					$('#result').append(JSON.stringify(state));
				}

				return {answer:undefined, state:state};
			};
		};

		makeData = function(taskString){
			// var evalTask = eval('(' + taskString + ')');

			
			return makeTask(taskString).dataBuilder();

			//console.log('evalTask ' + JSON.stringify(evalTask));
			// console.log('evalTask ' + JSON.stringify(evalTask,function(key, val){
			// 	return typeof val == 'function' ? val.toString().replace(/\s/g,' ') : val;
			// }));
			
		};


		makeTask = function(taskString){
			var evalTask = JSON.parse(taskString.replace(/\s/g,' '),function(k,v){
				return v.toString().indexOf('function') === 0 ? eval('('+ v +')') :v;
			});

			console.log('evalTask ' + JSON.stringify(evalTask,function(key, val){
				return typeof val == 'function' ? val.toString().replace(/\s/g,' ') : val;
			}));

			return evalTask;

		};

		calcDistributedData = function(socketsNum,data){
			var dataNum = data.length;

			if(dataNum < socketsNum) workerNum = socketsNum = dataNum;

			var distributeNum = Math.ceil(dataNum/socketsNum);

			var result = [];
	
			for(var i=0;i<socketsNum;i++){
				var j = i * distributeNum;
				var p = data.slice(j,(j + distributeNum) > dataNum ? dataNum : (j+distributeNum) );
				result.push(p);
			}

			return result;

		};


		calcCharge = function(charge){
			
			var workers = [];
			var doneWorkerNum = 0;
			var newData = [];

			if(Worker){

				console.log('charge ' + JSON.stringify(charge));

				var distributedData = calcDistributedData(workerNum,charge.data);

				for(var i=0;i<workerNum;i++){
					charge.data = distributedData[i];

					workers.push(new Worker(workerPath));

					console.log('charge ' + charge ? JSON.stringify(charge) : charge);

					workers[i].onmessage = function(event){

						console.log(JSON.stringify(event.data));

						newData = newData.concat(event.data.data);

						console.log('newData ' + JSON.stringify(newData));

						doneWorkerNum++;

						if(doneWorkerNum === workerNum){

							charge.data = bbb.combiner(newData,makeTask(charge.taskString).combiner);

							console.log(JSON.stringify(charge.data));


							$('#start,#test').removeAttr('disabled');
							$('#state').text('ready');

						}
					};


					workers[i].postMessage({
						taskString:charge.taskString,
						data:charge.data
					});

					
				}
			}else{
				charge.task = makeTask(charge.taskString);

				newData = bbb.makeDoMapCombineAction(charge.task.mapper,charge.task.combiner)(charge.data);
				charge.data = newData;

				console.log(newData);
				
				$('#start,#test').removeAttr('disabled');
				$('#state').text('ready');

			}

		};

		socket = io.connect('/bunbun',{
			'reconnect' : true,
			'reconnection delay' : 50,
			'max reconnection attempts' : Infinity
		});

		socket.on('charge',function(receivedCharge,fn){

			charge = receivedCharge;

			$('#state').text('charge');
			$('#start,#test').attr({disabled:'disabled'});
			
			calcCharge(charge);

			console.log(JSON.stringify(charge));

			fn(JSON.stringify(charge));
		});


		$('#start').click(function(){

			result = [];

			startTime = new Date();

			$('#state').text('calculating');
		
			job.taskString = $('#task').val();
	
			job.data = makeData(job.taskString);

			socket.emit('start',job);
		});

		$('#test').click(function(){
			$('#state').text('test');

			startTime = new Date();

			job.taskString = $('#job').val();
			
			job.data = makeData(job.taskString);

			job.task = makeTask(job.taskString);

			$('#result').append('</br>resultSelecter : ' + bbb.makeTestAction(job.task.mapper
												 ,job.task.combiner
												 ,job.task.partitioner
												 ,job.task.reducer
												 ,mLog
												 ,job.task.selecter)(job.data));

			endTime = new Date();

			$('#result').append('</br>time : ' + (endTime.getTime()-startTime.getTime()));

		});

		socket.on('continue',function(data){
			result.concat(data);
		});

		socket.on('finish',function(data){

			result.concat(data);

			$('#result').append('</br>resultSelecter : ' + bbb.makeDoPartitionReduceAction(job.task.partitioner
															  ,job.task.reducer
															  ,job.task.selecter)(result));
			$('#state').text('ready');

			endTime = new Date();

			$('#result').append('</br>time : ' + (endTime.getTime()-startTime.getTime()));


		});



	});

})();













