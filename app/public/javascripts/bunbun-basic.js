var bbb = {};

(function(){

	function isArray(ar){
		return Object.prototype.toString.call(ar) === '[object Array]';
	}
	
	function each(ar,iterator,context){
		if(!(isArray(ar)) || (typeof iterator !== 'function')){
			throw new TypeError("Each needs array and function as arguments.");
		}

		for(var i=0 ; i<ar.length ; i++){
			if(context){
				iterator.call(context,ar[i],i,ar);
			}else{
				iterator(ar[i],i,ar);
			}
		}
	}

	function mapper(ar,iterator,context){
		
		var result = void 0;
		var results = [];

		each(ar,function(value, index, list){
			
			if(context){
				result = iterator.call(context,value,index.list);
			}else{
				result = iterator(value,index,list);
			}
			if(!result){
				throw new Error("Map don't return anything.");
			}

			results.push(result);

		});

		return results;
			
	}

	function reducer(ar,iterator,memo,context){

		if(!memo && (memo !== 0)) throw new Error("Reducer needs memo(an initial value).");

		each(ar,function(value,index,list){
			if(context){
				memo = iterator.call(context,memo,value,index,list);
			}else{
				memo = iterator(memo,value,index,list);
			}
			if(!memo && (memo !== 0)) throw new Error("Reducer do not return anything.");
		});

		return memo;
	}

	function combiner(ar,iterator,memo,context){
		reducer(ar,iterator,memo,context);
	}

	function partitioner(ar,compareFunction){
		if(!(isArray(ar)) || (typeof compareFunction !== 'function')){
			throw new TypeError("Partitioner needs array and function as arguments.");
		}

		ar.sort(compareFunction);

	}
	
	bbb.isArray = isArray;
	bbb.each = each;
	bbb.mapper = mapper;
	bbb.reducer = reducer;
	bbb.combiner = combiner;
	bbb.partitioner = partitioner;

})();
