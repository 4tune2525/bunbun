
onmessage = function(event){

	
	var each = function(ar,iterator){
		if(ar == null) return ar;

		for(var i=0 ; i<ar.length ; i++){
			iterator(ar[i],i,ar);
		}

		return ar;
	};

	var mapper = function(ar,iterator){
		var results = [];

		if(ar == null || typeof iterator !== 'function') return results;

		each(ar,function(value,index,list){
			results[results.length] = (iterator(value,index,list));
		});
		return results;
	};

	var makeTask = function(taskString){
		var evalTask = JSON.parse(taskString.replace(/\s/g,' '),function(k,v){
				return v.toString().indexOf('function') === 0 ? eval('('+ v +')') :v;
			});

			// console.log('evalTask ' + JSON.stringify(evalTask,function(key, val){
			// 	return typeof val == 'function' ? val.toString().replace(/\s/g,' ') : val;
			// }));

			return evalTask;

	};

	var task = makeTask(event.data.taskString);

	console.log(task.mapper);
	console.log(JSON.stringify(event.data.data));

	var data = mapper(event.data.data,task.mapper);

	console.log(JSON.stringify(data));

	postMessage({data:data});
};
