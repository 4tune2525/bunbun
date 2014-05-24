

var bbb = {};

(function(_){

	bbb.isArray = function(ar){

		if(_.isArray){
			return _.isArray(ar);
		}
		return Object.prototype.toString.call(ar) === '[object Array]';
	};
	
	bbb.each = function(ar,iterator,context){

		if(_.each){
			return _.each(ar,iterator,context);
		}
		
		if(!(bbb.isArray(ar)) || (typeof iterator !== 'function')){
			return ar;
			//throw new TypeError("Each needs array and function as arguments.");
		}

		for(var i=0 ; i<ar.length ; i++){
			if(context){
				iterator.call(context,ar[i],i,ar);
			}else{
				iterator(ar[i],i,ar);
			}
		}

		return ar;
	};

	bbb.mapper = function(ar,iterator,context){
		
		if(_.map){
			return _.map(ar,iterator,context);
		}
		
		var result = void 0;
		var results = [];

		bbb.each(ar,function(value, index, list){
			
			if(context){
				result = iterator.call(context,value,index.list);
			}else{
				result = iterator(value,index,list);
			}
			// if(!result){
			// 	throw new Error("Map don't return anything.");
			// }

			results.push(result);

		});

		return results;
		
	};

	bbb.reducer = function(ar,iterator,memo,context){

		if(_.reduce){
			if(arguments.length <= 2 || (!memo && !context)){
				return _.reduce(ar,iterator);
			}else{
				return _.reduce(ar,iterator,memo,context);
			}
		}

		// if(!memo && (memo !== 0)) throw new Error("Reducer needs memo(an initial value).");

		bbb.each(ar,function(value,index,list){
			if(context){
				memo = iterator.call(context,memo,value,index,list);
			}else{
				memo = iterator(memo,value,index,list);
			}
			// if(!memo && (memo !== 0)) throw new Error("Reducer do not return anything.");
		});

		return memo;
	};

	bbb.combiner = function(ar,iterator,memo,context){
		return bbb.reducer(ar,iterator,memo,context);
	};

	bbb.partitioner = function(ar,compareFunction){
		if(!(bbb.isArray(ar)) || (typeof compareFunction !== 'function')){
			// throw new TypeError("Partitioner needs array and function as arguments.");
		}else{
			ar.sort(compareFunction);
		}

		return ar;
	};

	bbb.actions = function(acts,done){
		return function(seed){
			var init = {values:[],state:seed};

			var intermediate = _.reduce(acts,function(stateObj,action){
				var result = action(stateObj.state);
				var values = _.cat(stateObj.values,[result.answer]);
				return {values:values,state:result.state};
			},init);

			var keep = _.filter(intermediate.values,_.exists);

			return done(keep,intermediate.state);
		};
	};


	bbb.lift = function(answerFun,stateFun){
		return function(){
			var args = _.toArray(arguments);

			return function(state){
				var ans = answerFun.apply(null,_.cons(state,args));
				var s = stateFun ? stateFun(state) : ans;

				return {answer:ans, state:s};
			};
		};
	};

	bbb.mMapper = bbb.lift(bbb.mapper);
	
	bbb.mReducer = bbb.lift(bbb.reducer);

	bbb.mCombiner = bbb.lift(bbb.combiner);

	bbb.mPartitioner = bbb.lift(bbb.partitioner);

	bbb.makeTestAction = function(mapper,combiner,partitioner,reducer,mOut,returnFun,option){
		if(option){
			return bbb.actions([mOut("data")
							,bbb.mMapper(mapper,option.mapperContext),mOut("resultMapper")
							,bbb.mCombiner(combiner,option.combinerMemo,option.combinerContext),mOut("resultCombiner")
							,bbb.mPartitioner(partitioner),mOut("resultPartitioner")
							,bbb.mReducer(reducer,option.reducerMemo,option.reducerContext),mOut("resultReducer")]
					,returnFun);
		}else{
			return bbb.actions([mOut("data")
							,bbb.mMapper(mapper),mOut("resultMapper")
							,bbb.mCombiner(combiner),mOut("resultCombiner")
							,bbb.mPartitioner(partitioner),mOut("resultPartitioner")
							,bbb.mReducer(reducer),mOut("resultReducer")]
					,returnFun);
		}
	};

	bbb.makeDoMapCombineAction = function(mapper,combiner,option){
		if(option){
			return bbb.actions([bbb.mMapper(mapper,option.mapperContext)
							,bbb.mCombiner(combiner,option.combinerMemo,option.combinerContext)]
						   ,function(notUsed,state){return state;});
		}else{
			return bbb.actions([bbb.mMapper(mapper),bbb.mCombiner(combiner)]
						   ,function(notUsed,state){return state;});
		}
	};
	
	bbb.makeDoPartitionReduceAction = function(partitioner,reducer,returnFun,option){
		if(option){
			return bbb.actions([bbb.mPartitioner(partitioner),bbb.mReducer(reducer,option.reducerMemo,option.reducerContext)],returnFun);
		}else{
			return bbb.actions([bbb.mPartitioner(partitioner),bbb.mReducer(reducer)],returnFun);
		}
	};
	
})(_);
