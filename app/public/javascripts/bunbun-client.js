
(function(){

	var socket;

	var job = {};

	var result = [];

	var mLog ;

	var makeJob;

	var calcCharge;

	var workerNum = 8;

	var calcDistributedData;

	var workerPath = '/javascripts/bunbun-worker.js';

	var startTime;

	var endTime;

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

		makeJob = function(jobString){
			// var evalJob = eval('(' + jobString + ')');

			var evalJob = JSON.parse(jobString,function(k,v){
				return v.toString().indexOf('function') === 0 ? eval('('+ v +')') :v;
			});
			evalJob.data =evalJob.data();

			return evalJob;
		};

		calcDistributedData = function(socketsNum,data){
			var dataNum = data.length;

			var distributeNum = Math.ceil(dataNum/socketsNum);

			var result = [];
	
			for(var i=0;i<distributeNum;i++){
				var j = i * cnt;
				var p = data.job.data.slice(j,j + cnt);
				result.push(p);
			}

			return result;

		};


		calcCharge = function(charge,fn,context){
			
			var workers = [];
			var doneWorkerNum = 0;
			var newData = [];

			if(Worker){
				var distributedData = calcDistributedData(workerNum,charge.data);

				for(var i=0;i<workerNum;i++){
					charge.data = distributedData[i];

					workers.push(new Worker(workerPath));
					workers[i].postMessage({
						charge:charge
					});

					workers[i].onmessage = function(event){
						newData.concat(event.data);

						doneWorkerNum++;

						if(doneWorkerNum === workerNum){

							charge.data = bbb.combiner(newData,charge.combiner);

							fn.apply(context,charge);

							$('#start,#test').removeAttr('disabled');
							$('#state').text('ready');

						}
					};

				}
			}else{
				newData = bbb.makeDoMapCombineAction(charge.mapper,charge.combiner)(charge.data);
				charge.data = newData;
				fn.apply(context,charge);
				
				$('#start,#test').removeAttr('disabled');
				$('#state').text('ready');

			}

		};

		socket = io.connect('/bunbun',{
			'reconnect' : true,
			'reconnection delay' : 50,
			'max reconnection attempts' : Infinity
		});

		socket.on('charge',function(charge,fn){

			$('#state').text('charge');
			$('#start,#test').attr({disabled:'disabled'});
			
			charge.data = calcCharge(charge,fn,this);
		});


		$('#start').click(function(){

			startTime = new Date();

			$('#state').text('calculating');
			
			job = makeJob($('#job').val());

			socket.emit('start',job);
		});

		$('#test').click(function(){
			$('#state').text('test');

			startTime = new Date();

			job = makeJob($('#job').val());
			$('#result').append('</br>resultSelecter : ' + bbb.makeTestAction(job.mapper
												 ,job.combiner
												 ,job.partitioner
												 ,job.reducer
												 ,mLog
												 ,job.selecter)(job.data));

			endTime = new Date();

			$('#result').append('</br>time : ' + (endTime.getTime()-startTime.getTime()));

		});

		socket.on('continue',function(data){
			result.concat(data);
		});

		socket.on('finish',function(data){

			result.concat(data);

			$('#result').append('</br>resultSelecter : ' + bbb.makeDoPartitionReduceAction(job.partitioner
															  ,job.reducer
															  ,job.selecter)(result));
			$('#state').text('ready');

			endTime = new Date();

			$('#result').append('</br>time : ' + (endTime.getTime()-startTime.getTime()));


		});



	});

})();













